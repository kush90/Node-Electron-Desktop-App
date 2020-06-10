const electron = require('electron');
const url = require('url');
const path = require('path');
const Invoice = require("../models/invoice");

const SubCategory = require("../models/subCategory");


const {app,BrowserWindow,Menu,ipcMain,ipcRenderer} = electron;

var addWindow;

// handle create add window
function createAddWindow(){
    // create new window
    addWindow = new BrowserWindow({
        width:900,
        height:800,
        title:'Create Invoice',
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
  
};

// receive send message to call window pop up from invoice.html 
ipcMain.on('create-invoice',function(e,item){
    createAddWindow();
});

 // send all subCategory to addWindow.html
 ipcMain.on('get-subCategories',function(e,arg){
    SubCategory.find({},function(err,data){
       if(!err){
            addWindow.webContents.send('get-subCategories',JSON.stringify(data));
            
       }
       else{
            console.log(err);
       }

   });
});


function invoice(mainWindow){

    // get new invoice from addWindow.html
    ipcMain.on('new-invoice-data',function(e,data){
       const newInvoice = new Invoice(data);
       const saveInvoice = newInvoice.save();
       if(saveInvoice){
           
           mainWindow.webContents.send('invoice-added',JSON.stringify(newInvoice));
           addWindow.close();

       }


    });

     // get all invoices to send mainWindow.html
     ipcMain.on('get-invoices',function(e,arg){
        Invoice.find({},function(err,data){
           if(!err){
               
                mainWindow.webContents.send('get-invoices',JSON.stringify(data));
           }
           else{

                console.log(err);
           }

       });
    });

     // get invoice info by id from addResult.html
     ipcMain.on('get-invoice-by-id',function(e,id){
        Invoice.findById(id,function(err,data){
           if(!err){
                // console.log(data);
                mainWindow.webContents.send('get-invoice-by-id-success',JSON.stringify(data));
           }
           else{

                console.log(err);
           }

       });
    });

     // add result of test by id from addResult.html
     ipcMain.on('add-result-to-invoice',function(e,data,id){
        
        let updated_data ={"result":data,"status":"result out"};
        Invoice.findByIdAndUpdate(id,updated_data,function(err,data){
           if(!err){
                
           }
           else{
               console.log(err);
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

exports.invoice = invoice;
