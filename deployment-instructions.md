# Gemini Voice Chat - Deployment Instructions

This guide will walk you through deploying the Gemini Voice Chat application and integrating it with your website.

## 1. Backend Deployment on Vercel

### Prerequisites
- A Vercel account
- A Google API key for Gemini
- A Redis instance (Upstash Redis is recommended for Vercel)

### Deployment Steps

1. **Fork/Clone the repository**
   ```bash
   git clone <your-forked-repo-url>
   cd kadence_voice
   ```

2. **Set up environment variables in Vercel**
   - `GEMINI_API_KEY`: Your Google API key for Gemini (kept secure on the server)
   - `JWT_SECRET`: A strong random string for JWT token generation
   - `REDIS_URL`: Your Redis connection URL (e.g., from Upstash)
   - `CLIENT_VERIFICATION_TOKEN`: Set this to `3a7c6f8d2e1b4a9c8f7e6d5c4b3a2e1d` (or generate your own token)
   - `APP_VERSION`: Optional, default is "1.0.0"

3. **About the client verification token**
   
   This implementation uses `3a7c6f8d2e1b4a9c8f7e6d5c4b3a2e1d` as the default client verification token. This token is already configured in both the backend and frontend code.
   
   If you want to use a different token:
   ```bash
   # Run this in your terminal to generate a random token
   openssl rand -hex 16
   ```
   Then update:
   - The `CLIENT_VERIFICATION_TOKEN` environment variable in Vercel
   - The `clientToken` setting in your voice-button.js file

4. **Deploy to Vercel**
   ```bash
   cd backend
   vercel
   ```
   
   Follow the Vercel CLI prompts to link your project and deploy it.

5. **Verify Deployment**
   - Visit your deployment URL (e.g., `https://your-project.vercel.app/`)
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
   - `apiEndpoint`: Set to your Vercel deployment URL
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
- The API key is stored only as an environment variable on Vercel
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
   - Make sure your `CLIENT_VERIFICATION_TOKEN` environment variable is correctly set in Vercel
   - Ensure the `clientToken` in voice-button.js matches exactly

3. **WebSocket connection issues**
   - Ensure Vercel function timeout is set appropriately for WebSockets
   - Check for CORS issues in your browser console

4. **Microphone not working**
   - Make sure your website is served over HTTPS (required for microphone access)
   - Check for microphone permissions in browser settings

### Logs and Debugging

- Check Vercel function logs for backend issues
- Use browser developer console for frontend debugging

## Need Help?

If you encounter issues during deployment or integration, please contact support at support@yourcompany.com. 