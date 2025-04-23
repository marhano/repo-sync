// const { contextBridge, ipcRenderer } = require('electron');

// contextBridge.exposeInIsolatedWorld('electronAPI', {
//     requestTokenExchange: (message) => ipcRenderer.send('exchange-token', message),
//     onTokenReceived: (callback) => ipcRenderer.on('token-response', (_, data) => callback(data))
// });

console.log('preload.js');