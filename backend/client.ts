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
    })
  },
  attendance: {
    // Add mock methods as needed
  },
  settings: {
    // Add mock methods as needed
  }
};