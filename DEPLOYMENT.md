# Deployment Guide

This guide will help you deploy your Voyar website to various platforms.

## 📦 Build for Production

First, create an optimized production build:

```bash
npm run build
```

This creates a `dist` folder with optimized static files.

## 🚀 Deployment Options

### 1. Vercel (Recommended)

Vercel offers the easiest deployment for Vite projects:

1. Install Vercel CLI:
```bash
npm i -g vercel
```

2. Deploy:
```bash
vercel
```

Or connect your GitHub repository at [vercel.com](https://vercel.com) for automatic deployments.

### 2. Netlify

1. Install Netlify CLI:
```bash
npm i -g netlify-cli
```

2. Build and deploy:
```bash
npm run build
netlify deploy --prod --dir=dist
```

Or drag and drop the `dist` folder to [app.netlify.com/drop](https://app.netlify.com/drop)

### 3. GitHub Pages

1. Add to `vite.config.ts`:
```typescript
export default defineConfig({
  base: '/your-repo-name/',
  // ... rest of config
})
```

2. Install gh-pages:
```bash
npm install -D gh-pages
```

3. Add to `package.json` scripts:
```json
{
  "scripts": {
    "predeploy": "npm run build",
    "deploy": "gh-pages -d dist"
  }
}
```

4. Deploy:
```bash
npm run deploy
```

### 4. Firebase Hosting

1. Install Firebase CLI:
```bash
npm install -g firebase-tools
```

2. Login and initialize:
```bash
firebase login
firebase init hosting
```

3. Select `dist` as your public directory

4. Deploy:
```bash
npm run build
firebase deploy
```

### 5. AWS S3 + CloudFront

1. Build the project:
```bash
npm run build
```

2. Upload `dist` folder to S3 bucket

3. Enable static website hosting

4. Configure CloudFront distribution (optional, for CDN)

## 🔧 Environment Variables

If you need environment variables:

1. Create `.env` file:
```env
VITE_API_URL=your-api-url
VITE_ANALYTICS_ID=your-analytics-id
```

2. Access in code:
```typescript
const apiUrl = import.meta.env.VITE_API_URL
```

## ✅ Pre-deployment Checklist

- [ ] Update meta tags in `index.html`
- [ ] Add favicon and app icons
- [ ] Configure robots.txt
- [ ] Add sitemap.xml
- [ ] Set up analytics (Google Analytics, etc.)
- [ ] Test on different devices and browsers
- [ ] Optimize images and assets
- [ ] Configure 404 page
- [ ] Set up custom domain (if needed)
- [ ] Enable HTTPS

## 🎯 Performance Tips

- Images are currently emojis - replace with optimized images
- Consider lazy loading for images
- Add image optimization with tools like `sharp` or `imagemin`
- Implement code splitting for better performance
- Use CDN for static assets
- Enable gzip/brotli compression

## 📊 Monitoring

Consider adding:
- Google Analytics
- Sentry for error tracking
- Performance monitoring (Lighthouse CI)
- Uptime monitoring

---

Your site will be live at your chosen platform's URL! 🎉
