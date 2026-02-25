"use client";

import * as React from "react";
import { Box } from "@mui/material";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { KanbanColumn } from "./Column";
import { Column, Status } from "@/types/task";

type ApiColumn = {
     id: number;
     name: string;
     status: Status;
};

type ApiTask = {
     id: string | number;
     title: string;
     description: string;
     column: Status;
     priority?: string;
};

type ApiTaskPage = {
     items: ApiTask[];
     total: number;
};

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

const statusDotColor: Record<Status, string> = {
     backlog: "bg-slate-400",
     todo: "bg-blue-500",
     inprogress: "bg-amber-500",
     done: "bg-emerald-500",
};

const Board = () => {
     const queryClient = useQueryClient();

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

     const updateTaskMutation = useMutation({
          mutationFn: async (payload: { taskId: string; fromStatus: Status; toStatus: Status }) => {
               const response = await fetch(
                    `${API_BASE_URL}/tasks/${encodeURIComponent(payload.taskId)}`,
                    {
                         method: "PATCH",
                         headers: { "Content-Type": "application/json" },
                         body: JSON.stringify({ column: payload.toStatus }),
                    }
               );
               if (!response.ok) {
                    throw new Error("Failed to update task");
               }
               return response.json() as Promise<ApiTask>;
          },
          onMutate: async (payload: {
               taskId: string;
               fromStatus: Status;
               toStatus: Status;
          }) => {
               const sourceKey = ["tasks", payload.fromStatus];
               const targetKey = ["tasks", payload.toStatus];

               await queryClient.cancelQueries({ queryKey: sourceKey });
               await queryClient.cancelQueries({ queryKey: targetKey });

               const previousSource =
                    queryClient.getQueryData<{ pages: ApiTaskPage[]; pageParams: unknown[] }>(
                         sourceKey
                    );
               const previousTarget =
                    queryClient.getQueryData<{ pages: ApiTaskPage[]; pageParams: unknown[] }>(
                         targetKey
                    );

               let movedTask: ApiTask | undefined;
               if (previousSource) {
                    let removed = false;
                    const pages = previousSource.pages.map((page) => {
                         const items = page.items.filter((item) => {
                              if (!removed && String(item.id) === payload.taskId) {
                                   movedTask = item;
                                   removed = true;
                                   return false;
                              }
                              return true;
                         });
                         const total = removed ? Math.max(page.total - 1, 0) : page.total;
                         return { ...page, items, total };
                    });
                    queryClient.setQueryData(sourceKey, { ...previousSource, pages });
               }

               if (movedTask) {
                    const updatedTask: ApiTask = {
                         id: movedTask.id,
                         title: movedTask.title,
                         description: movedTask.description,
                         priority: movedTask.priority,
                         column: payload.toStatus,
                    };
                    queryClient.setQueryData(
                         targetKey,
                         (oldData: { pages: ApiTaskPage[]; pageParams: unknown[] } | undefined) => {
                              if (!oldData) {
                                   return { pages: [{ items: [updatedTask], total: 1 }], pageParams: [1] };
                              }
                              const pages = [...oldData.pages];
                              const firstPage = pages[0] ?? { items: [], total: 0 };
                              pages[0] = {
                                   ...firstPage,
                                   items: [updatedTask, ...firstPage.items],
                                   total: firstPage.total + 1,
                              };
                              return { ...oldData, pages };
                         }
                    );
               }

               return { previousSource, previousTarget, sourceKey, targetKey };
          },
          onError: (_error, _payload, context) => {
               if (!context) return;
               if (context.previousSource) {
                    queryClient.setQueryData(context.sourceKey, context.previousSource);
               }
               if (context.previousTarget) {
                    queryClient.setQueryData(context.targetKey, context.previousTarget);
               }
          },
          onSettled: (_data, _error, variables) => {
               if (!variables) return;
               queryClient.invalidateQueries({ queryKey: ["tasks", variables.fromStatus] });
               queryClient.invalidateQueries({ queryKey: ["tasks", variables.toStatus] });
          },
     });

     const columns: Column[] =
          columnData?.map((column) => ({
               id: column.status,
               title: column.name,
               dotColor: statusDotColor[column.status] ?? "bg-slate-400",
          })) ?? [];

     if (columnsLoading) {
          return (
               <Box sx={{ padding: 6, fontSize: "14px", color: "#4B5563" }}>
                    Loading board...
               </Box>
          );
     }

     if (columnsError) {
          return (
               <Box sx={{ padding: 6, fontSize: "14px", color: "#F87171" }}>
                    Failed to load board.
               </Box>
          );
     }

     const onDragStart = (e: React.DragEvent, taskId: string, status: Status) => {
          e.dataTransfer.setData("taskId", taskId);
          e.dataTransfer.setData("fromStatus", status);
     };

     const onDrop = (e: React.DragEvent, status: Status) => {
          const taskId = e.dataTransfer.getData("taskId");
          const fromStatus = e.dataTransfer.getData("fromStatus") as Status;
          if (!taskId || !fromStatus) return;
          if (taskId.startsWith("temp-")) return;
          if (fromStatus === status) return;
          updateTaskMutation.mutate({ taskId, fromStatus, toStatus: status });
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
                              onDragStart={onDragStart}
                              onDrop={onDrop}
                              onDragOver={onDragOver}
                         />
                    ))}
               </Box>
          </Box>
     );
};

export default Board;
