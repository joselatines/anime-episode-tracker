alert("background");
const watchedStreamings = [];

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
		const imageUrl = "no image";

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
		watchedStreamings.push(streaming);

		alert(JSON.stringify(watchedStreamings));
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

new AnimeTVScrapper(AnimeTVStreaming);
new AnimeFLVScrapper(AnimeFLVStreaming);
