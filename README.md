## Wedding Invitation Site

Production-ready foundation for a wedding invitation website built with Next.js, TypeScript, App Router, and Tailwind CSS. The project is mobile-first, keeps a retro Windows 95 / XP mood, and is structured so an RSVP flow can be added later without rebuilding the public page.

### What is included

- One public invitation page at `/`
- Next.js App Router setup with TypeScript
- Tailwind CSS with a small retro UI layer
- Prisma setup configured for SQLite
- Clean component structure for extending the invitation and adding RSVP
- System font stack for fast loading on mobile devices
- Production-friendly Next.js config with `output: "standalone"` for VPS deployment

### Stack

- Next.js 16
- React 18
- TypeScript
- Tailwind CSS
- Prisma
- SQLite

### Project structure

```text
src/
  app/
    globals.css
    layout.tsx
    page.tsx
  components/
    invitation-page.tsx
    sections/
      event-details-section.tsx
      hero-section.tsx
      rsvp-preview-section.tsx
    ui/
      window-frame.tsx
  lib/
    invitation-content.ts
prisma/
  migrations/
    .gitkeep
  schema.prisma
prisma.config.ts
data/
  .gitkeep
```

### Local development

1. Install dependencies:

   ```bash
   npm install
   ```

2. Create a local env file:

   ```bash
   cp .env.example .env.local
   ```

3. Start the dev server:

   ```bash
   npm run dev
   ```

4. Open [http://localhost:3000](http://localhost:3000).

### Environment variables

Current variables:

- `DATABASE_URL` — SQLite connection string, default local path is `file:./data/dev.db`
- `NEXT_PUBLIC_SITE_URL` — public site URL used for metadata and canonical links

### Build and run

Create a production build:

```bash
npm run build
```

Run the app locally in production mode:

```bash
npm run start
```

### Database and migrations

Generate the Prisma client:

```bash
npm run db:generate
```

Create and apply a local migration during development:

```bash
npm run db:migrate -- --name init
```

Apply committed migrations on the VPS:

```bash
npm run db:deploy
```

### Deployment notes for VPS

- The project uses `output: "standalone"`, which fits a simple VPS deployment flow well.
- The SQLite database should live in a stable directory outside build output.
- For local development the default file is `./data/dev.db`.
- For production, set `DATABASE_URL` to a stable path like `file:/var/www/wedding-invite/data/production.db`.
- Put Nginx in front of `next start` and proxy requests to the chosen application port.
- Backup the SQLite file and its WAL/SHM companions from the persistent `data/` directory.

### Content updates

- Edit invitation copy, schedule, venue, and RSVP deadline in [`src/lib/invitation-content.ts`](./src/lib/invitation-content.ts).
- The RSVP section is currently a prepared placeholder so the future form can be added without rebuilding the layout.

### RSVP foundation

- SQLite is configured through Prisma in [`prisma/schema.prisma`](./prisma/schema.prisma) and [`prisma.config.ts`](./prisma.config.ts).
- A placeholder `RsvpResponse` model is already defined, so the future form can persist guest responses with a safe server-side flow.
