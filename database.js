const Datastore = require('nedb');
let db={};
db.categories = new Datastore({ filename: './category.db', autoload: true });
// db.subcategories = new Datastore({ filename: './sub-category.db', autoload: true });
db.categories.loadDatabase();
// db.subcategories.loadDatabase();
module.exports = db;