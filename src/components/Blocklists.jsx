import { useState, useEffect } from 'react';
import { blocklistsApi } from '../services/api';
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
  Tooltip,
  Switch,
  FormControlLabel,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  OutlinedInput,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  Save as SaveIcon,
  Refresh as RefreshIcon,
  CloudDownload as CloudDownloadIcon,
} from '@mui/icons-material';

const Blocklists = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const [blocklists, setBlocklists] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [editingBlocklist, setEditingBlocklist] = useState(null);
  const [newBlocklist, setNewBlocklist] = useState({
    name: '',
    url: '',
    format: 'domains',
    enabled: true,
  });
  const [selectedBlocklists, setSelectedBlocklists] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    loadBlocklists();
  }, []);

  const loadBlocklists = async () => {
    try {
      setLoading(true);
      const response = await blocklistsApi.fetch();
      // Ensure each blocklist has all required properties
      const validatedBlocklists = (response.blocklists || []).map(blocklist => ({
        name: blocklist.name || '',
        url: blocklist.url || '',
        format: blocklist.format || 'domains',
        enabled: blocklist.enabled ?? true,
      }));
      setBlocklists(validatedBlocklists);
      setError('');
    } catch (err) {
      setError('Failed to load blocklists');
      console.error('Error loading blocklists:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      await blocklistsApi.save({
        blocklists: blocklists
      });
      setSuccess('Blocklists saved successfully');
      setError('');
    } catch (err) {
      setError('Failed to save blocklists');
      console.error('Error saving blocklists:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddBlocklist = () => {
    setEditingBlocklist(null);
    setNewBlocklist({
      name: '',
      url: '',
      format: 'domains',
      enabled: true,
    });
    setOpenDialog(true);
  };

  const handleEditBlocklist = (blocklist) => {
    setEditingBlocklist(blocklist);
    setNewBlocklist({
      name: blocklist.name,
      url: blocklist.url,
      format: blocklist.format,
      enabled: blocklist.enabled,
    });
    setOpenDialog(true);
  };

  const handleSaveBlocklist = () => {
    // Validate required fields
    if (!newBlocklist.name || !newBlocklist.url) {
      setError('Name and URL are required');
      return;
    }

    if (editingBlocklist) {
      // Update existing blocklist
      const index = blocklists.findIndex(b => b.name === editingBlocklist.name);
      if (index !== -1) {
        const newBlocklists = [...blocklists];
        newBlocklists[index] = {
          ...newBlocklists[index],
          ...newBlocklist,
        };
        setBlocklists(newBlocklists);
        handleSave(); // Save changes immediately
      }
    } else {
      // Add new blocklist
      setBlocklists([...blocklists, newBlocklist]);
      handleSave(); // Save changes immediately
    }
    setOpenDialog(false);
  };

  const handleDeleteBlocklist = (index) => {
    const newBlocklists = [...blocklists];
    newBlocklists.splice(index, 1);
    setBlocklists(newBlocklists);
    handleSave(); // Save changes immediately
  };

  const handleBlocklistChange = (event) => {
    setSelectedBlocklists(event.target.value);
  };

  const handleImportBlocklists = async () => {
    try {
      setLoading(true);
      // TODO: Implement blocklist import from public sources
      setSuccess('Blocklists imported successfully');
    } catch (err) {
      setError('Failed to import blocklists');
      console.error('Error importing blocklists:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredBlocklists = blocklists.filter(blocklist =>
    blocklist.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    blocklist.url.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
              Blocklists
            </Typography>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button
                startIcon={<CloudDownloadIcon />}
                onClick={handleImportBlocklists}
                disabled={loading}
                size={isMobile ? 'small' : 'medium'}
                fullWidth={isMobile}
              >
                Import
              </Button>
              <Button
                startIcon={<AddIcon />}
                onClick={handleAddBlocklist}
                disabled={loading}
                size={isMobile ? 'small' : 'medium'}
                fullWidth={isMobile}
              >
                Add Blocklist
              </Button>
              <Button
                startIcon={<RefreshIcon />}
                onClick={loadBlocklists}
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
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Search Blocklists"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                size={isMobile ? 'small' : 'medium'}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth size={isMobile ? 'small' : 'medium'}>
                <InputLabel>Filter</InputLabel>
                <Select
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                  label="Filter"
                >
                  <MenuItem value="all">All</MenuItem>
                  <MenuItem value="blacklist">Blacklists</MenuItem>
                  <MenuItem value="whitelist">Whitelists</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>

          <Box sx={{ mt: 3 }}>
            <FormControl fullWidth size={isMobile ? 'small' : 'medium'}>
              <InputLabel>Selected Blocklists</InputLabel>
              <Select
                multiple
                value={selectedBlocklists}
                onChange={handleBlocklistChange}
                input={<OutlinedInput label="Selected Blocklists" />}
                renderValue={(selected) => (
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {selected.map((value) => (
                      <Chip 
                        key={value} 
                        label={value} 
                        size={isMobile ? 'small' : 'medium'}
                      />
                    ))}
                  </Box>
                )}
              >
                {filteredBlocklists.map((blocklist) => (
                  <MenuItem key={blocklist} value={blocklist}>
                    {blocklist}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>

          <Box sx={{ mt: 3 }}>
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Name</TableCell>
                    <TableCell>URL</TableCell>
                    <TableCell>Format</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredBlocklists.map((blocklist, index) => (
                    <TableRow key={index}>
                      <TableCell>{blocklist.name}</TableCell>
                      <TableCell>{blocklist.url}</TableCell>
                      <TableCell>{blocklist.format}</TableCell>
                      <TableCell>{blocklist.enabled ? 'Enabled' : 'Disabled'}</TableCell>
                      <TableCell>
                        <IconButton onClick={() => handleEditBlocklist(blocklist)} size="small">
                          <EditIcon />
                        </IconButton>
                        <IconButton onClick={() => handleDeleteBlocklist(index)} size="small">
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

      {/* Add/Edit Blocklist Dialog */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          {editingBlocklist ? 'Edit Blocklist' : 'Add New Blocklist'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              label="Name"
              value={newBlocklist.name}
              onChange={(e) => setNewBlocklist({ ...newBlocklist, name: e.target.value })}
              fullWidth
              required
            />
            <TextField
              label="URL"
              value={newBlocklist.url}
              onChange={(e) => setNewBlocklist({ ...newBlocklist, url: e.target.value })}
              fullWidth
              required
              placeholder="https://..."
            />
            <FormControl fullWidth>
              <InputLabel>Format</InputLabel>
              <Select
                value={newBlocklist.format}
                onChange={(e) => setNewBlocklist({ ...newBlocklist, format: e.target.value })}
                label="Format"
              >
                <MenuItem value="domains">Domains</MenuItem>
                <MenuItem value="hosts">Hosts</MenuItem>
                <MenuItem value="adblock">AdBlock</MenuItem>
              </Select>
            </FormControl>
            <FormControlLabel
              control={
                <Switch
                  checked={newBlocklist.enabled}
                  onChange={(e) => setNewBlocklist({ ...newBlocklist, enabled: e.target.checked })}
                />
              }
              label="Enabled"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button onClick={handleSaveBlocklist} variant="contained">
            {editingBlocklist ? 'Save Changes' : 'Add Blocklist'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Blocklists; 