import { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  CircularProgress,
  Alert,
  Snackbar,
  Grid,
  Paper,
  Divider,
} from '@mui/material';
import {
  PlayArrow as StartIcon,
  Stop as StopIcon,
  Refresh as RestartIcon,
  Settings as ConfigIcon,
} from '@mui/icons-material';
import { serviceApi } from '../services/api';

const ServiceManager = () => {
  const [status, setStatus] = useState('unknown');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [serviceManager, setServiceManager] = useState('unknown');
  const [metrics, setMetrics] = useState({
    uptime: '0',
    memoryUsage: '0 MB',
    cpuUsage: '0%',
    activeConnections: 0,
  });

  useEffect(() => {
    loadServiceStatus();
    const interval = setInterval(loadServiceStatus, 5000);
    return () => clearInterval(interval);
  }, []);

  const loadServiceStatus = async () => {
    try {
      const response = await serviceApi.getStatus();
      setStatus(response.status || 'unknown');
      setMetrics(response.metrics || metrics);
      setServiceManager(response.serviceManager || 'unknown');
    } catch (err) {
      console.error('Error loading service status:', err);
      setStatus('unknown');
    }
  };

  const handleServiceAction = async (action) => {
    try {
      setLoading(true);
      setError('');
      await serviceApi.control(action);
      setSuccess(`Service ${action} successful`);
      await loadServiceStatus();
    } catch (err) {
      setError(`Failed to ${action} service: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case 'active':
        return 'success.main';
      case 'inactive':
        return 'error.main';
      default:
        return 'warning.main';
    }
  };

  const getServiceManagerName = () => {
    switch (serviceManager) {
      case 'systemd':
        return 'Systemd';
      case 'openrc':
        return 'OpenRC';
      case 'sysv':
        return 'SysV Init';
      case 'launchd':
        return 'Launchd';
      default:
        return 'Unknown';
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Card>
        <CardContent>
          <Grid container spacing={3}>
            <Grid>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h5" component="h2">
                  Service Management
                </Typography>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Button
                    variant="contained"
                    color="primary"
                    startIcon={<StartIcon />}
                    onClick={() => handleServiceAction('start')}
                    disabled={loading || status === 'active' || serviceManager === 'unknown'}
                  >
                    Start
                  </Button>
                  <Button
                    variant="contained"
                    color="error"
                    startIcon={<StopIcon />}
                    onClick={() => handleServiceAction('stop')}
                    disabled={loading || status === 'inactive' || serviceManager === 'unknown'}
                  >
                    Stop
                  </Button>
                  <Button
                    variant="contained"
                    color="warning"
                    startIcon={<RestartIcon />}
                    onClick={() => handleServiceAction('restart')}
                    disabled={loading || serviceManager === 'unknown'}
                  >
                    Restart
                  </Button>
                </Box>
              </Box>
            </Grid>

            <Grid>
              <Paper
                sx={{
                  p: 2,
                  bgcolor: 'background.default',
                  border: 1,
                  borderColor: getStatusColor(),
                }}
              >
                <Typography variant="h6" gutterBottom>
                  Service Status
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Box
                    sx={{
                      width: 12,
                      height: 12,
                      borderRadius: '50%',
                      bgcolor: getStatusColor(),
                    }}
                  />
                  <Typography>
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </Typography>
                </Box>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  Service Manager: {getServiceManagerName()}
                </Typography>
              </Paper>
            </Grid>

            {serviceManager === 'unknown' && (
              <Grid>
                <Alert severity="warning">
                  Service management is not supported on this system. The detected service manager is not supported.
                </Alert>
              </Grid>
            )}

            <Grid>
              <Divider />
            </Grid>

            <Grid>
              <Typography variant="h6" gutterBottom>
                System Metrics
              </Typography>
              <Grid container spacing={2}>
                <Grid>
                  <Paper sx={{ p: 2, textAlign: 'center' }}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Uptime
                    </Typography>
                    <Typography variant="h6">
                      {metrics.uptime}
                    </Typography>
                  </Paper>
                </Grid>
                <Grid>
                  <Paper sx={{ p: 2, textAlign: 'center' }}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Memory Usage
                    </Typography>
                    <Typography variant="h6">
                      {metrics.memoryUsage}
                    </Typography>
                  </Paper>
                </Grid>
                <Grid>
                  <Paper sx={{ p: 2, textAlign: 'center' }}>
                    <Typography variant="subtitle2" color="text.secondary">
                      CPU Usage
                    </Typography>
                    <Typography variant="h6">
                      {metrics.cpuUsage}
                    </Typography>
                  </Paper>
                </Grid>
                <Grid>
                  <Paper sx={{ p: 2, textAlign: 'center' }}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Active Connections
                    </Typography>
                    <Typography variant="h6">
                      {metrics.activeConnections}
                    </Typography>
                  </Paper>
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      <Snackbar open={!!error} autoHideDuration={6000} onClose={() => setError('')}>
        <Alert severity="error" onClose={() => setError('')}>
          {error}
        </Alert>
      </Snackbar>

      <Snackbar open={!!success} autoHideDuration={6000} onClose={() => setSuccess('')}>
        <Alert severity="success" onClose={() => setSuccess('')}>
          {success}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default ServiceManager; 