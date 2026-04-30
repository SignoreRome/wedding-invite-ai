'use client';

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type PointerEvent,
} from 'react';

import {
  DEFAULT_GAME_SETTINGS,
  GAME_MODE_LABELS,
  normalizeGameSettings,
  type GameMode,
  type GameSettings,
} from '@/lib/dino-game';

type GameStatus = 'idle' | 'running' | 'game-over';

type Obstacle = {
  height: number;
  iconSrc: string;
  id: number;
  width: number;
  x: number;
  y: number;
};

type Coin = {
  collected: boolean;
  id: number;
  size: number;
  x: number;
  y: number;
};

type GameState = {
  coins: Coin[];
  coinsCollected: number;
  dinoY: number;
  distance: number;
  nextCoinAt: number;
  nextEntityId: number;
  nextObstacleAt: number;
  obstacles: Obstacle[];
  ringBonusScore: number;
  score: number;
  speed: number;
  velocityY: number;
};

type Rect = {
  height: number;
  width: number;
  x: number;
  y: number;
};

type GameAssets = {
  dinoRunningSprite: HTMLCanvasElement | null;
  dinoStandingSprite: HTMLCanvasElement | null;
  obstacleIcons: ReadonlyMap<string, HTMLImageElement>;
  ringSprite: HTMLCanvasElement | null;
};

const GAME_WIDTH = 720;
const GAME_HEIGHT = 300;
const GROUND_Y = 238;
const DINO_X = 78;
const DINO_WIDTH = 94;
const DINO_HEIGHT = 108;
const GRAVITY = 1900;
const JUMP_VELOCITY = -760;
const INITIAL_SPEED = 245;
const MAX_SPEED = 430;
const SPEED_ACCELERATION = 0.026;
const DISTANCE_SCORE_DIVISOR = 32;
const RING_BASE_SCORE_BONUS = 120;
const RING_CHAIN_SCORE_BONUS = 15;
const OBSTACLE_HITBOX_INSET_X = 22;
const OBSTACLE_HITBOX_TOP_INSET = 22;
const OBSTACLE_HITBOX_BOTTOM_INSET = 18;
const RING_SPRITE_SRC = '/ring.png';
const STANDING_DINO_SPRITE_SRC = '/dino-bride.png';
const RUNNING_DINO_SPRITE_SRC = '/dino-bride-run.png';
const STANDING_DINO_SPRITE_CROP = {
  height: 410,
  width: 350,
  x: 72,
  y: 30,
} as const;
const RUNNING_DINO_SPRITE_CROP = {
  height: 370,
  width: 380,
  x: 66,
  y: 55,
} as const;
const RING_SPRITE_CROP = {
  height: 310,
  width: 310,
  x: 96,
  y: 100,
} as const;
const RING_SIZE = 32;

const desktopObstacleIconSrcs = [
  '/desktop-icons/recycle-bin.png',
  '/desktop-icons/my-computer.png',
  '/desktop-icons/counter-strike.png',
  '/desktop-icons/half-life-2.png',
  '/desktop-icons/doom-3.png',
  '/desktop-icons/diablo-2.png',
  '/desktop-icons/fallout.png',
  '/desktop-icons/morrowind.png',
  '/desktop-icons/nfs.png',
  '/desktop-icons/paint.png',
  '/desktop-icons/solitaire.png',
  '/desktop-icons/flash.png',
] as const;

const xpButtonClassName =
  'rounded-[3px] border border-t-white border-l-white border-r-[#404040] border-b-[#404040] bg-[#d4d0c8] px-4 py-2 text-sm font-bold text-black shadow-[inset_1px_1px_0_white] active:border-t-[#404040] active:border-l-[#404040] active:border-r-white active:border-b-white disabled:cursor-not-allowed disabled:border-[#808080] disabled:bg-[#c0c0c0] disabled:text-[#606060]';

const gameModes: readonly GameMode[] = ['story', 'endless'];

const randomBetween = (min: number, max: number) =>
  min + Math.random() * (max - min);

const getModeSpeedMultiplier = (
  mode: GameMode | null,
  settings: GameSettings,
) => (mode === 'endless' ? settings.endlessSpeedMultiplier : 1);

