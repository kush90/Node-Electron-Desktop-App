const electron = require('electron');
const url = require('url');
const path = require('path');
const Category = require("../models/category");

const SubCategory = require("../models/subCategory");


const {app,BrowserWindow,Menu,ipcMain,ipcRenderer} = electron;

let addWindow;

// handle create add window
function createAddWindow(){
    // create new window
    addWindow = new BrowserWindow({
        width:900,
        height:800,
        title:'Add Sub Category',
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

// receive send message to call window pop up from subCategory.html 
ipcMain.on('add-sub-category',function(e,item){
    createAddWindow();
});


// send all category to addWindow.html
ipcMain.on('get-categories',function(e,arg){
    Category.find({},function(err,data){
       if(!err){
            addWindow.webContents.send('get-categories',JSON.stringify(data));
       }

   });
});



function subCategory(mainWindow){

    // get new sub category from addWindow.html
    ipcMain.on('new-sub-category-data',function(e,data){
       const newSubCategory = new SubCategory(data);
       const saveSubCategory = newSubCategory.save();
       if(saveSubCategory){
           console.log(saveSubCategory);
           mainWindow.webContents.send('sub-category-added',JSON.stringify(newSubCategory));
           addWindow.close();

       }


    });

     // get all sub category to send mainWindow.html
     ipcMain.on('get-sub-categories',function(e,arg){
        SubCategory.find({},function(err,data){
           if(!err){
                mainWindow.webContents.send('get-sub-categories',JSON.stringify(data));
           }

       });
    });

    // get item's id from main.html and delete item
    ipcMain.on('sub-cateogry-delete',function(e,id){

        SubCategory.findByIdAndDelete(id,function(err,data){
            if(!err){
                mainWindow.webContents.send('sub-cateogry-deleted',id);
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

exports.subCategory = subCategory;
