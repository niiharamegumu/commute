import type { FC } from "react";
import { useCallback, useEffect, useMemo, useState } from "react";
import "./App.css";
import { LINK_TYPE, busStops, trainStations, BUS_TYPE, dayToBusType } from "./constants";
import type { LinkData, LinkType } from "./types";
import LinkSection from "./components/LinkSection";

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

const App: FC = () => {
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

			// バスルート設定の型定義
			type BusRouteConfig = {
				from: string;
				to: string;
				label: string;
				type: LinkType;
			};

			// バスリンク情報の定義
			const busRoutesConfig: Record<string, BusRouteConfig> = {
				minamimiyazaki_to_tachibana3: {
					from: busStops.minamimiyazaki_ekimaedori,
					to: busStops.tachibana_3_chome,
					label: "バス（南宮崎駅前通 → 橘通り3丁目）",
					type: LINK_TYPE.BUS,
				},
				minamimiyazaki_to_nanairo: {
					from: busStops.minamimiyazaki_ekimaedori,
					to: busStops.nanairo_mae,
					label: "バス（南宮崎駅前通 → 宮崎ナナイロ前）",
					type: LINK_TYPE.BUS,
				},
				miyazaki_to_depato: {
					from: busStops.miyazaki_eki,
					to: busStops.depato_mae,
					label: "バス（宮崎駅 → 山形屋デパート前）",
					type: LINK_TYPE.UNUSED,
				},
				tachibana_to_miyako: {
					from: busStops.tachibana_3_chome,
					to: busStops.miyako_city,
					label: "バス（橘通り3丁目 → 宮交シティ）",
					type: LINK_TYPE.BUS,
				},
				karino_to_miyazaki: {
					from: busStops.karino_mae,
					to: busStops.miyazaki_eki,
					label: "バス（カリーノ前 → 宮崎駅）",
					type: LINK_TYPE.UNUSED,
				},
			};

			// バスリンクの取得
			const busLinks: Record<string, LinkData> = {};
			await Promise.all(
				Object.entries(busRoutesConfig).map(async ([key, config]) => {
					busLinks[key] = {
						label: config.label,
						href: await getBusLink(config.from, config.to),
						type: config.type,
					};
				}),
			);

			setLinks({
				going: [
					{
						label: "電車（南宮崎駅 → 宮崎駅）",
						href: trainLink1,
						type: LINK_TYPE.TRAIN,
					},
					busLinks.minamimiyazaki_to_tachibana3,
					busLinks.minamimiyazaki_to_nanairo,
					busLinks.miyazaki_to_depato,
				],
				returning: [
					{
						label: "電車（宮崎駅 → 南宮崎駅）",
						href: trainLink2,
						type: LINK_TYPE.TRAIN,
					},
					busLinks.tachibana_to_miyako,
					busLinks.karino_to_miyazaki,
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

export default App;
