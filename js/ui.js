// Log info message
console.info("UI.js module initialization");

class UIBuilder {
	constructor() {
		this.renderStreamings();
		this.renderClearStorageButton();
	}

	renderStreamings() {
		// fetch watchedStreamings from Chrome storage
		chrome.storage.sync.get("watchedStreamings", data => {
			const watchedStreamings = data.watchedStreamings;
			const container = document.querySelector("#streamings");

			if (!watchedStreamings || watchedStreamings.length === 0)
				return (container.textContent = "No animes added");

			// create a hash table to group watchedStreamings by title
			const streamingGroups = {};

			// group watchedStreamings by title
			watchedStreamings.forEach(streaming => {
				const titleKey = this.convertSpacesToUnderscores(streaming.title);

				if (streamingGroups.hasOwnProperty(titleKey)) {
					streamingGroups[titleKey].push(streaming);
				} else {
					streamingGroups[titleKey] = [streaming];
				}
			});

			// render streaming groups
			for (const key in streamingGroups) {
				const streamings = streamingGroups[key];
				const details = document.createElement("details");
				const summary = document.createElement("summary");
				summary.textContent = streamings[0].title; // for example: One Piece

				// render episodes for each streaming group
				streamings.forEach(streaming => {
					const episodeLink = document.createElement("a");
					episodeLink.textContent = `Episode ${streaming.episode}`;
					episodeLink.setAttribute("href", streaming.url);
					episodeLink.setAttribute("target", "_blank");
					episodeLink.setAttribute("rel", "noopener noreferrer");
					episodeLink.className = "streamingEpisode";

					details.appendChild(episodeLink);
				});

				details.appendChild(summary);
				container.appendChild(details);
			}
		});
	}

	clearStorage() {
		return new Promise(resolve => {
			chrome.storage.local.clear(() => {
				const error = chrome.runtime.lastError;
				if (error) {
					console.error(error);
				} else {
					console.info("Storage cleared!");
				}
				resolve();
				document.location.reload();
			});
			chrome.storage.sync.clear();
		});
	}

	renderClearStorageButton() {
		const container = document.querySelector("#footer");
		const button = document.createElement("button");
		button.textContent = "Clear all";
		button.addEventListener("click", this.clearStorage);

		container.appendChild(button);
	}

	convertSpacesToUnderscores(string = "") {
		return string.replaceAll(" ", "_").toLowerCase();
	}
}

new UIBuilder();
