import { WindowFrame } from "@/components/ui/window-frame";
import { invitationContent } from "@/lib/invitation-content";

export function EventDetailsSection() {
  return (
    <WindowFrame
      id="details"
      title="details.ini"
      subtitle="Что, где и в каком порядке будет происходить"
    >
      <div className="grid gap-4 lg:grid-cols-[1.05fr_0.95fr]">
        <div className="flex flex-col gap-4">
          <div className="win95-inset p-4 sm:p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
              Локация
            </p>
            <h2 className="mt-2 text-2xl font-bold text-slate-900">
              {invitationContent.venue.name}
            </h2>
            <p className="mt-2 text-base leading-7 text-slate-700">
              {invitationContent.venue.address}
            </p>
            <p className="mt-4 text-sm leading-6 text-slate-600">
              {invitationContent.venue.description}
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {invitationContent.notes.map((note) => (
              <div key={note.label} className="win95-inset p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                  {note.label}
                </p>
                <p className="mt-2 text-sm leading-6 text-slate-700">
                  {note.text}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="win95-inset p-4 sm:p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
            Таймлайн дня
          </p>
          <ol className="mt-4 space-y-3">
            {invitationContent.schedule.map((item, index) => (
              <li
                key={`${item.time}-${item.title}`}
                className="flex gap-3 rounded-[10px] bg-white/70 p-3"
              >
                <div className="flex flex-col items-center">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--accent)] text-sm font-bold text-white">
                    {index + 1}
                  </span>
                  {index < invitationContent.schedule.length - 1 ? (
                    <span className="mt-2 h-full w-px bg-slate-300" />
                  ) : null}
                </div>

                <div className="pb-1">
                  <p className="font-mono text-sm font-semibold text-[var(--accent-dark)]">
                    {item.time}
                  </p>
                  <h3 className="mt-1 text-base font-bold text-slate-900">
                    {item.title}
                  </h3>
                  <p className="mt-1 text-sm leading-6 text-slate-700">
                    {item.description}
                  </p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </WindowFrame>
  );
}
