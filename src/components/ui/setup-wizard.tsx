'use client';

import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from 'react';

type SetupStep = {
  active?: boolean;
  index: string;
  targetId: string;
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
  disabled?: boolean;
  href?: string;
  secondary?: boolean;
  type?: 'button' | 'reset' | 'submit';
};

type SetupWizardStepProps = SetupStep & {
  active: boolean;
  onActivate: (targetId: string) => void;
};

type WindowMode = 'normal' | 'maximized' | 'minimized';
type DialogMode = 'accessDenied' | 'closeConfirm' | null;

type MenuItem = {
  alt: string;
  label: string;
  photoSrc: string;
  title: string;
};

type DesktopShortcut = {
  iconSrc: string;
  label: string;
};

const menuItems: readonly MenuItem[] = [
  {
    alt: 'Кот рядом с клавиатурой',
    label: 'Файл',
    photoSrc: '/cat-photos/file-cat.jpg',
    title: 'Файл - cat.jpg',
  },
  {
    alt: 'Кот спит на кресле',
    label: 'Правка',
    photoSrc: '/cat-photos/edit-cat.jpg',
    title: 'Правка - cat.jpg',
  },
  {
    alt: 'Кот под пледом рядом с человеком',
    label: 'Вид',
    photoSrc: '/cat-photos/view-cat.jpg',
    title: 'Вид - cat.jpg',
  },
  {
    alt: 'Кот лежит на белом постельном белье',
    label: 'Справка',
    photoSrc: '/cat-photos/help-cat.jpg',
    title: 'Справка - cat.jpg',
  },
] as const;

const desktopShortcuts: readonly DesktopShortcut[] = [
  { iconSrc: '/desktop-icons/recycle-bin.png', label: 'Корзина' },
  { iconSrc: '/desktop-icons/my-computer.png', label: 'Мой компьютер' },
  { iconSrc: '/desktop-icons/counter-strike.png', label: 'CS1.6' },
  { iconSrc: '/desktop-icons/half-life-2.png', label: 'Half-Life 2' },
  { iconSrc: '/desktop-icons/doom-3.png', label: 'Doom 3' },
  { iconSrc: '/desktop-icons/diablo-2.png', label: 'Diablo II' },
  { iconSrc: '/desktop-icons/fallout.png', label: 'Fallout' },
  { iconSrc: '/desktop-icons/morrowind.png', label: 'Morrowind' },
  { iconSrc: '/desktop-icons/nfs.png', label: 'NFS' },
  { iconSrc: '/desktop-icons/paint.png', label: 'Paint' },
  { iconSrc: '/desktop-icons/solitaire.png', label: 'Солитер' },
  { iconSrc: '/desktop-icons/flash.png', label: 'Flash Player' },
] as const;

function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(' ');
}

function areStepIdsEqual(first: readonly string[], second: readonly string[]) {
  return (
    first.length === second.length &&
    first.every((stepId, index) => stepId === second[index])
  );
}

function getInitialActiveStepIds(steps: readonly SetupStep[]) {
  const initialStep = steps.find((step) => step.active) ?? steps[0];

  return initialStep ? [initialStep.targetId] : [];
}

