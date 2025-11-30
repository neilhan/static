import type { CSSProperties, JSX } from "react";

type IconSize = "sm" | "md" | "lg" | "xl";

const sizeMap: Record<IconSize, number> = {
  sm: 16,
  md: 20,
  lg: 28,
  xl: 36,
};

export type IconGraphicProps = {
  svgMarkup: string;
  size?: IconSize;
  className?: string;
  title?: string;
  style?: CSSProperties;
};

export const IconGraphic = ({
  svgMarkup,
  size = "md",
  className = "",
  title,
  style,
}: IconGraphicProps): JSX.Element => {
  const dimension = sizeMap[size];
  const combinedStyle: CSSProperties = {
    display: "inline-flex",
    width: `${dimension}px`,
    height: `${dimension}px`,
    color: "currentColor",
    flexShrink: 0,
    ...style,
  };

  const ariaProps = title
    ? { role: "img" as const, "aria-label": title }
    : { "aria-hidden": true };

  const classAttr = className.trim();

  return (
    <span
      className={classAttr || undefined}
      style={combinedStyle}
      {...ariaProps}
      dangerouslySetInnerHTML={{ __html: svgMarkup }}
    />
  );
};


