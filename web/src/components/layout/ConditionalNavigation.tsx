'use client';

import { usePathname } from 'next/navigation';
import Navigation from './Navigation';

export function ConditionalNavigation() {
  const pathname = usePathname();
  
  // Don't show Navigation on the homepage
  if (pathname === '/') {
    return null;
  }
  
  return <Navigation />;
} 