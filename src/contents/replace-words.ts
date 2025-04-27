import type { PlasmoCSConfig } from "plasmo";

import { Storage } from "@plasmohq/storage";

import DOMWatcher from "~lib/content/DomWatcher";
import TextFilter from "~lib/content/filters/TextFilter";
import { IType } from "~lib/Request";
import type { Settings } from "~lib/types";

export const config: PlasmoCSConfig = {
	// matches: ["https://www.facebook.com/*","https://www.tiktok.com/*"]
	matches: ["<all_urls>"]
};

const init = async (): Promise<void> => {
	const storage = new Storage();
	const settings = await storage.get<Settings>(IType.SETTINGS);

	if (!settings.text.enabled) {
		console.log("[TextFilter] Not enabled");
		return;
	}

	console.log("[TextFilter] Init");

	const textFilter = new TextFilter();
	const domWatcher = new DOMWatcher(textFilter, {
		subtree: true,
		childList: true,
		characterData: true,
		attributes: false
	});

	domWatcher.watch();
};

if (window.self === window.top) {
	init();
}
