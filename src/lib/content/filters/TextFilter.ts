import Request, { IType } from "~lib/Request";
import type Response from "~lib/Response";

import Filter from "./Filter";

const PROCESSED_FLAG = Symbol("processed");

interface ProcessedNode extends Node {
	[PROCESSED_FLAG]?: boolean;
}

export default class TextFilter extends Filter {
	private t0: number;
	private sensitiveWords: Set<string>;
	private isProcessing: boolean;
	private loadedWords = false;

	constructor() {
		super();
		this.t0 = performance.now();
		this.sensitiveWords = new Set();
		this.isProcessing = false;
		// this.loadSensitiveWords();
	}

	private async loadSensitiveWords() {
		try {
			const badWordsUrl = chrome.runtime.getURL("assets/bad_words.json");
			const response = await fetch(badWordsUrl);
			if (!response.ok) {
				throw new Error("Failed to load bad words");
			}
			const badWords = await response.json();
			Object.keys(badWords).forEach((word) =>
				this.sensitiveWords.add(word)
			);
			console.log(
				"[TextFilter] Sensitive words loaded:",
				this.sensitiveWords
			);
		} catch (error) {
			console.error(
				"[TextFilter] Failed to load sensitive words:",
				error
			);
		}
	}

	public async analyze(target: Node) {
		if (this.isProcessing) {
			return; // Prevent recursive processing
		}
		if (!this.loadedWords) {
			await this.loadSensitiveWords();
			this.loadedWords = true;
		}

		const node = target as ProcessedNode;
		if (node[PROCESSED_FLAG]) {
			return; // Skip if already processed
		}

		try {
			this.isProcessing = true;

			if (node.nodeType === Node.TEXT_NODE && node.nodeValue) {
				const originalText = node.nodeValue;
				const newText = this.processText(originalText);

				if (originalText !== newText) {
					// Preserve selection if it exists
					const selection = window.getSelection();
					let savedRange = null;
					if (selection && selection.rangeCount > 0) {
						savedRange = selection.getRangeAt(0).cloneRange();
					}

					// Update text without triggering mutation
					node.nodeValue = newText;
					node[PROCESSED_FLAG] = true;

					// Restore selection if it existed
					if (savedRange) {
						selection.removeAllRanges();
						selection.addRange(savedRange);
					}
				}
			} else if (node.nodeType === Node.ELEMENT_NODE) {
				// const element = node as Element;
				// if (
				// 	element.nodeName !== "SCRIPT" &&
				// 	element.nodeName !== "STYLE"
				// ) {
				// 	this.applyTextFilter(element);
				// }
			}
		} finally {
			this.isProcessing = false;
		}
	}

	private processText(text: string): string {
		if (!text.trim()) return text;

		let processedText = text;
		console.log("[TextFilter] Processing text:", processedText);
		this.sensitiveWords.forEach((word) => {
			// Escape special regex characters in the word
			const escapedWord = word.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

			// Updated regex pattern to match whole words with better boundary detection
			// This will match:
			// 1. At the start of the string or after a word boundary
			// 2. The exact word (case insensitive)
			// 3. At the end of the string or before a word boundary
			const regex = new RegExp(
				`(^|\\s|[^a-zA-Z0-9])${escapedWord}($|\\s|[^a-zA-Z0-9])`,
				"gi"
			);

			// Replace the word while preserving the boundaries
			processedText = processedText.replace(
				regex,
				(match, prefix, suffix) => {
					return prefix + "*".repeat(word.length) + suffix;
				}
			);
		});
		console.log("[TextFilter] Processed text:", processedText);

		return processedText;
	}

	private getTextContent(element: Element): string {
		// Get only direct text nodes
		let text = "";
		for (const node of element.childNodes) {
			if (node.nodeType === Node.TEXT_NODE) {
				text += node.textContent;
			}
		}
		return text;
	}

	private applyTextFilter(element: Element) {
		// Add a blur effect to the text
		if (element instanceof HTMLElement) {
			element.style.filter = "blur(4px)";
			// Add hover effect to reveal text
			element.style.transition = "filter 0.3s";
			element.addEventListener("mouseover", () => {
				element.style.filter = "none";
			});
			element.addEventListener("mouseout", () => {
				element.style.filter = "blur(4px)";
			});
		}
	}

	filter() {
		// This method can be implemented if we need specific filtering logic
		// that's different from the analyze method
	}
}
