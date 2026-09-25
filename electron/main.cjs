// Processo principal do Electron: abre a janela do sistema e carrega o build
// do Vite (dist/). Em desenvolvimento, aponta para o servidor do Vite.
const { app, shell, dialog, ipcMain, BrowserWindow, Menu } = require('electron')
const path = require('node:path')

const db = require('./db.cjs')
const sync = require('./sync.cjs')

const DEV_SERVER = process.env.VITE_DEV_SERVER_URL
const isDev = Boolean(DEV_SERVER)

/** Só uma instância: abrir de novo traz a janela existente para a frente. */
const gotTheLock = app.requestSingleInstanceLock()
if (!gotTheLock) {
  app.quit()
}

let mainWindow = null

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1360,
    height: 880,
    minWidth: 960,
    minHeight: 640,
    show: false,
    // Cor do tema claro, para a janela não piscar branco puro antes de pintar.
    backgroundColor: '#f7f2ec',
    title: 'Karolyne Paola Beauty',
    icon: path.join(__dirname, 'icon.ico'),
    webPreferences: {
      // A interface não precisa de Node; manter desligado é o padrão seguro.
      // Todo acesso ao banco passa pelo preload, via IPC.
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.cjs'),
    },
  })

  mainWindow.once('ready-to-show', () => mainWindow.show())

  mainWindow.webContents.on('did-finish-load', () => {
    console.log('[karolyne-beauty] interface carregada')
  })

  mainWindow.webContents.on('did-fail-load', (_event, code, description, url) => {
    console.error(`[karolyne-beauty] falha ao carregar ${url}: ${description} (${code})`)
  })

  if (isDev) {
    mainWindow.loadURL(DEV_SERVER)
  } else {
    mainWindow.loadFile(path.join(__dirname, '..', 'dist', 'index.html'))
  }

  // Links externos (WhatsApp, Instagram) abrem no navegador do sistema, não
  // dentro da janela do app.
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    if (/^https?:/.test(url)) shell.openExternal(url)
    return { action: 'deny' }
  })

  mainWindow.webContents.on('will-navigate', (event, url) => {
    const current = mainWindow.webContents.getURL()
    if (url !== current) {
      event.preventDefault()
      if (/^https?:/.test(url)) shell.openExternal(url)
    }
  })
}

app.on('second-instance', () => {
  if (!mainWindow) return
  if (mainWindow.isMinimized()) mainWindow.restore()
  mainWindow.focus()
})

/** Handlers IPC: a única porta de entrada da interface para os dados. */
function registerIpc() {
  ipcMain.handle('data:loadAll', () => db.loadAll())
  ipcMain.handle('data:isEmpty', () => db.isEmpty())
  ipcMain.handle('data:upsert', (_e, collection, record) => db.upsert(collection, record))
  ipcMain.handle('data:upsertMany', (_e, collection, records) =>
    db.upsertMany(collection, records),
  )
  ipcMain.handle('data:remove', (_e, collection, id) => db.remove(collection, id))
  ipcMain.handle('data:stats', () => db.stats())

  ipcMain.handle('data:backup', async () => {
    const stamp = new Date().toISOString().slice(0, 19).replace(/[:T]/g, '-')
    const { canceled, filePath } = await dialog.showSaveDialog(mainWindow, {
      title: 'Salvar backup do banco de dados',
      defaultPath: `karolyne-beauty-backup-${stamp}.sqlite`,
      filters: [{ name: 'Banco SQLite', extensions: ['sqlite'] }],
    })
    if (canceled || !filePath) return { ok: false, canceled: true }
    db.backupTo(filePath)
    return { ok: true, path: filePath }
  })

  ipcMain.handle('sync:status', () => sync.status())
  ipcMain.handle('sync:now', () => sync.syncNow())
  ipcMain.handle('sync:configure', (_e, credentials) => sync.writeConfig(credentials))
}

app.whenReady().then(() => {
  db.open(app.getPath('userData'))
  sync.init(app.getPath('userData'))
  registerIpc()

  // Menu enxuto: a barra padrão do Electron expõe ferramentas de desenvolvedor
  // que não fazem sentido para quem vai usar o sistema.
  Menu.setApplicationMenu(
    Menu.buildFromTemplate([
      {
        label: 'Arquivo',
        submenu: [{ role: 'quit', label: 'Sair' }],
      },
      {
        label: 'Editar',
        submenu: [
          { role: 'undo', label: 'Desfazer' },
          { role: 'redo', label: 'Refazer' },
          { type: 'separator' },
          { role: 'cut', label: 'Recortar' },
          { role: 'copy', label: 'Copiar' },
          { role: 'paste', label: 'Colar' },
          { role: 'selectAll', label: 'Selecionar tudo' },
        ],
      },
      {
        label: 'Exibir',
        submenu: [
          { role: 'reload', label: 'Recarregar' },
          { type: 'separator' },
          { role: 'resetZoom', label: 'Tamanho normal' },
          { role: 'zoomIn', label: 'Aumentar zoom' },
          { role: 'zoomOut', label: 'Diminuir zoom' },
          { type: 'separator' },
          { role: 'togglefullscreen', label: 'Tela cheia' },
        ],
      },
    ]),
  )

  createWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})

// Fecha o banco com o app, para o WAL ser consolidado no arquivo principal.
app.on('before-quit', () => {
  try {
    db.close()
  } catch (error) {
    console.error('[karolyne-beauty] erro ao fechar o banco:', error)
  }
})
