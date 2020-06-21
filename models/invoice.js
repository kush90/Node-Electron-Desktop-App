const { model , Schema} = require('mongoose');

const InvoiceSchema = new Schema({
  name: {
    type: String,
    required: true
  },
  age: {
    type: String,
    required: true
  },
  doc_name: {
    type: String,
    required: true
  },
  test:{
      type:Array,
  },
  result:{
    type:Array,
    
  },
  status:{
    type:String,
    default:'pending'
    
  }
})

module.exports = model('Invoice', InvoiceSchema);