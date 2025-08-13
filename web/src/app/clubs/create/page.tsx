'use client';

import React from 'react';
import { ClubForm } from '@/components/club/ClubForm';

export default function CreateClubPage() {
  return (
    <div className="container-fluid">
      <ClubForm mode="create" />
    </div>
  );
}
