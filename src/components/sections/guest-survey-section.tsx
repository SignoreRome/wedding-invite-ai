'use client';

import { useState, type FormEvent } from 'react';

import { SetupSection, XpButton } from '@/components/ui/setup-wizard';
import { invitationContent } from '@/lib/invitation-content';

const fieldClassName =
  'w-full resize-none border border-[#7f9db9] bg-white px-3 py-2 text-sm text-black outline-none disabled:bg-[#f0f0f0] disabled:text-[#666] disabled:placeholder:text-[#777]';
const plusOneOptions = [
  {
    label: 'Да, буду с парой',
    value: 'true',
  },
  {
    label: 'Нет, буду один(одна)',
    value: 'false',
  },
] as const;
const transferOptions = [
  {
    label: 'Да, нужен',
    value: 'true',
  },
  {
    label: 'Нет, не нужен',
    value: 'false',
  },
] as const;

type SubmitState = {
  fields?: Record<string, string[]>;
  message: string;
  status: 'idle' | 'loading' | 'success' | 'error';
};

type RsvpApiResponse =
  | {
      ok: true;
    }
  | {
      ok: false;
      error: {
        fields?: Record<string, string[]>;
        message: string;
      };
    };

const initialSubmitState: SubmitState = {
  message: '',
  status: 'idle',
};

const getFormString = (formData: FormData, fieldName: string) => {
  const value = formData.get(fieldName);
  return typeof value === 'string' ? value.trim() : '';
};

const getOptionalFormString = (formData: FormData, fieldName: string) => {
  const value = getFormString(formData, fieldName);
  return value.length > 0 ? value : null;
};

const readRsvpResponse = async (response: Response) => {
  try {
    return (await response.json()) as RsvpApiResponse;
  } catch {
    return null;
  }
};

function FieldError({ id, messages }: { id: string; messages?: string[] }) {
  if (!messages?.length) {
    return null;
  }

  return (
    <p className="mt-1 text-xs font-bold text-[#a00000]" id={id} role="alert">
      {messages.join(' ')}
    </p>
  );
}

