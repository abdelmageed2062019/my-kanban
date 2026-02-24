import * as React from "react";
import { Priority, Status } from "@/types/task";
import { Box, Button, MenuItem, TextField, Stack } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";

const AddTaskForm = ({
     status,
     onAdd,
}: {
     status: Status;
     onAdd: (
          title: string,
          description: string,
          priority: Priority,
          status: Status
     ) => void;
}) => {
     const [isEditing, setIsEditing] = React.useState(false);
     const [title, setTitle] = React.useState("");
     const [description, setDescription] = React.useState("");
     const [priority, setPriority] = React.useState<Priority>("MEDIUM");

     const handleClose = () => {
          setIsEditing(false);
          setTitle("");
          setDescription("");
          setPriority("MEDIUM");
     };

     const handleSubmit = (e: React.FormEvent) => {
          e.preventDefault();
          if (!title.trim()) return;
          onAdd(title, description, priority, status);
          handleClose();
     };

     // 1. The "Ghost" Button (Initial State)
     if (!isEditing) {
          return (
               <Button
                    fullWidth
                    onClick={() => setIsEditing(true)}
                    startIcon={<AddIcon />}
                    className="normal-case"
                    sx={{
                         py: 1,
                         borderWidth: 2,
                         borderStyle: "dashed",
                         borderColor: "#d1d5db",
                         color: "#6b7280",
                         textTransform: "none",
                         transition: "all 150ms ease",
                         "&:hover": {
                              backgroundColor: "#f9fafb",
                              borderColor: "#60a5fa",
                         },
                    }}
               >
                    Add Task
               </Button>
          );
     }

     // 2. The Form State
     return (
          <Box
               component="form"
               onSubmit={handleSubmit}
               className="flex flex-col gap-3 rounded-lg border border-blue-200 bg-blue-50/30 p-3 shadow-sm"
          >
               <TextField
                    autoFocus
                    size="small"
                    fullWidth
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="What needs to be done?"
                    className="bg-white"
                    variant="outlined"
               />

               <TextField
                    size="small"
                    fullWidth
                    multiline
                    rows={2}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Add a description..."
                    className="bg-white"
               />

               <TextField
                    size="small"
                    select
                    fullWidth
                    label="Priority"
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as Priority)}
                    className="bg-white"
               >
                    <MenuItem value="HIGH">High</MenuItem>
                    <MenuItem value="MEDIUM">Medium</MenuItem>
                    <MenuItem value="LOW">Low</MenuItem>
               </TextField>

               <Stack direction="row" spacing={1} justifyContent="flex-end">
                    <Button
                         size="small"
                         onClick={handleClose}
                         color="inherit"
                         className="normal-case"
                         sx={{
                              color: '#172554',
                              borderColor: '#172554',
                              '&:hover': {
                                   backgroundColor: '#172554',
                                   color: '#fff',
                              },
                         }}
                    >
                         Cancel
                    </Button>
                    <Button
                         type="submit"
                         variant="contained"
                         size="small"
                         className="normal-case"
                         disabled={!title.trim()}
                    >
                         Add Task
                    </Button>
               </Stack>
          </Box>
     );
};

export default AddTaskForm;
