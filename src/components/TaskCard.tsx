import React from 'react'

import { Task } from '@/types/task'
import { Box, Typography } from '@mui/material'
import { PriorityBadge } from './PriorityBadge'

const TaskCard = ({
     task,
     onDragStart,
}: {
     task: Task;
     onDragStart: (e: React.DragEvent, taskId: string, status: Task["status"]) => void;
}) => {
     return (
          <Box
               draggable
               onDragStart={(e) => onDragStart(e, task.id, task.status)}
               className="flex flex-col items-start gap-4 rounded-lg bg-white p-4 shadow-sm ring-1 ring-gray-200"
          >
               <Typography sx={{ fontSize: '16px', fontWeight: 600, color: '#172554' }}>
                    {task.title}
               </Typography>
               <Typography sx={{ fontSize: '12px', fontWeight: 400, color: '#4B5563' }} className="mt-2">
                    {task.description}
               </Typography>
               <PriorityBadge priority={task.priority} />
          </Box>
     );
};

export default TaskCard