const getInitialGameState = (
  settings: GameSettings = DEFAULT_GAME_SETTINGS,
  mode: GameMode | null = null,
): GameState => ({
  coins: [],
  coinsCollected: 0,
  dinoY: GROUND_Y - DINO_HEIGHT,
  distance: 0,
  nextCoinAt: 150,
  nextEntityId: 1,
  nextObstacleAt: 360,
  obstacles: [],
  ringBonusScore: 0,
  score: 0,
  speed: INITIAL_SPEED * getModeSpeedMultiplier(mode, settings),
  velocityY: 0,
});

const intersects = (first: Rect, second: Rect) =>
  first.x < second.x + second.width &&
  first.x + first.width > second.x &&
  first.y < second.y + second.height &&
  first.y + first.height > second.y;

const getDinoHitbox = (dinoY: number): Rect => ({
  height: DINO_HEIGHT - 22,
  width: DINO_WIDTH - 30,
  x: DINO_X + 20,
  y: dinoY + 18,
});

const getObstacleHitbox = (obstacle: Obstacle): Rect => ({
  height: Math.max(
    1,
    obstacle.height - OBSTACLE_HITBOX_TOP_INSET - OBSTACLE_HITBOX_BOTTOM_INSET,
  ),
  width: Math.max(1, obstacle.width - OBSTACLE_HITBOX_INSET_X * 2),
  x: obstacle.x + OBSTACLE_HITBOX_INSET_X,
  y: obstacle.y + OBSTACLE_HITBOX_TOP_INSET,
});

const calculateRingScoreBonus = (collectedRingNumber: number) =>
  RING_BASE_SCORE_BONUS +
  Math.max(0, collectedRingNumber - 1) * RING_CHAIN_SCORE_BONUS;

const calculateScore = (state: GameState) =>
  Math.floor(state.distance / DISTANCE_SCORE_DIVISOR) + state.ringBonusScore;

const isRecord = (value: unknown): value is Record<string, unknown> =>
  Boolean(value) && typeof value === 'object' && !Array.isArray(value);

const fillPixel = (
  context: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  color: string,
) => {
  context.fillStyle = color;
  context.fillRect(Math.round(x), Math.round(y), width, height);
};

const loadImage = (src: string) =>
  new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();

    image.decoding = 'async';
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error(`Failed to load image: ${src}`));
    image.src = src;
  });

const isBackgroundPixel = (
  pixels: Uint8ClampedArray,
  offset: number,
): boolean => {
  const red = pixels[offset];
  const green = pixels[offset + 1];
  const blue = pixels[offset + 2];
  const maxChannel = Math.max(red, green, blue);
  const minChannel = Math.min(red, green, blue);

  return red > 232 && green > 232 && blue > 232 && maxChannel - minChannel < 24;
};

const isCheckerBackgroundPixel = (
  pixels: Uint8ClampedArray,
  offset: number,
): boolean => {
  const red = pixels[offset];
  const green = pixels[offset + 1];
  const blue = pixels[offset + 2];
  const maxChannel = Math.max(red, green, blue);
  const minChannel = Math.min(red, green, blue);

  return minChannel > 224 && maxChannel - minChannel < 16;
};

const createTransparentDinoSprite = (image: HTMLImageElement) => {
  const canvas = document.createElement('canvas');
  const width = image.naturalWidth;
  const height = image.naturalHeight;
  const context = canvas.getContext('2d', { willReadFrequently: true });

  canvas.width = width;
  canvas.height = height;

  if (!context) {
    return canvas;
  }

  context.drawImage(image, 0, 0);

  const imageData = context.getImageData(0, 0, width, height);
  const visitedPixels = new Uint8Array(width * height);
  const pixelsToCheck: number[] = [];

  const pushPixel = (x: number, y: number) => {
    if (x < 0 || x >= width || y < 0 || y >= height) {
      return;
    }

    const index = y * width + x;

    if (visitedPixels[index] === 0) {
      pixelsToCheck.push(index);
    }
  };

  for (let x = 0; x < width; x += 1) {
    pushPixel(x, 0);
    pushPixel(x, height - 1);
  }

  for (let y = 1; y < height - 1; y += 1) {
    pushPixel(0, y);
    pushPixel(width - 1, y);
  }

  while (pixelsToCheck.length > 0) {
    const index = pixelsToCheck.pop();

    if (index === undefined || visitedPixels[index] === 1) {
      continue;
    }

    visitedPixels[index] = 1;

    const offset = index * 4;

    if (!isBackgroundPixel(imageData.data, offset)) {
      continue;
    }

    imageData.data[offset + 3] = 0;

    const x = index % width;
    const y = Math.floor(index / width);

    pushPixel(x + 1, y);
    pushPixel(x - 1, y);
    pushPixel(x, y + 1);
    pushPixel(x, y - 1);
  }

  context.putImageData(imageData, 0, 0);

  return canvas;
};

