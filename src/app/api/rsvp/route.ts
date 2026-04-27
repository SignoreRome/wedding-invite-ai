import { NextResponse } from 'next/server';
import { z, type ZodError } from 'zod';

import { getPrismaClient } from '@/lib/prisma';
import {
  formatGuestFullName,
  GUEST_FULL_NAME_MAX_LENGTH,
  validateGuestFullNameFormat,
} from '@/lib/rsvp-name';

export const runtime = 'nodejs';

const GUEST_COMMENT_MAX_LENGTH = 1000;

const getGuestNameLookupKey = (value: string) =>
  formatGuestFullName(value).toLocaleLowerCase('ru-RU');

const optionalTrimmedString = (maxLength: number) =>
  z
    .union([z.string().trim().max(maxLength), z.null()])
    .optional()
    .transform((value) => {
      if (value === null || value === undefined) {
        return null;
      }

      return value.length > 0 ? value : null;
    });

const guestFullNameSchema = z
  .string()
  .trim()
  .max(
    GUEST_FULL_NAME_MAX_LENGTH,
    `Имя и фамилия должны быть не длиннее ${GUEST_FULL_NAME_MAX_LENGTH} символов`,
  )
  .superRefine((value, context) => {
    const validation = validateGuestFullNameFormat(value);

    if (!validation.isValid) {
      context.addIssue({
        code: 'custom',
        message: validation.message,
      });
    }
  })
  .transform(formatGuestFullName);

const optionalGuestFullNameSchema = z.preprocess(
  (value) =>
    typeof value === 'string' && value.trim().length === 0 ? null : value,
  z
    .union([guestFullNameSchema, z.null()])
    .optional()
    .transform((value) => value ?? null),
);

const normalizeRsvpRequestInput = (value: unknown) => {
  if (
    value &&
    typeof value === 'object' &&
    !Array.isArray(value) &&
    (value as Record<string, unknown>).isAttending === false
  ) {
    return {
      ...value,
      guestComment: null,
      hasPlusOne: false,
      needsTransfer: false,
      plusOneName: null,
    };
  }

  return value;
};

const rsvpRequestSchema = z.preprocess(
  normalizeRsvpRequestInput,
  z
    .object({
      guestName: guestFullNameSchema,
      isAttending: z.boolean(),
      hasPlusOne: z.boolean().default(false),
      plusOneName: optionalGuestFullNameSchema,
      needsTransfer: z.boolean().default(false),
      guestComment: optionalTrimmedString(GUEST_COMMENT_MAX_LENGTH),
    })
    .strict()
    .superRefine((value, context) => {
      if (value.isAttending && value.hasPlusOne && !value.plusOneName) {
        context.addIssue({
          code: 'custom',
          message: 'Укажите имя и фамилию пары',
          path: ['plusOneName'],
        });
      }
    }),
);

type RsvpRequest = z.infer<typeof rsvpRequestSchema>;

type RsvpResponseData = {
  id: number;
  guestName: string;
  isAttending: boolean;
  hasPlusOne: boolean;
  plusOneName: string | null;
  needsTransfer: boolean;
  guestComment: string | null;
  createdAt: string;
};

type RsvpPostResponse =
  | {
      ok: true;
      data: RsvpResponseData;
    }
  | {
      ok: false;
      error: {
        code: 'invalid_json' | 'validation_error' | 'internal_error';
        message: string;
        fields?: Record<string, string[]>;
      };
    };

const jsonResponse = (body: RsvpPostResponse, status: number) =>
  NextResponse.json<RsvpPostResponse>(body, { status });

const formatZodError = (error: ZodError<RsvpRequest>) => {
  const fields: Record<string, string[]> = {};

  for (const issue of error.issues) {
    const field = issue.path.join('.') || '_root';
    fields[field] = [...(fields[field] ?? []), issue.message];
  }

  return fields;
};

const rsvpSelect = {
  createdAt: true,
  guestComment: true,
  guestName: true,
  hasPlusOne: true,
  id: true,
  isAttending: true,
  needsTransfer: true,
  plusOneName: true,
} as const;

export async function POST(request: Request) {
  let requestBody: unknown;

  try {
    requestBody = await request.json();
  } catch {
    return jsonResponse(
      {
        ok: false,
        error: {
          code: 'invalid_json',
          message: 'Тело запроса должно быть корректным JSON',
        },
      },
      400,
    );
  }

  const parsedBody = rsvpRequestSchema.safeParse(requestBody);

  if (!parsedBody.success) {
    return jsonResponse(
      {
        ok: false,
        error: {
          code: 'validation_error',
          message: 'Проверьте поля формы',
          fields: formatZodError(parsedBody.error),
        },
      },
      422,
    );
  }

  const rsvp = parsedBody.data;

  try {
    const prisma = getPrismaClient();
    const rsvpData = {
      guestComment: rsvp.isAttending ? rsvp.guestComment : null,
      guestName: rsvp.guestName,
      hasPlusOne: rsvp.isAttending ? rsvp.hasPlusOne : false,
      isAttending: rsvp.isAttending,
      needsTransfer: rsvp.isAttending ? rsvp.needsTransfer : false,
      plusOneName:
        rsvp.isAttending && rsvp.hasPlusOne ? rsvp.plusOneName : null,
    };
    const guestNameLookupKey = getGuestNameLookupKey(rsvp.guestName);

    const savedRsvp = await prisma.$transaction(async (tx) => {
      const existingRsvp = (
        await tx.rsvp.findMany({
          orderBy: [
            {
              updatedAt: 'desc',
            },
            {
              id: 'desc',
            },
          ],
          select: {
            guestName: true,
            id: true,
          },
        })
      ).find(
        (rsvpRow) =>
          getGuestNameLookupKey(rsvpRow.guestName) === guestNameLookupKey,
      );

      if (existingRsvp) {
        const record = await tx.rsvp.update({
          data: rsvpData,
          select: rsvpSelect,
          where: {
            id: existingRsvp.id,
          },
        });

        return {
          record,
          status: 200,
        };
      }

      const record = await tx.rsvp.create({
        data: rsvpData,
        select: rsvpSelect,
      });

      return {
        record,
        status: 201,
      };
    });

    return jsonResponse(
      {
        ok: true,
        data: {
          ...savedRsvp.record,
          createdAt: savedRsvp.record.createdAt.toISOString(),
        },
      },
      savedRsvp.status,
    );
  } catch {
    return jsonResponse(
      {
        ok: false,
        error: {
          code: 'internal_error',
          message: 'Не удалось сохранить ответ. Попробуйте позже.',
        },
      },
      500,
    );
  }
}
