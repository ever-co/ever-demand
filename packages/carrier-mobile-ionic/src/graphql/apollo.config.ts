import { NgModule } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import { Apollo } from 'apollo-angular';
import { HttpLink, HttpLinkHandler } from 'apollo-angular/http';
import { ApolloLink, InMemoryCache } from '@apollo/client/core';
import { setContext } from '@apollo/client/link/context';
import { environment } from '../environments/environment';

@NgModule({
	exports: [
		HttpClientModule
	],
})
export class GraphQLModule {
	constructor(
		private readonly apollo: Apollo,
		private readonly httpLink: HttpLink
	) {
		const uri = environment.GQL_ENDPOINT;
		const http: HttpLinkHandler = httpLink.create({ uri });

		const authLink: ApolloLink = setContext((_, { headers }) => {
			// get the authentication token from local storage if it exists
			const token = localStorage.getItem('token');
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
			cache: new InMemoryCache(),
			defaultOptions: {
				watchQuery: {
					fetchPolicy: 'network-only',
					errorPolicy: 'ignore',
				},
				query: {
					fetchPolicy: 'network-only',
					errorPolicy: 'all',
				},
			},
		});
	}
}
