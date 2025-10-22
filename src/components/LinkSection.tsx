import { memo, type FC } from "react";
import type { LinkData } from "../types";

interface LinkSectionProps {
	title: string;
	links: LinkData[];
}

const splitRouteLabel = (label: string): { from: string; to: string } => {
	const [rawFrom = label, rawTo = ""] = label.split("→");
	return {
		from: rawFrom.trim(),
		to: rawTo.trim(),
	};
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
				{links.map((link) => {
					const { from, to } = splitRouteLabel(link.label);
					const hasDestination = to.length > 0;
					return (
						<li key={link.href}>
							<a
								href={link.href}
								target="_blank"
								rel="noopener noreferrer"
								className={`link-card link-${link.type}`}
							>
								<span className="link-route">
									<span className="route-text route-from">{from}</span>
									{hasDestination ? (
										<>
											<span className="route-arrow" aria-hidden="true">
												→
											</span>
											<span className="route-text route-to">{to}</span>
										</>
									) : null}
								</span>
							</a>
						</li>
					);
				})}
			</ul>
			)}
		</section>
	);
});

export default LinkSection;
