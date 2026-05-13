import React from 'react'
import { useParams, Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { Box, Card, CardContent, Typography, Grid, Avatar, Button, Chip } from '@mui/material'
import { ArrowBack, Email, Phone, Business } from '@mui/icons-material'
import { contactsApi, accountsApi } from '../services/api'
import { formatDate } from '../utils/formatters'

const ContactDetail: React.FC = () => {
  const { id } = useParams()
  const { data: contactData } = useQuery({
    queryKey: ['contact', id],
    queryFn: () => contactsApi.getById(id!),
  })

  const contact = contactData?.contact

  if (!contact) return <Typography>Loading...</Typography>

  return (
    <Box>
      <Button component={Link} to="/contacts" startIcon={<ArrowBack />} sx={{ mb: 3 }}>Back to Contacts</Button>
      
      <Grid container spacing={3}>
        <Grid item xs={12} lg={8}>
          <Card sx={{ mb: 3 }}>
            <CardContent sx={{ p: 4 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, mb: 4 }}>
                <Avatar sx={{ width: 80, height: 80, fontSize: 32, bgcolor: 'primary.main' }}>
                  {contact.first_name[0]}{contact.last_name[0]}
                </Avatar>
                <Box>
                  <Typography variant="h4" fontWeight="bold">{contact.first_name} {contact.last_name}</Typography>
                  <Typography variant="body1" color="text.secondary">{contact.title || 'No title'}</Typography>
                </Box>
              </Box>

              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Box sx={{ p: 2, bgcolor: 'background.paper', borderRadius: 2 }}>
                    <Typography variant="caption" color="text.secondary">Email</Typography>
                    <Typography variant="subtitle1" fontWeight={500}>{contact.email}</Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Box sx={{ p: 2, bgcolor: 'background.paper', borderRadius: 2 }}>
                    <Typography variant="caption" color="text.secondary">Phone</Typography>
                    <Typography variant="subtitle1" fontWeight={500}>{contact.phone || 'Not provided'}</Typography>
                  </Box>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} lg={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" fontWeight={600} gutterBottom>Activity Timeline</Typography>
              {contactData?.activities?.map((activity: any) => (
                <Box key={activity.id} sx={{ p: 2, mb: 1, bgcolor: 'action.hover', borderRadius: 2 }}>
                  <Typography variant="subtitle2">{activity.type}</Typography>
                  <Typography variant="body2" color="text.secondary">{activity.subject}</Typography>
                  <Typography variant="caption" color="text.secondary">{formatDate(activity.created_at)}</Typography>
                </Box>
              )) || <Typography color="text.secondary">No activities yet</Typography>}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  )
}

export default ContactDetail
