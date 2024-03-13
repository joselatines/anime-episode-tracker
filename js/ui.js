console.info("ui.js");

class UIBuilder {
	constructor() {
		this.mountStreamings();
	}

	mountStreamings() {
		chrome.storage.sync.get("watchedStreamings", storage => {
			const watchedStreamings = storage.watchedStreamings || [];
			const container = document.querySelector("#streamings");

			watchedStreamings.forEach(streaming => {
				const div = document.createElement("div");
				const h2 = document.createElement("h2");
				const span = document.createElement("span");
				const image = document.createElement("img");
				const a = document.createElement("a");

				h2.textContent = streaming.title;
				span.textContent = "Episode " + streaming.episode.toString();
				image.setAttribute(
					"src",
					streaming.imageUrl ||
						"https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRtjx5nRnRUiIM-RtBAaIXxC8obxkAbwuSxug&usqp=CAU"
				);
				a.textContent = "Watch here";
				a.setAttribute("href", streaming.url);

				div.appendChild(h2);
				div.appendChild(span);
				div.appendChild(image);
				div.appendChild(a);

				container.appendChild(div);
			});
		});
	}

	orderStreamings() {}
}

new UIBuilder();
