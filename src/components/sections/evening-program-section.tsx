import { SetupSection } from '@/components/ui/setup-wizard';
import { invitationContent } from '@/lib/invitation-content';

export function EveningProgramSection() {
  return (
    <SetupSection
      id="program"
      accentColor="#d98a2b"
      title="Программа вечера"
    >
      <div className="space-y-3">
        {invitationContent.schedule.map((item) => (
          <div
            key={`${item.time}-${item.title}`}
            className="grid gap-3 border border-[#7f9db9] bg-white p-3 shadow-[inset_1px_1px_0_white] sm:grid-cols-[96px_1fr]"
          >
            <div className="inline-flex w-fit items-center border border-[#808080] bg-[#ffffcc] px-2 py-1 text-lg font-black text-black">
              {item.time}
            </div>

            <div className="min-w-0">
              <h3 className="text-base font-bold text-black sm:text-lg">
                {item.title}
              </h3>
              {item.description ? (
                <p className="mt-1 text-sm leading-relaxed text-[#444]">
                  {item.description}
                </p>
              ) : null}
            </div>
          </div>
        ))}
      </div>
    </SetupSection>
  );
}
