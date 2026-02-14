# Neural Noir Interface Style
## Design System Documentation

A sophisticated dark-mode interface featuring neural network connectivity, glassmorphism, and a luxury gold-on-black color palette designed for high-end AI and creative tools.

---

## Table of Contents

1. [Color Palette](#color-palette)
2. [Typography](#typography)
3. [Spacing & Sizing](#spacing--sizing)
4. [Effects & Animations](#effects--animations)
5. [Components](#components)
6. [Layout System](#layout-system)
7. [Implementation Guidelines](#implementation-guidelines)

---

## Color Palette

### Base Colors

| Color Name | Hex Code | RGB | Usage |
|------------|----------|-----|-------|
| **Background Base** | `#0a0a0a` | `rgb(10, 10, 10)` | Primary background, app base |
| **Pure Black** | `#000000` | `rgb(0, 0, 0)` | Deep shadows, text on white buttons |
| **Pure White** | `#ffffff` | `rgb(255, 255, 255)` | Primary text, high contrast elements |

### Gold Accent Palette

| Color Name | Hex Code | RGB | Usage |
|------------|----------|-----|-------|
| **Base Gold** | `#a78b71` | `rgb(167, 139, 113)` | Primary accent, highlights, CTAs |
| **Light Gold** | `#c9b8a0` | `rgb(201, 184, 160)` | Hover states, gradient starts |
| **Hover Gold** | `#e8d5b7` | `rgb(232, 213, 183)` | Active hover, emphasis |

### Grayscale Palette

| Color Name | Hex/RGBA | Usage |
|------------|----------|-------|
| **Gray 100** | `rgba(255, 255, 255, 0.03)` | Glassmorphic card backgrounds |
| **Gray 200** | `rgba(255, 255, 255, 0.05)` | Subtle hover states |
| **Gray 300** | `rgba(255, 255, 255, 0.08)` | Dot grid overlay |
| **Gray 400** | `rgba(255, 255, 255, 0.4)` or `#999999` | Body text, secondary information |
| **Gray 500** | `rgba(255, 255, 255, 0.6)` | Primary gray text |
| **Gray 600** | `rgba(255, 255, 255, 0.8)` | Near-white text |

### Border Colors

| Color Name | RGBA | Usage |
|------------|------|-------|
| **Border Light** | `rgba(255, 255, 255, 0.1)` | Default glass card borders |
| **Border Medium** | `rgba(255, 255, 255, 0.15)` | Hover state borders |
| **Border Gold** | `rgba(167, 139, 113, 0.4)` | Featured/highlighted card borders |

### Status Colors

| Color Name | Hex Code | Usage |
|------------|----------|-------|
| **Success Green** | `#4ade80` (green-400) | Live indicators, success states |
| **Warning Amber** | `#fbbf24` (amber-400) | Warning states |
| **Error Red** | `#f87171` (red-400) | Error states |

---

## Typography

### Font Families

```css
/* Primary Serif - Editorial Headlines */
font-family: 'Playfair Display', serif;

/* Secondary Sans - UI & Body */
font-family: 'Inter', sans-serif;
```

### Type Scale

#### Headlines (Playfair Display)

| Level | Size | Weight | Style | Line Height | Letter Spacing | Usage |
|-------|------|--------|-------|-------------|----------------|-------|
| **H1** | `clamp(2.5rem, 8vw, 6rem)` | 700 (Bold) | Italic | 1.1 | -0.02em | Hero headlines |
| **H2** | `clamp(2rem, 5vw, 3.5rem)` | 700 (Bold) | Italic | 1.2 | -0.01em | Section titles |
| **H3** | `clamp(1.5rem, 3vw, 2.5rem)` | 600 (Semibold) | Italic | 1.3 | 0 | Subsection titles |
| **H4** | `1.75rem` (28px) | 600 (Semibold) | Italic | 1.4 | 0 | Card titles |

#### Body Text (Inter)

| Level | Size | Weight | Line Height | Letter Spacing | Usage |
|-------|------|--------|-------------|----------------|-------|
| **Lead** | `1.25rem` (20px) | 400 (Regular) | 1.6 | 0 | Introduction paragraphs |
| **Body Large** | `1.125rem` (18px) | 400 (Regular) | 1.7 | 0 | Main content |
| **Body** | `1rem` (16px) | 400 (Regular) | 1.6 | 0 | Standard body text |
| **Body Small** | `0.875rem` (14px) | 400 (Regular) | 1.5 | 0 | Supporting text, captions |
| **Caption** | `0.75rem` (12px) | 400 (Regular) | 1.4 | 0.05em | Fine print, metadata |

#### UI Text (Inter)

| Level | Size | Weight | Line Height | Letter Spacing | Text Transform | Usage |
|-------|------|--------|-------------|----------------|----------------|-------|
| **Button Large** | `1rem` (16px) | 600 (Semibold) | 1 | 0.02em | none | Primary CTAs |
| **Button** | `0.875rem` (14px) | 600 (Semibold) | 1 | 0.02em | none | Secondary buttons |
| **Label** | `0.6875rem` (11px) | 600 (Semibold) | 1 | 0.1em | uppercase | Navigation, tags |
| **Feature Title** | `1.25rem` (20px) | 700 (Bold) | 1.3 | 0 | none | Feature card headlines |
| **Price** | `3rem` (48px) | 700 (Bold) | 1 | -0.01em | none | Pricing display |

### Special Typography Rules

```css
/* Ultra-thin wide-tracked roles/labels */
.role-text {
  font-weight: 100;
  letter-spacing: 0.15em;
  text-transform: uppercase;
  font-size: 0.625rem; /* 10px */
}

/* Highlighted words in headlines */
.headline-accent {
  color: #a78b71;
  font-style: italic;
}
```

---

## Spacing & Sizing

### Spacing Scale

| Token | Value | Usage |
|-------|-------|-------|
| `xs` | `4px` | Tight internal spacing |
| `sm` | `8px` | Small gaps, icon spacing |
| `md` | `16px` | Standard spacing |
| `lg` | `24px` | Card padding, section gaps |
| `xl` | `32px` | Large section padding |
| `2xl` | `48px` | Section dividers |
| `3xl` | `64px` | Major section spacing |
| `4xl` | `96px` | Hero section padding |

### Border Radius

| Token | Value | Usage |
|-------|-------|-------|
| `sm` | `8px` | Small elements, badges |
| `md` | `12px` | Buttons, inputs |
| `lg` | `20px` | Media cards, smaller components |
| `xl` | `24px` | Standard glass cards |
| `2xl` | `32px` | Large cards |
| `3xl` | `48px` | Hero components, major cards |
| `full` | `9999px` | Pills, circular elements |

### Container Widths

| Breakpoint | Max Width | Padding |
|------------|-----------|---------|
| Mobile | `100%` | `px-4` (16px) |
| Tablet | `100%` | `px-6` (24px) |
| Desktop | `1280px` | `px-12` (48px) |
| Wide | `1536px` | `px-12` (48px) |

---

## Effects & Animations

### Glassmorphism

```css
.glass-card {
  background: rgba(255, 255, 255, 0.03);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 24px;
}

.glass-card:hover {
  background: rgba(255, 255, 255, 0.05);
  border-color: rgba(255, 255, 255, 0.15);
}
```

### Shadow System

```css
/* Central glow effect */
.glow-center {
  box-shadow: 0 0 100px rgba(167, 139, 113, 0.2);
}

/* Card hover glow */
.card-glow {
  box-shadow: 0 0 60px rgba(167, 139, 113, 0.3);
}

/* Subtle card shadow */
.card-shadow {
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
}

/* Combined card effect */
.glass-card-shadow {
  box-shadow: 
    0 8px 32px rgba(0, 0, 0, 0.4),
    inset 0 1px 0 rgba(255, 255, 255, 0.1);
}
```

### Background Pattern

```css
.bg-dots {
  background-image: radial-gradient(
    circle,
    rgba(255, 255, 255, 0.08) 1px,
    transparent 1px
  );
  background-size: 32px 32px;
  background-position: 0 0;
}
```

### Animation Easing

```css
/* Primary easing function */
--ease-primary: cubic-bezier(0.4, 0, 0.2, 1);

/* Entrance animations */
--ease-entrance: cubic-bezier(0.16, 1, 0.3, 1); /* power4.out */

/* Spring effect */
--ease-spring: cubic-bezier(0.34, 1.56, 0.64, 1);
```

### Keyframe Animations

```css
/* Pulsing branch/line animation */
@keyframes pulsing-branch {
  0%, 100% {
    opacity: 0.4;
  }
  50% {
    opacity: 0.7;
  }
}

.node-line {
  animation: pulsing-branch 3s ease-in-out infinite;
}

/* Breathing animation for indicators */
@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

/* Gradient shift */
@keyframes gradient-shift {
  0%, 100% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
}
```

### Transition Specifications

```css
/* Standard transitions */
.transition-all {
  transition: all 0.3s var(--ease-primary);
}

.transition-colors {
  transition: color 0.3s var(--ease-primary),
              background-color 0.3s var(--ease-primary),
              border-color 0.3s var(--ease-primary);
}

/* Image grayscale to color */
.img-hover {
  filter: grayscale(100%);
  transition: filter 0.7s var(--ease-primary),
              transform 0.3s var(--ease-primary);
}

.img-hover:hover {
  filter: grayscale(0%);
  transform: scale(1.05);
}
```

---

## Components

### 1. Navigation Bar

**Specifications:**
- Position: `fixed`, `top-0`, `w-full`, `z-50`
- Padding: `px-6` (mobile), `px-12` (desktop), `py-4`
- Background: `rgba(10, 10, 10, 0.8)` with `backdrop-filter: blur(20px)`
- Border: `border-b border-white/10`

```html
<nav class="nav-bar">
  <div class="nav-container">
    <!-- Logo -->
    <div class="logo">
      <span class="playfair-display-bold-italic text-2xl">Brand</span>
    </div>
    
    <!-- Center Links -->
    <div class="nav-links">
      <a href="#" class="nav-link">Features</a>
      <a href="#" class="nav-link">Pricing</a>
      <a href="#" class="nav-link">About</a>
    </div>
    
    <!-- CTA Button -->
    <button class="btn-primary-pill">Start Free Trial</button>
  </div>
</nav>
```

**CSS:**
```css
.nav-link {
  font-family: 'Inter', sans-serif;
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: rgba(255, 255, 255, 0.6);
  transition: color 0.3s var(--ease-primary);
}

.nav-link:hover {
  color: #a78b71;
}

.btn-primary-pill {
  background: white;
  color: black;
  padding: 10px 24px;
  border-radius: 9999px;
  font-weight: 600;
  font-size: 14px;
}
```

---

### 2. Hero Section

**Layout:**
- Central interactive node: 16:9 aspect ratio glass card
- Floating satellite cards: 4-6 cards positioned absolutely
- Dynamic SVG connections between satellites and central node

**Central Node Card:**
```css
.hero-node {
  aspect-ratio: 16 / 9;
  max-width: 800px;
  background: rgba(255, 255, 255, 0.03);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 48px;
  padding: 48px;
  position: relative;
  box-shadow: 0 0 100px rgba(167, 139, 113, 0.2);
}
```

**Headline Styling:**
```css
.hero-headline {
  font-family: 'Playfair Display', serif;
  font-style: italic;
  font-weight: 700;
  font-size: clamp(2.5rem, 8vw, 6rem);
  line-height: 1.1;
  letter-spacing: -0.02em;
}

.hero-headline .accent {
  color: #a78b71;
}
```

**Button Group:**
- Primary: White background, black text, `px-8 py-4`, `rounded-full`
- Secondary: Transparent background, white border, white text, `px-8 py-4`, `rounded-full`

---

### 3. Neural Connection Lines

**SVG Path Specifications:**
```html
<svg class="connection-svg" width="100%" height="100%" style="position: absolute; top: 0; left: 0; pointer-events: none;">
  <defs>
    <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="10%" style="stop-color:#a78b71;stop-opacity:1" />
      <stop offset="90%" style="stop-color:#c9b8a0;stop-opacity:1" />
    </linearGradient>
  </defs>
  
  <!-- Primary line -->
  <path 
    class="node-line" 
    d="M x1,y1 C cx1,cy1 cx2,cy2 x2,y2" 
    stroke="url(#lineGradient)" 
    stroke-width="2.5" 
    fill="none"
  />
  
  <!-- Secondary dashed line -->
  <path 
    class="node-line-dashed" 
    d="M x1,y1 C cx1,cy1 cx2,cy2 x2,y2" 
    stroke="rgba(201, 184, 160, 0.3)" 
    stroke-width="1.5" 
    stroke-dasharray="5 15" 
    fill="none"
  />
</svg>
```

**CSS:**
```css
.node-line {
  opacity: 0.4;
  animation: pulsing-branch 3s ease-in-out infinite;
}

.node-line-dashed {
  opacity: 0.3;
  animation: pulsing-branch 3s ease-in-out infinite 0.5s;
}
```

---

### 4. Satellite Media Cards

**Specifications:**
- Dimensions: `220px - 340px` width
- Aspect ratio: Various (1:1, 4:5, 16:9)
- Background: Glass effect
- Image: Grayscale default, color on hover

```html
<div class="satellite-card">
  <img src="..." alt="..." class="satellite-image" />
  <div class="satellite-label">Label</div>
</div>
```

**CSS:**
```css
.satellite-card {
  width: clamp(220px, 20vw, 340px);
  background: rgba(255, 255, 255, 0.03);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 20px;
  overflow: hidden;
  transition: transform 0.3s var(--ease-primary),
              box-shadow 0.3s var(--ease-primary);
}

.satellite-card:hover {
  transform: scale(1.05);
  box-shadow: 0 0 60px rgba(167, 139, 113, 0.3);
}

.satellite-image {
  filter: grayscale(100%);
  transition: filter 0.7s var(--ease-primary);
  border-radius: 20px;
}

.satellite-card:hover .satellite-image {
  filter: grayscale(0%);
}
```

---

### 5. Live Notification Pill

**Specifications:**
- Position: Floating (absolute or fixed)
- Padding: `px-4 py-2`
- Border radius: `full`

```html
<div class="live-pill">
  <div class="live-indicator"></div>
  <span class="live-text">LIVE</span>
  <span class="live-status">1,247 active users</span>
</div>
```

**CSS:**
```css
.live-pill {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  background: rgba(255, 255, 255, 0.03);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 9999px;
}

.live-indicator {
  width: 8px;
  height: 8px;
  background: #4ade80;
  border-radius: 50%;
  animation: pulse 2s ease-in-out infinite;
}

.live-text {
  font-size: 8px;
  font-weight: 700;
  color: #4ade80;
  letter-spacing: 0.1em;
}

.live-status {
  font-size: 12px;
  color: white;
}
```

---

### 6. Feature Cards (Grid)

**Grid Layout:**
- Desktop: 4 columns
- Tablet: 2 columns
- Mobile: 1 column
- Gap: `24px`

**Card Structure:**
```html
<div class="feature-card">
  <div class="feature-icon">
    <svg>...</svg>
  </div>
  <h3 class="feature-title">Feature Name</h3>
  <p class="feature-description">Description text...</p>
</div>
```

**CSS:**
```css
.feature-card {
  background: rgba(255, 255, 255, 0.03);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 24px;
  padding: 32px;
  transition: all 0.3s var(--ease-primary);
}

.feature-card:hover {
  background: rgba(255, 255, 255, 0.05);
  border-color: rgba(255, 255, 255, 0.15);
}

.feature-icon {
  width: 48px;
  height: 48px;
  background: rgba(167, 139, 113, 0.1);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 16px;
  transition: transform 0.3s var(--ease-primary);
}

.feature-card:hover .feature-icon {
  transform: scale(1.1);
}

.feature-title {
  font-family: 'Inter', sans-serif;
  font-size: 20px;
  font-weight: 700;
  color: white;
  margin-bottom: 12px;
}

.feature-description {
  font-family: 'Inter', sans-serif;
  font-size: 14px;
  color: rgba(255, 255, 255, 0.6);
  line-height: 1.5;
}
```

---

### 7. Pricing Cards

**Layout:** 3-column grid (desktop), stacked (mobile)

**Structure:**
```html
<div class="pricing-card">
  <div class="pricing-badge">Most Popular</div>
  <h3 class="pricing-plan">Pro</h3>
  <div class="pricing-amount">
    <span class="pricing-currency">$</span>
    <span class="pricing-value">49</span>
    <span class="pricing-period">/month</span>
  </div>
  <ul class="pricing-features">
    <li>Feature 1</li>
    <li>Feature 2</li>
  </ul>
  <button class="pricing-cta">Get Started</button>
</div>
```

**CSS:**
```css
.pricing-card {
  background: rgba(255, 255, 255, 0.03);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 32px;
  padding: 48px 32px;
  position: relative;
}

.pricing-card.featured {
  border-color: rgba(167, 139, 113, 0.4);
  box-shadow: 0 0 100px rgba(167, 139, 113, 0.2);
}

.pricing-badge {
  position: absolute;
  top: -12px;
  left: 50%;
  transform: translateX(-50%);
  background: #a78b71;
  color: #0a0a0a;
  padding: 6px 16px;
  border-radius: 9999px;
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.pricing-value {
  font-size: 48px;
  font-weight: 700;
  color: white;
}

.pricing-currency,
.pricing-period {
  font-size: 20px;
  color: rgba(255, 255, 255, 0.6);
}
```

**Toggle Switch (Monthly/Annual):**
```css
.pricing-toggle {
  display: inline-flex;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 9999px;
  padding: 4px;
  gap: 4px;
}

.pricing-toggle-option {
  padding: 8px 24px;
  border-radius: 9999px;
  font-size: 14px;
  font-weight: 600;
  transition: all 0.3s var(--ease-primary);
}

.pricing-toggle-option.active {
  background: white;
  color: black;
}
```

---

### 8. Team Member Cards

**Layout:** 2-column grid

**Structure:**
```html
<div class="team-card">
  <div class="team-image-wrapper">
    <img src="..." alt="..." class="team-image" />
  </div>
  <div class="team-info">
    <h3 class="team-name">John Doe</h3>
    <p class="team-role">Creative Director</p>
  </div>
</div>
```

**CSS:**
```css
.team-card {
  background: rgba(255, 255, 255, 0.03);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 24px;
  overflow: hidden;
  transition: all 0.3s var(--ease-primary);
}

.team-image-wrapper {
  aspect-ratio: 4 / 5;
  overflow: hidden;
}

.team-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  filter: grayscale(100%);
  transition: filter 0.7s var(--ease-primary),
              transform 0.5s var(--ease-primary);
}

.team-card:hover .team-image {
  filter: grayscale(0%);
  transform: scale(1.05);
}

.team-info {
  padding: 24px;
}

.team-name {
  font-family: 'Playfair Display', serif;
  font-size: 32px;
  font-weight: 700;
  font-style: italic;
  color: white;
  margin-bottom: 8px;
}

.team-role {
  font-family: 'Inter', sans-serif;
  font-size: 10px;
  font-weight: 100;
  color: #a78b71;
  text-transform: uppercase;
  letter-spacing: 0.15em;
}
```

---

### 9. Footer

**Layout:** 5-column grid (desktop), stacked (mobile)

**Structure:**
```html
<footer class="footer">
  <div class="footer-column footer-brand">
    <div class="footer-logo">Brand</div>
    <div class="footer-social">
      <a href="#" class="social-icon">...</a>
    </div>
  </div>
  
  <div class="footer-column">
    <h4 class="footer-heading">Product</h4>
    <ul class="footer-links">
      <li><a href="#">Link</a></li>
    </ul>
  </div>
  
  <!-- Repeat columns -->
  
  <div class="footer-column footer-newsletter">
    <h4 class="footer-heading">Join Digest</h4>
    <div class="newsletter-form">
      <input type="email" placeholder="Enter email" />
      <button class="newsletter-submit">→</button>
    </div>
  </div>
</footer>
```

**CSS:**
```css
.footer {
  background: #0a0a0a;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  padding: 96px 48px 48px;
}

.footer-logo {
  font-family: 'Playfair Display', serif;
  font-size: 28px;
  font-weight: 700;
  font-style: italic;
  margin-bottom: 24px;
}

.social-icon {
  width: 40px;
  height: 40px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 50%;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s var(--ease-primary);
}

.social-icon:hover {
  border-color: #a78b71;
  background: rgba(167, 139, 113, 0.1);
}

.newsletter-form {
  display: flex;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 9999px;
  padding: 4px 4px 4px 20px;
}

.newsletter-form input {
  flex: 1;
  background: transparent;
  border: none;
  color: white;
  font-size: 14px;
}

.newsletter-submit {
  width: 36px;
  height: 36px;
  background: white;
  color: black;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
}
```

---

### 10. Button System

**Primary Button (Solid):**
```css
.btn-primary {
  background: white;
  color: black;
  padding: 14px 32px;
  border-radius: 12px;
  font-family: 'Inter', sans-serif;
  font-size: 16px;
  font-weight: 600;
  border: none;
  transition: all 0.3s var(--ease-primary);
}

.btn-primary:hover {
  background: #e8d5b7;
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(255, 255, 255, 0.2);
}
```

**Secondary Button (Outlined):**
```css
.btn-secondary {
  background: transparent;
  color: white;
  padding: 14px 32px;
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  font-family: 'Inter', sans-serif;
  font-size: 16px;
  font-weight: 600;
  transition: all 0.3s var(--ease-primary);
}

.btn-secondary:hover {
  border-color: #a78b71;
  background: rgba(167, 139, 113, 0.1);
}
```

**Ghost Button:**
```css
.btn-ghost {
  background: transparent;
  color: rgba(255, 255, 255, 0.6);
  padding: 12px 24px;
  border: none;
  font-family: 'Inter', sans-serif;
  font-size: 14px;
  font-weight: 600;
  transition: color 0.3s var(--ease-primary);
}

.btn-ghost:hover {
  color: #a78b71;
}
```

---

### 11. Input Fields

**Text Input:**
```css
.input-field {
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  padding: 14px 20px;
  color: white;
  font-family: 'Inter', sans-serif;
  font-size: 16px;
  transition: all 0.3s var(--ease-primary);
}

.input-field:focus {
  outline: none;
  border-color: #a78b71;
  background: rgba(255, 255, 255, 0.05);
  box-shadow: 0 0 0 3px rgba(167, 139, 113, 0.1);
}

.input-field::placeholder {
  color: rgba(255, 255, 255, 0.3);
}
```

**Search Input:**
```css
.search-input {
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 9999px;
  padding: 12px 20px 12px 48px;
  color: white;
  font-family: 'Inter', sans-serif;
  font-size: 14px;
  background-image: url('search-icon.svg');
  background-repeat: no-repeat;
  background-position: 16px center;
}
```

---

### 12. Badge & Tag System

**Badge:**
```css
.badge {
  display: inline-flex;
  align-items: center;
  padding: 4px 12px;
  background: rgba(167, 139, 113, 0.15);
  border: 1px solid rgba(167, 139, 113, 0.3);
  border-radius: 9999px;
  font-size: 11px;
  font-weight: 600;
  color: #c9b8a0;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}
```

**Tag (Minimal):**
```css
.tag {
  display: inline-block;
  padding: 2px 8px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 4px;
  font-size: 10px;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.6);
  text-transform: uppercase;
  letter-spacing: 0.08em;
}
```

---

## Layout System

### Grid System

**Container:**
```css
.container {
  width: 100%;
  max-width: 1280px;
  margin: 0 auto;
  padding: 0 48px;
}

@media (max-width: 768px) {
  .container {
    padding: 0 16px;
  }
}
```

**Grid Utilities:**
```css
.grid-2 {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 24px;
}

.grid-3 {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 24px;
}

.grid-4 {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 24px;
}

/* Responsive */
@media (max-width: 1024px) {
  .grid-4 { grid-template-columns: repeat(2, 1fr); }
}

@media (max-width: 640px) {
  .grid-2,
  .grid-3,
  .grid-4 {
    grid-template-columns: 1fr;
  }
}
```

---

### Section Spacing

```css
.section {
  padding: 96px 0;
}

.section-sm {
  padding: 64px 0;
}

.section-lg {
  padding: 128px 0;
}

@media (max-width: 768px) {
  .section { padding: 64px 0; }
  .section-sm { padding: 48px 0; }
  .section-lg { padding: 96px 0; }
}
```

---

### Responsive Breakpoints

```css
/* Mobile First Approach */

/* Small devices (landscape phones) */
@media (min-width: 640px) { /* sm */ }

/* Medium devices (tablets) */
@media (min-width: 768px) { /* md */ }

/* Large devices (desktops) */
@media (min-width: 1024px) { /* lg */ }

/* Extra large devices (large desktops) */
@media (min-width: 1280px) { /* xl */ }

/* 2XL devices */
@media (min-width: 1536px) { /* 2xl */ }
```

---

## Implementation Guidelines

### Critical Rules

#### MUST DO:
1. **Maintain high contrast** between #0a0a0a background and white/gold elements
2. **Apply backdrop-filter: blur(10px)** to all overlapping glassmorphic layers
3. **Use heavy letter-spacing** (0.1em - 0.15em) on small uppercase text (labels, roles, navigation)
4. **Default images to grayscale** with color transition on hover (0.7s duration)
5. **Use the gold/bronze spectrum exclusively** for accents and highlights
6. **Ensure all interactive elements have clear hover states**

#### MUST NOT DO:
1. **Never use standard blue/purple gradients** common in tech designs
2. **Avoid mixing color palettes** - stick strictly to gold/bronze spectrum
3. **Don't create cluttered overlays** - always use blur to separate layers visually
4. **Never use pure white backgrounds** except for primary CTAs
5. **Avoid thin borders** - minimum 1px, use rgba values for glass effect

### Accessibility Considerations

```css
/* Focus states for keyboard navigation */
*:focus-visible {
  outline: 2px solid #a78b71;
  outline-offset: 2px;
}

/* Reduced motion */
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

### Performance Optimization

```css
/* GPU acceleration for animations */
.accelerated {
  transform: translateZ(0);
  will-change: transform;
}

/* Optimize backdrop-filter */
.glass-card {
  -webkit-backdrop-filter: blur(10px);
  backdrop-filter: blur(10px);
  isolation: isolate;
}
```

### Browser Support

```css
/* Fallback for browsers without backdrop-filter support */
@supports not (backdrop-filter: blur(10px)) {
  .glass-card {
    background: rgba(255, 255, 255, 0.08);
  }
}
```

---

## Color Usage Matrix

| Element | Background | Text | Border | Accent |
|---------|-----------|------|--------|--------|
| **Page** | #0a0a0a + dots | white | - | - |
| **Glass Card** | rgba(255,255,255,0.03) | white | rgba(255,255,255,0.1) | #a78b71 |
| **Primary Button** | white | black | - | - |
| **Secondary Button** | transparent | white | rgba(255,255,255,0.2) | #a78b71 |
| **Input Field** | rgba(255,255,255,0.03) | white | rgba(255,255,255,0.1) | #a78b71 (focus) |
| **Badge** | rgba(167,139,113,0.15) | #c9b8a0 | rgba(167,139,113,0.3) | - |
| **Feature Icon** | rgba(167,139,113,0.1) | #a78b71 | - | - |
| **Live Indicator** | #4ade80 | #4ade80 | - | - |

---

## Quick Reference: Common Patterns

### Hero Section Pattern
```
1. Full-height container with centered content
2. Radial dot background overlay
3. Central glass card (16:9) with primary CTA
4. 4-6 satellite cards positioned absolutely
5. SVG paths connecting satellites to center
6. All elements animated on entrance
```

### Content Section Pattern
```
1. Container max-width 1280px
2. Section padding: 96px vertical
3. Section heading: Playfair Display Italic, 3.5rem
4. Grid of glass cards below
5. Cards with icon, title, description
6. Hover effects on all interactive elements
```

### Footer Pattern
```
1. Full-width dark background
2. Top border: rgba(255,255,255,0.1)
3. 5-column grid (responsive)
4. Left: Brand + social icons
5. Middle: Link columns
6. Right: Newsletter signup
7. Bottom: Copyright + legal links
```

---

## Version History

- **v1.0** - Initial design system documentation
- Created: February 2026

---

## Additional Resources

- Font Import: Google Fonts (Playfair Display, Inter)
- Icons: Custom SVG or Lucide Icons recommended
- Images: High-quality, professional photography (grayscale default)

---

**End of Documentation**
