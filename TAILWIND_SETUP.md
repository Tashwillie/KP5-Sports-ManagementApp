# Tailwind CSS Setup for KP5 Academy

This document outlines the comprehensive Tailwind CSS implementation across the KP5 Academy sports management platform, covering both web and mobile applications.

## Overview

The KP5 Academy platform uses Tailwind CSS as the primary styling solution across:
- **Web Application**: Next.js with Tailwind CSS v3
- **Mobile Application**: React Native with NativeWind (Tailwind for React Native)

## Web Application Setup

### Configuration Files

#### `web/tailwind.config.js`
Comprehensive Tailwind configuration with:
- Custom color palette (primary, secondary, success, warning, error, sports)
- Custom typography scale
- Custom spacing and border radius
- Custom animations and keyframes
- Custom shadows and effects
- Plugin integrations (@tailwindcss/forms, @tailwindcss/typography, @tailwindcss/aspect-ratio)

#### `web/src/app/globals.css`
Global styles with:
- Tailwind directives (@tailwind base, components, utilities)
- CSS custom properties for theming
- Dark mode support
- Custom component classes
- Utility classes for common patterns

### Key Features

#### Color System
```css
/* Primary Colors */
primary: {
  50: '#eff6ff',   /* Lightest */
  100: '#dbeafe',
  200: '#bfdbfe',
  300: '#93c5fd',
  400: '#60a5fa',
  500: '#3b82f6',  /* Base */
  600: '#2563eb',
  700: '#1d4ed8',
  800: '#1e40af',
  900: '#1e3a8a',
  950: '#172554',  /* Darkest */
}

/* Sports Colors */
sports: {
  soccer: '#22c55e',
  basketball: '#f59e0b',
  baseball: '#3b82f6',
  football: '#8b5cf6',
  volleyball: '#ec4899',
  tennis: '#10b981',
  swimming: '#06b6d4',
  track: '#f97316',
}
```

#### Typography
- Font families: Inter (sans), Poppins (display)
- Responsive text sizes
- Custom line heights
- Font weight utilities

#### Animations
- fade-in, slide-up, slide-down, scale-in
- bounce-soft for subtle interactions
- Custom keyframes for smooth transitions

### UI Components

#### Button Component
```tsx
<Button 
  variant="primary" 
  size="md" 
  loading={false}
  leftIcon={<Mail />}
>
  Click Me
</Button>
```

Variants: `default`, `secondary`, `outline`, `ghost`, `destructive`, `success`, `warning`, `gradient`
Sizes: `sm`, `md`, `lg`, `xl`

#### Card Component
```tsx
<Card variant="elevated">
  <CardHeader>
    <CardTitle>Title</CardTitle>
    <CardDescription>Description</CardDescription>
  </CardHeader>
  <CardContent>Content</CardContent>
  <CardFooter>Footer</CardFooter>
</Card>
```

Variants: `default`, `elevated`, `outlined`, `glass`

#### Input Component
```tsx
<Input
  label="Email"
  type="email"
  placeholder="Enter email"
  leftIcon={<Mail />}
  error="Invalid email"
  helper="We'll never share your email"
/>
```

#### Badge Component
```tsx
<Badge variant="success" size="md">
  Active
</Badge>

<Badge variant="sports" sport="soccer">
  Soccer
</Badge>
```

## Mobile Application Setup

### Configuration Files

#### `mobile/tailwind.config.js`
Mobile-specific Tailwind configuration with:
- React Native compatible color values
- Numeric font sizes (no rem/em units)
- Mobile-optimized spacing
- Platform-specific adjustments

#### `mobile/src/utils/tailwind.ts`
Custom utility function that converts Tailwind classes to React Native styles:
```tsx
import { tw } from '../utils/tailwind';

const styles = tw('flex-1 bg-white p-4');
```

#### `mobile/src/styles/global.css`
Global styles for mobile with:
- Tailwind directives
- Mobile-specific component classes
- Platform-agnostic utilities

### Mobile UI Components

#### Button Component
```tsx
<Button
  title="Press Me"
  onPress={() => {}}
  variant="primary"
  size="md"
  loading={false}
/>
```

#### Card Component
```tsx
<Card title="Card Title" subtitle="Card Subtitle">
  <Text>Card content</Text>
</Card>
```

#### Input Component
```tsx
<Input
  value={text}
  onChangeText={setText}
  placeholder="Enter text"
  label="Input Label"
  error="Error message"
/>
```

#### Badge Component
```tsx
<Badge variant="success" size="md">
  Success
</Badge>
```

## Design System

