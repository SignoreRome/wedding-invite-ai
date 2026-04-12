import { WindowFrame } from "@/components/ui/window-frame";
import { invitationContent } from "@/lib/invitation-content";

const stats = [
  {
    label: "Дата",
    value: invitationContent.dateLabel,
  },
  {
    label: "Время",
    value: invitationContent.timeLabel,
  },
  {
    label: "Город",
    value: invitationContent.city,
  },
] as const;

export function HeroSection() {
  return (
    <WindowFrame
      id="invite"
      title="invite.exe"
      subtitle="Главная публичная страница приглашения"
    >
      <div className="flex flex-col gap-5">
        <div className="inline-flex w-fit items-center gap-2 rounded-full bg-[#fef4c2] px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-[#6d5713]">
          <span className="inline-block h-2.5 w-2.5 rounded-full bg-[#2ca24f]" />
          Сохрани дату
        </div>

        <div className="space-y-3">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-500">
            {invitationContent.kicker}
          </p>
          <h1 className="max-w-3xl text-4xl font-black tracking-tight text-slate-900 sm:text-5xl">
            {invitationContent.couple}
          </h1>
          <p className="max-w-2xl text-base leading-7 text-slate-700 sm:text-lg">
            {invitationContent.intro}
          </p>
        </div>

        <div className="grid gap-3 sm:grid-cols-3">
          {stats.map((item) => (
            <div key={item.label} className="win95-inset p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                {item.label}
              </p>
              <p className="mt-2 text-lg font-bold text-slate-900">{item.value}</p>
            </div>
          ))}
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          <a className="win95-button" href="#details">
            Посмотреть программу дня
          </a>
          <a className="win95-button win95-button--secondary" href="#rsvp">
            Открыть RSVP-раздел
          </a>
        </div>
      </div>
    </WindowFrame>
  );
}
