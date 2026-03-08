import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { DragDropContext, type DropResult } from '@hello-pangea/dnd';
import { Column as ColumnComponent } from '../components/board/Column';
import { TaskModal } from '../components/board/TaskModal';
import { getColumns, getTasksForBoard, createColumn, createTask, updateTask, updateTasksOrder, deleteTask } from '../lib/db';
import type { Column, Task } from '../types';
import { Plus } from 'lucide-react';

export function BoardPage() {
  const { boardId } = useParams<{ boardId: string }>();
  const [columns, setColumns] = useState<Column[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [activeColumnId, setActiveColumnId] = useState<string | undefined>();
  
  const [newColTitle, setNewColTitle] = useState('');
  const [isAddingCol, setIsAddingCol] = useState(false);

  useEffect(() => {
    if (boardId) {
      loadBoardData(boardId);
    }
  }, [boardId]);

  const loadBoardData = async (bId: string) => {
    const fetchedCols = await getColumns(bId);
    setColumns(fetchedCols);
    const fetchedTasks = await getTasksForBoard(bId);
    setTasks(fetchedTasks);
  };

  const handleDragEnd = async (result: DropResult) => {
    const { source, destination, draggableId } = result;
    if (!destination) return;
    if (source.droppableId === destination.droppableId && source.index === destination.index) return;
    
    // Optimistic UI Update
    const sourceColId = source.droppableId;
    const destColId = destination.droppableId;
    
    const newTasks = Array.from(tasks);
    const draggedTaskIndex = newTasks.findIndex(t => t.id === draggableId);
    const draggedTask = newTasks[draggedTaskIndex];
    
    // Update columnId
    draggedTask.columnId = destColId;
    
    // Calculate new order logic
    // We group by column to re-sort
    const destTasks = newTasks.filter(t => t.columnId === destColId && t.id !== draggableId).sort((a,b) => a.order - b.order);
    destTasks.splice(destination.index, 0, draggedTask);
    
    // Update orders for the destination column
    destTasks.forEach((t, i) => {
      t.order = i;
    });
    
    // If different column, we also update source column orders
    let sourceTasks: Task[] = [];
    if (sourceColId !== destColId) {
      sourceTasks = newTasks.filter(t => t.columnId === sourceColId).sort((a,b) => a.order - b.order);
      sourceTasks.forEach((t, i) => t.order = i);
    }
    
    setTasks(newTasks); // Update UI immediately
    
    try {
      // Sync to Firebase
      const tasksToUpdate = [...destTasks, ...(sourceColId !== destColId ? sourceTasks : [])];
      await updateTasksOrder(tasksToUpdate);
    } catch (err) {
      console.error('Drag sync failed', err);
      // Revert if failed (simplified: just reload)
      if (boardId) loadBoardData(boardId);
    }
  };

  const handleAddColumn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!boardId || !newColTitle.trim()) return;
    const title = newColTitle.trim();
    try {
      const id = await createColumn(boardId, title, columns.length);
      setColumns([...columns, { id, boardId, title, order: columns.length }]);
      setNewColTitle('');
      setIsAddingCol(false);
    } catch (e) {
      console.error(e);
    }
  };

  const openTaskModal = (task?: Task, colId?: string) => {
    setSelectedTask(task || null);
    setActiveColumnId(colId);
    setIsModalOpen(true);
  };
  
  const handleSaveTask = async (taskData: Partial<Task>) => {
    if (selectedTask) {
      // Edit
      await updateTask(selectedTask.id, taskData);
      setTasks(tasks.map(t => t.id === selectedTask.id ? { ...t, ...taskData } : t));
    } else {
      // Create
      if (!activeColumnId) return;
      const colTasks = tasks.filter(t => t.columnId === activeColumnId);
      const order = colTasks.length;
      const id = await createTask(activeColumnId, taskData.title!, taskData.description, taskData.dueDate || null, order);
      const newTask: Task = {
        id, columnId: activeColumnId, title: taskData.title!, description: taskData.description || '', dueDate: taskData.dueDate || null, order, createdAt: Date.now()
      };
      setTasks([...tasks, newTask]);
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    await deleteTask(taskId);
    setTasks(tasks.filter(t => t.id !== taskId));
  };

  return (
    <div className="h-full flex flex-col">
      <div className="flex-1 overflow-x-auto overflow-y-hidden pb-4">
        <div className="flex gap-4 h-full items-start w-max px-2">
          <DragDropContext onDragEnd={handleDragEnd}>
            {columns.map(column => (
              <ColumnComponent 
                key={column.id} 
                column={column} 
                tasks={tasks.filter(t => t.columnId === column.id).sort((a,b) => a.order - b.order)}
                onTaskClick={(currentTask) => openTaskModal(currentTask)}
                onAddTask={(colId) => openTaskModal(undefined, colId)}
              />
            ))}
          </DragDropContext>
          
          {isAddingCol ? (
            <form onSubmit={handleAddColumn} className="bg-surface-100 w-72 shrink-0 rounded-xl p-3">
              <input 
                autoFocus
                className="w-full text-sm px-2 py-1.5 border border-surface-300 rounded outline-none focus:border-primary-500 mb-2"
                placeholder="Column title..."
                value={newColTitle}
                onChange={e => setNewColTitle(e.target.value)}
              />
              <div className="flex justify-end gap-2">
                <button type="button" onClick={() => setIsAddingCol(false)} className="text-xs px-2 py-1 text-surface-500 hover:bg-surface-200 rounded cursor-pointer">Cancel</button>
                <button type="submit" className="text-xs px-2 py-1 bg-primary-500 text-white rounded hover:bg-primary-600 cursor-pointer">Add List</button>
              </div>
            </form>
          ) : (
            <button 
              onClick={() => setIsAddingCol(true)}
              className="bg-surface-100/50 hover:bg-surface-200 w-72 shrink-0 rounded-xl p-3 flex items-center gap-2 text-surface-600 hover:text-surface-800 transition-colors font-medium border border-transparent hover:border-surface-300 cursor-pointer"
            >
              <Plus size={18} />
              Add another list
            </button>
          )}
        </div>
      </div>
      
      <TaskModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        task={selectedTask}
        columnId={activeColumnId}
        onSave={handleSaveTask}
        onDelete={handleDeleteTask}
      />
    </div>
  );
}