### Color Palette
The design system includes a comprehensive color palette:

1. **Primary Colors**: Blue-based primary colors for main actions
2. **Secondary Colors**: Gray-based secondary colors for supporting elements
3. **Semantic Colors**: Success (green), Warning (yellow), Error (red)
4. **Sports Colors**: Unique colors for different sports categories

### Typography Scale
```css
text-xs: 0.75rem (12px)
text-sm: 0.875rem (14px)
text-base: 1rem (16px)
text-lg: 1.125rem (18px)
text-xl: 1.25rem (20px)
text-2xl: 1.5rem (24px)
text-3xl: 1.875rem (30px)
text-4xl: 2.25rem (36px)
text-5xl: 3rem (48px)
text-6xl: 3.75rem (60px)
```

### Spacing System
Based on 4px grid system:
```css
space-1: 0.25rem (4px)
space-2: 0.5rem (8px)
space-3: 0.75rem (12px)
space-4: 1rem (16px)
space-5: 1.25rem (20px)
space-6: 1.5rem (24px)
space-8: 2rem (32px)
space-10: 2.5rem (40px)
space-12: 3rem (48px)
space-16: 4rem (64px)
```

### Component Patterns

#### Status Indicators
- Badges for status, categories, and labels
- Color-coded for quick recognition
- Consistent sizing and spacing

#### Interactive Elements
- Buttons with multiple variants and states
- Form inputs with validation states
- Cards with different elevation levels

#### Layout Components
- Responsive grid systems
- Flexible containers
- Consistent spacing patterns

## Usage Guidelines

### Web Development
1. Use the provided UI components for consistency
2. Leverage Tailwind utility classes for custom styling
3. Follow the design system color palette
4. Use responsive design patterns
5. Implement dark mode support where applicable

### Mobile Development
1. Use the `tw()` utility function for styling
2. Import components from `src/components/ui/`
3. Follow mobile-specific design patterns
4. Test on different screen sizes
5. Ensure accessibility compliance

### Best Practices
1. **Consistency**: Use the design system consistently across platforms
2. **Accessibility**: Ensure proper contrast ratios and focus states
3. **Performance**: Optimize CSS bundle size
4. **Maintainability**: Use semantic class names and component composition
5. **Responsiveness**: Design for all screen sizes

## Development Workflow

### Adding New Components
1. Create component in appropriate `ui/` directory
2. Use Tailwind classes for styling
3. Add TypeScript interfaces
4. Include proper accessibility attributes
5. Test across platforms

### Modifying Design System
1. Update `tailwind.config.js` files
2. Modify global CSS files
3. Update component libraries
4. Test across all platforms
5. Update documentation

### Theme Customization
1. Modify color values in config files
2. Update CSS custom properties
3. Test dark mode compatibility
4. Verify contrast ratios
5. Update component variants

## File Structure

```
kp5-Academy/
├── web/
│   ├── tailwind.config.js
│   ├── src/
│   │   ├── app/globals.css
│   │   └── components/ui/
│   │       ├── Button.tsx
│   │       ├── Card.tsx
│   │       ├── Input.tsx
│   │       └── Badge.tsx
│   └── package.json
├── mobile/
│   ├── tailwind.config.js
│   ├── src/
│   │   ├── styles/global.css
│   │   ├── utils/tailwind.ts
│   │   └── components/ui/
│   │       ├── Button.tsx
│   │       ├── Card.tsx
│   │       ├── Input.tsx
│   │       └── Badge.tsx
│   └── package.json
└── TAILWIND_SETUP.md
```

## Dependencies

### Web Dependencies
```json
{
  "tailwindcss": "^3.3.0",
  "@tailwindcss/forms": "^0.5.0",
  "@tailwindcss/typography": "^0.5.0",
  "@tailwindcss/aspect-ratio": "^0.4.0",
  "autoprefixer": "^10.4.0",
  "postcss": "^8.4.0"
}
```

### Mobile Dependencies
```json
{
  "nativewind": "^2.0.0",
  "tailwindcss": "^3.3.0"
}
```

## Getting Started

1. **Web Development**:
   ```bash
   cd web
   npm run dev
   ```

2. **Mobile Development**:
   ```bash
   cd mobile
   npm start
   ```

3. **View Component Library**:
   Navigate to `/components-demo` in the web application

## Support

For questions or issues related to the Tailwind CSS setup:
1. Check the component documentation
2. Review the design system guidelines
3. Test with the provided examples
4. Consult the Tailwind CSS documentation

This setup provides a robust, scalable, and maintainable styling solution for the KP5 Academy sports management platform. 