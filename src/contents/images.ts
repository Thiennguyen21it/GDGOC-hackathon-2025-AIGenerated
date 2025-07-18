import type { PlasmoCSConfig } from "plasmo";

import { Storage } from "@plasmohq/storage";

import DOMWatcher from "~lib/content/DomWatcher";
import ImageFilter from "~lib/content/filters/ImageFilter";
import loadImage from "~lib/content/loadImage";
import { initTextPopup } from "~lib/content/text/textPopupHandle";
import type Request from "~lib/Request";
import { IType } from "~lib/Request";
import type { Settings } from "~lib/types";

export const config: PlasmoCSConfig = {
	// matches: ["https://www.google.com/*", "http://localhost:*/*"],
	matches: ["<all_urls>"],
	all_frames: true,
	run_at: "document_start"
};

chrome.runtime.onMessage.addListener(
	async (message: Request, sender, sendResponse) => {
		if (!message) return;

		switch (message.type) {
			case IType.IMG_DATA:
				console.log("image data", message.payload);
				const imageData = await loadImage(message.payload);
				if (!imageData) {
					return;
				}
				sendResponse(imageData);
				return true;
			default:
				break;
		}
	}
);

const init = async (): Promise<void> => {
	const storage = new Storage();
	const settings = await storage.get<Settings>(IType.SETTINGS);
	console.log("[ImageFilter] settings", settings);
	if (Object.values(settings.image).every((v) => !v)) {
		console.log("[ImageFilter] Not enabled");
		return;
	}

	console.log("[ImageFilter] init");

	const imageFilter = new ImageFilter();
	const domWatcher = new DOMWatcher(imageFilter);

	domWatcher.watch();
};

if (window.self === window.top) {
	init();
	initTextPopup();
}
