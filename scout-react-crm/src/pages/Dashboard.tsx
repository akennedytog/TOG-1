import React from 'react'
import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  Avatar,
  LinearProgress,
  Chip,
  IconButton,
  Tooltip,
  useTheme,
} from '@mui/material'
import {
  TrendingUp,
  TrendingDown,
  AttachMoney,
  People,
  Assignment,
  CalendarToday,
  Add,
  ArrowForward,
  MoreVert,
} from '@mui/icons-material'
import { Link } from 'react-router-dom'
import { dashboardApi, dealsApi, tasksApi } from '../services/api'
import { formatCurrency, formatDate } from '../utils/formatters'

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: 'easeOut',
    },
  },
}

const MetricCard: React.FC<{
  title: string
  value: string | number
  icon: React.ReactNode
  trend?: { value: number; positive: boolean }
  color: string
}> = ({ title, value, icon, trend, color }) => (
  <Card
    component={motion.div}
    variants={itemVariants}
    sx={{
      background: `linear-gradient(135deg, ${color}20 0%, ${color}10 100%)`,
      border: `1px solid ${color}30`,
      transition: 'transform 0.2s, box-shadow 0.2s',
      '&:hover': {
        transform: 'translateY(-4px)',
        boxShadow: `0 8px 30px ${color}20`,
      },
    }}
  >
    <CardContent sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
        <Box
          sx={{
            width: 48,
            height: 48,
            borderRadius: 2,
            backgroundColor: `${color}20`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: color,
          }}
        >
          {icon}
        </Box>
        {trend && (
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 0.5,
              color: trend.positive ? 'success.main' : 'error.main',
              bgcolor: trend.positive ? 'success.light' : 'error.light',
              px: 1,
              py: 0.5,
              borderRadius: 1,
            }}
          >
            {trend.positive ? <TrendingUp fontSize="small" /> : <TrendingDown fontSize="small" />}
            <Typography variant="caption" fontWeight={600}>
              {Math.abs(trend.value)}%
            </Typography>
          </Box>
        )}
      </Box>
      
      <Typography variant="h4" fontWeight="bold" gutterBottom>
        {value}
      </Typography>
      
      <Typography variant="body2" color="text.secondary">
        {title}
      </Typography>
    </CardContent>
  </Card>
)

