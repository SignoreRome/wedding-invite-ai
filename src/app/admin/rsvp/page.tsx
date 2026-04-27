import { createHash, createHmac, timingSafeEqual } from 'node:crypto';

import type { Metadata } from 'next';
import Link from 'next/link';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import type { ReactNode } from 'react';

import { getPrismaClient } from '@/lib/prisma';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export const metadata: Metadata = {
  title: 'RSVP admin | Wedding invite',
  robots: {
    follow: false,
    index: false,
  },
};

const ADMIN_SESSION_COOKIE = 'admin_rsvp_session';
const ADMIN_SESSION_SCOPE = 'admin-rsvp-session:v1';
const ADMIN_SESSION_MAX_AGE = 60 * 60 * 12;

type SortOrder = 'asc' | 'desc';

type SearchParams = Record<string, string | string[] | undefined>;

type AdminRsvpPageProps = {
  searchParams?: Promise<SearchParams>;
};

type RsvpRow = {
  createdAt: Date;
  guestComment: string | null;
  guestName: string;
  hasPlusOne: boolean;
  id: number;
  isAttending: boolean;
  needsTransfer: boolean;
  plusOneName: string | null;
  updatedAt: Date;
};

function getAdminPassword() {
  return process.env.ADMIN_RSVP_PASSWORD || null;
}

function hashValue(value: string) {
  return createHash('sha256').update(value).digest();
}

function secureEqual(left: string, right: string) {
  return timingSafeEqual(hashValue(left), hashValue(right));
}

function createSessionToken(password: string) {
  return createHmac('sha256', password)
    .update(ADMIN_SESSION_SCOPE)
    .digest('hex');
}

function getSingleParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function getSortOrder(searchParams: SearchParams): SortOrder {
  return getSingleParam(searchParams.sort) === 'asc' ? 'asc' : 'desc';
}

