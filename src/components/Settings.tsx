/// <reference types="react" />
import React from 'react';
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
  Tooltip,
} from '@mui/material';
import { Save as SaveIcon, Refresh as RefreshIcon } from '@mui/icons-material';
import { settingsApi, resolversApi } from '../services/api.ts';
import { DEFAULT_SETTINGS, LOG_LEVELS } from '../config/defaults.ts';

interface SettingFieldConfig {
  label: string;
  type: string;
  description: string;
  options?: string[];
}

interface SettingSectionConfig {
  label: string;
  fields: Record<string, SettingFieldConfig>;
}

interface SettingsConfig {
  network: SettingSectionConfig;
  server: SettingSectionConfig;
  cache: SettingSectionConfig;
  log: SettingSectionConfig;
}

interface AppSettings {
  listen_addresses: string[];
  max_clients: number;
  ipv4_servers: boolean;
  ipv6_servers: boolean;
  block_ipv6: boolean;
  dnscrypt_servers: boolean;
  doh_servers: boolean;
  require_dnssec: boolean;
  require_nolog: boolean;
  require_nofilter: boolean;
  ignore_system_dns: boolean;
  cache: boolean;
  cache_size: number;
  cache_ttl_min: number;
  cache_ttl_max: number;
  netprobe_timeout: number;
  log_level: string;
  log_file: string;
  // Add other settings properties as needed
  [key: string]: any; // For dynamic access
}

// Define a single source of truth for settings
const SETTINGS: SettingsConfig = {
  network: {
    label: 'Network Settings',
    fields: {
      listen_addresses: {
        label: 'Listen Addresses',
        type: 'array',
        description: 'IP addresses and ports to listen on'
      },
      max_clients: {
        label: 'Max Clients',
        type: 'number',
        description: 'Maximum number of concurrent clients'
      },
      ipv4_servers: {
        label: 'IPv4 Servers',
        type: 'boolean',
        description: 'Enable IPv4 servers'
      },
      ipv6_servers: {
        label: 'IPv6 Servers',
        type: 'boolean',
        description: 'Enable IPv6 servers'
      },
      block_ipv6: {
        label: 'Block IPv6',
        type: 'boolean',
        description: 'Block IPv6 queries'
      }
    }
  },
  server: {
    label: 'Server Settings',
    fields: {
      dnscrypt_servers: {
        label: 'DNSCrypt Servers',
        type: 'boolean',
        description: 'Enable DNSCrypt servers'
      },
      doh_servers: {
        label: 'DoH Servers',
        type: 'boolean',
        description: 'Enable DoH servers'
      },
      require_dnssec: {
        label: 'Require DNSSEC',
        type: 'boolean',
        description: 'Require DNSSEC support'
      },
      require_nolog: {
        label: 'Require No Log',
        type: 'boolean',
        description: 'Require no logging'
      },
      require_nofilter: {
        label: 'Require No Filter',
        type: 'boolean',
        description: 'Require no filtering'
      },
      ignore_system_dns: {
        label: 'Ignore System DNS',
        type: 'boolean',
        description: 'Ignore system DNS settings'
      }
    }
  },
  cache: {
    label: 'Cache Settings',
    fields: {
      cache: {
        label: 'Enable Cache',
        type: 'boolean',
        description: 'Enable DNS cache'
      },
      cache_size: {
        label: 'Cache Size',
        type: 'number',
        description: 'Maximum number of cached entries'
      },
      cache_ttl_min: {
        label: 'Min TTL',
        type: 'number',
        description: 'Minimum TTL for cached entries'
      },
      cache_ttl_max: {
        label: 'Max TTL',
        type: 'number',
        description: 'Maximum TTL for cached entries'
      },
      netprobe_timeout: {
        label: 'Netprobe Timeout',
        type: 'number',
        description: 'Timeout for network probe'
      }
    }
  },
  log: {
    label: 'Log Settings',
    fields: {
      log_level: {
        label: 'Log Level',
        type: 'select',
        options: ['emerg', 'alert', 'crit', 'error', 'warn', 'notice', 'info', 'debug'],
        description: 'Logging verbosity level'
      },
      log_file: {
        label: 'Log File',
        type: 'text',
        description: 'Path to log file'
      }
    }
  }
};

