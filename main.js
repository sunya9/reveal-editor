const { app } = require('electron')
const WindowManager = require('./lib/window-manager')

const wm = new WindowManager()

app.on('ready', () => {
  wm.createWindow()
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  if (!wm.hasSomeWindows()) {
    wm.createWindow()
  }
})
