import React, { useEffect, useState } from 'react';
import { X, LayoutDashboard, Plus } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { getBoards, createBoard } from '../../lib/db';
import type { Board } from '../../types';

export function Sidebar({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const { currentUser } = useAuth();
  const location = useLocation();
  const [boards, setBoards] = useState<Board[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [newBoardTitle, setNewBoardTitle] = useState('');

  useEffect(() => {
    if (currentUser) {
      getBoards(currentUser.uid).then(setBoards);
    }
  }, [currentUser]);

  const handleCreateBoard = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBoardTitle.trim() || !currentUser) return;
    try {
      const id = await createBoard(currentUser.uid, newBoardTitle.trim());
      setBoards([...boards, { id, title: newBoardTitle.trim(), ownerId: currentUser.uid }]);
      setNewBoardTitle('');
      setIsCreating(false);
    } catch (err) {
      console.error('Failed to create board', err);
    }
  };

  return (
    <div className={`
      fixed inset-y-0 left-0 z-50 w-64 bg-surface-100 border-r border-surface-200 transform transition-transform duration-200 ease-in-out md:static md:translate-x-0
      ${isOpen ? 'translate-x-0' : '-translate-x-full'}
    `}>
      <div className="h-full flex flex-col">
        <div className="p-4 md:hidden flex justify-end shrink-0">
          <button onClick={onClose} className="p-1 hover:bg-surface-200 rounded-md text-surface-500">
            <X size={20} />
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4">
          <div className="mb-6">
            <Link 
              to="/dashboard" 
              className={`flex items-center gap-3 px-3 py-2 rounded-md font-medium transition-colors ${location.pathname === '/dashboard' || location.pathname === '/' ? 'bg-primary-50 text-primary-700' : 'text-surface-700 hover:bg-surface-200'}`}
            >
              <LayoutDashboard size={18} />
              Dashboard
            </Link>
          </div>

          <div>
            <div className="flex items-center justify-between px-1 mb-2">
              <h2 className="text-xs font-semibold text-surface-500 uppercase tracking-wider">Your Boards</h2>
              <button 
                onClick={() => setIsCreating(true)}
                className="p-1 text-surface-400 hover:text-surface-700 hover:bg-surface-200 rounded transition-colors"
                title="Create Board"
              >
                <Plus size={16} />
              </button>
            </div>
            
            {isCreating && (
              <form onSubmit={handleCreateBoard} className="mb-2 px-1">
                <input 
                  type="text" 
                  autoFocus
                  placeholder="Board title..."
                  className="w-full text-sm px-2 py-1.5 border border-surface-300 rounded-md outline-none focus:border-primary-500"
                  value={newBoardTitle}
                  onChange={(e) => setNewBoardTitle(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Escape') setIsCreating(false);
                  }}
                />
              </form>
            )}

            <div className="space-y-1">
              {boards.map(board => (
                <Link
                  key={board.id}
                  to={`/b/${board.id}`}
                  className={`block px-3 py-2 text-sm rounded-md truncate transition-colors ${location.pathname === `/b/${board.id}` ? 'bg-primary-50 text-primary-700 font-medium' : 'text-surface-600 hover:bg-surface-200'}`}
                >
                  {board.title}
                </Link>
              ))}
              {boards.length === 0 && !isCreating && (
                <div className="text-sm text-surface-400 px-3 py-2">No boards yet.</div>
              )}
            </div>
          </div>
        </div>
      </div>
      
      {/* Mobile overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-surface-900/50 z-40 md:hidden" 
          onClick={onClose}
        />
      )}
    </div>
  );
}
