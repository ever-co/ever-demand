import { Provider } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Apollo } from 'apollo-angular';
import {
	ApolloTestingController,
	ApolloTestingModule,
	TestOperation,
} from 'apollo-angular/testing';

/**
 * TestBed with apollo-angular's testing backend. Results are not cached (`no-cache`), so the
 * mocked results only need the fields a test cares about.
 */
export function setupApolloTesting(providers: Provider[] = []) {
	TestBed.configureTestingModule({
		imports: [ApolloTestingModule],
		providers,
	});
	const apollo = TestBed.inject(Apollo);
	apollo.client.defaultOptions = {
		watchQuery: {
			fetchPolicy: 'no-cache',
			notifyOnNetworkStatusChange: false,
		},
		query: { fetchPolicy: 'no-cache' },
		mutate: { fetchPolicy: 'no-cache' },
	} as any;
	const controller = TestBed.inject(ApolloTestingController);
	return { apollo, controller };
}

/** Waits until the operation has reached the testing backend, then returns it. */
export async function expectOperation(
	controller: ApolloTestingController,
	operationName: string,
): Promise<TestOperation> {
	let op: TestOperation | undefined;
	await vi.waitFor(() => {
		op = controller.expectOne(operationName);
	});
	return op!;
}
