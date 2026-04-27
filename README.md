## Сайт свадебного приглашения

Production-ready основа для сайта свадебного приглашения на Next.js, TypeScript, App Router и Tailwind CSS. Проект разрабатывается по принципу mobile-first, сохраняет ретро-настроение Windows 95 / XP и сейчас оформляет публичную страницу как приглашение в стиле мастера установки Windows XP.

### Что входит в проект

- Одна публичная страница приглашения по маршруту `/`
- Секции `hero`, дата и место, дресс-код и опрос гостей
- Настроенный Next.js App Router с TypeScript
- Tailwind CSS с небольшим ретро-UI слоем
- Prisma, настроенная для работы с SQLite
- `POST /api/rsvp` для сохранения RSVP-ответов в SQLite
- Системный стек шрифтов для быстрой загрузки на мобильных устройствах
- Production-friendly конфигурация Next.js с `output: "standalone"` для деплоя на VPS

### Стек

- Next.js 16
- React 18
- TypeScript
- Tailwind CSS
- Prisma
- SQLite
- Zod

### Структура проекта

```text
src/
  app/
    globals.css
    layout.tsx
    page.tsx
    api/
      rsvp/
        route.ts
  components/
    invitation-page.tsx
    sections/
      dress-code-section.tsx
      event-details-section.tsx
      guest-survey-section.tsx
      hero-section.tsx
    ui/
      setup-wizard.tsx
  lib/
    invitation-content.ts
    prisma.ts
prisma/
  migrations/
    20260426000000_init/
      migration.sql
  schema.prisma
prisma.config.ts
data/
  .gitkeep
scripts/
  ensure-sqlite-db.mjs
```

### Локальная разработка

1. Установите зависимости:

   ```bash
   npm install
   ```

2. Создайте локальный env-файл:

   ```bash
   cp .env.example .env.local
   ```

3. Запустите dev-сервер:

   ```bash
   npm run dev
   ```

4. Откройте [http://localhost:3000](http://localhost:3000).

### Переменные окружения

Текущие переменные:

- `DATABASE_URL` — строка подключения SQLite, локальный путь по умолчанию: `file:./data/dev.db`; файл базы лежит в `data/dev.db` в корне проекта
- `NEXT_PUBLIC_SITE_URL` — публичный URL сайта, используется для метаданных и canonical-ссылок

### Сборка и запуск

Соберите production-версию:

```bash
npm run build
```

Запустите приложение локально в production-режиме:

```bash
npm run start
```

### База данных и миграции

Сгенерируйте Prisma Client:

```bash
npm run db:generate
```

Подготовьте SQLite-файл, если он еще не создан:

```bash
npm run db:prepare
```

Команды миграций и Prisma Studio запускают эту подготовку автоматически.

Подготовьте новую миграцию без применения:

```bash
npm run db:migrate:create -- --name migration_name
```

Примените миграции локально во время разработки:

```bash
npm run db:migrate
```

Примените закоммиченные миграции на VPS:

```bash
npm run db:deploy
```

### Заметки по деплою на VPS

- Проект использует `output: "standalone"`, что хорошо подходит для простого деплоя на одном VPS.
- Файл SQLite-базы должен храниться в стабильной директории вне build-артефактов.
- Для локальной разработки по умолчанию используется файл `./data/dev.db`.
- Для production задайте `DATABASE_URL` на стабильный путь, например `file:/var/www/wedding-invite/data/production.db`.
- Поставьте Nginx перед `next start` и проксируйте запросы на выбранный порт приложения.
- Делайте резервные копии SQLite-файла и его WAL/SHM-спутников из постоянной директории `data/`.

### Обновление контента

- Редактируйте тексты приглашения, блок `Программа вечера`, тайминг, площадку, палитру дресс-кода и дедлайн RSVP в [`src/lib/invitation-content.ts`](./src/lib/invitation-content.ts).
- Секция опроса гостей уже присутствует на публичной странице как UI и сейчас включает поля: ФИО, присутствие, `+1`, имя пары, трансфер после банкета и комментарий гостя.
- Серверное сохранение RSVP-ответов доступно через `POST /api/rsvp`; клиентскую отправку формы можно подключать к этому маршруту.

### Основа для RSVP

- SQLite настроена через Prisma в [`prisma/schema.prisma`](./prisma/schema.prisma) и [`prisma.config.ts`](./prisma.config.ts).
- Prisma Client используется через singleton-хелпер [`src/lib/prisma.ts`](./src/lib/prisma.ts), чтобы не плодить подключения во время локальной разработки Next.js.
- Первая миграция находится в [`prisma/migrations/20260426000000_init/migration.sql`](./prisma/migrations/20260426000000_init/migration.sql).
- В приложении определена одна RSVP-модель `Rsvp`, которая мапится на SQLite-таблицу `rsvp`.
- Таблица `rsvp` содержит колонки: `id`, `guest_name`, `is_attending`, `has_plus_one`, `plus_one_name`, `needs_transfer`, `guest_comment`, `created_at`, `updated_at`.
- При применении миграций Prisma дополнительно создает служебную таблицу `_prisma_migrations`; прикладная таблица проекта остается только `rsvp`.
- `POST /api/rsvp` валидирует JSON через Zod, обрезает пробелы у строк, ограничивает длину полей и сохраняет нормализованные данные через Prisma.

### RSVP API

Маршрут `POST /api/rsvp` принимает JSON:

```json
{
  "guestName": "Иван Иванов",
  "isAttending": true,
  "hasPlusOne": true,
  "plusOneName": "Мария Иванова",
  "needsTransfer": false,
  "guestComment": "Без аллергий"
}
```

Ограничения:

- `guestName` — обязательная строка до 120 символов
- `isAttending` — обязательный boolean
- `hasPlusOne` — optional boolean, по умолчанию `false`
- `plusOneName` — optional строка до 120 символов; обязательна, если `hasPlusOne: true`
- `needsTransfer` — optional boolean, по умолчанию `false`
- `guestComment` — optional строка до 1000 символов

Статусы ответа:

- `201 Created` — ответ сохранен
- `400 Bad Request` — тело запроса не является корректным JSON
- `422 Unprocessable Entity` — поля не прошли валидацию
- `500 Internal Server Error` — безопасная ошибка сохранения без раскрытия внутренних деталей
