export type Priority = "HIGH" | "MEDIUM" | "LOW";
export type Status = "backlog" | "todo" | "inprogress" | "done";

export interface Task {
     id: string;
     title: string;
     description: string;
     priority: Priority;
     status: Status;
}

export interface Column {
     id: Status;
     title: string;
     dotColor: string;
}
