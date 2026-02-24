"use client";

import * as React from "react";
import { Box } from "@mui/material";
import { useQuery } from "@tanstack/react-query";
import { KanbanColumn } from "./Column";
import useTaskStore from "@/store/useTaskStore";
import { Column, Priority, Status, Task } from "@/types/task";

type ApiColumn = {
     id: number;
     name: string;
     status: Status;
};

type ApiTask = {
     id: number;
     title: string;
     description: string;
     column: Status;
     priority?: Priority;
};

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

const statusDotColor: Record<Status, string> = {
     backlog: "bg-slate-400",
     todo: "bg-blue-500",
     inprogress: "bg-amber-500",
     done: "bg-emerald-500",
};

const Board = () => {
     const tasks = useTaskStore((state) => state.tasks);
     const setTasks = useTaskStore((state) => state.setTasks);
     const addTask = useTaskStore((state) => state.addTask);
     const moveTask = useTaskStore((state) => state.moveTask);

     const {
          data: columnData,
          isLoading: columnsLoading,
          isError: columnsError,
     } = useQuery({
          queryKey: ["columns"],
          queryFn: async (): Promise<ApiColumn[]> => {
               const response = await fetch(`${API_BASE_URL}/columns`);
               if (!response.ok) {
                    throw new Error("Failed to fetch columns");
               }
               return response.json();
          },
     });

     const {
          data: taskData,
          isLoading: tasksLoading,
          isError: tasksError,
     } = useQuery({
          queryKey: ["tasks"],
          queryFn: async (): Promise<ApiTask[]> => {
               const response = await fetch(`${API_BASE_URL}/tasks`);
               if (!response.ok) {
                    throw new Error("Failed to fetch tasks");
               }
               return response.json();
          },
     });

     React.useEffect(() => {
          if (!taskData) return;
          const normalizedTasks: Task[] = taskData.map((task) => ({
               id: String(task.id),
               title: task.title,
               description: task.description ?? "",
               priority: task.priority ?? "MEDIUM",
               status: task.column,
          }));
          setTasks(normalizedTasks);
     }, [taskData, setTasks]);

     const columns: Column[] =
          columnData?.map((column) => ({
               id: column.status,
               title: column.name,
               dotColor: statusDotColor[column.status] ?? "bg-slate-400",
          })) ?? [];

     if (columnsLoading || tasksLoading) {
          return (
               <Box sx={{ padding: 6, fontSize: "14px", color: "#4B5563" }}>
                    Loading board...
               </Box>
          );
     }

     if (columnsError || tasksError) {
          return (
               <Box sx={{ padding: 6, fontSize: "14px", color: "#F87171" }}>
                    Failed to load board.
               </Box>
          );
     }

     const onDragStart = (e: React.DragEvent, taskId: string) => {
          e.dataTransfer.setData("text/plain", taskId);
     };

     const onDrop = (e: React.DragEvent, status: Status) => {
          const taskId = e.dataTransfer.getData("text/plain");
          if (!taskId) return;
          moveTask(taskId, status);
     };

     const onDragOver = (e: React.DragEvent) => {
          e.preventDefault();
     };

     return (
          <Box className="flex-1 overflow-x-auto p-6">
               <Box className="flex gap-5">
                    {columns.map((column) => (
                         <KanbanColumn
                              key={column.id}
                              column={column}
                              tasks={tasks.filter((task) => task.status === column.id)}
                              onDragStart={onDragStart}
                              onDrop={onDrop}
                              onDragOver={onDragOver}
                              onAddTask={addTask}
                         />
                    ))}
               </Box>
          </Box>
     );
};

export default Board
