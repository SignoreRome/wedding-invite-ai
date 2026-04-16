import { SetupCard, SetupSection } from '@/components/ui/setup-wizard';
import { invitationContent } from '@/lib/invitation-content';

export function DressCodeSection() {
  return (
    <SetupSection id="dress-code" accentColor="#7a3db8" title="Дресс-код">
      <div className="space-y-4">
        <SetupCard>
          <p className="text-sm leading-relaxed">
            {invitationContent.dressCode.description}
          </p>
        </SetupCard>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {invitationContent.dressCode.palette.map((item) => (
            <div key={item.label} className="space-y-2">
              <div
                aria-hidden="true"
                className="h-16 border border-[#7f9db9] shadow-[inset_1px_1px_0_rgba(255,255,255,0.7)]"
                style={{ backgroundColor: item.color }}
              />
              <p className="text-center text-xs font-bold uppercase tracking-wide">
                {item.label}
              </p>
            </div>
          ))}
        </div>

        <div className="border border-[#7f9db9] bg-white p-3 text-sm">
          <p>
            Избегайте полностью белых образов, чтобы этот цвет остался за
            невестой. {invitationContent.dressCode.note}
          </p>
        </div>
      </div>
    </SetupSection>
  );
}
