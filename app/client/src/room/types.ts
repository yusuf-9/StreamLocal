export interface User {
  id: string;
  name: string;
  avatar: string;
  status: 'online' | 'offline' | 'speaking';
  color: string;
} 