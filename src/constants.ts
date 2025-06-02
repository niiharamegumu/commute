export const LINK_TYPE = {
	TRAIN: "train",
	BUS: "bus",
	UNUSED: "unUsed",
} as const;

export const busStops = {
	miyazaki_eki: "000LM0001",
	depato_mae: "000LM3002",
	karino_mae: "000G00129",
	minamimiyazaki_ekimaedori: "011000002",
	tachibana_3_chome: "011000008",
	tachibana_1_chome: "000G00128",
	miyako_city: "000LM0002",
	nanairo_mae: "011009001",
} as const;

export const trainStations = {
	minamimiyazaki: "南宮崎",
	miyazaki: "宮崎",
} as const;

export const BUS_TYPE = {
	weekday: 0,
	saturday: 1,
	holiday: 2,
} as const;

export const dayToBusType: {
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
