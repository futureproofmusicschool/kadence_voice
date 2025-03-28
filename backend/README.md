# Gemini Voice Chat - Backend

This is the backend for the Gemini Voice Chat application. It provides a FastAPI server with WebSocket support for real-time voice communication with the Google Gemini AI model.

## Development

1. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

2. Set up environment variables in a `.env` file:
   ```
   GEMINI_API_KEY=your_google_gemini_api_key
   JWT_SECRET=your_jwt_secret
   REDIS_URL=your_redis_connection_string
   CLIENT_VERIFICATION_TOKEN=your_client_token
   ```

3. Run the development server:
   ```bash
   uvicorn main:app --reload
   ```

## Deployment to Railway

1. **Create a Railway account** if you don't have one at [railway.app](https://railway.app/).

2. **Install the Railway CLI** (optional):
   ```bash
   npm i -g @railway/cli
   ```

3. **Login to Railway** (if using CLI):
   ```bash
   railway login
   ```

4. **Create a new project** in Railway:
   - Either through the CLI: `railway init`
   - Or through the Railway dashboard: Click "New Project" > "Deploy from GitHub"

5. **Connect your GitHub repository** if deploying from the dashboard.

6. **Set environment variables** in the Railway dashboard:
   - `GEMINI_API_KEY`: Your Google Gemini API key
   - `JWT_SECRET`: Your JWT secret (e.g., `0804792514dd2b5b1b502a6582243cf90d9160d51da0f71d2648cb1a631af00b`)
   - `REDIS_URL`: Your Redis connection string (e.g., `redis://default:password@hostname:port`)
   - `CLIENT_VERIFICATION_TOKEN`: Your client verification token (e.g., `3a7c6f8d2e1b4a9c8f7e6d5c4b3a2e1d`)

7. **Deploy the application**:
   - If using CLI: `railway up`
   - If using dashboard: The deployment will start automatically when you commit changes to the linked GitHub repository

8. **Get your deployment URL**:
   - From the Railway dashboard, go to your project's settings
   - Copy the provided domain (e.g., `https://your-app-name.up.railway.app`)

9. **Update your frontend configuration** to use this URL for API requests.

## Troubleshooting

If you encounter issues with WebSocket connections:

1. Ensure your Redis service is running and accessible
2. Check that all environment variables are set correctly
3. Verify that your client is using the correct WebSocket URL (wss://your-app-name.up.railway.app/stream/token)
4. Check Railway logs for any specific error messages 