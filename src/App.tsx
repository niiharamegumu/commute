import React, { useEffect, useState } from "react";
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

const busDayType = {
  weekday: 0,
  saturday: 1,
  holiday: 2,
};

const dayToBusTypeMapping: { [key: number]: number } = {
  0: busDayType.holiday,
  1: busDayType.weekday,
  2: busDayType.weekday,
  3: busDayType.weekday,
  4: busDayType.weekday,
  5: busDayType.weekday,
  6: busDayType.saturday,
};

const trainStations = {
  minamimiyazaki: "南宮崎",
  miyazaki: "宮崎",
};

let holidaysCache: string[] | null = null;
const getHolidays = async (): Promise<string[]> => {
  if (holidaysCache) return holidaysCache;
  const res = await fetch("https://holidays-jp.github.io/api/v1/date.json");
  const data = await res.json();
  holidaysCache = Object.keys(data);
  return holidaysCache;
};

const getBusDayTypeFromDate = (date: Date): number => {
  const dayOfWeek = date.getDay();
  return dayToBusTypeMapping[dayOfWeek];
};

const getTrainLink = (from: string, to: string): string => {
  const now = new Date();
  const year = now.getFullYear();
  const month = (now.getMonth() + 1).toString().padStart(2, "0");
  const day = now.getDate().toString().padStart(2, "0");
  const hours = now.getHours();
  const enFrom = encodeURIComponent(from);
  const enTo = encodeURIComponent(to);
  const enR = encodeURIComponent("日豊本線");
  return `https://www.jorudan.co.jp/time/to/${enFrom}_${enTo}/?r=${enR}&Dym=${year}${month}&Ddd=${day}#time${hours}w`;
};

const getBusLink = async (from: string, to: string): Promise<string> => {
  const now = new Date();
  const hour = now.getHours();
  const minutes = now.getMinutes();
  let busType = getBusDayTypeFromDate(now);
  const isHoliday = (await getHolidays()).includes(
    now.toISOString().split("T")[0]
  );
  if (isHoliday) {
    busType = busDayType.holiday;
  }
  return `https://qbus.jp/cgi-bin/time/jun.exe?pwd=h%2Fjun.pwd&from=${from}&to=${to}&kai=N&yobi=${busType}&ji=${hour}&fun=${minutes}`;
};

const App: React.FC = () => {
  const [goingLinks, setGoingLinks] = useState<LinkData[]>([]);
  const [returningLinks, setReturningLinks] = useState<LinkData[]>([]);
  const [time, setTime] = useState(new Date());

  const refreshLinks = async () => {
    const trainLink1 = getTrainLink(
      trainStations.minamimiyazaki,
      trainStations.miyazaki
    );
    const trainLink2 = getTrainLink(
      trainStations.miyazaki,
      trainStations.minamimiyazaki
    );
    const busLink1 = await getBusLink(
      busStops.minamimiyazaki_ekimaedori,
      busStops.tachibana_3_chome
    );
    const busLink2 = await getBusLink(
      busStops.minamimiyazaki_ekimaedori,
      busStops.nanairo_mae
    );
    const busLink3 = await getBusLink(
      busStops.miyazaki_eki,
      busStops.depato_mae
    );
    const busLink4 = await getBusLink(
      busStops.tachibana_3_chome,
      busStops.miyako_city
    );
    const busLink5 = await getBusLink(
      busStops.karino_mae,
      busStops.miyazaki_eki
    );

    setGoingLinks([
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
    ]);

    setReturningLinks([
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
    ]);
  };

  useEffect(() => {
    (async () => {
      await refreshLinks();
      setTime(new Date());
    })();

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        (async () => {
          await refreshLinks();
          setTime(new Date());
        })();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  return (
    <div className="container">
      <h1>{time.toLocaleString()}</h1>
      <LinkSection title="行き" links={goingLinks} />
      <LinkSection title="帰り" links={returningLinks} />
    </div>
  );
};

const LinkSection: React.FC<{ title: string; links: LinkData[] }> = ({
  title,
  links,
}) => (
  <div className="section">
    <h2>{title}</h2>
    {links.map((link, index) => (
      <a
        key={index}
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
