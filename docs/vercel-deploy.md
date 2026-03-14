# Vercel Deployment (CLI)

## Prereqs
- Vercel CLI installed: `vercel --version`
- Repo builds locally: `npm run build`

## 1) Login and Link
```bash
vercel login
vercel link
```

## 2) Configure Environment Variables
Add these in the Vercel Project settings or via CLI:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `DATABASE_URL` (only if you use `app/actions/setup-db.ts`)

CLI alternative:
```bash
vercel env add NEXT_PUBLIC_SUPABASE_URL production
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY production
vercel env add SUPABASE_SERVICE_ROLE_KEY production
vercel env add DATABASE_URL production
```

## 3) Deploy
Preview deploy:
```bash
vercel
```

Production deploy:
```bash
vercel --prod
```
