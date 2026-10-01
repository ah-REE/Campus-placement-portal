# Render deployment

Vercel can host both the backend and frontend without the Render billing requirement.

- `campus-placement-api`: Node/Express serverless function

## Vercel deployment

Create two Vercel projects from this repository:

1. Create the backend project with root directory `backend`.
2. Set `MONGO_URI`, `JWT_SECRET`, `CLIENT_URL`, `GEMINI_API_KEY`, `EMAIL_USER`, `EMAIL_PASS`, `SMTP_HOST`, and `SMTP_PORT` in the backend project.
3. Deploy the backend and copy its URL.
4. Create the frontend project with root directory `frontend`.
5. Set `VITE_API_URL` to the backend URL plus `/api`.
6. Deploy the frontend, then update backend `CLIENT_URL` with the frontend URL and redeploy the backend.

The `frontend/vercel.json` rewrite keeps React Router routes working on direct page loads. The backend `api/[...path].js` exposes all existing Express routes as a Vercel function.

The backend health check is available at `/api/health`. Do not commit either service's `.env` file or real credentials.