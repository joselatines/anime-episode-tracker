alert("background");

const KEY_WATCHED_STREAMINGS = "watchedStreamings";

class DBManager {
	watchedStreamings = [];

	constructor() {
		this.start();
	}

	async start() {
		// await this.clearStorage();
		await this.getWatchedStreamingsFromStorage();
	}

	async getWatchedStreamingsFromStorage() {
		return new Promise(resolve => {
			chrome.storage.sync.get(KEY_WATCHED_STREAMINGS, storage => {
				this.watchedStreamings = storage[KEY_WATCHED_STREAMINGS] || [];
				resolve();
			});
		});
	}

	async clearStorage() {
		return new Promise(resolve => {
			chrome.storage.local.clear(() => {
				const error = chrome.runtime.lastError;
				if (error) {
					console.error(error);
				} else {
					console.info("Storage cleared!");
				}
				resolve();
			});
			chrome.storage.sync.clear();
		});
	}

	async getWatchedStreamings() {
		await this.getWatchedStreamingsFromStorage(); // refresh memory variable with storage
		return this.watchedStreamings;
	}

	orderWatchedStreamings() {
		// Order by title, then by episode number
		const orderedStreamings = this.watchedStreamings.sort((a, b) => {
			// Compare titles first
			if (a.title !== b.title) return a.title.localeCompare(b.title);

			// If titles are the same, compare episode numbers
			return a.episode - b.episode;
		});

		return orderedStreamings;
	}

	async deleteStreamingFromWatched(id) {
		this.watchedStreamings = this.watchedStreamings.filter(
			stream => stream.id !== id
		);
		await this.saveWatchedStreamingsToStorage();

		console.info(`Streaming ${id} deleted`);
	}

	async addStreamingToWatched(streaming) {
		const alreadyInWatchedStreamings = this.watchedStreamings.some(
			stream => stream.episode === streaming.episode
		);

		if (alreadyInWatchedStreamings)
			return console.info(`${streaming.id} already in database`);

		this.watchedStreamings.push(streaming);
		const orderedStreamings = this.orderWatchedStreamings();
		this.saveWatchedStreamingsToStorage(orderedStreamings);
	}

	async saveWatchedStreamingsToStorage(streamings = this.watchedStreamings) {
		await new Promise(resolve => {
			chrome.storage.sync.set({ [KEY_WATCHED_STREAMINGS]: streamings }, () => {
				console.info("Saved watched streamings to storage", streamings);
				resolve();
			});
		});
	}
}

class Streaming {
	buildEpisode() {
		const episode = this.scrapeEpisode();
		const title = this.scrapeTitle();
		const imageUrl = this.scrapeImageUrl();
		const id = Math.random().toString(16).slice(2);
		const url = this.scrapeUrl();

		return { title, episode, imageUrl, id, url };
	}

	scrapeTitle() {
		throw new Error("method must be implemented in subclasses");
		return "";
	}

	scrapeEpisode() {
		throw new Error("method must be implemented in subclasses");
		return 0;
	}

	scrapeImageUrl() {
		throw new Error("method must be implemented in subclasses");
		return "" || null;
	}

	scrapeUrl() {
		throw new Error("method must be implemented in subclasses");
		return "";
	}
}

class AnimeTVStreaming extends Streaming {
	scrapeTitle() {
		const title = document
			.querySelector(".film-name.dynamic-name")
			.getAttribute("data-jname");

		return title;
	}

	scrapeEpisode() {
		const episode = document
			.querySelector(".item.ep-item.active")
			.getAttribute("data-number");

		return Number(episode);
	}

	scrapeImageUrl() {
		const animeDetailContainer = document.querySelector(".anime-detail");
		const imageUrl = animeDetailContainer
			.querySelector(".film-poster-img")
			.getAttribute("src");

		return imageUrl;
	}
}

class AnimeFLVStreaming extends Streaming {
	scrapeTitle() {
		const container = document.querySelector(".Brdcrmb.fa-home");
		const aElements = container.querySelectorAll("a");
		const title = aElements[1].textContent;

		return title;
	}

	scrapeEpisode() {
		const episode = document.querySelector(".SubTitle").textContent;

		// extract number
		let episodeNumber = episode.match(/\d/g);
		// join numbers into a string
		episodeNumber = episodeNumber.join("");

		return Number(episodeNumber);
	}

	scrapeImageUrl() {
		const imageUrl = null;

		return imageUrl;
	}

	scrapeUrl() {
		return document.URL;
	}
}

class StreamingScrapper {
	constructor(streamingElement, database) {
		this.streamingElement = streamingElement;
		this.database = database;
		this.createButton();
	}

	async createButton() {
		throw new Error("createButton method must be implemented in subclasses");
	}

	updateButtonUI(text = "Watch", background = "green", clickHandler) {
		const button = document.querySelector("#status");
		if (!button) return console.error("Button element not found in DOM");

		button.textContent = text;
		button.style.background = background;

		button.removeEventListener("click", this.addStreamingToDB);
		button.removeEventListener("click", this.deleteStreamingFromDB);
		button.addEventListener("click", clickHandler);
	}

	async isMarkedAsWatched() {
		const title = this.streamingElement.scrapeTitle();
		const episode = this.streamingElement.scrapeEpisode();

		try {
			const watchedStreamings = await this.database.getWatchedStreamings();
			const streamingFound = watchedStreamings.find(
				stream => stream.title === title && stream.episode === episode
			);

			return streamingFound;
		} catch (error) {
			alert("Error trying to get database");
			console.error(error);
		}
	}
	async addStreamingToDB() {
		try {
			const streaming = this.streamingElement.buildEpisode();
			await this.database.addStreamingToWatched(streaming);
			this.updateButtonUI(
				"Unwatch",
				"red",
				this.deleteStreamingFromDB.bind(this, streaming.id)
			);
		} catch (error) {
			console.error("Error trying to save in database", error);
			throw error;
		}
	}

	async deleteStreamingFromDB(id) {
		try {
			await this.database.deleteStreamingFromWatched(id);
			this.updateButtonUI("Watched", "green", this.addStreamingToDB.bind(this));
		} catch (error) {
			console.error("Error trying to delete in database", error);
			throw error;
		}
	}
}

class AnimeFLVScrapper extends StreamingScrapper {
	async createButton() {
		const container = document.querySelector(".CpCnA");
		if (!container) return console.error("Container not found in the DOM");

		const button = document.createElement("button");
		button.setAttribute("id", "status");
		button.style.marginTop = "1rem";
		const streamingAlreadyWatched = await this.isMarkedAsWatched();

		container.appendChild(button);

		if (streamingAlreadyWatched) {
			this.updateButtonUI(
				"Unwatch",
				"red",
				this.deleteStreamingFromDB.bind(this, streamingAlreadyWatched.id)
			);
		} else {
			this.updateButtonUI("Watched", "green", this.addStreamingToDB.bind(this));
		}
	}
}

class AnimeTVScrapper extends StreamingScrapper {
	constructor(streamingElement) {
		super(streamingElement);
	}

	createButton() {
		const container = document.querySelector(".ps_-status");
		if (!container) return console.error("Container not found in the DOM");

		const button = document.createElement("button");
		button.textContent = "Watched!";
		button.addEventListener("click", this.addStreamingToDB.bind(this));
		container.appendChild(button);
	}
}

const database = new DBManager();
new AnimeFLVScrapper(new AnimeFLVStreaming(), database);
