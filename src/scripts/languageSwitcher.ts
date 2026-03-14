import "@material/web/iconbutton/icon-button.js";
import "@material/web/menu/menu.js";
import "@material/web/menu/menu-item.js";
import "@material/web/icon/icon.js";

document.querySelectorAll(".language-switcher").forEach((switcher) => {
	const anchor = switcher.querySelector("md-icon-button") as HTMLElement;
	const menu = switcher.querySelector("md-menu") as HTMLElement & {
		anchorElement: HTMLElement;
		open: boolean;
	};
	if (!menu || !anchor) return;

	menu.anchorElement = anchor;

	anchor.addEventListener("click", () => {
		menu.open = !menu.open;
	});

	menu.querySelectorAll("md-menu-item").forEach((item) => {
		item.addEventListener("click", () => {
			const lang = (item as HTMLElement).dataset.lang;
			if (lang) {
				if (lang === "zh") {
					window.location.href = "/";
				} else {
					window.location.href = `/${lang}/`;
				}
			}
		});
	});
});
