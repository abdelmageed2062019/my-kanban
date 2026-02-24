import { AppBar, Toolbar, Typography, Box, InputBase } from '@mui/material'
import SearchIcon from '@mui/icons-material/Search'
import { LayoutGrid } from 'lucide-react'

type NavbarProps = {
     title: string
     taskCountText: string;
     searchValue: string;
     onSearchChange: (value: string) => void;
}

export function Navbar({
     title,
     taskCountText,
     searchValue,
     onSearchChange,
}: NavbarProps) {
     return (
          <AppBar position="static" color='transparent' elevation={0}>
               <Toolbar className='flex items-center justify-between px-6 py-4 border border-b-gray-300'>
                    {/** Title and logo and task count */}
                    <Box className="flex items-center gap-3">
                         <Box className="flex h-10 w-10 items-center justify-center rounded-lg bg-[hsl(220_65%_54%)] text-gray-700">
                              <LayoutGrid className="h-5 w-5 text-white" />
                         </Box>

                         <Box className="flex flex-col">
                              <Typography className='!text-base !font-bold !text-gray-900'>
                                   {title}
                              </Typography>
                              <Typography className='!text-xs !font-medium !text-gray-500'>
                                   {taskCountText}
                              </Typography>
                         </Box>
                    </Box>

                    {/** Search */}
                    <Box className="flex items-center rounded-lg border border-gray-200 bg-gray-200 px-3 py-1 shadow-sm">
                         <SearchIcon className="mr-2 text-gray-500" fontSize="small" />

                         <InputBase
                              value={searchValue}
                              onChange={(e) => onSearchChange(e.target.value)}
                              placeholder="Search tasks..."
                              className="w-64 text-sm text-gray-700"
                              inputProps={{ "aria-label": "search tasks" }}
                         />
                    </Box>
               </Toolbar>
          </AppBar >
     )
}
