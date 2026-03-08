import { 
  collection, 
  doc, 
  setDoc, 
  getDocs, 
  query, 
  where, 
  deleteDoc, 
  updateDoc, 
  orderBy, 
  writeBatch
} from 'firebase/firestore';
import { db } from './firebase';
import type { Board, Column, Task } from '../types';

// BOARDS
export async function createBoard(ownerId: string, title: string): Promise<string> {
  const boardRef = doc(collection(db, 'Boards'));
  const newBoard: Board = {
    id: boardRef.id,
    title,
    ownerId,
  };
  await setDoc(boardRef, newBoard);
  return boardRef.id;
}

export async function getBoards(userId: string): Promise<Board[]> {
  const q = query(collection(db, 'Boards'), where('ownerId', '==', userId));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => doc.data() as Board);
}

export async function deleteBoard(boardId: string): Promise<void> {
  await deleteDoc(doc(db, 'Boards', boardId));
  // Note: in a real app, delete all sub-columns and tasks as well via Firebase Functions or batched requests.
}

// COLUMNS
export async function createColumn(boardId: string, title: string, order: number): Promise<string> {
  const colRef = doc(collection(db, 'Columns'));
  const newCol: Column = {
    id: colRef.id,
    boardId,
    title,
    order,
  };
  await setDoc(colRef, newCol);
  return colRef.id;
}

export async function getColumns(boardId: string): Promise<Column[]> {
  const q = query(collection(db, 'Columns'), where('boardId', '==', boardId), orderBy('order', 'asc'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => doc.data() as Column);
}

// TASKS
export async function createTask(columnId: string, title: string, description: string = '', dueDate: string | null = null, order: number): Promise<string> {
  const taskRef = doc(collection(db, 'Tasks'));
  const newTask: Task = {
    id: taskRef.id,
    columnId,
    title,
    description,
    dueDate,
    createdAt: Date.now(),
    order,
  };
  await setDoc(taskRef, newTask);
  return taskRef.id;
}

export async function getTasksForBoard(boardId: string): Promise<Task[]> {
  // First get columns for the board
  const columns = await getColumns(boardId);
  const columnIds = columns.map(c => c.id);
  
  if (columnIds.length === 0) return [];

  // Get tasks where columnId is in columnIds
  // Note: Firestore 'in' queries support max 10 parameters. We chunk for safety if we expect more columns.
  const allTasks: Task[] = [];
  const chunkSize = 10;
  for (let i = 0; i < columnIds.length; i += chunkSize) {
    const chunk = columnIds.slice(i, i + chunkSize);
    const q = query(collection(db, 'Tasks'), where('columnId', 'in', chunk), orderBy('order', 'asc'));
    const snapshot = await getDocs(q);
    snapshot.docs.forEach(d => allTasks.push(d.data() as Task));
  }
  
  return allTasks;
}

export async function updateTask(taskId: string, updates: Partial<Task>): Promise<void> {
  await updateDoc(doc(db, 'Tasks', taskId), updates);
}

export async function deleteTask(taskId: string): Promise<void> {
  await deleteDoc(doc(db, 'Tasks', taskId));
}

// DRAG AND DROP BATCH UPDATES
export async function updateTasksOrder(tasks: Task[]): Promise<void> {
  const batch = writeBatch(db);
  tasks.forEach(task => {
    const ref = doc(db, 'Tasks', task.id);
    batch.update(ref, { order: task.order, columnId: task.columnId });
  });
  await batch.commit();
}
