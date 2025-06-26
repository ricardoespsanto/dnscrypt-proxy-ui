import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Alert,
  Divider,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  Security as SecurityIcon,
  Block as BlockIcon,
  Speed as SpeedIcon,
  Dns as DnsIcon,
} from '@mui/icons-material';
import { metricsApi } from '../services/api.ts';

interface MetricsState {
  encryptedQueries: number;
  blockedQueries: number;
  averageLatency: number;
  currentResolver: string;
}

const Dashboard = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const [metrics, setMetrics] = useState<MetricsState>({
    encryptedQueries: 0,
    blockedQueries: 0,
    averageLatency: 0,
    currentResolver: '',
  });
  const [error, setError] = useState<string>('');

  useEffect(() => {
    loadMetrics();
    const interval = setInterval(loadMetrics, 5000);
    return () => clearInterval(interval);
  }, []);

  const loadMetrics = async (): Promise<void> => {
    try {
      const response = await metricsApi.fetch();
      setMetrics(response);
      setError('');
    } catch (err) {
      setError('Failed to load metrics');
      console.error('Error loading metrics:', err);
    }
  };

  if (error) {
    return (
      <Box 
        display="flex" 
        justifyContent="center" 
        alignItems="center" 
        minHeight="400px"
        p={2}
      >
        <Alert severity="error" sx={{ mb: 2, width: '100%', maxWidth: 600 }}>
          {error}
        </Alert>
      </Box>
    );
  }

  return (
    <Box p={isMobile ? 2 : 3}>
      {/* Metrics */}
      <Grid container spacing={isMobile ? 2 : 3}>
        <Grid>
          <Card 
            sx={{ 
              height: '100%',
              transition: 'transform 0.2s',
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: theme.shadows[4],
              },
            }}
          >
            <CardContent>
              <Box 
                display="flex" 
                alignItems="center" 
                mb={2}
                flexDirection={isMobile ? 'column' : 'row'}
                textAlign={isMobile ? 'center' : 'left'}
              >
                <SecurityIcon 
                  color="primary" 
                  sx={{ 
                    fontSize: isMobile ? 32 : 40, 
                    mr: isMobile ? 0 : 2,
                    mb: isMobile ? 1 : 0,
                  }} 
                />
                <Typography 
                  variant={isMobile ? 'subtitle1' : 'h6'}
                  sx={{ fontWeight: 500 }}
                >
                  Encrypted Queries
                </Typography>
              </Box>
              <Typography 
                variant={isMobile ? 'h4' : 'h3'} 
                color="primary" 
                sx={{ 
                  fontWeight: 'bold',
                  textAlign: isMobile ? 'center' : 'left',
                }}
              >
                {(metrics?.encryptedQueries || 0).toLocaleString()}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid>
          <Card 
            sx={{ 
              height: '100%',
              transition: 'transform 0.2s',
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: theme.shadows[4],
              },
            }}
          >
            <CardContent>
              <Box 
                display="flex" 
                alignItems="center" 
                mb={2}
                flexDirection={isMobile ? 'column' : 'row'}
                textAlign={isMobile ? 'center' : 'left'}
              >
                <BlockIcon 
                  color="error" 
                  sx={{ 
                    fontSize: isMobile ? 32 : 40, 
                    mr: isMobile ? 0 : 2,
                    mb: isMobile ? 1 : 0,
                  }} 
                />
                <Typography 
                  variant={isMobile ? 'subtitle1' : 'h6'}
                  sx={{ fontWeight: 500 }}
                >
                  Blocked Queries
                </Typography>
              </Box>
              <Typography 
                variant={isMobile ? 'h4' : 'h3'} 
                color="error" 
                sx={{ 
                  fontWeight: 'bold',
                  textAlign: isMobile ? 'center' : 'left',
                }}
              >
                {(metrics?.blockedQueries || 0).toLocaleString()}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid>
          <Card 
            sx={{ 
              height: '100%',
              transition: 'transform 0.2s',
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: theme.shadows[4],
              },
            }}
          >
            <CardContent>
              <Box 
                display="flex" 
                alignItems="center" 
                mb={2}
                flexDirection={isMobile ? 'column' : 'row'}
                textAlign={isMobile ? 'center' : 'left'}
              >
                <SpeedIcon 
                  color="info" 
                  sx={{ 
                    fontSize: isMobile ? 32 : 40, 
                    mr: isMobile ? 0 : 2,
                    mb: isMobile ? 1 : 0,
                  }} 
                />
                <Typography 
                  variant={isMobile ? 'subtitle1' : 'h6'}
                  sx={{ fontWeight: 500 }}
                >
                  Average Latency
                </Typography>
              </Box>
              <Typography 
                variant={isMobile ? 'h4' : 'h3'} 
                color="info" 
                sx={{ 
                  fontWeight: 'bold',
                  textAlign: isMobile ? 'center' : 'left',
                }}
              >
                {metrics?.averageLatency || 0}ms
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Current Resolver */}
      <Card 
        sx={{ 
          mt: isMobile ? 2 : 3,
          transition: 'transform 0.2s',
          '&:hover': {
            transform: 'translateY(-4px)',
            boxShadow: theme.shadows[4],
          },
        }}
      >
        <CardContent>
          <Box 
            display="flex" 
            alignItems="center" 
            mb={2}
            flexDirection={isMobile ? 'column' : 'row'}
            textAlign={isMobile ? 'center' : 'left'}
          >
            <DnsIcon 
              color="secondary" 
              sx={{ 
                fontSize: isMobile ? 32 : 40, 
                mr: isMobile ? 0 : 2,
                mb: isMobile ? 1 : 0,
              }} 
            />
            <Typography 
              variant={isMobile ? 'subtitle1' : 'h6'}
              sx={{ fontWeight: 500 }}
            >
              Current Resolver
            </Typography>
          </Box>
          <Divider sx={{ mb: 2 }} />
          <Typography 
            variant={isMobile ? 'h6' : 'h5'} 
            color="text.secondary"
            sx={{ textAlign: isMobile ? 'center' : 'left' }}
          >
            {metrics.currentResolver || 'No resolver selected'}
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
};

export default Dashboard;