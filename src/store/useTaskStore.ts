import { create } from "zustand";
import { Priority, Status, Task } from "@/types/task";

type TaskState = {
  tasks: Task[];
  setTasks: (tasks: Task[]) => void;
  addTaskLocal: (task: Task) => void;
  replaceTask: (tempId: string, task: Task) => void;
  removeTask: (taskId: string) => void;
  updateTaskStatus: (taskId: string, status: Status) => void;
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
  addTaskLocal: (task) =>
    set((state) => ({
      tasks: [task, ...state.tasks],
    })),
  replaceTask: (tempId, task) =>
    set((state) => ({
      tasks: state.tasks.map((item) => (item.id === tempId ? task : item)),
    })),
  removeTask: (taskId) =>
    set((state) => ({
      tasks: state.tasks.filter((task) => task.id !== taskId),
    })),
  updateTaskStatus: (taskId, status) =>
    set((state) => ({
      tasks: state.tasks.map((task) =>
        task.id === taskId ? { ...task, status } : task
      ),
    })),
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
