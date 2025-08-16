// This file is a placeholder for the Encore-generated client
// Encore automatically generates TypeScript clients for your APIs
// To generate the client, run: npx encore gen client --lang=ts --output=../frontend/src/encore/client.ts

// This is a temporary export to prevent import errors
export default {
  auth: {
    getProfile: async () => ({
      id: 1,
      username: 'admin',
      email: 'admin@company.com',
      firstName: 'Admin',
      lastName: 'User',
      role: 'admin',
      createdAt: new Date(),
      updatedAt: new Date()
    }),
    updateProfile: async (data: any) => ({
      ...data,
      id: 1,
      username: 'admin',
      email: 'admin@company.com',
      role: 'admin',
      createdAt: new Date(),
      updatedAt: new Date()
    }),
    login: async (data: any) => {
      if (data.email === "admin@company.com" && data.password === "admin123") {
        return {
          success: true,
          user: {
            id: 1,
            username: "admin",
            email: data.email,
            firstName: "Admin",
            lastName: "User",
            phone: "+1 234 567 8900",
            avatar: "",
            role: "admin",
            department: "Management",
            position: "System Administrator",
            createdAt: new Date(),
            updatedAt: new Date()
          },
          token: `token_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
        };
      }
      return {
        success: false,
        error: "Invalid email or password"
      };
    }
  },
  attendance: {
    createEmployee: async (data: any) => ({ ...data, id: 1, createdAt: new Date(), updatedAt: new Date() }),
    listEmployees: async () => ({ employees: [], total: 0 }),
    listAttendance: async (data: any) => ({ records: [], total: 0 }), // Mock implementation
    recordAttendance: async (data: any) => ({ success: true, message: "Mock attendance recorded" }), // Mock implementation
    getAttendance: async (data: any) => ({ success: true, message: "Mock attendance retrieved" }), // Mock implementation
  },
  settings: {
    getAttendanceSettings: async () => ({ // Mock implementation, replace with actual call
      id: 1,
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
      updatedAt: new Date(),
    }),
    updateAttendanceSettings: async (data: any) => ({ ...data, id: 1, updatedAt: new Date() }), // Mock implementation
    getSystemSettings: async () => ({ // Mock implementation
      id: 1,
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
      updatedAt: new Date(),
    }),
    updateSystemSettings: async (data: any) => ({ ...data, id: 1, updatedAt: new Date() }), // Mock implementation
  }
};