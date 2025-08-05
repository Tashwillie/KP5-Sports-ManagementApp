'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { 
  AlertDialog, 
  AlertDialogAction, 
  AlertDialogCancel, 
  AlertDialogContent, 
  AlertDialogDescription, 
  AlertDialogFooter, 
  AlertDialogHeader, 
  AlertDialogTitle, 
  AlertDialogTrigger 
} from '@/components/ui/alert-dialog';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Users, 
  Trophy, 
  Calendar, 
  Settings, 
  MoreHorizontal,
  Building2,
  MapPin,
  Phone,
  Mail,
  Globe,
  Facebook,
  Twitter,
  Instagram,
  Youtube
} from 'lucide-react';
import { toast } from 'sonner';

import { 
  useLocalClubs, 
  useLocalTeams,
  useLocalEvents,
  useLocalMatches
} from '@/hooks/useLocalApi';
import { Club, Team, Event, Match } from '@/types';

interface ClubDashboardProps {
  userId?: string;
}

export const ClubDashboard: React.FC<ClubDashboardProps> = ({ userId }) => {
  const [selectedClub, setSelectedClub] = useState<Club | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingClub, setEditingClub] = useState<Club | null>(null);

  // API hooks
  const { data: clubs, isLoading: clubsLoading, error: clubsError } = useLocalClubs(
    userId ? [{ field: 'createdBy', operator: '==', value: userId }] : []
  );
  
  const { data: teams } = useLocalTeams(
    selectedClub ? [{ field: 'clubId', operator: '==', value: selectedClub.id }] : []
  );

  const { data: events } = useLocalEvents(
    selectedClub ? [{ field: 'teamIds', operator: 'array-contains-any', value: teams?.map(t => t.id) || [] }] : []
  );

  const { data: matches } = useLocalMatches(
    selectedClub ? [{ field: 'clubId', operator: '==', value: selectedClub.id }] : []
  );

  // Mock mutations for now
  const createClubMutation = { mutateAsync: async (data: any) => console.log('Create club:', data), isPending: false };
  const updateClubMutation = { mutateAsync: async (data: any) => console.log('Update club:', data), isPending: false };

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    address: {
      street: '',
      city: '',
      state: '',
      zipCode: '',
      country: ''
    },
    contact: {
      email: '',
      phone: '',
      website: ''
    },
    socialMedia: {
      facebook: '',
      twitter: '',
      instagram: '',
      youtube: ''
    },
    settings: {
      isPublic: true,
      allowRegistration: true,
      requireApproval: false,
      maxTeams: 10,
      maxPlayersPerTeam: 25
    }
  });

  // Handle form submission
  const handleCreateClub = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      await createClubMutation.mutateAsync({
        ...formData,
        createdBy: userId!,
        isActive: true,
        stats: {
          totalTeams: 0,
          totalPlayers: 0,
          totalCoaches: 0,
          totalMatches: 0
        }
      });
      
      toast.success('Club created successfully!');
      setIsCreateDialogOpen(false);
      setFormData({
        name: '',
        description: '',
        address: { street: '', city: '', state: '', zipCode: '', country: '' },
        contact: { email: '', phone: '', website: '' },
        socialMedia: { facebook: '', twitter: '', instagram: '', youtube: '' },
        settings: {
          isPublic: true,
          allowRegistration: true,
          requireApproval: false,
          maxTeams: 10,
          maxPlayersPerTeam: 25
        }
      });
    } catch (error) {
      toast.error('Failed to create club');
      console.error('Create club error:', error);
    }
  };

  const handleUpdateClub = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!editingClub) return;
    
    try {
      await updateClubMutation.mutateAsync({
        clubId: editingClub.id,
        clubData: formData
      });
      
      toast.success('Club updated successfully!');
      setIsEditDialogOpen(false);
      setEditingClub(null);
    } catch (error) {
      toast.error('Failed to update club');
      console.error('Update club error:', error);
    }
  };

  const handleEditClub = (club: Club) => {
    setEditingClub(club);
    setFormData({
      name: club.name,
      description: club.description,
      address: club.address,
      contact: club.contact,
      socialMedia: club.socialMedia,
      settings: club.settings
    });
    setIsEditDialogOpen(true);
  };

  // Calculate stats
  const totalTeams = teams?.length || 0;
  const totalPlayers = teams?.reduce((acc, team) => acc + team.roster.players.length, 0) || 0;
  const totalCoaches = teams?.reduce((acc, team) => acc + team.roster.coaches.length, 0) || 0;
  const totalMatches = matches?.length || 0;
  const upcomingEvents = events?.filter(event => new Date(event.startDate) > new Date()).length || 0;

  if (clubsLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading clubs...</p>
        </div>
      </div>
    );
  }

  if (clubsError) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <p className="text-red-600 mb-4">Error loading clubs</p>
          <Button onClick={() => window.location.reload()}>Retry</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Club Dashboard</h1>
          <p className="text-muted-foreground">
            Manage your sports clubs, teams, and activities
          </p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Create Club
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create New Club</DialogTitle>
              <DialogDescription>
                Set up a new sports club with all the necessary information.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreateClub} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Club Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.contact.email}
                    onChange={(e) => setFormData({
                      ...formData,
                      contact: { ...formData.contact, email: e.target.value }
                    })}
                    required
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    value={formData.contact.phone}
                    onChange={(e) => setFormData({
                      ...formData,
                      contact: { ...formData.contact, phone: e.target.value }
                    })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="website">Website</Label>
                  <Input
                    id="website"
                    value={formData.contact.website}
                    onChange={(e) => setFormData({
                      ...formData,
                      contact: { ...formData.contact, website: e.target.value }
                    })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Address</Label>
                <div className="grid grid-cols-2 gap-2">
                  <Input
                    placeholder="Street"
                    value={formData.address.street}
                    onChange={(e) => setFormData({
                      ...formData,
                      address: { ...formData.address, street: e.target.value }
                    })}
                  />
                  <Input
                    placeholder="City"
                    value={formData.address.city}
                    onChange={(e) => setFormData({
                      ...formData,
                      address: { ...formData.address, city: e.target.value }
                    })}
                  />
                  <Input
                    placeholder="State"
                    value={formData.address.state}
                    onChange={(e) => setFormData({
                      ...formData,
                      address: { ...formData.address, state: e.target.value }
                    })}
                  />
                  <Input
                    placeholder="ZIP Code"
                    value={formData.address.zipCode}
                    onChange={(e) => setFormData({
                      ...formData,
                      address: { ...formData.address, zipCode: e.target.value }
                    })}
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsCreateDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={createClubMutation.isPending}>
                  {createClubMutation.isPending ? 'Creating...' : 'Create Club'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Clubs</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{clubs?.length || 0}</div>
            <p className="text-xs text-muted-foreground">
              Active clubs in your account
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Teams</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalTeams}</div>
            <p className="text-xs text-muted-foreground">
              Across all clubs
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Players</CardTitle>
            <Trophy className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalPlayers}</div>
            <p className="text-xs text-muted-foreground">
              Registered players
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Upcoming Events</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{upcomingEvents}</div>
            <p className="text-xs text-muted-foreground">
              Scheduled events
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Clubs List */}
      <Card>
        <CardHeader>
          <CardTitle>Your Clubs</CardTitle>
          <CardDescription>
            Manage your sports clubs and their settings
          </CardDescription>
        </CardHeader>
        <CardContent>
          {clubs && clubs.length > 0 ? (
            <div className="space-y-4">
              {clubs.map((club) => (
                <div
                  key={club.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
                  onClick={() => setSelectedClub(club)}
                >
                  <div className="flex items-center space-x-4">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={club.logoURL} alt={club.name} />
                      <AvatarFallback>
                        {club.name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="font-semibold">{club.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        {club.address.city}, {club.address.state}
                      </p>
                      <div className="flex items-center space-x-2 mt-1">
                        <Badge variant={club.isActive ? "default" : "secondary"}>
                          {club.isActive ? "Active" : "Inactive"}
                        </Badge>
                        <Badge variant="outline">
                          {club.stats.totalTeams} teams
                        </Badge>
                      </div>
                    </div>
                  </div>
                  
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleEditClub(club)}>
                        <Edit className="mr-2 h-4 w-4" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Settings className="mr-2 h-4 w-4" />
                        Settings
                      </DropdownMenuItem>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Club</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete "{club.name}"? This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction className="bg-red-600 hover:bg-red-700">
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Building2 className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No clubs yet</h3>
              <p className="text-muted-foreground mb-4">
                Create your first sports club to get started
              </p>
              <Button onClick={() => setIsCreateDialogOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Create Club
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Club Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Club</DialogTitle>
            <DialogDescription>
              Update your club information and settings.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleUpdateClub} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-name">Club Name</Label>
                <Input
                  id="edit-name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-email">Email</Label>
                <Input
                  id="edit-email"
                  type="email"
                  value={formData.contact.email}
                  onChange={(e) => setFormData({
                    ...formData,
                    contact: { ...formData.contact, email: e.target.value }
                  })}
                  required
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="edit-description">Description</Label>
              <Textarea
                id="edit-description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-phone">Phone</Label>
                <Input
                  id="edit-phone"
                  value={formData.contact.phone}
                  onChange={(e) => setFormData({
                    ...formData,
                    contact: { ...formData.contact, phone: e.target.value }
                  })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-website">Website</Label>
                <Input
                  id="edit-website"
                  value={formData.contact.website}
                  onChange={(e) => setFormData({
                    ...formData,
                    contact: { ...formData.contact, website: e.target.value }
                  })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Address</Label>
              <div className="grid grid-cols-2 gap-2">
                <Input
                  placeholder="Street"
                  value={formData.address.street}
                  onChange={(e) => setFormData({
                    ...formData,
                    address: { ...formData.address, street: e.target.value }
                  })}
                />
                <Input
                  placeholder="City"
                  value={formData.address.city}
                  onChange={(e) => setFormData({
                    ...formData,
                    address: { ...formData.address, city: e.target.value }
                  })}
                />
                <Input
                  placeholder="State"
                  value={formData.address.state}
                  onChange={(e) => setFormData({
                    ...formData,
                    address: { ...formData.address, state: e.target.value }
                  })}
                />
                <Input
                  placeholder="ZIP Code"
                  value={formData.address.zipCode}
                  onChange={(e) => setFormData({
                    ...formData,
                    address: { ...formData.address, zipCode: e.target.value }
                  })}
                />
              </div>
            </div>

            <div className="flex justify-end space-x-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsEditDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={updateClubMutation.isPending}>
                {updateClubMutation.isPending ? 'Updating...' : 'Update Club'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ClubDashboard; 