'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Club } from '../../../../shared/src/types';

interface ClubCardProps {
  club: Club;
  showActions?: boolean;
  onEdit?: (club: Club) => void;
  onDelete?: (clubId: string) => void;
}

export function ClubCard({ club, showActions = false, onEdit, onDelete }: ClubCardProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (!onDelete) return;
    
    if (confirm('Are you sure you want to delete this club? This action cannot be undone.')) {
      setIsDeleting(true);
      try {
        await onDelete(club.id);
      } catch (error) {
        console.error('Error deleting club:', error);
      } finally {
        setIsDeleting(false);
      }
    }
  };

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow duration-200">
      {/* Club Banner */}
      <div className="relative h-48 bg-gradient-to-r from-blue-500 to-purple-600">
        {club.bannerURL ? (
          <Image
            src={club.bannerURL}
            alt={`${club.name} banner`}
            fill
            className="object-cover"
          />
        ) : (
          <div className="flex items-center justify-center h-full">
            <h3 className="text-white text-2xl font-bold">{club.name}</h3>
          </div>
        )}
        
        {/* Club Logo */}
        <div className="absolute bottom-0 left-4 transform translate-y-1/2">
          <div className="w-16 h-16 bg-white rounded-full shadow-lg flex items-center justify-center">
            {club.logoURL ? (
              <Image
                src={club.logoURL}
                alt={`${club.name} logo`}
                width={48}
                height={48}
                className="rounded-full object-cover"
              />
            ) : (
              <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                <span className="text-gray-500 text-lg font-bold">
                  {club.name.charAt(0).toUpperCase()}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Status Badge */}
        <div className="absolute top-4 right-4">
          <Badge variant={club.isActive ? 'default' : 'secondary'}>
            {club.isActive ? 'Active' : 'Inactive'}
          </Badge>
        </div>
      </div>

      {/* Club Content */}
      <div className="p-6 pt-12">
        <div className="mb-4">
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            {club.name}
          </h3>
          <p className="text-gray-600 text-sm line-clamp-2">
            {club.description || 'No description available'}
          </p>
        </div>

        {/* Club Stats */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">
              {club.stats.totalTeams}
            </div>
            <div className="text-xs text-gray-500">Teams</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {club.stats.totalPlayers}
            </div>
            <div className="text-xs text-gray-500">Players</div>
          </div>
        </div>

        {/* Club Location */}
        {club.address && (
          <div className="mb-4">
            <div className="flex items-center text-sm text-gray-500">
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              {club.address.city}, {club.address.state}
            </div>
          </div>
        )}

        {/* Club Settings */}
        <div className="flex flex-wrap gap-2 mb-4">
          {club.settings.isPublic && (
            <Badge variant="outline" className="text-xs">
              Public
            </Badge>
          )}
          {club.settings.allowRegistration && (
            <Badge variant="outline" className="text-xs">
              Open Registration
            </Badge>
          )}
          {club.settings.requireApproval && (
            <Badge variant="outline" className="text-xs">
              Approval Required
            </Badge>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <Link href={`/club/${club.id}`} className="flex-1">
            <Button variant="outline" className="w-full">
              View Details
            </Button>
          </Link>
          
          {showActions && (
            <>
              {onEdit && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onEdit(club)}
                >
                  Edit
                </Button>
              )}
              {onDelete && (
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={handleDelete}
                  disabled={isDeleting}
                >
                  {isDeleting ? 'Deleting...' : 'Delete'}
                </Button>
              )}
            </>
          )}
        </div>
      </div>
    </Card>
  );
} 