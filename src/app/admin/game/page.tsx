import type { Metadata } from 'next';
import { revalidatePath } from 'next/cache';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import type { ReactNode } from 'react';

import {
  clearAdminSessionCookie,
  getAdminPassword,
  isAdminAuthenticated,
  secureEqual,
  setAdminSessionCookie,
} from '@/lib/admin-auth';
import {
  DEFAULT_GAME_SETTINGS,
  GAME_MODE_LABELS,
  GAME_SETTINGS_ROW_ID,
  type GameMode,
} from '@/lib/dino-game';
import { getPrismaClient } from '@/lib/prisma';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export const metadata: Metadata = {
  title: 'Game admin | Wedding invite',
  robots: {
    follow: false,
    index: false,
  },
};

const STORY_REQUIRED_DISTANCE_MIN = 1;
const STORY_REQUIRED_DISTANCE_MAX = 10_000_000;
const ENDLESS_SPEED_MULTIPLIER_MIN = 0.01;
const ENDLESS_SPEED_MULTIPLIER_MAX = 3;

type SearchParams = Record<string, string | string[] | undefined>;

type AdminGamePageProps = {
  searchParams?: Promise<SearchParams>;
};

type GameSettingsRow = {
  endlessSpeedMultiplier: number;
  storyRequiredDistance: number;
  updatedAt: Date;
};

type GameAttemptRow = {
  coinsCollected: number;
  createdAt: Date;
  distance: number;
  id: number;
  isSuccess: boolean;
  mode: string;
  playerName: string | null;
  score: number;
};

type GameStats = {
  latestAttempts: GameAttemptRow[];
  storySuccessCount: number;
  topEndlessAttempt: GameAttemptRow | null;
  totalAttempts: number;
};

function getSingleParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function formatDateTime(value: Date) {
  return new Intl.DateTimeFormat('ru-RU', {
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(value);
}

function formatInteger(value: number) {
  return new Intl.NumberFormat('ru-RU').format(value);
}

function formatMultiplier(value: number) {
  return new Intl.NumberFormat('ru-RU', {
    maximumFractionDigits: 2,
    minimumFractionDigits: 0,
  }).format(value);
}

function formatOptionalText(value: string | null) {
  return value?.trim() ? value : '—';
}

function getModeText(mode: string) {
  return mode === 'story' || mode === 'endless'
    ? GAME_MODE_LABELS[mode as GameMode]
    : mode;
}

function getStatusMessage(status: string | undefined) {
  if (status === 'settings_saved') {
    return 'Настройки игры сохранены.';
  }

  return null;
}

function getAdminErrorText(error: string | undefined) {
  if (error === 'settings_validation') {
    return 'Проверьте значения: дистанция должна быть целым числом от 1 до 10 000 000, множитель скорости — числом от 0.01 до 3.';
  }

  if (error === 'settings_save_failed') {
    return 'Не удалось сохранить настройки игры. Проверьте подключение к SQLite и попробуйте еще раз.';
  }

  return null;
}

function parseNumberValue(value: FormDataEntryValue | null) {
  if (typeof value !== 'string') {
    return NaN;
  }

  return Number(value.replace(',', '.'));
}

function parseGameSettingsForm(formData: FormData) {
  const storyRequiredDistance = parseNumberValue(
    formData.get('storyRequiredDistance'),
  );
  const endlessSpeedMultiplier = parseNumberValue(
    formData.get('endlessSpeedMultiplier'),
  );

  if (
    !Number.isSafeInteger(storyRequiredDistance) ||
    storyRequiredDistance < STORY_REQUIRED_DISTANCE_MIN ||
    storyRequiredDistance > STORY_REQUIRED_DISTANCE_MAX ||
    !Number.isFinite(endlessSpeedMultiplier) ||
    endlessSpeedMultiplier < ENDLESS_SPEED_MULTIPLIER_MIN ||
    endlessSpeedMultiplier > ENDLESS_SPEED_MULTIPLIER_MAX
  ) {
    return null;
  }

  return {
    endlessSpeedMultiplier,
    storyRequiredDistance,
  };
}

async function getGameSettings() {
  const prisma = getPrismaClient();

  return prisma.gameSettings.upsert({
    create: {
      endlessSpeedMultiplier: DEFAULT_GAME_SETTINGS.endlessSpeedMultiplier,
      id: GAME_SETTINGS_ROW_ID,
      storyRequiredDistance: DEFAULT_GAME_SETTINGS.storyRequiredDistance,
    },
    select: {
      endlessSpeedMultiplier: true,
      storyRequiredDistance: true,
      updatedAt: true,
    },
    update: {},
    where: {
      id: GAME_SETTINGS_ROW_ID,
    },
  });
}

async function getGameStats(): Promise<GameStats> {
  const prisma = getPrismaClient();
  const attemptSelect = {
    coinsCollected: true,
    createdAt: true,
    distance: true,
    id: true,
    isSuccess: true,
    mode: true,
    playerName: true,
    score: true,
  } satisfies Record<keyof GameAttemptRow, true>;

  const [totalAttempts, storySuccessCount, topEndlessAttempt, latestAttempts] =
    await Promise.all([
      prisma.gameAttempt.count(),
      prisma.gameAttempt.count({
        where: {
          isSuccess: true,
          mode: 'story',
        },
      }),
      prisma.gameAttempt.findFirst({
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
        select: attemptSelect,
        where: {
          mode: 'endless',
        },
      }),
      prisma.gameAttempt.findMany({
        orderBy: {
          createdAt: 'desc',
        },
        select: attemptSelect,
        take: 10,
      }),
    ]);

  return {
    latestAttempts,
    storySuccessCount,
    topEndlessAttempt,
    totalAttempts,
  };
}

async function loginToGameAdmin(formData: FormData) {
  'use server';

  const password = getAdminPassword();
  const submittedPassword = formData.get('password');

  if (!password) {
    redirect('/admin/game?error=not_configured');
  }

  if (
    typeof submittedPassword !== 'string' ||
    !secureEqual(submittedPassword, password)
  ) {
    redirect('/admin/game?error=invalid_password');
  }

  await setAdminSessionCookie(password);

  redirect('/admin/game');
}

async function logoutFromGameAdmin() {
  'use server';

  await clearAdminSessionCookie();

  redirect('/admin/game');
}

async function updateGameSettings(formData: FormData) {
  'use server';

  if (!(await isAdminAuthenticated())) {
    redirect('/admin/game');
  }

  const settings = parseGameSettingsForm(formData);

  if (!settings) {
    redirect('/admin/game?error=settings_validation');
  }

  const prisma = getPrismaClient();

  try {
    await prisma.gameSettings.upsert({
      create: {
        endlessSpeedMultiplier: settings.endlessSpeedMultiplier,
        id: GAME_SETTINGS_ROW_ID,
        storyRequiredDistance: settings.storyRequiredDistance,
      },
      update: {
        endlessSpeedMultiplier: settings.endlessSpeedMultiplier,
        storyRequiredDistance: settings.storyRequiredDistance,
      },
      where: {
        id: GAME_SETTINGS_ROW_ID,
      },
    });
  } catch {
    redirect('/admin/game?error=settings_save_failed');
  }

  revalidatePath('/admin/game');
  redirect('/admin/game?status=settings_saved');
}

function AdminWindow({ children }: { children: ReactNode }) {
  return (
    <main className="mx-auto min-h-screen w-full max-w-7xl px-3 py-4 text-black sm:px-5 md:py-8">
      <section className="overflow-hidden rounded-[6px] border-2 border-t-white border-l-white border-r-[#404040] border-b-[#404040] bg-[#d4d0c8] shadow-[8px_8px_0_rgba(0,0,0,0.2)]">
        <div className="flex items-center justify-between gap-3 bg-gradient-to-r from-[#0054e3] via-[#2b7cff] to-[#67a7ff] px-3 py-2 text-sm font-bold text-white">
          <h1 className="truncate text-sm font-bold">Game Admin - dino.cpl</h1>
          <div aria-hidden="true" className="flex shrink-0 gap-1">
            {['_', '□', '×'].map((label) => (
              <span
                className="flex h-5 w-5 items-center justify-center border border-t-white border-l-white border-r-[#404040] border-b-[#404040] bg-[#d4d0c8] text-xs leading-none text-black"
                key={label}
              >
                {label}
              </span>
            ))}
          </div>
        </div>

        <div className="border-b border-[#808080] bg-[#ece9d8] px-3 py-1 text-sm">
          <div className="flex flex-wrap gap-4 text-[#2c2c2c]">
            <span>Файл</span>
            <span>Вид</span>
            <span>Настройки</span>
            <span>Справка</span>
          </div>
        </div>

        <div className="bg-[#ece9d8] p-3 sm:p-5">{children}</div>
      </section>
    </main>
  );
}

function XpPanel({ children, title }: { children: ReactNode; title: string }) {
  return (
    <section className="border border-[#7f9db9] bg-[#f8f8f8]">
      <div className="flex items-center gap-2 border-b border-[#c7c7c7] bg-gradient-to-r from-white to-[#eef3ff] px-4 py-3">
        <span
          aria-hidden="true"
          className="h-3 w-3 shrink-0 border border-[#404040] bg-[#1d8b3b]"
        />
        <h2 className="text-base font-black text-black sm:text-lg">{title}</h2>
      </div>
      <div className="p-4">{children}</div>
    </section>
  );
}

function XpActionButton({
  children,
  href,
}: {
  children: ReactNode;
  href: string;
}) {
  return (
    <Link
      className="inline-flex min-h-11 items-center justify-center rounded-[3px] border border-t-white border-l-white border-r-[#404040] border-b-[#404040] bg-[#e7e7e7] px-4 py-2 text-sm font-bold"
      href={href}
      prefetch={false}
    >
      {children}
    </Link>
  );
}

function StatusBadge({
  children,
  tone,
}: {
  children: ReactNode;
  tone: 'danger' | 'neutral' | 'success';
}) {
  const toneClassName = {
    danger: 'border-[#a00000] bg-[#fff1f1] text-[#a00000]',
    neutral: 'border-[#808080] bg-[#f2f2f2] text-[#333]',
    success: 'border-[#1d8b3b] bg-[#effff4] text-[#0f6228]',
  }[tone];

  return (
    <span
      className={`inline-flex min-h-7 items-center border px-2 py-1 text-xs font-bold ${toneClassName}`}
    >
      {children}
    </span>
  );
}

function LoginPanel({ error }: { error?: string }) {
  const errorText =
    error === 'invalid_password'
      ? 'Пароль не подошел. Проверьте ADMIN_RSVP_PASSWORD.'
      : null;

  return (
    <XpPanel title="Вход в Game admin">
      <form action={loginToGameAdmin} className="max-w-sm space-y-4">
        <div>
          <label className="mb-1 block text-sm font-bold" htmlFor="password">
            Пароль администратора
          </label>
          <input
            autoComplete="current-password"
            className="w-full border border-[#7f9db9] bg-white px-3 py-2 text-base text-black outline-none"
            id="password"
            name="password"
            required
            type="password"
          />
        </div>

        {errorText ? (
          <p
            className="border border-[#a00000] bg-[#fff1f1] px-3 py-2 text-sm font-bold text-[#a00000]"
            role="alert"
          >
            {errorText}
          </p>
        ) : null}

        <button
          className="min-h-11 rounded-[3px] border border-t-white border-l-white border-r-[#404040] border-b-[#404040] bg-[#d4e7ff] px-5 py-2 text-sm font-bold"
          type="submit"
        >
          Открыть настройки
        </button>
      </form>
    </XpPanel>
  );
}

function MissingPasswordPanel() {
  return (
    <XpPanel title="Админский пароль не настроен">
      <div className="space-y-3 text-sm leading-relaxed text-[#333]">
        <p>
          Настройки игры скрыты. Чтобы открыть админскую страницу, задайте
          переменную окружения <code>ADMIN_RSVP_PASSWORD</code> и перезапустите
          приложение.
        </p>
        <p>
          Эта страница использует тот же пароль и ту же сессию, что и RSVP
          admin.
        </p>
      </div>
    </XpPanel>
  );
}

function GameLoadErrorPanel() {
  return (
    <XpPanel title="Не удалось загрузить игру">
      <div className="space-y-4">
        <p
          className="border border-[#a00000] bg-[#fff1f1] px-3 py-2 text-sm font-bold text-[#a00000]"
          role="alert"
        >
          Проверьте подключение к SQLite и переменную DATABASE_URL, затем
          обновите страницу.
        </p>
        <form action={logoutFromGameAdmin}>
          <button
            className="min-h-10 rounded-[3px] border border-t-white border-l-white border-r-[#404040] border-b-[#404040] bg-[#e7e7e7] px-4 py-2 text-sm font-bold"
            type="submit"
          >
            Выйти
          </button>
        </form>
      </div>
    </XpPanel>
  );
}

function SettingsForm({
  adminErrorText,
  settings,
  statusMessage,
}: {
  adminErrorText: string | null;
  settings: GameSettingsRow;
  statusMessage: string | null;
}) {
  return (
    <div className="space-y-4">
      {adminErrorText ? (
        <p
          className="border border-[#a00000] bg-[#fff1f1] px-3 py-2 text-sm font-bold text-[#a00000]"
          role="alert"
        >
          {adminErrorText}
        </p>
      ) : null}

      {statusMessage ? (
        <p
          className="border border-[#1d8b3b] bg-[#effff4] px-3 py-2 text-sm font-bold text-[#0f6228]"
          role="status"
        >
          {statusMessage}
        </p>
      ) : null}

      <form action={updateGameSettings} className="space-y-4">
        <div className="grid gap-4 md:grid-cols-2">
          <label className="block">
            <span className="mb-1 block text-sm font-bold">
              Дистанция сюжета
            </span>
            <input
              className="min-h-11 w-full border border-[#7f9db9] bg-white px-3 py-2 text-base text-black outline-none"
              defaultValue={settings.storyRequiredDistance}
              inputMode="numeric"
              max={STORY_REQUIRED_DISTANCE_MAX}
              min={STORY_REQUIRED_DISTANCE_MIN}
              name="storyRequiredDistance"
              required
              step={1}
              type="number"
            />
            <span className="mt-1 block text-xs text-[#555]">
              Значение <code>game_settings.story_required_distance</code>
            </span>
          </label>

          <label className="block">
            <span className="mb-1 block text-sm font-bold">
              Множитель endless
            </span>
            <input
              className="min-h-11 w-full border border-[#7f9db9] bg-white px-3 py-2 text-base text-black outline-none"
              defaultValue={settings.endlessSpeedMultiplier}
              inputMode="decimal"
              max={ENDLESS_SPEED_MULTIPLIER_MAX}
              min={ENDLESS_SPEED_MULTIPLIER_MIN}
              name="endlessSpeedMultiplier"
              required
              step={0.01}
              type="number"
            />
            <span className="mt-1 block text-xs text-[#555]">
              Значение <code>game_settings.endless_speed_multiplier</code>
            </span>
          </label>
        </div>

        <div className="border border-[#7f9db9] bg-white p-3 text-sm">
          <p>
            Текущие значения: сюжетная дистанция{' '}
            <strong>{formatInteger(settings.storyRequiredDistance)}</strong>,
            множитель скорости{' '}
            <strong>
              {formatMultiplier(settings.endlessSpeedMultiplier)}.
            </strong>
          </p>
          <p className="mt-1 text-[#555]">
            Последнее обновление:{' '}
            <time dateTime={settings.updatedAt.toISOString()}>
              {formatDateTime(settings.updatedAt)}
            </time>
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            className="min-h-11 rounded-[3px] border border-t-white border-l-white border-r-[#404040] border-b-[#404040] bg-[#d4e7ff] px-5 py-2 text-sm font-bold"
            type="submit"
          >
            Сохранить
          </button>
          <XpActionButton href={`/admin/game?refresh=${Date.now()}`}>
            Обновить
          </XpActionButton>
          <XpActionButton href="/admin/rsvp">RSVP admin</XpActionButton>
        </div>
      </form>

      <form action={logoutFromGameAdmin}>
        <button
          className="min-h-10 rounded-[3px] border border-t-white border-l-white border-r-[#404040] border-b-[#404040] bg-[#e7e7e7] px-4 py-2 text-sm font-bold"
          type="submit"
        >
          Выйти
        </button>
      </form>
    </div>
  );
}

function StatBox({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="border border-[#7f9db9] bg-white p-3 shadow-[inset_1px_1px_0_white]">
      <p className="text-xs uppercase text-[#555]">{label}</p>
      <div className="mt-1 break-words text-2xl font-black sm:text-3xl">
        {value}
      </div>
    </div>
  );
}

function GameStatsSummary({ stats }: { stats: GameStats }) {
  const topScore = stats.topEndlessAttempt?.score ?? null;
  const topPlayerName = stats.topEndlessAttempt?.playerName?.trim() || null;

  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      <StatBox label="Всего игр" value={formatInteger(stats.totalAttempts)} />
      <StatBox
        label="Сюжет пройден"
        value={formatInteger(stats.storySuccessCount)}
      />
      <StatBox
        label="Максимум endless"
        value={topScore === null ? '—' : formatInteger(topScore)}
      />
      <StatBox label="Игрок с рекордом" value={topPlayerName ?? '—'} />
    </div>
  );
}

function TableCell({
  children,
  label,
}: {
  children: ReactNode;
  label: string;
}) {
  return (
    <td className="block border-b border-[#d0d0d0] px-3 py-2 align-top last:border-b-0 lg:table-cell lg:border-b lg:last:border-b lg:last:border-r-0">
      <span className="mb-1 block text-xs font-bold uppercase text-[#555] lg:hidden">
        {label}
      </span>
      <div className="break-words">{children}</div>
    </td>
  );
}

function LatestAttemptsTable({ rows }: { rows: GameAttemptRow[] }) {
  if (rows.length === 0) {
    return (
      <div className="border border-[#7f9db9] bg-white p-4 text-sm">
        Игровых попыток пока нет.
      </div>
    );
  }

  return (
    <table className="block w-full border border-[#7f9db9] bg-white text-left text-sm lg:table lg:table-fixed">
      <thead className="hidden bg-[#d4d0c8] lg:table-header-group">
        <tr>
          <th className="border-b border-r border-[#808080] px-3 py-2">
            Время
          </th>
          <th className="border-b border-r border-[#808080] px-3 py-2">
            Режим
          </th>
          <th className="border-b border-r border-[#808080] px-3 py-2">
            Игрок
          </th>
          <th className="border-b border-r border-[#808080] px-3 py-2">Очки</th>
          <th className="border-b border-r border-[#808080] px-3 py-2">
            Кольца
          </th>
          <th className="border-b border-r border-[#808080] px-3 py-2">
            Дистанция
          </th>
          <th className="border-b border-[#808080] px-3 py-2">Статус</th>
        </tr>
      </thead>
      <tbody className="block lg:table-row-group">
        {rows.map((row) => (
          <tr
            className="mb-3 block border-b-2 border-[#808080] bg-white last:mb-0 last:border-b-0 lg:table-row lg:border-b lg:last:border-b-0"
            key={row.id}
          >
            <TableCell label="Время">
              <time dateTime={row.createdAt.toISOString()}>
                {formatDateTime(row.createdAt)}
              </time>
            </TableCell>
            <TableCell label="Режим">{getModeText(row.mode)}</TableCell>
            <TableCell label="Игрок">
              {formatOptionalText(row.playerName)}
            </TableCell>
            <TableCell label="Очки">{formatInteger(row.score)}</TableCell>
            <TableCell label="Кольца">
              {formatInteger(row.coinsCollected)}
            </TableCell>
            <TableCell label="Дистанция">
              {formatInteger(row.distance)}
            </TableCell>
            <TableCell label="Статус">
              <StatusBadge tone={row.isSuccess ? 'success' : 'neutral'}>
                {row.isSuccess ? 'Пройдено' : 'Попытка'}
              </StatusBadge>
            </TableCell>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export default async function AdminGamePage({
  searchParams,
}: AdminGamePageProps) {
  const resolvedSearchParams = (await searchParams) ?? {};
  const password = getAdminPassword();
  const error = getSingleParam(resolvedSearchParams.error);
  const status = getSingleParam(resolvedSearchParams.status);
  const adminErrorText = getAdminErrorText(error);
  const statusMessage = getStatusMessage(status);

  if (!password) {
    return (
      <AdminWindow>
        <MissingPasswordPanel />
      </AdminWindow>
    );
  }

  if (!(await isAdminAuthenticated())) {
    return (
      <AdminWindow>
        <LoginPanel error={error} />
      </AdminWindow>
    );
  }

  let settings: GameSettingsRow;
  let stats: GameStats;

  try {
    [settings, stats] = await Promise.all([getGameSettings(), getGameStats()]);
  } catch {
    return (
      <AdminWindow>
        <GameLoadErrorPanel />
      </AdminWindow>
    );
  }

  return (
    <AdminWindow>
      <div className="space-y-4">
        <XpPanel title="Управление настройками игры">
          <SettingsForm
            adminErrorText={adminErrorText}
            settings={settings}
            statusMessage={statusMessage}
          />
        </XpPanel>

        <XpPanel title="Статистика game_attempts">
          <div className="space-y-4">
            <GameStatsSummary stats={stats} />
            <LatestAttemptsTable rows={stats.latestAttempts} />
          </div>
        </XpPanel>
      </div>
    </AdminWindow>
  );
}
