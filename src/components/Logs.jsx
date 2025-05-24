import { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Grid,
  Alert,
  Snackbar,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  useTheme,
  useMediaQuery,
  FormControlLabel,
  Switch,
} from '@mui/material';
import { Refresh as RefreshIcon } from '@mui/icons-material';
import { logsApi } from '../services/api';

const Logs = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedLevel, setSelectedLevel] = useState('all');
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const loadLogs = async () => {
    try {
      setLoading(true);
      const data = await logsApi.fetch();
      setLogs(data);
      setError(null);
    } catch (err) {
      setError('Failed to load logs. Please try again.');
      console.error('Error loading logs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLogs();

    let interval;
    if (autoRefresh) {
      interval = setInterval(loadLogs, 5000); // Refresh every 5 seconds
    }

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [autoRefresh]);

  const handleClearLogs = async () => {
    try {
      await logsApi.clear();
      setLogs([]);
      setError(null);
    } catch (err) {
      setError('Failed to clear logs. Please try again.');
      console.error('Error clearing logs:', err);
    }
  };

  const filteredLogs = logs.filter(log => {
    const matchesLevel = selectedLevel === 'all' || log.level === selectedLevel;
    const matchesSearch = log.message.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesLevel && matchesSearch;
  });

  const getLogLevelColor = (level) => {
    switch (level) {
      case 'emerg':
      case 'alert':
      case 'crit':
        return 'text-red-600';
      case 'error':
        return 'text-red-500';
      case 'warn':
        return 'text-yellow-500';
      case 'notice':
        return 'text-blue-400';
      case 'info':
        return 'text-blue-500';
      case 'debug':
        return 'text-gray-500';
      default:
        return 'text-gray-700';
    }
  };

  return (
    <Box sx={{ p: isMobile ? 2 : 3 }}>
      <Card>
        <CardContent>
          <Box 
            sx={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              mb: 3,
              flexDirection: isMobile ? 'column' : 'row',
              gap: isMobile ? 2 : 0,
            }}
          >
            <Typography 
              variant={isMobile ? 'h6' : 'h5'} 
              component="h2"
              sx={{ fontWeight: 500 }}
            >
              Logs
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
              <FormControlLabel
                control={
                  <Switch
                    checked={autoRefresh}
                    onChange={(e) => setAutoRefresh(e.target.checked)}
                    size={isMobile ? 'small' : 'medium'}
                  />
                }
                label="Auto Refresh"
              />
              <Button
                startIcon={<RefreshIcon />}
                onClick={loadLogs}
                disabled={loading}
                size={isMobile ? 'small' : 'medium'}
                fullWidth={isMobile}
              >
                Refresh
              </Button>
              <Button
                onClick={handleClearLogs}
                disabled={loading}
                size={isMobile ? 'small' : 'medium'}
                fullWidth={isMobile}
                color="error"
              >
                Clear Logs
              </Button>
            </Box>
          </Box>

          <Snackbar 
            open={!!error} 
            autoHideDuration={6000} 
            onClose={() => setError('')}
            anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
          >
            <Alert severity="error" onClose={() => setError('')}>
              {error}
            </Alert>
          </Snackbar>

          <Grid container spacing={isMobile ? 2 : 3}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Search Logs"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                size={isMobile ? 'small' : 'medium'}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth size={isMobile ? 'small' : 'medium'}>
                <InputLabel>Filter</InputLabel>
                <Select
                  value={selectedLevel}
                  onChange={(e) => setSelectedLevel(e.target.value)}
                  label="Filter"
                >
                  <MenuItem value="all">All Levels</MenuItem>
                  {logsApi.getLevels().map((level) => (
                    <MenuItem key={level} value={level}>
                      {level.charAt(0).toUpperCase() + level.slice(1)}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          </Grid>

          <Box 
            sx={{ 
              mt: 3,
              maxHeight: '60vh',
              overflow: 'auto',
              bgcolor: 'background.paper',
              borderRadius: 1,
              p: 2,
            }}
          >
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <i className="fas fa-spinner fa-spin text-2xl text-gray-400"></i>
              </div>
            ) : filteredLogs.length === 0 ? (
              <div className="text-center py-8 text-gray-500">No logs found</div>
            ) : (
              <div className="space-y-2">
                {filteredLogs.map((log, index) => (
                  <Box
                    key={index}
                    sx={{
                      py: 1,
                      borderBottom: '1px solid',
                      borderColor: 'divider',
                      '&:last-child': {
                        borderBottom: 'none',
                      },
                    }}
                  >
                    <Typography
                      variant="body2"
                      sx={{
                        color: getLogLevelColor(log.level),
                        fontFamily: 'monospace',
                        fontSize: isMobile ? '0.75rem' : '0.875rem',
                      }}
                    >
                      {log.message}
                    </Typography>
                  </Box>
                ))}
              </div>
            )}
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export default Logs;