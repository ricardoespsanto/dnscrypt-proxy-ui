import { useState, useEffect } from 'react';
import { fetchBlocklists, saveBlocklists } from '../services/api';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Snackbar,
  Alert,
  CircularProgress,
  Divider,
  FormControlLabel,
  Switch,
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Save as SaveIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';

const Blocklists = () => {
  const [settings, setSettings] = useState({
    blacklist: '',
    whitelist: '',
    cloaking_rules: '',
    forwarding_rules: '',
    block_ipv6: false,
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
      const data = await fetchBlocklists();
      setSettings(data);
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
      await saveBlocklists(settings);
      setSuccess('Settings saved successfully');
      setError('');
    } catch (err) {
      setError('Failed to save settings');
      console.error('Error saving settings:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddRule = (type) => {
    const newRule = prompt('Enter new rule (format: domain=ip or domain=domain):');
    if (newRule) {
      setSettings(prev => ({
        ...prev,
        [type]: prev[type] ? `${prev[type]}\n${newRule}` : newRule
      }));
    }
  };

  const handleDeleteRule = (type, index) => {
    const rules = settings[type].split('\n');
    rules.splice(index, 1);
    setSettings(prev => ({
      ...prev,
      [type]: rules.join('\n')
    }));
  };

  const handleChange = (field) => (event) => {
    const value = event.target.type === 'checkbox' ? event.target.checked : event.target.value;
    setSettings(prev => ({ ...prev, [field]: value }));
  };

  const renderRulesList = (type, title) => {
    const rules = settings[type].split('\n').filter(rule => rule.trim());
    return (
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6">{title}</Typography>
            <Button
              startIcon={<AddIcon />}
              onClick={() => handleAddRule(type)}
              variant="outlined"
              size="small"
            >
              Add Rule
            </Button>
          </Box>
          <List>
            {rules.map((rule, index) => (
              <ListItem key={index}>
                <ListItemText primary={rule} />
                <ListItemSecondaryAction>
                  <IconButton
                    edge="end"
                    onClick={() => handleDeleteRule(type, index)}
                    color="error"
                  >
                    <DeleteIcon />
                  </IconButton>
                </ListItemSecondaryAction>
              </ListItem>
            ))}
            {rules.length === 0 && (
              <ListItem>
                <ListItemText primary="No rules defined" />
              </ListItem>
            )}
          </List>
        </CardContent>
      </Card>
    );
  };

  return (
    <Box sx={{ p: 3 }}>
      <Card>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
            <Typography variant="h5" component="h2">
              Blocklists & Rules
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

          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
              <CircularProgress />
            </Box>
          ) : (
            <>
              <FormControlLabel
                control={
                  <Switch
                    checked={settings.block_ipv6}
                    onChange={handleChange('block_ipv6')}
                  />
                }
                label="Block IPv6"
              />

              <Divider sx={{ my: 3 }} />

              {renderRulesList('blacklist', 'Blacklist')}
              {renderRulesList('whitelist', 'Whitelist')}
              {renderRulesList('cloaking_rules', 'Cloaking Rules')}
              {renderRulesList('forwarding_rules', 'Forwarding Rules')}
            </>
          )}
        </CardContent>
      </Card>
    </Box>
  );
};

export default Blocklists; 