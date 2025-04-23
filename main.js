const { updateElectronApp } = require('update-electron-app');
updateElectronApp();
const { app, BrowserWindow, ipcMain, shell } = require('electron');
const path = require('path');
const url = require('url');
const axios = require('axios');
const { spawn } = require('child_process');
require('dotenv').config();

if(require('electron-squirrel-startup')) app.quit();

let mainWindow;
let nodeServer;

function createWindow(){
  mainWindow = new BrowserWindow({
    width: 1000,
    height: 800,
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

async function getAccessToken(authCode){
  const response = await axios.post(
    'https://github.com/login/oauth/access_token',
    {
      client_id: process.env.CLIENT_ID,
      client_secret: process.env.CLIENT_SECRET,
      code: authCode,
    },
    {
      headers: { Accept: 'application/json' },
    }
  );

  return response.data;
}

app.setAppUserModelId("com.marhano.RepoSync.RepoSync");

if(process.defaultApp){
  if(process.argv.length >= 2){
    app.setAsDefaultProtocolClient('repo-sync', process.execPath, [path.resolve(process.argv[1])]);
  }
}else{
  app.setAsDefaultProtocolClient('repo-sync');
}

const gotTheLock = app.requestSingleInstanceLock();

if(!gotTheLock){
  app.quit();
}else{
  app.on('second-instance', (event, commandLine, workingDirectory) => {
    if(mainWindow){
      if(mainWindow.isMinimized()) mainWindow.restore();
      mainWindow.focus();
    }

    const deepLink = commandLine.find(arg => arg.startsWith('repo-sync://auth'));

    if (deepLink) {
      const authCode = new URL(deepLink).searchParams.get('code');

      getAccessToken(authCode).then(data => {
        mainWindow.loadURL(`file://${__dirname}/dist/repo-sync/browser/index.html#/authorize`);
        setTimeout(() => {
          mainWindow.webContents.send('auth-success', data);
        }, 2000);
      });
    }
  });

  app.whenReady().then(() => {
    // nodeServer = spawn('node', [path.join(__dirname, 'server.js')], {
    //   stdio: 'inherit',
    //   shell: true
    // });
    createWindow();
  });

  app.on('quit', () => {
    if (nodeServer) nodeServer.kill();
  });
}


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
