import { WindowFrame } from "@/components/ui/window-frame";
import { invitationContent } from "@/lib/invitation-content";

const previewFields = [
  "Имя и фамилия",
  "Сможете ли вы прийти",
  "Нужны ли особые пожелания по меню",
  "Короткое сообщение для пары",
] as const;

export function RsvpPreviewSection() {
  return (
    <WindowFrame
      id="rsvp"
      title="rsvp.todo"
      subtitle="Подготовленная секция для будущей формы ответа"
    >
      <div className="grid gap-4 lg:grid-cols-[0.95fr_1.05fr]">
        <div className="flex flex-col gap-4">
          <div className="win95-inset p-4 sm:p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
              Скоро здесь
            </p>
            <h2 className="mt-2 text-2xl font-bold text-slate-900">
              Форма RSVP
            </h2>
            <p className="mt-3 text-sm leading-6 text-slate-700 sm:text-base">
              Секция уже встроена в публичную страницу, поэтому позже сюда можно
              добавить серверную обработку, валидацию и сохранение ответов без
              переработки макета.
            </p>
            <div className="mt-4 rounded-[10px] bg-[#fef4c2] px-4 py-3 text-sm font-medium text-[#6d5713]">
              Попросим ответить {invitationContent.rsvpDeadline}.
            </div>
          </div>

          <div className="win95-inset p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
              Что будет в форме
            </p>
            <ul className="mt-3 space-y-2 text-sm leading-6 text-slate-700">
              {invitationContent.rsvpHighlights.map((item) => (
                <li key={item} className="rounded-[10px] bg-white/70 px-3 py-2">
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="win95-inset p-4 sm:p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
            UI preview
          </p>
          <div className="mt-4 space-y-3">
            {previewFields.map((label) => (
              <div key={label} className="space-y-1.5">
                <label className="block text-sm font-semibold text-slate-700">
                  {label}
                </label>
                <div className="win95-field min-h-12 px-3 py-3 text-sm text-slate-500">
                  Будущее поле формы
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4 flex flex-col gap-3 sm:flex-row">
            <div className="win95-button w-full opacity-70">Кнопка отправки</div>
            <div className="win95-button win95-button--secondary w-full opacity-70">
              Кнопка очистки
            </div>
          </div>
        </div>
      </div>
    </WindowFrame>
  );
}