export function GuestSurveySection() {
  const [selectedPlusOne, setSelectedPlusOne] = useState<
    'true' | 'false' | null
  >(null);
  const [submitState, setSubmitState] =
    useState<SubmitState>(initialSubmitState);
  const isLoading = submitState.status === 'loading';
  const plusOneNameDisabled = selectedPlusOne !== 'true';

  const clearResultState = () => {
    if (submitState.status === 'error' || submitState.status === 'success') {
      setSubmitState(initialSubmitState);
    }
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (isLoading) {
      return;
    }

    const form = event.currentTarget;

    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }

    const formData = new FormData(form);
    const hasPlusOne = formData.get('hasPlusOne') === 'true';

    setSubmitState({
      message: 'Сохраняем ответ...',
      status: 'loading',
    });

    try {
      const response = await fetch('/api/rsvp', {
        body: JSON.stringify({
          guestName: getFormString(formData, 'guestName'),
          guestComment: getOptionalFormString(formData, 'guestComment'),
          hasPlusOne,
          isAttending: formData.get('isAttending') === 'true',
          needsTransfer: formData.get('needsTransfer') === 'true',
          plusOneName: hasPlusOne
            ? getOptionalFormString(formData, 'plusOneName')
            : null,
        }),
        headers: {
          'Content-Type': 'application/json',
        },
        method: 'POST',
      });

      const result = await readRsvpResponse(response);

      if (!response.ok || !result?.ok) {
        const apiError = result?.ok === false ? result.error : null;

        setSubmitState({
          fields: apiError?.fields,
          message:
            apiError?.message ??
            'Не удалось сохранить ответ. Попробуйте еще раз.',
          status: 'error',
        });
        return;
      }

      form.reset();
      setSelectedPlusOne(null);
      setSubmitState({
        message: 'Ответ сохранен. Спасибо!',
        status: 'success',
      });
    } catch {
      setSubmitState({
        message:
          'Не удалось отправить ответ. Проверьте соединение и попробуйте еще раз.',
        status: 'error',
      });
    }
  };

  const statusText =
    submitState.status === 'idle'
      ? 'form_status: ready'
      : `form_status: ${submitState.status}`;

  return (
    <SetupSection id="survey" accentColor="#1d8b3b" title="Опрос гостей">
      <form
        aria-busy={isLoading}
        className="space-y-4 border border-[#7f9db9] bg-white p-4 shadow-[inset_1px_1px_0_white] md:p-5"
        data-testid="rsvp-form"
        onChange={clearResultState}
        onReset={() => {
          setSelectedPlusOne(null);
          setSubmitState(initialSubmitState);
        }}
        onSubmit={handleSubmit}
      >
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
            aria-describedby="guest-full-name-error"
            aria-invalid={Boolean(submitState.fields?.guestName)}
            className={fieldClassName}
            id="guest-full-name"
            maxLength={120}
            name="guestName"
            placeholder="Например: Иван Иванов"
            required
          />
          <FieldError
            id="guest-full-name-error"
            messages={submitState.fields?.guestName}
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-bold">
            Будете ли вы присутствовать?
          </label>
          <div className="grid gap-2 text-sm sm:grid-cols-2">
            {invitationContent.surveyOptions.map((option, index) => (
              <label
                key={option.label}
                className="flex cursor-pointer items-center gap-2 border border-[#d0d0d0] bg-[#fafafa] px-3 py-2"
              >
                <input
                  className="accent-black"
                  name="isAttending"
                  required
                  type="radio"
                  value={index === 0 ? 'true' : 'false'}
                />
                <span>{option.label}</span>
              </label>
            ))}
          </div>
          <FieldError
            id="is-attending-error"
            messages={submitState.fields?.isAttending}
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-bold">
            Будете ли вы с парой?
          </label>
          <div className="grid gap-2 text-sm sm:grid-cols-2">
            {plusOneOptions.map((option) => (
              <label
                key={option.value}
                className="flex cursor-pointer items-center gap-2 border border-[#d0d0d0] bg-[#fafafa] px-3 py-2"
              >
                <input
                  checked={selectedPlusOne === option.value}
                  className="accent-black"
                  name="hasPlusOne"
                  onChange={() => setSelectedPlusOne(option.value)}
                  required
                  type="radio"
                  value={option.value}
                />
                <span>{option.label}</span>
              </label>
            ))}
          </div>
          <FieldError
            id="has-plus-one-error"
            messages={submitState.fields?.hasPlusOne}
          />
        </div>

        <div>
          <label
            className="mb-1 block text-sm font-bold"
            htmlFor="plus-one-name"
          >
            Имя Фамилия пары
          </label>
          <input
            aria-describedby="plus-one-name-error"
            aria-invalid={Boolean(submitState.fields?.plusOneName)}
            className={fieldClassName}
            disabled={plusOneNameDisabled}
            id="plus-one-name"
            maxLength={120}
            name="plusOneName"
            placeholder="Заполните, если будете с +1"
            required={!plusOneNameDisabled}
          />
          <FieldError
            id="plus-one-name-error"
            messages={submitState.fields?.plusOneName}
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-bold">
            Нужен ли вам трансфер после банкета?
          </label>
          <div className="grid gap-2 text-sm sm:grid-cols-2">
            {transferOptions.map((option) => (
              <label
                key={option.value}
                className="flex cursor-pointer items-center gap-2 border border-[#d0d0d0] bg-[#fafafa] px-3 py-2"
              >
                <input
                  className="accent-black"
                  name="needsTransfer"
                  required
                  type="radio"
                  value={option.value}
                />
                <span>{option.label}</span>
              </label>
            ))}
          </div>
          <FieldError
            id="needs-transfer-error"
            messages={submitState.fields?.needsTransfer}
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-bold" htmlFor="guest-note">
            Комментарий гостя
          </label>
          <textarea
            aria-describedby="guest-note-error"
            aria-invalid={Boolean(submitState.fields?.guestComment)}
            className={fieldClassName}
            id="guest-note"
            maxLength={1000}
            name="guestComment"
            placeholder="Аллергия, пожелания или другая важная информация"
            rows={4}
          />
          <FieldError
            id="guest-note-error"
            messages={submitState.fields?.guestComment}
          />
        </div>

        {submitState.message ? (
          <p
            className={`border px-3 py-2 text-sm font-bold ${
              submitState.status === 'error'
                ? 'border-[#a00000] bg-[#fff1f1] text-[#a00000]'
                : submitState.status === 'success'
                  ? 'border-[#1d8b3b] bg-[#effff4] text-[#0f6228]'
                  : 'border-[#7f9db9] bg-[#f5f9ff] text-[#003399]'
            }`}
            role={submitState.status === 'error' ? 'alert' : 'status'}
          >
            {submitState.message}
          </p>
        ) : null}

        <div className="flex flex-col gap-3 pt-1 sm:flex-row sm:items-center sm:justify-between">
          <span aria-live="polite" className="font-mono text-xs text-[#555]">
            {statusText}
          </span>
          <div className="grid grid-cols-1 gap-3 min-[380px]:grid-cols-2 sm:flex sm:flex-wrap">
            <XpButton
              className="w-full sm:w-auto"
              disabled={isLoading}
              type="submit"
            >
              {isLoading ? 'Отправляем...' : 'Отправить'}
            </XpButton>
            <XpButton
              className="w-full sm:w-auto"
              disabled={isLoading}
              secondary
              type="reset"
            >
              Очистить
            </XpButton>
          </div>
        </div>
      </form>
    </SetupSection>
  );
}
