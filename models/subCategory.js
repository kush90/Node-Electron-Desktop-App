const { model , Schema} = require('mongoose');

const SubCategorySchema = new Schema({
  category: {
    type: String,
    required: true
  },
  name: {
    type: String,
    required: true
  },
  info:{
      type:Object,
  },
  price:{
    type:Number,
    required:true,
  }
})

module.exports = model('SubCategory', SubCategorySchema);