const createTransparentRingSprite = (image: HTMLImageElement) => {
  const canvas = document.createElement('canvas');
  const width = image.naturalWidth;
  const height = image.naturalHeight;
  const context = canvas.getContext('2d', { willReadFrequently: true });

  canvas.width = width;
  canvas.height = height;

  if (!context) {
    return canvas;
  }

  context.drawImage(image, 0, 0);

  const imageData = context.getImageData(0, 0, width, height);

  for (let offset = 0; offset < imageData.data.length; offset += 4) {
    if (isCheckerBackgroundPixel(imageData.data, offset)) {
      imageData.data[offset + 3] = 0;
    }
  }

  context.putImageData(imageData, 0, 0);

  return canvas;
};

const loadGameAssets = async (): Promise<GameAssets> => {
  const [standingDinoImage, runningDinoImage, ringImage, ...obstacleImages] =
    await Promise.all([
      loadImage(STANDING_DINO_SPRITE_SRC),
      loadImage(RUNNING_DINO_SPRITE_SRC),
      loadImage(RING_SPRITE_SRC),
      ...desktopObstacleIconSrcs.map((iconSrc) => loadImage(iconSrc)),
    ]);

  return {
    dinoRunningSprite: createTransparentDinoSprite(runningDinoImage),
    dinoStandingSprite: createTransparentDinoSprite(standingDinoImage),
    obstacleIcons: new Map(
      desktopObstacleIconSrcs.map((iconSrc, index) => [
        iconSrc,
        obstacleImages[index],
      ]),
    ),
    ringSprite: createTransparentRingSprite(ringImage),
  };
};
const drawFallbackDino = (
  context: CanvasRenderingContext2D,
  x: number,
  y: number,
) => {
  fillPixel(context, x + 18, y + 5, 25, 18, '#4f9d47');
  fillPixel(context, x + 35, y + 12, 16, 10, '#4f9d47');
  fillPixel(context, x + 43, y + 18, 8, 8, '#3b7f35');
  fillPixel(context, x + 30, y + 10, 4, 4, '#111111');
  fillPixel(context, x + 10, y + 24, 29, 23, '#4f9d47');
  fillPixel(context, x + 1, y + 32, 15, 8, '#4f9d47');
  fillPixel(context, x + 7, y + 39, 8, 7, '#3b7f35');
  fillPixel(context, x + 12, y + 37, 36, 22, '#fff8e7');
  fillPixel(context, x + 7, y + 51, 45, 11, '#f3e4c4');
  fillPixel(context, x + 17, y + 61, 8, 5, '#4f9d47');
  fillPixel(context, x + 36, y + 61, 8, 5, '#4f9d47');
  fillPixel(context, x + 15, y + 3, 18, 6, '#ffffff');
  fillPixel(context, x + 10, y + 0, 10, 12, '#f5f9ff');
  fillPixel(context, x + 39, y + 42, 8, 5, '#ff88aa');
  fillPixel(context, x + 17, y + 49, 4, 4, '#ff88aa');
  fillPixel(context, x + 30, y + 52, 4, 4, '#ff88aa');
};

