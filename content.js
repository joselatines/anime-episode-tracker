alert("background");

const KEY_WATCHED_STREAMINGS = "watchedStreamings";

class DBManager {
	watchedStreamings = [];

	constructor() {
		this.start();
	}

	start() {
		chrome.storage.sync.get(KEY_WATCHED_STREAMINGS, storage => {
			// checks if there is saved data if not assign an empty
			this.watchedStreamings = storage.watchedStreamings || [];
		});
	}

	getWatchedStreamings() {
		return this.watchedStreamings;
	}

	orderWatchedStreamings() {
		// unique episode
		// by asc
	}

	addStreamingToWatched(streaming) {
		// stores in the memory
		this.watchedStreamings.push(streaming);
		console.table(this.watchedStreamings);
		// stores in the storage
		saveInStorage(KEY_WATCHED_STREAMINGS, this.watchedStreamings);
	}
}

class Streaming {
	buildEpisode() {
		const episode = this.scrapeEpisode();
		const title = this.scrapeTitle();
		const imageUrl = this.scrapeImageUrl();

		return { title, episode, imageUrl };
	}

	scrapeTitle() {}

	scrapeEpisode() {}

	scrapeImageUrl() {}
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

		return episode;
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

		return episode;
	}

	scrapeImageUrl() {
		const imageUrl = null;

		return imageUrl;
	}
}

class StreamingScrapper {
	constructor(StreamingClass) {
		this.StreamingClass = StreamingClass;
		this.createWatchedButton();
	}

	createWatchedButton() {}

	addStreamingToDB() {
		const streamingClass = new this.StreamingClass();
		const streaming = streamingClass.buildEpisode();

		database.addStreamingToWatched(streaming);
	}
}

class AnimeFLVScrapper extends StreamingScrapper {
	constructor(StreamingClass) {
		super(StreamingClass);
	}

	createWatchedButton() {
		const container = document.querySelector(".CpCnA");
		if (!container) return console.error("Container not found in the DOM");

		const button = document.createElement("button");
		button.textContent = "Watched!";
		button.addEventListener("click", this.addStreamingToDB.bind(this));
		container.appendChild(button);
	}
}

class AnimeTVScrapper extends StreamingScrapper {
	constructor(StreamingClass) {
		super(StreamingClass);
	}

	createWatchedButton() {
		const container = document.querySelector(".ps_-status");
		if (!container) return console.error("Container not found in the DOM");

		const button = document.createElement("button");
		button.textContent = "Watched!";
		button.addEventListener("click", this.addStreamingToDB.bind(this));
		container.appendChild(button);
	}
}

const database = new DBManager();
new AnimeTVScrapper(AnimeTVStreaming);
new AnimeFLVScrapper(AnimeFLVStreaming);

const saveInStorage = (key, value) => {
	chrome.storage.sync.set({ [key]: value }, () => {
		console.log("Saved in storage", value);
	});
};