const Settings = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const [settings, setSettings] = useState<AppSettings>({ ...DEFAULT_SETTINGS });
  const [availableResolvers, setAvailableResolvers] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');

  useEffect(() => {
    loadSettings();
    loadResolvers();
  }, []);

  const loadSettings = async (): Promise<void> => {
    try {
      setLoading(true);
      const response = await settingsApi.fetch();
      setSettings({ ...DEFAULT_SETTINGS, ...response });
      setError('');
    } catch (err) {
      setError('Failed to load settings');
      console.error('Error loading settings:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadResolvers = async (): Promise<void> => {
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

  const handleSave = async (): Promise<void> => {
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

  const handleChange = (field: keyof AppSettings) => (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | { name?: string; value: unknown }>): void => {
    const value = event.target.type === 'checkbox' ? event.target.checked : event.target.value;
    setSettings((prev) => ({ ...prev, [field]: value }));
  };

  const handleMultipleResolverChange = (field: keyof AppSettings) => (event: SelectChangeEvent<string[]>): void => {
    const value = event.target.value || [];
    setSettings((prev) => ({ ...prev, [field]: value }));
  };

  const handleBooleanChange = (key: keyof AppSettings) => (event: React.ChangeEvent<HTMLInputElement>): void => {
    setSettings(prev => ({
      ...prev,
      [key]: Boolean(event.target.checked)
    }));
  };

  const renderField = (section: string, field: string, config: SettingFieldConfig): JSX.Element => {
    const value = settings[field];
    const commonProps = {
      fullWidth: true,
      size: isMobile ? 'small' : 'medium',
      label: config.label,
      helperText: config.description
    };

    switch (config.type) {
      case 'boolean':
        return (
          <FormControlLabel
            control={
              <Switch
                checked={Boolean(value)}
                onChange={handleBooleanChange(field)}
                size={isMobile ? 'small' : 'medium'}
              />
            }
            label={
              <Tooltip title={config.description}>
                <span>{config.label}</span>
              </Tooltip>
            }
          />
        );
      case 'number':
        return (
          <TextField
            {...commonProps}
            type="number"
            value={value}
            onChange={handleChange(field)}
          />
        );
      case 'select':
        return (
          <FormControl fullWidth size={isMobile ? 'small' : 'medium'}>
            <InputLabel>{config.label}</InputLabel>
            <Select
              value={value}
              onChange={handleChange(field)}
              label={config.label}
            >
              {config.options.map((option) => (
                <MenuItem key={option} value={option}>
                  {option.toUpperCase()}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        );
      case 'array':
        if (field === 'server_names' || field === 'disabled_server_names' || field === 'fallback_resolvers') {
          return (
            <FormControl fullWidth size={isMobile ? 'small' : 'medium'}>
              <InputLabel>{config.label}</InputLabel>
              <Select
                multiple
                value={value || []}
                onChange={handleMultipleResolverChange(field)}
                input={<OutlinedInput label={config.label} />}
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
          );
        }
        return (
          <TextField
            {...commonProps}
            value={value.join(', ')}
            onChange={(e) => handleChange(field)({ target: { value: e.target.value.split(',').map(v => v.trim()) } })}
          />
        );
      default:
        return (
          <TextField
            {...commonProps}
            value={value}
            onChange={handleChange(field)}
          />
        );
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
            {Object.entries(SETTINGS).map(([section, { label, fields }]) => (
              <React.Fragment key={section}>
            <Grid>
              <Typography 
                variant={isMobile ? 'subtitle1' : 'h6'} 
                gutterBottom
                sx={{ fontWeight: 500 }}
              >
                    {label}
              </Typography>
              <Divider sx={{ mb: 2 }} />
            </Grid>
                {Object.entries(fields).map(([field, config]) => (
                  <Grid key={field}>
                    {renderField(section, field, config)}
            </Grid>
                ))}
              </React.Fragment>
            ))}
          </Grid>
        </CardContent>
      </Card>
    </Box>
  );
};

export default Settings;
