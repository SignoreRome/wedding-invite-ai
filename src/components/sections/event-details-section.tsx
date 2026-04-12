import { SetupCard, SetupSection } from '@/components/ui/setup-wizard';
import { invitationContent } from '@/lib/invitation-content';

export function EventDetailsSection() {
  return (
    <SetupSection id="details" accentColor="#2b63d9" title="Дата и место">
      <div className="grid gap-4">
        <SetupCard eyebrow="Дата">
          <div className="text-3xl font-black tracking-wide text-black">
            {invitationContent.dateCode}
          </div>
        </SetupCard>

        <SetupCard eyebrow="Начало">
          <div className="text-2xl font-bold text-black">
            {invitationContent.timeLabel}
          </div>
          <p className="mt-1 text-sm">Сбор гостей и welcome-drink</p>
        </SetupCard>

        <SetupCard eyebrow="Место">
          <div className="text-xl font-bold text-black">
            {invitationContent.venue.name}
          </div>
          <p className="mt-2 text-sm">{invitationContent.venue.address}</p>
          <div className="mt-3 border border-[#808080] bg-[#ffffcc] p-3 text-sm">
            {invitationContent.venue.mapHint}
          </div>
          <div className="mt-2 font-mono text-xs text-[#555]">
            C:\wedding\location\venue_info.txt
          </div>
        </SetupCard>
      </div>
    </SetupSection>
  );
}
