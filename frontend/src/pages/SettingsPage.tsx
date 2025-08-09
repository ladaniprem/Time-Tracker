import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner'; // Correct import for Sonner
import { Settings, Clock, Globe, Bell, Shield } from 'lucide-react';
import backend from '~backend/client';
import type { UpdateAttendanceSettingsRequest } from '~backend/settings/attendance_settings';
import type { UpdateSystemSettingsRequest } from '~backend/settings/system_settings';

export default function SettingsPage() {
  const queryClient = useQueryClient();
  
  // Form state for controlled components
  const [attendanceFormData, setAttendanceFormData] = useState<UpdateAttendanceSettingsRequest>({
    workStartTime: '09:00',
    workEndTime: '17:00',
    lateThresholdMinutes: 15,
    earlyLeaveThresholdMinutes: 15,
    workingDaysPerWeek: 5,
    weekendDays: ['Saturday', 'Sunday'],
    holidayDates: [],
    overtimeEnabled: false,
    overtimeRate: 1.5,
    breakDurationMinutes: 60,
  });

  const [systemFormData, setSystemFormData] = useState<UpdateSystemSettingsRequest>({
    companyName: 'AttendanceHub Corp',
    timezone: 'UTC',
    dateFormat: 'MM/DD/YYYY',
    timeFormat: '12h',
    currency: 'USD',
    language: 'en',
    emailNotifications: false,
    smsNotifications: false,
    whatsappNotifications: false,
    autoBackup: false,
    backupFrequency: 'daily',
    dataRetentionDays: 365,
  });

  const { data: attendanceSettings, isLoading: attendanceLoading } = useQuery({
    queryKey: ['attendance-settings'],
    queryFn: () => backend.settings.getAttendanceSettings(),
  });

  const { data: systemSettings, isLoading: systemLoading } = useQuery({
    queryKey: ['system-settings'],
    queryFn: () => backend.settings.getSystemSettings(),
  });

  // Update form data when settings are loaded
  useEffect(() => {
    if (attendanceSettings) {
      setAttendanceFormData({
        workStartTime: attendanceSettings.workStartTime,
        workEndTime: attendanceSettings.workEndTime,
        lateThresholdMinutes: attendanceSettings.lateThresholdMinutes,
        earlyLeaveThresholdMinutes: attendanceSettings.earlyLeaveThresholdMinutes,
        workingDaysPerWeek: attendanceSettings.workingDaysPerWeek,
        weekendDays: attendanceSettings.weekendDays,
        holidayDates: attendanceSettings.holidayDates,
        overtimeEnabled: attendanceSettings.overtimeEnabled,
        overtimeRate: attendanceSettings.overtimeRate,
        breakDurationMinutes: attendanceSettings.breakDurationMinutes,
      });
    }
  }, [attendanceSettings]);

  useEffect(() => {
    if (systemSettings) {
      setSystemFormData({
        companyName: systemSettings.companyName,
        timezone: systemSettings.timezone,
        dateFormat: systemSettings.dateFormat,
        timeFormat: systemSettings.timeFormat,
        currency: systemSettings.currency,
        language: systemSettings.language,
        emailNotifications: systemSettings.emailNotifications,
        smsNotifications: systemSettings.smsNotifications,
        whatsappNotifications: systemSettings.whatsappNotifications,
        autoBackup: systemSettings.autoBackup,
        backupFrequency: systemSettings.backupFrequency,
        dataRetentionDays: systemSettings.dataRetentionDays,
      });
    }
  }, [systemSettings]);

  const updateAttendanceMutation = useMutation({
    mutationFn: (data: UpdateAttendanceSettingsRequest) => backend.settings.updateAttendanceSettings(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['attendance-settings'] });
      // Correct usage of toast from sonner
      toast.success("Attendance settings have been saved successfully.", {
        description: "Settings updated",
      });
    },
    onError: (error) => {
      console.error('Failed to update attendance settings:', error);
      // Correct usage of toast from sonner
      toast.error("Failed to update attendance settings.", {
        description: "Error",
      });
    },
  });

  const updateSystemMutation = useMutation({
    mutationFn: (data: UpdateSystemSettingsRequest) => backend.settings.updateSystemSettings(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['system-settings'] });
      // Correct usage of toast from sonner
      toast.success("System settings have been saved successfully.", {
        description: "Settings updated",
      });
    },
    onError: (error) => {
      console.error('Failed to update system settings:', error);
      // Correct usage of toast from sonner
      toast.error("Failed to update system settings.", {
        description: "Error",
      });
    },
  });

  const handleAttendanceSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    updateAttendanceMutation.mutate(attendanceFormData);
  };

  const handleSystemSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    updateSystemMutation.mutate(systemFormData);
  };

  const updateAttendanceField = <T extends UpdateAttendanceSettingsRequest[keyof UpdateAttendanceSettingsRequest]>(
    field: keyof UpdateAttendanceSettingsRequest,
    value: T
  ) => {
    setAttendanceFormData((prev: UpdateAttendanceSettingsRequest) => ({ ...prev, [field]: value }));
  };

  const updateSystemField = <T extends UpdateSystemSettingsRequest[keyof UpdateSystemSettingsRequest]>(
    field: keyof UpdateSystemSettingsRequest,
    value: T
  ) => {
    setSystemFormData((prev: UpdateSystemSettingsRequest) => ({ ...prev, [field]: value }));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-foreground">Settings</h1>
        <div className="flex items-center space-x-2">
          <Settings className="h-5 w-5 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">System Configuration</span>
        </div>
      </div>

      <Tabs defaultValue="attendance" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="attendance" className="flex items-center space-x-2">
            <Clock className="h-4 w-4" />
            <span>Attendance</span>
          </TabsTrigger>
          <TabsTrigger value="system" className="flex items-center space-x-2">
            <Globe className="h-4 w-4" />
            <span>System</span>
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex items-center space-x-2">
            <Bell className="h-4 w-4" />
            <span>Notifications</span>
          </TabsTrigger>
          <TabsTrigger value="security" className="flex items-center space-x-2">
            <Shield className="h-4 w-4" />
            <span>Security</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="attendance">
          <Card>
            <CardHeader>
              <CardTitle>Attendance Settings</CardTitle>
            </CardHeader>
            <CardContent>
              {attendanceLoading ? (
                <div className="space-y-4">
                  {[...Array(6)].map((_, i) => (
                    <div key={i} className="h-10 bg-muted animate-pulse rounded" />
                  ))}
                </div>
              ) : (
                <form onSubmit={handleAttendanceSubmit} className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="workStartTime">Work Start Time</Label>
                      <Input
                        id="workStartTime"
                        type="time"
                        value={attendanceFormData.workStartTime}
                        onChange={(e) => updateAttendanceField('workStartTime', e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="workEndTime">Work End Time</Label>
                      <Input
                        id="workEndTime"
                        type="time"
                        value={attendanceFormData.workEndTime}
                        onChange={(e) => updateAttendanceField('workEndTime', e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="lateThresholdMinutes">Late Threshold (minutes)</Label>
                      <Input
                        id="lateThresholdMinutes"
                        type="number"
                        value={attendanceFormData.lateThresholdMinutes}
                        onChange={(e) => updateAttendanceField('lateThresholdMinutes', parseInt(e.target.value) || 0)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="earlyLeaveThresholdMinutes">Early Leave Threshold (minutes)</Label>
                      <Input
                        id="earlyLeaveThresholdMinutes"
                        type="number"
                        value={attendanceFormData.earlyLeaveThresholdMinutes}
                        onChange={(e) => updateAttendanceField('earlyLeaveThresholdMinutes', parseInt(e.target.value) || 0)}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="workingDaysPerWeek">Working Days Per Week</Label>
                      <Select 
                        value={attendanceFormData.workingDaysPerWeek?.toString() || ''}
                        onValueChange={(value) => updateAttendanceField('workingDaysPerWeek', parseInt(value))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="5">5 Days</SelectItem>
                          <SelectItem value="6">6 Days</SelectItem>
                          <SelectItem value="7">7 Days</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="breakDurationMinutes">Break Duration (minutes)</Label>
                      <Input
                        id="breakDurationMinutes"
                        type="number"
                        value={attendanceFormData.breakDurationMinutes}
                        onChange={(e) => updateAttendanceField('breakDurationMinutes', parseInt(e.target.value) || 0)}
                      />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Overtime Enabled</Label>
                        <p className="text-sm text-muted-foreground">
                          Allow overtime calculation for employees
                        </p>
                      </div>
                      <Switch 
                        checked={attendanceFormData.overtimeEnabled}
                        onCheckedChange={(checked) => updateAttendanceField('overtimeEnabled', checked)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="overtimeRate">Overtime Rate Multiplier</Label>
                      <Input
                        id="overtimeRate"
                        type="number"
                        step="0.1"
                        value={attendanceFormData.overtimeRate}
                        onChange={(e) => updateAttendanceField('overtimeRate', parseFloat(e.target.value) || 0)}
                      />
                    </div>
                  </div>

                  <Button type="submit" disabled={updateAttendanceMutation.isPending}>
                    {updateAttendanceMutation.isPending ? 'Saving...' : 'Save Attendance Settings'}
                  </Button>
                </form>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="system">
          <Card>
            <CardHeader>
              <CardTitle>System Settings</CardTitle>
            </CardHeader>
            <CardContent>
              {systemLoading ? (
                <div className="space-y-4">
                  {[...Array(8)].map((_, i) => (
                    <div key={i} className="h-10 bg-muted animate-pulse rounded" />
                  ))}
                </div>
              ) : (
                <form onSubmit={handleSystemSubmit} className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="companyName">Company Name</Label>
                    <Input
                      id="companyName"
                      value={systemFormData.companyName}
                      onChange={(e) => updateSystemField('companyName', e.target.value)}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="timezone">Timezone</Label>
                      <Select 
                        value={systemFormData.timezone}
                        onValueChange={(value) => updateSystemField('timezone', value)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="UTC">UTC</SelectItem>
                          <SelectItem value="America/New_York">Eastern Time</SelectItem>
                          <SelectItem value="America/Chicago">Central Time</SelectItem>
                          <SelectItem value="America/Denver">Mountain Time</SelectItem>
                          <SelectItem value="America/Los_Angeles">Pacific Time</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="language">Language</Label>
                      <Select 
                        value={systemFormData.language}
                        onValueChange={(value) => updateSystemField('language', value)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="en">English</SelectItem>
                          <SelectItem value="es">Spanish</SelectItem>
                          <SelectItem value="fr">French</SelectItem>
                          <SelectItem value="de">German</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="dateFormat">Date Format</Label>
                      <Select 
                        value={systemFormData.dateFormat}
                        onValueChange={(value) => updateSystemField('dateFormat', value)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="MM/DD/YYYY">MM/DD/YYYY</SelectItem>
                          <SelectItem value="DD/MM/YYYY">DD/MM/YYYY</SelectItem>
                          <SelectItem value="YYYY-MM-DD">YYYY-MM-DD</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="timeFormat">Time Format</Label>
                      <Select 
                        value={systemFormData.timeFormat}
                        onValueChange={(value) => updateSystemField('timeFormat', value)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="12h">12 Hour</SelectItem>
                          <SelectItem value="24h">24 Hour</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="currency">Currency</Label>
                      <Select 
                        value={systemFormData.currency}
                        onValueChange={(value) => updateSystemField('currency', value)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="USD">USD</SelectItem>
                          <SelectItem value="EUR">EUR</SelectItem>
                          <SelectItem value="GBP">GBP</SelectItem>
                          <SelectItem value="JPY">JPY</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <Button type="submit" disabled={updateSystemMutation.isPending}>
                    {updateSystemMutation.isPending ? 'Saving...' : 'Save System Settings'}
                  </Button>
                </form>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle>Notification Settings</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSystemSubmit} className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Email Notifications</Label>
                      <p className="text-sm text-muted-foreground">
                        Receive attendance alerts via email
                      </p>
                    </div>
                    <Switch 
                      checked={systemFormData.emailNotifications}
                      onCheckedChange={(checked) => updateSystemField('emailNotifications', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>SMS Notifications</Label>
                      <p className="text-sm text-muted-foreground">
                        Receive attendance alerts via SMS
                      </p>
                    </div>
                    <Switch 
                      checked={systemFormData.smsNotifications}
                      onCheckedChange={(checked) => updateSystemField('smsNotifications', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>WhatsApp Notifications</Label>
                      <p className="text-sm text-muted-foreground">
                        Receive attendance alerts via WhatsApp
                      </p>
                    </div>
                    <Switch 
                      checked={systemFormData.whatsappNotifications}
                      onCheckedChange={(checked) => updateSystemField('whatsappNotifications', checked)}
                    />
                  </div>
                </div>

                <Button type="submit" disabled={updateSystemMutation.isPending}>
                  {updateSystemMutation.isPending ? 'Saving...' : 'Save Notification Settings'}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security">
          <Card>
            <CardHeader>
              <CardTitle>Security & Backup Settings</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSystemSubmit} className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Automatic Backup</Label>
                      <p className="text-sm text-muted-foreground">
                        Automatically backup system data
                      </p>
                    </div>
                    <Switch 
                      checked={systemFormData.autoBackup}
                      onCheckedChange={(checked) => updateSystemField('autoBackup', checked)}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="backupFrequency">Backup Frequency</Label>
                      <Select 
                        value={systemFormData.backupFrequency}
                        onValueChange={(value) => updateSystemField('backupFrequency', value)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="daily">Daily</SelectItem>
                          <SelectItem value="weekly">Weekly</SelectItem>
                          <SelectItem value="monthly">Monthly</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="dataRetentionDays">Data Retention (days)</Label>
                      <Input
                        id="dataRetentionDays"
                        type="number"
                        value={systemFormData.dataRetentionDays}
                        onChange={(e) => updateSystemField('dataRetentionDays', parseInt(e.target.value) || 0)}
                      />
                    </div>
                  </div>
                </div>

                <Button type="submit" disabled={updateSystemMutation.isPending}>
                  {updateSystemMutation.isPending ? 'Saving...' : 'Save Security Settings'}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

// import React, { useState, useEffect } from 'react';
// import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
// import { Button } from '@/components/ui/button';
// import { Input } from '@/components/ui/input';
// import { Label } from '@/components/ui/label';
// import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
// import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
// import { Switch } from '@/components/ui/switch';
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
// import { toast } from '@/components/ui/sonner';
// import { Settings, Clock, Globe, Bell, Shield } from 'lucide-react';
// import backend from '~backend/client';
// import type { UpdateAttendanceSettingsRequest } from '~backend/settings/attendance_settings';
// import type { UpdateSystemSettingsRequest } from '~backend/settings/system_settings';

// export default function SettingsPage() {
//   const queryClient = useQueryClient();
  
//   // Form state for controlled components
//   const [attendanceFormData, setAttendanceFormData] = useState<UpdateAttendanceSettingsRequest>({
//     workStartTime: '09:00',
//     workEndTime: '17:00',
//     lateThresholdMinutes: 15,
//     earlyLeaveThresholdMinutes: 15,
//     workingDaysPerWeek: 5,
//     weekendDays: ['Saturday', 'Sunday'],
//     holidayDates: [],
//     overtimeEnabled: false,
//     overtimeRate: 1.5,
//     breakDurationMinutes: 60,
//   });

//   const [systemFormData, setSystemFormData] = useState<UpdateSystemSettingsRequest>({
//     companyName: 'AttendanceHub Corp',
//     timezone: 'UTC',
//     dateFormat: 'MM/DD/YYYY',
//     timeFormat: '12h',
//     currency: 'USD',
//     language: 'en',
//     emailNotifications: false,
//     smsNotifications: false,
//     whatsappNotifications: false,
//     autoBackup: false,
//     backupFrequency: 'daily',
//     dataRetentionDays: 365,
//   });

//   const { data: attendanceSettings, isLoading: attendanceLoading } = useQuery({
//     queryKey: ['attendance-settings'],
//     queryFn: () => backend.settings.getAttendanceSettings(),
//   });

//   const { data: systemSettings, isLoading: systemLoading } = useQuery({
//     queryKey: ['system-settings'],
//     queryFn: () => backend.settings.getSystemSettings(),
//   });

//   // Update form data when settings are loaded
//   useEffect(() => {
//     if (attendanceSettings) {
//       setAttendanceFormData({
//         workStartTime: attendanceSettings.workStartTime,
//         workEndTime: attendanceSettings.workEndTime,
//         lateThresholdMinutes: attendanceSettings.lateThresholdMinutes,
//         earlyLeaveThresholdMinutes: attendanceSettings.earlyLeaveThresholdMinutes,
//         workingDaysPerWeek: attendanceSettings.workingDaysPerWeek,
//         weekendDays: attendanceSettings.weekendDays,
//         holidayDates: attendanceSettings.holidayDates,
//         overtimeEnabled: attendanceSettings.overtimeEnabled,
//         overtimeRate: attendanceSettings.overtimeRate,
//         breakDurationMinutes: attendanceSettings.breakDurationMinutes,
//       });
//     }
//   }, [attendanceSettings]);

//   useEffect(() => {
//     if (systemSettings) {
//       setSystemFormData({
//         companyName: systemSettings.companyName,
//         timezone: systemSettings.timezone,
//         dateFormat: systemSettings.dateFormat,
//         timeFormat: systemSettings.timeFormat,
//         currency: systemSettings.currency,
//         language: systemSettings.language,
//         emailNotifications: systemSettings.emailNotifications,
//         smsNotifications: systemSettings.smsNotifications,
//         whatsappNotifications: systemSettings.whatsappNotifications,
//         autoBackup: systemSettings.autoBackup,
//         backupFrequency: systemSettings.backupFrequency,
//         dataRetentionDays: systemSettings.dataRetentionDays,
//       });
//     }
//   }, [systemSettings]);

//   const updateAttendanceMutation = useMutation({
//     mutationFn: (data: UpdateAttendanceSettingsRequest) => backend.settings.updateAttendanceSettings(data),
//     onSuccess: () => {
//       queryClient.invalidateQueries({ queryKey: ['attendance-settings'] });
//       toast({
//         title: "Settings updated",
//         description: "Attendance settings have been saved successfully.",
//       });
//     },
//     onError: (error) => {
//       console.error('Failed to update attendance settings:', error);
//       toast({
//         title: "Error",
//         description: "Failed to update attendance settings.",
//         variant: "destructive",
//       });
//     },
//   });

//   const updateSystemMutation = useMutation({
//     mutationFn: (data: UpdateSystemSettingsRequest) => backend.settings.updateSystemSettings(data),
//     onSuccess: () => {
//       queryClient.invalidateQueries({ queryKey: ['system-settings'] });
//       toast({
//         title: "Settings updated",
//         description: "System settings have been saved successfully.",
//       });
//     },
//     onError: (error) => {
//       console.error('Failed to update system settings:', error);
//       toast({
//         title: "Error",
//         description: "Failed to update system settings.",
//         variant: "destructive",
//       });
//     },
//   });

//   const handleAttendanceSubmit = (e: React.FormEvent<HTMLFormElement>) => {
//     e.preventDefault();
//     updateAttendanceMutation.mutate(attendanceFormData);
//   };

//   const handleSystemSubmit = (e: React.FormEvent<HTMLFormElement>) => {
//     e.preventDefault();
//     updateSystemMutation.mutate(systemFormData);
//   };

//   const updateAttendanceField = <T extends UpdateAttendanceSettingsRequest[keyof UpdateAttendanceSettingsRequest]>(
//     field: keyof UpdateAttendanceSettingsRequest,
//     value: T
//   ) => {
//     setAttendanceFormData((prev: UpdateAttendanceSettingsRequest) => ({ ...prev, [field]: value }));
//   };

//   const updateSystemField = <T extends UpdateSystemSettingsRequest[keyof UpdateSystemSettingsRequest]>(
//     field: keyof UpdateSystemSettingsRequest,
//     value: T
//   ) => {
//     setSystemFormData((prev: UpdateSystemSettingsRequest) => ({ ...prev, [field]: value }));
//   };

//   return (
//     <div className="space-y-6">
//       <div className="flex items-center justify-between">
//         <h1 className="text-3xl font-bold text-foreground">Settings</h1>
//         <div className="flex items-center space-x-2">
//           <Settings className="h-5 w-5 text-muted-foreground" />
//           <span className="text-sm text-muted-foreground">System Configuration</span>
//         </div>
//       </div>

//       <Tabs defaultValue="attendance" className="space-y-6">
//         <TabsList className="grid w-full grid-cols-4">
//           <TabsTrigger value="attendance" className="flex items-center space-x-2">
//             <Clock className="h-4 w-4" />
//             <span>Attendance</span>
//           </TabsTrigger>
//           <TabsTrigger value="system" className="flex items-center space-x-2">
//             <Globe className="h-4 w-4" />
//             <span>System</span>
//           </TabsTrigger>
//           <TabsTrigger value="notifications" className="flex items-center space-x-2">
//             <Bell className="h-4 w-4" />
//             <span>Notifications</span>
//           </TabsTrigger>
//           <TabsTrigger value="security" className="flex items-center space-x-2">
//             <Shield className="h-4 w-4" />
//             <span>Security</span>
//           </TabsTrigger>
//         </TabsList>

//         <TabsContent value="attendance">
//           <Card>
//             <CardHeader>
//               <CardTitle>Attendance Settings</CardTitle>
//             </CardHeader>
//             <CardContent>
//               {attendanceLoading ? (
//                 <div className="space-y-4">
//                   {[...Array(6)].map((_, i) => (
//                     <div key={i} className="h-10 bg-muted animate-pulse rounded" />
//                   ))}
//                 </div>
//               ) : (
//                 <form onSubmit={handleAttendanceSubmit} className="space-y-6">
//                   <div className="grid grid-cols-2 gap-4">
//                     <div className="space-y-2">
//                       <Label htmlFor="workStartTime">Work Start Time</Label>
//                       <Input
//                         id="workStartTime"
//                         type="time"
//                         value={attendanceFormData.workStartTime}
//                         onChange={(e) => updateAttendanceField('workStartTime', e.target.value)}
//                       />
//                     </div>
//                     <div className="space-y-2">
//                       <Label htmlFor="workEndTime">Work End Time</Label>
//                       <Input
//                         id="workEndTime"
//                         type="time"
//                         value={attendanceFormData.workEndTime}
//                         onChange={(e) => updateAttendanceField('workEndTime', e.target.value)}
//                       />
//                     </div>
//                   </div>

//                   <div className="grid grid-cols-2 gap-4">
//                     <div className="space-y-2">
//                       <Label htmlFor="lateThresholdMinutes">Late Threshold (minutes)</Label>
//                       <Input
//                         id="lateThresholdMinutes"
//                         type="number"
//                         value={attendanceFormData.lateThresholdMinutes}
//                         onChange={(e) => updateAttendanceField('lateThresholdMinutes', parseInt(e.target.value) || 0)}
//                       />
//                     </div>
//                     <div className="space-y-2">
//                       <Label htmlFor="earlyLeaveThresholdMinutes">Early Leave Threshold (minutes)</Label>
//                       <Input
//                         id="earlyLeaveThresholdMinutes"
//                         type="number"
//                         value={attendanceFormData.earlyLeaveThresholdMinutes}
//                         onChange={(e) => updateAttendanceField('earlyLeaveThresholdMinutes', parseInt(e.target.value) || 0)}
//                       />
//                     </div>
//                   </div>

//                   <div className="grid grid-cols-2 gap-4">
//                     <div className="space-y-2">
//                       <Label htmlFor="workingDaysPerWeek">Working Days Per Week</Label>
//                       <Select 
//                         value={attendanceFormData.workingDaysPerWeek.toString()}
//                         onValueChange={(value) => updateAttendanceField('workingDaysPerWeek', parseInt(value))}
//                       >
//                         <SelectTrigger>
//                           <SelectValue />
//                         </SelectTrigger>
//                         <SelectContent>
//                           <SelectItem value="5">5 Days</SelectItem>
//                           <SelectItem value="6">6 Days</SelectItem>
//                           <SelectItem value="7">7 Days</SelectItem>
//                         </SelectContent>
//                       </Select>
//                     </div>
//                     <div className="space-y-2">
//                       <Label htmlFor="breakDurationMinutes">Break Duration (minutes)</Label>
//                       <Input
//                         id="breakDurationMinutes"
//                         type="number"
//                         value={attendanceFormData.breakDurationMinutes}
//                         onChange={(e) => updateAttendanceField('breakDurationMinutes', parseInt(e.target.value) || 0)}
//                       />
//                     </div>
//                   </div>

//                   <div className="space-y-4">
//                     <div className="flex items-center justify-between">
//                       <div className="space-y-0.5">
//                         <Label>Overtime Enabled</Label>
//                         <p className="text-sm text-muted-foreground">
//                           Allow overtime calculation for employees
//                         </p>
//                       </div>
//                       <Switch 
//                         checked={attendanceFormData.overtimeEnabled}
//                         onCheckedChange={(checked) => updateAttendanceField('overtimeEnabled', checked)}
//                       />
//                     </div>

//                     <div className="space-y-2">
//                       <Label htmlFor="overtimeRate">Overtime Rate Multiplier</Label>
//                       <Input
//                         id="overtimeRate"
//                         type="number"
//                         step="0.1"
//                         value={attendanceFormData.overtimeRate}
//                         onChange={(e) => updateAttendanceField('overtimeRate', parseFloat(e.target.value) || 0)}
//                       />
//                     </div>
//                   </div>

//                   <Button type="submit" disabled={updateAttendanceMutation.isPending}>
//                     {updateAttendanceMutation.isPending ? 'Saving...' : 'Save Attendance Settings'}
//                   </Button>
//                 </form>
//               )}
//             </CardContent>
//           </Card>
//         </TabsContent>

//         <TabsContent value="system">
//           <Card>
//             <CardHeader>
//               <CardTitle>System Settings</CardTitle>
//             </CardHeader>
//             <CardContent>
//               {systemLoading ? (
//                 <div className="space-y-4">
//                   {[...Array(8)].map((_, i) => (
//                     <div key={i} className="h-10 bg-muted animate-pulse rounded" />
//                   ))}
//                 </div>
//               ) : (
//                 <form onSubmit={handleSystemSubmit} className="space-y-6">
//                   <div className="space-y-2">
//                     <Label htmlFor="companyName">Company Name</Label>
//                     <Input
//                       id="companyName"
//                       value={systemFormData.companyName}
//                       onChange={(e) => updateSystemField('companyName', e.target.value)}
//                     />
//                   </div>

//                   <div className="grid grid-cols-2 gap-4">
//                     <div className="space-y-2">
//                       <Label htmlFor="timezone">Timezone</Label>
//                       <Select 
//                         value={systemFormData.timezone}
//                         onValueChange={(value) => updateSystemField('timezone', value)}
//                       >
//                         <SelectTrigger>
//                           <SelectValue />
//                         </SelectTrigger>
//                         <SelectContent>
//                           <SelectItem value="UTC">UTC</SelectItem>
//                           <SelectItem value="America/New_York">Eastern Time</SelectItem>
//                           <SelectItem value="America/Chicago">Central Time</SelectItem>
//                           <SelectItem value="America/Denver">Mountain Time</SelectItem>
//                           <SelectItem value="America/Los_Angeles">Pacific Time</SelectItem>
//                         </SelectContent>
//                       </Select>
//                     </div>
//                     <div className="space-y-2">
//                       <Label htmlFor="language">Language</Label>
//                       <Select 
//                         value={systemFormData.language}
//                         onValueChange={(value) => updateSystemField('language', value)}
//                       >
//                         <SelectTrigger>
//                           <SelectValue />
//                         </SelectTrigger>
//                         <SelectContent>
//                           <SelectItem value="en">English</SelectItem>
//                           <SelectItem value="es">Spanish</SelectItem>
//                           <SelectItem value="fr">French</SelectItem>
//                           <SelectItem value="de">German</SelectItem>
//                         </SelectContent>
//                       </Select>
//                     </div>
//                   </div>

//                   <div className="grid grid-cols-3 gap-4">
//                     <div className="space-y-2">
//                       <Label htmlFor="dateFormat">Date Format</Label>
//                       <Select 
//                         value={systemFormData.dateFormat}
//                         onValueChange={(value) => updateSystemField('dateFormat', value)}
//                       >
//                         <SelectTrigger>
//                           <SelectValue />
//                         </SelectTrigger>
//                         <SelectContent>
//                           <SelectItem value="MM/DD/YYYY">MM/DD/YYYY</SelectItem>
//                           <SelectItem value="DD/MM/YYYY">DD/MM/YYYY</SelectItem>
//                           <SelectItem value="YYYY-MM-DD">YYYY-MM-DD</SelectItem>
//                         </SelectContent>
//                       </Select>
//                     </div>
//                     <div className="space-y-2">
//                       <Label htmlFor="timeFormat">Time Format</Label>
//                       <Select 
//                         value={systemFormData.timeFormat}
//                         onValueChange={(value) => updateSystemField('timeFormat', value)}
//                       >
//                         <SelectTrigger>
//                           <SelectValue />
//                         </SelectTrigger>
//                         <SelectContent>
//                           <SelectItem value="12h">12 Hour</SelectItem>
//                           <SelectItem value="24h">24 Hour</SelectItem>
//                         </SelectContent>
//                       </Select>
//                     </div>
//                     <div className="space-y-2">
//                       <Label htmlFor="currency">Currency</Label>
//                       <Select 
//                         value={systemFormData.currency}
//                         onValueChange={(value) => updateSystemField('currency', value)}
//                       >
//                         <SelectTrigger>
//                           <SelectValue />
//                         </SelectTrigger>
//                         <SelectContent>
//                           <SelectItem value="USD">USD</SelectItem>
//                           <SelectItem value="EUR">EUR</SelectItem>
//                           <SelectItem value="GBP">GBP</SelectItem>
//                           <SelectItem value="JPY">JPY</SelectItem>
//                         </SelectContent>
//                       </Select>
//                     </div>
//                   </div>

//                   <Button type="submit" disabled={updateSystemMutation.isPending}>
//                     {updateSystemMutation.isPending ? 'Saving...' : 'Save System Settings'}
//                   </Button>
//                 </form>
//               )}
//             </CardContent>
//           </Card>
//         </TabsContent>

//         <TabsContent value="notifications">
//           <Card>
//             <CardHeader>
//               <CardTitle>Notification Settings</CardTitle>
//             </CardHeader>
//             <CardContent>
//               <form onSubmit={handleSystemSubmit} className="space-y-6">
//                 <div className="space-y-4">
//                   <div className="flex items-center justify-between">
//                     <div className="space-y-0.5">
//                       <Label>Email Notifications</Label>
//                       <p className="text-sm text-muted-foreground">
//                         Receive attendance alerts via email
//                       </p>
//                     </div>
//                     <Switch 
//                       checked={systemFormData.emailNotifications}
//                       onCheckedChange={(checked) => updateSystemField('emailNotifications', checked)}
//                     />
//                   </div>

//                   <div className="flex items-center justify-between">
//                     <div className="space-y-0.5">
//                       <Label>SMS Notifications</Label>
//                       <p className="text-sm text-muted-foreground">
//                         Receive attendance alerts via SMS
//                       </p>
//                     </div>
//                     <Switch 
//                       checked={systemFormData.smsNotifications}
//                       onCheckedChange={(checked) => updateSystemField('smsNotifications', checked)}
//                     />
//                   </div>

//                   <div className="flex items-center justify-between">
//                     <div className="space-y-0.5">
//                       <Label>WhatsApp Notifications</Label>
//                       <p className="text-sm text-muted-foreground">
//                         Receive attendance alerts via WhatsApp
//                       </p>
//                     </div>
//                     <Switch 
//                       checked={systemFormData.whatsappNotifications}
//                       onCheckedChange={(checked) => updateSystemField('whatsappNotifications', checked)}
//                     />
//                   </div>
//                 </div>

//                 <Button type="submit" disabled={updateSystemMutation.isPending}>
//                   {updateSystemMutation.isPending ? 'Saving...' : 'Save Notification Settings'}
//                 </Button>
//               </form>
//             </CardContent>
//           </Card>
//         </TabsContent>

//         <TabsContent value="security">
//           <Card>
//             <CardHeader>
//               <CardTitle>Security & Backup Settings</CardTitle>
//             </CardHeader>
//             <CardContent>
//               <form onSubmit={handleSystemSubmit} className="space-y-6">
//                 <div className="space-y-4">
//                   <div className="flex items-center justify-between">
//                     <div className="space-y-0.5">
//                       <Label>Automatic Backup</Label>
//                       <p className="text-sm text-muted-foreground">
//                         Automatically backup system data
//                       </p>
//                     </div>
//                     <Switch 
//                       checked={systemFormData.autoBackup}
//                       onCheckedChange={(checked) => updateSystemField('autoBackup', checked)}
//                     />
//                   </div>

//                   <div className="grid grid-cols-2 gap-4">
//                     <div className="space-y-2">
//                       <Label htmlFor="backupFrequency">Backup Frequency</Label>
//                       <Select 
//                         value={systemFormData.backupFrequency}
//                         onValueChange={(value) => updateSystemField('backupFrequency', value)}
//                       >
//                         <SelectTrigger>
//                           <SelectValue />
//                         </SelectTrigger>
//                         <SelectContent>
//                           <SelectItem value="daily">Daily</SelectItem>
//                           <SelectItem value="weekly">Weekly</SelectItem>
//                           <SelectItem value="monthly">Monthly</SelectItem>
//                         </SelectContent>
//                       </Select>
//                     </div>
//                     <div className="space-y-2">
//                       <Label htmlFor="dataRetentionDays">Data Retention (days)</Label>
//                       <Input
//                         id="dataRetentionDays"
//                         type="number"
//                         value={systemFormData.dataRetentionDays}
//                         onChange={(e) => updateSystemField('dataRetentionDays', parseInt(e.target.value) || 0)}
//                       />
//                     </div>
//                   </div>
//                 </div>

//                 <Button type="submit" disabled={updateSystemMutation.isPending}>
//                   {updateSystemMutation.isPending ? 'Saving...' : 'Save Security Settings'}
//                 </Button>
//               </form>
//             </CardContent>
//           </Card>
//         </TabsContent>
//       </Tabs>
//     </div>
//   );
// }
