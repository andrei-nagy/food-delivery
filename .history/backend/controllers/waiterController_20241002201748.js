import waiterModel from '../models/waiterModel.js'
import fs from 'fs'



//all waiter orders list
const listWaiterOrders = async (req, res) => {

    try {
        const orders = await waiterModel.find({});
        res.json({ success: true, data: orders })
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: 'error' })
    }
}


export { listWaiterOrders }