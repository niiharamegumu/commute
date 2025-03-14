import React from "react";
import { useCallback, useEffect, useMemo, useState } from "react";
import "./App.css";
import { LINK_TYPE, busStops, trainStations, BUS_TYPE, dayToBusType } from "./constants";
import type { LinkData } from "./types";

let holidaysCache: string[] | null = null;
let holidaysPromise: Promise<string[]> | null = null;

const fetchHolidays = async (): Promise<string[]> => {
	if (holidaysCache) return holidaysCache;
	if (holidaysPromise) return holidaysPromise;
	holidaysPromise = (async () => {
		const res = await fetch("https://holidays-jp.github.io/api/v1/date.json");
		const data = await res.json();
		holidaysCache = Object.keys(data);
		return holidaysCache;
	})();
	return holidaysPromise;
};

const getTrainLink = (from: string, to: string): string => {
	const now = new Date();
	const year = now.getFullYear();
	const month = (now.getMonth() + 1).toString().padStart(2, "0");
	const day = now.getDate().toString().padStart(2, "0");
	const hour = now.getHours();
	return `https://www.jorudan.co.jp/time/to/${encodeURIComponent(from)}_${encodeURIComponent(to)}/?r=${encodeURIComponent("日豊本線")}&Dym=${year}${month}&Ddd=${day}#time${hour}w`;
};

const getBusLink = async (from: string, to: string): Promise<string> => {
	const now = new Date();
	let busType = dayToBusType[now.getDay()];
	const today = now.toISOString().split("T")[0];
	if ((await fetchHolidays()).includes(today)) busType = BUS_TYPE.holiday;
	return `https://qbus.jp/cgi-bin/time/jun.exe?pwd=h%2Fjun.pwd&from=${from}&to=${to}&kai=N&yobi=${busType}&ji=${now.getHours()}&fun=${now.getMinutes()}`;
};

const App: React.FC = () => {
	const [links, setLinks] = useState<{
		going: LinkData[];
		returning: LinkData[];
	}>({
		going: [],
		returning: [],
	});
	const [time, setTime] = useState(new Date());
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const refreshLinks = useCallback(async () => {
		setLoading(true);
		setError(null);
		try {
			const trainLink1 = getTrainLink(trainStations.minamimiyazaki, trainStations.miyazaki);
			const trainLink2 = getTrainLink(trainStations.miyazaki, trainStations.minamimiyazaki);
			const [busLink1, busLink2, busLink3, busLink4, busLink5] = await Promise.all([
				getBusLink(busStops.minamimiyazaki_ekimaedori, busStops.tachibana_3_chome),
				getBusLink(busStops.minamimiyazaki_ekimaedori, busStops.nanairo_mae),
				getBusLink(busStops.miyazaki_eki, busStops.depato_mae),
				getBusLink(busStops.tachibana_3_chome, busStops.miyako_city),
				getBusLink(busStops.karino_mae, busStops.miyazaki_eki),
			]);

			setLinks({
				going: [
					{
						label: "電車（南宮崎駅 → 宮崎駅）",
						href: trainLink1,
						type: LINK_TYPE.TRAIN,
					},
					{
						label: "バス（南宮崎駅前通 → 橘通り3丁目）",
						href: busLink1,
						type: LINK_TYPE.BUS,
					},
					{
						label: "バス（南宮崎駅前通 → 宮崎ナナイロ前）",
						href: busLink2,
						type: LINK_TYPE.BUS,
					},
					{
						label: "バス（宮崎駅 → 山形屋デパート前）",
						href: busLink3,
						type: LINK_TYPE.UNUSED,
					},
				],
				returning: [
					{
						label: "電車（宮崎駅 → 南宮崎駅）",
						href: trainLink2,
						type: LINK_TYPE.TRAIN,
					},
					{
						label: "バス（橘通り3丁目 → 宮交シティ）",
						href: busLink4,
						type: LINK_TYPE.BUS,
					},
					{
						label: "バス（カリーノ前 → 宮崎駅）",
						href: busLink5,
						type: LINK_TYPE.UNUSED,
					},
				],
			});
		} catch (error) {
			console.error("Error refreshing links:", error);
			setError("リンクの更新に失敗しました。もう一度お試しください。");
		} finally {
			setLoading(false);
		}
	}, []);

	useEffect(() => {
		const updateLinksAndTime = async () => {
			await refreshLinks();
			setTime(new Date());
		};

		updateLinksAndTime();

		const handleVisibilityChange = () => {
			if (document.visibilityState === "visible") {
				updateLinksAndTime();
			}
		};

		// 時間を1秒ごとに更新
		const timeInterval = setInterval(() => {
			setTime(new Date());
		}, 1000);

		document.addEventListener("visibilitychange", handleVisibilityChange);
		return () => {
			document.removeEventListener("visibilitychange", handleVisibilityChange);
			clearInterval(timeInterval);
		};
	}, [refreshLinks]);

	const memoizedLinkSections = useMemo(() => {
		return {
			going: <LinkSection title="行き" links={links.going} />,
			returning: <LinkSection title="帰り" links={links.returning} />,
		};
	}, [links.going, links.returning]);

	return (
		<div className="container">
			<div className="header">
				<h1>{time.toLocaleString()}</h1>
			</div>

			{error && <div className="error-message">{error}</div>}
			{loading && <div className="loading">リンクを更新中...</div>}

			{memoizedLinkSections.going}
			{memoizedLinkSections.returning}
		</div>
	);
};

interface LinkSectionProps {
	title: string;
	links: LinkData[];
}

const LinkSection: React.FC<LinkSectionProps> = React.memo(({ title, links }) => (
	<div className="section">
		<h2>{title}</h2>
		{links.length === 0 ? (
			<p>リンクがありません</p>
		) : (
			links.map((link) => (
				<a
					key={link.href}
					href={link.href}
					target="_blank"
					rel="noopener noreferrer"
					className={`link ${link.type}`}
				>
					{link.label}
				</a>
			))
		)}
	</div>
));

export default App;
