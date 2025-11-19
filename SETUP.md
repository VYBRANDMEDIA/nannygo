# NannyGo - Lokale Setup

## 1. Installeer dependencies
```bash
cd nannygo
pnpm install
```

## 2. Supabase Setup

### Database
1. Ga naar https://pahcjsgqrikbpedlpifs.supabase.co
2. Klik "SQL Editor" → "New Query"
3. Kopieer en run de SQL uit `nannygo-supabase-schema.sql`

### Email confirmatie uitzetten
1. Ga naar "Authentication" → "Settings"
2. Scroll naar "Email Auth"
3. Zet "Enable email confirmations" UIT

### Environment variables
Maak een `.env` bestand in de root:
```env
# Supabase
VITE_SUPABASE_URL=https://pahcjsgqrikbpedlpifs.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBhaGNqc2dxcmlrYnBlZGxwaWZzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjMxMDg4OTIsImV4cCI6MjA3ODY4NDg5Mn0.wxhagyajynmsi1hkQ9rukilZulTo099Bu9R1Z4jzKJc

# Cloudflare R2
VITE_R2_ACCESS_KEY_ID=f293420cc2922858907792e0330a9994
VITE_R2_SECRET_ACCESS_KEY=cb5c01e1f3730a17e549086cd22ccd75394f15b73ec933e944c262a1c8e5e2c5
VITE_R2_BUCKET_NAME=nannygo
VITE_R2_ENDPOINT=https://124c420412a5efdfdeac04d96e724e30.r2.cloudflarestorage.com
VITE_R2_PUBLIC_URL=https://pub-855bdfdd614f41f6b40da5fe56fa6661.r2.dev

# Stripe (test keys)
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
```

## 3. Start de app
```bash
pnpm dev
```

App draait op http://localhost:3000

## 4. Test de app
1. Klik "Ik ben ouder" of "Ik ben nanny"
2. Maak account aan met email + wachtwoord
3. Vul profiel in

## Problemen?

### "User already registered" error
- Check of de SQL correct is gedraaid in Supabase

### Kan niet inloggen
- Check of email confirmatie UIT staat in Supabase Auth settings

### Images uploaden niet
- Check of R2 credentials correct zijn in .env
