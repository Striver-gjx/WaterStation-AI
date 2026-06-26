import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('electronAPI', {
  platform: process.platform,
  version: process.env.npm_package_version || '1.0.0',
  exportFile: (jsonStr: string, defaultName: string) => ipcRenderer.invoke('data:export', jsonStr, defaultName),
  importFile: () => ipcRenderer.invoke('data:import'),
  getDataDirectory: () => ipcRenderer.invoke('data:directory'),
  openDataDirectory: () => ipcRenderer.invoke('data:open-directory'),
});
