export type GameMode = 'story' | 'endless';

export type GameSettings = {
  endlessSpeedMultiplier: number;
  storyRequiredDistance: number;
};

export const GAME_SETTINGS_ROW_ID = 1;

export const GAME_MODE_LABELS: Record<GameMode, string> = {
  endless: 'На рекорд',
  story: 'Сюжетный',
};

export const DEFAULT_GAME_SETTINGS: GameSettings = {
  endlessSpeedMultiplier: 1,
  storyRequiredDistance: 2500,
};

export const normalizeGameSettings = (
  settings: Partial<GameSettings> | null | undefined,
): GameSettings => {
  const storyRequiredDistance =
    typeof settings?.storyRequiredDistance === 'number' &&
    Number.isFinite(settings.storyRequiredDistance) &&
    settings.storyRequiredDistance > 0
      ? Math.round(settings.storyRequiredDistance)
      : DEFAULT_GAME_SETTINGS.storyRequiredDistance;

  const endlessSpeedMultiplier =
    typeof settings?.endlessSpeedMultiplier === 'number' &&
    Number.isFinite(settings.endlessSpeedMultiplier) &&
    settings.endlessSpeedMultiplier > 0
      ? Math.min(settings.endlessSpeedMultiplier, 3)
      : DEFAULT_GAME_SETTINGS.endlessSpeedMultiplier;

  return {
    endlessSpeedMultiplier,
    storyRequiredDistance,
  };
};
