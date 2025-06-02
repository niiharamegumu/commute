import type { LINK_TYPE } from "./constants";

export type LinkType = (typeof LINK_TYPE)[keyof typeof LINK_TYPE];

export type LinkData = {
	label: string;
	href: string;
	type: LinkType;
};

export type BusRouteConfig = {
	from: string;
	to: string;
	label: string;
	type: LinkType;
};
