import React, { useState, useCallback } from 'react'
import { useMutation } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  LinearProgress,
  Alert,
  Chip,
  Grid,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
} from '@mui/material'
import {
  CloudUpload,
  CheckCircle,
  Error as ErrorIcon,
  TrendingUp,
  Warning,
  People,
  ShoppingCart,
} from '@mui/icons-material'
import { styled } from '@mui/material/styles'
import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001'

const UploadZone = styled(Box)(({ theme }) => ({
  border: `2px dashed ${theme.palette.primary.main}`,
  borderRadius: theme.shape.borderRadius * 2,
  padding: theme.spacing(6),
  textAlign: 'center',
  backgroundColor: theme.palette.primary.main + '10',
  cursor: 'pointer',
  transition: 'all 0.3s ease',
  '&:hover': {
    backgroundColor: theme.palette.primary.main + '20',
    transform: 'translateY(-2px)',
  },
}))

const ReportsUpload: React.FC = () => {
  const [dragActive, setDragActive] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [analysisResult, setAnalysisResult] = useState<any>(null)
  const [rawResponse, setRawResponse] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }, [])

  const uploadMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData()
      formData.append('file', file)
      
      const response = await axios.post(`${API_URL}/api/reports/upload`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (progressEvent) => {
          const progress = progressEvent.total
            ? Math.round((progressEvent.loaded * 100) / progressEvent.total)
            : 0
          setUploadProgress(progress)
        },
      })
      return response.data
    },
    onSuccess: (data) => {
      console.log('Full server response:', data)
      setRawResponse(data)
      const insights = data.insights || data
      setAnalysisResult(insights)
      setUploadProgress(0)
    },
    onError: (err: any) => {
      console.error('Upload error:', err)
      setError(err.response?.data?.error || err.message || 'Upload failed')
      setUploadProgress(0)
    },
  })

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      uploadMutation.mutate(e.dataTransfer.files[0])
    }
  }, [uploadMutation])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault()
    if (e.target.files && e.target.files[0]) {
      uploadMutation.mutate(e.target.files[0])
    }
  }

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto' }}>
      <Typography variant="h4" fontWeight="bold" gutterBottom>
        Sales Report Upload
      </Typography>
      <Typography variant="body1" color="text.secondary" gutterBottom>
        Upload CSV, Excel, or PDF reports for AI-powered analysis
      </Typography>

      <Card sx={{ mb: 4, mt: 3 }}>
        <CardContent sx={{ p: 4 }}>
          <UploadZone
            component="label"
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            sx={{
              borderColor: dragActive ? 'primary.dark' : 'primary.main',
              backgroundColor: dragActive ? 'primary.main + 30' : 'primary.main + 10',
            }}
          >
            <input
              type="file"
              hidden
              accept=".csv,.xlsx,.xls,.xlsm,.pdf"
              onChange={handleChange}
            />
            <CloudUpload sx={{ fontSize: 64, color: 'primary.main', mb: 2 }} />
            <Typography variant="h6" gutterBottom>
              Drop your sales report here
            </Typography>
            <Typography variant="body2" color="text.secondary">
              or click to browse
            </Typography>
            <Box sx={{ mt: 2 }}>
              <Chip label="CSV" size="small" sx={{ mr: 1 }} />
              <Chip label="Excel" size="small" sx={{ mr: 1 }} />
              <Chip label="XLSM" size="small" sx={{ mr: 1 }} />
              <Chip label="PDF" size="small" />
            </Box>
          </UploadZone>

          {uploadMutation.isPending && (
            <Box sx={{ mt: 3 }}>
              <Typography variant="body2" gutterBottom>
                Uploading and analyzing...
              </Typography>
              <LinearProgress
                variant="determinate"
                value={uploadProgress}
                sx={{ height: 8, borderRadius: 4 }}
              />
            </Box>
          )}

          {error && (
            <Alert severity="error" sx={{ mt: 3 }} icon={<ErrorIcon />}>
              {error}
            </Alert>
          )}
        </CardContent>
      </Card>

      {analysisResult && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Card sx={{ mb: 3 }}>
            <CardContent sx={{ p: 4 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <CheckCircle color="success" sx={{ fontSize: 32, mr: 2 }} />
                <Typography variant="h5" fontWeight="bold">
                  Analysis Complete
                </Typography>
              </Box>

              {analysisResult.summary && (
                <Box sx={{ mb: 4, p: 3, bgcolor: 'primary.light + 10', borderRadius: 2 }}>
                  <Typography variant="h6" gutterBottom>Executive Summary</Typography>
                  <Typography variant="body1">{analysisResult.summary}</Typography>
                </Box>
              )}

              <Grid container spacing={3} sx={{ mb: 4 }}>
                {analysisResult.top_performers?.length > 0 && (
                  <Grid item xs={12} md={6}>
                    <Card variant="outlined" sx={{ bgcolor: 'success.light + 10' }}>
                      <CardContent>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                          <TrendingUp color="success" sx={{ mr: 1 }} />
                          <Typography variant="h6">Top Performers</Typography>
                        </Box>
                        <List dense>
                          {analysisResult.top_performers.slice(0, 3).map((performer: any, idx: number) => (
                            <ListItem key={idx}>
                              <ListItemText
                                primary={performer.name}
                                secondary={`${performer.metric}: ${performer.value}`}
                              />
                            </ListItem>
                          ))}
                        </List>
                      </CardContent>
                    </Card>
                  </Grid>
                )}

                {analysisResult.accounts_at_risk?.length > 0 && (
                  <Grid item xs={12} md={6}>
                    <Card variant="outlined" sx={{ bgcolor: 'error.light + 10' }}>
                      <CardContent>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                          <Warning color="error" sx={{ mr: 1 }} />
                          <Typography variant="h6">Accounts at Risk</Typography>
                        </Box>
                        <List dense>
                          {analysisResult.accounts_at_risk.slice(0, 3).map((account: any, idx: number) => (
                            <ListItem key={idx}>
                              <ListItemText
                                primary={account.name}
                                secondary={account.reason}
                              />
                            </ListItem>
                          ))}
                        </List>
                      </CardContent>
                    </Card>
                  </Grid>
                )}

                {analysisResult.call_today?.length > 0 && (
                  <Grid item xs={12} md={6}>
                    <Card variant="outlined" sx={{ bgcolor: 'warning.light + 10' }}>
                      <CardContent>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                          <People color="warning" sx={{ mr: 1 }} />
                          <Typography variant="h6">Priority Calls</Typography>
                        </Box>
                        <List dense>
                          {analysisResult.call_today.slice(0, 3).map((call: any, idx: number) => (
                            <ListItem key={idx}>
                              <ListItemText
                                primary={call.name}
                                secondary={call.reason}
                              />
                            </ListItem>
                          ))}
                        </List>
                      </CardContent>
                    </Card>
                  </Grid>
                )}

                {analysisResult.skus_down?.length > 0 && (
                  <Grid item xs={12} md={6}>
                    <Card variant="outlined" sx={{ bgcolor: 'info.light + 10' }}>
                      <CardContent>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                          <ShoppingCart color="info" sx={{ mr: 1 }} />
                          <Typography variant="h6">Underperforming SKUs</Typography>
                        </Box>
                        <List dense>
                          {analysisResult.skus_down.slice(0, 3).map((sku: any, idx: number) => (
                            <ListItem key={idx}>
                              <ListItemText
                                primary={sku.sku}
                                secondary={sku.decline}
                              />
                            </ListItem>
                          ))}
                        </List>
                      </CardContent>
                    </Card>
                  </Grid>
                )}
              </Grid>

              {analysisResult.opportunities?.length > 0 && (
                <>
                  <Divider sx={{ my: 3 }} />
                  <Typography variant="h6" gutterBottom>
                    Opportunities
                  </Typography>
                  <List>
                    {analysisResult.opportunities.map((opp: any, idx: number) => (
                      <ListItem key={idx}>
                        <ListItemIcon>
                          <TrendingUp color="primary" />
                        </ListItemIcon>
                        <ListItemText
                          primary={opp.description}
                          secondary={opp.potential_value}
                        />
                      </ListItem>
                    ))}
                  </List>
                </>
              )}

              {analysisResult.alerts?.length > 0 && (
                <>
                  <Divider sx={{ my: 3 }} />
                  <Typography variant="h6" gutterBottom color="error">
                    Critical Alerts
                  </Typography>
                  {analysisResult.alerts.map((alert: string, idx: number) => (
                    <Alert severity="warning" sx={{ mb: 1 }} key={idx}>
                      {alert}
                    </Alert>
                  ))}
                </>
              )}

              {!analysisResult.summary && !analysisResult.top_performers && rawResponse && (
                <Box sx={{ mt: 4, p: 2, bgcolor: 'grey.100', borderRadius: 1 }}>
                  <Typography variant="caption" color="text.secondary">
                    Debug - Raw server response:
                  </Typography>
                  <pre style={{ fontSize: 12, overflow: 'auto' }}>
                    {JSON.stringify(rawResponse, null, 2)}
                  </pre>
                </Box>
              )}
            </CardContent>
          </Card>
        </motion.div>
      )}
    </Box>
  )
}

export default ReportsUpload
