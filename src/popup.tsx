import { useEffect, useState } from "react";

import { sendToBackground } from "@plasmohq/messaging";

import "~style.css";

import { Storage } from "@plasmohq/storage";

import Request, { IType } from "~lib/Request";
import type { Settings } from "~lib/types";

interface ToggleProps {
	label: string;
	enabled: boolean;
	onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
	disabled?: boolean;
	description?: string;
}

function Toggle({
	label,
	enabled,
	onChange,
	disabled = false,
	description
}: ToggleProps) {
	useEffect(() => {
		console.log("enabled", enabled);
	}, [enabled]);

	return (
		<div className="plasmo-flex plasmo-flex-col plasmo-gap-1">
			<label
				className={`plasmo-flex plasmo-items-center plasmo-cursor-pointer plasmo-group ${
					disabled
						? "plasmo-opacity-50 plasmo-cursor-not-allowed"
						: ""
				}`}>
				<div className="plasmo-relative">
					<input
						type="checkbox"
						className="plasmo-sr-only"
						checked={enabled}
						onChange={onChange}
						disabled={disabled}
						aria-checked={enabled}
						role="switch"
					/>
					<div
						className={`
                            plasmo-w-11 plasmo-h-6
                            plasmo-rounded-full
                            plasmo-transition-all plasmo-duration-200
                            ${
								enabled
									? "plasmo-bg-green-500 group-hover:plasmo-bg-green-600"
									: "plasmo-bg-gray-200 group-hover:plasmo-bg-gray-300"
							}
                            ${disabled ? "plasmo-cursor-not-allowed" : ""}
                        `}>
						<div
							className={`
                                plasmo-w-5 plasmo-h-5
                                plasmo-bg-white
                                plasmo-rounded-full
                                plasmo-shadow-md
                                plasmo-transform plasmo-transition-transform plasmo-duration-200
                                plasmo-mt-0.5
                                ${enabled && "plasmo-translate-x-6"}
                            `}
						/>
					</div>
				</div>
				<div className="plasmo-ml-3 plasmo-text-gray-700 plasmo-font-medium group-hover:plasmo-text-gray-800">
					{label}
				</div>
			</label>
			{description && (
				<p className="plasmo-text-sm plasmo-text-gray-500 plasmo-ml-14">
					{description}
				</p>
			)}
		</div>
	);
}

function IndexPopup() {
	const [imageFilterEnabled, setImageFilterEnabled] = useState(false);
	const [settings, setSettings] = useState<Settings>({
		image: {
			sensitive: false,
			violent: false
		},
		text: {
			enabled: false
		}
	});

	const saveSettings = (updates) => {
		console.log("Saving settings", updates);
		setSettings(updates);
		chrome.runtime.sendMessage(new Request(IType.SETTINGS, updates));
	};

	useEffect(() => {
		const storage = new Storage();
		storage.get<Settings>(IType.SETTINGS).then(async (oriSettings) => {
			if (!oriSettings) {
				console.log("No settings found, setting default settings");
				// await storage.set(IType.SETTINGS, settings);

				const req = new Request(IType.SETTINGS, settings);
				console.log("req", req, settings);
				chrome.runtime.sendMessage(req);
				return;
			}

			console.log("Settings", settings);
			setSettings(oriSettings);
			setImageFilterEnabled(
				Object.values(oriSettings.image).some((v) => v)
			);
		});
	}, []);

	return (
		<div className="plasmo-w-80 plasmo-min-h-[200px] plasmo-p-6 plasmo-bg-gradient-to-br plasmo-from-white plasmo-to-gray-50 plasmo-font-sans">
			<div className="">
				<h1 className="plasmo-text-2xl plasmo-font-bold plasmo-text-gray-800 plasmo-mb-2 plasmo-flex plasmo-items-center">
					<svg
						className="plasmo-w-6 plasmo-h-6 plasmo-mr-2"
						fill="none"
						viewBox="0 0 24 24"
						stroke="currentColor">
						<path
							strokeLinecap="round"
							strokeLinejoin="round"
							strokeWidth={2}
							d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"
						/>
					</svg>
					Content Filter
				</h1>
				<p className="plasmo-text-sm plasmo-text-gray-600">
					Configure content filtering settings to protect your
					browsing experience
				</p>
			</div>

			<div className="plasmo-space-y-6 plasmo-mt-auto">
				<div className="plasmo-space-y-4">
					<Toggle
						label="Image Filter"
						enabled={imageFilterEnabled}
						onChange={(e) => {
							if (e.target.checked) {
								setImageFilterEnabled(e.target.checked);
							} else {
								saveSettings({
									...settings,
									image: {
										...settings.image,
										sensitive: false,
										violent: false
									}
								});
								setImageFilterEnabled(false);
							}
							// saveSettings({
							// 	imageFilterEnabled: e.target.checked
							// });
						}}
					/>

					{imageFilterEnabled && (
						<div className="plasmo-ml-6 plasmo-mt-2 plasmo-animate-fade-in">
							<label className="plasmo-block plasmo-text-sm plasmo-font-medium plasmo-text-gray-700 plasmo-mb-2">
								Filter Types
							</label>
							<div className="plasmo-space-y-2">
								<label className="plasmo-flex plasmo-items-center">
									<input
										type="checkbox"
										className="plasmo-form-checkbox plasmo-h-4 plasmo-w-4 plasmo-text-green-500 plasmo-rounded"
										checked={settings.image.sensitive}
										onChange={(e) => {
											saveSettings({
												...settings,
												image: {
													...settings.image,
													sensitive: e.target.checked
												}
											});
										}}
									/>
									<span className="plasmo-ml-2 plasmo-text-sm plasmo-text-gray-700">
										Sensitive Content
									</span>
								</label>
								<label className="plasmo-flex plasmo-items-center">
									<input
										type="checkbox"
										className="plasmo-form-checkbox plasmo-h-4 plasmo-w-4 plasmo-text-green-500 plasmo-rounded"
										checked={settings.image.violent}
										onChange={(e) => {
											saveSettings({
												...settings,
												image: {
													...settings.image,
													violent: e.target.checked
												}
											});
										}}
									/>
									<span className="plasmo-ml-2 plasmo-text-sm plasmo-text-gray-700">
										Violent Content
									</span>
								</label>
							</div>
						</div>
					)}

					<Toggle
						label="Text Filter"
						enabled={settings.text.enabled}
						onChange={(e) => {
							saveSettings({
								...settings,
								text: {
									...settings.text,
									enabled: e.target.checked
								}
							});
						}}
					/>
				</div>

				<div className="plasmo-pt-4 plasmo-border-t plasmo-border-gray-200">
					<p className="plasmo-text-xs plasmo-text-gray-500 plasmo-flex plasmo-items-center">
						<svg
							className="plasmo-w-4 plasmo-h-4 plasmo-mr-1"
							fill="none"
							viewBox="0 0 24 24"
							stroke="currentColor">
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth={2}
								d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
							/>
						</svg>
						AI - Generated
					</p>
				</div>
			</div>
		</div>
	);
}

export default IndexPopup;
