import React from 'react'
import { useParams, Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import {
  Box, Card, CardContent, Typography, Grid, Chip, Button, Avatar,
  LinearProgress, Divider, List, ListItem, ListItemAvatar, ListItemText
} from '@mui/material'
import { ArrowBack, Business, Person, Timeline } from '@mui/icons-material'
import { dealsApi } from '../services/api'
import { formatCurrency } from '../utils/formatters'

const DealDetail: React.FC = () => {
  const { id } = useParams()
  const { data: dealData } = useQuery({
    queryKey: ['deal', id],
    queryFn: () => dealsApi.getById(id!),
  })

  const { data: velocity } = useQuery({
    queryKey: ['deal-velocity', id],
    queryFn: () => dealsApi.getVelocity(id!),
    enabled: !!id,
  })

  const deal = dealData?.deal

  if (!deal) return <Typography>Loading...</Typography>

  return (
    <Box>
      <Button component={Link} to="/pipeline" startIcon={<ArrowBack />} sx={{ mb: 3 }}>
        Back to Pipeline
      </Button>
      
      <Grid container spacing={3}>
        <Grid item xs={12} lg={8}>
          <Card sx={{ mb: 3 }}>
            <CardContent sx={{ p: 4 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
                <Box>
                  <Typography variant="h4" fontWeight="bold">{deal.name}</Typography>
                  <Typography variant="body1" color="text.secondary">{deal.account_name}</Typography>
                </Box>
                <Typography variant="h3" fontWeight="bold" color="primary.main">{formatCurrency(deal.value)}</Typography>
              </Box>

              <Grid container spacing={3} sx={{ mb: 3 }}>
                {[
                  { label: 'Stage', value: deal.stage },
                  { label: 'Probability', value: `${deal.probability}%` },
                  { label: 'Expected Close', value: deal.expected_close_date || 'Not set' },
                  { label: 'Priority', value: deal.priority },
                ].map((item) => (
                  <Grid item xs={6} md={3} key={item.label}>
                    <Box sx={{ p: 2, bgcolor: 'background.paper', borderRadius: 2 }}>
                      <Typography variant="caption" color="text.secondary">{item.label}</Typography>
                      <Typography variant="subtitle1" fontWeight={600}>{item.value}</Typography>
                    </Box>
                  </Grid>
                ))}
              </Grid>

              {velocity && (
                <Box>
                  <Typography variant="h6" fontWeight={600} gutterBottom>Deal Velocity</Typography>
                  <Box sx={{ mb: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography>Velocity Score</Typography>
                      <Typography fontWeight={600}>{velocity.velocity_score}/100</Typography>
                    </Box>
                    <LinearProgress variant="determinate" value={velocity.velocity_score} sx={{ height: 8, borderRadius: 4 }} />
                  </Box>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} lg={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" fontWeight={600} gutterBottom>Contact</Typography>
              {deal.contact_name ? (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Avatar>{deal.contact_name.charAt(0)}</Avatar>
                  <Box>
                    <Typography fontWeight={500}>{deal.contact_name}</Typography>
                    <Button component={Link} to={`/contacts/${deal.contact_id}`} size="small">View Profile</Button>
                  </Box>
                </Box>
              ) : (
                <Typography color="text.secondary">No primary contact</Typography>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  )
}

export default DealDetail
