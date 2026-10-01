# Render deployment

Render hosts the backend through `render.yaml`. Vercel hosts the frontend.

- `campus-placement-api`: Node/Express backend

## Deploy

1. In Render, choose **New > Blueprint** and select this GitHub repository.
2. Create the backend service from `render.yaml`.
3. In the backend service, set `MONGO_URI` to a MongoDB Atlas connection string and add the current Gemini and SMTP credentials.
4. In Vercel, import this repository and set the project root directory to `frontend`.
5. Add `VITE_API_URL` in Vercel as the deployed backend URL plus `/api`, for example `https://campus-placement-api.onrender.com/api`.
6. Copy the deployed Vercel URL into Render's `CLIENT_URL`, then redeploy the backend.

The `frontend/vercel.json` rewrite keeps React Router routes working on direct page loads.

The backend health check is available at `/api/health`. Do not commit either service's `.env` file or real credentials.