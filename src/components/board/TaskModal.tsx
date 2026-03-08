import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import type { Task } from '../../types';

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (taskData: Partial<Task>) => void;
  onDelete?: (taskId: string) => void;
  task?: Task | null;
  columnId?: string; // If creating new
}

export function TaskModal({ isOpen, onClose, onSave, onDelete, task, columnId }: TaskModalProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState('');

  useEffect(() => {
    if (task) {
      setTitle(task.title);
      setDescription(task.description);
      setDueDate(task.dueDate || '');
    } else {
      setTitle('');
      setDescription('');
      setDueDate('');
    }
  }, [task, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    
    onSave({
      title: title.trim(),
      description: description.trim(),
      dueDate: dueDate || null,
      ...(task ? {} : { columnId })
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-surface-900/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden">
        <div className="flex justify-between items-center p-4 border-b border-surface-200 bg-surface-50">
          <h2 className="text-lg font-semibold text-surface-800">
            {task ? 'Edit Task' : 'New Task'}
          </h2>
          <button onClick={onClose} className="p-1 hover:bg-surface-200 rounded-md text-surface-500 cursor-pointer">
            <X size={20} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-surface-700 mb-1">Title</label>
            <input 
              autoFocus
              required
              className="w-full px-3 py-2 border border-surface-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none" 
              value={title} 
              onChange={e => setTitle(e.target.value)} 
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-surface-700 mb-1">Description</label>
            <textarea 
              rows={3}
              className="w-full px-3 py-2 border border-surface-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none" 
              value={description} 
              onChange={e => setDescription(e.target.value)} 
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-surface-700 mb-1">Due Date</label>
            <input 
              type="date"
              className="w-full px-3 py-2 border border-surface-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none" 
              value={dueDate} 
              onChange={e => setDueDate(e.target.value)} 
            />
          </div>
          
          <div className="pt-4 flex justify-between items-center gap-3">
            {task && onDelete ? (
              <button 
                type="button" 
                onClick={() => { onDelete(task.id); onClose(); }} 
                className="text-red-600 hover:bg-red-50 px-4 py-2 rounded-lg font-medium transition-colors cursor-pointer"
              >
                Delete
              </button>
            ) : <div />}
            <div className="flex gap-3">
              <button 
                type="button" 
                onClick={onClose} 
                className="px-4 py-2 text-surface-600 hover:bg-surface-100 rounded-lg font-medium transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button 
                type="submit" 
                className="bg-primary-500 hover:bg-primary-600 text-white px-4 py-2 rounded-lg font-medium transition-colors cursor-pointer"
              >
                Save
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
