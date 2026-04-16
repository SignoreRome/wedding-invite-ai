import type { CSSProperties, ReactNode } from 'react';

type SetupStep = {
  active?: boolean;
  index: string;
  title: string;
};

type SetupWizardShellProps = {
  children: ReactNode;
  note: string;
  steps: readonly SetupStep[];
  title: string;
  versionLabel: string;
};

type SetupSectionProps = {
  accentColor?: string;
  children: ReactNode;
  className?: string;
  id?: string;
  title: string;
};

type SetupCardProps = {
  children: ReactNode;
  className?: string;
  eyebrow?: string;
  title?: string;
};

type XpButtonProps = {
  children: ReactNode;
  className?: string;
  href?: string;
  secondary?: boolean;
  type?: 'button' | 'reset' | 'submit';
};

const chromeButtons = ['_', '□', '×'] as const;
const menuItems = ['Файл', 'Правка', 'Вид', 'Справка'] as const;

function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(' ');
}

export function SetupWizardShell({
  children,
  note,
  steps,
  title,
  versionLabel,
}: SetupWizardShellProps) {
  return (
    <div className="overflow-hidden rounded-[6px] border-t-2 border-l-2 border-r-2 border-b-2 border-t-white border-l-white border-r-[#404040] border-b-[#404040] bg-[#d4d0c8] shadow-[10px_10px_0_rgba(0,0,0,0.22)]">
      <div className="flex items-center justify-between gap-3 bg-gradient-to-r from-[#0054e3] via-[#2b7cff] to-[#67a7ff] px-3 py-2 text-sm font-bold text-white">
        <span className="truncate text-sm font-bold">{title}</span>

        <div className="flex shrink-0 gap-1">
          {chromeButtons.map((buttonLabel) => (
            <button
              key={buttonLabel}
              aria-hidden="true"
              className="flex h-5 w-5 items-center justify-center border border-t-white border-l-white border-r-[#404040] border-b-[#404040] bg-[#d4d0c8] text-xs leading-none text-black"
              type="button"
            >
              {buttonLabel}
            </button>
          ))}
        </div>
      </div>

      <div className="border-b border-[#808080] bg-[#ece9d8] px-3 py-1 text-sm">
        <div className="flex flex-wrap gap-4 text-[#2c2c2c]">
          {menuItems.map((item) => (
            <span key={item} className="cursor-default hover:underline">
              {item}
            </span>
          ))}
        </div>
      </div>

      <div className="grid lg:min-h-[820px] lg:grid-cols-[250px_1fr]">
        <aside className="border-b border-[#7a7a7a] bg-gradient-to-b from-[#0b5bd3] to-[#7fb2ff] p-5 text-white lg:border-b-0 lg:border-r">
          <div className="rounded-[4px] border border-white/40 bg-white/10 p-4">
            <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center border-2 border-white/70 bg-white text-5xl font-bold text-[#d40000] shadow-[inset_1px_1px_0_rgba(255,255,255,0.6)]">
              ♥
            </div>

            <div className="text-center">
              <p className="text-xl font-black uppercase leading-tight tracking-wide">
                Wedding
                <br />
                Setup
              </p>
              <p className="mt-2 hidden text-xs text-white/90 lg:block">
                Версия {versionLabel}
              </p>
            </div>
          </div>

          <div className="mt-6 hidden space-y-3 text-sm lg:block">
            {steps.map((step) => (
              <SetupWizardStep key={step.index} {...step} />
            ))}
          </div>

          <div className="mt-8 hidden whitespace-pre-line rounded-[4px] border border-white/40 bg-[#ffffff22] p-3 text-xs leading-relaxed text-white/95 lg:block">
            {note}
          </div>
        </aside>

        <main className="min-w-0 space-y-5 bg-[#ece9d8] p-4 md:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}

export function SetupSection({
  accentColor = '#2b63d9',
  children,
  className,
  id,
  title,
}: SetupSectionProps) {
  return (
    <section
      id={id}
      className={cn(
        'section-anchor border border-[#7f9db9] bg-[#f8f8f8]',
        className,
      )}
    >
      <div className="flex items-center gap-2 border-b border-[#c7c7c7] bg-gradient-to-r from-white to-[#eef3ff] px-4 py-3">
        <span
          aria-hidden="true"
          className="h-3 w-3 shrink-0 border border-[#404040]"
          style={{ backgroundColor: accentColor } as CSSProperties}
        />
        <h2 className="text-lg font-black tracking-wide text-black md:text-xl">
          {title}
        </h2>
      </div>

      <div className="p-4">{children}</div>
    </section>
  );
}

export function SetupCard({
  children,
  className,
  eyebrow,
  title,
}: SetupCardProps) {
  return (
    <div
      className={cn(
        'border border-[#7f9db9] bg-[#fdfdfd] p-4 shadow-[inset_1px_1px_0_white]',
        className,
      )}
    >
      {eyebrow || title ? (
        <div className="mb-3">
          {eyebrow ? (
            <p className="text-xs uppercase text-[#555]">{eyebrow}</p>
          ) : null}
          {title ? (
            <h3 className="mt-1 text-xl font-bold text-black">{title}</h3>
          ) : null}
        </div>
      ) : null}

      {children}
    </div>
  );
}

export function XpButton({
  children,
  className,
  href,
  secondary = false,
  type = 'button',
}: XpButtonProps) {
  const classes = cn(
    'rounded-[3px] border border-t-white border-l-white border-r-[#404040] border-b-[#404040] px-5 py-2 text-sm font-bold',
    secondary ? 'bg-[#e7e7e7]' : 'bg-[#d4e7ff]',
    className,
  );

  if (href) {
    return (
      <a className={classes} href={href}>
        {children}
      </a>
    );
  }

  return (
    <button className={classes} type={type}>
      {children}
    </button>
  );
}

function SetupWizardStep({ active = false, index, title }: SetupStep) {
  return (
    <div
      className={cn(
        'flex items-center gap-3 border px-3 py-2',
        active
          ? 'border-white bg-white text-[#003399]'
          : 'border-white/40 bg-white/15 text-white',
      )}
    >
      <div
        className={cn(
          'flex h-8 w-8 items-center justify-center border text-xs font-black',
          active
            ? 'border-[#7f9db9] bg-[#eaf2ff]'
            : 'border-white/40 bg-white/15',
        )}
      >
        {index}
      </div>
      <div className="font-bold">{title}</div>
    </div>
  );
}
