/**
 * Ponte entre a interface e o processo principal.
 *
 * A interface continua sem acesso ao Node (contextIsolation ligado): ela só
 * enxerga as funções listadas aqui, que viram mensagens IPC. Nada de caminho
 * de arquivo ou credencial chega até o lado do navegador.
 */
const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('karolyne', {
  isDesktop: true,

  data: {
    loadAll: () => ipcRenderer.invoke('data:loadAll'),
    isEmpty: () => ipcRenderer.invoke('data:isEmpty'),
    upsert: (collection, record) => ipcRenderer.invoke('data:upsert', collection, record),
    upsertMany: (collection, records) =>
      ipcRenderer.invoke('data:upsertMany', collection, records),
    remove: (collection, id) => ipcRenderer.invoke('data:remove', collection, id),
    stats: () => ipcRenderer.invoke('data:stats'),
    backup: () => ipcRenderer.invoke('data:backup'),
  },

  sync: {
    status: () => ipcRenderer.invoke('sync:status'),
    now: () => ipcRenderer.invoke('sync:now'),
    configure: credentials => ipcRenderer.invoke('sync:configure', credentials),
  },
})
