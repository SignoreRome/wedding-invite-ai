## Сайт свадебного приглашения

Production-ready основа для сайта свадебного приглашения на Next.js, TypeScript, App Router и Tailwind CSS. Проект разрабатывается по принципу mobile-first, сохраняет ретро-настроение Windows 95 / XP и сейчас оформляет публичную страницу как приглашение в стиле мастера установки Windows XP.

### Что входит в проект

- Одна публичная страница приглашения по маршруту `/`
- Секции `hero`, дата и место, дресс-код, программа вечера и опрос гостей
- Закрепленная десктопная боковая навигация по разделам приглашения с подсветкой текущих окон при прокрутке
- Настроенный Next.js App Router с TypeScript
- Tailwind CSS с небольшим ретро-UI слоем
- Prisma, настроенная для работы с SQLite
- RSVP-форма на главной странице, подключенная к `POST /api/rsvp` для сохранения ответов в SQLite
- Админская страница `/admin/rsvp` для просмотра RSVP-ответов, защищенная паролем из env
- Системный стек шрифтов для быстрой загрузки на мобильных устройствах
- Production-friendly конфигурация Next.js с `output: "standalone"` для деплоя на VPS
- Production-скрипты для применения миграций, сборки standalone-артефакта и запуска приложения за Nginx

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
    admin/
      rsvp/
        page.tsx
    api/
      rsvp/
        route.ts
  components/
    invitation-page.tsx
    sections/
      dress-code-section.tsx
      event-details-section.tsx
      evening-program-section.tsx
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
- `ADMIN_RSVP_PASSWORD` — пароль для доступа к административной странице `/admin/rsvp`; если переменная не задана, ответы гостей на странице не показываются
- `ADMIN_RSVP_COOKIE_SECURE` — опциональный override для Secure-флага cookie админской сессии; по умолчанию флаг определяется по `X-Forwarded-Proto`, `Origin`/`Referer` или `NEXT_PUBLIC_SITE_URL`
- `PORT` — порт Node.js-приложения на VPS; Nginx должен проксировать запросы на этот порт

Для production используйте абсолютный путь к SQLite-файлу, потому что standalone-сервер Next.js запускается из `.next/standalone`:

```env
DATABASE_URL="file:/var/www/wedding-invite/shared/data/production.db"
NEXT_PUBLIC_SITE_URL="https://example.com"
ADMIN_RSVP_PASSWORD="replace-with-long-private-password"
# Для временного доступа по http://IP:3000 можно поставить false.
# Для HTTPS оставьте unset или поставьте true.
# ADMIN_RSVP_COOKIE_SECURE="true"
PORT=3000
```

### Сборка и запуск

Соберите production-версию:

```bash
npm run build
```

Запустите приложение локально в production-режиме:

```bash
npm run start
```

Для VPS используйте standalone-сборку:

```bash
npm run prod:build
npm run prod:start
```

`npm run prod:build` применяет закоммиченные Prisma-миграции, собирает Next.js и копирует статические ассеты в `.next/standalone`. `npm run prod:start` запускает `.next/standalone/server.js`; переменные окружения должны быть переданы процессу через shell или systemd.

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

Проект рассчитан на простой запуск на одном VPS без Docker, PM2 и отдельной внешней базы данных.

Рекомендуемая структура директорий на сервере:

```text
/var/www/wedding-invite/
  app/                  # рабочая копия проекта или распакованный release
  shared/
    data/
      production.db     # постоянный SQLite-файл
```

SQLite-файл нужно хранить в `/var/www/wedding-invite/shared/data/production.db` или другой постоянной директории вне `.next`, `.next/standalone`, `/tmp` и временных release-папок. Для резервного копирования сохраняйте `production.db`, а если рядом есть WAL/SHM-файлы, то также `production.db-wal` и `production.db-shm`.

Минимальный порядок деплоя:

```bash
cd /var/www/wedding-invite/app
npm ci
cp .env.example .env
mkdir -p /var/www/wedding-invite/shared/data
npm run prod:build
```

В `.env` на VPS задайте реальные значения:

```env
DATABASE_URL="file:/var/www/wedding-invite/shared/data/production.db"
NEXT_PUBLIC_SITE_URL="https://example.com"
ADMIN_RSVP_PASSWORD="replace-with-long-private-password"
# Для прямого HTTP-доступа вида http://37.18.102.152:3000 задайте:
# ADMIN_RSVP_COOKIE_SECURE="false"
PORT=3000
```

Не используйте `npm ci --omit=dev` перед сборкой: Prisma CLI и build-инструменты нужны на этапе `npm run prod:build`. Runtime запускается из `.next/standalone`.

Админская страница `/admin/rsvp` хранит вход в httpOnly cookie на 12 часов. Если сайт открыт по HTTPS за Nginx, оставьте `ADMIN_RSVP_COOKIE_SECURE` unset и передавайте `X-Forwarded-Proto`, как в примере ниже. Если во время настройки VPS админка открывается напрямую по `http://IP:3000`, задайте `ADMIN_RSVP_COOKIE_SECURE="false"`, иначе браузер будет отбрасывать Secure-cookie и после обновления или сортировки снова показывать форму ввода пароля.

Пример systemd unit для постоянного запуска процесса:

```ini
[Unit]
Description=Wedding invite Next.js app
After=network.target

[Service]
Type=simple
WorkingDirectory=/var/www/wedding-invite/app
Environment=NODE_ENV=production
EnvironmentFile=/var/www/wedding-invite/app/.env
ExecStart=/usr/bin/npm run prod:start
Restart=always
RestartSec=5

[Install]
WantedBy=multi-user.target
```

После создания unit-файла:

```bash
sudo systemctl daemon-reload
sudo systemctl enable --now wedding-invite
sudo systemctl status wedding-invite
```

