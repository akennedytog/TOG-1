import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Grid,
  Chip,
  LinearProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
} from '@mui/material'
import { Add, Business } from '@mui/icons-material'
import { Link } from 'react-router-dom'
import { accountsApi } from '../services/api'
import { formatCurrency } from '../utils/formatters'

const Accounts: React.FC = () => {
  const queryClient = useQueryClient()
  const [openModal, setOpenModal] = useState(false)
  const [newAccount, setNewAccount] = useState({
    name: '',
    industry: '',
    size: '',
    website: '',
  })

  const { data: accounts, isLoading } = useQuery({
    queryKey: ['accounts'],
    queryFn: accountsApi.getAll,
  })

  const createMutation = useMutation({
    mutationFn: accountsApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['accounts'] })
      setOpenModal(false)
      setNewAccount({ name: '', industry: '', size: '', website: '' })
    },
  })

  if (isLoading) return <Typography>Loading...</Typography>

  return (
    <Box sx={{ maxWidth: 1400, mx: 'auto' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Box>
          <Typography variant="h4" fontWeight="bold" gutterBottom>Accounts</Typography>
          <Typography variant="body1" color="text.secondary">{accounts?.length || 0} companies</Typography>
        </Box>
        <Button variant="contained" startIcon={<Add />} onClick={() => setOpenModal(true)}>
          Add Account
        </Button>
      </Box>

      <Grid container spacing={3}>
        {accounts?.map((account: any) => (
          <Grid item xs={12} md={6} lg={4} key={account.id}>
            <Card
              component={Link}
              to={`/accounts/${account.id}`}
              sx={{
                height: '100%',
                textDecoration: 'none',
                color: 'inherit',
                transition: 'transform 0.2s, box-shadow 0.2s',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: '0 8px 30px rgba(0,0,0,0.15)',
                },
              }}
            >
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                  <Box
                    sx={{
                      width: 56,
                      height: 56,
                      borderRadius: 3,
                      bgcolor: 'primary.main',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Business sx={{ fontSize: 28, color: 'white' }} />
                  </Box>
                  <Box>
                    <Typography variant="h6" fontWeight={600}>{account.name}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      {account.industry || 'No industry'}
                    </Typography>
                  </Box>
                </Box>

                <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                  <Chip size="small" label={account.size || 'Unknown size'} variant="outlined" />
                  <Chip
                    size="small"
                    label={account.status}
                    color={account.status === 'active' ? 'success' : 'default'}
                  />
                </Box>

                {account.health_score && (
                  <Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body2" color="text.secondary">Health Score</Typography>
                      <Typography variant="body2" fontWeight={600}>{account.health_score}/100</Typography>
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={account.health_score}
                      sx={{
                        height: 6,
                        borderRadius: 3,
                        bgcolor: 'background.paper',
                        '& .MuiLinearProgress-bar': {
                          bgcolor:
                            account.health_score > 70
                              ? 'success.main'
                              : account.health_score > 40
                              ? 'warning.main'
                              : 'error.main',
                        },
                      }}
                    />
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Dialog open={openModal} onClose={() => setOpenModal(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Add Account</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              label="Company Name"
              fullWidth
              value={newAccount.name}
              onChange={(e) => setNewAccount({ ...newAccount, name: e.target.value })}
            />
            <TextField
              label="Industry"
              fullWidth
              value={newAccount.industry}
              onChange={(e) => setNewAccount({ ...newAccount, industry: e.target.value })}
            />
            <TextField
              label="Company Size"
              fullWidth
              value={newAccount.size}
              onChange={(e) => setNewAccount({ ...newAccount, size: e.target.value })}
              placeholder="e.g., 50-200 employees"
            />
            <TextField
              label="Website"
              fullWidth
              value={newAccount.website}
              onChange={(e) => setNewAccount({ ...newAccount, website: e.target.value })}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenModal(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={() => createMutation.mutate(newAccount)}
            disabled={!newAccount.name}
          >
            Add Account
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

export default Accounts
