# shadcn/ui Components Setup for KP5 Academy

This document outlines the comprehensive shadcn/ui implementation for the KP5 Academy sports management platform.

## Overview

The KP5 Academy platform now uses **shadcn/ui** as the primary component library, providing:
- **Professional UI Components** - Built on Radix UI primitives
- **Custom Sports Variants** - Enhanced components for sports management
- **Consistent Design System** - Unified styling across the application
- **Accessibility First** - WCAG compliant components
- **TypeScript Support** - Full type safety

## Installed Components

### Core Components

#### 1. **Button** (`@/components/ui/Button.tsx`)
Enhanced button component with custom sports variants.

```tsx
import { Button } from '@/components/ui/Button';

// Basic usage
<Button>Default Button</Button>
<Button variant="secondary">Secondary</Button>
<Button variant="outline">Outline</Button>

// Sports variants
<Button variant="sports">Sports</Button>
<Button variant="gradient">Gradient</Button>
<Button variant="success">Success</Button>
<Button variant="warning">Warning</Button>

// Sizes
<Button size="sm">Small</Button>
<Button size="md">Medium</Button>
<Button size="lg">Large</Button>
<Button size="xl">Extra Large</Button>

// With icons and loading state
<Button leftIcon={<Mail />}>With Left Icon</Button>
<Button rightIcon={<Settings />}>With Right Icon</Button>
<Button loading>Loading</Button>
```

#### 2. **Card** (`@/components/ui/Card.tsx`)
Flexible card component with multiple variants.

```tsx
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/Card';

<Card variant="default">
  <CardHeader>
    <CardTitle>Card Title</CardTitle>
    <CardDescription>Card description</CardDescription>
  </CardHeader>
  <CardContent>
    <p>Card content goes here</p>
  </CardContent>
  <CardFooter>
    <Button>Action</Button>
  </CardFooter>
</Card>

// Variants
<Card variant="elevated">Enhanced shadow</Card>
<Card variant="outlined">Transparent background</Card>
<Card variant="glass">Glass morphism effect</Card>
<Card variant="sports">Sports-themed styling</Card>
```

#### 3. **Input** (`@/components/ui/Input.tsx`)
Enhanced input component with icons and validation states.

```tsx
import { Input } from '@/components/ui/Input';

<Input
  label="Email Address"
  type="email"
  placeholder="Enter your email"
  leftIcon={<Mail />}
  error="Invalid email format"
  helper="We'll never share your email"
/>
```

#### 4. **Badge** (`@/components/ui/Badge.tsx`)
Status indicators with sports-specific variants.

```tsx
import { Badge } from '@/components/ui/Badge';

// Standard variants
<Badge>Default</Badge>
<Badge variant="secondary">Secondary</Badge>
<Badge variant="destructive">Destructive</Badge>
<Badge variant="success">Success</Badge>
<Badge variant="warning">Warning</Badge>

// Sports badges
<Badge sport="soccer">Soccer</Badge>
<Badge sport="basketball">Basketball</Badge>
<Badge sport="football">Football</Badge>
<Badge sport="baseball">Baseball</Badge>
<Badge sport="volleyball">Volleyball</Badge>
<Badge sport="tennis">Tennis</Badge>
<Badge sport="swimming">Swimming</Badge>
<Badge sport="track">Track</Badge>
```

### Data Display Components

#### 5. **Table** (`@/components/ui/table.tsx`)
Data table for displaying structured information.

```tsx
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

<Table>
  <TableHeader>
    <TableRow>
      <TableHead>Player</TableHead>
      <TableHead>Position</TableHead>
      <TableHead>Team</TableHead>
      <TableHead>Actions</TableHead>
    </TableRow>
  </TableHeader>
  <TableBody>
    <TableRow>
      <TableCell className="font-medium">John Doe</TableCell>
      <TableCell>Forward</TableCell>
      <TableCell>Team Alpha</TableCell>
      <TableCell>
        <Button size="sm" variant="outline">Edit</Button>
      </TableCell>
    </TableRow>
  </TableBody>
</Table>
```