export function SetupWizardShell({
  children,
  note,
  steps,
  title,
  versionLabel,
}: SetupWizardShellProps) {
  const sectionIds = useMemo(() => steps.map((step) => step.targetId), [steps]);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [activeStepIds, setActiveStepIds] = useState<readonly string[]>(() =>
    getInitialActiveStepIds(steps),
  );
  const [windowMode, setWindowMode] = useState<WindowMode>('normal');
  const [dialogMode, setDialogMode] = useState<DialogMode>(null);
  const [activeMenuPhoto, setActiveMenuPhoto] = useState<MenuItem | null>(null);
  const [showBlueScreen, setShowBlueScreen] = useState(false);

  useEffect(() => {
    if (sectionIds.length === 0) {
      return;
    }

    let animationFrameId: number | null = null;

    const updateActiveSteps = () => {
      const viewportMarker = window.innerHeight * 0.35;
      const visibleStepIds: string[] = [];
      let fallbackStepId = sectionIds[0];
      let closestPreviousTop = Number.NEGATIVE_INFINITY;

      for (const sectionId of sectionIds) {
        const section = document.getElementById(sectionId);

        if (!section) {
          continue;
        }

        const rect = section.getBoundingClientRect();

        if (rect.top <= viewportMarker && rect.bottom >= viewportMarker) {
          visibleStepIds.push(sectionId);
        }

        if (rect.top <= viewportMarker && rect.top > closestPreviousTop) {
          fallbackStepId = sectionId;
          closestPreviousTop = rect.top;
        }
      }

      const nextActiveStepIds =
        visibleStepIds.length > 0 ? visibleStepIds : [fallbackStepId];

      setActiveStepIds((currentStepIds) =>
        areStepIdsEqual(currentStepIds, nextActiveStepIds)
          ? currentStepIds
          : nextActiveStepIds,
      );
    };

    const scheduleUpdate = () => {
      if (animationFrameId !== null) {
        return;
      }

      animationFrameId = window.requestAnimationFrame(() => {
        animationFrameId = null;
        updateActiveSteps();
      });
    };

    const scrollTargets: EventTarget[] = [window];

    if (scrollContainerRef.current) {
      scrollTargets.push(scrollContainerRef.current);
    }

    updateActiveSteps();
    scrollTargets.forEach((target) => {
      target.addEventListener('scroll', scheduleUpdate, { passive: true });
    });
    window.addEventListener('resize', scheduleUpdate);

    return () => {
      if (animationFrameId !== null) {
        window.cancelAnimationFrame(animationFrameId);
      }

      scrollTargets.forEach((target) => {
        target.removeEventListener('scroll', scheduleUpdate);
      });
      window.removeEventListener('resize', scheduleUpdate);
    };
  }, [sectionIds, windowMode]);

  const handleActivateStep = (targetId: string) => {
    setActiveStepIds([targetId]);

    if (windowMode !== 'maximized') {
      return;
    }

    document.getElementById(targetId)?.scrollIntoView({
      block: 'start',
      behavior: 'smooth',
    });
  };

  const handleMinimize = () => {
    setDialogMode(null);
    setActiveMenuPhoto(null);
    setWindowMode('minimized');
  };

  const handleToggleMaximize = () => {
    setWindowMode((currentMode) =>
      currentMode === 'maximized' ? 'normal' : 'maximized',
    );
  };

  const handleRestore = () => {
    setWindowMode('normal');
  };

  const handleCloseRequest = () => {
    setActiveMenuPhoto(null);
    setDialogMode('closeConfirm');
  };

  if (showBlueScreen) {
    return <WindowsXpBlueScreen />;
  }

  return (
    <>
      {windowMode === 'minimized' ? (
        <DesktopSurface
          onOpenShortcut={() => setDialogMode('accessDenied')}
          onRestore={handleRestore}
          title={title}
        />
      ) : (
        <div
          className={cn(
            'overflow-clip rounded-[6px] border-t-2 border-l-2 border-r-2 border-b-2 border-t-white border-l-white border-r-[#404040] border-b-[#404040] bg-[#d4d0c8] shadow-[10px_10px_0_rgba(0,0,0,0.22)]',
            windowMode === 'maximized'
              ? 'fixed inset-0 z-30 flex h-[100dvh] flex-col rounded-none border-0 shadow-none'
              : 'relative z-10',
          )}
        >
          <div className="flex items-center justify-between gap-3 bg-gradient-to-r from-[#0054e3] via-[#2b7cff] to-[#67a7ff] px-3 py-2 text-sm font-bold text-white">
            <span className="truncate text-sm font-bold">{title}</span>

            <div className="flex shrink-0 gap-1">
              <button
                aria-label="Свернуть окно"
                className="flex h-8 w-8 items-center justify-center border border-t-white border-l-white border-r-[#404040] border-b-[#404040] bg-[#d4d0c8] text-base leading-none text-black active:border-t-[#404040] active:border-l-[#404040] active:border-r-white active:border-b-white sm:h-6 sm:w-6 sm:text-sm"
                onClick={handleMinimize}
                title="Свернуть"
                type="button"
              >
                _
              </button>
              <button
                aria-label={
                  windowMode === 'maximized'
                    ? 'Восстановить окно'
                    : 'Развернуть окно'
                }
                className="flex h-8 w-8 items-center justify-center border border-t-white border-l-white border-r-[#404040] border-b-[#404040] bg-[#d4d0c8] text-sm leading-none text-black active:border-t-[#404040] active:border-l-[#404040] active:border-r-white active:border-b-white sm:h-6 sm:w-6"
                onClick={handleToggleMaximize}
                title={
                  windowMode === 'maximized' ? 'Восстановить' : 'Развернуть'
                }
                type="button"
              >
                {windowMode === 'maximized' ? '❐' : '□'}
              </button>
              <button
                aria-label="Закрыть окно"
                className="flex h-8 w-8 items-center justify-center border border-t-white border-l-white border-r-[#404040] border-b-[#404040] bg-[#d4d0c8] text-lg leading-none text-black active:border-t-[#404040] active:border-l-[#404040] active:border-r-white active:border-b-white sm:h-6 sm:w-6 sm:text-base"
                onClick={handleCloseRequest}
                title="Закрыть"
                type="button"
              >
                ×
              </button>
            </div>
          </div>

          <div className="border-b border-[#808080] bg-[#ece9d8] px-3 py-1 text-sm">
            <div className="flex flex-wrap gap-1 text-[#2c2c2c] sm:gap-2">
              {menuItems.map((item) => (
                <a
                  key={item.label}
                  className="inline-flex min-h-10 items-center border border-transparent px-2 text-left hover:border-t-white hover:border-l-white hover:border-r-[#808080] hover:border-b-[#808080] hover:bg-[#d4d0c8] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[#0054e3] active:border-t-[#808080] active:border-l-[#808080] active:border-r-white active:border-b-white sm:min-h-7"
                  href={item.photoSrc}
                  onClick={(event) => {
                    event.preventDefault();
                    setDialogMode(null);
                    setActiveMenuPhoto(item);
                  }}
                >
                  {item.label}
                </a>
              ))}
            </div>
          </div>

          <div
            ref={scrollContainerRef}
            className={cn(
              'grid lg:min-h-[820px] lg:grid-cols-[250px_1fr]',
              windowMode === 'maximized' ? 'min-h-0 flex-1 overflow-y-auto' : '',
            )}
          >
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

              <div className="lg:sticky lg:top-8 lg:max-h-[calc(100vh-4rem)] lg:overflow-y-auto">
                <nav
                  aria-label="Разделы приглашения"
                  className="mt-6 hidden space-y-3 text-sm lg:block"
                >
                  {steps.map((step) => (
                    <SetupWizardStep
                      key={step.index}
                      {...step}
                      active={activeStepIds.includes(step.targetId)}
                      onActivate={handleActivateStep}
                    />
                  ))}
                </nav>

                <div className="mt-8 hidden whitespace-pre-line rounded-[4px] border border-white/40 bg-[#ffffff22] p-3 text-xs leading-relaxed text-white/95 lg:block">
                  {note}
                </div>
              </div>
            </aside>

            <main className="min-w-0 space-y-5 bg-[#ece9d8] p-4 md:p-6">
              {children}
            </main>
          </div>
        </div>
      )}

      {dialogMode === 'accessDenied' ? (
        <XpDialog
          body="Отказано в доступе, обратитесь к администратору"
          intent="error"
          onClose={() => setDialogMode(null)}
          title="Ошибка"
        >
          <button
            className="xp-button min-w-24 py-2"
            onClick={() => setDialogMode(null)}
            type="button"
          >
            OK
          </button>
        </XpDialog>
      ) : null}

      {dialogMode === 'closeConfirm' ? (
        <XpDialog
          body="Вы точно хотите закрыть окно? Все текущие данные будут потеряны"
          intent="warning"
          onClose={() => setDialogMode(null)}
          title="Предупреждение"
        >
          <button
            className="xp-button min-w-24 py-2"
            onClick={() => setShowBlueScreen(true)}
            type="button"
          >
            Да
          </button>
          <button
            className="xp-button xp-button--secondary min-w-24 py-2"
            onClick={() => setDialogMode(null)}
            type="button"
          >
            Нет
          </button>
        </XpDialog>
      ) : null}

      {activeMenuPhoto ? (
        <CatPhotoDialog
          alt={activeMenuPhoto.alt}
          onClose={() => setActiveMenuPhoto(null)}
          photoSrc={activeMenuPhoto.photoSrc}
          title={activeMenuPhoto.title}
        />
      ) : null}
    </>
  );
}

