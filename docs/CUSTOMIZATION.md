# 🎨 Customization Guide

## Quick Start Customization

### 1. Update Branding

#### Change Logo/Brand Name
**File:** `src/components/Navbar.tsx` and `src/components/Footer.tsx`

```tsx
// Current:
<h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
  Voyar
</h1>

// Replace with your brand:
<h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
  YourBrand
</h1>
```

### 2. Customize Colors

#### Change Primary Gradient
**Files:** Multiple components use `from-blue-600 to-purple-600`

**Option A:** Find and replace globally
- Search: `from-blue-600 to-purple-600`
- Replace: `from-[your-color] to-[your-color]`

**Option B:** Update Tailwind config
**File:** `tailwind.config.js`

```js
theme: {
  extend: {
    colors: {
      primary: {
        DEFAULT: 'hsl(var(--primary))',
        foreground: 'hsl(var(--primary-foreground))'
      },
    }
  }
}
```

Then update `src/index.css`:
```css
:root {
  --primary: 221 83% 53%; /* Your custom color in HSL */
}
```

### 3. Add Real Product Images

#### Replace Emoji Placeholders
**File:** `src/components/ProductGrid.tsx`

```tsx
// Current:
const products = [
  {
    id: 1,
    name: 'Classic Aviator',
    image: '🕶️',
    // ...
  },
]

// Update to:
const products = [
  {
    id: 1,
    name: 'Classic Aviator',
    image: '/images/products/aviator.jpg', // or import from assets
    // ...
  },
]

// Then in JSX:
<img 
  src={product.image} 
  alt={product.name}
  className="w-full h-full object-cover"
/>
```

### 4. Update Hero Section

#### Change Hero Text
**File:** `src/components/Hero.tsx`

```tsx
// Update headline:
<h1 ref={titleRef} className="...">
  Your Custom
  <span className="block bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
    Headline Here
  </span>
</h1>

// Update subtitle:
<p ref={subtitleRef} className="...">
  Your custom description text here.
</p>
```

#### Change Stats
```tsx
<div className="text-3xl font-bold text-gray-900">10M+</div>
<div className="text-sm text-gray-600">Happy Customers</div>
```

### 5. Customize Navigation Links

**File:** `src/components/Navbar.tsx`

```tsx
const navLinks = [
  'Your Link 1',
  'Your Link 2',
  'Your Link 3',
  'Your Link 4',
  'Your Link 5',
]
```

### 6. Update Features

**File:** `src/components/Features.tsx`

```tsx
import { YourIcon1, YourIcon2 } from 'lucide-react'

const features = [
  {
    icon: YourIcon1,
    title: 'Your Feature',
    description: 'Your description',
  },
  // Add more features
]
```

### 7. Modify Product Categories

**File:** `src/components/ProductGrid.tsx`

```tsx
const products = [
  {
    id: 1,
    name: 'Your Product Name',
    category: 'Your Category',
    price: '$99',
    image: '🛍️',
    description: 'Your product description',
  },
  // Add as many products as you need
]
```

### 8. Update Contact Information

**File:** `src/components/Footer.tsx`

```tsx
<Phone className="h-5 w-5 mr-2 mt-0.5" />
<span>Your Phone Number</span>

<Mail className="h-5 w-5 mr-2 mt-0.5" />
<span>your@email.com</span>

<MapPin className="h-5 w-5 mr-2 mt-0.5" />
<span>Your Address</span>
```

### 9. Customize Testimonials

**File:** `src/components/Testimonials.tsx`

```tsx
const testimonials = [
  {
    name: 'Customer Name',
    role: 'Their Role/Title',
    rating: 5,
    text: 'Their testimonial text here',
    avatar: '👤', // or use <img src="..." />
  },
  // Add more testimonials
]
```

### 10. Update Social Media Links

**File:** `src/components/Footer.tsx`

```tsx
<Button variant="ghost" size="icon" className="..." asChild>
  <a href="https://facebook.com/yourpage" target="_blank" rel="noopener noreferrer">
    <Facebook className="h-5 w-5" />
  </a>
</Button>
```

## Advanced Customization

### Add New Section

