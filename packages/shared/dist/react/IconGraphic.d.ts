import type { CSSProperties, JSX } from "react";
type IconSize = "sm" | "md" | "lg" | "xl";
export type IconGraphicProps = {
    svgMarkup: string;
    size?: IconSize;
    className?: string;
    title?: string;
    style?: CSSProperties;
};
export declare const IconGraphic: ({ svgMarkup, size, className, title, style, }: IconGraphicProps) => JSX.Element;
export {};
//# sourceMappingURL=IconGraphic.d.ts.map