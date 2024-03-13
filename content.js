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

		console.table(this.watchedStreamings);
	}

	async addStreamingToWatched(streaming) {
		const alreadyInWatchedStreamings = this.watchedStreamings.some(
			stream => stream.episode === streaming.episode
		);

		if (alreadyInWatchedStreamings) return console.info("Already in database");

		this.watchedStreamings.push(streaming);
		const orderedStreamings = this.orderWatchedStreamings();
		this.saveWatchedStreamingsToStorage(orderedStreamings);

		console.table(orderedStreamings);
	}

	async saveWatchedStreamingsToStorage(streamings = this.watchedStreamings) {
		await new Promise(resolve => {
			chrome.storage.sync.set({ [KEY_WATCHED_STREAMINGS]: streamings }, () => {
				console.log("Saved watched streamings to storage", streamings);
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
		return "";
	}

	scrapeEpisode() {
		return 0;
	}

	scrapeImageUrl() {
		return "" || null;
	}

	scrapeUrl() {
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

	async createButton() {}
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
		} catch (error) {
			alert("Error trying to save in database");
			console.error(error);
		}
	}

	async deleteStreamingFromDB(id) {
		try {
			await this.database.deleteStreamingFromWatched(id);
		} catch (error) {
			alert("Error trying to delete in database");
			console.error(error);
		}
	}
}

class AnimeFLVScrapper extends StreamingScrapper {
	async createButton() {
		const container = document.querySelector(".CpCnA");
		if (!container) return console.error("Container not found in the DOM");

		const button = document.createElement("button");
		const streamingAlreadyWatched = await this.isMarkedAsWatched();

		if (streamingAlreadyWatched) {
			button.textContent = "Unwatched!";
			button.style.background = "red";
			button.addEventListener(
				"click",
				async () => await this.deleteStreamingFromDB(streamingAlreadyWatched.id)
			);
		} else {
			button.textContent = "Watched!";
			button.style.background = "green";
			button.addEventListener(
				"click",
				async () => await this.addStreamingToDB()
			);
		}

		container.appendChild(button);
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
