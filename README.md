# Next.js + Supabase Research Portal

This project is a full-stack web application built with **Next.js 15**, **Supabase**, and **SMTP (Nodemailer)**.
It provides user authentication, research paper uploads, admin workflows, and PDF rendering.

---

## 🚀 Tech Stack

* **Next.js 15** (App Router, SSR/ISR)
* **React 18**
* **Supabase** (database, authentication, API)
* **Nodemailer** (SMTP for emails)
* **pdf-lib** & **pdfjs-dist** (PDF processing & viewing)
* **qrcode** (QR code generation)

---

## 📦 Dependencies

```json
"dependencies": {
  "@supabase/auth-helpers-nextjs": "^0.10.0",
  "@supabase/ssr": "^0.6.1",
  "@supabase/supabase-js": "^2.54.0",
  "@types/nodemailer": "^7.0.0",
  "@types/qrcode": "^1.5.5",
  "next": "15.4.5",
  "nodemailer": "^7.0.5",
  "pdf-lib": "^1.17.1",
  "pdfjs-dist": "^5.4.149",
  "qrcode": "^1.5.4",
  "react": "^18.3.1",
  "react-dom": "^18.3.1"
}
```

---

## ⚙️ Setup Instructions

### 1. Clone the repository

```bash
git clone https://github.com/Ajay-Kamal/clause-and-claws.git
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Copy the example file and fill in your credentials:

```bash
cp .env.example .env.local
```

Update `.env.local` with your Supabase keys, SMTP settings, and base URL.

Example:

```env
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

SMTP_HOST=smtp.yourmail.com
SMTP_PORT=587
SMTP_USER=your-smtp-user
SMTP_PASS=your-smtp-password
FROM_NAME="Your App"
FROM_MAIL=no-reply@yourapp.com

NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

> ⚠️ Never commit `.env.local`. Only `.env.example` should be tracked.

### 4. Run the development server

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000).

---

## 🌐 Deployment

### Vercel (recommended for Next.js)

1. Push code to GitHub/GitLab/Bitbucket
2. Import repo in [Vercel](https://vercel.com)
3. Add environment variables in **Project → Settings → Environment Variables**
4. Deploy 🎉

### Render / Railway / Fly.io

Use these if you need background workers or custom binaries (e.g. `pdf2htmlEX`).

---

## 📖 Project Structure (simplified)

```
app/                # Next.js App Router pages & API routes
components/         # Reusable UI compon
```
