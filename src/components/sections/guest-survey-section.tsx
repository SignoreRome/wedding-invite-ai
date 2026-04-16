import { SetupSection, XpButton } from '@/components/ui/setup-wizard';
import { invitationContent } from '@/lib/invitation-content';

const fieldClassName =
  'w-full resize-none border border-[#7f9db9] bg-white px-3 py-2 text-sm text-black outline-none';
const plusOneOptions = [
  'Да, буду с парой',
  'Нет, буду один(одна)',
] as const;
const transferOptions = ['Да, нужен', 'Нет, не нужен'] as const;

export function GuestSurveySection() {
  return (
    <SetupSection id="survey" accentColor="#1d8b3b" title="Опрос гостей">
      <form className="space-y-4 border border-[#7f9db9] bg-white p-4 shadow-[inset_1px_1px_0_white] md:p-5">
        <p className="text-sm leading-relaxed text-[#3b3b3b]">
          {invitationContent.surveyIntro}
        </p>

        <div>
          <label
            className="mb-1 block text-sm font-bold"
            htmlFor="guest-full-name"
          >
            Имя Фамилия
          </label>
          <input
            className={fieldClassName}
            id="guest-full-name"
            name="guest-full-name"
            placeholder="Например: Иван Иванов"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-bold">
            Будете ли вы присутствовать?
          </label>
          <div className="grid gap-2 text-sm sm:grid-cols-2">
            {invitationContent.surveyOptions.map((option) => (
              <label
                key={option.label}
                className="flex cursor-pointer items-center gap-2 border border-[#d0d0d0] bg-[#fafafa] px-3 py-2"
              >
                <input
                  className="accent-black"
                  name="attendance"
                  type="radio"
                  value={option.label}
                />
                <span>{option.label}</span>
              </label>
            ))}
          </div>
        </div>

        <div>
          <label className="mb-2 block text-sm font-bold">
            Будете ли вы с парой?
          </label>
          <div className="grid gap-2 text-sm sm:grid-cols-2">
            {plusOneOptions.map((option) => (
              <label
                key={option}
                className="flex cursor-pointer items-center gap-2 border border-[#d0d0d0] bg-[#fafafa] px-3 py-2"
              >
                <input
                  className="accent-black"
                  name="plus-one"
                  type="radio"
                  value={option}
                />
                <span>{option}</span>
              </label>
            ))}
          </div>
        </div>

        <div>
          <label
            className="mb-1 block text-sm font-bold"
            htmlFor="plus-one-name"
          >
            Имя Фамилия пары
          </label>
          <input
            className={fieldClassName}
            id="plus-one-name"
            name="plus-one-name"
            placeholder="Заполните, если будете с +1"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-bold">
            Нужен ли вам трансфер после банкета?
          </label>
          <div className="grid gap-2 text-sm sm:grid-cols-2">
            {transferOptions.map((option) => (
              <label
                key={option}
                className="flex cursor-pointer items-center gap-2 border border-[#d0d0d0] bg-[#fafafa] px-3 py-2"
              >
                <input
                  className="accent-black"
                  name="transfer"
                  type="radio"
                  value={option}
                />
                <span>{option}</span>
              </label>
            ))}
          </div>
        </div>

        <div>
          <label className="mb-1 block text-sm font-bold" htmlFor="guest-note">
            Комментарий гостя
          </label>
          <textarea
            className={fieldClassName}
            id="guest-note"
            name="guest-note"
            placeholder="Аллергия, пожелания или другая важная информация"
            rows={4}
          />
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
          <span className="font-mono text-xs text-[#555]">
            form_status: ready
          </span>
          <div className="flex flex-wrap gap-3">
            <XpButton type="button">Отправить</XpButton>
            <XpButton secondary type="reset">
              Очистить
            </XpButton>
          </div>
        </div>
      </form>
    </SetupSection>
  );
}
