import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Badge } from '@/components/ui/badge';
import { useTheme } from '../contexts/ThemeContext';
import ProfileForm from './ProfileForm';
import { Sun, Moon, LogOut, User, Settings, Bell, Palette } from 'lucide-react';
import { toast } from 'sonner'; 
import backend from '~backend/client';
import type { UpdateProfileRequest } from '~backend/auth/profile';

export default function Header() {
  const navigate = useNavigate();
  const { theme, setTheme } = useTheme();
  const queryClient = useQueryClient();
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const { data: profile } = useQuery({
    queryKey: ['user-profile'],
    queryFn: () => backend.auth.getProfile(),
  });

  const updateProfileMutation = useMutation({
    mutationFn: (data: UpdateProfileRequest) => backend.auth.updateProfile(data),
    onSuccess: (updatedProfile) => {
      queryClient.setQueryData(['user-profile'], updatedProfile);
      localStorage.setItem('userProfile', JSON.stringify(updatedProfile));
      setIsProfileOpen(false);
      toast('Profile updated', {
        description: 'Your profile has been updated successfully.',
      });
    },
    onError: (error) => {
      console.error('Failed to update profile:', error);
      toast('Error', {
        description: 'Failed to update profile. Please try again.',
      });
    },
  });

  const handleLogout = () => {
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('userProfile');
    localStorage.removeItem('authToken');
    navigate('/login');
  };

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  return (
    <>
      <header className="h-16 border-b border-border bg-card px-6 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
            Welcome back, <span className="text-primary">{profile?.firstName || 'User'}</span>
            <Badge variant="outline" className="ml-2 bg-primary/10 text-primary text-xs font-normal">
              {profile?.role || 'Employee'}
            </Badge>
          </h2>
        </div>

        <div className="flex items-center space-x-3">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline" size="icon" className="relative h-9 w-9 border-none">
                  <Bell className="h-4 w-4 text-muted-foreground" />
                  <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-primary text-[10px] font-medium text-primary-foreground flex items-center justify-center">3</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom">
                <p>Notifications</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon" className="h-9 w-9 border-none">
                <Palette className="h-4 w-4 text-muted-foreground" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-40" align="end">
              <DropdownMenuItem onClick={() => setTheme('light')}>Light</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTheme('dark')}>Dark</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTheme('rose')}>Rose</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTheme('blue')}>Blue</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTheme('green')}>Green</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTheme('orange')}>Orange</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTheme('red')}>Red</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTheme('violet')}>Violet</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTheme('yellow')}>Yellow</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="relative h-9 rounded-full border-none bg-muted/50 px-2 pl-1">
                <Avatar className="h-7 w-7 mr-2">
                  <AvatarImage src={profile?.avatar} />
                  <AvatarFallback className="bg-primary/10 text-primary">
                    {profile ? getInitials(profile.firstName, profile.lastName) : 'U'}
                  </AvatarFallback>
                </Avatar>
                <span className="text-sm font-medium text-foreground hidden sm:inline-block">
                  {profile?.firstName || 'User'}
                </span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end">
              <div className="flex items-center justify-start gap-2 p-2 border-b border-border pb-3">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={profile?.avatar} />
                  <AvatarFallback className="bg-primary/10 text-primary">
                    {profile ? getInitials(profile.firstName, profile.lastName) : 'U'}
                  </AvatarFallback>
                </Avatar>
                <div className="flex flex-col space-y-0.5 leading-none">
                  <p className="font-medium text-foreground">{profile?.firstName} {profile?.lastName}</p>
                  <p className="w-[200px] truncate text-xs text-muted-foreground">
                    {profile?.email}
                  </p>
                </div>
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => setIsProfileOpen(true)} className="py-2 cursor-pointer">
                <div className="flex items-center gap-3">
                  <div className="bg-primary/10 p-1.5 rounded-md">
                    <User className="h-4 w-4 text-primary" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-medium">Profile</span>
                    <span className="text-xs text-muted-foreground">Manage your account</span>
                  </div>
                </div>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate('/settings')} className="py-2 cursor-pointer">
                <div className="flex items-center gap-3">
                  <div className="bg-primary/10 p-1.5 rounded-md">
                    <Settings className="h-4 w-4 text-primary" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-medium">Settings</span>
                    <span className="text-xs text-muted-foreground">Customize your preferences</span>
                  </div>
                </div>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout} className="py-2 cursor-pointer text-destructive focus:text-destructive">
                <div className="flex items-center gap-3">
                  <div className="bg-destructive/10 p-1.5 rounded-md">
                    <LogOut className="h-4 w-4 text-destructive" />
                  </div>
                  <span className="text-sm font-medium">Log out</span>
                </div>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      <ProfileForm
        open={isProfileOpen}
        onOpenChange={setIsProfileOpen}
        onSubmit={(data) => updateProfileMutation.mutate(data)}
        profile={profile}
        isLoading={updateProfileMutation.isPending}
      />
    </>
  );
}


