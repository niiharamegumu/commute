import React, { useEffect, useState } from "react";
import "./App.css";

type LinkData = {
  label: string;
  href: string;
  type: "train" | "bus";
};

const busStops = {
  miyazaki_eki: "000LM0001",
  depato_mae: "000LM3002",
  karino_mae: "000G00129",
  minamimiyazaki_ekimaedori: "011000002",
  tachibana_3_chome: "011000008",
  miyako_city: "000LM0002",
};

const trainStations = {
  minamimiyazaki: "南宮崎",
  miyazaki: "宮崎",
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

const getBusLink = (from: string, to: string): string => {
  const now = new Date();
  const hour = now.getHours();
  const minutes = now.getMinutes();

  return `https://qbus.jp/cgi-bin/time/jun.exe?pwd=h%2Fjun.pwd&from=${from}&to=${to}&kai=N&yobi=0&ji=${hour}&fun=${minutes}`;
};

const App: React.FC = () => {
  const [goingLinks, setGoingLinks] = useState<LinkData[]>([]);
  const [returningLinks, setReturningLinks] = useState<LinkData[]>([]);
  const [time, setTime] = useState(new Date());

  const refreshLinks = () => {
    setGoingLinks([
      {
        label: "電車（南宮崎駅→宮崎駅）",
        href: getTrainLink(
          trainStations.minamimiyazaki,
          trainStations.miyazaki
        ),
        type: "train",
      },
      {
        label: "バス（宮崎駅→山形屋デパート前）",
        href: getBusLink(busStops.miyazaki_eki, busStops.depato_mae),
        type: "bus",
      },
      {
        label: "バス（南宮崎駅前通→橘通り3丁目）",
        href: getBusLink(
          busStops.minamimiyazaki_ekimaedori,
          busStops.tachibana_3_chome
        ),
        type: "bus",
      },
    ]);

    setReturningLinks([
      {
        label: "電車（宮崎駅→南宮崎駅）",
        href: getTrainLink(
          trainStations.miyazaki,
          trainStations.minamimiyazaki
        ),
        type: "train",
      },
      {
        label: "バス（カリーノ前→宮崎駅）",
        href: getBusLink(busStops.karino_mae, busStops.miyazaki_eki),
        type: "bus",
      },
      {
        label: "バス（橘通り3丁目→宮交シティ）",
        href: getBusLink(busStops.tachibana_3_chome, busStops.miyako_city),
        type: "bus",
      },
    ]);
  };

  useEffect(() => {
    refreshLinks();
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        refreshLinks();
        setTime(new Date());
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
