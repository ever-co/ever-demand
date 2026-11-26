import 'dart:io';

import 'package:flutter_test/flutter_test.dart';
import 'package:gql/ast.dart';
import 'package:gql/language.dart';
import 'package:shop_flutter_mobile/data/network/graphql/documents.dart';

/// Checks every GraphQL document of the app against the API schema in
/// packages/core/src/graphql (fields, arguments, variable types, fragment
/// types), so the Flutter app needs no schema change.
void main() {
  final Directory schemaDir = Directory('../core/src/graphql');
  final bool hasSchema = schemaDir.existsSync();

  final Map<String, String> documents = <String, String>{
    'GeoLocationProductsByPaging': geoLocationProductsByPagingQuery,
    'GetCountOfGeoLocationProducts': getCountOfGeoLocationProductsQuery,
    'GetWarehouseProduct': getWarehouseProductQuery,
    'getCloseMerchants': getCloseMerchantsQuery,
    'GetMerchantsBuyName': getMerchantsBuyNameQuery,
    'GetOrder {status}': getOrderQuery('{status}'),
    'GetOrder {waitForCompletion}': getOrderQuery('{waitForCompletion}'),
    'GetOrder {totalPrice}': getOrderQuery('{totalPrice}'),
    'GenerateOrdersByCustomerId': generateOrdersByCustomerIdQuery,
    'GetUser': getUserQuery,
    'OrdersHistoryPageQuery': ordersHistoryQuery,
    'OrderDetailsPageQuery': orderDetailsQuery,
  };

  group('documents parse', () {
    for (final MapEntry<String, String> d in documents.entries) {
      test(d.key, () => expect(() => parseString(d.value), returnsNormally));
    }
  });

  group('documents match packages/core schema', () {
    late _Schema schema;

    setUpAll(() {
      if (hasSchema) schema = _Schema.load(schemaDir);
    });

    for (final MapEntry<String, String> d in documents.entries) {
      test(
        d.key,
        () => expect(schema.validate(parseString(d.value)), isEmpty),
        skip: hasSchema ? false : 'packages/core/src/graphql not found',
      );
    }
  });
}

class _Field {
  _Field(this.type, this.args);

  final String type;
  final Set<String> args;
}

class _Schema {
  final Map<String, Map<String, _Field>> types = <String, Map<String, _Field>>{};
  final Set<String> inputs = <String>{};
  final Set<String> scalars = <String>{'String', 'Int', 'Float', 'Boolean', 'ID'};

  static String _named(TypeNode t) => switch (t) {
        NamedTypeNode(:final NameNode name) => name.value,
        ListTypeNode(:final TypeNode type) => _named(type),
        _ => '',
      };

  static _Schema load(Directory dir) {
    final _Schema s = _Schema();
    for (final FileSystemEntity f in dir.listSync(recursive: true)) {
      if (f is! File || !f.path.endsWith('.graphql')) continue;
      final DocumentNode doc = parseString(f.readAsStringSync());
      for (final DefinitionNode def in doc.definitions) {
        switch (def) {
          case ObjectTypeDefinitionNode(:final NameNode name, :final List<FieldDefinitionNode> fields):
            s._addFields(name.value, fields);
          case ObjectTypeExtensionNode(:final NameNode name, :final List<FieldDefinitionNode> fields):
            s._addFields(name.value, fields);
          case InputObjectTypeDefinitionNode(:final NameNode name):
            s.inputs.add(name.value);
          case EnumTypeDefinitionNode(:final NameNode name):
            s.scalars.add(name.value);
          case ScalarTypeDefinitionNode(:final NameNode name):
            s.scalars.add(name.value);
          default:
            break;
        }
      }
    }
    return s;
  }

  void _addFields(String type, List<FieldDefinitionNode> fields) {
    final Map<String, _Field> map = types.putIfAbsent(type, () => <String, _Field>{});
    for (final FieldDefinitionNode f in fields) {
      map[f.name.value] = _Field(
        _named(f.type),
        f.args.map((InputValueDefinitionNode a) => a.name.value).toSet(),
      );
    }
  }

  List<String> validate(DocumentNode doc) {
    final List<String> errors = <String>[];
    final Map<String, FragmentDefinitionNode> fragments = <String, FragmentDefinitionNode>{
      for (final FragmentDefinitionNode f in doc.definitions.whereType<FragmentDefinitionNode>())
        f.name.value: f,
    };
    for (final OperationDefinitionNode op
        in doc.definitions.whereType<OperationDefinitionNode>()) {
      for (final VariableDefinitionNode v in op.variableDefinitions) {
        final String t = _named(v.type);
        if (!inputs.contains(t) && !scalars.contains(t)) {
          errors.add('unknown variable type $t');
        }
      }
      final String root = switch (op.type) {
        OperationType.query => 'Query',
        OperationType.mutation => 'Mutation',
        OperationType.subscription => 'Subscription',
      };
      _selections(root, op.selectionSet, fragments, errors, root);
    }
    for (final FragmentDefinitionNode f in fragments.values) {
      if (!types.containsKey(f.typeCondition.on.name.value)) {
        errors.add('fragment ${f.name.value} on unknown type');
      }
    }
    return errors;
  }

  void _selections(
    String type,
    SelectionSetNode? set,
    Map<String, FragmentDefinitionNode> fragments,
    List<String> errors,
    String path,
  ) {
    if (set == null) return;
    final Map<String, _Field>? fields = types[type];
    if (fields == null) {
      errors.add('$path: unknown type $type');
      return;
    }
    for (final SelectionNode s in set.selections) {
      switch (s) {
        case FieldNode(:final NameNode name, :final List<ArgumentNode> arguments, :final SelectionSetNode? selectionSet):
          if (name.value == '__typename') continue;
          final _Field? f = fields[name.value];
          if (f == null) {
            errors.add('$path.${name.value}: no such field on $type');
            continue;
          }
          for (final ArgumentNode a in arguments) {
            if (!f.args.contains(a.name.value)) {
              errors.add('$path.${name.value}(${a.name.value}): no such argument');
            }
          }
          _selections(f.type, selectionSet, fragments, errors, '$path.${name.value}');
        case FragmentSpreadNode(:final NameNode name):
          final FragmentDefinitionNode? frag = fragments[name.value];
          if (frag == null) {
            errors.add('$path: unknown fragment ${name.value}');
          } else {
            _selections(frag.typeCondition.on.name.value, frag.selectionSet, fragments, errors, path);
          }
        case InlineFragmentNode(:final SelectionSetNode selectionSet):
          _selections(type, selectionSet, fragments, errors, path);
      }
    }
  }
}
