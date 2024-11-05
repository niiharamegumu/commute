import React from "react";
import "./App.css";

const getTrainLink = (direction: "going" | "returning"): string => {
  const now = new Date();
  const year = now.getFullYear();
  const month = (now.getMonth() + 1).toString().padStart(2, "0");
  const day = now.getDate().toString().padStart(2, "0");

  const baseUrl =
    direction === "going"
      ? "https://www.jorudan.co.jp/time/to/%E5%8D%97%E5%AE%AE%E5%B4%8E_%E5%AE%AE%E5%B4%8E/?r=%E6%97%A5%E8%B1%8A%E6%9C%AC%E7%B7%9A"
      : "https://www.jorudan.co.jp/time/to/%E5%AE%AE%E5%B4%8E_%E5%8D%97%E5%AE%AE%E5%B4%8E/?r=%E6%97%A5%E8%B1%8A%E6%9C%AC%E7%B7%9A";

  return `${baseUrl}&Dym=${year}${month}&Ddd=${day}`;
};

const getBusLink = (from: string, to: string, direction: string): string => {
  const now = new Date();
  const hour = now.getHours();
  const minutes = now.getMinutes();

  return `https://qbus.jp/cgi-bin/time/jun.exe?pwd=h%2Fjun.pwd&from=${from}&to=${to}&kai=${direction}&yobi=0&ji=${hour}&fun=${minutes}`;
};

type LinkData = {
  label: string;
  href: string;
  type: "train" | "bus";
};

const goingLinks: LinkData[] = [
  {
    label: "電車リンク（行き）",
    href: getTrainLink("going"),
    type: "train",
  },
  {
    label: "バスリンク（行き・現在時刻に応じた検索）",
    href: getBusLink("000LM0001", "000LM3002", "O"),
    type: "bus",
  },
];

const returningLinks: LinkData[] = [
  {
    label: "電車リンク（帰り）",
    href: getTrainLink("returning"),
    type: "train",
  },
  {
    label: "バスリンク（帰り・現在時刻に応じた検索）",
    href: getBusLink("000G00129", "000LM0001", "N"),
    type: "bus",
  },
];

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

const App: React.FC = () => {
  return (
    <div className="container">
      <h1>各種交通リンク</h1>
      <LinkSection title="行き" links={goingLinks} />
      <LinkSection title="帰り" links={returningLinks} />
    </div>
  );
};

export default App;
