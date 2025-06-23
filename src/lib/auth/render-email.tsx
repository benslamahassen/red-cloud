"use client";

import { render } from "@react-email/render";
import { use } from "react";

export const RenderEmail = ({ children }: { children: React.ReactNode }) => {
	const element = <>{children}</>;
	const html = render(element);
	const htmlString = use(html);
	// biome-ignore lint/security/noDangerouslySetInnerHtml: Necessary workaround for RSC compliance
	return <div dangerouslySetInnerHTML={{ __html: htmlString }} />;
};