// import  { useState } from 'react';
// import { useNavigate } from 'react-router-dom';
// import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
// import { Button } from '@/components/ui/button';
// import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
// import { 
//   DropdownMenu,
//   DropdownMenuContent,
//   DropdownMenuItem,
//   DropdownMenuSeparator,
//   DropdownMenuTrigger,
// } from '@/components/ui/dropdown-menu';
// import { useTheme } from '../contexts/ThemeContext';
// import { Toaster } from '@/components/ui/sonner';
// import ProfileForm from './ProfileForm';
// import { Sun, Moon, LogOut, User, Settings } from 'lucide-react';
// import backend from '~backend/client';
// import type { UpdateProfileRequest } from '~backend/auth/profile';

// export default function Header() {
//   const navigate = useNavigate();
//   const { theme, toggleTheme } = useTheme();
//   const { toast } = useToast();
//   const queryClient = useQueryClient();
//   const [isProfileOpen, setIsProfileOpen] = useState(false);

//   const { data: profile } = useQuery({
//     queryKey: ['user-profile'],
//     queryFn: () => backend.auth.getProfile(),
//   });

//   const updateProfileMutation = useMutation({
//     mutationFn: (data: UpdateProfileRequest) => backend.auth.updateProfile(data),
//     onSuccess: (updatedProfile) => {
//       queryClient.setQueryData(['user-profile'], updatedProfile);
//       localStorage.setItem('userProfile', JSON.stringify(updatedProfile));
//       setIsProfileOpen(false);
//       toast({
//         title: "Profile updated",
//         description: "Your profile has been updated successfully.",
//       });
//     },
//     onError: (error) => {
//       console.error('Failed to update profile:', error);
//       toast({
//         title: "Error",
//         description: "Failed to update profile. Please try again.",
//         variant: "destructive",
//       });
//     },
//   });

//   const handleLogout = () => {
//     localStorage.removeItem('isAuthenticated');
//     localStorage.removeItem('userProfile');
//     localStorage.removeItem('authToken');
//     navigate('/login');
//   };

//   const getInitials = (firstName: string, lastName: string) => {
//     return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
//   };

//   return (
//     <>
//       <header className="h-16 border-b border-border bg-card px-6 flex items-center justify-between">
//         <div className="flex items-center space-x-4">
//           <h2 className="text-lg font-semibold text-foreground">
//             Welcome back, {profile?.firstName || 'User'}
//           </h2>
//         </div>
        
//         <div className="flex items-center space-x-4">
//           <Button
//             variant="ghost"
//             size="icon"
//             onClick={toggleTheme}
//             className="h-9 w-9"
//           >
//             {theme === 'light' ? (
//               <Moon className="h-4 w-4" />
//             ) : (
//               <Sun className="h-4 w-4" />
//             )}
//           </Button>
          
//           <DropdownMenu>
//             <DropdownMenuTrigger asChild>
//               <Button variant="ghost" className="relative h-9 w-9 rounded-full">
//                 <Avatar className="h-9 w-9">
//                   <AvatarImage src={profile?.avatar} />
//                   <AvatarFallback>
//                     {profile ? getInitials(profile.firstName, profile.lastName) : 'U'}
//                   </AvatarFallback>
//                 </Avatar>
//               </Button>
//             </DropdownMenuTrigger>
//             <DropdownMenuContent className="w-56" align="end">
//               <div className="flex items-center justify-start gap-2 p-2">
//                 <div className="flex flex-col space-y-1 leading-none">
//                   <p className="font-medium">{profile?.firstName} {profile?.lastName}</p>
//                   <p className="w-[200px] truncate text-sm text-muted-foreground">
//                     {profile?.email}
//                   </p>
//                 </div>
//               </div>
//               <DropdownMenuSeparator />
//               <DropdownMenuItem onClick={() => setIsProfileOpen(true)}>
//                 <User className="mr-2 h-4 w-4" />
//                 <span>Profile</span>
//               </DropdownMenuItem>
//               <DropdownMenuItem onClick={() => navigate('/settings')}>
//                 <Settings className="mr-2 h-4 w-4" />
//                 <span>Settings</span>
//               </DropdownMenuItem>
//               <DropdownMenuSeparator />
//               <DropdownMenuItem onClick={handleLogout}>
//                 <LogOut className="mr-2 h-4 w-4" />
//                 <span>Log out</span>
//               </DropdownMenuItem>
//             </DropdownMenuContent>
//           </DropdownMenu>
//         </div>
//       </header>

//       <ProfileForm
//         open={isProfileOpen}
//         onOpenChange={setIsProfileOpen}
//         onSubmit={(data) => updateProfileMutation.mutate(data)}
//         profile={profile}
//         isLoading={updateProfileMutation.isPending}
//       />
//     </>
//   );
// }
