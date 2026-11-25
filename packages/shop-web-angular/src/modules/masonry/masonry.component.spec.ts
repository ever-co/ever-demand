import { ElementRef } from '@angular/core';
import { MasonryComponent } from './masonry.component';

/** A brick of a fixed size: jsdom has no layout engine, so the sizes are stubbed. */
function brick(height: number, width = 350): HTMLElement {
	const element = document.createElement('div');
	Object.defineProperty(element, 'offsetWidth', { value: width });
	Object.defineProperty(element, 'offsetHeight', { value: height });
	return element;
}

function masonry(containerWidth: number, options = {}) {
	const parent = document.createElement('div');
	const host = document.createElement('masonry');
	parent.appendChild(host);
	Object.defineProperty(parent, 'clientWidth', { value: containerWidth });
	Object.defineProperty(host, 'clientWidth', { value: containerWidth });

	const component = new MasonryComponent(new ElementRef(host));
	component.options = options;
	component.ngOnInit();
	return { component, host };
}

describe('MasonryComponent', () => {
	it('puts every brick into the shortest column, left to right', () => {
		const { component, host } = masonry(1100);
		const bricks = [brick(100), brick(300), brick(200), brick(50), brick(80)];
		bricks.forEach((b) => component.add(b));

		component.layoutNow();

		// 3 columns of 350px: 100 | 300 | 200, then the 4th brick under the
		// first column (100), the 5th under the first again (150 < 200).
		const position = (b: HTMLElement) => [b.style.left, b.style.top];
		expect(bricks.map(position)).toEqual([
			['0px', '0px'],
			['350px', '0px'],
			['700px', '0px'],
			['0px', '100px'],
			['0px', '150px'],
		]);
		expect(host.style.height).toBe('300px');
		expect(bricks.every((b) => b.style.position === 'absolute')).toBe(true);
	});

	it('fits its width to the columns with fitWidth', () => {
		const { component, host } = masonry(1100, { fitWidth: true });
		[brick(10), brick(10), brick(10), brick(10)].forEach((b) =>
			component.add(b)
		);

		component.layoutNow();

		expect(host.style.width).toBe('1050px');
	});

	it('uses a single column when the container is narrow', () => {
		const { component, host } = masonry(200);
		const bricks = [brick(100), brick(100)];
		bricks.forEach((b) => component.add(b));

		component.layoutNow();

		expect(bricks[1].style.top).toBe('100px');
		expect(host.style.height).toBe('200px');
	});

	it('reports every layout and removal', () => {
		const { component } = masonry(1100);
		const layoutComplete = vi.fn();
		const removeComplete = vi.fn();
		component.layoutComplete.subscribe(layoutComplete);
		component.removeComplete.subscribe(removeComplete);
		const first = brick(10);
		component.add(first);
		component.add(brick(20));

		component.layoutNow();
		expect(layoutComplete).toHaveBeenLastCalledWith(component.items);

		component.remove(first);
		expect(removeComplete).toHaveBeenCalledWith([first]);
		expect(component.items.length).toBe(1);
	});

	it('lays out once for several layout requests in a row', () => {
		vi.useFakeTimers();
		const { component } = masonry(1100);
		const layoutComplete = vi.fn();
		component.layoutComplete.subscribe(layoutComplete);

		component.add(brick(10));
		component.add(brick(10));
		component.layout();
		vi.runAllTimers();

		expect(layoutComplete).toHaveBeenCalledTimes(1);

		component.ngOnDestroy();
		component.layout();
		vi.runAllTimers();
		expect(layoutComplete).toHaveBeenCalledTimes(1);
		vi.useRealTimers();
	});
});