Пример Nginx-конфига:

```nginx
server {
    listen 80;
    listen [::]:80;
    server_name example.com www.example.com;

    client_max_body_size 1m;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header X-Forwarded-Host $host;
        proxy_redirect off;
    }
}
```

Применение Nginx-конфига:

```bash
sudo ln -s /etc/nginx/sites-available/wedding-invite /etc/nginx/sites-enabled/wedding-invite
sudo nginx -t
sudo systemctl reload nginx
```

После настройки DNS добавьте HTTPS через certbot или другой используемый на VPS способ выпуска TLS-сертификата.

Перед деплоем полезно проверить, что в рабочей копии нет потерянных tracked-файлов:

```bash
git status --short
git ls-files --deleted
```

### Обновление контента

- Редактируйте тексты приглашения, блок `Программа вечера`, тайминг, площадку, палитру дресс-кода и дедлайн RSVP в [`src/lib/invitation-content.ts`](./src/lib/invitation-content.ts).
- Секция опроса гостей на публичной странице отправляет RSVP-ответы в `POST /api/rsvp` и включает поля: имя и фамилия, присутствие, `+1`, имя пары, трансфер после банкета и комментарий гостя.
- Если гость отвечает, что не сможет прийти, форма скрывает дополнительные вопросы и отправляет только имя, фамилию и статус присутствия.
- Во время отправки форма показывает loading state, блокирует повторный submit, а после ответа сервера показывает success или error state.

### Основа для RSVP

- SQLite настроена через Prisma в [`prisma/schema.prisma`](./prisma/schema.prisma) и [`prisma.config.ts`](./prisma.config.ts).
- Prisma Client используется через singleton-хелпер [`src/lib/prisma.ts`](./src/lib/prisma.ts), чтобы не плодить подключения во время локальной разработки Next.js.
- Первая миграция находится в [`prisma/migrations/20260426000000_init/migration.sql`](./prisma/migrations/20260426000000_init/migration.sql).
- Миграция [`prisma/migrations/20260429000000_add_rsvp_info/migration.sql`](./prisma/migrations/20260429000000_add_rsvp_info/migration.sql) добавляет текстовую колонку `rsvp_info`.
- В приложении определена одна RSVP-модель `Rsvp`, которая мапится на SQLite-таблицу `rsvp`.
- Таблица `rsvp` содержит колонки: `id`, `guest_name`, `is_attending`, `has_plus_one`, `plus_one_name`, `needs_transfer`, `guest_comment`, `rsvp_info`, `created_at`, `updated_at`.
- При применении миграций Prisma дополнительно создает служебную таблицу `_prisma_migrations`; прикладная таблица проекта остается только `rsvp`.
- `POST /api/rsvp` валидирует JSON через Zod, нормализует имя и фамилию гостя в формат `Имя Фамилия`, запрещает цифры и лишние слова, обрезает пробелы у строк, ограничивает длину полей и сохраняет данные через Prisma.
- Для гостей, которые не придут, API принудительно сохраняет `hasPlusOne: false`, `plusOneName: null`, `needsTransfer: false` и `guestComment: null`.
- При повторной отправке с теми же именем и фамилией гостя API обновляет существующую RSVP-запись, а не создает новую строку; сравнение не учитывает лишние пробелы и регистр.
- Если присутствующий гость указывает `+1` и имя пары, API проверяет, есть ли эта пара в таблице. Если записи нет, API создает отдельную строку для пары с `is_attending: true`, копирует трансфер и комментарий из ответа гостя и заполняет `rsvp_info` значением вида `(+1 Иван Иванов)`.
- Публичная RSVP-форма использует этот маршрут напрямую и показывает серверные ошибки в интерфейсе без раскрытия внутренних деталей.

### Административный просмотр RSVP

- Страница доступна по маршруту `/admin/rsvp`.
- Доступ защищен паролем из переменной окружения `ADMIN_RSVP_PASSWORD`.
- После входа сервер ставит HTTP-only cookie для `/admin`; смена пароля в env инвалидирует старую сессию.
- Если `ADMIN_RSVP_PASSWORD` не задан, страница не показывает данные и просит настроить env.
- Таблица показывает имя гостя, `rsvp_info`, присутствие, статус `+1`, имя пары, комментарий, необходимость трансфера, время отправки и время обновления записи.
- Администратор может удалить ошибочную RSVP-запись из таблицы; действие доступно только после входа в защищенную админку.
- Ответы сортируются по времени отправки: можно переключить порядок «новые сначала» / «старые сначала».
- Сводка показывает количество RSVP-записей со статусом присутствия и количество присутствующих гостей, которым нужен трансфер.

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

- `guestName` — обязательная строка до 120 символов, ровно два слова `Имя Фамилия`, только буквы с допустимыми дефисом или апострофом
- `isAttending` — обязательный boolean
- `hasPlusOne` — optional boolean, по умолчанию `false`
- `plusOneName` — optional строка до 120 символов в формате `Имя Фамилия`; обязательна, если `isAttending: true` и `hasPlusOne: true`
- `plusOneName` должен отличаться от `guestName`
- `needsTransfer` — optional boolean, по умолчанию `false`
- `guestComment` — optional строка до 1000 символов
- Если `isAttending: false`, поля `hasPlusOne`, `plusOneName`, `needsTransfer` и `guestComment` не требуются и сохраняются как пустые значения.

Статусы ответа:

- `200 OK` — существующий ответ гостя обновлен
- `201 Created` — новый ответ гостя сохранен
- `400 Bad Request` — тело запроса не является корректным JSON
- `422 Unprocessable Entity` — поля не прошли валидацию
- `500 Internal Server Error` — безопасная ошибка сохранения без раскрытия внутренних деталей
