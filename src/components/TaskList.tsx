import { TaskItem } from "./TaskItem";
import type { Task, TaskFormValues } from "../types/task";

interface TaskListProps {
  tasks: Task[];
  onToggle: (task: Task) => void;
  onSave: (task: Task, values: TaskFormValues) => Promise<void>;
  onDelete: (task: Task) => Promise<void>;
}

export function TaskList({ tasks, onToggle, onSave, onDelete }: TaskListProps) {
  if (tasks.length === 0) {
    return <p>No tenés tareas todavía. Creá la primera arriba.</p>;
  }

  return (
    <ul>
      {tasks.map((task) => (
        <TaskItem
          key={task.id}
          task={task}
          onToggle={() => onToggle(task)}
          onSave={(values) => onSave(task, values)}
          onDelete={() => onDelete(task)}
        />
      ))}
    </ul>
  );
}
