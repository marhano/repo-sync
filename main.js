const { updateElectronApp } = require('update-electron-app');
updateElectronApp();
const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const url = require('url');
const axios = require('axios');
const { spawn } = require('child_process');

let mainWindow;
let nodeServer;

function createWindow(){
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      devTools: true,
      preload: path.join(__dirname, "preload.js")
    },
    frame: false
  });

  mainWindow.loadURL(
    url.format({
      pathname: path.join(__dirname, 'dist/repo-sync/browser', 'index.html'), // Ensure this points to your index.html
      protocol: 'file:',
      slashes: true,
    })
  );

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.whenReady().then(() => {
  nodeServer = spawn('node', [path.join(__dirname, 'server.js')], {
    stdio: 'inherit',
    shell: true
  });

  createWindow();
});

app.on('quit', () => {
  if (nodeServer) nodeServer.kill();
});


ipcMain.on('minimize-window', () => {
  mainWindow.minimize();
});

ipcMain.on('maximize-window', () => {
  if(mainWindow.isMaximized()){
    mainWindow.unmaximize();
    mainWindow.webContents.send('unmaximize-window');
  }else{
    mainWindow.maximize();
    mainWindow.webContents.send('maximized-window');
  }
});

ipcMain.on('close-window', () => {
  mainWindow.close();
});

ipcMain.on('exchange-token', async (event, code) => {
  try{
    const response = await axios.post('http://localhost:3000/api/exchange-token', { code });
    event.reply('token-response', response.data);
  }catch(error){
    console.error('Error exchanging token: ', error);
    event.reply('token-response', null);
  }
});

