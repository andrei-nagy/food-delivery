import mongoose from 'mongoose'

const orderCounterSchema = new mongoose.Schema({
  counter: {
    type: Number,
    required: true,
    default: 1,
  },
});

const OrderCounter = mongoose.model('OrderCounter', orderCounterSchema);


export default OrderCounter