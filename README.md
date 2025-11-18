# Voyar - Premium Eyewear Website

A beautiful, modern eyewear e-commerce website built with React, Vite, GSAP, and shadcn/ui. Features a clean Apple-inspired design with smooth animations and an elegant user experience.

## 🚀 Features

- **Modern Tech Stack**: React 18 + TypeScript + Vite for blazing-fast development
- **Advanced Animations**: GSAP with ScrollTrigger for smooth, professional animations
- **Beautiful UI**: shadcn/ui components with Tailwind CSS for a clean, Apple-like aesthetic
- **Responsive Design**: Fully responsive across all devices
- **Product Showcase**: Elegant product cards with hover effects
- **Virtual Try-On**: Interactive section for virtual eyewear testing
- **Customer Testimonials**: Social proof with animated testimonial cards
- **Brand Showcase**: Premium brand partnerships display

## 🛠️ Technologies Used

- **React** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool & dev server
- **GSAP** - Animation library
- **Tailwind CSS** - Utility-first CSS framework
- **shadcn/ui** - Re-usable component library
- **Lucide React** - Beautiful icons
- **React Router DOM** - Navigation (ready for routing)

## 📦 Installation

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm run dev
```

3. Open your browser and visit `http://localhost:5173`

## 🏗️ Project Structure

```
src/
├── components/
│   ├── ui/              # shadcn/ui base components
│   │   ├── button.tsx
│   │   └── card.tsx
│   ├── Navbar.tsx       # Navigation with scroll effects
│   ├── Hero.tsx         # Animated hero section
│   ├── Features.tsx     # Feature highlights
│   ├── ProductGrid.tsx  # Product showcase
│   ├── VirtualTryOn.tsx # Virtual try-on section
│   ├── BrandShowcase.tsx # Premium brands
│   ├── Testimonials.tsx # Customer reviews
│   └── Footer.tsx       # Footer section
├── lib/
│   └── utils.ts         # Utility functions
├── App.tsx              # Main app component
├── index.css            # Global styles
└── main.tsx             # Entry point
```

## 🎨 Design Features

- **Apple-inspired aesthetics**: Clean, minimal, and elegant
- **Smooth animations**: GSAP-powered scroll animations
- **Gradient accents**: Beautiful blue-to-purple gradients
- **Hover effects**: Interactive product cards
- **Glassmorphism**: Modern frosted glass effects
- **Custom scrollbar**: Styled scrollbar matching the theme

## 📱 Sections

1. **Hero Section** - Eye-catching introduction with animated text and floating glasses
2. **Features** - Key benefits (Free Eye Test, Warranty, Free Shipping, Quality)
3. **Product Grid** - Showcase of eyewear products with categories
4. **Virtual Try-On** - Interactive try-on feature highlight
5. **Brand Showcase** - Premium brand partnerships
6. **Testimonials** - Customer reviews and ratings
7. **Footer** - Links, contact info, and social media

## 🚀 Build for Production

```bash
npm run build
```

The build will be created in the `dist` folder.

## 📝 Customization

- **Colors**: Edit `tailwind.config.js` for color scheme changes
- **Fonts**: Modify `src/index.css` for font customization
- **Animations**: Adjust GSAP animations in component files
- **Content**: Update product data, testimonials, and features in respective components

## 🤝 Contributing

Feel free to fork this project and customize it for your needs!

## 📄 License

MIT License - feel free to use this project for personal or commercial purposes.

---

Built with ❤️ using React + Vite + GSAP
