import React, { useState } from 'react'
import { Box, CssBaseline, Toolbar } from '@mui/material'
import { Routes, Route } from 'react-router-dom'
import Sidebar from './components/Layout/Sidebar'
import Dashboard from './pages/Dashboard'
import Pipeline from './pages/Pipeline'
import Contacts from './pages/Contacts'
import Accounts from './pages/Accounts'
import Tasks from './pages/Tasks'
import AIBriefing from './pages/AIBriefing'
import Reports from './pages/Reports'
import ReportsUpload from './pages/ReportsUpload'
import DealDetail from './pages/DealDetail'
import ContactDetail from './pages/ContactDetail'

const drawerWidth = 280

function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'background.default' }}>
      <CssBaseline />
      
      <Sidebar 
        open={sidebarOpen} 
        onClose={() => setSidebarOpen(false)}
        onOpen={() => setSidebarOpen(true)}
      />

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { md: `calc(100% - ${drawerWidth}px)` },
          minHeight: '100vh',
        }}
      >
        <Toolbar sx={{ display: { md: 'none' } }} />
        
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/pipeline" element={<Pipeline />} />
          <Route path="/contacts" element={<Contacts />} />
          <Route path="/accounts" element={<Accounts />} />
          <Route path="/tasks" element={<Tasks />} />
          <Route path="/briefing" element={<AIBriefing />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="/reports/upload" element={<ReportsUpload />} />
          <Route path="/deals/:id" element={<DealDetail />} />
          <Route path="/contacts/:id" element={<ContactDetail />} />
        </Routes>
      </Box>
    </Box>
  )
}

export default App