const Dashboard: React.FC = () => {
  const theme = useTheme()

  const { data: dashboardData, isLoading: dashboardLoading } = useQuery({
    queryKey: ['dashboard'],
    queryFn: dashboardApi.getMetrics,
  })

  const { data: recentDeals } = useQuery({
    queryKey: ['deals', 'recent'],
    queryFn: () => dealsApi.getAll().then(deals => deals.slice(0, 5)),
  })

  const { data: tasks } = useQuery({
    queryKey: ['tasks'],
    queryFn: () => tasksApi.getAll({ status: 'open' }),
  })

  if (dashboardLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <LinearProgress sx={{ width: 200 }} />
      </Box>
    )
  }

  const metrics = dashboardData?.metrics || {}

  return (
    <Box sx={{ maxWidth: 1400, mx: 'auto' }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" fontWeight="bold" gutterBottom>
          Dashboard
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Welcome back! Here's what's happening with your sales today.
        </Typography>
      </Box>

      {/* Metrics Grid */}
      <Grid
        container
        spacing={3}
        component={motion.div}
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        sx={{ mb: 4 }}
      >
        <Grid item xs={12} sm={6} lg={3}>
          <MetricCard
            title="Open Pipeline"
            value={formatCurrency(metrics.weighted_pipeline || 0)}
            icon={<AttachMoney />}
            trend={{ value: 12, positive: true }}
            color="#3b82f6"
          />
        </Grid>

        <Grid item xs={12} sm={6} lg={3}>
          <MetricCard
            title="Revenue This Month"
            value={formatCurrency(metrics.month_revenue || 0)}
            icon={<TrendingUp />}
            trend={{ value: 8, positive: true }}
            color="#10b981"
          />
        </Grid>

        <Grid item xs={12} sm={6} lg={3}>
          <MetricCard
            title="Tasks Due Today"
            value={metrics.tasks_today || 0}
            icon={<Assignment />}
            color="#f59e0b"
          />
        </Grid>

        <Grid item xs={12} sm={6} lg={3}>
          <MetricCard
            title="Activities This Week"
            value={metrics.activities_this_week || 0}
            icon={<CalendarToday />}
            color="#8b5cf6"
          />
        </Grid>
      </Grid>

      {/* Main Content */}
      <Grid container spacing={3}>
        {/* Recent Deals */}
        <Grid item xs={12} lg={8}>
          <Card
            component={motion.div}
            variants={itemVariants}
            initial="hidden"
            animate="visible"
          >
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h6" fontWeight={600}>
                  Recent Deals
                </Typography>
                
                <Button
                  component={Link}
                  to="/pipeline"
                  endIcon={<ArrowForward />}
                  size="small"
                >
                  View All
                </Button>
              </Box>

              {recentDeals?.map((deal, index) => (
                <Box
                  key={deal.id}
                  component={Link}
                  to={`/deals/${deal.id}`}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    p: 2,
                    mb: index < recentDeals.length - 1 ? 1 : 0,
                    borderRadius: 2,
                    textDecoration: 'none',
                    color: 'inherit',
                    transition: 'background-color 0.2s',
                    '&:hover': {
                      bgcolor: 'action.hover',
                    },
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Avatar sx={{ bgcolor: 'primary.main' }}>
                      {deal.name.charAt(0)}
                    </Avatar>
                    <Box>
                      <Typography variant="subtitle2" fontWeight={600}>
                        {deal.name}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {deal.account_name || 'No account'} • {deal.stage}
                      </Typography>
                    </Box>
                  </Box>

                  <Box sx={{ textAlign: 'right' }}>
                    <Typography variant="subtitle2" fontWeight={600}>
                      {formatCurrency(deal.value)}
                    </Typography>
                    <Chip
                      size="small"
                      label={`${deal.probability || 0}%`}
                      color={
                        deal.probability >= 70 ? 'success' : 
                        deal.probability >= 40 ? 'warning' : 'error'
                      }
                      sx={{ mt: 0.5 }}
                    />
                  </Box>
                </Box>
              ))}

              {(!recentDeals || recentDeals.length === 0) && (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <Typography color="text.secondary">No deals yet</Typography>
                  <Button
                    component={Link}
                    to="/pipeline"
                    variant="outlined"
                    sx={{ mt: 2 }}
                    startIcon={<Add />}
                  >
                    Create First Deal
                  </Button>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Today's Tasks */}
        <Grid item xs={12} lg={4}>
          <Card
            component={motion.div}
            variants={itemVariants}
            initial="hidden"
            animate="visible"
            transition={{ delay: 0.2 }}
          >
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h6" fontWeight={600}>
                  Today's Tasks
                </Typography>
                
                <IconButton size="small">
                  <MoreVert />
                </IconButton>
              </Box>

              {tasks?.filter(t => t.due_date === new Date().toISOString().split('T')[0]).map((task) => (
                <Box
                  key={task.id}
                  sx={{
                    p: 2,
                    mb: 1,
                    borderRadius: 2,
                    bgcolor: 'background.paper',
                    border: '1px solid',
                    borderColor: 'divider',
                    borderLeft: 4,
                    borderLeftColor: 
                      task.priority === 'urgent' ? 'error.main' :
                      task.priority === 'high' ? 'warning.main' :
                      task.priority === 'medium' ? 'info.main' : 'success.main',
                  }}
                >
                  <Typography variant="subtitle2" fontWeight={500} gutterBottom>
                    {task.title}
                  </Typography>
                  
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
                    <Chip
                      size="small"
                      label={task.priority}
                      color={
                        task.priority === 'urgent' ? 'error' :
                        task.priority === 'high' ? 'warning' :
                        task.priority === 'medium' ? 'info' : 'success'
                      }
                    />
                    {task.ai_suggested && (
                      <Chip
                        size="small"
                        label="AI"
                        variant="outlined"
                        color="secondary"
                      />
                    )}
                  </Box>
                </Box>
              ))}

              {(!tasks || tasks.length === 0) && (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <Typography color="text.secondary">No tasks for today</Typography>
                </Box>
              )}

              <Button
                component={Link}
                to="/tasks"
                fullWidth
                variant="outlined"
                sx={{ mt: 2 }}
              >
                View All Tasks
              </Button>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  )
}

export default Dashboard
