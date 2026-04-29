import { DinoMinigameLauncher } from '@/components/easter-eggs/dino-minigame';
import { DressCodeSection } from '@/components/sections/dress-code-section';
import { EveningProgramSection } from '@/components/sections/evening-program-section';
import { EventDetailsSection } from '@/components/sections/event-details-section';
import { GuestSurveySection } from '@/components/sections/guest-survey-section';
import { HeroSection } from '@/components/sections/hero-section';
import { SetupWizardShell } from '@/components/ui/setup-wizard';
import { invitationContent } from '@/lib/invitation-content';

const wizardSteps = [
  {
    active: true,
    index: '01',
    targetId: 'invite',
    title: 'Событие',
  },
  {
    index: '02',
    targetId: 'details',
    title: 'Дата и место',
  },
  {
    index: '03',
    targetId: 'dress-code',
    title: 'Дресс-код',
  },
  {
    index: '04',
    targetId: 'program',
    title: 'Программа вечера',
  },
  {
    index: '05',
    targetId: 'survey',
    title: 'Опрос гостей',
  },
] as const;

export function InvitationPage() {
  return (
    <main
      className="min-h-screen bg-[#3a6ea5] px-4 py-4 text-black md:p-8"
      style={{ fontFamily: 'Tahoma, Verdana, sans-serif' }}
    >
      <div className="mx-auto max-w-6xl">
        <SetupWizardShell
          note={`Installation note:\n${invitationContent.footerNote}`}
          steps={wizardSteps}
          title="Wedding Invitation Wizard"
          versionLabel={invitationContent.dateCompact}
        >
          <HeroSection />

          <section className="grid gap-5 md:grid-cols-2">
            <EventDetailsSection />
            <DressCodeSection />
          </section>

          <EveningProgramSection />

          <GuestSurveySection />

          <footer className="flex flex-col justify-between gap-4 border border-[#7f9db9] bg-[#ece9d8] px-4 py-3 text-sm sm:flex-row sm:items-center">
            <div className="flex min-w-0 items-center gap-2">
              <DinoMinigameLauncher />
              <div className="truncate">Wedding Invitation OS</div>
            </div>

            <div className="whitespace-nowrap border border-[#7f9db9] bg-white px-3 py-1 shadow-[inset_1px_1px_0_white]">
              {invitationContent.dateCompact} · Love Mode
            </div>
          </footer>
        </SetupWizardShell>
      </div>
    </main>
  );
}
