import categoryModel from '../models/categoryModel.js'
import fs from 'fs'


// add food category item 

const addCategory = async (req, res) => {
    let image_filename = `${req.file.filename}`

    const category = new categoryModel({
        menu_name: req.body.menu_name,
        description: req.body.description,
        image: image_filename
    })

    try {
        await food.save();
        res.json({
            success: true,
            message: 'Category Food Added'
        })
    } catch (error) {
        console.log(error)
        res.json({
            success: false,
            message: 'Error'
        })
    }
}

//all food category list
const listFoodCategory = async (req, res) => {

    try {
        const categories = await categoryModel.find({});
        res.json({ success: true, data: categories })
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: 'error' })
    }
}


//remove food category 

const removeFoodCategory = async (req, res) => {
    try {
        const category = await categoryModel.findById(req.body.id);
        //delete image from uploads folder
        fs.unlink(`uploads/${category.image}`,() => {})

        await categoryModel.findByIdAndDelete(req.body.id);
        res.json({success: true, message: 'Food Category Removed'})
    } catch (error) {
        console.log(error);
        res.json({success: false, message: 'error'})
    }
}

export { addCategory, listFoodCategory, removeFoodCategory }