function formatDateTime(value: Date) {
  return new Intl.DateTimeFormat('ru-RU', {
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(value);
}

function formatOptionalText(value: string | null) {
  return value?.trim() ? value : '—';
}

function getAttendanceText(value: boolean) {
  return value ? 'Будет' : 'Не будет';
}

function getBooleanText(value: boolean) {
  return value ? 'Да' : 'Нет';
}

async function isAdminAuthenticated() {
  const password = getAdminPassword();

  if (!password) {
    return false;
  }

  const cookieStore = await cookies();
  const sessionToken = cookieStore.get(ADMIN_SESSION_COOKIE)?.value;

  return sessionToken
    ? secureEqual(sessionToken, createSessionToken(password))
    : false;
}

async function getRsvpRows(sortOrder: SortOrder) {
  const prisma = getPrismaClient();

  return prisma.rsvp.findMany({
    orderBy: {
      createdAt: sortOrder,
    },
    select: {
      createdAt: true,
      guestComment: true,
      guestName: true,
      hasPlusOne: true,
      id: true,
      isAttending: true,
      needsTransfer: true,
      plusOneName: true,
      updatedAt: true,
    },
  });
}

async function loginToRsvpAdmin(formData: FormData) {
  'use server';

  const password = getAdminPassword();
  const submittedPassword = formData.get('password');

  if (!password) {
    redirect('/admin/rsvp?error=not_configured');
  }

  if (
    typeof submittedPassword !== 'string' ||
    !secureEqual(submittedPassword, password)
  ) {
    redirect('/admin/rsvp?error=invalid_password');
  }

  const cookieStore = await cookies();
  cookieStore.set(ADMIN_SESSION_COOKIE, createSessionToken(password), {
    httpOnly: true,
    maxAge: ADMIN_SESSION_MAX_AGE,
    path: '/admin',
    sameSite: 'strict',
    secure: process.env.NODE_ENV === 'production',
  });

  redirect('/admin/rsvp');
}

async function logoutFromRsvpAdmin() {
  'use server';

  const cookieStore = await cookies();
  cookieStore.delete({
    name: ADMIN_SESSION_COOKIE,
    path: '/admin',
  });

  redirect('/admin/rsvp');
}

function AdminWindow({ children }: { children: ReactNode }) {
  return (
    <main className="mx-auto min-h-screen w-full max-w-7xl px-3 py-4 text-black sm:px-5 md:py-8">
      <section className="overflow-hidden rounded-[6px] border-2 border-t-white border-l-white border-r-[#404040] border-b-[#404040] bg-[#d4d0c8] shadow-[8px_8px_0_rgba(0,0,0,0.2)]">
        <div className="flex items-center justify-between gap-3 bg-gradient-to-r from-[#0054e3] via-[#2b7cff] to-[#67a7ff] px-3 py-2 text-sm font-bold text-white">
          <h1 className="truncate text-sm font-bold">
            RSVP Admin - answers.exe
          </h1>
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
            <span>Таблица</span>
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

function SortLink({
  active,
  children,
  sort,
}: {
  active: boolean;
  children: ReactNode;
  sort: SortOrder;
}) {
  return (
    <Link
      aria-current={active ? 'page' : undefined}
      className={`inline-flex min-h-10 items-center justify-center rounded-[3px] border px-3 py-2 text-sm font-bold ${
        active
          ? 'border-[#003399] bg-[#d4e7ff] text-[#003399]'
          : 'border-t-white border-l-white border-r-[#404040] border-b-[#404040] bg-[#e7e7e7]'
      }`}
      href={`/admin/rsvp?sort=${sort}`}
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
    <XpPanel title="Вход в RSVP admin">
      <form action={loginToRsvpAdmin} className="max-w-sm space-y-4">
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
          Открыть таблицу
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
          Данные RSVP скрыты. Чтобы открыть админскую страницу, задайте
          переменную окружения <code>ADMIN_RSVP_PASSWORD</code> и перезапустите
          приложение.
        </p>
        <p>
          Это намеренно блокирует доступ к ответам, если production-env собран
          не полностью.
        </p>
      </div>
    </XpPanel>
  );
}

function RsvpLoadErrorPanel() {
  return (
    <XpPanel title="Не удалось загрузить RSVP">
      <div className="space-y-4">
        <p
          className="border border-[#a00000] bg-[#fff1f1] px-3 py-2 text-sm font-bold text-[#a00000]"
          role="alert"
        >
          Проверьте подключение к SQLite и переменную DATABASE_URL, затем
          обновите страницу.
        </p>
        <form action={logoutFromRsvpAdmin}>
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

function RsvpSummary({ rows }: { rows: RsvpRow[] }) {
  const attendingResponses = rows.filter((row) => row.isAttending);
  const attendingGuestCount = attendingResponses.reduce(
    (total, row) => total + 1 + (row.hasPlusOne ? 1 : 0),
    0,
  );
  const transferCount = attendingResponses.filter(
    (row) => row.needsTransfer,
  ).length;

  return (
    <div className="grid gap-3 sm:grid-cols-3">
      <div className="border border-[#7f9db9] bg-white p-3 shadow-[inset_1px_1px_0_white]">
        <p className="text-xs uppercase text-[#555]">Будут присутствовать</p>
        <p className="mt-1 text-3xl font-black">{attendingGuestCount}</p>
      </div>
      <div className="border border-[#7f9db9] bg-white p-3 shadow-[inset_1px_1px_0_white]">
        <p className="text-xs uppercase text-[#555]">Ответов «да»</p>
        <p className="mt-1 text-3xl font-black">{attendingResponses.length}</p>
      </div>
      <div className="border border-[#7f9db9] bg-white p-3 shadow-[inset_1px_1px_0_white]">
        <p className="text-xs uppercase text-[#555]">Нужен трансфер</p>
        <p className="mt-1 text-3xl font-black">{transferCount}</p>
      </div>
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

function RsvpTable({ rows }: { rows: RsvpRow[] }) {
  if (rows.length === 0) {
    return (
      <div className="border border-[#7f9db9] bg-white p-4 text-sm">
        Ответов пока нет.
      </div>
    );
  }

  return (
    <table className="block w-full border border-[#7f9db9] bg-white text-left text-sm lg:table lg:table-fixed">
      <thead className="hidden bg-[#d4d0c8] lg:table-header-group">
        <tr>
          <th className="border-b border-r border-[#808080] px-3 py-2">
            Имя гостя
          </th>
          <th className="border-b border-r border-[#808080] px-3 py-2">
            Присутствие
          </th>
          <th className="border-b border-r border-[#808080] px-3 py-2">+1</th>
          <th className="border-b border-r border-[#808080] px-3 py-2">
            Имя пары
          </th>
          <th className="border-b border-r border-[#808080] px-3 py-2">
            Комментарий
          </th>
          <th className="border-b border-r border-[#808080] px-3 py-2">
            Трансфер
          </th>
          <th className="border-b border-r border-[#808080] px-3 py-2">
            Отправлено
          </th>
          <th className="border-b border-[#808080] px-3 py-2">Обновлено</th>
        </tr>
      </thead>
      <tbody className="block lg:table-row-group">
        {rows.map((row) => (
          <tr
            className="mb-3 block border-b-2 border-[#808080] bg-white last:mb-0 last:border-b-0 lg:table-row lg:border-b lg:last:border-b-0"
            key={row.id}
          >
            <TableCell label="Имя гостя">
              <strong>{row.guestName}</strong>
            </TableCell>
            <TableCell label="Присутствие">
              <StatusBadge tone={row.isAttending ? 'success' : 'danger'}>
                {getAttendanceText(row.isAttending)}
              </StatusBadge>
            </TableCell>
            <TableCell label="Статус +1">
              <StatusBadge tone={row.hasPlusOne ? 'success' : 'neutral'}>
                {getBooleanText(row.hasPlusOne)}
              </StatusBadge>
            </TableCell>
            <TableCell label="Имя пары">
              {formatOptionalText(row.plusOneName)}
            </TableCell>
            <TableCell label="Комментарий">
              <span className="whitespace-pre-wrap">
                {formatOptionalText(row.guestComment)}
              </span>
            </TableCell>
            <TableCell label="Нужен трансфер">
              <StatusBadge tone={row.needsTransfer ? 'success' : 'neutral'}>
                {getBooleanText(row.needsTransfer)}
              </StatusBadge>
            </TableCell>
            <TableCell label="Время прохождения">
              <time dateTime={row.createdAt.toISOString()}>
                {formatDateTime(row.createdAt)}
              </time>
            </TableCell>
            <TableCell label="Обновление запроса">
              <time dateTime={row.updatedAt.toISOString()}>
                {formatDateTime(row.updatedAt)}
              </time>
            </TableCell>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export default async function AdminRsvpPage({
  searchParams,
}: AdminRsvpPageProps) {
  const resolvedSearchParams = (await searchParams) ?? {};
  const password = getAdminPassword();
  const sortOrder = getSortOrder(resolvedSearchParams);
  const error = getSingleParam(resolvedSearchParams.error);
  const refreshHref = `/admin/rsvp?sort=${sortOrder}&refresh=${Date.now()}`;

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

  let rows: RsvpRow[];

  try {
    rows = await getRsvpRows(sortOrder);
  } catch {
    return (
      <AdminWindow>
        <RsvpLoadErrorPanel />
      </AdminWindow>
    );
  }

  return (
    <AdminWindow>
      <div className="space-y-4">
        <XpPanel title="Сводка RSVP">
          <div className="space-y-4">
            <RsvpSummary rows={rows} />
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex flex-wrap gap-2">
                <SortLink active={sortOrder === 'desc'} sort="desc">
                  Новые сначала
                </SortLink>
                <SortLink active={sortOrder === 'asc'} sort="asc">
                  Старые сначала
                </SortLink>
                <XpActionButton href={refreshHref}>Обновить</XpActionButton>
              </div>
              <form action={logoutFromRsvpAdmin}>
                <button
                  className="min-h-10 rounded-[3px] border border-t-white border-l-white border-r-[#404040] border-b-[#404040] bg-[#e7e7e7] px-4 py-2 text-sm font-bold"
                  type="submit"
                >
                  Выйти
                </button>
              </form>
            </div>
          </div>
        </XpPanel>

        <XpPanel title="Ответы гостей">
          <RsvpTable rows={rows} />
        </XpPanel>
      </div>
    </AdminWindow>
  );
}
