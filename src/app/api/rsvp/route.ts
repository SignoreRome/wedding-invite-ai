import { NextResponse } from 'next/server';
import { z, type ZodError } from 'zod';

import { getPrismaClient } from '@/lib/prisma';

export const runtime = 'nodejs';

const GUEST_NAME_MAX_LENGTH = 120;
const PLUS_ONE_NAME_MAX_LENGTH = 120;
const GUEST_COMMENT_MAX_LENGTH = 1000;

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

const rsvpRequestSchema = z
  .object({
    guestName: z
      .string()
      .trim()
      .min(1, 'Укажите имя гостя')
      .max(
        GUEST_NAME_MAX_LENGTH,
        `Имя гостя должно быть не длиннее ${GUEST_NAME_MAX_LENGTH} символов`,
      ),
    isAttending: z.boolean(),
    hasPlusOne: z.boolean().default(false),
    plusOneName: optionalTrimmedString(PLUS_ONE_NAME_MAX_LENGTH),
    needsTransfer: z.boolean().default(false),
    guestComment: optionalTrimmedString(GUEST_COMMENT_MAX_LENGTH),
  })
  .strict()
  .superRefine((value, context) => {
    if (value.hasPlusOne && !value.plusOneName) {
      context.addIssue({
        code: 'custom',
        message: 'Укажите имя пары',
        path: ['plusOneName'],
      });
    }
  });

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

    const createdRsvp = await prisma.rsvp.create({
      data: {
        guestName: rsvp.guestName,
        isAttending: rsvp.isAttending,
        hasPlusOne: rsvp.hasPlusOne,
        plusOneName: rsvp.hasPlusOne ? rsvp.plusOneName : null,
        needsTransfer: rsvp.needsTransfer,
        guestComment: rsvp.guestComment,
      },
      select: {
        id: true,
        guestName: true,
        isAttending: true,
        hasPlusOne: true,
        plusOneName: true,
        needsTransfer: true,
        guestComment: true,
        createdAt: true,
      },
    });

    return jsonResponse(
      {
        ok: true,
        data: {
          ...createdRsvp,
          createdAt: createdRsvp.createdAt.toISOString(),
        },
      },
      201,
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
