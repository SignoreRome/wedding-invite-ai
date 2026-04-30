import { NextResponse } from 'next/server';
import { z, type ZodError } from 'zod';

import {
  DEFAULT_GAME_SETTINGS,
  GAME_SETTINGS_ROW_ID,
  normalizeGameSettings,
} from '@/lib/dino-game';
import { getPrismaClient } from '@/lib/prisma';

export const runtime = 'nodejs';

const PLAYER_NAME_MAX_LENGTH = 30;
const MAX_SCORE = 10_000_000;
const MAX_COINS_COLLECTED = 100_000;
const MAX_DISTANCE = 10_000_000;

const optionalPlayerNameSchema = z
  .union([z.string().trim().max(PLAYER_NAME_MAX_LENGTH), z.null()])
  .optional()
  .transform((value) => {
    if (value === null || value === undefined) {
      return null;
    }

    return value.length > 0 ? value : null;
  });

const gameAttemptRequestSchema = z
  .object({
    coinsCollected: z.number().int().min(0).max(MAX_COINS_COLLECTED),
    distance: z.number().int().min(0).max(MAX_DISTANCE),
    isSuccess: z.boolean(),
    mode: z.enum(['story', 'endless']),
    playerName: optionalPlayerNameSchema,
    score: z.number().int().min(0).max(MAX_SCORE),
  })
  .strict();

type GameAttemptRequest = z.infer<typeof gameAttemptRequestSchema>;

type GameAttemptPostResponse =
  | {
      ok: true;
      data: {
        id: number;
      };
    }
  | {
      ok: false;
      error: {
        code: 'invalid_json' | 'validation_error' | 'internal_error';
        fields?: Record<string, string[]>;
        message: string;
      };
    };

type GameAttemptsGetResponse =
  | {
      ok: true;
      data: {
        leaderboard: {
          createdAt: string;
          id: number;
          playerName: string | null;
          score: number;
        }[];
      };
    }
  | {
      ok: false;
      error: {
        code: 'internal_error';
        message: string;
      };
    };

const jsonResponse = (body: GameAttemptPostResponse, status: number) =>
  NextResponse.json<GameAttemptPostResponse>(body, { status });

const formatZodError = (error: ZodError<GameAttemptRequest>) => {
  const fields: Record<string, string[]> = {};

  for (const issue of error.issues) {
    const field = issue.path.join('.') || '_root';
    fields[field] = [...(fields[field] ?? []), issue.message];
  }

  return fields;
};

export async function GET() {
  try {
    const prisma = getPrismaClient();
    const leaderboard = await prisma.gameAttempt.findMany({
      orderBy: [
        {
          score: 'desc',
        },
        {
          createdAt: 'asc',
        },
        {
          id: 'asc',
        },
      ],
      select: {
        createdAt: true,
        id: true,
        playerName: true,
        score: true,
      },
      take: 3,
      where: {
        mode: 'endless',
      },
    });

    return NextResponse.json<GameAttemptsGetResponse>({
      ok: true,
      data: {
        leaderboard: leaderboard.map((entry) => ({
          createdAt: entry.createdAt.toISOString(),
          id: entry.id,
          playerName: entry.playerName,
          score: entry.score,
        })),
      },
    });
  } catch {
    return NextResponse.json<GameAttemptsGetResponse>(
      {
        ok: false,
        error: {
          code: 'internal_error',
          message: 'Не удалось загрузить таблицу лидеров.',
        },
      },
      { status: 500 },
    );
  }
}

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

  const parsedBody = gameAttemptRequestSchema.safeParse(requestBody);

  if (!parsedBody.success) {
    return jsonResponse(
      {
        ok: false,
        error: {
          code: 'validation_error',
          fields: formatZodError(parsedBody.error),
          message: 'Проверьте поля статистики игры',
        },
      },
      422,
    );
  }

  const attempt = parsedBody.data;

  try {
    const prisma = getPrismaClient();
    const settings = await prisma.gameSettings.upsert({
      create: {
        endlessSpeedMultiplier: DEFAULT_GAME_SETTINGS.endlessSpeedMultiplier,
        id: GAME_SETTINGS_ROW_ID,
        storyRequiredDistance: DEFAULT_GAME_SETTINGS.storyRequiredDistance,
      },
      select: {
        storyRequiredDistance: true,
      },
      update: {},
      where: {
        id: GAME_SETTINGS_ROW_ID,
      },
    });
    const normalizedSettings = normalizeGameSettings({
      storyRequiredDistance: settings.storyRequiredDistance,
    });
    const isSuccess =
      attempt.mode === 'story' &&
      attempt.isSuccess &&
      attempt.distance >= normalizedSettings.storyRequiredDistance;

    const savedAttempt = await prisma.gameAttempt.create({
      data: {
        coinsCollected: attempt.coinsCollected,
        distance: attempt.distance,
        isSuccess,
        mode: attempt.mode,
        playerName: attempt.playerName,
        score: attempt.score,
      },
      select: {
        id: true,
      },
    });

    return jsonResponse(
      {
        ok: true,
        data: {
          id: savedAttempt.id,
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
          message: 'Не удалось сохранить статистику игры.',
        },
      },
      500,
    );
  }
}
