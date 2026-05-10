const { app, BrowserWindow, ipcMain, shell } = require('electron');
const path = require('path');
const fs = require('fs/promises');

function getStorageFilePath() {
  return path.join(app.getPath('userData'), 'archflow-storage.json');
}

async function readStorageState() {
  try {
    const rawValue = await fs.readFile(getStorageFilePath(), 'utf8');
    const parsed = JSON.parse(rawValue);
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch (error) {
    if (error.code === 'ENOENT') {
      return {};
    }

    throw error;
  }
}

async function writeStorageState(nextState) {
  await fs.mkdir(path.dirname(getStorageFilePath()), { recursive: true });
  await fs.writeFile(
    getStorageFilePath(),
    JSON.stringify(nextState, null, 2),
    'utf8'
  );
}

function createWindow() {
  const win = new BrowserWindow({
    width: 1440,
    height: 900,
    titleBarStyle: 'hiddenInset',
    backgroundColor: '#ffffff',
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js'),
      userAgent: 'ArchflowDesktop/1.0.0'
    },
    icon: path.join(__dirname, 'icon.png')
  });

  win.loadURL('https://arch-flow.vercel.app');

  win.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith('https://arch-flow.vercel.app')) {
      return { action: 'allow' };
    }
    shell.openExternal(url);
    return { action: 'deny' };
  });

  win.maximize();
}

app.whenReady().then(() => {
  ipcMain.handle('archflow-storage:get', async (_event, storageKey) => {
    const storageState = await readStorageState();
    return Object.prototype.hasOwnProperty.call(storageState, storageKey)
      ? storageState[storageKey]
      : null;
  });

  ipcMain.handle('archflow-storage:set', async (_event, storageKey, value) => {
    const storageState = await readStorageState();
    storageState[storageKey] = value;
    await writeStorageState(storageState);
    return true;
  });

  ipcMain.handle('archflow-storage:remove', async (_event, storageKey) => {
    const storageState = await readStorageState();
    delete storageState[storageKey];
    await writeStorageState(storageState);
    return true;
  });

  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
