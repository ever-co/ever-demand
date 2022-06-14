import 'package:flutter/material.dart';
import 'package:graphql_flutter/graphql_flutter.dart';

String get host {
  return '127.0.0.1';
}

final graphqlEndpoint = 'http://$host:3000/graphql';
final subscriptionEndpoint = 'ws://$host:3000/subscriptions';

String? uuidFromObject(Object? object) {
  if (object is Map<String, Object>) {
    late String? typeName = object['__typename'] as dynamic;
    late String? id = object['id']?.toString() as dynamic;
    if (typeName != null && id != null) {
      return <String>[typeName, id].join('/');
    }
  }
  return null;
}

ValueNotifier<GraphQLClient> clientFor({
  required String uri,
  String? subscriptionUri,
}) {
  Link httpLink = HttpLink(uri);

  final authLink = AuthLink(
    getToken: () async => 'Bearer ',
  );

  var link = authLink.concat(httpLink);

  if (subscriptionUri != null) {
    final WebSocketLink websocketLink = WebSocketLink(subscriptionUri);

    link = Link.split(
      (request) => request.isSubscription,
      websocketLink,
      link,
    );
  }

  return ValueNotifier<GraphQLClient>(
    GraphQLClient(
      cache: GraphQLCache(store: HiveStore()),
      link: link,
    ),
  );
}

/// Wraps the root application with the `graphql_flutter` client.
/// We use the cache for all state management.
class ClientProvider extends StatelessWidget {
  ClientProvider({
    Key? key,
    required this.child,
    required String uri,
    String? subscriptionUri,
  })  : client = clientFor(
          uri: uri,
          subscriptionUri: subscriptionUri,
        ),
        super(key: key);

  final Widget child;
  final ValueNotifier<GraphQLClient> client;

  @override
  Widget build(BuildContext context) {
    return GraphQLProvider(
      client: client,
      child: child,
    );
  }
}
