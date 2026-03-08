import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { getBoards, createBoard } from '../lib/db';
import type { Board } from '../types';
import { Plus, LayoutTemplate } from 'lucide-react';

export function Dashboard() {
  const { currentUser } = useAuth();
  const [boards, setBoards] = useState<Board[]>([]);
  const [newTitle, setNewTitle] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    if (currentUser) {
      getBoards(currentUser.uid).then(setBoards);
    }
  }, [currentUser]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !currentUser) return;
    try {
      const id = await createBoard(currentUser.uid, newTitle.trim());
      setBoards([...boards, { id, title: newTitle.trim(), ownerId: currentUser.uid }]);
      setNewTitle('');
      setIsCreating(false);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="max-w-6xl mx-auto">
      <h2 className="text-2xl font-bold text-surface-900 mb-6 flex items-center gap-2">
        <LayoutTemplate className="text-primary-500" />
        Your Boards
      </h2>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {boards.map(board => (
          <Link 
            key={board.id} 
            to={`/b/${board.id}`}
            className="group flex flex-col justify-between h-32 p-4 bg-white border border-surface-200 rounded-xl hover:border-primary-400 hover:shadow-md transition-all cursor-pointer"
          >
            <h3 className="font-semibold text-surface-800 group-hover:text-primary-600">{board.title}</h3>
          </Link>
        ))}
        
        {isCreating ? (
          <form onSubmit={handleCreate} className="h-32 p-4 bg-white border border-primary-300 rounded-xl shadow-sm flex flex-col justify-between">
            <input 
              autoFocus
              className="w-full text-sm px-2 py-1 border-b border-surface-200 outline-none focus:border-primary-500 mb-2"
              placeholder="Board title..."
              value={newTitle}
              onChange={e => setNewTitle(e.target.value)}
            />
            <div className="flex justify-end gap-2 mt-auto">
              <button type="button" onClick={() => setIsCreating(false)} className="text-xs px-2 py-1 text-surface-500 hover:bg-surface-100 rounded cursor-pointer">Cancel</button>
              <button type="submit" className="text-xs px-2 py-1 bg-primary-500 text-white rounded hover:bg-primary-600 cursor-pointer">Create</button>
            </div>
          </form>
        ) : (
          <button 
            onClick={() => setIsCreating(true)}
            className="h-32 p-4 flex flex-col items-center justify-center gap-2 bg-surface-100 border border-surface-200 border-dashed rounded-xl hover:bg-surface-200 hover:border-surface-300 transition-colors text-surface-600 hover:text-surface-800 cursor-pointer"
          >
            <Plus />
            <span className="font-medium">Create new board</span>
          </button>
        )}
      </div>
    </div>
  );
}
