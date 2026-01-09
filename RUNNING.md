# 🚀 Running the Dukdik Bot

This guide provides step-by-step instructions to get the **LINE Webhook Backend Service** up and running on your local machine.

---

## 📋 Prerequisites

Before starting, ensure you have the following installed:
- **Node.js** (v18 or later)
- **npm** (comes with Node.js)
- **cloudflared** (for tunneling)

---

## 🛠️ Step 1: Environment Setup

1. **Copy the environment template**:
   ```bash
   cp .env.example .env
   ```

2. **Configure your secrets**:
   Open `.env` and fill in the following values:
   - `LINE_CHANNEL_SECRET`: From LINE Developers Console.
   - `LINE_CHANNEL_ACCESS_TOKEN`: From LINE Developers Console.
   - `GOOGLE_FORM_URL`: The submission URL for your Google Form.
   - `GOOGLE_FORM_ENTRY_ID`: The specific field ID (e.g., `entry.12345`).
   - `CLOUDINARY_URL`: Your Cloudinary connection string (`cloudinary://api_key:api_secret@cloud_name`).

---

## 📦 Step 2: Install Dependencies

Run the following command in the project root:
```bash
npm install
```

---

## 🏃 Step 3: Start the Application

Start the NestJS server in development mode:
```bash
npm run start:dev
```
The server will start on `http://localhost:3000`.

---

## 🌐 Step 4: Expose to the Internet (Cloudflare Tunnel)

LINE requires an HTTPS endpoint to send webhook events. Use Cloudflare Tunnel to create one:

1. **Start the tunnel**:
   ```bash
   cloudflared tunnel --url http://localhost:3000
   ```

2. **Get the URL**:
   Look for a URL ending in `.trycloudflare.com` in the terminal output.
   *Example: `https://rapid-testing-engine.trycloudflare.com`*

---

## 📲 Step 5: Configure LINE Developers Console

1. Go to the [LINE Developers Console](https://developers.line.biz/console/).
2. Select your Provider and Channel.
3. Under **Messaging API settings**, find the **Webhook URL** field.
4. Paste your Cloudflare URL followed by `/webhook/line`:
   *Example: `https://rapid-testing-engine.trycloudflare.com/webhook/line`*
5. Click **Verify** to test the connection.
6. **Enable "Use webhook"** if it's not already on.

---

## 🧪 Testing

1. Send a text message to your LINE Bot.
2. Check the terminal logs to see the event being received and processed.
3. Check your Google Form to verify the data was submitted successfully.

---

## 📁 Project Structure

- `src/webhook`: Contains the core logic for receiving and dispatching LINE events.
- `src/external`: Contains the integration logic for Google Forms.
- `src/common/guards`: Contains the `LineSignatureGuard` for security verification.
