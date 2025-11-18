# 🚀 Quick Start Guide

## 📋 Prerequisites

Before you begin, ensure you have the following installed:
- **Node.js** (v18 or higher) - [Download](https://nodejs.org/)
- **npm** (comes with Node.js) or **yarn**
- A code editor (VS Code recommended)
- A modern web browser (Chrome, Firefox, Safari, Edge)

## ⚡ Get Started in 3 Steps

### Step 1: Install Dependencies
```bash
npm install
```
This installs all required packages including React, Vite, GSAP, Tailwind CSS, and more.

### Step 2: Start Development Server
```bash
npm run dev
```
Your site will be available at `http://localhost:5173`

### Step 3: Open in Browser
Navigate to `http://localhost:5173` in your web browser.

**That's it!** 🎉 Your Voyar website is now running!

## 🎯 What You'll See

When you open the site, you'll experience:

1. **Hero Section** - Eye-catching animated landing with floating glasses
2. **Features** - 4 key service highlights
3. **Product Grid** - 6 eyewear products with categories
4. **Virtual Try-On** - Interactive feature showcase
5. **Brand Showcase** - Premium brand partnerships
6. **Testimonials** - Customer reviews
7. **Newsletter** - Email subscription form
8. **Footer** - Comprehensive site information

## 🛠️ Available Commands

```bash
# Development
npm run dev          # Start dev server with hot reload
npm run build        # Create production build
npm run preview      # Preview production build locally
npm run lint         # Run ESLint

# Deployment (after setup)
npm run deploy       # Deploy to your chosen platform
```

## 📁 Project Structure Overview

```
lensWebsite/
├── src/
│   ├── components/       # All React components
│   │   ├── ui/          # shadcn/ui base components
│   │   ├── Navbar.tsx   # Navigation
│   │   ├── Hero.tsx     # Hero section
│   │   └── ...          # Other sections
│   ├── lib/             # Utility functions
│   ├── App.tsx          # Main app component
│   ├── index.css        # Global styles
│   └── main.tsx         # Entry point
├── public/              # Static assets
├── index.html           # HTML template
└── package.json         # Dependencies
```

## 🎨 First Customizations

### Change the Brand Name
1. Open `src/components/Navbar.tsx`
2. Find `Voyar` and replace with your brand name
3. Save and see instant update in browser!

### Update Hero Headline
1. Open `src/components/Hero.tsx`
2. Find the `<h1>` tag
3. Change "See the world in perfect clarity" to your text
4. Save and watch the animation!

### Add Your Products
1. Open `src/components/ProductGrid.tsx`
2. Find the `products` array
3. Add/modify product objects
4. Save to see your products!

## 🎬 Understanding Animations

### GSAP Animations
The site uses GSAP (GreenSock Animation Platform) for smooth animations:

- **Hero animations**: Sequential entrance of text and images
- **Scroll animations**: Elements appear as you scroll
- **Hover effects**: Interactive product cards

All animations are optimized and will work on all modern browsers!

## 📱 Responsive Design

The site is fully responsive and works on:
- 📱 Mobile phones (320px and up)
- 📱 Tablets (768px and up)
- 💻 Laptops (1024px and up)
- 🖥️ Desktops (1280px and up)

Test it by resizing your browser window!

## 🔧 Troubleshooting

### Dev server not starting?
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
npm run dev
```

### Animations not smooth?
- Try disabling browser extensions
- Check if hardware acceleration is enabled
- Use a modern browser (Chrome/Firefox/Safari/Edge)

### Port already in use?
Vite will automatically try another port (5174, 5175, etc.)
Or specify a port:
```bash
npm run dev -- --port 3000
```

### Tailwind classes not working?
- Restart the dev server
- Check the class name is correct
- Ensure the file is in the `content` array in `tailwind.config.js`

## 📚 Learning Resources

### React
- [React Docs](https://react.dev/)
- [React TypeScript Cheatsheet](https://react-typescript-cheatsheet.netlify.app/)

### GSAP
- [GSAP Docs](https://greensock.com/docs/)
- [ScrollTrigger Docs](https://greensock.com/docs/v3/Plugins/ScrollTrigger)

### Tailwind CSS
- [Tailwind Docs](https://tailwindcss.com/docs)
- [Tailwind Cheatsheet](https://nerdcave.com/tailwind-cheat-sheet)

### shadcn/ui
- [shadcn/ui Docs](https://ui.shadcn.com/)

## 🚀 Next Steps

### Beginner Path
1. ✅ Run the project
2. 📝 Read the README.md
3. 🎨 Try changing colors
4. ✏️ Update text content
5. 📸 Add real images

### Intermediate Path
1. ✅ Complete Beginner Path
2. 🎭 Modify GSAP animations
3. 🧩 Add new components
4. 🎯 Customize features
5. 📱 Test on real devices

### Advanced Path
1. ✅ Complete Intermediate Path
2. 🔌 Integrate backend API
3. 🛣️ Add React Router
4. 🛒 Build shopping cart
5. 🚀 Deploy to production

## 💡 Tips for Success

1. **Start Small** - Make one change at a time
2. **Use DevTools** - Browser DevTools are your friend
3. **Read Documentation** - Check COMPONENTS.md and CUSTOMIZATION.md
4. **Experiment** - Don't be afraid to try new things
5. **Have Fun** - Enjoy the creative process!

## 🆘 Need Help?

1. Check the documentation files:
   - `README.md` - Overview and installation
   - `FEATURES.md` - Complete feature list
   - `COMPONENTS.md` - Component documentation
   - `CUSTOMIZATION.md` - How to customize
   - `DEPLOYMENT.md` - Deployment guide

2. Common issues are usually:
   - Missing dependencies → Run `npm install`
   - Port conflicts → Use different port
   - Cache issues → Clear cache and restart

3. Browser console is your friend:
   - Press F12 to open DevTools
   - Check Console tab for errors
   - Network tab shows loading issues

## 🎉 Success Checklist

- [ ] Node.js installed
- [ ] Dependencies installed (`npm install`)
- [ ] Dev server running (`npm run dev`)
- [ ] Site opens in browser
- [ ] Animations are smooth
- [ ] Mobile view works
- [ ] Made first customization
- [ ] Explored all sections
- [ ] Read documentation

---

**Congratulations!** 🎊 You're now ready to build amazing eyewear websites!

For detailed customization, see `CUSTOMIZATION.md`  
For deployment instructions, see `DEPLOYMENT.md`  
For component details, see `COMPONENTS.md`

Happy coding! 💻✨
