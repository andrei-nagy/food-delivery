import categoryModel from '../models/categoryModel.js'
import fs from 'fs'


// add food category item 

const addCategory = async (req, res) => {
      console.log("🌟 addCategory handler called");
  console.log("Req.body:", req.body);
  console.log("Req.file:", req.file);

    let image_filename = `${req.file.filename}`

    const category = new categoryModel({
        menu_name: req.body.menu_name,
        description: req.body.description,
        image: image_filename,
        isActive: req.body.isActive,
    })

    try {
        await category.save();
        res.json({
            success: true,
            message: 'Food Category Added'
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
const updateCategory = async (req, res) => {
    const { id, menu_name, description, isActive } = req.body; // Preluăm datele din body
    const image = req.file ? req.file.filename : undefined; // Preluăm numele fișierului din req.file, dacă este definit

    const updateData = { menu_name, description, isActive }; // Creează un obiect de actualizare

    // Adaugă imaginea la obiectul de actualizare doar dacă există
    if (image) {
        updateData.image = image;
    }

    try {
        const category = await categoryModel.findByIdAndUpdate(id, updateData, { new: true });

        res.json({ success: true, message: "Category updated successfully!", data: category });
    } catch (error) {
        res.json({ success: false, message: "Error updating Category.", error });
    }
};


export { addCategory, listFoodCategory, removeFoodCategory, updateCategory }