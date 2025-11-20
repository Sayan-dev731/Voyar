# Component Documentation

## 🎨 UI Components

### Button (`src/components/ui/button.tsx`)
A versatile button component with multiple variants and sizes.

**Variants:**
- `default` - Primary blue button
- `outline` - Outlined button with border
- `ghost` - Transparent button with hover effect
- `link` - Text button with underline

**Sizes:**
- `default` - Standard size (h-10)
- `sm` - Small (h-9)
- `lg` - Large (h-11)
- `icon` - Square icon button (h-10 w-10)

**Usage:**
```tsx
<Button variant="default" size="lg">Click Me</Button>
<Button variant="outline">Outlined</Button>
<Button variant="ghost" size="icon"><Icon /></Button>
```

### Card (`src/components/ui/card.tsx`)
Card container with header, content, and footer sections.

**Components:**
- `Card` - Main container
- `CardHeader` - Header section
- `CardTitle` - Title text
- `CardDescription` - Description text
- `CardContent` - Main content area
- `CardFooter` - Footer section

**Usage:**
```tsx
<Card>
  <CardHeader>
    <CardTitle>Title</CardTitle>
    <CardDescription>Description</CardDescription>
  </CardHeader>
  <CardContent>Content here</CardContent>
</Card>
```

## 🏗️ Layout Components

### Navbar (`src/components/Navbar.tsx`)
Sticky navigation with scroll effects and mobile menu.

**Features:**
- Transparent → solid background on scroll
- Backdrop blur effect
- Mobile responsive hamburger menu
- Smooth transitions
- Shopping cart and search icons

**Animations:**
- Background blur on scroll
- Mobile menu slide-in

### Footer (`src/components/Footer.tsx`)
Comprehensive footer with links and contact info.

**Sections:**
- Company information
- Quick links
- Customer service
- Contact details
- Social media links
- Copyright and policies

## 📱 Content Sections

### Hero (`src/components/Hero.tsx`)
Eye-catching hero section with GSAP animations.

**Features:**
- Animated text entrance
- Floating glasses image
- Gradient background
- CTA buttons
- Statistics display

**GSAP Animations:**
- Title slides up and fades in
- Subtitle follows with delay
- Buttons appear last
- Image scales in
- Continuous floating animation

### Features (`src/components/Features.tsx`)
Highlight key service features with icons.

**Features:**
- 4 feature cards
- Icon animations on scroll
- Hover effects
- Gradient icon backgrounds

**GSAP Animations:**
- Cards slide up on scroll
- Staggered entrance effect

### ProductGrid (`src/components/ProductGrid.tsx`)
Showcase products in a responsive grid.

**Features:**
- 6 product cards
- Category labels
- Price display
- Hover scale effect
- Shadow transitions

**GSAP Animations:**
- Title animation
- Staggered card entrance
- Scroll-triggered animations

### VirtualTryOn (`src/components/VirtualTryOn.tsx`)
Highlight virtual try-on feature.

**Features:**
- Gradient background
- Feature list
- Demo placeholder
- CTA button

**GSAP Animations:**
- Content slides from left
- Image slides from right
- Triggered on scroll

### BrandShowcase (`src/components/BrandShowcase.tsx`)
Display premium brand partnerships.

**Features:**
- 6 brand cards
- Hover effects
- Responsive grid

**GSAP Animations:**
- Scale and fade entrance
- Staggered animation
- Back easing effect

### Testimonials (`src/components/Testimonials.tsx`)
Customer reviews and ratings.

**Features:**
- 3 testimonial cards
- Star ratings
- Customer avatars
- Hover lift effect

**GSAP Animations:**
- Title animation
- Staggered card entrance
- Scroll-triggered

### Newsletter (`src/components/Newsletter.tsx`)
Email subscription form.

**Features:**
- Email input field
- Form validation
- Gradient background
- Subscribe button
- Privacy notice

## 🎭 Animation Patterns

### GSAP Timeline
Used in Hero component for sequential animations:
```tsx
const tl = gsap.timeline({ defaults: { ease: 'power3.out' } })
tl.from(element1, { y: 100, opacity: 0, duration: 1 })
  .from(element2, { y: 50, opacity: 0 }, '-=0.5') // Overlap
```

### ScrollTrigger
Used in most sections for scroll-based animations:
```tsx
gsap.from(element, {
  scrollTrigger: {
    trigger: element,
    start: 'top 80%',
    end: 'bottom 60%',
    toggleActions: 'play none none reverse',
  },
  y: 50,
  opacity: 0,
  duration: 0.8,
})
```

### Stagger Animation
Used for multiple elements entering sequentially:
```tsx
gsap.from(cards, {
  scrollTrigger: { /* config */ },
  y: 100,
  opacity: 0,
  stagger: 0.1, // 0.1s delay between each
  duration: 0.6,
})
```

## 🎨 Design System

### Colors
- Primary: Blue (600) to Purple (600) gradient
- Background: White / Gray-50
- Text: Gray-900 (dark) / Gray-600 (muted)
- Accent: Blue-600

### Typography
- Headings: Bold, large sizes (text-4xl to text-7xl)
- Body: Regular weight, readable sizes
- Font: Apple system fonts (-apple-system, BlinkMacSystemFont)

### Spacing
- Section padding: py-24 (96px)
- Container: max-w-7xl mx-auto
- Grid gaps: gap-8 (32px)

### Effects
- Shadows: shadow-lg, shadow-2xl
- Transitions: duration-300
- Hover: -translate-y-1, -translate-y-2
- Border radius: rounded-lg, rounded-2xl, rounded-3xl

## 🚀 Performance Tips

1. **Lazy Loading**: Consider lazy loading images when you add real product images
2. **Code Splitting**: Use React.lazy() for route-based splitting
3. **GSAP Context**: Always clean up GSAP animations with `ctx.revert()`
4. **Memoization**: Use React.memo for heavy components
5. **Image Optimization**: Replace emojis with optimized images (WebP format)

## 📝 Customization Guide

### Adding New Products
Edit `ProductGrid.tsx`:
```tsx
const products = [
  {
    id: 7,
    name: 'Your Product',
    category: 'Category',
    price: '$XX',
    image: '😎', // or <img src="..." />
    description: 'Description',
  },
]
```

### Changing Colors
Edit `tailwind.config.js` for theme colors or use Tailwind classes directly.

### Adding New Sections
1. Create component in `src/components/`
2. Import in `App.tsx`
3. Add GSAP animations if needed
4. Use consistent spacing (py-24)

---

All components are TypeScript-ready and fully responsive! 🎉
