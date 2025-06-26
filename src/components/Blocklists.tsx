import React, { useState, useEffect, useCallback } from 'react';
import { blocklistsApi } from '../services/api.ts';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Snackbar,
  Alert,
  CircularProgress,
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  useTheme,
  useMediaQuery,
  Tabs,
  Tab,
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Save as SaveIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';

const Blocklists = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const [blocklists, setBlocklists] = useState<string[]>([]);
  const [whitelist, setWhitelist] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<'denylist' | 'allowlist'>('denylist');
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false);
  const [openDialog, setOpenDialog] = useState<boolean>(false);
  const [newDomain, setNewDomain] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);

  const fetchData = useCallback(async (): Promise<void> => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch lists sequentially to avoid race conditions
      console.log('Fetching blocklists...');
      const response = await blocklistsApi.fetch();
      console.log('Blocklists response:', response);

      // Update both states in a single render cycle
      setBlocklists(response.blocklists || []);
      setWhitelist(response.whitelist || []);
    } catch (error) {
      console.error('Error fetching data:', error);
      setError(error.message || 'Failed to fetch domain lists');
    } finally {
      setLoading(false);
    }
  }, []); // Empty dependency array since it doesn't depend on any props or state

  // Only fetch data once when component mounts
  useEffect(() => {
    fetchData();
  }, []); // Remove fetchData from dependencies since it's stable

  const handleSave = async (): Promise<void> => {
    try {
      setIsSaving(true);
      setSaveError(null);
      setSaveSuccess(false);

      const currentList = activeTab === 'denylist' ? blocklists : whitelist;
      const apiType = activeTab === 'denylist' ? 'blacklist' : 'whitelist';

      console.log(`Saving ${apiType} data:`, currentList);
      await blocklistsApi.save({ blocklists: currentList, type: apiType });
      
      setSaveSuccess(true);
      // Auto-hide success message after 3 seconds
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (error) {
      console.error('Error saving data:', error);
      setSaveError(error.message || 'Failed to save changes');
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddDomain = (): void => {
    if (!newDomain.trim()) {
      setError('Domain is required');
      return;
    }

    // Basic domain validation
    const domainRegex = /^[a-zA-Z0-9][a-zA-Z0-9-_.]*[a-zA-Z0-9]\.[a-zA-Z]{2,}$/;
    if (!domainRegex.test(newDomain.trim())) {
      setError('Invalid domain format. Example: example.com');
      return;
    }

    const newDomainTrimmed = newDomain.trim();
    if (activeTab === 'denylist') {
      const newDenylists = [...blocklists, newDomainTrimmed];
      setBlocklists(newDenylists);
      handleSave();
    } else {
      const newAllowlist = [...whitelist, newDomainTrimmed];
      setWhitelist(newAllowlist);
      handleSave();
    }
    setNewDomain('');
    setOpenDialog(false);
  };

  const handleDeleteDomain = (index: number) => {
    if (activeTab === 'denylist') {
      const newDenylists = [...blocklists];
      newDenylists.splice(index, 1);
      setBlocklists(newDenylists);
      handleSave();
    } else {
      const newAllowlist = [...whitelist];
      newAllowlist.splice(index, 1);
      setWhitelist(newAllowlist);
      handleSave();
    }
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: 'denylist' | 'allowlist') => {
    setActiveTab(newValue);
  };

  const currentList = activeTab === 'denylist' ? blocklists : whitelist;
  const filteredDomains = currentList.filter(domain =>
    domain.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Domain Lists</h1>
        <p className="mt-1 text-sm text-gray-500">
          Manage your domain allowlist and denylist
        </p>
      </div>

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
              Domain Lists
            </Typography>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button
                startIcon={<AddIcon />}
                onClick={() => setOpenDialog(true)}
                disabled={isSaving}
                size={isMobile ? 'small' : 'medium'}
                fullWidth={isMobile}
              >
                Add Domain
              </Button>
              <Button
                startIcon={<RefreshIcon />}
                onClick={fetchData}
                disabled={isSaving}
                size={isMobile ? 'small' : 'medium'}
                fullWidth={isMobile}
              >
                Refresh
              </Button>
              <Button
                variant="contained"
                startIcon={<SaveIcon />}
                onClick={handleSave}
                disabled={isSaving}
                size={isMobile ? 'small' : 'medium'}
                fullWidth={isMobile}
              >
                Save Changes
              </Button>
            </Box>
          </Box>

          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">Error</h3>
                  <div className="mt-2 text-sm text-red-700">{error}</div>
                </div>
              </div>
            </div>
          )}

          {saveError && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">Save Error</h3>
                  <div className="mt-2 text-sm text-red-700">{saveError}</div>
                </div>
              </div>
            </div>
          )}

          {saveSuccess && (
            <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-green-800">Success</h3>
                  <div className="mt-2 text-sm text-green-700">Changes saved successfully</div>
                </div>
              </div>
            </div>
          )}

          <Tabs
            value={activeTab}
            onChange={handleTabChange}
            sx={{ mb: 3 }}
          >
            <Tab value="denylist" label="Denylist" />
            <Tab value="allowlist" label="Allowlist" />
          </Tabs>

          <Grid container spacing={isMobile ? 2 : 3}>
            <Grid>
              <TextField
                fullWidth
                label="Search Domains"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                size={isMobile ? 'small' : 'medium'}
              />
            </Grid>
          </Grid>

          <Box sx={{ mt: 3 }}>
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Domain</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredDomains.map((domain, index) => (
                    <TableRow key={index}>
                      <TableCell>{domain}</TableCell>
                      <TableCell>
                        <IconButton onClick={() => handleDeleteDomain(index)} size="small">
                          <DeleteIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        </CardContent>
      </Card>

      {/* Add Domain Dialog */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          Add Domain to {activeTab === 'denylist' ? 'Denylist' : 'Allowlist'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <TextField
              label="Domain"
              value={newDomain}
              onChange={(e) => setNewDomain(e.target.value)}
              fullWidth
              required
              placeholder="example.com"
              helperText="Enter a valid domain name"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button onClick={handleAddDomain} variant="contained">
            Add
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default Blocklists; 