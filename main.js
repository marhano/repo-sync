const { 
  app, 
  BrowserWindow, 
  ipcMain, 
  autoUpdater, 
  Tray, 
  Menu, 
  nativeImage,
  globalShortcut
} = require('electron');
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
let tray;

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
    width: 1200,
    height: 920,
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

    const icon = nativeImage.createFromDataURL('data:image/png;base64,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')
    tray = new Tray(icon);

    const contextMenu = Menu.buildFromTemplate([
      {
        label: 'Show App',
        click: () => {
          mainWindow.show();
        },
      },
      {
        label: 'Quit',
        click: () => {
          app.quit();
        },
      },
    ]);

    tray.setContextMenu(contextMenu);
    tray.setToolTip('RepoSync');

    tray.on('double-click', () => {
      if(mainWindow){
        mainWindow.show();
        mainWindow.focus();
      }
    });

    const ret = globalShortcut.register('Alt+R', () => {
      if(mainWindow){
        if(mainWindow.isVisible()){
          mainWindow.hide();
        }else{
          mainWindow.show();
          mainWindow.focus();
        }
      }
    });

    if(!ret){
      console.log('Global shortcut registration failed');
    }

    if(!app.isPackaged){
      const message = 'Aborting updates since app is in development mode.';
      console.log(message);
    }else{
      updateApp();
    }


    // window nav bar state listeners
    mainWindow.on('maximize', () => {
      mainWindow.webContents.send('maximized-window');
    });
    
    mainWindow.on('unmaximize', () => {
      mainWindow.webContents.send('unmaximize-window');
    });
  });

  app.on('quit', () => {
    console.log('App is exiting...');
  });

  app.on('will-quit', () => {
    globalShortcut.unregisterAll();
  });
  
}

// Window nav bar click listeners
ipcMain.on('minimize-window', () => {
  mainWindow.minimize();
});

ipcMain.on('maximize-window', () => {
  if(mainWindow.isMaximized()){
    mainWindow.unmaximize();
  }else{
    mainWindow.maximize();
  }
});

ipcMain.on('close-window', () => {
  if(mainWindow){
    mainWindow.hide();
  }
});

// Auto update listeners
ipcMain.on('install-update', async () => {
  autoUpdater.quitAndInstall();
});