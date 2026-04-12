import { EventDetailsSection } from "@/components/sections/event-details-section";
import { HeroSection } from "@/components/sections/hero-section";
import { RsvpPreviewSection } from "@/components/sections/rsvp-preview-section";
import { invitationContent } from "@/lib/invitation-content";

export function InvitationPage() {
  return (
    <main className="min-h-screen px-4 py-6 sm:px-6 sm:py-10">
      <div className="mx-auto flex max-w-5xl flex-col gap-4 sm:gap-6">
        <div className="flex flex-wrap items-center gap-2 text-[0.68rem] font-semibold uppercase tracking-[0.2em] text-white sm:text-xs">
          <span className="status-badge">Wedding invite</span>
          <span className="status-badge">Mobile first</span>
          <span className="status-badge">RSVP ready</span>
        </div>

        <HeroSection />
        <EventDetailsSection />
        <RsvpPreviewSection />

        <footer className="px-2 pb-4 pt-1 text-center text-sm text-white/90">
          <p className="mx-auto max-w-2xl leading-6">
            {invitationContent.footerNote}
          </p>
        </footer>
      </div>
    </main>
  );
}
