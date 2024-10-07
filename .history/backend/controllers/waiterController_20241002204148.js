import waiterModel from '../models/waiterModel.js'
import fs from 'fs'


const addWaiterRequest = async (req, res) => {


    const waiterReq = new waiterModel({
        
        action: req.body.action,
        tableNo: req.body.tableNo
    })

    try {
        await waiterReq.save();
        res.json({
            success: true,
            message: 'Waiter Request Added'
        })
    } catch (error) {
        console.log(error)
        res.json({
            success: false,
            message: 'Erroreee'
        })
    }
}

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


export { addWaiterRequest, listWaiterOrders }