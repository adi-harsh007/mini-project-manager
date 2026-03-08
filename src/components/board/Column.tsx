
import { Droppable } from '@hello-pangea/dnd';
import { Plus } from 'lucide-react';
import { TaskCard } from './TaskCard';
import type { Column as ColumnType, Task } from '../../types';

interface ColumnProps {
  column: ColumnType;
  tasks: Task[];
  onTaskClick: (task: Task) => void;
  onAddTask: (columnId: string) => void;
}

export function Column({ column, tasks, onTaskClick, onAddTask }: ColumnProps) {
  return (
    <div className="bg-surface-100 w-72 shrink-0 rounded-xl flex flex-col max-h-full">
      <div className="p-3 font-semibold text-surface-700 flex justify-between items-center shrink-0">
        <h3>{column.title}</h3>
        <span className="bg-surface-200 text-surface-600 text-xs px-2 py-0.5 rounded-full font-medium">
          {tasks.length}
        </span>
      </div>
      
      <Droppable droppableId={column.id}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={`flex-1 overflow-y-auto p-2 min-h-[150px] transition-colors ${snapshot.isDraggingOver ? 'bg-surface-200/50' : ''}`}
          >
            {tasks.map((task, index) => (
              <TaskCard key={task.id} task={task} index={index} onClick={onTaskClick} />
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
      
      <div className="p-2 shrink-0 border-t border-surface-200">
        <button 
          onClick={() => onAddTask(column.id)}
          className="w-full flex items-center gap-2 px-3 py-2 text-sm font-medium text-surface-600 hover:text-surface-900 hover:bg-surface-200 rounded-lg transition-colors cursor-pointer"
        >
          <Plus size={16} />
          Add Task
        </button>
      </div>
    </div>
  );
}
