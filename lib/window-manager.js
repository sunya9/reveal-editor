const electron = require('electron')
const { BrowserWindow, ipcMain, dialog } = electron
const { format } = require('url')
const { join } = require('path')
const { CREATE_WINDOW, OPEN_MD_FILE, PDF } = require('./const')
const dev = require('electron-is-dev')

module.exports = class WindowManager {
  constructor() {
    this._windows = new Map()
    ipcMain.on(CREATE_WINDOW, (e, filepath) => this.createWindow(filepath))
  }

  createWindow(filepath) {
    const win = new BrowserWindow({
      width: 800,
      height: 600,
      webPreferences: {
        nativeWindowOpen: true
      }
    })

    win.loadURL(format({
      pathname: join(__dirname, '../index.html'),
      protocol: 'file:',
      slashes: true
    }))

    win.setMenu(null)
    win.maximize()

    win.webContents.on('new-window', (event, url, frameName, disposition, options) => {
      event.preventDefault()
      const externalDisplay = electron.screen.getAllDisplays()
        .find(display =>
          display.bounds.x != 0 || display.bounds.y != 0)
      const pos = Object.assign({
        bounds: {
          x: undefined,
          y: undefined
        }
      }, externalDisplay)
      Object.assign(options, {
        x: pos.bounds.x,
        y: pos.bounds.y
      })
      const win = new BrowserWindow(options)
      win.setMenu(null)
      event.newGuest = win
    })

    const { id } = win
    this._windows.set(id, win)
    if(dev) {
      win.webContents.openDevTools()
      require('vue-devtools').install()
      require('electron-context-menu')()
    }

    win.on('closed', () => {
      this._windows.delete(id)
    })
    if(filepath) {
      win.webContents.on('did-finish-load', () => {
        win.webContents.send(OPEN_MD_FILE, filepath)
      })
    }
    return win
  }

  hasSomeWindows() {
    return !!this._windows.size
  }
}
