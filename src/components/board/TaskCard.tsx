
import { Draggable } from '@hello-pangea/dnd';
import { Clock } from 'lucide-react';
import type { Task } from '../../types';
import { format, isPast } from 'date-fns';

interface TaskCardProps {
  task: Task;
  index: number;
  onClick: (task: Task) => void;
}

export function TaskCard({ task, index, onClick }: TaskCardProps) {
  const isOverdue = task.dueDate && isPast(new Date(task.dueDate));

  return (
    <Draggable draggableId={task.id} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          onClick={() => onClick(task)}
          className={`
            bg-white p-3 rounded-lg shadow-sm border mb-2 cursor-pointer
            ${snapshot.isDragging ? 'shadow-lg ring-2 ring-primary-500 border-primary-500 z-50' : 'border-surface-200 hover:border-primary-300'}
            transition-colors
          `}
        >
          <h4 className="font-medium text-sm text-surface-900 mb-1">{task.title}</h4>
          {task.description && (
            <p className="text-xs text-surface-500 line-clamp-2 mb-2">{task.description}</p>
          )}
          {task.dueDate && (
            <div className={`flex items-center gap-1 text-xs font-medium ${isOverdue ? 'text-red-500' : 'text-surface-500'}`}>
              <Clock size={12} />
              <span>{format(new Date(task.dueDate), 'MMM d, yyyy')}</span>
            </div>
          )}
        </div>
      )}
    </Draggable>
  );
}
