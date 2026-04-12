import { SetupCard } from '@/components/ui/setup-wizard';
import { invitationContent } from '@/lib/invitation-content';

export function HeroSection() {
  return (
    <section
      id="invite"
      className="border border-[#7f9db9] bg-white shadow-[inset_1px_1px_0_white]"
    >
      <div className="border-b border-[#c7c7c7] bg-gradient-to-r from-white to-[#f3f7ff] px-4 py-3">
        <div className="mb-1 text-xs uppercase tracking-wide text-[#4b4b4b]">
          Мастер приглашения
        </div>
        <h1 className="text-3xl font-black leading-none text-[#003399] md:text-4xl">
          Мы женимся!
        </h1>
        <div className="mt-2 text-sm font-bold text-[#5a5a5a] md:text-base">
          [ Save the date ] {invitationContent.dateCompact}
        </div>
      </div>

      <div className="grid items-start gap-5 p-5 lg:grid-cols-[1.2fr_0.8fr]">
        <div>
          <div className="mb-3 inline-block border border-[#808080] bg-[#ffffcc] px-2 py-1 text-xs">
            Новое событие обнаружено
          </div>
          <p className="max-w-2xl text-base leading-relaxed md:text-lg">
            {invitationContent.intro}
          </p>
        </div>

        <SetupCard eyebrow="Системная информация">
          <div className="space-y-2 text-sm">
            <div className="flex justify-between gap-3 border-b border-dotted border-[#808080] pb-1">
              <span>Файл события</span>
              <span className="font-bold">Wedding Day</span>
            </div>
            <div className="flex justify-between gap-3 border-b border-dotted border-[#808080] pb-1">
              <span>Версия</span>
              <span className="font-bold">{invitationContent.dateCompact}</span>
            </div>
            <div className="flex justify-between gap-3 border-b border-dotted border-[#808080] pb-1">
              <span>Возрастные ограничения</span>
              <span className="font-bold text-[#8b0000]">18+</span>
            </div>
          </div>
        </SetupCard>
      </div>
    </section>
  );
}
