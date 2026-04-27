const FULL_NAME_WORD_COUNT = 2;
const NAME_WORD_PATTERN = /^\p{L}+(?:[-'\u2019]\p{L}+)*$/u;
const UNSUPPORTED_FULL_NAME_CHARS_PATTERN = /[^\p{L}\s'\u2019-]/gu;

export const GUEST_FULL_NAME_MAX_LENGTH = 120;

export type GuestFullNameValidationResult =
  | {
      isValid: true;
    }
  | {
      isValid: false;
      message: string;
    };

export const normalizeGuestFullNameSpacing = (value: string) =>
  value.trim().replace(/\s+/g, ' ');

export const sanitizeGuestFullNameInput = (value: string) =>
  value.replace(UNSUPPORTED_FULL_NAME_CHARS_PATTERN, '').replace(/\s+/g, ' ');

const formatNameSegment = (value: string) =>
  value.charAt(0).toLocaleUpperCase('ru-RU') +
  value.slice(1).toLocaleLowerCase('ru-RU');

const formatNameWord = (value: string) =>
  value
    .split(/([-'\u2019])/)
    .map((segment) =>
      segment === '-' || segment === "'" || segment === '\u2019'
        ? segment
        : formatNameSegment(segment),
    )
    .join('');

export const formatGuestFullName = (value: string) => {
  const normalizedValue = normalizeGuestFullNameSpacing(value);

  if (!normalizedValue) {
    return '';
  }

  return normalizedValue.split(' ').map(formatNameWord).join(' ');
};

export const validateGuestFullNameFormat = (
  value: string,
): GuestFullNameValidationResult => {
  const normalizedValue = normalizeGuestFullNameSpacing(value);

  if (!normalizedValue) {
    return {
      isValid: false,
      message: 'Укажите имя и фамилию',
    };
  }

  if (/\p{N}/u.test(normalizedValue)) {
    return {
      isValid: false,
      message: 'Имя и фамилия не должны содержать цифры',
    };
  }

  const words = normalizedValue.split(' ');

  if (words.length !== FULL_NAME_WORD_COUNT) {
    return {
      isValid: false,
      message: 'Укажите имя и фамилию в два слова',
    };
  }

  if (words.some((word) => !NAME_WORD_PATTERN.test(word))) {
    return {
      isValid: false,
      message: 'Используйте только буквы, пробел, дефис или апостроф',
    };
  }

  return {
    isValid: true,
  };
};
