import 'dart:async';

import 'package:shop_flutter_mobile/data/network/graphql/graphql_service.dart';

typedef GqlHandler = FutureOr<Map<String, dynamic>> Function(
  Map<String, dynamic> variables,
);

/// A recorded GraphQL request.
class GqlRequest {
  const GqlRequest(this.operation, this.document, this.variables);

  final String operation;
  final String document;
  final Map<String, dynamic> variables;
}

/// [GraphQLService] that answers by operation name (`query <Name>(`).
class FakeGraphQL implements GraphQLService {
  final Map<String, GqlHandler> handlers = <String, GqlHandler>{};
  final List<GqlRequest> log = <GqlRequest>[];

  void on(String operation, GqlHandler handler) => handlers[operation] = handler;

  List<GqlRequest> requests(String operation) =>
      log.where((GqlRequest r) => r.operation == operation).toList();

  static String operationName(String document) =>
      RegExp(r'(?:query|mutation|subscription)\s+(\w+)')
              .firstMatch(document)
              ?.group(1) ??
          '';

  @override
  Future<Map<String, dynamic>> query(
    String document, {
    Map<String, dynamic> variables = const <String, dynamic>{},
  }) async {
    final String op = operationName(document);
    log.add(GqlRequest(op, document, variables));
    final GqlHandler? h = handlers[op];
    if (h == null) throw GraphQLRequestError('No fake for $op');
    return h(variables);
  }
}