#### 6. **Avatar** (`@/components/ui/avatar.tsx`)
User profile pictures and initials.

```tsx
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

<Avatar>
  <AvatarImage src="/user-avatar.jpg" alt="User" />
  <AvatarFallback>JD</AvatarFallback>
</Avatar>
```

### Interactive Components

#### 7. **Dialog** (`@/components/ui/dialog.tsx`)
Modal dialogs for important actions and information.

```tsx
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

<Dialog>
  <DialogTrigger asChild>
    <Button>Open Dialog</Button>
  </DialogTrigger>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Player Details</DialogTitle>
      <DialogDescription>
        View detailed information about the selected player.
      </DialogDescription>
    </DialogHeader>
    <div>Dialog content goes here</div>
  </DialogContent>
</Dialog>
```

#### 8. **Sheet** (`@/components/ui/sheet.tsx`)
Slide-out panels for additional content.

```tsx
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';

<Sheet>
  <SheetTrigger asChild>
    <Button variant="outline">Open Sheet</Button>
  </SheetTrigger>
  <SheetContent>
    <SheetHeader>
      <SheetTitle>Quick Actions</SheetTitle>
      <SheetDescription>
        Perform quick actions from this side panel.
      </SheetDescription>
    </SheetHeader>
    <div>Sheet content goes here</div>
  </SheetContent>
</Sheet>
```

#### 9. **Dropdown Menu** (`@/components/ui/dropdown-menu.tsx`)
Context menus and action dropdowns.

```tsx
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

<DropdownMenu>
  <DropdownMenuTrigger asChild>
    <Button variant="ghost" size="sm">
      <MoreHorizontal className="h-4 w-4" />
    </Button>
  </DropdownMenuTrigger>
  <DropdownMenuContent align="end">
    <DropdownMenuLabel>Actions</DropdownMenuLabel>
    <DropdownMenuSeparator />
    <DropdownMenuItem>
      <Edit className="mr-2 h-4 w-4" />
      Edit
    </DropdownMenuItem>
    <DropdownMenuItem>
      <Trash className="mr-2 h-4 w-4" />
      Delete
    </DropdownMenuItem>
  </DropdownMenuContent>
</DropdownMenu>
```

### Form Components

#### 10. **Select** (`@/components/ui/select.tsx`)
Dropdown select component.

```tsx
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

<Select>
  <SelectTrigger>
    <SelectValue placeholder="Choose a sport" />
  </SelectTrigger>
  <SelectContent>
    <SelectItem value="soccer">Soccer</SelectItem>
    <SelectItem value="basketball">Basketball</SelectItem>
    <SelectItem value="football">Football</SelectItem>
    <SelectItem value="baseball">Baseball</SelectItem>
  </SelectContent>
</Select>
```

#### 11. **Calendar** (`@/components/ui/calendar.tsx`)
Date picker component.

```tsx
import { Calendar } from '@/components/ui/calendar';

<Calendar
  mode="single"
  selected={date}
  onSelect={setDate}
  className="rounded-md border"
/>
```

#### 12. **Switch** (`@/components/ui/switch.tsx`)
Toggle switch component.

```tsx
import { Switch } from '@/components/ui/switch';

<Switch
  checked={checked}
  onCheckedChange={setChecked}
/>
```

#### 13. **Progress** (`@/components/ui/progress.tsx`)
Progress indicator.

```tsx
import { Progress } from '@/components/ui/progress';

<Progress value={progress} className="w-full" />
```

### Layout Components

#### 14. **Tabs** (`@/components/ui/tabs.tsx`)
Tabbed content organization.

```tsx
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

<Tabs defaultValue="overview" className="w-full">
  <TabsList className="grid w-full grid-cols-3">
    <TabsTrigger value="overview">Overview</TabsTrigger>
    <TabsTrigger value="stats">Stats</TabsTrigger>
    <TabsTrigger value="matches">Matches</TabsTrigger>
  </TabsList>
  <TabsContent value="overview">
    Overview content
  </TabsContent>
  <TabsContent value="stats">
    Statistics content
  </TabsContent>
  <TabsContent value="matches">
    Matches content
  </TabsContent>
</Tabs>
```

