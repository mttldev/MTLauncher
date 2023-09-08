// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts
const { remote, contextBridge, ipcRenderer } =  require('electron');
const path = require('path');
const fs = require('fs');
const Store = require('electron-store');
const prompt = require('electron-prompt');
const store = new Store();

contextBridge.exposeInMainWorld('mtlauncher', {
    launch: async ()=>{
        await ipcRenderer.invoke('launch');
        location.reload();
    },
    storeSet: (name, value)=>{
        store.set(name, value);
    },
    storeGet: (name)=>{
        return store.get(name);
    },
    storeClear: ()=>{
        store.clear();
    },
    storeDelete: (name)=>{
        store.delete(name);
    },
    storeHas: (name)=>{
        return store.has(name);
    },
    fs: fs,
    path: path,
    showPrompt: prompt,
    openFileDialog: async (title)=>{
        return await ipcRenderer.invoke('open-folder-dialog', title);
    },
    deleteCompiled: async ()=>{
        await ipcRenderer.invoke('delete-compiled');
        alert("コンパイル済みファイルを削除しました。");
    },
    changeBranch: async (branch)=>{
        await ipcRenderer.invoke('change-branch', branch);
    },
    currectBranch: async ()=>{
        return await ipcRenderer.invoke('currect-branch');
    }
})
