import React from 'react'
import {
  Box,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  Avatar,
  Divider,
  IconButton,
  useTheme,
  useMediaQuery,
} from '@mui/material'
import {
  Dashboard as DashboardIcon,
  FilterList as PipelineIcon,
  People as PeopleIcon,
  Business as BusinessIcon,
  Assignment as TaskIcon,
  Assessment as ReportIcon,
  SmartToy as AIIcon,
  CloudUpload as CloudUploadIcon,
  Menu as MenuIcon,
  ChevronLeft as ChevronLeftIcon,
} from '@mui/icons-material'
import { useLocation, Link } from 'react-router-dom'

interface SidebarProps {
  open: boolean
  onClose: () => void
  onOpen: () => void
}

const menuItems = [
  { text: 'Dashboard', icon: <DashboardIcon />, path: '/' },
  { text: 'Pipeline', icon: <PipelineIcon />, path: '/pipeline' },
  { text: 'Contacts', icon: <PeopleIcon />, path: '/contacts' },
  { text: 'Accounts', icon: <BusinessIcon />, path: '/accounts' },
  { text: 'Tasks', icon: <TaskIcon />, path: '/tasks' },
  { text: 'AI Briefing', icon: <AIIcon />, path: '/briefing' },
  { text: 'Reports', icon: <ReportIcon />, path: '/reports' },
  { text: 'Report Upload', icon: <CloudUploadIcon />, path: '/reports/upload' },
]

const drawerWidth = 280

const Sidebar: React.FC<SidebarProps> = ({ open, onClose, onOpen }) => {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))
  const location = useLocation()

  const drawerContent = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Logo */}
      <Box sx={{ p: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
        <Box
          sx={{
            width: 48,
            height: 48,
            borderRadius: 3,
            background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 24,
          }}
        >
          📡
        </Box>
        <Box>
          <Typography variant="h6" fontWeight="bold">
            Scout CRM
          </Typography>
          <Typography variant="caption" color="text.secondary">
            AI-Powered Sales
          </Typography>
        </Box>
        
        {isMobile && (
          <IconButton onClick={onClose} sx={{ ml: 'auto' }}>
            <ChevronLeftIcon />
          </IconButton>
        )}
      </Box>

      <Divider sx={{ mx: 2 }} />

      {/* Navigation */}
      <List sx={{ flex: 1, px: 2, py: 2 }}>
        {menuItems.map((item) => {
          const isActive = location.pathname === item.path
          return (
            <ListItem key={item.path} disablePadding sx={{ mb: 0.5 }}>
              <ListItemButton
                component={Link}
                to={item.path}
                onClick={isMobile ? onClose : undefined}
                sx={{
                  borderRadius: 2,
                  py: 1.5,
                  px: 2,
                  backgroundColor: isActive ? 'primary.main' : 'transparent',
                  color: isActive ? 'white' : 'text.primary',
                  '&:hover': {
                    backgroundColor: isActive ? 'primary.dark' : 'rgba(59, 130, 246, 0.1)',
                  },
                  transition: 'all 0.2s ease',
                }}
              >
                <ListItemIcon
                  sx={{
                    color: isActive ? 'white' : 'text.secondary',
                    minWidth: 40,
                  }}
                >
                  {item.icon}
                </ListItemIcon>
                <ListItemText 
                  primary={item.text} 
                  primaryTypographyProps={{ fontWeight: isActive ? 600 : 400 }}
                />
              </ListItemButton>
            </ListItem>
          )
        })}
      </List>

      <Divider sx={{ mx: 2 }} />

      {/* User */}
      <Box sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Avatar sx={{ bgcolor: 'primary.main' }}>AK</Avatar>
          <Box>
            <Typography variant="subtitle2" fontWeight={600}>Alec Kennedy</Typography>
            <Typography variant="caption" color="text.secondary">Sales Rep</Typography>
          </Box>
        </Box>
      </Box>
    </Box>
  )

  return (
    <>
      {/* Mobile drawer */}
      {isMobile && (
        <Drawer
          variant="temporary"
          open={open}
          onClose={onClose}
          ModalProps={{ keepMounted: true }}
          sx={{
            '& .MuiDrawer-paper': {
              width: drawerWidth,
              boxSizing: 'border-box',
              bgcolor: 'background.paper',
            },
          }}
        >
          {drawerContent}
        </Drawer>
      )}

      {/* Desktop drawer */}
      {!isMobile && (
        <Drawer
          variant="permanent"
          sx={{
            width: drawerWidth,
            flexShrink: 0,
            '& .MuiDrawer-paper': {
              width: drawerWidth,
              boxSizing: 'border-box',
              bgcolor: 'background.paper',
              borderRight: '1px solid rgba(100, 149, 237, 0.1)',
            },
          }}
          open
        >
          {drawerContent}
        </Drawer>
      )}

      {/* Mobile menu button */}
      {isMobile && (
        <IconButton
          onClick={onOpen}
          sx={{
            position: 'fixed',
            top: 16,
            left: 16,
            zIndex: 1200,
            bgcolor: 'background.paper',
            boxShadow: 2,
          }}
        >
          <MenuIcon />
        </IconButton>
      )}
    </>
  )
}

export default Sidebar
