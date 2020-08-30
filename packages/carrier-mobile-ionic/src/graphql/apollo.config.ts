import { NgModule } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import { Apollo, ApolloModule } from 'apollo-angular';
import { HttpLink, HttpLinkModule } from 'apollo-angular-link-http';
import { InMemoryCache } from 'apollo-cache-inmemory';
import { setContext } from 'apollo-link-context';
import { environment } from '../environments/environment';

@NgModule({
	exports: [HttpClientModule, ApolloModule, HttpLinkModule],
})
export class GraphQLModule {
	constructor(apollo: Apollo, httpLink: HttpLink) {
		const uri = environment.GQL_ENDPOINT;
		const http = httpLink.create({ uri });

		const authLink = setContext((_, { headers }) => {
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
