import type { LINK_TYPE } from "./constants";

export type LinkType = (typeof LINK_TYPE)[keyof typeof LINK_TYPE];

export type LinkData = {
	label: string;
	href: string;
	type: LinkType;
	fromLabel: string;
	toLabel: string;
};

export type BusRouteConfig = {
	from: string;
	to: string;
	label: string;
	fromLabel: string;
	toLabel: string;
	type: LinkType;
};
