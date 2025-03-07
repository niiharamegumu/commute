import type React from "react";
import { useEffect, useState } from "react";
import "./App.css";

type LinkData = {
	label: string;
	href: string;
	type: "train" | "bus" | "unUsed";
};

const busStops = {
	miyazaki_eki: "000LM0001",
	depato_mae: "000LM3002",
	karino_mae: "000G00129",
	minamimiyazaki_ekimaedori: "011000002",
	tachibana_3_chome: "011000008",
	miyako_city: "000LM0002",
	nanairo_mae: "011009001",
};

const trainStations = {
	minamimiyazaki: "南宮崎",
	miyazaki: "宮崎",
};

const BUS_TYPE = {
	weekday: 0,
	saturday: 1,
	holiday: 2,
} as const;

const dayToBusType: {
	[key: number]: number;
} = {
	0: BUS_TYPE.holiday,
	1: BUS_TYPE.weekday,
	2: BUS_TYPE.weekday,
	3: BUS_TYPE.weekday,
	4: BUS_TYPE.weekday,
	5: BUS_TYPE.weekday,
	6: BUS_TYPE.saturday,
};

let holidaysCache: string[] | null = null;
const fetchHolidays = async (): Promise<string[]> => {
	if (holidaysCache) return holidaysCache;
	const res = await fetch("https://holidays-jp.github.io/api/v1/date.json");
	const data = await res.json();
	holidaysCache = Object.keys(data);
	return holidaysCache;
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

	const refreshLinks = async () => {
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
					type: "train",
				},
				{
					label: "バス（南宮崎駅前通 → 橘通り3丁目）",
					href: busLink1,
					type: "bus",
				},
				{
					label: "バス（南宮崎駅前通 → 宮崎ナナイロ前）",
					href: busLink2,
					type: "bus",
				},
				{
					label: "バス（宮崎駅 → 山形屋デパート前）",
					href: busLink3,
					type: "unUsed",
				},
			],
			returning: [
				{
					label: "電車（宮崎駅 → 南宮崎駅）",
					href: trainLink2,
					type: "train",
				},
				{
					label: "バス（橘通り3丁目 → 宮交シティ）",
					href: busLink4,
					type: "bus",
				},
				{
					label: "バス（カリーノ前 → 宮崎駅）",
					href: busLink5,
					type: "unUsed",
				},
			],
		});
	};

	// biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
	useEffect(() => {
		refreshLinks().then(() => setTime(new Date()));
		const handleVisibilityChange = () => {
			if (document.visibilityState === "visible") {
				refreshLinks().then(() => setTime(new Date()));
			}
		};
		document.addEventListener("visibilitychange", handleVisibilityChange);
		return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
	}, []);

	return (
		<div className="container">
			<h1>{time.toLocaleString()}</h1>
			<LinkSection title="行き" links={links.going} />
			<LinkSection title="帰り" links={links.returning} />
		</div>
	);
};

const LinkSection: React.FC<{
	title: string;
	links: LinkData[];
}> = ({ title, links }) => (
	<div className="section">
		<h2>{title}</h2>
		{links.map((link) => (
			<a
				key={link.href}
				href={link.href}
				target="_blank"
				rel="noopener noreferrer"
				className={`link ${link.type}`}
			>
				{link.label}
			</a>
		))}
	</div>
);

export default App;
