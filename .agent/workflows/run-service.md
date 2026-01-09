---
description: How to run and test the LINE Webhook Backend
---

# 🚀 Running the Webhook Service

Follow these steps to get the service up and running.

### 1. Configure Environment Variables
Create a `.env` file in the root directory and add your credentials:

```env
LINE_CHANNEL_SECRET=your_channel_secret
LINE_CHANNEL_ACCESS_TOKEN=your_channel_access_token
GOOGLE_FORM_URL=https://docs.google.com/forms/d/e/xxxxx/formResponse
GOOGLE_FORM_ENTRY_ID=entry.123000
PORT=3000
```

### 2. Install Dependencies
If you haven't already:
```bash
npm install
```

### 3. Start the Server
// turbo
```bash
npm run start:dev
```

### 4. Expose to the Internet (Cloudflare Tunnel)
Since LINE requires an HTTPS URL, use **Cloudflare Tunnel** to expose your local port safely:

1. **Install cloudflared**: [Download here](https://developers.cloudflare.com/cloudflare-one/connections/connect-networks/get-started-guide/local-management/install-cloudflared/) if not installed.
2. **Run the tunnel**:
   ```bash
   cloudflared tunnel --url http://localhost:3000
   ```
3. **Capture the URL**: Look for the `trycloudflare.com` link in the output (e.g., `https://random-words.trycloudflare.com`).
4. **Update LINE**: Set your LINE Webhook URL to: `https://<your-tunnel-url>/webhook/line`

### 5. Test the Webhook
You can use the LINE Developer Console to send a "Verify" request, or send a message to your bot.
Check the terminal logs to see event processing and Google Forms submission.