const drawBrideDino = (
  context: CanvasRenderingContext2D,
  x: number,
  y: number,
  state: GameState,
  status: GameStatus,
  assets: GameAssets,
) => {
  const isGrounded = y >= GROUND_Y - DINO_HEIGHT - 1;
  const isRunningFrame =
    status === 'running' &&
    isGrounded &&
    Math.floor(state.distance / 42) % 2 === 1;
  const sprite = isRunningFrame
    ? assets.dinoRunningSprite
    : assets.dinoStandingSprite;
  const crop = isRunningFrame
    ? RUNNING_DINO_SPRITE_CROP
    : STANDING_DINO_SPRITE_CROP;

  if (sprite) {
    context.drawImage(
      sprite,
      crop.x,
      crop.y,
      crop.width,
      crop.height,
      Math.round(x),
      Math.round(y),
      DINO_WIDTH,
      DINO_HEIGHT,
    );
    return;
  }

  drawFallbackDino(context, x, y + DINO_HEIGHT - 66);
};

const drawFallbackRing = (context: CanvasRenderingContext2D, ring: Coin) => {
  fillPixel(context, ring.x + 7, ring.y + 2, ring.size - 14, 5, '#ffe66b');
  fillPixel(context, ring.x + 3, ring.y + 8, 7, ring.size - 16, '#ffc928');
  fillPixel(
    context,
    ring.x + ring.size - 10,
    ring.y + 8,
    7,
    ring.size - 16,
    '#d99000',
  );
  fillPixel(
    context,
    ring.x + 7,
    ring.y + ring.size - 7,
    ring.size - 14,
    5,
    '#a96900',
  );
};

const drawRing = (
  context: CanvasRenderingContext2D,
  ring: Coin,
  assets: GameAssets,
) => {
  if (assets.ringSprite) {
    context.drawImage(
      assets.ringSprite,
      RING_SPRITE_CROP.x,
      RING_SPRITE_CROP.y,
      RING_SPRITE_CROP.width,
      RING_SPRITE_CROP.height,
      Math.round(ring.x),
      Math.round(ring.y),
      ring.size,
      ring.size,
    );
    return;
  }

  drawFallbackRing(context, ring);
};

const drawObstacle = (
  context: CanvasRenderingContext2D,
  obstacle: Obstacle,
  assets: GameAssets,
) => {
  const icon = assets.obstacleIcons.get(obstacle.iconSrc);

  if (icon) {
    context.drawImage(
      icon,
      Math.round(obstacle.x),
      Math.round(obstacle.y),
      obstacle.width,
      obstacle.height,
    );
    return;
  }

  fillPixel(
    context,
    obstacle.x,
    obstacle.y,
    obstacle.width,
    obstacle.height,
    '#d4d0c8',
  );
  fillPixel(context, obstacle.x, obstacle.y, obstacle.width, 10, '#0054e3');
  fillPixel(
    context,
    obstacle.x + 3,
    obstacle.y + 14,
    obstacle.width - 6,
    obstacle.height - 18,
    '#f8f8f8',
  );
  fillPixel(context, obstacle.x + 10, obstacle.y + 19, 6, 6, '#d40000');
  fillPixel(context, obstacle.x + 12, obstacle.y + 17, 2, 10, '#d40000');
  fillPixel(context, obstacle.x + 8, obstacle.y + 21, 10, 2, '#d40000');
  fillPixel(
    context,
    obstacle.x + 23,
    obstacle.y + 20,
    obstacle.width - 31,
    3,
    '#808080',
  );
  fillPixel(
    context,
    obstacle.x + 23,
    obstacle.y + 27,
    obstacle.width - 37,
    3,
    '#808080',
  );
  fillPixel(
    context,
    obstacle.x,
    obstacle.y + obstacle.height - 3,
    obstacle.width,
    3,
    '#404040',
  );
};

