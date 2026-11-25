import 'package:graphql/client.dart';

/// A GraphQL error result (network or server errors).
class GraphQLRequestError implements Exception {
  const GraphQLRequestError(this.message, {this.exception});

  final String message;
  final OperationException? exception;

  @override
  String toString() => 'GraphQLRequestError: $message';
}

/// What the repositories need from GraphQL; an interface so tests can fake it.
abstract interface class GraphQLService {
  /// Runs a query (`fetchPolicy: network-only`, as the Ionic client does) and
  /// returns its `data`. Throws [GraphQLRequestError] on errors without data.
  Future<Map<String, dynamic>> query(
    String document, {
    Map<String, dynamic> variables = const <String, dynamic>{},
  });
}

/// [GraphQLService] on `package:graphql`: HTTP for queries and mutations,
/// graphql-ws (`graphql-transport-ws` protocol) for subscriptions, and the
/// `authorization` header from [token] (empty string without a token).
class GraphQLClientService implements GraphQLService {
  GraphQLClientService({
    required String httpEndpoint,
    required String subscriptionsEndpoint,
    required String? Function() token,
    GraphQLClient? client,
  }) : client = client ??
            createClient(
              httpEndpoint: httpEndpoint,
              subscriptionsEndpoint: subscriptionsEndpoint,
              token: token,
            );

  final GraphQLClient client;

  static GraphQLClient createClient({
    required String httpEndpoint,
    required String subscriptionsEndpoint,
    required String? Function() token,
  }) {
    final HttpLink http = HttpLink(
      httpEndpoint,
      defaultHeaders: const <String, String>{},
    );
    final AuthLink auth = AuthLink(
      getToken: () {
        final String? t = token();
        return t == null || t.isEmpty ? '' : 'Bearer $t';
      },
      headerKey: 'authorization',
    );
    final WebSocketLink ws = WebSocketLink(
      subscriptionsEndpoint,
      subProtocol: GraphQLProtocol.graphqlTransportWs,
      config: const SocketClientConfig(
        autoReconnect: true,
        inactivityTimeout: Duration(seconds: 30),
      ),
    );
    final Link link = Link.split(
      (Request request) =>
          request.operation.getOperationType()?.name == 'subscription',
      ws,
      auth.concat(http),
    );
    return GraphQLClient(
      link: link,
      cache: GraphQLCache(),
      defaultPolicies: DefaultPolicies(
        query: Policies(
          fetch: FetchPolicy.networkOnly,
          error: ErrorPolicy.all,
        ),
        watchQuery: Policies(
          fetch: FetchPolicy.networkOnly,
          error: ErrorPolicy.ignore,
        ),
      ),
    );
  }

  @override
  Future<Map<String, dynamic>> query(
    String document, {
    Map<String, dynamic> variables = const <String, dynamic>{},
  }) async {
    final QueryResult<Object?> result = await client.query(
      QueryOptions<Object?>(
        document: gql(document),
        variables: variables,
        fetchPolicy: FetchPolicy.networkOnly,
        errorPolicy: ErrorPolicy.all,
      ),
    );
    final Map<String, dynamic>? data = result.data;
    if (data == null) {
      final OperationException? e = result.exception;
      final List<GraphQLError> errors = e?.graphqlErrors ?? <GraphQLError>[];
      throw GraphQLRequestError(
        errors.isNotEmpty
            ? errors.map((GraphQLError g) => g.message).join('; ')
            : (e?.linkException?.toString() ?? 'No data'),
        exception: e,
      );
    }
    return data;
  }
}
