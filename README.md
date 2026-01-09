# 🎮 Dukdik Bot

A production-ready **LINE Webhook Backend Service** built with NestJS. This service processes LINE Messaging API events and integrates with external services like Google Forms.

## 🚀 Quick Start

For detailed instructions on how to set up, configure, and run this project, please refer to the:

### 📖 [**RUNNING.md - Setup Guide**](./RUNNING.md)

---

## 🏗️ Architecture

- **Security**: HMAC SHA256 Signature verification for all LINE events.
- **Handlers**: Modular design for Message, Postback, and Lifecycle events.
- **Integrations**: Asynchronous submission to Google Forms.
- **Tunneling**: Optimized for Cloudflare Tunnel development (using `cloudflared`).

---

## 🛠️ Tech Stack

- **Framework**: [NestJS](https://nestjs.com/)
- **Language**: TypeScript
- **API**: [LINE Messaging API](https://developers.line.biz/en/docs/messaging-api/)
- **External Submission**: Google Forms (via Axios)

---

## 📦 Installation

```bash
npm install
```

## 🏃 Running the app

```bash
# development
npm run start

# watch mode (recommended)
npm run start:dev

# production mode
npm run build
npm run start:prod
```

## 🧪 Stay in touch

- Author - LY Corporation Style Developer
- Repository - Dukdik Bot Webhook Service

## License

This project is [MIT licensed](https://github.com/nestjs/nest/blob/master/LICENSE).