const drawScene = (
  context: CanvasRenderingContext2D,
  state: GameState,
  status: GameStatus,
  assets: GameAssets,
) => {
  context.clearRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
  context.imageSmoothingEnabled = false;

  fillPixel(context, 0, 0, GAME_WIDTH, GAME_HEIGHT, '#f7fbff');

  for (let x = -((state.distance / 2) % 64); x < GAME_WIDTH; x += 64) {
    fillPixel(context, x + 12, 45, 24, 6, '#d9e8ff');
    fillPixel(context, x + 30, 39, 18, 6, '#d9e8ff');
    fillPixel(context, x + 48, 45, 18, 6, '#d9e8ff');
  }

  fillPixel(context, 0, GROUND_Y, GAME_WIDTH, 3, '#404040');
  fillPixel(
    context,
    0,
    GROUND_Y + 3,
    GAME_WIDTH,
    GAME_HEIGHT - GROUND_Y - 3,
    '#ece9d8',
  );

  for (let x = -(state.distance % 28); x < GAME_WIDTH; x += 28) {
    fillPixel(context, x, GROUND_Y + 24, 14, 2, '#b8b2a6');
  }

  state.coins
    .filter((coin) => !coin.collected)
    .forEach((coin) => drawRing(context, coin, assets));
  state.obstacles.forEach((obstacle) =>
    drawObstacle(context, obstacle, assets),
  );
  drawBrideDino(context, DINO_X, state.dinoY, state, status, assets);

  context.font = '16px "Lucida Console", "Courier New", monospace';
  context.fillStyle = '#003399';
  context.fillText(`SCORE ${state.score.toString().padStart(4, '0')}`, 18, 28);

  if (status === 'idle') {
    fillPixel(context, 258, 118, 206, 50, '#d4d0c8');
    fillPixel(context, 258, 118, 206, 10, '#0054e3');
    context.fillStyle = '#111111';
    context.font = '14px "Lucida Console", "Courier New", monospace';
    context.fillText('DINO BRIDE.EXE', 294, 150);
  }

  if (status === 'game-over') {
    fillPixel(context, 236, 106, 248, 66, '#d4d0c8');
    fillPixel(context, 236, 106, 248, 12, '#0054e3');
    context.fillStyle = '#111111';
    context.font = '14px "Lucida Console", "Courier New", monospace';
    context.fillText('Потрачено', 300, 141);
    context.fillText(`RINGS ${state.coinsCollected}`, 306, 160);
  }
};

const spawnObstacle = (state: GameState) => {
  const size = Math.round(randomBetween(80, 92));
  const iconSrc =
    desktopObstacleIconSrcs[
      Math.floor(Math.random() * desktopObstacleIconSrcs.length)
    ];

  state.obstacles.push({
    height: size,
    iconSrc,
    id: state.nextEntityId,
    width: size,
    x: GAME_WIDTH + 8,
    y: GROUND_Y - size,
  });
  state.nextEntityId += 1;
  state.nextObstacleAt = state.distance + randomBetween(410, 610);
};

const spawnCoin = (state: GameState) => {
  const possibleY = [GROUND_Y - 68, GROUND_Y - 108, GROUND_Y - 142];

  state.coins.push({
    collected: false,
    id: state.nextEntityId,
    size: RING_SIZE,
    x: GAME_WIDTH + 12,
    y: possibleY[Math.floor(Math.random() * possibleY.length)],
  });
  state.nextEntityId += 1;
  state.nextCoinAt = state.distance + randomBetween(210, 330);
};

const updateGame = (
  state: GameState,
  deltaTime: number,
  mode: GameMode | null,
  settings: GameSettings,
) => {
  const speedMultiplier = getModeSpeedMultiplier(mode, settings);

  state.distance += state.speed * deltaTime;
  state.speed = Math.min(
    INITIAL_SPEED * speedMultiplier +
      state.distance * SPEED_ACCELERATION * speedMultiplier,
    MAX_SPEED * speedMultiplier,
  );

  state.velocityY += GRAVITY * deltaTime;
  state.dinoY = Math.min(
    GROUND_Y - DINO_HEIGHT,
    state.dinoY + state.velocityY * deltaTime,
  );

  if (state.dinoY >= GROUND_Y - DINO_HEIGHT) {
    state.velocityY = 0;
  }

  if (state.distance >= state.nextObstacleAt) {
    spawnObstacle(state);
  }

  if (state.distance >= state.nextCoinAt) {
    spawnCoin(state);
  }

  state.obstacles = state.obstacles
    .map((obstacle) => ({
      ...obstacle,
      x: obstacle.x - state.speed * deltaTime,
    }))
    .filter((obstacle) => obstacle.x + obstacle.width > -20);

  state.coins = state.coins
    .map((coin) => ({
      ...coin,
      x: coin.x - state.speed * deltaTime,
    }))
    .filter((coin) => coin.x + coin.size > -20 && !coin.collected);

  const dinoHitbox = getDinoHitbox(state.dinoY);

  state.coins = state.coins.map((coin) => {
    if (
      coin.collected ||
      !intersects(dinoHitbox, {
        height: coin.size,
        width: coin.size,
        x: coin.x,
        y: coin.y,
      })
    ) {
      return coin;
    }

    const collectedRingNumber = state.coinsCollected + 1;

    state.coinsCollected = collectedRingNumber;
    state.ringBonusScore += calculateRingScoreBonus(collectedRingNumber);

    return { ...coin, collected: true };
  });

  state.score = calculateScore(state);

  return state.obstacles.some((obstacle) =>
    intersects(dinoHitbox, getObstacleHitbox(obstacle)),
  );
};

