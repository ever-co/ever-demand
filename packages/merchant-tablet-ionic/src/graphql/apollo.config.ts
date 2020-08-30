import { NgModule } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import { Apollo, ApolloModule } from 'apollo-angular';
import { HttpLink, HttpLinkModule } from 'apollo-angular-link-http';
import { InMemoryCache } from 'apollo-cache-inmemory';
import { setContext } from 'apollo-link-context';
import { Store } from '../services/store.service';
import { environment } from '../environments/environment';

@NgModule({
	exports: [HttpClientModule, ApolloModule, HttpLinkModule],
})
export class GraphQLModule {
	constructor(
		private readonly apollo: Apollo,
		private readonly httpLink: HttpLink,
		private readonly store: Store
	) {
		const uri = environment.GQL_ENDPOINT;
		const http = httpLink.create({ uri });

		const authLink = setContext((_, { headers }) => {
			// get the authentication token from local storage if it exists
			const token = store.token;
			// return the headers to the context so httpLink can read them
			return {
				headers: {
					...headers,
					authorization: token ? `Bearer ${token}` : '',
				},
			};
		});

		apollo.create({
			link: authLink.concat(http),
			defaultOptions: {
				watchQuery: {
					fetchPolicy: 'network-only',
					errorPolicy: 'ignore',
				},
				query: {
					fetchPolicy: 'network-only',
					errorPolicy: 'all',
				},
				mutate: {
					errorPolicy: 'all',
				},
			},
			cache: new InMemoryCache(),
		});
	}
}
