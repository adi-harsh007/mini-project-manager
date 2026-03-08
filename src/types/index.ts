export interface UserProfile {
  userId: string;
  name: string;
  email: string;
}

export interface Board {
  id: string; // Using 'id' for doc ID convenience, maps to boardId
  title: string;
  ownerId: string;
}

export interface Column {
  id: string;
  boardId: string;
  title: string;
  order: number;
}

export interface Task {
  id: string;
  columnId: string;
  title: string;
  description: string;
  dueDate: string | null;
  createdAt: number;
  order: number; // Necessary for precise vertical drag and drop sorting
}