#### 15. **Accordion** (`@/components/ui/accordion.tsx`)
Collapsible content sections.

```tsx
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

<Accordion type="single" collapsible className="w-full">
  <AccordionItem value="item-1">
    <AccordionTrigger>Team Information</AccordionTrigger>
    <AccordionContent>
      Team details and information
    </AccordionContent>
  </AccordionItem>
  <AccordionItem value="item-2">
    <AccordionTrigger>Recent Performance</AccordionTrigger>
    <AccordionContent>
      Performance statistics
    </AccordionContent>
  </AccordionItem>
</Accordion>
```

### Feedback Components

#### 16. **Toast** (`@/components/ui/toast.tsx`)
Notification system.

```tsx
import { useToast } from '@/hooks/use-toast';

const { toast } = useToast();

toast({
  title: "Success!",
  description: "This is a toast notification example.",
});
```

## Custom Sports Color Palette

The design system includes a comprehensive sports color palette:

```css
/* Sports Colors */
sports: {
  soccer: '#22c55e',      /* Green */
  basketball: '#f59e0b',  /* Orange */
  baseball: '#3b82f6',    /* Blue */
  football: '#8b5cf6',    /* Purple */
  volleyball: '#ec4899',  /* Pink */
  tennis: '#10b981',      /* Emerald */
  swimming: '#06b6d4',    /* Cyan */
  track: '#f97316',       /* Orange */
}
```

## Usage Examples

### Player Management Dashboard

```tsx
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';

<Card>
  <CardHeader>
    <CardTitle>Player Roster</CardTitle>
  </CardHeader>
  <CardContent>
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Position</TableHead>
          <TableHead>Sport</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        <TableRow>
          <TableCell>John Doe</TableCell>
          <TableCell>Forward</TableCell>
          <TableCell>
            <Badge sport="soccer">Soccer</Badge>
          </TableCell>
          <TableCell>
            <Badge variant="success">Active</Badge>
          </TableCell>
          <TableCell>
            <Button size="sm" variant="outline">Edit</Button>
          </TableCell>
        </TableRow>
      </TableBody>
    </Table>
  </CardContent>
</Card>
```

### Match Statistics Card

```tsx
<Card variant="sports">
  <CardHeader>
    <CardTitle className="flex items-center gap-2">
      <CircleDot className="h-4 w-4" />
      Match Statistics
    </CardTitle>
  </CardHeader>
  <CardContent>
    <div className="grid grid-cols-2 gap-4">
      <div>
        <p className="text-sm font-medium">Goals</p>
        <p className="text-2xl font-bold">3</p>
      </div>
      <div>
        <p className="text-sm font-medium">Assists</p>
        <p className="text-2xl font-bold">2</p>
      </div>
    </div>
  </CardContent>
  <CardFooter>
    <Button variant="sports" className="w-full">View Full Stats</Button>
  </CardFooter>
</Card>
```

## Best Practices

### 1. **Component Composition**
Use component composition to build complex UIs:

```tsx
// Good: Composed components
<Card>
  <CardHeader>
    <CardTitle>Title</CardTitle>
  </CardHeader>
  <CardContent>
    <Table>...</Table>
  </CardContent>
</Card>

// Avoid: Custom styling overrides
<div className="custom-card-styles">
  <table className="custom-table">...</table>
</div>
```

### 2. **Consistent Spacing**
Use the design system's spacing scale:

```tsx
// Good: Consistent spacing
<div className="space-y-4">
  <Card>...</Card>
  <Card>...</Card>
</div>

// Avoid: Arbitrary spacing
<div className="space-y-6">
  <Card className="mb-8">...</Card>
  <Card className="mt-4">...</Card>
</div>
```

### 3. **Accessibility**
All components are built with accessibility in mind:

