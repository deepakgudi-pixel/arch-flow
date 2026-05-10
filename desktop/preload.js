const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('archflowDesktopStorage', {
  getItem(storageKey) {
    return ipcRenderer.invoke('archflow-storage:get', storageKey);
  },
  setItem(storageKey, value) {
    return ipcRenderer.invoke('archflow-storage:set', storageKey, value);
  },
  removeItem(storageKey) {
    return ipcRenderer.invoke('archflow-storage:remove', storageKey);
  }
});
