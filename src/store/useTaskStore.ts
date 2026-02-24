import { create } from "zustand";
import { Priority, Status, Task } from "@/types/task";

type TaskState = {
  tasks: Task[];
  setTasks: (tasks: Task[]) => void;
  addTask: (
    title: string,
    description: string,
    priority: Priority,
    status: Status
  ) => void;
  moveTask: (taskId: string, status: Status) => void;
};

const useTaskStore = create<TaskState>((set) => ({
  tasks: [],
  setTasks: (tasks) => set({ tasks }),
  addTask: (title, description, priority, status) =>
    set((state) => ({
      tasks: [
        ...state.tasks,
        {
          id: crypto.randomUUID(),
          title,
          description,
          priority,
          status,
        },
      ],
    })),
  moveTask: (taskId, status) =>
    set((state) => ({
      tasks: state.tasks.map((task) =>
        task.id === taskId ? { ...task, status } : task
      ),
    })),
}));

export default useTaskStore;
