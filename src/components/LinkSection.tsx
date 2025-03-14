import React from "react";
import type { LinkData } from "../types";

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

export default LinkSection;
