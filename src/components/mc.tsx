"use client";

/* MC UI primitives — semua pakai aset tekstur asli (public/mc/gui).
   Dipakai di layout portofolio web dengan tema Minecraft. */

import {
  useState,
  type ButtonHTMLAttributes,
  type ReactNode,
} from "react";

export function PixelImg({
  src,
  alt = "",
  className = "",
  style,
  width,
  height,
}: {
  src: string;
  alt?: string;
  className?: string;
  style?: React.CSSProperties;
  width?: number | string;
  height?: number | string;
}) {
  return (
    <img
      src={src}
      alt={alt}
      width={width}
      height={height}
      draggable={false}
      className={`pixelated select-none ${className}`}
      style={style}
    />
  );
}

/* ---------- Button (real 3-state widget texture) ---------- */
type BtnProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  width?: number | string;
  size?: "md" | "lg" | "sm";
  disabledTone?: boolean;
};

export function MCButton({
  children,
  width = 320,
  size = "md",
  className = "",
  style,
  disabled,
  onMouseEnter,
  ...rest
}: BtnProps) {
  const [hover, setHover] = useState(false);
  const bg = disabled
    ? "/mc/gui/button_disabled.png"
    : hover
      ? "/mc/gui/button_highlighted.png"
      : "/mc/gui/button.png";
  const font =
    size === "lg" ? "text-[19px]" : size === "sm" ? "text-[13px]" : "text-[16px]";
  return (
    <button
      {...rest}
      disabled={disabled}
      onMouseEnter={(e) => {
        setHover(true);
        onMouseEnter?.(e);
      }}
      onMouseLeave={() => setHover(false)}
      className={`mc-font mc-focus relative min-w-[44px] ${font} ${
        disabled ? "text-[#a0a0a0]" : "text-white"
      } mc-sh px-3 py-[7px] ${className}`}
      style={{
        width,
        background: "transparent",
        border: "none",
        cursor: disabled ? "default" : "pointer",
        imageRendering: "pixelated",
        ...style,
      }}
    >
      <span
        aria-hidden
        className="absolute inset-0 -z-10"
        style={{
          backgroundImage: `url(${bg})`,
          backgroundSize: "100% 100%",
          imageRendering: "pixelated",
        }}
      />
      <span className="relative z-10 inline-flex items-center justify-center gap-2 whitespace-nowrap">
        {children}
      </span>
    </button>
  );
}

/* ---------- Panel (container ala kartu tooltip lebar) ---------- */
export function MCPanel({
  children,
  className = "",
  style,
}: {
  children: ReactNode;
  className?: string;
  style?: React.CSSProperties;
}) {
  return (
    <div
      className={`relative border-2 border-[#00000066] bg-[rgba(16,16,16,0.82)] shadow-[inset_0_0_0_2px_rgba(255,255,255,0.09)] ${className}`}
      style={style}
    >
      {children}
    </div>
  );
}

/* ---------- MC Tooltip (hover; pointer-fine only) ---------- */
export function MCTooltip({
  children,
  title,
  lines,
  titleColor = "#ffffff",
}: {
  children: ReactNode;
  title?: string;
  lines?: (string | { text: string; color?: string })[];
  titleColor?: string;
}) {
  const [pos, setPos] = useState<{ x: number; y: number; w: number } | null>(null);
  return (
    <div
      className="relative"
      onMouseMove={(e) => {
        const r = (e.currentTarget as HTMLElement).getBoundingClientRect();
        setPos({ x: e.clientX - r.left, y: e.clientY - r.top, w: r.width });
      }}
      onMouseLeave={() => setPos(null)}
    >
      {children}
      {pos && (
        <div
          role="tooltip"
          className="mc-tooltip mc-font pointer-events-none absolute z-50 max-w-[280px] px-2 py-1.5 text-[14px] leading-[1.35] hidden [@media(hover:hover)]:block"
          style={{
            left: Math.min(pos.x + 14, Math.max(60, pos.w - 40)),
            top: pos.y + 18,
          }}
        >
          {title && (
            <div className="mc-sh-soft" style={{ color: titleColor }}>
              {title}
            </div>
          )}
          {lines?.map((l, i) => (
            <div
              key={i}
              className="mc-sh-soft"
              style={{
                color:
                  typeof l === "string" ? "#a8a8a8" : l.color ?? "#a8a8a8",
                fontStyle: typeof l === "string" ? "italic" : "normal",
              }}
            >
              {typeof l === "string" ? l : l.text}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ---------- Item icon ---------- */
export function ItemIcon({
  src,
  size = 32,
  alt = "",
  className = "",
}: {
  src: string;
  size?: number;
  alt?: string;
  className?: string;
}) {
  return <PixelImg src={src} alt={alt} width={size} height={size} className={className} />;
}
