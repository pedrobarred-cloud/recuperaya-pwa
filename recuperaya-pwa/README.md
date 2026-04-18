# 🎉 RecuperaYa! MVP PWA

Digital platform for claiming back unjust credit card charges - without lawyers, without upfront costs.

## 🚀 Quick Start

### Local Development

```bash
# Install dependencies
npm install

# Create .env.local with your Firebase keys
cp .env.example .env.local
# Then edit .env.local with your Firebase credentials

# Run development server
npm run dev

# Open http://localhost:3000
```

### Build for Production

```bash
npm run build
npm start
```

## 🌐 Deployment to Netlify

### Automatic Deployment

1. Push code to GitHub
2. Connect repo to Netlify: https://app.netlify.com
3. Build command: `npm run build`
4. Publish directory: `.next`
5. Add environment variables in Netlify Dashboard:
   - `NEXT_PUBLIC_FIREBASE_API_KEY`
   - `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
   - `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
   - `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
   - `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
   - `NEXT_PUBLIC_FIREBASE_APP_ID`
   - `NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID`

### CLI Deployment

```bash
npm install -g netlify-cli
netlify login
netlify deploy --prod
```

## 📱 PWA Features

- ✅ Installable on mobile (Add to Home Screen)
- ✅ Works offline with Service Worker
- ✅ Fast performance (optimized for Lighthouse)
- ✅ Responsive design (mobile-first)
- ✅ Share via WhatsApp
- ✅ Download PDF claims

## 📁 Project Structure

```
recuperaya-pwa/
├── app/
│   ├── layout.tsx        # Root layout with PWA setup
│   └── page.tsx          # Main MVP component
├── lib/
│   └── firebase.ts       # Firebase initialization
├── public/
│   ├── manifest.json     # PWA manifest
│   ├── sw.js            # Service Worker
│   └── icons/           # App icons
├── .env.local           # Firebase credentials (NEVER commit)
├── .env.example         # Template for env variables
├── netlify.toml         # Netlify configuration
├── next.config.ts       # Next.js configuration
└── package.json         # Dependencies
```

## 🔐 Environment Variables

Never commit `.env.local` to GitHub!

```env
NEXT_PUBLIC_FIREBASE_API_KEY=...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...
NEXT_PUBLIC_FIREBASE_PROJECT_ID=...
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=...
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
NEXT_PUBLIC_FIREBASE_APP_ID=...
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=...
```

## 🛠️ Tech Stack

- **Framework**: Next.js 15 (React 19)
- **Styling**: Inline styles + Tailwind (optional)
- **Backend**: Firebase Storage + Analytics
- **Hosting**: Netlify
- **PWA**: Native Service Worker support

## 🎯 Features Implemented

- ✅ Landing page with CTA
- ✅ User signup (email, name, bank)
- ✅ Interview form (charge amount, date)
- ✅ Estimation engine (rule-based calculation)
- ✅ PDF document generation
- ✅ WhatsApp sharing
- ✅ Dashboard with claim history
- ✅ Offline support
- ✅ PWA installation
- ✅ Firebase Storage integration

## 🚀 Next Steps (Post-MVP)

- [ ] Supabase database for persistence
- [ ] Email notifications (SendGrid)
- [ ] Twilio Video for advisor calls
- [ ] Admin dashboard
- [ ] Analytics (Google Analytics 4)
- [ ] SMS notifications

## 📄 License

Proprietary - RecuperaYa! 2025

## 👨‍💻 Support

For deployment issues:
1. Check `netlify.toml` configuration
2. Verify environment variables in Netlify Dashboard
3. Check browser console for errors
4. Ensure Firebase project is active and Storage is enabled

---

**Built for helping Spanish consumers claim back unjust credit card charges.** ⚖️
