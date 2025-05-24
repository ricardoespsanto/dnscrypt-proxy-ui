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
} from '@mui/material';
import { Save as SaveIcon, Refresh as RefreshIcon } from '@mui/icons-material';
import axios from 'axios';

const API_BASE_URL = 'http://localhost:3000/api';

const Settings = () => {
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
    fallback_resolvers: ['9.9.9.9:53', '8.8.8.8:53'],
    ignore_system_dns: false,
    netprobe_timeout: 60,
    log_level: 'info',
    log_file: '/var/log/dnscrypt-proxy.log',
    block_ipv6: false,
    cache: true,
    cache_size: 1000,
    cache_ttl_min: 2400,
    cache_ttl_max: 86400,
    forwarding_rules: '',
    cloaking_rules: '',
    blacklist: '',
    whitelist: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE_URL}/settings`);
      setSettings(response.data);
      setError('');
    } catch (err) {
      setError('Failed to load settings');
      console.error('Error loading settings:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      await axios.post(`${API_BASE_URL}/settings`, settings);
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

  const handleListChange = (field) => (event) => {
    const value = event.target.value.split(',').map((item) => item.trim());
    setSettings((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <Box sx={{ p: 3 }}>
      <Card>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
            <Typography variant="h5" component="h2">
              DNSCrypt-Proxy Settings
            </Typography>
            <Box>
              <Button
                startIcon={<RefreshIcon />}
                onClick={loadSettings}
                disabled={loading}
                sx={{ mr: 1 }}
              >
                Refresh
              </Button>
              <Button
                variant="contained"
                startIcon={<SaveIcon />}
                onClick={handleSave}
                disabled={loading}
              >
                Save Changes
              </Button>
            </Box>
          </Box>

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

          <Grid container spacing={3}>
            {/* Network Settings */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Network Settings
              </Typography>
              <Divider sx={{ mb: 2 }} />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Listen Addresses"
                value={settings.listen_addresses.join(', ')}
                onChange={handleListChange('listen_addresses')}
                helperText="Comma-separated list of addresses to listen on"
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                type="number"
                label="Max Clients"
                value={settings.max_clients}
                onChange={handleChange('max_clients')}
              />
            </Grid>

            <Grid item xs={12} md={4}>
              <FormControlLabel
                control={
                  <Switch
                    checked={settings.ipv4_servers}
                    onChange={handleChange('ipv4_servers')}
                  />
                }
                label="IPv4 Servers"
              />
            </Grid>

            <Grid item xs={12} md={4}>
              <FormControlLabel
                control={
                  <Switch
                    checked={settings.ipv6_servers}
                    onChange={handleChange('ipv6_servers')}
                  />
                }
                label="IPv6 Servers"
              />
            </Grid>

            <Grid item xs={12} md={4}>
              <FormControlLabel
                control={
                  <Switch
                    checked={settings.block_ipv6}
                    onChange={handleChange('block_ipv6')}
                  />
                }
                label="Block IPv6"
              />
            </Grid>

            {/* Server Settings */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                Server Settings
              </Typography>
              <Divider sx={{ mb: 2 }} />
            </Grid>

            <Grid item xs={12} md={4}>
              <FormControlLabel
                control={
                  <Switch
                    checked={settings.dnscrypt_servers}
                    onChange={handleChange('dnscrypt_servers')}
                  />
                }
                label="DNSCrypt Servers"
              />
            </Grid>

            <Grid item xs={12} md={4}>
              <FormControlLabel
                control={
                  <Switch
                    checked={settings.doh_servers}
                    onChange={handleChange('doh_servers')}
                  />
                }
                label="DoH Servers"
              />
            </Grid>

            <Grid item xs={12} md={4}>
              <FormControlLabel
                control={
                  <Switch
                    checked={settings.require_dnssec}
                    onChange={handleChange('require_dnssec')}
                  />
                }
                label="Require DNSSEC"
              />
            </Grid>

            <Grid item xs={12} md={4}>
              <FormControlLabel
                control={
                  <Switch
                    checked={settings.require_nolog}
                    onChange={handleChange('require_nolog')}
                  />
                }
                label="Require No Log"
              />
            </Grid>

            <Grid item xs={12} md={4}>
              <FormControlLabel
                control={
                  <Switch
                    checked={settings.require_nofilter}
                    onChange={handleChange('require_nofilter')}
                  />
                }
                label="Require No Filter"
              />
            </Grid>

            <Grid item xs={12} md={4}>
              <FormControlLabel
                control={
                  <Switch
                    checked={settings.ignore_system_dns}
                    onChange={handleChange('ignore_system_dns')}
                  />
                }
                label="Ignore System DNS"
              />
            </Grid>

            {/* Cache Settings */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                Cache Settings
              </Typography>
              <Divider sx={{ mb: 2 }} />
            </Grid>

            <Grid item xs={12} md={4}>
              <FormControlLabel
                control={
                  <Switch
                    checked={settings.cache}
                    onChange={handleChange('cache')}
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
              />
            </Grid>

            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                type="number"
                label="Netprobe Timeout"
                value={settings.netprobe_timeout}
                onChange={handleChange('netprobe_timeout')}
                helperText="Seconds"
              />
            </Grid>

            {/* Logging Settings */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                Logging Settings
              </Typography>
              <Divider sx={{ mb: 2 }} />
            </Grid>

            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Log Level</InputLabel>
                <Select
                  value={settings.log_level}
                  onChange={handleChange('log_level')}
                  label="Log Level"
                >
                  <MenuItem value="emerg">Emergency</MenuItem>
                  <MenuItem value="alert">Alert</MenuItem>
                  <MenuItem value="crit">Critical</MenuItem>
                  <MenuItem value="error">Error</MenuItem>
                  <MenuItem value="warn">Warning</MenuItem>
                  <MenuItem value="notice">Notice</MenuItem>
                  <MenuItem value="info">Info</MenuItem>
                  <MenuItem value="debug">Debug</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Log File"
                value={settings.log_file}
                onChange={handleChange('log_file')}
              />
            </Grid>

            {/* Fallback Resolvers */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                Fallback Resolvers
              </Typography>
              <Divider sx={{ mb: 2 }} />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Fallback Resolvers"
                value={settings.fallback_resolvers.join(', ')}
                onChange={handleListChange('fallback_resolvers')}
                helperText="Comma-separated list of fallback resolvers"
              />
            </Grid>

            {/* Rules */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                Rules
              </Typography>
              <Divider sx={{ mb: 2 }} />
            </Grid>

            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                multiline
                rows={4}
                label="Forwarding Rules"
                value={settings.forwarding_rules}
                onChange={handleChange('forwarding_rules')}
                helperText="One rule per line"
              />
            </Grid>

            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                multiline
                rows={4}
                label="Cloaking Rules"
                value={settings.cloaking_rules}
                onChange={handleChange('cloaking_rules')}
                helperText="One rule per line"
              />
            </Grid>

            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                multiline
                rows={4}
                label="Blacklist/Whitelist"
                value={settings.blacklist || settings.whitelist}
                onChange={handleChange('blacklist')}
                helperText="One domain per line"
              />
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    </Box>
  );
};

export default Settings;
