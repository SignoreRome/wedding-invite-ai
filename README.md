## Wedding Invitation Site

Production-ready foundation for a wedding invitation website built with Next.js, TypeScript, App Router, and Tailwind CSS. The project is mobile-first, keeps a retro Windows 95 / XP mood, and is structured so an RSVP flow can be added later without rebuilding the public page.

### What is included

- One public invitation page at `/`
- Next.js App Router setup with TypeScript
- Tailwind CSS with a small retro UI layer
- Clean component structure for extending the invitation and adding RSVP
- System font stack for fast loading on mobile devices
- Production-friendly Next.js config with `output: "standalone"` for VPS deployment

### Stack

- Next.js 16
- React 18
- TypeScript
- Tailwind CSS

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

- `NEXT_PUBLIC_SITE_URL` — public site URL used for metadata and canonical links

Reserved for the future RSVP backend:

- `DATABASE_URL` — recommended SQLite path when RSVP persistence is introduced

### Build and run

Create a production build:

```bash
npm run build
```

Run the app locally in production mode:

```bash
npm run start
```

### Deployment notes for VPS

- The project uses `output: "standalone"`, which fits a simple VPS deployment flow well.
- Keep future SQLite files outside build directories such as `.next/`.
- If you add RSVP persistence later, store the database in a stable path like `/var/www/wedding-invite/data/production.db`.
- Put Nginx in front of `next start` and proxy requests to the chosen application port.

### Content updates

- Edit invitation copy, schedule, venue, and RSVP deadline in [`src/lib/invitation-content.ts`](./src/lib/invitation-content.ts).
- The RSVP section is currently a prepared placeholder so the future form can be added without rebuilding the layout.
