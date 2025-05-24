import { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Switch,
  TextField,
  Button,
  FormControlLabel,
  Grid,
  Alert,
  Snackbar,
  Divider,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  Chip,
  OutlinedInput,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import { Save as SaveIcon, Refresh as RefreshIcon } from '@mui/icons-material';
import { settingsApi, resolversApi } from '../services/api';
import { DEFAULT_SETTINGS, LOG_LEVELS } from '../config/defaults';

const Settings = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));

  const [settings, setSettings] = useState({
    listen_addresses: ['127.0.0.1:53'],
    max_clients: 250,
    ipv4_servers: true,
    ipv6_servers: false,
    dnscrypt_servers: true,
    doh_servers: true,
    require_dnssec: false,
    require_nolog: true,
    require_nofilter: false,
    disabled_server_names: [],
    fallback_resolvers: [],
    ignore_system_dns: false,
    netprobe_timeout: 60,
    log_level: 'info',
    log_file: '',
    block_ipv6: false,
    cache: true,
    cache_size: 1000,
    cache_ttl_min: 2400,
    cache_ttl_max: 86400,
    forwarding_rules: '',
    cloaking_rules: '',
    blacklist: '',
    whitelist: '',
    server_names: [],
  });
  const [availableResolvers, setAvailableResolvers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    loadSettings();
    loadResolvers();
  }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);
      const response = await settingsApi.fetch();
      setSettings(response);
      setError('');
    } catch (err) {
      setError('Failed to load settings');
      console.error('Error loading settings:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadResolvers = async () => {
    try {
      const response = await resolversApi.fetch();
      setAvailableResolvers(
        Array.isArray(response.server_names) ? response.server_names : []
      );
    } catch (err) {
      console.error('Error loading resolvers:', err);
      setError('Failed to load resolvers');
    }
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      await settingsApi.save(settings);
      setSuccess('Settings saved successfully');
      setError('');
    } catch (err) {
      setError('Failed to save settings');
      console.error('Error saving settings:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field) => (event) => {
    const value = event.target.type === 'checkbox' ? event.target.checked : event.target.value;
    setSettings((prev) => ({ ...prev, [field]: value }));
  };

  const handleMultipleResolverChange = (field) => (event) => {
    const value = event.target.value || [];
    setSettings((prev) => ({ ...prev, [field]: value }));
  };

  const handleBooleanChange = (key) => (event) => {
    setSettings(prev => ({
      ...prev,
      [key]: Boolean(event.target.checked)
    }));
  };

  const handleLogLevelChange = (event) => {
    const value = event.target.value;
    if (LOG_LEVELS.includes(value)) {
      setSettings(prev => ({ ...prev, log_level: value }));
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
              DNSCrypt-Proxy Settings
            </Typography>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button
                startIcon={<RefreshIcon />}
                onClick={loadSettings}
                disabled={loading}
                size={isMobile ? 'small' : 'medium'}
                fullWidth={isMobile}
              >
                Refresh
              </Button>
              <Button
                variant="contained"
                startIcon={<SaveIcon />}
                onClick={handleSave}
                disabled={loading}
                size={isMobile ? 'small' : 'medium'}
                fullWidth={isMobile}
              >
                Save Changes
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

          <Snackbar 
            open={!!success} 
            autoHideDuration={6000} 
            onClose={() => setSuccess('')}
            anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
          >
            <Alert severity="success" onClose={() => setSuccess('')}>
              {success}
            </Alert>
          </Snackbar>

          <Grid container spacing={isMobile ? 2 : 3}>
            {/* Network Settings */}
            <Grid item xs={12}>
              <Typography 
                variant={isMobile ? 'subtitle1' : 'h6'} 
                gutterBottom
                sx={{ fontWeight: 500 }}
              >
                Network Settings
              </Typography>
              <Divider sx={{ mb: 2 }} />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="IPv4 Listen Address"
                value={settings.listen_addresses.find(addr => addr.includes('.')) || ''}
                onChange={(e) => {
                  const ipv4Addr = e.target.value;
                  const ipv6Addr = settings.listen_addresses.find(addr => addr.includes(':')) || '';
                  setSettings(prev => ({
                    ...prev,
                    listen_addresses: [ipv4Addr, ipv6Addr].filter(Boolean)
                  }));
                }}
                placeholder="0.0.0.0:53"
                helperText="IPv4 address and port (e.g., 0.0.0.0:53)"
                size={isMobile ? 'small' : 'medium'}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="IPv6 Listen Address"
                value={settings.listen_addresses.find(addr => addr.includes(':')) || ''}
                onChange={(e) => {
                  const ipv6Addr = e.target.value;
                  const ipv4Addr = settings.listen_addresses.find(addr => addr.includes('.')) || '';
                  setSettings(prev => ({
                    ...prev,
                    listen_addresses: [ipv4Addr, ipv6Addr].filter(Boolean)
                  }));
                }}
                placeholder="[::]:53"
                helperText="IPv6 address and port (e.g., [::]:53)"
                size={isMobile ? 'small' : 'medium'}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                type="number"
                label="Max Clients"
                value={settings.max_clients}
                onChange={handleChange('max_clients')}
                size={isMobile ? 'small' : 'medium'}
              />
            </Grid>

            <Grid item xs={12} md={4}>
              <FormControlLabel
                control={
                  <Switch
                    checked={Boolean(settings.ipv4_servers)}
                    onChange={handleBooleanChange('ipv4_servers')}
                    size={isMobile ? 'small' : 'medium'}
                  />
                }
                label="IPv4 Servers"
              />
            </Grid>

            <Grid item xs={12} md={4}>
              <FormControlLabel
                control={
                  <Switch
                    checked={Boolean(settings.ipv6_servers)}
                    onChange={handleBooleanChange('ipv6_servers')}
                    size={isMobile ? 'small' : 'medium'}
                  />
                }
                label="IPv6 Servers"
              />
            </Grid>

            <Grid item xs={12} md={4}>
              <FormControlLabel
                control={
                  <Switch
                    checked={Boolean(settings.block_ipv6)}
                    onChange={handleBooleanChange('block_ipv6')}
                    size={isMobile ? 'small' : 'medium'}
                  />
                }
                label="Block IPv6"
              />
            </Grid>

            {/* Server Settings */}
            <Grid item xs={12}>
              <Typography 
                variant={isMobile ? 'subtitle1' : 'h6'} 
                gutterBottom 
                sx={{ mt: 2, fontWeight: 500 }}
              >
                Server Settings
              </Typography>
              <Divider sx={{ mb: 2 }} />
            </Grid>

            <Grid item xs={12} md={4}>
              <FormControlLabel
                control={
                  <Switch
                    checked={Boolean(settings.dnscrypt_servers)}
                    onChange={handleBooleanChange('dnscrypt_servers')}
                    size={isMobile ? 'small' : 'medium'}
                  />
                }
                label="DNSCrypt Servers"
              />
            </Grid>

            <Grid item xs={12} md={4}>
              <FormControlLabel
                control={
                  <Switch
                    checked={Boolean(settings.doh_servers)}
                    onChange={handleBooleanChange('doh_servers')}
                    size={isMobile ? 'small' : 'medium'}
                  />
                }
                label="DoH Servers"
              />
            </Grid>

            <Grid item xs={12} md={4}>
              <FormControlLabel
                control={
                  <Switch
                    checked={Boolean(settings.require_dnssec)}
                    onChange={handleBooleanChange('require_dnssec')}
                    size={isMobile ? 'small' : 'medium'}
                  />
                }
                label="Require DNSSEC"
              />
            </Grid>

            <Grid item xs={12} md={4}>
              <FormControlLabel
                control={
                  <Switch
                    checked={Boolean(settings.require_nolog)}
                    onChange={handleBooleanChange('require_nolog')}
                    size={isMobile ? 'small' : 'medium'}
                  />
                }
                label="Require No Log"
              />
            </Grid>

            <Grid item xs={12} md={4}>
              <FormControlLabel
                control={
                  <Switch
                    checked={Boolean(settings.require_nofilter)}
                    onChange={handleBooleanChange('require_nofilter')}
                    size={isMobile ? 'small' : 'medium'}
                  />
                }
                label="Require No Filter"
              />
            </Grid>

            <Grid item xs={12} md={4}>
              <FormControlLabel
                control={
                  <Switch
                    checked={Boolean(settings.ignore_system_dns)}
                    onChange={handleBooleanChange('ignore_system_dns')}
                    size={isMobile ? 'small' : 'medium'}
                  />
                }
                label="Ignore System DNS"
              />
            </Grid>

            {/* Resolver Settings */}
            <Grid item xs={12}>
              <Typography 
                variant={isMobile ? 'subtitle1' : 'h6'} 
                gutterBottom 
                sx={{ mt: 2, fontWeight: 500 }}
              >
                Resolver Settings
              </Typography>
              <Divider sx={{ mb: 2 }} />
            </Grid>

            <Grid item xs={12} md={6}>
              <FormControl fullWidth size={isMobile ? 'small' : 'medium'}>
                <InputLabel>Server Names</InputLabel>
                <Select
                  multiple
                  value={settings.server_names || []}
                  onChange={handleMultipleResolverChange('server_names')}
                  input={<OutlinedInput label="Server Names" />}
                  renderValue={(selected) => (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {(selected || []).map((value) => (
                        <Chip 
                          key={value} 
                          label={value} 
                          size={isMobile ? 'small' : 'medium'}
                        />
                      ))}
                    </Box>
                  )}
                >
                  {availableResolvers.map((resolver) => (
                    <MenuItem key={resolver} value={resolver}>
                      {resolver}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} md={6}>
              <FormControl fullWidth size={isMobile ? 'small' : 'medium'}>
                <InputLabel>Disabled Server Names</InputLabel>
                <Select
                  multiple
                  value={settings.disabled_server_names || []}
                  onChange={handleMultipleResolverChange('disabled_server_names')}
                  input={<OutlinedInput label="Disabled Server Names" />}
                  renderValue={(selected) => (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {(selected || []).map((value) => (
                        <Chip 
                          key={value} 
                          label={value} 
                          size={isMobile ? 'small' : 'medium'}
                        />
                      ))}
                    </Box>
                  )}
                >
                  {availableResolvers.map((resolver) => (
                    <MenuItem key={resolver} value={resolver}>
                      {resolver}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} md={6}>
              <FormControl fullWidth size={isMobile ? 'small' : 'medium'}>
                <InputLabel>Fallback Resolvers</InputLabel>
                <Select
                  multiple
                  value={settings.fallback_resolvers || []}
                  onChange={handleMultipleResolverChange('fallback_resolvers')}
                  input={<OutlinedInput label="Fallback Resolvers" />}
                  renderValue={(selected) => (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {(selected || []).map((value) => (
                        <Chip 
                          key={value} 
                          label={value} 
                          size={isMobile ? 'small' : 'medium'}
                        />
                      ))}
                    </Box>
                  )}
                >
                  {availableResolvers.map((resolver) => (
                    <MenuItem key={resolver} value={resolver}>
                      {resolver}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            {/* Cache Settings */}
            <Grid item xs={12}>
              <Typography 
                variant={isMobile ? 'subtitle1' : 'h6'} 
                gutterBottom 
                sx={{ mt: 2, fontWeight: 500 }}
              >
                Cache Settings
              </Typography>
              <Divider sx={{ mb: 2 }} />
            </Grid>

            <Grid item xs={12} md={4}>
              <FormControlLabel
                control={
                  <Switch
                    checked={Boolean(settings.cache)}
                    onChange={handleBooleanChange('cache')}
                    size={isMobile ? 'small' : 'medium'}
                  />
                }
                label="Enable Cache"
              />
            </Grid>

            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                type="number"
                label="Cache Size"
                value={settings.cache_size}
                onChange={handleChange('cache_size')}
                disabled={!settings.cache}
                size={isMobile ? 'small' : 'medium'}
              />
            </Grid>

            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                type="number"
                label="Netprobe Timeout"
                value={settings.netprobe_timeout}
                onChange={handleChange('netprobe_timeout')}
                size={isMobile ? 'small' : 'medium'}
              />
            </Grid>

            {/* Log Settings */}
            <Grid item xs={12}>
              <Typography 
                variant={isMobile ? 'subtitle1' : 'h6'} 
                gutterBottom 
                sx={{ mt: 2, fontWeight: 500 }}
              >
                Log Settings
              </Typography>
              <Divider sx={{ mb: 2 }} />
            </Grid>

            <Grid item xs={12} md={6}>
              <FormControl fullWidth size={isMobile ? 'small' : 'medium'}>
                <InputLabel>Log Level</InputLabel>
                <Select
                  value={LOG_LEVELS.includes(settings.log_level) ? settings.log_level : 'info'}
                  onChange={handleLogLevelChange}
                  label="Log Level"
                >
                  {LOG_LEVELS.map((level) => (
                    <MenuItem key={level} value={level}>
                      {level.toUpperCase()}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Log File"
                value={settings.log_file}
                onChange={handleChange('log_file')}
                size={isMobile ? 'small' : 'medium'}
              />
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    </Box>
  );
};

export default Settings;
