import React from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Camera, Loader2, Building2, Phone, Briefcase } from 'lucide-react';
import type { UpdateProfileRequest, UserProfile } from '../../../backend/auth/profile';


interface ProfileFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: UpdateProfileRequest) => void;
  profile?: UserProfile;
  isLoading?: boolean;
}

export default function ProfileForm({ 
  open, 
  onOpenChange, 
  onSubmit, 
  profile,
  isLoading 
}: ProfileFormProps) {
  const { register, handleSubmit, reset, formState: { errors } } = useForm<UpdateProfileRequest>({
    defaultValues: profile ? {
      firstName: profile.firstName,
      lastName: profile.lastName,
      phone: profile.phone || '',
      department: profile.department || '',
      position: profile.position || '',
      avatar: profile.avatar || ''
    } : undefined
  });

  React.useEffect(() => {
    if (profile) {
      reset({
        firstName: profile.firstName,
        lastName: profile.lastName,
        phone: profile.phone || '',
        department: profile.department || '',
        position: profile.position || '',
        avatar: profile.avatar || ''
      });
    }
  }, [profile, reset]);

  const handleFormSubmit = (data: UpdateProfileRequest) => {
    onSubmit(data);
  };

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-xl">Edit Profile</DialogTitle>
          <DialogDescription>
            Update your personal information and preferences
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6 py-2">
          <div className="flex flex-col sm:flex-row items-center gap-6 pb-2">
            <div className="relative">
              <Avatar className="h-24 w-24 border-4 border-background shadow-md">
                <AvatarImage src={profile?.avatar} />
                <AvatarFallback className="text-xl bg-primary/10 text-primary">
                  {profile ? getInitials(profile.firstName, profile.lastName) : 'U'}
                </AvatarFallback>
              </Avatar>
              <Button
                type="button"
                size="icon"
                variant="secondary"
                className="absolute -bottom-2 -right-2 h-8 w-8 rounded-full shadow-md"
              >
                <Camera className="h-4 w-4" />
              </Button>
            </div>
            <div className="text-center sm:text-left">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                {profile?.firstName} {profile?.lastName}
                <Badge variant="outline" className="ml-1 bg-primary/10 text-primary text-xs font-normal">
                  {profile?.role || 'Employee'}
                </Badge>
              </h3>
              <p className="text-sm text-muted-foreground">{profile?.email}</p>
              <div className="flex items-center justify-center sm:justify-start gap-2 mt-2">
                <Badge variant="outline" className="text-xs">
                  ID: {profile?.id || 'N/A'}
                </Badge>
                <Badge variant="outline" className="text-xs">
                  Joined: {profile?.createdAt ? new Date(profile.createdAt).toLocaleDateString() : 'N/A'}
                </Badge>
              </div>
            </div>
          </div>
          
          <Separator />

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName" className="text-sm font-medium">First Name</Label>
              <div className="relative">
                <Input
                  id="firstName"
                  {...register('firstName', { required: 'First name is required' })}
                  placeholder="John"
                  className="pl-9"
                />
                <div className="absolute left-3 top-2.5 text-muted-foreground">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/>
                    <circle cx="12" cy="7" r="4"/>
                  </svg>
                </div>
              </div>
              {errors.firstName && (
                <p className="text-xs text-destructive">{errors.firstName.message}</p>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="lastName" className="text-sm font-medium">Last Name</Label>
              <div className="relative">
                <Input
                  id="lastName"
                  {...register('lastName', { required: 'Last name is required' })}
                  placeholder="Doe"
                  className="pl-9"
                />
                <div className="absolute left-3 top-2.5 text-muted-foreground">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/>
                    <circle cx="12" cy="7" r="4"/>
                  </svg>
                </div>
              </div>
              {errors.lastName && (
                <p className="text-xs text-destructive">{errors.lastName.message}</p>
              )}
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="phone" className="text-sm font-medium">Phone Number</Label>
            <div className="relative">
              <Input
                id="phone"
                {...register('phone')}
                placeholder="+1 234 567 8900"
                className="pl-9"
              />
              <div className="absolute left-3 top-2.5 text-muted-foreground">
                <Phone className="h-4 w-4" />
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="department" className="text-sm font-medium">Department</Label>
              <div className="relative">
                <Input
                  id="department"
                  {...register('department')}
                  placeholder="Engineering"
                  className="pl-9"
                />
                <div className="absolute left-3 top-2.5 text-muted-foreground">
                  <Building2 className="h-4 w-4" />
                </div>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="position" className="text-sm font-medium">Position</Label>
              <div className="relative">
                <Input
                  id="position"
                  {...register('position')}
                  placeholder="Software Developer"
                  className="pl-9"
                />
                <div className="absolute left-3 top-2.5 text-muted-foreground">
                  <Briefcase className="h-4 w-4" />
                </div>
              </div>
            </div>
          </div>
          
          <DialogFooter className="pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                'Save Changes'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