export function DinoMinigameLauncher() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRef = useRef<number | null>(null);
  const lastFrameTimeRef = useRef<number | null>(null);
  const gameStateRef = useRef<GameState>(getInitialGameState());
  const gameSettingsRef = useRef<GameSettings>(DEFAULT_GAME_SETTINGS);
  const selectedModeRef = useRef<GameMode | null>(null);
  const assetsRef = useRef<GameAssets>({
    dinoRunningSprite: null,
    dinoStandingSprite: null,
    obstacleIcons: new Map(),
    ringSprite: null,
  });
  const statusRef = useRef<GameStatus>('idle');
  const publishedScoreRef = useRef(0);
  const [isOpen, setIsOpen] = useState(false);
  const [score, setScore] = useState(0);
  const [bestScore, setBestScore] = useState(0);
  const [selectedMode, setSelectedMode] = useState<GameMode | null>(null);
  const [status, setStatus] = useState<GameStatus>('idle');
  const [assetsVersion, setAssetsVersion] = useState(0);

  useEffect(() => {
    statusRef.current = status;
  }, [status]);

  useEffect(() => {
    let isCanceled = false;

    loadGameAssets()
      .then((assets) => {
        if (isCanceled) {
          return;
        }

        assetsRef.current = assets;
        setAssetsVersion((currentVersion) => currentVersion + 1);
      })
      .catch(() => {
        if (!isCanceled) {
          setAssetsVersion((currentVersion) => currentVersion + 1);
        }
      });

    return () => {
      isCanceled = true;
    };
  }, []);

  const cancelAnimation = useCallback(() => {
    if (animationFrameRef.current !== null) {
      window.cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }

    lastFrameTimeRef.current = null;
  }, []);

  const drawCurrentFrame = useCallback(
    (nextStatus: GameStatus = statusRef.current) => {
      const canvas = canvasRef.current;
      const context = canvas?.getContext('2d');

      if (!canvas || !context) {
        return;
      }

      drawScene(context, gameStateRef.current, nextStatus, assetsRef.current);
    },
    [],
  );

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const abortController = new AbortController();

    const loadSettings = async () => {
      try {
        const response = await fetch('/api/game/settings', {
          cache: 'no-store',
          signal: abortController.signal,
        });

        if (!response.ok) {
          return;
        }

        const body: unknown = await response.json();

        if (!isRecord(body) || body.ok !== true || !isRecord(body.data)) {
          return;
        }

        gameSettingsRef.current = normalizeGameSettings({
          endlessSpeedMultiplier:
            typeof body.data.endlessSpeedMultiplier === 'number'
              ? body.data.endlessSpeedMultiplier
              : undefined,
          storyRequiredDistance:
            typeof body.data.storyRequiredDistance === 'number'
              ? body.data.storyRequiredDistance
              : undefined,
        });

        if (statusRef.current !== 'running') {
          gameStateRef.current = getInitialGameState(
            gameSettingsRef.current,
            selectedModeRef.current,
          );
          publishedScoreRef.current = 0;
          setScore(0);
          drawCurrentFrame(statusRef.current);
        }
      } catch {
        if (abortController.signal.aborted) {
          return;
        }
      }
    };

    void loadSettings();

    return () => {
      abortController.abort();
    };
  }, [drawCurrentFrame, isOpen]);

  const saveGameAttempt = useCallback(
    (mode: GameMode, state: GameState, isSuccess: boolean) => {
      void fetch('/api/game/attempts', {
        body: JSON.stringify({
          coinsCollected: state.coinsCollected,
          distance: Math.round(state.distance),
          isSuccess,
          mode,
          playerName: null,
          score: state.score,
        }),
        headers: {
          'Content-Type': 'application/json',
        },
        method: 'POST',
      }).catch(() => undefined);
    },
    [],
  );

  const animate = useCallback(
    (timestamp: number) => {
      const previousTimestamp = lastFrameTimeRef.current ?? timestamp;
      const deltaTime = Math.min((timestamp - previousTimestamp) / 1000, 0.035);

      lastFrameTimeRef.current = timestamp;

      const hasCollision = updateGame(
        gameStateRef.current,
        deltaTime,
        selectedModeRef.current,
        gameSettingsRef.current,
      );
      drawCurrentFrame('running');

      if (gameStateRef.current.score !== publishedScoreRef.current) {
        publishedScoreRef.current = gameStateRef.current.score;
        setScore(gameStateRef.current.score);
      }

      if (hasCollision) {
        const currentMode = selectedModeRef.current;

        cancelAnimation();
        setBestScore((currentBestScore) =>
          Math.max(currentBestScore, gameStateRef.current.score),
        );
        if (currentMode) {
          saveGameAttempt(currentMode, gameStateRef.current, false);
        }
        statusRef.current = 'game-over';
        setStatus('game-over');
        drawCurrentFrame('game-over');
        return;
      }

      animationFrameRef.current = window.requestAnimationFrame(animate);
    },
    [cancelAnimation, drawCurrentFrame, saveGameAttempt],
  );

  const startGame = useCallback(() => {
    const mode = selectedModeRef.current;

    if (!mode) {
      return;
    }

    cancelAnimation();
    gameStateRef.current = getInitialGameState(gameSettingsRef.current, mode);
    publishedScoreRef.current = 0;
    setScore(0);
    statusRef.current = 'running';
    setStatus('running');
    lastFrameTimeRef.current = null;
    animationFrameRef.current = window.requestAnimationFrame(animate);
  }, [animate, cancelAnimation]);

  const selectMode = useCallback(
    (mode: GameMode) => {
      if (statusRef.current === 'running') {
        return;
      }

      cancelAnimation();
      selectedModeRef.current = mode;
      setSelectedMode(mode);
      gameStateRef.current = getInitialGameState(gameSettingsRef.current, mode);
      publishedScoreRef.current = 0;
      setScore(0);
      statusRef.current = 'idle';
      setStatus('idle');
      drawCurrentFrame('idle');
    },
    [cancelAnimation, drawCurrentFrame],
  );

  const jump = useCallback(() => {
    const state = gameStateRef.current;
    const isGrounded = state.dinoY >= GROUND_Y - DINO_HEIGHT - 1;

    if (statusRef.current !== 'running' || !isGrounded) {
      return;
    }

    state.velocityY = JUMP_VELOCITY;
  }, []);

  const handleCanvasPointerDown = (event: PointerEvent<HTMLCanvasElement>) => {
    event.preventDefault();

    if (statusRef.current === 'running') {
      jump();
      return;
    }

    if (!selectedModeRef.current) {
      return;
    }

    startGame();
  };

  const closeWindow = () => {
    cancelAnimation();
    setIsOpen(false);
    selectedModeRef.current = null;
    setSelectedMode(null);
    statusRef.current = 'idle';
    setStatus('idle');
    gameStateRef.current = getInitialGameState(gameSettingsRef.current, null);
    setScore(0);
  };

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    drawCurrentFrame(status);
  }, [assetsVersion, drawCurrentFrame, isOpen, status]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;

      if (target?.closest('button, a, input, textarea, select')) {
        return;
      }

      if (event.code !== 'Space' && event.code !== 'ArrowUp') {
        return;
      }

      event.preventDefault();

      if (statusRef.current === 'running') {
        jump();
        return;
      }

      if (!selectedModeRef.current) {
        return;
      }

      startGame();
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, jump, startGame]);

  useEffect(() => cancelAnimation, [cancelAnimation]);

  const primaryActionLabel =
    status === 'running'
      ? 'Идет игра'
      : status === 'game-over'
        ? 'Restart'
        : selectedMode
          ? 'Start game'
          : 'Выберите режим';
  const selectedModeLabel = selectedMode
    ? GAME_MODE_LABELS[selectedMode]
    : 'Не выбран';

  return (
    <>
      <button
        className="rounded-[3px] border border-t-white border-l-white border-r-[#404040] border-b-[#404040] bg-[#d4d0c8] px-4 py-2 text-sm font-bold text-black shadow-[inset_1px_1px_0_white] active:border-t-[#404040] active:border-l-[#404040] active:border-r-white active:border-b-white"
        onClick={() => setIsOpen(true)}
        type="button"
      >
        Start
      </button>

      {isOpen ? (
        <div
          aria-labelledby="dino-minigame-title"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/35 px-2 py-4 sm:px-4"
          role="dialog"
        >
          <div className="w-full max-w-[760px] overflow-hidden border-t-2 border-l-2 border-r-2 border-b-2 border-t-white border-l-white border-r-[#404040] border-b-[#404040] bg-[#d4d0c8] shadow-[8px_8px_0_rgba(0,0,0,0.3)]">
            <div className="flex items-center justify-between gap-3 bg-gradient-to-r from-[#0054e3] via-[#2b7cff] to-[#67a7ff] px-2 py-1.5 text-sm font-bold text-white">
              <span id="dino-minigame-title" className="truncate">
                Dino Bride.exe
              </span>
              <button
                aria-label="Закрыть миниигру"
                className="flex h-8 w-8 items-center justify-center border border-t-white border-l-white border-r-[#404040] border-b-[#404040] bg-[#d4d0c8] text-lg leading-none text-black active:border-t-[#404040] active:border-l-[#404040] active:border-r-white active:border-b-white sm:h-6 sm:w-6 sm:text-base"
                onClick={closeWindow}
                type="button"
              >
                x
              </button>
            </div>

            <div className="space-y-3 border-t border-white bg-[#ece9d8] p-3 sm:p-4">
              <div
                aria-label="Выбор режима игры"
                className="grid grid-cols-2 gap-2"
                role="group"
              >
                {gameModes.map((mode) => (
                  <button
                    aria-pressed={selectedMode === mode}
                    className={`${xpButtonClassName} ${
                      selectedMode === mode
                        ? 'ring-2 ring-[#003399] ring-offset-1 ring-offset-[#ece9d8]'
                        : ''
                    }`}
                    disabled={status === 'running'}
                    key={mode}
                    onClick={() => selectMode(mode)}
                    type="button"
                  >
                    {GAME_MODE_LABELS[mode]}
                  </button>
                ))}
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs font-bold text-[#003399] sm:grid-cols-4">
                <div className="truncate border border-[#7f9db9] bg-white px-2 py-1 shadow-[inset_1px_1px_0_white]">
                  Режим: {selectedModeLabel}
                </div>
                <div className="border border-[#7f9db9] bg-white px-2 py-1 shadow-[inset_1px_1px_0_white]">
                  Score: {score}
                </div>
                <div className="border border-[#7f9db9] bg-white px-2 py-1 text-center shadow-[inset_1px_1px_0_white]">
                  Rings: {gameStateRef.current.coinsCollected}
                </div>
                <div className="border border-[#7f9db9] bg-white px-2 py-1 text-right shadow-[inset_1px_1px_0_white]">
                  Best: {bestScore}
                </div>
              </div>

              <div className="border border-[#808080] bg-white p-1 shadow-[inset_1px_1px_0_rgba(0,0,0,0.25)]">
                <canvas
                  aria-label="Миниигра Dino Bride"
                  className="dino-game-canvas block h-auto w-full bg-white"
                  height={GAME_HEIGHT}
                  onPointerDown={handleCanvasPointerDown}
                  ref={canvasRef}
                  role="img"
                  width={GAME_WIDTH}
                />
              </div>

              <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap sm:items-center sm:justify-between">
                <button
                  className={xpButtonClassName}
                  disabled={status === 'running' || !selectedMode}
                  onClick={startGame}
                  type="button"
                >
                  {primaryActionLabel}
                </button>
                <button
                  className={xpButtonClassName}
                  disabled={status !== 'running'}
                  onClick={jump}
                  type="button"
                >
                  Прыжок
                </button>
                <button
                  className={`${xpButtonClassName} col-span-2 sm:ml-auto`}
                  onClick={closeWindow}
                  type="button"
                >
                  Закрыть
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
