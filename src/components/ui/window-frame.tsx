import type { ReactNode } from "react";

type WindowFrameProps = {
  children: ReactNode;
  id?: string;
  subtitle?: string;
  title: string;
};

export function WindowFrame({
  children,
  id,
  subtitle,
  title,
}: WindowFrameProps) {
  return (
    <section id={id} className="section-anchor win95-panel">
      <div className="win95-titlebar flex items-center justify-between gap-3 px-4 py-3 text-white">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex items-center gap-1.5">
            <span className="h-3 w-3 rounded-full border border-white/45 bg-[#f8db66]" />
            <span className="h-3 w-3 rounded-full border border-white/45 bg-[#92e782]" />
            <span className="h-3 w-3 rounded-full border border-white/45 bg-[#9ee3ff]" />
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-bold uppercase tracking-[0.2em]">
              {title}
            </p>
            {subtitle ? (
              <p className="truncate text-xs text-white/85">{subtitle}</p>
            ) : null}
          </div>
        </div>

        <div className="hidden rounded-[8px] bg-white/15 px-2 py-1 text-[0.68rem] font-semibold uppercase tracking-[0.18em] sm:block">
          online
        </div>
      </div>

      <div className="p-4 sm:p-6">{children}</div>
    </section>
  );
}
