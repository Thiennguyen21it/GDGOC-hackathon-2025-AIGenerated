// Highly sensitive code, make sure that you know what you're doing
// https://stackoverflow.com/a/39332340/10432429

import Request, { IType } from "~lib/Request";

import type IFilter from "./filters/Filter";

// @TODO Canvas and SVG
// @TODO Lazy loading for div.style.background-image?
// @TODO <div> and <a>
// @TODO video

export type IDOMWatcher = {
	watch: () => void;
};

export default class DOMWatcher implements IDOMWatcher {
	private readonly observer: MutationObserver;
	private readonly filter: IFilter;
	private readonly config: MutationObserverInit;

	constructor(filter: IFilter, config?: MutationObserverInit) {
		this.filter = filter;
		this.observer = new MutationObserver(this.callback.bind(this));
		this.config = config || {
			subtree: true,
			childList: true,
			attributes: true,
			characterData: true,
			attributeFilter: ["src"]
		};
	}

	public watch(): void {
		console.log("[DOMWatcher] watch", this.config);
		// Process existing content first
		this.processExistingContent(document.body);
		// Start observing future changes
		this.observer.observe(document, this.config);
	}

	private async callback(mutationsList: MutationRecord[]) {
		for (const mutation of mutationsList) {
			if (mutation.type === "characterData") {
				// Direct text content change
				await this.filter.analyze(mutation.target);
			} else if (mutation.type === "childList") {
				// Handle added nodes
				for (const node of mutation.addedNodes) {
					await this.processNode(node);
				}
			} else if (mutation.type === "attributes") {
				// Handle attribute changes that might affect content
				await this.filter.analyze(mutation.target);
			}
		}
	}

	private async processNode(node: Node): Promise<void> {
		if (node.nodeType === Node.TEXT_NODE) {
			await this.filter.analyze(node);
		} else if (node.nodeType === Node.ELEMENT_NODE) {
			// Process the element itself
			await this.filter.analyze(node);

			// Process all text nodes within this element
			const walker = document.createTreeWalker(
				node,
				NodeFilter.SHOW_TEXT,
				null
			);

			let textNode;
			while ((textNode = walker.nextNode())) {
				await this.filter.analyze(textNode);
			}
		}
	}

	private async processExistingContent(root: Node): Promise<void> {
		// Process all existing text nodes
		const walker = document.createTreeWalker(
			root,
			NodeFilter.SHOW_TEXT,
			null
		);

		let textNode;
		while ((textNode = walker.nextNode())) {
			await this.filter.analyze(textNode);
		}

		// Process all existing elements
		if (root instanceof Element) {
			const elements = root.querySelectorAll("*");
			for (const element of elements) {
				await this.filter.analyze(element);
			}
		}
	}
}
