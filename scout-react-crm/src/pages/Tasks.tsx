import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Chip,
  Checkbox,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Tabs,
  Tab,
  Divider,
} from '@mui/material'
import { Add, CheckCircle, RadioButtonUnchecked, AutoAwesome } from '@mui/icons-material'
import { tasksApi, aiApi } from '../services/api'
import { formatDate } from '../utils/formatters'

const Tasks: React.FC = () => {
  const queryClient = useQueryClient()
  const [activeTab, setActiveTab] = useState(0)
  const [openModal, setOpenModal] = useState(false)
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    priority: 'medium',
    due_date: '',
  })

  const { data: tasks, isLoading } = useQuery({
    queryKey: ['tasks'],
    queryFn: () => tasksApi.getAll({ status: activeTab === 0 ? 'open' : 'completed' }),
  })

  const { data: aiSuggestions } = useQuery({
    queryKey: ['ai-tasks'],
    queryFn: aiApi.generateTasks,
    enabled: activeTab === 0,
  })

  const completeMutation = useMutation({
    mutationFn: tasksApi.complete,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['tasks'] }),
  })

  const createMutation = useMutation({
    mutationFn: tasksApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] })
      setOpenModal(false)
      setNewTask({ title: '', description: '', priority: 'medium', due_date: '' })
    },
  })

  const priorityColors: Record<string, 'error' | 'warning' | 'info' | 'success'> = {
    urgent: 'error',
    high: 'warning',
    medium: 'info',
    low: 'success',
  }

  const renderTaskItem = (task: any) => (
    <ListItem
      key={task.id}
      sx={{
        mb: 1,
        borderRadius: 2,
        borderLeft: 4,
        borderLeftColor: priorityColors[task.priority] + '.main',
        bgcolor: 'background.paper',
        boxShadow: 1,
      }}
    >
      <ListItemButton onClick={() => task.status !== 'completed' && completeMutation.mutate(task.id)}>
        <ListItemIcon>
          {task.status === 'completed' ? (
            <CheckCircle color="success" />
          ) : (
            <RadioButtonUnchecked />
          )}
        </ListItemIcon>
        <ListItemText
          primary={
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography
                sx={{
                  textDecoration: task.status === 'completed' ? 'line-through' : 'none',
                  color: task.status === 'completed' ? 'text.secondary' : 'text.primary',
                }}
              >
                {task.title}
              </Typography>
              {task.ai_suggested && (
                <Chip
                  size="small"
                  icon={<AutoAwesome sx={{ fontSize: 14 }} />}
                  label="AI"
                  color="secondary"
                  variant="outlined"
                />
              )}
            </Box>
          }
          secondary={
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
              <Chip size="small" label={task.priority} color={priorityColors[task.priority]} />
              {task.due_date && <Typography variant="caption">{formatDate(task.due_date)}</Typography>}
            </Box>
          }
        />
      </ListItemButton>
    </ListItem>
  )

  return (
    <Box sx={{ maxWidth: 1000, mx: 'auto' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4" fontWeight="bold">
          Tasks
        </Typography>
        <Button variant="contained" startIcon={<Add />} onClick={() => setOpenModal(true)}>
          New Task
        </Button>
      </Box>

      <Card>
        <Tabs value={activeTab} onChange={(_, v) => setActiveTab(v)} sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tab label="Open" />
          <Tab label="Completed" />
        </Tabs>

        <CardContent>
          {activeTab === 0 && aiSuggestions?.suggestions?.length > 0 && (
            <>
              <Typography variant="subtitle2" color="secondary.main" gutterBottom>
                <AutoAwesome sx={{ fontSize: 16, mr: 0.5 }} />
                AI Suggested Tasks
              </Typography>
              <List>
                {aiSuggestions.suggestions.slice(0, 3).map((suggestion: any) => (
                  <ListItem key={suggestion.title} sx={{ bgcolor: 'action.hover', borderRadius: 2, mb: 1 }}>
                    <ListItemText
                      primary={suggestion.title}
                      secondary={suggestion.reason}
                    />
                    <Button size="small" variant="outlined">
                      Add
                    </Button>
                  </ListItem>
                ))}
              </List>
              <Divider sx={{ my: 2 }} />
            </>
          )}

          <List>{tasks?.map(renderTaskItem)}</List>
        </CardContent>
      </Card>

      <Dialog open={openModal} onClose={() => setOpenModal(false)} maxWidth="sm" fullWidth>
        <DialogTitle>New Task</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              label="Task Title"
              fullWidth
              value={newTask.title}
              onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
            />
            <TextField
              label="Description"
              fullWidth
              multiline
              rows={2}
              value={newTask.description}
              onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
            />
            <TextField
              select
              label="Priority"
              fullWidth
              value={newTask.priority}
              onChange={(e) => setNewTask({ ...newTask, priority: e.target.value })}
            >
              <MenuItem value="low">Low</MenuItem>
              <MenuItem value="medium">Medium</MenuItem>
              <MenuItem value="high">High</MenuItem>
              <MenuItem value="urgent">Urgent</MenuItem>
            </TextField>
            <TextField
              label="Due Date"
              type="date"
              fullWidth
              InputLabelProps={{ shrink: true }}
              value={newTask.due_date}
              onChange={(e) => setNewTask({ ...newTask, due_date: e.target.value })}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenModal(false)}>Cancel</Button>
          <Button variant="contained" onClick={() => createMutation.mutate(newTask)} disabled={!newTask.title}>
            Create
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

export default Tasks
