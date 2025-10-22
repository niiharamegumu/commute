import { memo, type FC } from "react";
import type { LinkData } from "../types";

interface LinkSectionProps {
	title: string;
	links: LinkData[];
}

const TYPE_LABELS: Record<LinkData["type"], string> = {
	train: "電車",
	bus: "バス",
	unUsed: "予備",
};

const LinkSection: FC<LinkSectionProps> = memo(({ title, links }) => {
	return (
		<section className="section">
			<header className="section-header">
				<h2>{title}</h2>
			</header>
			{links.length === 0 ? (
				<p className="empty-message">リンクがありません</p>
			) : (
				<ul className="link-list">
					{links.map((link) => (
						<li key={link.href}>
							<a
								href={link.href}
								target="_blank"
								rel="noopener noreferrer"
								className={`link-card link-${link.type}`}
							>
								<span className={`link-tag tag-${link.type}`}>{TYPE_LABELS[link.type]}</span>
								<span className="link-route">
									<span className="route-text route-from">{link.fromLabel}</span>
									<span className="route-arrow" aria-hidden="true">
										→
									</span>
									<span className="route-text route-to">{link.toLabel}</span>
								</span>
							</a>
						</li>
					))}
				</ul>
			)}
		</section>
	);
});

export default LinkSection;
