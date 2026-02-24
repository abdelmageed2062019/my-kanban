import React from 'react'

import { Task } from '@/types/task'
import { Box, Typography } from '@mui/material'
import { PriorityBadge } from './PriorityBadge'

const TaskCard = ({
     task,
     onDragStart,
}: {
     task: Task;
     onDragStart: (e: React.DragEvent, taskId: string) => void;
}) => {
     return (
          <Box
               draggable
               onDragStart={(e) => onDragStart(e, task.id)}
               className="rounded-lg bg-white p-4 shadow-sm ring-1 ring-gray-200"
          >
               <Box className="flex items-start justify-between gap-3">
                    <Typography sx={{ fontSize: '14px', fontWeight: 600, color: '#172554' }}>
                         {task.title}
                    </Typography>
                    <PriorityBadge priority={task.priority} />
               </Box>
               <Typography sx={{ fontSize: '12px', fontWeight: 400, color: '#4B5563' }} className="mt-2">
                    {task.description}
               </Typography>
          </Box>
     );
};

export default TaskCard
