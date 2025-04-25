//const { updateElectronApp } = require('update-electron-app');
// updateElectronApp();
const { app, BrowserWindow, ipcMain, autoUpdater } = require('electron');
const path = require('path');
const fs = require('fs');
const url = require('url');
const axios = require('axios');
const dotenvx = require('@dotenvx/dotenvx');
const storage = require('node-persist');

storage.init();

const server = 'https://update.electronjs.org';
const feed = `${server}/marhano/repo-sync/${process.platform}-${process.arch}/${app.getVersion()}`;

autoUpdater.setFeedURL(feed);
autoUpdater.checkForUpdates();

if (!process.defaultApp) {
  console.log("PRODUCTION");

  const envPath = path.join(process.resourcesPath, '.env');
  const envKeysPath = path.join(process.resourcesPath, '.env.keys');

  if(fs.existsSync(envKeysPath)){
    const envKeys = fs.readFileSync(envKeysPath, 'utf-8');
    const match = envKeys.match(/DOTENV_PRIVATE_KEY="(.+?)"/);

    if(match){
      process.env.DOTENV_PRIVATE_KEY = match[1];
    }
  }

  dotenvx.config({ path: envPath }); // Use this only in production
} else {
  console.log("DEVELOPMENT");
  dotenvx.config(); // Defaults to loading `.env` in development
}

console.log(process.env.CLIENT_ID);

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
  try{
    const response = await axios.post(
      'https://github.com/login/oauth/access_token',
      new URLSearchParams({
        client_id: process.env.CLIENT_ID,
        client_secret: process.env.CLIENT_SECRET,
        code: authCode
      }).toString(),
      {
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      }
    );
  
    return response.data;
  }catch(error){
    console.error(error);
    return null;
  }
 
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

    const deepLink = commandLine[commandLine.length - 1];

    if (deepLink.startsWith('repo-sync://auth')) {
      const authCode = new URL(deepLink).searchParams.get('code');

      getAccessToken(authCode).then(data => {
        mainWindow.loadURL(`file://${__dirname}/dist/repo-sync/browser/index.html#/authorize`);
        setTimeout(() => {
          mainWindow.webContents.send('auth-success', data);
        }, 3000);
      });
    }
  });

  app.whenReady().then(async () => {
    createWindow();

    if(await storage.get('updateReady')){
      mainWindow.webContents.send('update-downloaded');
    }else{
      autoUpdater.on('update-available', (updateInfo) => {
        mainWindow.webContents.send('update-available', updateInfo);
      });
      
      autoUpdater.on('update-downloaded', async () => {
        await storage.setItem('updateReady', true);
        mainWindow.webContents.send('update-downloaded');
      });
    }
  });

  app.on('quit', () => {
    if (nodeServer) nodeServer.kill();
  });
}

// Window nav bar listeners
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

// Auto update listeners
ipcMain.on('download-update', () => {
  autoUpdater.downloadUpdate();
});

ipcMain.on('install-update', async () => {
  autoUpdater.quitAndInstall();
  await storage.setItem('updateReady', false);
});