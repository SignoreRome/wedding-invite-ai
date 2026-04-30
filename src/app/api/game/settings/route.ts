import { NextResponse } from 'next/server';

import {
  DEFAULT_GAME_SETTINGS,
  GAME_SETTINGS_ROW_ID,
  normalizeGameSettings,
} from '@/lib/dino-game';
import { getPrismaClient } from '@/lib/prisma';

export const runtime = 'nodejs';

export async function GET() {
  try {
    const prisma = getPrismaClient();
    const settings = await prisma.gameSettings.upsert({
      create: {
        endlessSpeedMultiplier: DEFAULT_GAME_SETTINGS.endlessSpeedMultiplier,
        id: GAME_SETTINGS_ROW_ID,
        storyRequiredDistance: DEFAULT_GAME_SETTINGS.storyRequiredDistance,
      },
      select: {
        endlessSpeedMultiplier: true,
        storyRequiredDistance: true,
      },
      update: {},
      where: {
        id: GAME_SETTINGS_ROW_ID,
      },
    });

    return NextResponse.json({
      ok: true,
      data: normalizeGameSettings(settings),
    });
  } catch {
    return NextResponse.json(
      {
        ok: false,
        error: {
          code: 'internal_error',
          message: 'Не удалось загрузить настройки игры.',
        },
      },
      { status: 500 },
    );
  }
}
