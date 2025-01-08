import foodModel from "../models/foodModel.js";
import fs from 'fs'


// add food item 

// Controller function to get all foods
// const getAllFoods = async (req, res) => {
//     try {
//         const foods = await foodModel.find({}, 'id name category price'); // Return only id, name, category, price
//         res.status(200).json(foods);
//     } catch (error) {
//         res.status(500).json({ message: 'Error retrieving foods', error });
//     }
// };

const addFood = async (req, res) => {
    let image_filename = `${req.file.filename}`

    const food = new foodModel({
        name: req.body.name,
        description: req.body.description,
        price: req.body.price,
        category: req.body.category,
        image: image_filename,
        isBestSeller: req.body.isBestSeller === null ? false : req.body.isBestSeller,
    isNewAdded: req.body.isNewAdded === null ? false : req.body.isNewAdded,
    isVegan: req.body.isVegan === null ? false : req.body.isVegan
    })

    try {
        await food.save();
        res.json({
            success: true,
            message: 'Food Added'
        })
    } catch (error) {
        console.log(error)
        res.json({
            success: false,
            message: 'Error'
        })
    }
}

//all food list
const listFood = async (req, res) => {

    try {
        const foods = await foodModel.find({});
        res.json({ success: true, data: foods })
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: 'error' })
    }
}


//remove food item

const removeFood = async (req, res) => {
    try {
        const food = await foodModel.findById(req.body.id);
        //delete image from uploads folder
        fs.unlink(`uploads/${food.image}`, () => { })

        await foodModel.findByIdAndDelete(req.body.id);
        res.json({ success: true, message: 'Food Removed' })
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: 'error' })
    }
}

const updateFood = async (req, res) => {
    const { id, name, category, price, isBestSeller, isNewAdded, isVegan } = req.body;
    const image = req.file ? req.file.filename : undefined; // Preluăm numele fișierului din req.file, dacă este definit
    const updateData = { name, category, price, isBestSeller, isNewAdded, isVegan }; // Creează un obiect de actualizare

    if (image) {
        updateData.image = image;
    }

    try {
        const product = await foodModel.findByIdAndUpdate(id, updateData, { new: true });

        res.json({ success: true, message: "Product updated successfully!", data: product });
    } catch (error) {
        res.json({ success: false, message: "Error updating product.", error });
    }
}

export { addFood, listFood, removeFood, updateFood }