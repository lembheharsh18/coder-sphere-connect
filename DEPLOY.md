# Deployment Guide for CoderSphere

Your application is now configured for "One-Click" style deployment as a single service (Monolith). This means you can deploy both the frontend and backend together on a single server/container.

## Recommended Platforms
- **Railway** (easiest, free trial)
- **Render** (free tier available)
- **Heroku**

## Prerequisites
1.  **PostgreSQL Database**: You need a hosted Postgres database. Railway and Render both provide this easily.
2.  **Environment Variables**: You will need to set these in your deployment dashboard.

## Deployment Steps (Railway Example)

1.  **Push your code to GitHub**.
    *   Make sure to commit the changes we just made to `server/index.ts`, `package.json`, and the frontend files.

2.  **Create a New Project on Railway**.
    *   Select "Deploy from GitHub repo".
    *   Select your repository.

3.  **Add a Database (Postgres)**.
    *   In Railway, right-click on the canvas or click "New" -> Database -> PostgreSQL.
    *   This will give you a `DATABASE_URL`.

4.  **Configure Environment Variables**.
    *   Go to your application service (the one from GitHub).
    *   Go to the "Variables" tab.
    *   Add the following:
        *   `NODE_ENV`: `production`
        *   `POSTGRES_PRISMA_URL`: `${{Postgres.DATABASE_URL}}` (or paste the connection string from your hosted DB).
        *   `JWT_SECRET`: Generate a random long string directly in the dashboard.
        *   `GEMINI_API_KEY`: Your Google Gemini API Key (if using AI features).
        *   `PORT`: Railway usually sets this automatically, but our code respects it.

5.  **Build & Deploy**.
    *   Railway should automatically detect the `start` script (`npm start`) and the `build` command.
    *   It will run `npm install`, then `npm run build` (which generates Prisma client and builds Vite app), and then start the server.

## Troubleshooting

-   **Database Connections**: Ensure your `POSTGRES_PRISMA_URL` is correct. If using Prisma, sometimes `DIRECT_URL` is also needed for migrations, but for runtime `POSTGRES_PRISMA_URL` is enough if using the standard client.
-   **Build Failures**: Check the logs. If `tsx` or `prisma` commands are not found, ensure they are in `dependencies` in `package.json` (we moved them there).

## Local Production Test

To test the production build locally:

1.  `npm install`
2.  `npm run build`
3.  `npm start`
4.  Open `http://localhost:3001` (or whatever port is shown).
