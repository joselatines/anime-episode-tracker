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

				h2.textContent = streaming.title;
				span.textContent = streaming.episode;
				image.setAttribute(
					"src",
					streaming.imageUrl ||
						"https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRtjx5nRnRUiIM-RtBAaIXxC8obxkAbwuSxug&usqp=CAU"
				);

				div.appendChild(h2);
				div.appendChild(span);
				div.appendChild(image);

				container.appendChild(div);
			});
		});
	}

  orderStreamings() {}
}

new UIBuilder();