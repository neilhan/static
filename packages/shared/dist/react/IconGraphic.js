import { jsx as _jsx } from "react/jsx-runtime";
const sizeMap = {
    sm: 16,
    md: 20,
    lg: 28,
    xl: 36,
};
export const IconGraphic = ({ svgMarkup, size = "md", className = "", title, style, }) => {
    const dimension = sizeMap[size];
    const combinedStyle = {
        display: "inline-flex",
        width: `${dimension}px`,
        height: `${dimension}px`,
        color: "currentColor",
        flexShrink: 0,
        ...style,
    };
    const ariaProps = title
        ? { role: "img", "aria-label": title }
        : { "aria-hidden": true };
    const classAttr = className.trim();
    return (_jsx("span", { className: classAttr || undefined, style: combinedStyle, ...ariaProps, dangerouslySetInnerHTML: { __html: svgMarkup } }));
};
