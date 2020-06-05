const electron = require('electron');
const url = require('url');
const path = require('path');

require('./database');
let addWindow = require('./category/addWindow');

const {app,BrowserWindow,Menu,ipcMain,ipcRenderer} = electron;

// set env
process.env.NODE_ENV = '';
let mainWindow="";


// listen for app to be ready

app.on('ready',function(){
    // create new window
    mainWindow = new BrowserWindow({
        webPreferences: {nodeIntegration: true}
    });
    // load html into window
    mainWindow.loadURL(url.format({
        pathname:path.join(__dirname,'mainWindow.html'),
        protocol:'file:',
        slashes:true
    }));
    
    // quit app when closed
    mainWindow.on('close',function(){
        app.quit();
    });

    // build menu from template
    const mainWMenu = Menu.buildFromTemplate(mainMenuTemplate);
    mainWindow.setMenu(mainWMenu);
    mainWindow.maximize();
    addWindow.category(mainWindow);
 
});


// Create  main menu template
const mainMenuTemplate = [
    {
        label:'File',
        submenu:[
            {
                label:'Quit',
                accelerator:process.platform == 'darwin' ? 'Command+Q':'Ctrl+Q',
                click(){
                    app.quit();
                }
            }
        ],
    }
];


// If mac, add empty object to menu
if(process.platform == 'darwin'){
    mainMenuTemplate.unshift({});
    
}

// add developer tools item if not in production
if(process.env.NODE_ENV !=='production'){
    mainMenuTemplate.push({
        label: 'Developer Tools',
        submenu:[
            {
                label:'Toggle DevTools',
                accelerator:process.platform == 'darwin' ? 'Command+I':'Ctrl+I',
                click(item,focusedWindow){
                    focusedWindow.toggleDevTools();
                }
            },
            {
                role:'reload',
            }
            

        ]
    });

    
}
