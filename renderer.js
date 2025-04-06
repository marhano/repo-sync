const { remote } = require('electron'); // Use `@electron/remote` if enabled

document.getElementById('minimize-button').addEventListener('click', () => {
  remote.getCurrentWindow().minimize();
});

document.getElementById('maximize-button').addEventListener('click', () => {
  const currentWindow = remote.getCurrentWindow();
  if (currentWindow.isMaximized()) {
    currentWindow.unmaximize();
  } else {
    currentWindow.maximize();
  }
});

document.getElementById('close-button').addEventListener('click', () => {
  remote.getCurrentWindow().close();
});