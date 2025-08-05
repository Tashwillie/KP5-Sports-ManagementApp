import React from 'react';
import Image from 'next/image';

export function Logo() {
  return (
    <div className="flex items-center space-x-3">
      {/* Logo Image */}
      <Image 
        src="/images/logo.png" 
        alt="KP5 SUCCESS Logo" 
        width={180} 
        height={180}
        className="object-contain"
        priority
      />
    </div>
  );
} 