```tsx
// Good: Proper labeling
<Input
  label="Email Address"
  aria-describedby="email-help"
  id="email"
/>

// Good: Keyboard navigation
<Button onKeyDown={handleKeyDown}>
  Action
</Button>
```

### 4. **Responsive Design**
Components are responsive by default:

```tsx
// Good: Responsive grid
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  <Card>...</Card>
  <Card>...</Card>
  <Card>...</Card>
</div>
```

## File Structure

```
web/src/components/ui/
├── Button.tsx          # Enhanced button with sports variants
├── Card.tsx           # Card component with variants
├── Input.tsx          # Input field with icons and validation
├── Badge.tsx          # Status badges with sports colors
├── table.tsx          # Data table component
├── dialog.tsx         # Modal dialog
├── sheet.tsx          # Slide-out panel
├── select.tsx         # Dropdown select
├── calendar.tsx       # Date picker
├── tabs.tsx           # Tabbed content
├── accordion.tsx      # Collapsible sections
├── avatar.tsx         # User avatars
├── dropdown-menu.tsx  # Context menus
├── progress.tsx       # Progress indicators
├── switch.tsx         # Toggle switches
├── toast.tsx          # Toast notifications
├── toaster.tsx        # Toast container
└── form.tsx           # Form components
```

## Dependencies

The shadcn/ui setup requires these dependencies:

```json
{
  "@radix-ui/react-accordion": "^1.1.0",
  "@radix-ui/react-alert-dialog": "^1.0.0",
  "@radix-ui/react-avatar": "^1.0.0",
  "@radix-ui/react-checkbox": "^1.0.0",
  "@radix-ui/react-dialog": "^1.0.0",
  "@radix-ui/react-dropdown-menu": "^2.0.0",
  "@radix-ui/react-label": "^2.0.0",
  "@radix-ui/react-popover": "^1.0.0",
  "@radix-ui/react-progress": "^1.0.0",
  "@radix-ui/react-select": "^2.0.0",
  "@radix-ui/react-separator": "^1.0.0",
  "@radix-ui/react-switch": "^1.0.0",
  "@radix-ui/react-tabs": "^1.0.0",
  "@radix-ui/react-toast": "^1.1.0",
  "@radix-ui/react-tooltip": "^1.0.0",
  "class-variance-authority": "^0.7.0",
  "clsx": "^2.0.0",
  "date-fns": "^2.30.0",
  "lucide-react": "^0.294.0",
  "tailwind-merge": "^2.0.0"
}
```

## Configuration

### Tailwind CSS Configuration

The `tailwind.config.js` includes:

```javascript
module.exports = {
  darkMode: ['class'],
  content: [
    './src/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // shadcn/ui colors
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: 'hsl(var(--primary))',
        // ... other shadcn/ui colors
        
        // Custom sports colors
        sports: {
          soccer: '#22c55e',
          basketball: '#f59e0b',
          // ... other sports colors
        }
      }
    }
  },
  plugins: [require("tailwindcss-animate")]
}
```

### CSS Variables

The `globals.css` includes CSS custom properties for theming:

```css
@layer base {
  :root {
    --background: 0 0% 100%;
    --foreground: 0 0% 3.9%;
    --primary: 0 0% 9%;
    --primary-foreground: 0 0% 98%;
    /* ... other variables */
  }
  
  .dark {
    --background: 0 0% 3.9%;
    --foreground: 0 0% 98%;
    /* ... dark mode variables */
  }
}
```

## Next Steps

1. **Component Showcase**: Visit `/components-demo` to see all components in action
2. **Integration**: Start using these components in your existing pages
3. **Customization**: Extend components with additional sports-specific variants
4. **Documentation**: Add component-specific documentation as needed

## Support

For questions or issues with the shadcn/ui components:

1. Check the [shadcn/ui documentation](https://ui.shadcn.com/)
2. Review the component showcase at `/components-demo`
3. Refer to this documentation for sports-specific usage
4. Check the component source code for implementation details 