"use client";

import * as React from "react";
import { useInfiniteQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Badge, Box, Typography } from "@mui/material";
import { Column, Priority, Status, Task } from "../types/task";
import TaskCard from "./TaskCard";
import AddTaskForm from "./AddTaskForm";
import { toast } from "react-toastify";

type ApiTask = {
     id: string | number;
     title: string;
     description: string;
     column: Status;
     priority?: Priority;
};

type ApiTaskPage = {
     items: ApiTask[];
     total: number;
};

interface ColumnProps {
     column: Column;
     searchQuery: string;
     onDragStart: (e: React.DragEvent, taskId: string, status: Status) => void;
     onDrop: (e: React.DragEvent, status: Status) => void;
     onDragOver: (e: React.DragEvent) => void;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";
const TASK_PAGE_SIZE = 10;

export const KanbanColumn = ({ column, searchQuery, onDragStart, onDrop, onDragOver }: ColumnProps) => {
     const queryClient = useQueryClient();
     const sentinelRef = React.useRef<HTMLDivElement | null>(null);

     const {
          data,
          isLoading,
          isError,
          fetchNextPage,
          hasNextPage,
          isFetchingNextPage,
     } = useInfiniteQuery({
          queryKey: ["tasks", column.id],
          queryFn: async ({ pageParam = 1 }): Promise<ApiTaskPage> => {
               const response = await fetch(
                    `${API_BASE_URL}/tasks?column=${column.id}&_page=${pageParam}&_per_page=${TASK_PAGE_SIZE}`
               );
               if (!response.ok) {
                    throw new Error("Failed to fetch tasks");
               }
               const json = (await response.json()) as {
                    data?: ApiTask[];
                    items?: number;
               } | ApiTask[];
               const items = Array.isArray(json) ? json : json.data ?? [];
               const total =
                    typeof json === "object" && !Array.isArray(json) && typeof json.items === "number"
                         ? json.items
                         : Number(response.headers.get("X-Total-Count") ?? items.length);
               return { items, total };
          },
          getNextPageParam: (lastPage, allPages) => {
               const loaded = allPages.reduce((count, page) => count + page.items.length, 0);
               if (loaded < lastPage.total) {
                    return allPages.length + 1;
               }
               return undefined;
          },
          initialPageParam: 1,
     });

     React.useEffect(() => {
          const node = sentinelRef.current;
          if (!node || !hasNextPage) return;

          const observer = new IntersectionObserver(
               (entries) => {
                    if (entries[0]?.isIntersecting) {
                         fetchNextPage();
                    }
               },
               { root: null, rootMargin: "120px", threshold: 0 }
          );

          observer.observe(node);
          return () => observer.disconnect();
     }, [fetchNextPage, hasNextPage]);

     const createTaskMutation = useMutation({
          mutationFn: async (payload: {
               title: string;
               description: string;
               priority: Priority;
               status: Status;
          }) => {
               const response = await fetch(`${API_BASE_URL}/tasks`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                         title: payload.title,
                         description: payload.description,
                         priority: payload.priority,
                         column: payload.status,
                    }),
               });
               if (!response.ok) {
                    throw new Error("Failed to create task");
               }
               return response.json() as Promise<ApiTask>;
          },
          onMutate: (payload) => {
               const tempId = `temp-${crypto.randomUUID()}`;
               queryClient.setQueryData(
                    ["tasks", column.id],
                    (oldData: { pages: ApiTaskPage[]; pageParams: unknown[] } | undefined) => {
                         const tempTask: ApiTask = {
                              id: tempId as unknown as number,
                              title: payload.title,
                              description: payload.description,
                              priority: payload.priority,
                              column: payload.status,
                         };

                         if (!oldData) {
                              return { pages: [{ items: [tempTask], total: 1 }], pageParams: [1] };
                         }

                         const pages = [...oldData.pages];
                         const firstPage = pages[0] ?? { items: [], total: 0 };
                         pages[0] = {
                              ...firstPage,
                              items: [tempTask, ...firstPage.items],
                              total: firstPage.total + 1,
                         };
                         return { ...oldData, pages };
                    }
               );

               return { tempId };
          },
          onError: (_error, _payload, context) => {
               if (!context?.tempId) return;
               queryClient.setQueryData(
                    ["tasks", column.id],
                    (oldData: { pages: ApiTaskPage[]; pageParams: unknown[] } | undefined) => {
                         if (!oldData) return oldData;
                         const pages = oldData.pages.map((page) => ({
                              ...page,
                              items: page.items.filter((item) => String(item.id) !== context.tempId),
                         }));
                         return { ...oldData, pages };
                    }
               );
               toast.error("Failed to add task");
          },
          onSuccess: (data, _payload, context) => {
               if (!context?.tempId) return;
               queryClient.setQueryData(
                    ["tasks", column.id],
                    (oldData: { pages: ApiTaskPage[]; pageParams: unknown[] } | undefined) => {
                         if (!oldData) return oldData;
                         const pages = oldData.pages.map((page) => ({
                              ...page,
                              items: page.items.map((item) =>
                                   String(item.id) === context.tempId ? data : item
                              ),
                         }));
                         return { ...oldData, pages };
                    }
               );
               toast.success("Task added");
          },
          onSettled: () => {
               queryClient.invalidateQueries({ queryKey: ["tasks", column.id] });
               queryClient.invalidateQueries({ queryKey: ["taskCount"] });
          },
     });

     const tasks: Task[] =
          data?.pages.flatMap((page) => {
               const pageItems = Array.isArray((page as ApiTaskPage).items)
                    ? (page as ApiTaskPage).items
                    : Array.isArray(page)
                         ? (page as ApiTask[])
                         : [];

               return pageItems.map((task) => ({
                    id: String(task.id),
                    title: task.title,
                    description: task.description ?? "",
                    priority: task.priority ?? "MEDIUM",
                    status: task.column,
               }));
          }) ?? [];

     const normalizedQuery = searchQuery.trim().toLowerCase();
     const visibleTasks = normalizedQuery
          ? tasks.filter((task) => {
               const title = task.title.toLowerCase();
               const description = task.description.toLowerCase();
               return title.includes(normalizedQuery) || description.includes(normalizedQuery);
          })
          : tasks;

     return (
          <Box
               onDrop={(e) => onDrop(e, column.id)}
               onDragOver={onDragOver}
               className="flex min-h-[200px] w-80 shrink-0 flex-col rounded-xl bg-column p-3"
          >
               <Box className="mb-3 flex items-center gap-2 px-1">
                    <Badge className={`h-2.5 w-2.5 rounded-full ${column.dotColor}`} />
                    <Typography sx={{ fontSize: "14px", fontWeight: 600, color: "#172554" }}>
                         {column.title}
                    </Typography>
                    <Typography sx={{ fontSize: "12px", fontWeight: 500, color: "#64748B" }}>
                         {visibleTasks.length}
                    </Typography>
               </Box>
               <Box className="flex flex-1 flex-col gap-2.5">
                    {isLoading && (
                         <Typography sx={{ fontSize: "12px", color: "#64748B" }}>
                              Loading tasks...
                         </Typography>
                    )}
                    {isError && (
                         <Typography sx={{ fontSize: "12px", color: "#F87171" }}>
                              Failed to load tasks.
                         </Typography>
                    )}
                    {visibleTasks.map((task) => (
                         <TaskCard key={task.id} task={task} onDragStart={onDragStart} />
                    ))}
                    <div ref={sentinelRef} />
                    {isFetchingNextPage && (
                         <Typography sx={{ fontSize: "12px", color: "#64748B" }}>
                              Loading more...
                         </Typography>
                    )}
                    <AddTaskForm
                         status={column.id}
                         onAdd={(title, description, priority, status) =>
                              createTaskMutation.mutate({ title, description, priority, status })
                         }
                    />
               </Box>
          </Box>
     );
};
