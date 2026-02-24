import { Priority } from "../types/task";

const priorityStyles: Record<Priority, string> = {
     HIGH: "bg-priority-high-bg text-priority-high",
     MEDIUM: "bg-priority-medium-bg text-priority-medium",
     LOW: "bg-priority-low-bg text-priority-low",
};

export const PriorityBadge = ({ priority }: { priority: Priority }) => (
     <span className={`inline-block rounded px-2 py-0.5 text-xs font-semibold uppercase tracking-wide ${priorityStyles[priority]}`}>
          {priority}
     </span>
);