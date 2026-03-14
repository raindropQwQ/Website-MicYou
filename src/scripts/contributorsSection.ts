import "@material/web/button/filled-button.js";
import "@material/web/icon/icon.js";

interface Contributor {
	login: string;
	avatar_url: string;
	html_url: string;
	contributions: number;
	type: string;
}

interface StatsAuthor {
	login: string;
	avatar_url: string;
	html_url: string;
	type: string;
}

interface StatsItem {
	author: StatsAuthor;
	total: number;
}

const section = document.getElementById("contributors");
if (!section) throw new Error("Missing #contributors");
const contentEl = section.querySelector(".contributors-content") as HTMLElement;
if (!contentEl) throw new Error("Missing .contributors-content");
const t = JSON.parse(section.dataset.t ?? "{}");
const AUTHORS = ["LanRhyme", "ChinsaaWei"];

async function fetchContributors() {
	try {
		// 使用 stats API 获取准确的提交次数（与 GitHub 贡献者图表一致）
		// stats API 可能返回 202（正在计算），需要重试
		let statsData: StatsItem[] | undefined;
		for (let retry = 0; retry < 5; retry++) {
			const statsRes = await fetch(
				"https://api.github.com/repos/LanRhyme/MicYou/stats/contributors",
			);
			if (statsRes.status === 202) {
				// GitHub 正在计算统计数据，等待后重试
				await new Promise((r) => setTimeout(r, 1000));
				continue;
			}
			if (!statsRes.ok) throw new Error(`HTTP ${statsRes.status}`);
			statsData = await statsRes.json();
			break;
		}
		if (!statsData || !Array.isArray(statsData))
			throw new Error(t.unexpectedResponse);

		const contributors: Contributor[] = statsData
			.map((item) => ({
				login: item.author.login,
				avatar_url: item.author.avatar_url,
				html_url: item.author.html_url,
				contributions: item.total,
				type: item.author.type,
			}))
			.filter(
				(c) => c.type === "User" && !c.login.toLowerCase().includes("bot"),
			)
			.sort((a, b) => b.contributions - a.contributions);

		contentEl.textContent = "";
		const grid = document.createElement("div");
		grid.className = "grid";

		contributors.forEach((c) => {
			const card = document.createElement("a");
			card.href = c.html_url;
			card.target = "_blank";
			card.rel = "noopener";
			card.className = "card";

			const avatar = document.createElement("img");
			avatar.src = c.avatar_url;
			avatar.alt = c.login;
			avatar.className = "avatar";
			avatar.loading = "lazy";

			const info = document.createElement("div");
			info.className = "info";

			const nameSpan = document.createElement("span");
			nameSpan.className = "name";
			nameSpan.textContent = c.login;

			if (AUTHORS.includes(c.login)) {
				const authorBadge = document.createElement("span");
				authorBadge.className = "author-badge";
				authorBadge.textContent = t.authorBadge;
				nameSpan.appendChild(authorBadge);
			}

			const contribsSpan = document.createElement("span");
			contribsSpan.className = "contribs";
			contribsSpan.textContent = `${c.contributions} ${t.contributions}`;

			info.appendChild(nameSpan);
			info.appendChild(contribsSpan);
			card.appendChild(avatar);
			card.appendChild(info);
			grid.appendChild(card);
		});

		contentEl.appendChild(grid);
	} catch {
		contentEl.textContent = "";
		const errorDiv = document.createElement("div");
		errorDiv.className = "error";
		errorDiv.textContent = t.error;

		const retryButton = document.createElement("md-filled-button");
		retryButton.className = "retry-btn";
		retryButton.textContent = t.retry;
		retryButton.addEventListener("click", fetchContributors);

		errorDiv.appendChild(retryButton);
		contentEl.appendChild(errorDiv);
	}
}

fetchContributors();
