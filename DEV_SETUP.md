Here's a Markdown file you can drop straight into your project as
README.md (or DEV_SETUP.md).
It's written concisely but includes every step you need to set up, run, and debug the NestJS + Telegram + OpenAI bot locally.

# 🤖 Telegram × OpenAI Bot — Developer Setup Guide

A small NestJS (TypeScript) server that connects a Telegram bot with the OpenAI API  
to generate text or images (e.g., DALL·E) via commands such as `/img ...`.

---

## 🚧 1. Prerequisites

- Node ≥ 18 (LTS or newer)
- npm / yarn
- A Telegram account
- Access to the internet (ngrok or similar tunneling tool for webhooks)

---

## 🔑 2. Create required tokens

### A. Telegram bot token
1. In Telegram, open [`@BotFather`](https://t.me/BotFather).  
2. Run `/newbot`, follow prompts, copy the token it gives you:  
`1234567890:ABCDefGhIJKLmNoPQrstuvWXyz`


### B. OpenAI API key
1. Go to [https://platform.openai.com/api-keys](https://platform.openai.com/api-keys).  
2. Log in with your ChatGPT/OpenAI account.  
3. Click **"Create new secret key"**, copy the generated value starting with `sk-`.

---

## 🔧 3. Configure environment

Create a `.env` file in the project root:

```bash
TELEGRAM_TOKEN=1234567890:ABCDefGhIJKLmNoPQrstuvWXyz
OPENAI_API_KEY=sk-your-openai-key
PORT=3000
```

(Ensure `.env` is listed in `.gitignore`.)

---

## 🧱 4. Install & run the server

```bash
npm install
npm run start:dev
```

By default Nest listens on `http://localhost:3000`.

---

## 🌐 5. Expose local server securely (for webhooks)

Telegram requires a public HTTPS endpoint.  
Use ngrok (or Cloudflare Tunnel, etc.):

```bash
ngrok http 3000
```

Note the forwarding URL it prints, for example:

```
https://abc123.ngrok.io -> http://localhost:3000
```

---

## 🔗 6. Register the webhook with Telegram

Replace variables with your actual values:

```bash
curl -X POST \
  "https://api.telegram.org/bot$TELEGRAM_TOKEN/setWebhook?url=https://abc123.ngrok.io/telegram"
```

Verify:

```bash
curl "https://api.telegram.org/bot$TELEGRAM_TOKEN/getWebhookInfo"
```

You should see `"url":"https://abc123.ngrok.io/telegram"`.

---

## 💬 7. Test the bot

1. Open Telegram → search for your bot (@YourBotName) or follow the link BotFather showed.
2. Press Start.
3. Send:

```
/img a brutalist city in snow at sunset
```

4. Your NestJS logs should show an incoming update, and after a few seconds the bot will reply with a generated image.

---

## ⚙️ 8. Useful developer commands

| Task | Command |
|------|---------|
| Run locally with hot reload | `npm run start:dev` |
| Check webhook status | `curl https://api.telegram.org/bot$TELEGRAM_TOKEN/getWebhookInfo` |
| Delete webhook (for polling mode) | `curl https://api.telegram.org/bot$TELEGRAM_TOKEN/deleteWebhook` |
| Run via long polling instead of webhook | Comment the webhook logic and set `new TelegramBot(token, {polling:true})` |

---

## 🧩 9. Project structure (simplified)

```
src/
 ├─ app.module.ts
 ├─ bot/
 │   ├─ bot.module.ts
 │   ├─ bot.controller.ts   ←  POST /telegram webhook endpoint
 │   └─ bot.service.ts      ←  handles updates, calls OpenAI
.env
```

---

## 🧠 10. Troubleshooting

| Symptom | Possible cause / fix |
|---------|---------------------|
| No updates logged | Webhook not registered or ngrok closed |
| `last_error_message` in `getWebhookInfo` | Nest route path mismatch (`/telegram`) |
| 500 errors in Telegram | Check Nest console; return `{ok:true}` after handling |
| Bot replies "⚠️ Failed to generate image." | Invalid / missing `OPENAI_API_KEY` or quota limits |
| Works locally but not in production | Webhook URL must be valid HTTPS, port 443 open |

---

## Done 🎉

You can now iterate on the bot logic, adjust commands (`/ask`, `/img`, etc.),
and eventually deploy the NestJS app to any Node‑friendly host (Render, Railway, Fly.io, etc.).

---

This file lays out every key step: tokens → `.env` → ngrok → webhook → testing.  
Drop it in your repo and you'll always have a quick start manual for anyone joining the project.
