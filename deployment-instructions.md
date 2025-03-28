# Gemini Voice Chat - Deployment Instructions

This guide will walk you through deploying the Gemini Voice Chat application and integrating it with your website.

## 1. Backend Deployment on Railway

### Prerequisites
- A Railway account (sign up at [railway.app](https://railway.app))
- A Google API key for Gemini
- A Redis instance (we're using Redis Cloud)

### Deployment Steps

1. **Fork/Clone the repository**
   ```bash
   git clone <your-forked-repo-url>
   cd kadence_voice
   ```

2. **Prepare your backend files**
   
   We've already added these files to make the application compatible with Railway:
   - `backend/startup.py`: Handles the PORT environment variable correctly
   - `backend/Procfile`: Tells Railway how to run your application
   - `backend/railway.json`: Configuration file for Railway

3. **Deploy to Railway**

   a. **Create a new project** in the Railway dashboard:
      - Log in to [Railway](https://railway.app)
      - Click "New Project" 
      - Select "Deploy from GitHub"
      - Connect to your GitHub repository
   
   b. **Configure the service**:
      - After the initial deployment (which might fail), click on your service
      - Go to the "Settings" tab
      - Find "Root Directory" and set it to `/backend`
      - Click "Update" or "Save"
   
   c. **Set environment variables**:
      - Still in the Settings tab, go to the "Variables" section
      - Add the following variables:
         - `GEMINI_API_KEY`: Your Google Gemini API key
         - `JWT_SECRET`: `0804792514dd2b5b1b502a6582243cf90d9160d51da0f71d2648cb1a631af00b`
         - `REDIS_URL`: Your Redis connection string (e.g., `redis://default:password@hostname:port`)
         - `CLIENT_VERIFICATION_TOKEN`: `3a7c6f8d2e1b4a9c8f7e6d5c4b3a2e1d`
   
   d. **Deploy the application**:
      - Railway should automatically trigger a new deployment when you save your settings
      - Or you can manually trigger a deployment from the "Deployments" tab
   
   e. **Get your deployment URL**:
      - Go to the "Settings" tab
      - Find the "Domains" section
      - Copy your generated domain (e.g., `https://your-app-name.up.railway.app`)

4. **Verify Deployment**
   - Visit your deployment URL
   - You should see a response with `{"status": "online", "version": "1.0.0"}`

## 2. Integrating the Voice Button on Your Website

There are two ways to add the voice button to your website:

### Option 1: Quick Script Integration (Recommended)

1. **Copy the following script tag** and add it to your website's HTML (ideally just before the closing `</body>` tag):

```html
<!-- Gemini Voice Chat Button -->
<script>
// Configure your variables
window.chatbotConfig = {
  username: "{{USER.NAME}}",
  userId: "{{USER.ID}}",
  currentUrl: window.location.href,
  currentPath: window.location.pathname
};

// Add the voice button script
(function(d,s,id){
  var js,fjs=d.getElementsByTagName(s)[0];
  if(d.getElementById(id)){return;}
  js=d.createElement(s);js.id=id;
  js.src="https://your-bucket.s3.amazonaws.com/voice-button.min.js"; // Replace with your hosted script URL
  fjs.parentNode.insertBefore(js,fjs);
}(document,"script","gemini-voice-widget-js"));
</script>
```

2. **Update the script URL** to point to where you host the `voice-button.min.js` file.

### Option 2: Custom Integration

1. **Copy the `voice-button.js` file** from this repository.

2. **Modify the configuration** at the top of the file:
   - `apiEndpoint`: Set to your Railway deployment URL
   - `clientToken`: Set to match your `CLIENT_VERIFICATION_TOKEN` environment variable

   Note: The application is configured to use only the 'Aoede' voice.

3. **Host the script** on your website or a CDN.

4. **Add to your website** using a script tag:
   ```html
   <script src="path/to/your/voice-button.js"></script>
   ```

## 3. Security Considerations

### API Key Protection
The Google Gemini API key is never exposed to the client:
- The API key is stored only as an environment variable on Railway
- The front-end uses a less sensitive client verification token instead
- All API calls to Google services happen server-side

### Client Verification
The client verification token provides a basic layer of security:
- It prevents unauthorized websites from using your backend
- It's not as sensitive as your Google API key
- You should still keep it private, but the risk is much lower if it's exposed

### JWT Authentication
- WebSocket connections are secured using JWT tokens
- Each session has its own unique token
- Tokens expire after 30 minutes

## 4. Customizing the Voice Button

### Position Adjustment
To change the button position, modify the CSS in the script:

```javascript
// In voice-button.js
.gemini-voice-button {
  position: fixed;
  bottom: 20px; // Change this
  right: 20px;  // Change this
  // ...
}
```

### Color Adjustment
To use different colors, modify:

```javascript
// In voice-button.js
.gemini-voice-button {
  background-color: #A373F8; // Change to your brand color
  // ...
}
```

## 5. Authentication and User Identification

The script automatically reads user data from the `window.chatbotConfig` object:

```javascript
window.chatbotConfig = {
  username: "{{USER.NAME}}",
  userId: "{{USER.ID}}",
  currentUrl: window.location.href,
  currentPath: window.location.pathname
};
```

Make sure to replace `{{USER.NAME}}` and `{{USER.ID}}` with actual user data from your system.

## 6. Voice Configuration

This application uses the 'Aoede' voice from Google's text-to-speech system. No voice selection is needed as this voice has been pre-selected for optimal results.

## 7. Troubleshooting

### Common Issues

1. **"Failed to initialize session" error**
   - Check that your client verification token matches on both client and server
   - Verify your Redis connection is working

2. **"Invalid client token" error**
   - Make sure your `CLIENT_VERIFICATION_TOKEN` environment variable is correctly set in Railway
   - Ensure the `clientToken` in voice-button.js matches exactly

3. **WebSocket connection issues**
   - Make sure you're using `wss://` protocol for WebSocket connections to your Railway app
   - Check Railway logs for any connection errors

4. **Microphone not working**
   - Make sure your website is served over HTTPS (required for microphone access)
   - Check for microphone permissions in browser settings

5. **Deployment issues on Railway**
   - Verify that the "Root Directory" is set to `/backend`
   - Check that all environment variables are set correctly
   - Look for specific error messages in the Railway deployment logs

### Logs and Debugging

- Check Railway deployment logs for backend issues
- Use browser developer console for frontend debugging

## 8. Railway vs. Vercel

We're using Railway instead of Vercel because:
- Railway fully supports WebSockets, which are essential for real-time voice communication
- Railway runs persistent services rather than serverless functions with timeout limitations
- Railway's environment is better suited for applications that maintain long-lived connections

## Need Help?

If you encounter issues during deployment or integration, please contact support at support@yourcompany.com. 