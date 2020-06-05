const electron = require('electron');
const url = require('url');
const path = require('path');

require('../database');
const Category = require("../models/category");

const {app,BrowserWindow,Menu,ipcMain,ipcRenderer} = electron;

let addWindow;

// handle create add window
function createAddWindow(){
    // create new window
    addWindow = new BrowserWindow({
        width:400,
        height:250,
        title:'Add Shopping List Item',
        webPreferences: {nodeIntegration: true} 
    });
    // load html into window
    addWindow.loadURL(url.format({
        pathname:path.join(__dirname,'addWindow.html'),
        protocol:'file:',
        slashes:true
    }));
    //garbage collection handle
    addWindow.on('close',function(){
        addWindow=null
    });

     // build menu from template
   const addMenu = Menu.buildFromTemplate(addMenuTemplate);
   addWindow.setMenu(addMenu);
}



function category(mainWindow){


    // send all items to mainWindow.html
    ipcMain.on('item-get',function(e,arg){
       Category.find({},function(err,data){
          if(!err){
               mainWindow.webContents.send('item-get',JSON.stringify(data));
          }

      });
    });

    // get new item from addWindow.html
    ipcMain.on('item-added',function(e,item){
       const newCategory = new Category({'name':item});
       const saveCategory = newCategory.save();
       if(saveCategory){
           mainWindow.webContents.send('item-add-success',JSON.stringify(newCategory));
           addWindow.close();
       }


    });

    // get new item from main.html
    ipcMain.on('item-add',function(e,item){
       createAddWindow();
    
    
    });


    // get item's id from main.html and delete item
    ipcMain.on('item-delete',function(e,id){

       Category.findByIdAndDelete(id,function(err,data){
           if(!err){
               mainWindow.webContents.send('item-delete-success',id);
           }
       });

    });

    // get update item to pass add.html
    ipcMain.on('item-update',function(e,item){
       createAddWindow();
       addWindow.edit = {
           'data': item
       };
    });

    // get updated item from add.html
    ipcMain.on('item-updated',function(e,item){
    
      Category.findByIdAndUpdate({_id:item._id}, { name:item.name },function(err,data){
         if(!err){
            mainWindow.webContents.send('item-update-success',item);
             addWindow.close();
         }
      });
  
    });
}
// Create  add menu template
const addMenuTemplate = [
    {
        label:'File',
        submenu:[
            {
                label:'Quit',
                accelerator:process.platform == 'darwin' ? 'Command+Q':'Ctrl+Q',
                click(){
                    addWindow.close();
                }
            }
        ],
    }
];

// If mac, add empty object to menu
if(process.platform == 'darwin'){
    addMenuTemplate.unshift({});
}

// add developer tools item if not in production
if(process.env.NODE_ENV !=='production'){
    
    addMenuTemplate.push({
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

exports.category = category;
