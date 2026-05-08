const { app, BrowserWindow, shell } = require('electron');
const path = require('path');

function createWindow() {
  const win = new BrowserWindow({
    width: 1440,
    height: 900,
    titleBarStyle: 'hiddenInset', // Makes it look native and premium on Mac
    backgroundColor: '#ffffff',
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
    },
    icon: path.join(__dirname, 'icon.png')
  });

  // Points to your production Vercel URL
  win.loadURL('https://arch-flow.vercel.app');

  // Open external links (like Clerk auth or Docs) in the user's real browser
  win.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith('https://arch-flow.vercel.app')) {
      return { action: 'allow' };
    }
    shell.openExternal(url);
    return { action: 'deny' };
  });

  // Maximize on start for that "Workbench" feel
  win.maximize();
}

app.whenReady().then(() => {
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
