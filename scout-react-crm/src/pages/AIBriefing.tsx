import React from 'react'
import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import {
  Box, Card, CardContent, Typography, Button, Chip, Avatar,
  LinearProgress, Divider, Grid
} from '@mui/material'
import {
  TrendingUp, Warning, CheckCircle, Schedule, AutoAwesome,
  Email, Phone, Assessment
} from '@mui/icons-material'
import { dashboardApi } from '../services/api'
import { formatCurrency } from '../utils/formatters'

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
}

const AIBriefing: React.FC = () => {
  const { data: briefing, isLoading } = useQuery({
    queryKey: ['briefing'],
    queryFn: dashboardApi.getBriefing,
  })

  if (isLoading) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', pt: 10 }}><LinearProgress sx={{ width: 200 }} /></Box>
  }

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'urgent': return <Warning color="error" />
      case 'high': return <TrendingUp color="warning" />
      default: return <CheckCircle color="success" />
    }
  }

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto' }} component={motion.div} variants={containerVariants} initial="hidden" animate="visible">
      {/* Header */}
      <Card component={motion.div} variants={itemVariants} sx={{ mb: 3, background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)' }}>
        <CardContent sx={{ p: 4, color: 'white' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
            <Avatar sx={{ bgcolor: 'white', width: 56, height: 56 }}><AutoAwesome sx={{ color: '#3b82f6', fontSize: 32 }} /></Avatar>
            <Box>
              <Typography variant="h4" fontWeight="bold">{briefing?.summary?.greeting || 'Good morning'}</Typography>
              <Typography variant="body1" sx={{ opacity: 0.9 }}>{briefing?.summary?.focus || "Here's your daily briefing"}</Typography>
            </Box>
          </Box>
          
          <Box sx={{ display: 'flex', gap: 4, mt: 3 }}>
            <Box>
              <Typography variant="h3" fontWeight="bold">{briefing?.metrics?.open_deals || 0}</Typography>
              <Typography variant="body2" sx={{ opacity: 0.8 }}>Open Deals</Typography>
            </Box>
            <Box>
              <Typography variant="h3" fontWeight="bold">{formatCurrency(briefing?.metrics?.weighted_pipeline || 0)}</Typography>
              <Typography variant="body2" sx={{ opacity: 0.8 }}>Pipeline</Typography>
            </Box>
            <Box>
              <Typography variant="h3" fontWeight="bold">{briefing?.metrics?.tasks_today || 0}</Typography>
              <Typography variant="body2" sx={{ opacity: 0.8 }}>Tasks Today</Typography>
            </Box>
          </Box>
        </CardContent>
      </Card>

      {/* Priority Actions */}
      <Grid container spacing={3}>
        <Grid item xs={12} lg={8}>
          <Card component={motion.div} variants={itemVariants}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" fontWeight={600} gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <AutoAwesome color="secondary" /> AI Priority Actions
              </Typography>
              
              {briefing?.priority_actions?.slice(0, 5).map((action: any, index: number) => (
                <Box key={index} sx={{ 
                  p: 2, mb: 2, borderRadius: 2, 
                  borderLeft: 4, 
                  borderLeftColor: action.priority === 'urgent' ? 'error.main' : action.priority === 'high' ? 'warning.main' : 'info.main',
                  bgcolor: 'action.hover'
                }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                    {getPriorityIcon(action.priority)}
                    <Typography variant="subtitle1" fontWeight={600}>{action.title}</Typography>
                    <Chip size="small" label={action.priority.toUpperCase()} color={action.priority === 'urgent' ? 'error' : action.priority === 'high' ? 'warning' : 'info'} />
                  </Box>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>{action.description}</Typography>
                  <Typography variant="caption" color="text.secondary">{action.reason}</Typography>
                </Box>
              ))}
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} lg={4}>
          <Card component={motion.div} variants={itemVariants}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" fontWeight={600} gutterBottom>AI Insights</Typography>
              {briefing?.insights?.map((insight: any, index: number) => (
                <Box key={index} sx={{ mb: 2, p: 2, bgcolor: 'background.paper', borderRadius: 2 }}>
                  <Typography variant="subtitle2" fontWeight={600}>{insight.title}</Typography>
                  <Typography variant="body2" color="text.secondary">{insight.description}</Typography>
                </Box>
              ))}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  )
}

export default AIBriefing