function CatPhotoDialog({
  alt,
  onClose,
  photoSrc,
  title,
}: {
  alt: string;
  onClose: () => void;
  photoSrc: string;
  title: string;
}) {
  return (
    <div
      aria-label={title}
      aria-modal="true"
      className="fixed inset-0 z-40 flex items-center justify-center bg-black/30 px-3 py-4 sm:px-4 sm:py-6"
      role="dialog"
    >
      <div className="flex max-h-[calc(100dvh-2rem)] w-full max-w-3xl flex-col overflow-hidden border-t-2 border-l-2 border-r-2 border-b-2 border-t-white border-l-white border-r-[#404040] border-b-[#404040] bg-[#d4d0c8] shadow-[8px_8px_0_rgba(0,0,0,0.3)]">
        <div className="flex items-center justify-between gap-3 bg-gradient-to-r from-[#0054e3] via-[#2b7cff] to-[#67a7ff] px-2 py-1.5 text-sm font-bold text-white">
          <span className="truncate">{title}</span>
          <button
            aria-label="Закрыть фотографию"
            className="flex h-8 w-8 items-center justify-center border border-t-white border-l-white border-r-[#404040] border-b-[#404040] bg-[#d4d0c8] text-lg leading-none text-black active:border-t-[#404040] active:border-l-[#404040] active:border-r-white active:border-b-white sm:h-6 sm:w-6 sm:text-base"
            onClick={onClose}
            type="button"
          >
            ×
          </button>
        </div>

        <div className="min-h-0 border-t border-white bg-[#ece9d8] p-2">
          <div className="max-h-[calc(100dvh-6.5rem)] overflow-auto border border-[#808080] bg-white p-1 shadow-[inset_1px_1px_0_rgba(0,0,0,0.22)]">
            <img
              alt={alt}
              className="mx-auto block h-auto max-h-[calc(100dvh-7.5rem)] w-full object-contain"
              draggable="false"
              src={photoSrc}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function DesktopSurface({
  onOpenShortcut,
  onRestore,
  title,
}: {
  onOpenShortcut: () => void;
  onRestore: () => void;
  title: string;
}) {
  return (
    <>
      <div className="fixed inset-0 z-10 overflow-hidden px-3 pt-3 pb-20 sm:px-4 sm:pt-4 md:p-8 md:pb-24">
        <div className="grid h-[calc(100dvh-5.75rem)] grid-flow-col grid-rows-4 auto-cols-[76px] content-start justify-start gap-x-2 gap-y-2 sm:h-[calc(100dvh-6rem)] sm:auto-cols-[84px] sm:gap-x-3 md:h-[calc(100dvh-8rem)] md:grid-rows-6 md:auto-cols-[96px] md:gap-x-4 md:gap-y-3">
          {desktopShortcuts.map((shortcut) => (
            <button
              key={shortcut.iconSrc}
              className="group flex h-[76px] w-[76px] flex-col items-center justify-start gap-1 rounded-[2px] px-1 py-1 text-center text-xs leading-tight text-white outline-none [text-shadow:1px_1px_0_rgba(0,0,0,0.75)] focus-visible:bg-[#0b5bd3]/70 sm:w-[84px] md:h-[82px] md:w-24"
              onClick={onOpenShortcut}
              type="button"
            >
              <img
                alt=""
                aria-hidden="true"
                className="h-12 w-12 object-contain [image-rendering:pixelated]"
                draggable="false"
                src={shortcut.iconSrc}
              />
              <span className="max-h-7 max-w-full overflow-hidden break-words px-1 group-hover:bg-[#0b5bd3]/80">
                {shortcut.label}
              </span>
            </button>
          ))}
        </div>
      </div>

      <div className="fixed inset-x-0 bottom-0 z-20 flex min-h-14 items-center gap-2 border-t border-[#7f9db9] bg-gradient-to-r from-[#1f6f1f] via-[#245edb] to-[#3a8dff] px-2 py-2 shadow-[0_-2px_0_rgba(255,255,255,0.35)]">
        <button
          className="shrink-0 rounded-[3px] border border-t-white border-l-white border-r-[#404040] border-b-[#404040] bg-[#35a835] px-4 py-2 text-sm font-black text-white shadow-[inset_1px_1px_0_rgba(255,255,255,0.45)] [text-shadow:1px_1px_0_rgba(0,0,0,0.55)]"
          type="button"
        >
          Start
        </button>
        <button
          className="min-w-0 flex-1 border border-t-white border-l-white border-r-[#0b2d6d] border-b-[#0b2d6d] bg-[#d4d0c8] px-3 py-2 text-left text-sm font-bold text-black shadow-[inset_1px_1px_0_white] sm:max-w-xs"
          onClick={onRestore}
          type="button"
        >
          <span className="block truncate">{title}</span>
        </button>
      </div>
    </>
  );
}

function XpDialog({
  body,
  children,
  intent,
  onClose,
  title,
}: {
  body: string;
  children: ReactNode;
  intent: 'error' | 'warning';
  onClose: () => void;
  title: string;
}) {
  return (
    <div
      aria-modal="true"
      className="fixed inset-0 z-40 flex items-center justify-center bg-black/25 px-4 py-6"
      role="alertdialog"
    >
      <div className="w-full max-w-sm overflow-hidden border-t-2 border-l-2 border-r-2 border-b-2 border-t-white border-l-white border-r-[#404040] border-b-[#404040] bg-[#d4d0c8] shadow-[8px_8px_0_rgba(0,0,0,0.3)]">
        <div className="flex items-center justify-between gap-3 bg-gradient-to-r from-[#0054e3] via-[#2b7cff] to-[#67a7ff] px-2 py-1.5 text-sm font-bold text-white">
          <span className="truncate">{title}</span>
          <button
            aria-label="Закрыть диалог"
            className="flex h-7 w-7 items-center justify-center border border-t-white border-l-white border-r-[#404040] border-b-[#404040] bg-[#d4d0c8] text-base leading-none text-black sm:h-5 sm:w-5 sm:text-sm"
            onClick={onClose}
            type="button"
          >
            ×
          </button>
        </div>

        <div className="flex gap-3 p-4">
          <div
            aria-hidden="true"
            className={cn(
              'flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 bg-white text-2xl font-black',
              intent === 'warning'
                ? 'border-[#d28a00] text-[#d28a00]'
                : 'border-[#d40000] text-[#d40000]',
            )}
          >
            {intent === 'warning' ? '!' : '×'}
          </div>
          <p className="min-w-0 text-sm leading-relaxed text-black">{body}</p>
        </div>

        <div className="flex justify-end gap-2 border-t border-[#b8b8b8] bg-[#ece9d8] px-4 py-3">
          {children}
        </div>
      </div>
    </div>
  );
}

function WindowsXpBlueScreen() {
  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto bg-[#0000aa] px-4 py-6 font-mono text-white sm:px-8 sm:py-10"
      role="alert"
    >
      <div className="mx-auto max-w-5xl text-sm leading-relaxed sm:text-base">
        <p className="mb-6 inline-block bg-[#c0c0c0] px-3 py-1 font-bold text-[#0000aa]">
          Windows
        </p>
        <p className="mb-4">
          A problem has been detected and Windows has been shut down to prevent
          damage to your wedding invitation.
        </p>
        <p className="mb-6 font-bold">INVITATION_WINDOW_CLOSED</p>
        <p className="mb-4">
          Вы закрыли главное окно. Все текущие данные были потеряны, как и было
          предупреждено.
        </p>
        <p className="mb-4">
          If this is the first time you've seen this Stop error screen, restart
          your browser. If this screen appears again, contact your system
          administrator.
        </p>
        <p className="mb-6">
          Technical information:
          <br />
          *** STOP: 0x000000EA (0x20260429, 0x00000095, 0x000000XP, 0x000000RSVP)
        </p>
        <p>Beginning dump of romantic memory...</p>
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
  disabled = false,
  href,
  secondary = false,
  type = 'button',
}: XpButtonProps) {
  const classes = cn(
    'rounded-[3px] border border-t-white border-l-white border-r-[#404040] border-b-[#404040] px-5 py-2 text-sm font-bold disabled:cursor-not-allowed disabled:border-[#808080] disabled:bg-[#c0c0c0] disabled:text-[#606060]',
    secondary ? 'bg-[#e7e7e7]' : 'bg-[#d4e7ff]',
    disabled && href
      ? 'pointer-events-none cursor-not-allowed opacity-70'
      : null,
    className,
  );

  if (href) {
    return (
      <a aria-disabled={disabled} className={classes} href={href}>
        {children}
      </a>
    );
  }

  return (
    <button className={classes} disabled={disabled} type={type}>
      {children}
    </button>
  );
}

function SetupWizardStep({
  active,
  index,
  onActivate,
  targetId,
  title,
}: SetupWizardStepProps) {
  return (
    <a
      aria-current={active ? 'location' : undefined}
      className={cn(
        'flex items-center gap-3 border px-3 py-2 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white',
        active
          ? 'border-white bg-white text-[#003399]'
          : 'border-white/40 bg-white/15 text-white hover:border-white/70 hover:bg-white/25',
      )}
      href={`#${targetId}`}
      onClick={() => onActivate(targetId)}
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
    </a>
  );
}
