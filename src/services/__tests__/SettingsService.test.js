import SettingsService from '../SettingsService.js';
import FileSystemService from '../FileSystemService.js';
import { createError } from '../../utils/error.js';

// Mock FileSystemService
jest.mock('../FileSystemService.js');

describe('SettingsService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('read', () => {
    it('should return default settings when config file does not exist', async () => {
      FileSystemService.exists.mockResolvedValue(false);
      const settings = await SettingsService.read();
      expect(settings).toEqual(SettingsService.getDefaultSettings());
    });

    it('should return parsed settings from config file', async () => {
      const mockSettings = {
        listen_addresses: ['127.0.0.1:53'],
        max_clients: 250
      };
      FileSystemService.exists.mockResolvedValue(true);
      FileSystemService.readFile.mockResolvedValue(JSON.stringify(mockSettings));

      const settings = await SettingsService.read();
      expect(settings).toEqual(mockSettings);
    });

    it('should handle read errors', async () => {
      FileSystemService.exists.mockResolvedValue(true);
      FileSystemService.readFile.mockRejectedValue(new Error('Read error'));

      await expect(SettingsService.read()).rejects.toThrow('Failed to read settings');
    });
  });

  describe('save', () => {
    it('should save settings to config file', async () => {
      const settings = {
        listen_addresses: ['127.0.0.1:53'],
        max_clients: 250
      };

      FileSystemService.writeFile.mockResolvedValue(true);
      await SettingsService.save(settings);

      expect(FileSystemService.writeFile).toHaveBeenCalled();
    });

    it('should handle save errors', async () => {
      const settings = {
        listen_addresses: ['127.0.0.1:53'],
        max_clients: 250
      };

      FileSystemService.writeFile.mockRejectedValue(new Error('Write error'));
      await expect(SettingsService.save(settings)).rejects.toThrow('Failed to save settings');
    });
  });

  describe('getDefaultSettings', () => {
    it('should return default settings object', () => {
      const settings = SettingsService.getDefaultSettings();
      expect(settings).toHaveProperty('listen_addresses');
      expect(settings).toHaveProperty('max_clients');
      expect(settings).toHaveProperty('ipv4_servers');
      expect(settings).toHaveProperty('ipv6_servers');
      expect(settings).toHaveProperty('dnscrypt_servers');
      expect(settings).toHaveProperty('doh_servers');
    });
  });
}); 