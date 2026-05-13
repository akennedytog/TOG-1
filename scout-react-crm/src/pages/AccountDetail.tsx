import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import {
  Box, Card, CardContent, Typography, Button, Chip, Avatar,
  LinearProgress, Divider, List, ListItem, ListItemAvatar, ListItemText
} from '@mui/material'
import { ArrowBack, Business, Person, Timeline, Email, Phone } from '@mui/icons-material'
import { Link, useParams } from 'react-router-dom'
import { accountsApi, contactsApi } from '../services/api'
import { formatCurrency, formatDate } from '../utils/formatters'

const AccountDetail: React.FC = () => {
  const { id } = useParams()
  const { data: accountData } = useQuery({
    queryKey: ['account', id],
    queryFn: () => accountsApi.getById(id!),
    enabled: !!id,
  })

  const account = accountData?.account

  if (!account) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', pt: 10 }}>
        <Typography>Loading account...</Typography>
      </Box>
    )
  }

  const healthColor = account.health_score > 70 ? 'success' : account.health_score > 40 ? 'warning' : 'error'

  return (
    <Box>
      <Button component={Link} to="/accounts" startIcon={<ArrowBack />} sx={{ mb: 3 }>
        Back to Accounts
      </Button>

      <Box sx={{ maxWidth: 1400, mx: 'auto' }}>
        <!-- Account Header -->
        <Card sx={{ mb: 4, background: 'linear-gradient(135deg, #1e3a5f 0%, #0f172a 100%)' }}>
          <CardContent sx={{ p: 4 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
              <Box
                sx={{
                  width: 80,
                  height: 80,
                  borderRadius: 3,
                  background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Business sx={{ fontSize: 40, color: 'white' }} />
              </Box>

              <Box flex={1}>
                <Typography variant="h3" fontWeight="bold" gutterBottom>
                  {account.name}
                </Typography>
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                  <Chip label={account.industry || 'No industry'} variant="outlined" />
                  <Chip label={account.size || 'Unknown size'} variant="outlined" />
                  <Chip
                    label={account.status}
                    color={account.status === 'active' ? 'success' : 'default'}
                  />
                </Box>
              </Box>

              {account.health_score && (
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="h4" fontWeight="bold" color={`${healthColor}.main`}>
                    {account.health_score}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">Health Score</Typography>
                </Box>
              )}
            </Box>

            {account.health_score && (
              <Box sx={{ mt: 3 }}>
                <LinearProgress
                  variant="determinate"
                  value={account.health_score}
                  sx={{
                    height: 8,
                    borderRadius: 4,
                    bgcolor: 'rgba(255,255,255,0.1)',
                    '& .MuiLinearProgress-bar': {
                      bgcolor: `${healthColor}.main`,
                    },
                  }}
                />
              </Box>
            )}
          </CardContent>
        </Card>

        <Grid container spacing={3}>
          <!-- Main Info -->
          <Grid item xs={12} lg={8}>
            <Card sx={{ mb: 3 }}>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h6" fontWeight={600} gutterBottom>
                  Company Information
                </Typography>

                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Website
                    </Typography>
                    <Typography variant="body1">
                      {account.website || 'Not provided'}
                    </Typography>
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Annual Revenue
                    </Typography>
                    <Typography variant="body1">
                      {account.annual_revenue ? formatCurrency(account.annual_revenue) : 'Unknown'}
                    </Typography>
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Address
                    </Typography>
                    <Typography variant="body1">
                      {account.address || 'Not provided'}
                    </Typography>
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Last Activity
                    </Typography>
                    <Typography variant="body1">
                      {account.last_activity_at ? formatDate(account.last_activity_at) : 'No activity'}
                    </Typography>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>

            <!-- Contacts List -->
            <Card>
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h6" fontWeight={600}>Contacts</Typography>
                  <Button variant="outlined" size="small">Add Contact</Button>
                </Box>

                <List>
                  {accountData?.contacts?.map((contact: any) => (
                    <ListItem
                      key={contact.id}
                      component={Link}
                      to={`/contacts/${contact.id}`}
                      sx={{
                        borderRadius: 2,
                        mb: 1,
                        textDecoration: 'none',
                        color: 'inherit',
                        '&:hover': { bgcolor: 'action.hover' },
                      }}
                    >
                      <ListItemAvatar>
                        <Avatar>{contact.first_name[0]}{contact.last_name[0]}</Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={`${contact.first_name} ${contact.last_name}`}
                        secondary={contact.title}
                      />
                    </ListItem>
                  )) || <Typography color="text.secondary">No contacts</Typography>}
                </List>
              </CardContent>
            </Card>
          </Grid>

          <!-- Sidebar -->
          <Grid item xs={12} lg={4}>
            <Card>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h6" fontWeight={600} gutterBottom>
                  Active Deals
                </Typography>

                {accountData?.deals?.map((deal: any) => (
                  <Box
                    key={deal.id}
                    component={Link}
                    to={`/deals/${deal.id}`}
                    sx={{
                      display: 'block',
                      p: 2,
                      mb: 2,
                      borderRadius: 2,
                      bgcolor: 'background.paper',
                      textDecoration: 'none',
                      color: 'inherit',
                      border: '1px solid',
                      borderColor: 'divider',
                      '&:hover': { borderColor: 'primary.main' },
                    }}
                  >
                    <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                      {deal.name}
                    </Typography>
                    
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="body2" color="text.secondary">
                        {deal.stage}
                      </Typography>
                      
                      <Typography variant="subtitle2" color="primary.main">
                        {formatCurrency(deal.value)}
                      </Typography>
                    </Box>
                  </Box>
                )) || <Typography color="text.secondary">No active deals</Typography>}
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>
    </Box>
  )
}

export default AccountDetail
