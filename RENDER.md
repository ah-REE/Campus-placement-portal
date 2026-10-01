# Render deployment

This repository is configured as two Render services through `render.yaml`:

- `campus-placement-api`: Node/Express backend
- `campus-placement-frontend`: Vite static site

## Deploy

1. In Render, choose **New > Blueprint** and select this GitHub repository.
2. Create the services from `render.yaml`.
3. In the backend service, set `MONGO_URI` to a MongoDB Atlas connection string and add the current Gemini and SMTP credentials.
4. Copy the deployed frontend URL into the backend `CLIENT_URL` value, for example `https://campus-placement-frontend.onrender.com`.
5. Copy the deployed backend URL plus `/api` into the frontend `VITE_API_URL`, for example `https://campus-placement-api.onrender.com/api`.
6. Redeploy the frontend after setting `VITE_API_URL`, because Vite embeds it during the build.

The backend health check is available at `/api/health`. Do not commit either service's `.env` file or real credentials.