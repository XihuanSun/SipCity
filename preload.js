const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('sipcity', {
  pickImage: () => ipcRenderer.invoke('pick-image'),
  startRecognition: (payload) => ipcRenderer.invoke('start-recognition', payload),
  generateMoreCocktails: (payload) => ipcRenderer.invoke('generate-more-cocktails', payload),
  selectCocktail: (payload) => ipcRenderer.invoke('select-cocktail', payload),
  saveDrink: (payload) => ipcRenderer.invoke('save-drink', payload),
  getDrinks: () => ipcRenderer.invoke('get-drinks'),
  getHomebar: () => ipcRenderer.invoke('get-homebar'),
  saveHomebar: (payload) => ipcRenderer.invoke('save-homebar', payload),
  getModelStatus: () => ipcRenderer.invoke('get-model-status'),
  onModelStatus: (callback) => ipcRenderer.on('model-status', (_, payload) => callback(payload))
});
