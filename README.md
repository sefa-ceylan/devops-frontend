# DevOps Frontend

Market satış dashboard'u — backend API'den veri çekip gösteren Next.js uygulaması.

## Teknolojiler
- Next.js (App Router)
- TypeScript
- Tailwind CSS
- Recharts

## Local'de çalıştırma
```bash
npm install
npm run dev
```
`http://localhost:3000` adresinde açılır.

## Environment Variables
`.env.local` dosyasında:

## Deployment

- Live: https://sefa-frontend.team-vit-devops.nl
- Deployed automatically via GitHub Actions on every push to `main`
- Static export served directly by Nginx, with Let's Encrypt SSL
- Connects to backend API at https://sefa-backend.team-vit-devops.nl
