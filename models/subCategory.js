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
  test:{
      type:Array,
  },
  price:{
    type:Number,
    required:true,
  }
})

module.exports = model('SubCategory', SubCategorySchema);