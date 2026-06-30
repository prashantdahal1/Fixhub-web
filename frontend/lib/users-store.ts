export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

declare global {
  var usersStore: User[] | undefined;
}

if (!globalThis.usersStore) {
  globalThis.usersStore = [
    {
      id: "1",
      name: "John Doe",
      email: "john@example.com",
      role: "admin",
      status: "active",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: "2",
      name: "Jane Smith",
      email: "jane@example.com",
      role: "user",
      status: "active",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  ];
}

export const users = globalThis.usersStore;
