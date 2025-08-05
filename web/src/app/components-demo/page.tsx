'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Progress } from '@/components/ui/progress';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { Mail, Lock, User, Search, Calendar as CalendarIcon, Trophy, Users, Settings, Plus, Edit, Trash, MoreHorizontal, CircleDot } from 'lucide-react';

export default function ComponentsDemoPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [search, setSearch] = useState('');
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [progress, setProgress] = useState(65);
  const [checked, setChecked] = useState(false);
  const { toast } = useToast();

  const players = [
    { id: 1, name: 'Lionel Messi', position: 'Forward', team: 'Inter Miami', goals: 15, assists: 8, sport: 'soccer' },
    { id: 2, name: 'Cristiano Ronaldo', position: 'Forward', team: 'Al Nassr', goals: 12, assists: 6, sport: 'soccer' },
    { id: 3, name: 'LeBron James', position: 'Forward', team: 'Lakers', points: 28, rebounds: 8, sport: 'basketball' },
    { id: 4, name: 'Stephen Curry', position: 'Guard', team: 'Warriors', points: 25, assists: 6, sport: 'basketball' },
  ];

  const handleToast = () => {
    toast({
      title: "Success!",
      description: "This is a toast notification example.",
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            KP5 Academy - shadcn/ui Component Library
          </h1>
          <p className="text-xl text-gray-600">
            A comprehensive showcase of our enhanced shadcn/ui components for sports management
          </p>
        </div>

        {/* Buttons Section */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="h-5 w-5" />
              Buttons
            </CardTitle>
            <CardDescription>Various button styles and variants</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap gap-4">
              <Button>Default Button</Button>
              <Button variant="secondary">Secondary</Button>
              <Button variant="outline">Outline</Button>
              <Button variant="ghost">Ghost</Button>
              <Button variant="destructive">Destructive</Button>
              <Button variant="success">Success</Button>
              <Button variant="warning">Warning</Button>
              <Button variant="gradient">Gradient</Button>
              <Button variant="sports">Sports</Button>
            </div>
            <div className="flex flex-wrap gap-4">
              <Button size="sm">Small</Button>
              <Button size="md">Medium</Button>
              <Button size="lg">Large</Button>
              <Button size="xl">Extra Large</Button>
            </div>
            <div className="flex flex-wrap gap-4">
              <Button leftIcon={<Mail />}>With Left Icon</Button>
              <Button rightIcon={<Settings />}>With Right Icon</Button>
              <Button loading>Loading</Button>
            </div>
          </CardContent>
        </Card>

        {/* Cards Section */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Cards
            </CardTitle>
            <CardDescription>Card components with different variants</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card variant="default">
                <CardHeader>
                  <CardTitle>Default Card</CardTitle>
                  <CardDescription>Standard card variant</CardDescription>
                </CardHeader>
                <CardContent>
                  <p>This is a default card with standard styling.</p>
                </CardContent>
                <CardFooter>
                  <Button size="sm">Action</Button>
                </CardFooter>
              </Card>

              <Card variant="elevated">
                <CardHeader>
                  <CardTitle>Elevated Card</CardTitle>
                  <CardDescription>Card with enhanced shadow</CardDescription>
                </CardHeader>
                <CardContent>
                  <p>This card has an elevated appearance.</p>
                </CardContent>
                <CardFooter>
                  <Button size="sm" variant="outline">Action</Button>
                </CardFooter>
              </Card>

              <Card variant="sports">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CircleDot className="h-4 w-4" />
                    Sports Card
                  </CardTitle>
                  <CardDescription>Sports-themed card variant</CardDescription>
                </CardHeader>
                <CardContent>
                  <p>This card has sports-themed styling.</p>
                </CardContent>
                <CardFooter>
                  <Button size="sm" variant="sports">View Stats</Button>
                </CardFooter>
              </Card>
            </div>
          </CardContent>
        </Card>

        {/* Form Elements Section */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Form Elements
            </CardTitle>
            <CardDescription>Input fields and form components</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Email Address"
                type="email"
                placeholder="Enter your email"
                leftIcon={<Mail />}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <Input
                label="Password"
                type="password"
                placeholder="Enter your password"
                leftIcon={<Lock />}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Search Players"
                placeholder="Search by name or team"
                leftIcon={<Search />}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <div className="space-y-2">
                <label className="text-sm font-medium">Select Sport</label>
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
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Match Date</label>
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={setDate}
                  className="rounded-md border"
                />
              </div>
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Progress: {progress}%</label>
                  <Progress value={progress} className="w-full" />
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={checked}
                    onCheckedChange={setChecked}
                  />
                  <label className="text-sm font-medium">Enable notifications</label>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Badges Section */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Badges</CardTitle>
            <CardDescription>Status indicators and labels</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-4">
              <Badge>Default</Badge>
              <Badge variant="secondary">Secondary</Badge>
              <Badge variant="destructive">Destructive</Badge>
              <Badge variant="outline">Outline</Badge>
              <Badge variant="success">Success</Badge>
              <Badge variant="warning">Warning</Badge>
              <Badge variant="info">Info</Badge>
            </div>
            <div className="mt-4">
              <h4 className="text-sm font-medium mb-2">Sports Badges</h4>
              <div className="flex flex-wrap gap-4">
                <Badge sport="soccer">Soccer</Badge>
                <Badge sport="basketball">Basketball</Badge>
                <Badge sport="football">Football</Badge>
                <Badge sport="baseball">Baseball</Badge>
                <Badge sport="volleyball">Volleyball</Badge>
                <Badge sport="tennis">Tennis</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Table Section */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Player Statistics Table</CardTitle>
            <CardDescription>Data table with player information</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Player</TableHead>
                  <TableHead>Position</TableHead>
                  <TableHead>Team</TableHead>
                  <TableHead>Sport</TableHead>
                  <TableHead>Stats</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {players.map((player) => (
                  <TableRow key={player.id}>
                    <TableCell className="font-medium">{player.name}</TableCell>
                    <TableCell>{player.position}</TableCell>
                    <TableCell>{player.team}</TableCell>
                    <TableCell>
                      <Badge sport={player.sport as any}>
                        {player.sport}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {player.sport === 'soccer' 
                        ? `${player.goals}G ${player.assists}A`
                        : `${player.points}P ${player.rebounds || player.assists}R`
                      }
                    </TableCell>
                    <TableCell>
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
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Interactive Components Section */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Interactive Components</CardTitle>
            <CardDescription>Dialogs, sheets, and other interactive elements</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap gap-4">
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
                  <div className="space-y-4">
                    <div className="flex items-center space-x-4">
                      <Avatar>
                        <AvatarImage src="/placeholder-avatar.jpg" />
                        <AvatarFallback>JD</AvatarFallback>
                      </Avatar>
                      <div>
                        <h4 className="font-medium">John Doe</h4>
                        <p className="text-sm text-muted-foreground">Forward • Team Alpha</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm font-medium">Goals</p>
                        <p className="text-2xl font-bold">15</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium">Assists</p>
                        <p className="text-2xl font-bold">8</p>
                      </div>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>

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
                  <div className="space-y-4 mt-6">
                    <Button className="w-full" leftIcon={<Plus />}>
                      Add New Player
                    </Button>
                    <Button variant="outline" className="w-full" leftIcon={<CalendarIcon />}>
                      Schedule Match
                    </Button>
                    <Button variant="outline" className="w-full" leftIcon={<Trophy />}>
                      View Tournament
                    </Button>
                  </div>
                </SheetContent>
              </Sheet>

              <Button onClick={handleToast}>Show Toast</Button>
            </div>
          </CardContent>
        </Card>

        {/* Tabs Section */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Tabs</CardTitle>
            <CardDescription>Organized content with tabs</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="overview" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="stats">Stats</TabsTrigger>
                <TabsTrigger value="matches">Matches</TabsTrigger>
                <TabsTrigger value="settings">Settings</TabsTrigger>
              </TabsList>
              <TabsContent value="overview" className="space-y-4">
                <div className="grid grid-cols-3 gap-4">
                  <Card>
                    <CardContent className="p-4">
                      <div className="text-2xl font-bold">24</div>
                      <p className="text-xs text-muted-foreground">Total Players</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4">
                      <div className="text-2xl font-bold">8</div>
                      <p className="text-xs text-muted-foreground">Active Teams</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4">
                      <div className="text-2xl font-bold">156</div>
                      <p className="text-xs text-muted-foreground">Matches Played</p>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
              <TabsContent value="stats" className="space-y-4">
                <p>Detailed statistics and analytics will be displayed here.</p>
              </TabsContent>
              <TabsContent value="matches" className="space-y-4">
                <p>Recent and upcoming matches will be listed here.</p>
              </TabsContent>
              <TabsContent value="settings" className="space-y-4">
                <p>Configuration and settings options will be available here.</p>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Accordion Section */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Accordion</CardTitle>
            <CardDescription>Collapsible content sections</CardDescription>
          </CardHeader>
          <CardContent>
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="item-1">
                <AccordionTrigger>Team Information</AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-2">
                    <p><strong>Founded:</strong> 2020</p>
                    <p><strong>Home Stadium:</strong> Central Arena</p>
                    <p><strong>Head Coach:</strong> Mike Johnson</p>
                    <p><strong>League:</strong> Premier Division</p>
                  </div>
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-2">
                <AccordionTrigger>Recent Performance</AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-2">
                    <p><strong>Last 5 Matches:</strong> W-W-L-W-D</p>
                    <p><strong>Goals Scored:</strong> 12</p>
                    <p><strong>Goals Conceded:</strong> 6</p>
                    <p><strong>Current Position:</strong> 3rd</p>
                  </div>
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-3">
                <AccordionTrigger>Upcoming Matches</AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-2">
                    <p><strong>vs Team Alpha:</strong> March 15, 2024</p>
                    <p><strong>vs Team Beta:</strong> March 22, 2024</p>
                    <p><strong>vs Team Gamma:</strong> March 29, 2024</p>
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 