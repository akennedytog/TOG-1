import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Chip,
  Avatar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Grid,
  MenuItem,
  IconButton,
  Tooltip,
} from '@mui/material'
import {
  Add,
  MoreVert,
  TrendingUp,
  AttachMoney,
  FilterList,
} from '@mui/icons-material'
import { Link } from 'react-router-dom'
import { dealsApi, accountsApi } from '../services/api'
import { formatCurrency } from '../utils/formatters'

const stages = [
  { id: 'prospecting', name: 'Prospecting', color: '#64748b' },
  { id: 'qualification', name: 'Qualification', color: '#3b82f6' },
  { id: 'proposal', name: 'Proposal', color: '#8b5cf6' },
  { id: 'negotiation', name: 'Negotiation', color: '#f59e0b' },
  { id: 'closed_won', name: 'Closed Won', color: '#10b981' },
  { id: 'closed_lost', name: 'Closed Lost', color: '#ef4444' },
]

const DealCard: React.FC<{ deal: any; onDragStart: (e: React.DragEvent, dealId: string) => void }> = ({ deal, onDragStart }) => (
  <Card
    draggable
    onDragStart={(e) => onDragStart(e, deal.id)}
    component={Link}
    to={`/deals/${deal.id}`}
    sx={{
      mb: 2,
      cursor: 'grab',
      transition: 'all 0.2s',
      '&:hover': {
        transform: 'translateY(-4px)',
        boxShadow: '0 8px 25px rgba(0,0,0,0.2)',
      },
      '&:active': {
        cursor: 'grabbing',
      },
    }}
  >
    <CardContent sx={{ p: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
        <Typography variant="subtitle2" fontWeight={600} noWrap sx={{ flex: 1, mr: 1 }}>
          {deal.name}
        </Typography>
        <Chip
          size="small"
          label={`${deal.probability || 0}%`}
          sx={{
            bgcolor: 
              deal.probability >= 70 ? 'success.light' :
              deal.probability >= 40 ? 'warning.light' : 'error.light',
            color: 'white',
            fontWeight: 600,
            fontSize: '0.7rem',
          }}
        />
      </Box>

      <Typography variant="caption" color="text.secondary" display="block" gutterBottom>
        {deal.account_name || 'No account'}
      </Typography>

      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 2 }}>
        <Typography variant="subtitle2" fontWeight={700} color="primary.main">
          {formatCurrency(deal.value)}
        </Typography>

        {deal.expected_close_date && (
          <Typography variant="caption" color="text.secondary">
            {new Date(deal.expected_close_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
          </Typography>
        )}
      </Box>
    </CardContent>
  </Card>
)

const Pipeline: React.FC = () => {
  const queryClient = useQueryClient()
  const [openModal, setOpenModal] = useState(false)
  const [newDeal, setNewDeal] = useState({
    name: '',
    account_id: '',
    value: '',
    stage: 'prospecting',
    expected_close_date: '',
  })

  const { data: deals, isLoading } = useQuery({
    queryKey: ['deals'],
    queryFn: dealsApi.getAll,
  })

  const { data: accounts } = useQuery({
    queryKey: ['accounts'],
    queryFn: accountsApi.getAll,
  })

  const createDealMutation = useMutation({
    mutationFn: dealsApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['deals'] })
      setOpenModal(false)
      setNewDeal({ name: '', account_id: '', value: '', stage: 'prospecting', expected_close_date: '' })
    },
  })

  const updateDealMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<any> }) => dealsApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['deals'] })
    },
  })

  const handleDragStart = (e: React.DragEvent, dealId: string) => {
    e.dataTransfer.setData('dealId', dealId)
  }

  const handleDrop = (e: React.DragEvent, stageId: string) => {
    e.preventDefault()
    const dealId = e.dataTransfer.getData('dealId')
    if (dealId) {
      updateDealMutation.mutate({ id: dealId, data: { stage: stageId } })
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
  }

  const handleCreateDeal = () => {
    createDealMutation.mutate({
      ...newDeal,
      value: parseFloat(newDeal.value) || 0,
    })
  }

  if (isLoading) {
    return <Typography>Loading pipeline...</Typography>
  }

  return (
    <Box sx={{ maxWidth: 1600, mx: 'auto' }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Box>
          <Typography variant="h4" fontWeight="bold" gutterBottom>
            Pipeline
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Drag and drop deals to move them between stages
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="outlined"
            startIcon={<FilterList />}
          >
            Filter
          </Button>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => setOpenModal(true)}
          >
            New Deal
          </Button>
        </Box>
      </Box>

      {/* Pipeline Board */}
      <Box
        sx={{
          display: 'flex',
          gap: 3,
          overflowX: 'auto',
          pb: 2,
          '&::-webkit-scrollbar': {
            height: 8,
          },
          '&::-webkit-scrollbar-track': {
            backgroundColor: 'background.paper',
            borderRadius: 4,
          },
          '&::-webkit-scrollbar-thumb': {
            backgroundColor: 'primary.main',
            borderRadius: 4,
          },
        }}
      >
        {stages.map((stage) => {
          const stageDeals = deals?.filter((d: any) => d.stage === stage.id) || []
          const stageValue = stageDeals.reduce((sum: number, d: any) => sum + (d.value || 0), 0)

          return (
            <Box
              key={stage.id}
              onDrop={(e) => handleDrop(e, stage.id)}
              onDragOver={handleDragOver}
              sx={{
                minWidth: 300,
                maxWidth: 300,
                flexShrink: 0,
              }}
            >
              {/* Stage Header */}
              <Box
                sx={{
                  p: 2,
                  mb: 2,
                  borderRadius: 2,
                  backgroundColor: `${stage.color}20`,
                  borderTop: `4px solid ${stage.color}`,
                }}
              >
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="subtitle1" fontWeight={600}>
                    {stage.name}
                  </Typography>
                  
                  <Chip
                    size="small"
                    label={stageDeals.length}
                    sx={{ bgcolor: stage.color, color: 'white', fontWeight: 600 }}
                  />
                </Box>
                
                <Typography variant="caption" color="text.secondary">
                  {formatCurrency(stageValue)}
                </Typography>
              </Box>

              {/* Deals */}
              <Box sx={{ minHeight: 400 }}>
                {stageDeals.map((deal: any) => (
                  <DealCard
                    key={deal.id}
                    deal={deal}
                    onDragStart={handleDragStart}
                  />
                ))}
              </Box>
            </Box>
          )
        })}
      </Box>

      {/* Create Deal Modal */}
      <Dialog open={openModal} onClose={() => setOpenModal(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Create New Deal</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              label="Deal Name"
              fullWidth
              value={newDeal.name}
              onChange={(e) => setNewDeal({ ...newDeal, name: e.target.value })}
            />

            <TextField
              select
              label="Account"
              fullWidth
              value={newDeal.account_id}
              onChange={(e) => setNewDeal({ ...newDeal, account_id: e.target.value })}
            >
              <MenuItem value=""><em>Select Account</em></MenuItem>
              {accounts?.map((account: any) => (
                <MenuItem key={account.id} value={account.id}>
                  {account.name}
                </MenuItem>
              ))}
            </TextField>

            <TextField
              label="Deal Value"
              type="number"
              fullWidth
              value={newDeal.value}
              onChange={(e) => setNewDeal({ ...newDeal, value: e.target.value })}
              InputProps={{
                startAdornment: <Typography sx={{ mr: 1 }}>$</Typography>,
              }}
            />

            <TextField
              select
              label="Stage"
              fullWidth
              value={newDeal.stage}
              onChange={(e) => setNewDeal({ ...newDeal, stage: e.target.value })}
            >
              {stages.filter(s => s.id !== 'closed_won' && s.id !== 'closed_lost').map((stage) => (
                <MenuItem key={stage.id} value={stage.id}>
                  {stage.name}
                </MenuItem>
              ))}
            </TextField>

            <TextField
              label="Expected Close Date"
              type="date"
              fullWidth
              InputLabelProps={{ shrink: true }}
              value={newDeal.expected_close_date}
              onChange={(e) => setNewDeal({ ...newDeal, expected_close_date: e.target.value })}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenModal(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleCreateDeal}
            disabled={!newDeal.name || !newDeal.account_id}
          >
            Create Deal
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

export default Pipeline