1. Create new component file:
```tsx
// src/components/YourNewSection.tsx
import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

export const YourNewSection = () => {
  const sectionRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Your animations here
    }, sectionRef)

    return () => ctx.revert()
  }, [])

  return (
    <div ref={sectionRef} className="py-24 bg-white">
      {/* Your content */}
    </div>
  )
}
```

2. Import and add to App.tsx:
```tsx
import { YourNewSection } from './components/YourNewSection'

function App() {
  return (
    <div className="min-h-screen">
      {/* ... other sections ... */}
      <YourNewSection />
      {/* ... */}
    </div>
  )
}
```

### Modify Animations

**Change Animation Speed:**
```tsx
// Current:
gsap.from(element, { y: 100, opacity: 0, duration: 0.8 })

// Faster:
gsap.from(element, { y: 100, opacity: 0, duration: 0.4 })

// Slower:
gsap.from(element, { y: 100, opacity: 0, duration: 1.5 })
```

**Change Animation Type:**
```tsx
// Slide from left:
gsap.from(element, { x: -100, opacity: 0 })

// Scale in:
gsap.from(element, { scale: 0.5, opacity: 0 })

// Rotate in:
gsap.from(element, { rotation: 180, opacity: 0 })
```

**Change Easing:**
```tsx
// Available easings:
ease: 'power1.out'    // Gentle
ease: 'power2.out'    // Medium
ease: 'power3.out'    // Strong
ease: 'back.out(1.7)' // Bounce back
ease: 'elastic.out'   // Elastic bounce
```

### Add Router for Multiple Pages

1. Install React Router:
```bash
npm install react-router-dom
```

2. Create pages folder:
```
src/
├── pages/
│   ├── Home.tsx
│   ├── Products.tsx
│   ├── About.tsx
│   └── Contact.tsx
```

3. Set up routing in main.tsx:
```tsx
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Home } from './pages/Home'
import { Products } from './pages/Products'

function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/products" element={<Products />} />
        {/* more routes */}
      </Routes>
      <Footer />
    </BrowserRouter>
  )
}
```

### Integrate Backend API

1. Create API service:
```tsx
// src/services/api.ts
export const api = {
  async getProducts() {
    const response = await fetch('https://your-api.com/products')
    return response.json()
  },
  
  async subscribeNewsletter(email: string) {
    const response = await fetch('https://your-api.com/subscribe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    })
    return response.json()
  },
}
```

2. Use in components:
```tsx
import { useEffect, useState } from 'react'
import { api } from '../services/api'

export const ProductGrid = () => {
  const [products, setProducts] = useState([])

  useEffect(() => {
    api.getProducts().then(setProducts)
  }, [])

  // render products...
}
```

## Style Customization

### Change Font

**File:** `src/index.css`

```css
body {
  font-family: 'Your Font', -apple-system, BlinkMacSystemFont, sans-serif;
}
```

Add font link in `index.html`:
```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Your+Font&display=swap" rel="stylesheet">
```

### Adjust Spacing

**Section Padding:**
- Default: `py-24` (96px)
- Smaller: `py-16` (64px)
- Larger: `py-32` (128px)

**Container Width:**
- Default: `max-w-7xl`
- Narrower: `max-w-5xl`
- Wider: `max-w-full`

### Change Border Radius

**Global change in** `tailwind.config.js`:
```js
theme: {
  extend: {
    borderRadius: {
      'lg': '1rem',    // Larger
      'md': '0.75rem', // Medium
      'sm': '0.5rem',  // Smaller
    }
  }
}
```

## Testing Your Changes

1. Save your files
2. Check the browser (with HMR, changes appear instantly)
3. Test responsiveness:
   - Use browser DevTools
   - Toggle device toolbar
   - Test on actual devices

## Common Issues & Solutions

### Images not loading
- Check file path is correct
- Use `/` for absolute paths from public folder
- Or import: `import img from './assets/image.jpg'`

### Animations not working
- Ensure GSAP is imported
- Check ScrollTrigger is registered
- Verify refs are attached to elements
- Check cleanup in useEffect return

### Tailwind classes not applying
- Make sure file is in `content` array in tailwind.config.js
- Restart dev server after config changes
- Don't use dynamic class names (use full strings)

---

Happy customizing! 🎨 Your website, your style! ✨
