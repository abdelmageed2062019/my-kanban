import { Task, Column, Priority, Status } from "../types/task";
import TaskCard from "./TaskCard";
import AddTaskForm from "./AddTaskForm";
import { Badge, Box, Typography } from "@mui/material";



interface ColumnProps {
     column: Column;
     tasks: Task[];
     onDragStart: (e: React.DragEvent, taskId: string) => void;
     onDrop: (e: React.DragEvent, status: Status) => void;
     onDragOver: (e: React.DragEvent) => void;
     onAddTask: (title: string, description: string, priority: Priority, status: Status) => void;
}

export const KanbanColumn = ({ column, tasks, onDragStart, onDrop, onDragOver, onAddTask }: ColumnProps) => (
     <Box
          onDrop={(e) => onDrop(e, column.id)}
          onDragOver={onDragOver}
          className="flex min-h-[200px] w-80 shrink-0 flex-col rounded-xl bg-column p-3"
     >
          <Box className="mb-3 flex items-center gap-2 px-1">
               <Badge className={`h-2.5 w-2.5 rounded-full ${column.dotColor}`} />
               <Typography sx={{ fontSize: '14px', fontWeight: 600, color: '#172554' }}>{column.title}</Typography>
               <Typography sx={{ fontSize: '12px', fontWeight: 500, color: '#64748B' }}>{tasks.length}</Typography>
          </Box>
          <Box className="flex flex-1 flex-col gap-2.5">
               {tasks.map((task) => (
                    <TaskCard key={task.id} task={task} onDragStart={onDragStart} />
               ))}
               <AddTaskForm status={column.id} onAdd={onAddTask} />
          </Box>
     </Box>
);