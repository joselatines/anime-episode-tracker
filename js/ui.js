// Log info message
console.info("UI.js module initialization");

class UIBuilder {
	constructor() {
		this.renderStreamings();
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

	convertSpacesToUnderscores(string = "") {
		return string.replaceAll(" ", "_").toLowerCase();
	}
}

new UIBuilder();
