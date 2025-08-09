// This is a temporary mock client for Encore.dev services
// In a real implementation, this would be generated using the Encore CLI:
// npx encore gen client --lang=ts --output=../frontend/src/encore/client.ts

// Mock client for development
const backend = {
  realtime: {
    attendanceUpdates: async (params: { userId: string }, options?: { signal?: AbortSignal }) => {
      console.log('Connecting to attendance updates stream for user:', params.userId);
      
      // Create a ReadableStream that simulates real-time updates
      return new ReadableStream({
        start(controller) {
          // Send a mock update every few seconds
          const interval = setInterval(() => {
            const mockUpdate = {
              type: Math.random() > 0.5 ? 'checkin' : 'checkout',
              employeeId: Math.floor(Math.random() * 10) + 1,
              employeeName: `Employee ${Math.floor(Math.random() * 10) + 1}`,
              timestamp: new Date(),
              data: {
                checkInTime: new Date().toLocaleTimeString(),
                status: Math.random() > 0.3 ? 'present' : 'late'
              }
            };
            
            controller.enqueue(mockUpdate);
          }, 10000);
          
          // Handle abort signal if provided
          if (options?.signal) {
            options.signal.addEventListener('abort', () => {
              clearInterval(interval);
              controller.close();
            });
          }
        }
      });
    }
  },
  auth: {
    login: async (data: { email: string; password: string }) => {
      // Simple authentication check
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
    },
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
    updateProfile: async (data: {
      firstName?: string;
      lastName?: string;
      phone?: string;
      avatar?: string;
      department?: string;
      position?: string;
    }) => ({
      ...data,
      id: 1,
      username: 'admin',
      email: 'admin@company.com',
      role: 'admin',
      createdAt: new Date(),
      updatedAt: new Date()
    })
  },
  attendance: {
    // Mock methods for attendance service
    listAttendance: async () => ({
      records: [],
      total: 0
    }),
    recordAttendance: async (data: { userId: number; date: Date; checkIn: Date; checkOut?: Date; status: 'present' | 'absent' | 'late' | 'half-day' }) => ({
      id: 1,
      ...data,
      createdAt: new Date(),
      updatedAt: new Date()
    })
  },
  settings: {
    // Mock methods for settings service
    getAttendanceSettings: async () => ({
      workStartTime: '09:00',
      workEndTime: '18:00',
      lunchStartTime: '13:00',
      lunchEndTime: '14:00',
      workingDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
      graceMinutes: 15
    }),
    updateAttendanceSettings: async (data: {
      workStartTime: string;
      workEndTime: string;
      lunchStartTime: string;
      lunchEndTime: string;
      workingDays: string[];
      graceMinutes: number;
    }) => data,
    getSystemSettings: async () => ({
      companyName: 'Demo Company',
      companyLogo: '',
      timezone: 'Asia/Kolkata',
      dateFormat: 'DD/MM/YYYY',
      timeFormat: '12h'
    }),
    updateSystemSettings: async (data: {
      companyName: string;
      companyLogo: string;
      timezone: string;
      dateFormat: string;
      timeFormat: '12h' | '24h';
    }) => data
  }
};

export default backend;