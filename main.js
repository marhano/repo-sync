const { app, BrowserWindow, ipcMain, autoUpdater } = require('electron');
const path = require('path');
const fs = require('fs');
const url = require('url');
const axios = require('axios');
const dotenvx = require('@dotenvx/dotenvx');
const storage = require('node-persist');

storage.init();

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

if(require('electron-squirrel-startup')) app.quit();

let mainWindow;

function updateApp(){
  const server = 'https://update.electronjs.org';
  const feed = `${server}/marhano/repo-sync/${process.platform}-${process.arch}/${app.getVersion()}`;

  autoUpdater.setFeedURL(feed);

  autoUpdater.on('error', (error) => {
    console.error('Error in auto-updater:', error);
  });

  autoUpdater.on('checking-for-update', () => {
    console.log('Checking for updates...');
  });

  autoUpdater.on('update-available', () => {
    console.log('Update available. Downloading...');
  });

  autoUpdater.on('update-not-available', () => {
    console.log('No updates available.');
  });

  autoUpdater.on('update-downloaded', 
    async (event, releaseNotes, releaseName, releaseDate, updateURL) => {
    console.log("Update downloaded: ", [event, releaseNotes, releaseName, releaseDate, updateURL]);

    try{
      const response = await axios.get(updateURL);

      mainWindow.webContents.send('update-downloaded', {
        releaseNotes: response.data.notes, 
        releaseName: response.data.name,
        updateURL,
        releaseDate 
      });
    }catch(error){
      console.error("Error in trigger-update: ", error);
    }
  });

  autoUpdater.checkForUpdates();
  setInterval(() => {
    autoUpdater.checkForUpdates();
  }, 10 * 60 * 1000);
}

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

    if(!app.isPackaged){
      const message = 'Aborting updates since app is in development mode.';
      console.log(message);
    }else{
      updateApp();
    }
  });

  app.on('quit', () => {
    console.log('App is exiting...');
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
ipcMain.on('install-update', async () => {
  autoUpdater.quitAndInstall();
});