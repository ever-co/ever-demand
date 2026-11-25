import { Router } from '@angular/router';
import { ViewTypeComponent } from './view-type.component';

describe('ViewTypeComponent', () => {
	function create(stored: Record<string, string> = {}) {
		const store: Record<string, string> = {
			productListViewSpace: stored.productListViewSpace,
			productListViewType: stored.productListViewType,
			productViewType: stored.productViewType,
		};
		const router = { navigateByUrl: vi.fn().mockResolvedValue(true) };
		const component = new ViewTypeComponent(
			store as any,
			router as unknown as Router
		);
		return { component, store, router };
	}

	it('starts with the normal masonry list', () => {
		const { component } = create();

		expect(component.listViewSpace).toBe('normal');
		expect(component.listViewType).toBe('masonry');
		expect(component.viewType).toBe('list');
		expect(component.isListView).toBe(true);
	});

	it('restores the stored choices', () => {
		const { component } = create({
			productListViewSpace: 'wide',
			productListViewType: 'grid',
			productViewType: 'carousel',
		});

		expect(component.listViewSpace).toBe('wide');
		expect(component.listViewType).toBe('grid');
		expect(component.isListView).toBe(false);
	});

	it('switching to the carousel also stores a wide grid and reloads the products', async () => {
		const { component, store, router } = create();
		component.viewType = 'carousel';

		await component.viewTypeChange();

		expect(store.productViewType).toBe('carousel');
		expect(store.productListViewType).toBe('grid');
		expect(store.productListViewSpace).toBe('wide');
		expect(router.navigateByUrl).toHaveBeenLastCalledWith('/products');
		expect(component.showTuneButton).toBe(true);
	});

	it('stores the list type and the space', async () => {
		const { component, store } = create();
		component.listViewType = 'grid';
		component.listViewSpace = 'wide';

		await component.listViewTypeChange();
		await component.listViewSpaceChange();

		expect(store.productListViewType).toBe('grid');
		expect(store.productListViewSpace).toBe('wide');
	});
});
