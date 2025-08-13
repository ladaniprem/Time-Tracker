// import { api } from "encore.dev/api";
// import { db as attendanceDB } from "../attendance/db";

// export interface UserProfile {
//   id: number;
//   username: string;
//   email: string;
//   firstName: string;
//   lastName: string;
//   phone?: string;
//   avatar?: string;
//   role: string;
//   department?: string;
//   position?: string;
//   createdAt: Date;
//   updatedAt: Date;
// }

// export interface UpdateProfileRequest {
//   firstName: string;
//   lastName: string;
//   phone?: string;
//   avatar?: string;
//   department?: string;
//   position?: string;
// }

// export interface LoginRequest {
//   email: string;
//   password: string;
// }

// export interface LoginResponse {
//   success: boolean;
//   user?: UserProfile;
//   token?: string;
//   error?: string;
// }

// // Authenticates user login credentials.
// export const login = api<LoginRequest, LoginResponse>(
//   { expose: true, method: "POST", path: "/auth/login" },
//   async (req) => {
//     try {
//       // Simple authentication - in production, use proper password hashing
//       if (req.email === "admin@company.com" && req.password === "admin123") {
//         const user: UserProfile = {
//           id: 1,
//           username: "admin",
//           email: req.email,
//           firstName: "Admin",
//           lastName: "User",
//           phone: "+1 234 567 8900",
//           avatar: "",
//           role: "admin",
//           department: "Management",
//           position: "System Administrator",
//           createdAt: new Date(),
//           updatedAt: new Date()
//         };

//         return {
//           success: true,
//           user,
//           token: `token_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
//         };
//       }

//       return {
//         success: false,
//         error: "Invalid email or password"
//       };
//     } catch (error) {
//       return {
//         success: false,
//         error: error instanceof Error ? error.message : "Login failed"
//       };
//     }
//   }
// );

// // Retrieves the current user's profile.
// export const getProfile = api<void, UserProfile>(
//   { expose: true, method: "GET", path: "/auth/profile" },
//   async () => {
//     // In a real implementation, you would get the user ID from the auth token
//     const user: UserProfile = {
//       id: 1,
//       username: "admin",
//       email: "admin@company.com",
//       firstName: "Admin",
//       lastName: "User",
//       phone: "+1 234 567 8900",
//       avatar: "",
//       role: "admin",
//       department: "Management",
//       position: "System Administrator",
//       createdAt: new Date(),
//       updatedAt: new Date()
//     };

//     return user;
//   }
// );

// // Updates the current user's profile.
// export const updateProfile = api<UpdateProfileRequest, UserProfile>(
//   { expose: true, method: "PUT", path: "/auth/profile" },
//   async (req) => {
//     // In a real implementation, you would update the user in the database
//     const updatedUser: UserProfile = {
//       id: 1,
//       username: "admin",
//       email: "admin@company.com",
//       firstName: req.firstName,
//       lastName: req.lastName,
//       phone: req.phone,
//       avatar: req.avatar,
//       role: "admin",
//       department: req.department,
//       position: req.position,
//       createdAt: new Date(),
//       updatedAt: new Date()
//     };

//     return updatedUser;
//   }
// );
import { api } from "encore.dev/api";
import { db as attendanceDB } from "../attendance/db";

export interface UserProfile {
  id: number;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  avatar?: string;
  role: string;
  department?: string;
  position?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface UpdateProfileRequest {
  firstName: string;
  lastName: string;
  phone?: string;
  avatar?: string;
  department?: string;
  position?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  success: boolean;
  user?: UserProfile;
  token?: string;
  error?: string;
}

// Authenticates user login credentials.
export const login = api<LoginRequest, LoginResponse>(
  { expose: true, method: "POST", path: "/auth/login" },
  async (req) => {
    try {
      // Simple authentication - in production, use proper password hashing
      if (req.email === "admin@company.com" && req.password === "admin123") {
        const user: UserProfile = {
          id: 1,
          username: "admin",
          email: req.email,
          firstName: "Admin",
          lastName: "User",
          phone: "+1 234 567 8900",
          avatar: "",
          role: "admin",
          department: "Management",
          position: "System Administrator",
          createdAt: new Date(),
          updatedAt: new Date()
        };

        return {
          success: true,
          user,
          token: `token_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
        };
      }

      return {
        success: false,
        error: "Invalid email or password"
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Login failed"
      };
    }
  }
);

// Retrieves the current user's profile.
export const getProfile = api<void, UserProfile>(
  { expose: true, method: "GET", path: "/auth/profile" },
  async () => {
    // In a real implementation, you would get the user ID from the auth token
    const user: UserProfile = {
      id: 1,
      username: "admin",
      email: "admin@company.com",
      firstName: "Admin",
      lastName: "User",
      phone: "+1 234 567 8900",
      avatar: "",
      role: "admin",
      department: "Management",
      position: "System Administrator",
      createdAt: new Date(),
      updatedAt: new Date()
    };

    return user;
  }
);

// Updates the current user's profile.
export const updateProfile = api<UpdateProfileRequest, UserProfile>(
  { expose: true, method: "PUT", path: "/auth/profile" },
  async (req) => {
    // In a real implementation, you would update the user in the database
    const updatedUser: UserProfile = {
      id: 1,
      username: "admin",
      email: "admin@company.com",
      firstName: req.firstName,
      lastName: req.lastName,
      phone: req.phone,
      avatar: req.avatar,
      role: "admin",
      department: req.department,
      position: req.position,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    return updatedUser;
  }
);
