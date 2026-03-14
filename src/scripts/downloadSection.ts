import "@material/web/button/filled-button.js";
import "@material/web/button/outlined-button.js";
import "@material/web/icon/icon.js";
import { detectDevice } from "../utils/device";

const section = document.getElementById("download")!;
const t = JSON.parse(section.dataset.t ?? "{}");
const AUR_COMMAND = "paru -S micyou-bin";

type Asset = { name: string; browser_download_url: string };
type Release = { tag_name: string; assets: Asset[]; html_url: string };

async function fetchRelease() {
	try {
		const res = await fetch(
			"https://api.github.com/repos/LanRhyme/MicYou/releases/latest",
		);
		if (!res.ok) throw new Error("Failed to fetch");
		const data: Release = await res.json();

		const find = (test: (name: string) => boolean) =>
			data.assets.find((a) => test(a.name))?.browser_download_url ??
			data.html_url;

		const dmgAny = data.assets.find((a) => a.name.endsWith(".dmg"));
		const dmgArm = data.assets.find(
			(a) =>
				a.name.endsWith(".dmg") &&
				/arm|aarch|apple-silicon|universal/i.test(a.name),
		);
		const dmgX64 = data.assets.find(
			(a) => a.name.endsWith(".dmg") && /x64|x86_64|intel|x86-64/i.test(a.name),
		);

		const urls: Record<string, string> = {
			exe: find((n) => n.endsWith(".exe") || n.endsWith(".msi")),
			zip: find((n) => n.endsWith(".zip")),
			apk: find((n) => n.endsWith(".apk")),
			deb: find((n) => n.endsWith(".deb")),
			rpm: find((n) => n.endsWith(".rpm")),
			"dmg-arm":
				dmgArm?.browser_download_url ??
				(dmgAny && !dmgX64 ? dmgAny.browser_download_url : data.html_url),
			"dmg-x64":
				dmgX64?.browser_download_url ??
				(dmgAny && !dmgArm ? dmgAny.browser_download_url : data.html_url),
		};

		for (const [key, url] of Object.entries(urls)) {
			const el = section.querySelector<HTMLElement>(`[data-url="${key}"]`);
			if (el) el.setAttribute("href", url);
		}

		const exeLabel = section.querySelector("[data-url='exe'] .btn-label");
		if (exeLabel) exeLabel.textContent = t.btnWinDownload;

		section.querySelectorAll(".version-tag").forEach((el) => {
			el.textContent = data.tag_name;
		});
	} catch {
		const exeLabel = section.querySelector("[data-url='exe'] .btn-label");
		if (exeLabel) exeLabel.textContent = t.btnWinDownload;
	}
}

async function detectAndHighlight() {
	try {
		const platform = await detectDevice();
		const platformMap: Record<string, string> = {
			windows: "windows",
			android: "android",
			mac_arm: "mac",
			mac_x64: "mac",
			linux: "linux",
		};
		const cardPlatform = platformMap[platform];
		if (!cardPlatform) return;

		const card = section.querySelector<HTMLElement>(
			`[data-platform="${cardPlatform}"]`,
		);
		if (!card) return;
		card.classList.add("recommended");
		const badge = card.querySelector<HTMLElement>(".badge");
		if (badge) badge.hidden = false;

		const primaryUrlKey: Record<string, string> = {
			windows: "exe",
			android: "apk",
			mac: platform === "mac_arm" ? "dmg-arm" : "dmg-x64",
			linux: "deb",
		};
		const key = primaryUrlKey[cardPlatform];
		if (key) {
			const btn = card.querySelector<HTMLElement>(`[data-url="${key}"]`);
			if (btn) {
				const filled = document.createElement("md-filled-button");
				for (const attr of Array.from(btn.attributes)) {
					filled.setAttribute(attr.name, attr.value);
				}
				filled.innerHTML = btn.innerHTML;
				btn.replaceWith(filled);
			}
		}
	} catch {
		// ignore
	}
}

section
	.querySelector("[data-action='copy-aur']")
	?.addEventListener("click", async () => {
		try {
			await navigator.clipboard.writeText(AUR_COMMAND);
			showToast(t.aurCommandCopied);
		} catch {
			// ignore
		}
	});

function showToast(message: string) {
	let container = document.getElementById("toast-container");
	if (!container) {
		container = document.createElement("div");
		container.id = "toast-container";
		document.body.appendChild(container);
	}

	const toast = document.createElement("div");
	toast.className = "toast";

	const content = document.createElement("span");
	content.textContent = message;
	toast.appendChild(content);

	const progress = document.createElement("div");
	progress.className = "toast-progress";
	toast.appendChild(progress);

	container.appendChild(toast);

	// 触发动画
	requestAnimationFrame(() => {
		toast.classList.add("show");
	});

	setTimeout(() => {
		toast.classList.remove("show");
		setTimeout(() => toast.remove(), 100);
	}, 3000);
}

fetchRelease();
detectAndHighlight();
