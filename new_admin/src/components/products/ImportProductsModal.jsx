import { motion } from "framer-motion";
import { X, Plus } from "lucide-react";
import { useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { useUrl } from "../context/UrlContext";
import ImageUploadSection from "./sections/ImageUploadSection";

const ImportProductsModal = ({ isOpen, onClose, onProductsImported }) => {
    const [importFile, setImportFile] = useState(null);
    const [importPreview, setImportPreview] = useState([]);
    const [isImporting, setIsImporting] = useState(false);
    const [importProgress, setImportProgress] = useState(0);
    const [importErrors, setImportErrors] = useState([]);
    const [importImages, setImportImages] = useState([]);
    const { url } = useUrl();

   const downloadTemplate = () => {
    const templateData = [
        {
            name: "Margherita Pizza", category: "Pizza", price: "12.99", discountPercentage: "10",
            description: "Classic pizza with tomato sauce and mozzarella",
            ingredients: "Tomato sauce, Mozzarella cheese, Fresh basil, Olive oil",
            image: "pizza-margherita.jpg", isBestSeller: "true", isNewAdded: "false", isVegan: "true",
            extras: "Extra Cheese:1.50,Olives:0.75", calories: "285", protein: "12.5", carbs: "35.2",
            fat: "9.8", fiber: "2.1", sugar: "3.4", cookingTime: "15-20 minute", spiceLevel: "Mild",
            servingSize: "350g", difficulty: "Easy", isGlutenFree: "false", isDairyFree: "false",
            isVegetarian: "true", isSpicy: "false", containsNuts: "false", allergens: "Gluten,Dairy"
        },
        {
            name: "Pepperoni Pizza", category: "Pizza", price: "14.50", discountPercentage: "0",
            description: "Spicy pepperoni with melted mozzarella",
            ingredients: "Tomato sauce, Mozzarella, Pepperoni slices, Oregano",
            image: "pizza-pepperoni.jpg", isBestSeller: "true", isNewAdded: "false", isVegan: "false",
            extras: "Extra Cheese:1.50,Extra Pepperoni:2.00", calories: "320", protein: "15.8", carbs: "38.5",
            fat: "14.2", fiber: "2.3", sugar: "4.1", cookingTime: "15-20 minute", spiceLevel: "Medium",
            servingSize: "380g", difficulty: "Easy", isGlutenFree: "false", isDairyFree: "false",
            isVegetarian: "true", isSpicy: "true", containsNuts: "false", allergens: "Gluten,Dairy"
        },
        {
            name: "Vegan Burger", category: "Burgers", price: "13.75", discountPercentage: "15",
            description: "Plant-based patty with fresh veggies",
            ingredients: "Vegan patty, Lettuce, Tomato, Vegan mayo, Whole wheat bun",
            image: "vegan-burger.jpg", isBestSeller: "false", isNewAdded: "true", isVegan: "true",
            extras: "Avocado:1.75, Vegan Cheese:2.00", calories: "420", protein: "18.3", carbs: "45.6",
            fat: "22.4", fiber: "8.7", sugar: "6.2", cookingTime: "10-12 minute", spiceLevel: "Mild",
            servingSize: "320g", difficulty: "Easy", isGlutenFree: "false", isDairyFree: "true",
            isVegetarian: "true", isSpicy: "false", containsNuts: "true", allergens: "Soy,Nuts"
        },
        {
            name: "Spicy Chicken Tacos", category: "Mexican", price: "10.99", discountPercentage: "5",
            description: "Three soft tacos with spicy chicken",
            ingredients: "Corn tortillas, Spicy chicken, Lettuce, Pico de gallo, Sour cream",
            image: "tacos-spicy-chicken.jpg", isBestSeller: "true", isNewAdded: "false", isVegan: "false",
            extras: "Guacamole:2.50,Extra Chicken:3.00", calories: "380", protein: "24.5", carbs: "32.8",
            fat: "16.7", fiber: "4.2", sugar: "5.3", cookingTime: "8-10 minute", spiceLevel: "Hot",
            servingSize: "280g", difficulty: "Easy", isGlutenFree: "true", isDairyFree: "false",
            isVegetarian: "false", isSpicy: "true", containsNuts: "false", allergens: "Dairy"
        },
        {
            name: "Caesar Salad", category: "Salads", price: "11.25", discountPercentage: "0",
            description: "Fresh romaine with Caesar dressing",
            ingredients: "Romaine lettuce, Caesar dressing, Parmesan, Croutons, Anchovies",
            image: "caesar-salad.jpg", isBestSeller: "true", isNewAdded: "false", isVegan: "false",
            extras: "Grilled Chicken:4.00, Shrimp:5.50", calories: "285", protein: "12.8", carbs: "18.4",
            fat: "19.2", fiber: "3.1", sugar: "4.8", cookingTime: "5-7 minute", spiceLevel: "Mild",
            servingSize: "300g", difficulty: "Easy", isGlutenFree: "false", isDairyFree: "false",
            isVegetarian: "true", isSpicy: "false", containsNuts: "true", allergens: "Gluten,Dairy,Anchovies"
        },
        {
            name: "Chocolate Brownie", category: "Desserts", price: "6.50", discountPercentage: "10",
            description: "Warm chocolate brownie with nuts",
            ingredients: "Flour, Chocolate, Butter, Sugar, Walnuts, Eggs",
            image: "chocolate-brownie.jpg", isBestSeller: "false", isNewAdded: "false", isVegan: "false",
            extras: "Ice Cream:2.50,Caramel Sauce:1.00", calories: "480", protein: "7.2", carbs: "58.9",
            fat: "28.4", fiber: "3.8", sugar: "42.7", cookingTime: "25-30 minute", spiceLevel: "Mild",
            servingSize: "180g", difficulty: "Medium", isGlutenFree: "false", isDairyFree: "false",
            isVegetarian: "true", isSpicy: "false", containsNuts: "true", allergens: "Gluten,Dairy,Nuts,Eggs"
        },
        {
            name: "Vegetable Stir Fry", category: "Asian", price: "12.99", discountPercentage: "20",
            description: "Mixed vegetables in soy-ginger sauce",
            ingredients: "Broccoli, Bell peppers, Carrots, Soy sauce, Ginger, Garlic",
            image: "vegetable-stirfry.jpg", isBestSeller: "false", isNewAdded: "true", isVegan: "true",
            extras: "Tofu:2.50, Shrimp:4.00", calories: "320", protein: "9.8", carbs: "42.3",
            fat: "14.6", fiber: "7.9", sugar: "12.4", cookingTime: "12-15 minute", spiceLevel: "Medium",
            servingSize: "350g", difficulty: "Medium", isGlutenFree: "true", isDairyFree: "true",
            isVegetarian: "true", isSpicy: "false", containsNuts: "false", allergens: "Soy"
        },
        {
            name: "BBQ Chicken Wings", category: "Appetizers", price: "9.99", discountPercentage: "0",
            description: "Crispy wings with BBQ glaze",
            ingredients: "Chicken wings, BBQ sauce, Spices, Oil",
            image: "bbq-wings.jpg", isBestSeller: "true", isNewAdded: "false", isVegan: "false",
            extras: "Blue Cheese Dip:1.00,Celery Sticks:0.50", calories: "450", protein: "32.5", carbs: "18.7",
            fat: "28.9", fiber: "1.2", sugar: "15.8", cookingTime: "20-25 minute", spiceLevel: "Medium",
            servingSize: "250g", difficulty: "Medium", isGlutenFree: "true", isDairyFree: "false",
            isVegetarian: "false", isSpicy: "false", containsNuts: "false", allergens: "None"
        },
        {
            name: "Quinoa Bowl", category: "Healthy", price: "14.25", discountPercentage: "5",
            description: "Nutritious bowl with quinoa and vegetables",
            ingredients: "Quinoa, Avocado, Cherry tomatoes, Cucumber, Lemon dressing",
            image: "quinoa-bowl.jpg", isBestSeller: "false", isNewAdded: "true", isVegan: "true",
            extras: "Grilled Salmon:6.00, Falafel:3.50", calories: "380", protein: "14.9", carbs: "52.4",
            fat: "16.8", fiber: "11.3", sugar: "7.2", cookingTime: "10-15 minute", spiceLevel: "Mild",
            servingSize: "400g", difficulty: "Easy", isGlutenFree: "true", isDairyFree: "true",
            isVegetarian: "true", isSpicy: "false", containsNuts: "false", allergens: "None"
        },
        {
            name: "Beef Lasagna", category: "Pasta", price: "16.50", discountPercentage: "0",
            description: "Layered pasta with beef and cheese",
            ingredients: "Lasagna sheets, Ground beef, Tomato sauce, Ricotta, Mozzarella",
            image: "beef-lasagna.jpg", isBestSeller: "true", isNewAdded: "false", isVegan: "false",
            extras: "Garlic Bread:3.00, Side Salad:4.50", calories: "520", protein: "28.7", carbs: "45.8",
            fat: "29.4", fiber: "4.2", sugar: "9.8", cookingTime: "40-45 minute", spiceLevel: "Medium",
            servingSize: "450g", difficulty: "Hard", isGlutenFree: "false", isDairyFree: "false",
            isVegetarian: "false", isSpicy: "false", containsNuts: "false", allergens: "Gluten,Dairy,Eggs"
        },
        {
            name: "Smoothie Bowl", category: "Breakfast", price: "8.99", discountPercentage: "10",
            description: "Blended fruit topped with granola",
            ingredients: "Banana, Berries, Yogurt, Granola, Honey, Chia seeds",
            image: "smoothie-bowl.jpg", isBestSeller: "false", isNewAdded: "false", isVegan: "false",
            extras: "Protein Powder:1.50,Extra Fruit:2.00", calories: "320", protein: "11.4", carbs: "58.7",
            fat: "7.9", fiber: "8.4", sugar: "34.2", cookingTime: "5-7 minute", spiceLevel: "Mild",
            servingSize: "350g", difficulty: "Easy", isGlutenFree: "false", isDairyFree: "false",
            isVegetarian: "true", isSpicy: "false", containsNuts: "true", allergens: "Dairy,Nuts"
        },
        {
            name: "Fish & Chips", category: "Seafood", price: "15.75", discountPercentage: "0",
            description: "Beer-battered fish with fries",
            ingredients: "Cod fillet, Beer batter, Potatoes, Tartar sauce",
            image: "fish-chips.jpg", isBestSeller: "true", isNewAdded: "false", isVegan: "false",
            extras: "Mushy Peas:2.00,Extra Tartar:0.75", calories: "680", protein: "32.8", carbs: "65.4",
            fat: "35.2", fiber: "5.8", sugar: "3.4", cookingTime: "15-18 minute", spiceLevel: "Mild",
            servingSize: "500g", difficulty: "Medium", isGlutenFree: "false", isDairyFree: "false",
            isVegetarian: "false", isSpicy: "false", containsNuts: "false", allergens: "Gluten,Dairy,Fish"
        },
        {
            name: "Mushroom Risotto", category: "Italian", price: "13.99", discountPercentage: "15",
            description: "Creamy arborio rice with mushrooms",
            ingredients: "Arborio rice, Mushrooms, Parmesan, White wine, Butter",
            image: "mushroom-risotto.jpg", isBestSeller: "false", isNewAdded: "true", isVegan: "false",
            extras: "Truffle Oil:3.50, Grilled Veggies:4.00", calories: "420", protein: "11.2", carbs: "58.9",
            fat: "16.4", fiber: "3.8", sugar: "4.2", cookingTime: "25-30 minute", spiceLevel: "Mild",
            servingSize: "380g", difficulty: "Hard", isGlutenFree: "false", isDairyFree: "false",
            isVegetarian: "true", isSpicy: "false", containsNuts: "false", allergens: "Gluten,Dairy"
        },
        {
            name: "Chicken Curry", category: "Indian", price: "14.99", discountPercentage: "5",
            description: "Aromatic chicken in curry sauce",
            ingredients: "Chicken, Onions, Tomatoes, Curry spices, Cream",
            image: "chicken-curry.jpg", isBestSeller: "true", isNewAdded: "false", isVegan: "false",
            extras: "Naan Bread:2.50, Rice:3.00", calories: "480", protein: "35.8", carbs: "28.4",
            fat: "26.7", fiber: "4.1", sugar: "8.9", cookingTime: "30-35 minute", spiceLevel: "Hot",
            servingSize: "400g", difficulty: "Medium", isGlutenFree: "true", isDairyFree: "false",
            isVegetarian: "false", isSpicy: "true", containsNuts: "true", allergens: "Dairy,Nuts"
        },
        {
            name: "Greek Yogurt Parfait", category: "Healthy", price: "7.50", discountPercentage: "0",
            description: "Layered yogurt with fruits and nuts",
            ingredients: "Greek yogurt, Granola, Mixed berries, Honey",
            image: "yogurt-parfait.jpg", isBestSeller: "false", isNewAdded: "false", isVegan: "false",
            extras: "Extra Honey:0.50,Protein Powder:1.50", calories: "280", protein: "18.9", carbs: "34.2",
            fat: "8.7", fiber: "4.2", sugar: "24.8", cookingTime: "3-5 minute", spiceLevel: "Mild",
            servingSize: "250g", difficulty: "Easy", isGlutenFree: "true", isDairyFree: "false",
            isVegetarian: "true", isSpicy: "false", containsNuts: "true", allergens: "Dairy,Nuts"
        },
        {
            name: "Shrimp Scampi", category: "Seafood", price: "18.50", discountPercentage: "0",
            description: "Garlic butter shrimp with linguine",
            ingredients: "Shrimp, Linguine, Garlic, Butter, White wine, Parsley",
            image: "shrimp-scampi.jpg", isBestSeller: "true", isNewAdded: "false", isVegan: "false",
            extras: "Extra Shrimp:5.00,Bread:2.50", calories: "520", protein: "36.4", carbs: "52.8",
            fat: "22.9", fiber: "3.2", sugar: "4.8", cookingTime: "15-20 minute", spiceLevel: "Mild",
            servingSize: "420g", difficulty: "Medium", isGlutenFree: "false", isDairyFree: "false",
            isVegetarian: "false", isSpicy: "false", containsNuts: "false", allergens: "Gluten,Dairy,Shellfish"
        },
        {
            name: "Veggie Wrap", category: "Sandwiches", price: "9.99", discountPercentage: "10",
            description: "Grilled vegetables in whole wheat wrap",
            ingredients: "Whole wheat wrap, Grilled veggies, Hummus, Spinach",
            image: "veggie-wrap.jpg", isBestSeller: "false", isNewAdded: "true", isVegan: "true",
            extras: "Feta Cheese:1.50,Avocado:1.75", calories: "320", protein: "10.8", carbs: "45.6",
            fat: "12.4", fiber: "9.2", sugar: "7.8", cookingTime: "6-8 minute", spiceLevel: "Mild",
            servingSize: "280g", difficulty: "Easy", isGlutenFree: "false", isDairyFree: "true",
            isVegetarian: "true", isSpicy: "false", containsNuts: "true", allergens: "Gluten,Sesame"
        },
        {
            name: "New York Cheesecake", category: "Desserts", price: "8.25", discountPercentage: "0",
            description: "Creamy cheesecake with berry compote",
            ingredients: "Cream cheese, Graham crackers, Sugar, Eggs, Berries",
            image: "cheesecake-ny.jpg", isBestSeller: "true", isNewAdded: "false", isVegan: "false",
            extras: "Extra Compote:1.00,Whipped Cream:0.75", calories: "450", protein: "7.8", carbs: "42.9",
            fat: "29.4", fiber: "1.2", sugar: "35.8", cookingTime: "60+ minute", spiceLevel: "Mild",
            servingSize: "200g", difficulty: "Hard", isGlutenFree: "false", isDairyFree: "false",
            isVegetarian: "true", isSpicy: "false", containsNuts: "true", allergens: "Gluten,Dairy,Eggs"
        },
        {
            name: "Lentil Soup", category: "Soups", price: "7.99", discountPercentage: "20",
            description: "Hearty lentil and vegetable soup",
            ingredients: "Lentils, Carrots, Celery, Onions, Vegetable broth",
            image: "lentil-soup.jpg", isBestSeller: "false", isNewAdded: "true", isVegan: "true",
            extras: "Crusty Bread:2.00,Cheese:1.50", calories: "280", protein: "14.7", carbs: "42.8",
            fat: "4.9", fiber: "15.4", sugar: "8.7", cookingTime: "25-30 minute", spiceLevel: "Mild",
            servingSize: "350g", difficulty: "Easy", isGlutenFree: "true", isDairyFree: "true",
            isVegetarian: "true", isSpicy: "false", containsNuts: "false", allergens: "None"
        },
        {
            name: "Pesto Pasta", category: "Pasta", price: "12.50", discountPercentage: "5",
            description: "Pasta with fresh basil pesto",
            ingredients: "Pasta, Basil pesto, Pine nuts, Parmesan, Olive oil",
            image: "pesto-pasta.jpg", isBestSeller: "false", isNewAdded: "false", isVegan: "true",
            extras: "Grilled Chicken:4.50,Shrimp:5.00", calories: "480", protein: "16.4", carbs: "58.2",
            fat: "22.8", fiber: "5.8", sugar: "4.2", cookingTime: "12-15 minute", spiceLevel: "Mild",
            servingSize: "400g", difficulty: "Easy", isGlutenFree: "false", isDairyFree: "false",
            isVegetarian: "true", isSpicy: "false", containsNuts: "true", allergens: "Gluten,Dairy,Nuts"
        },
        {
            name: "Breakfast Burrito", category: "Breakfast", price: "10.50", discountPercentage: "0",
            description: "Morning burrito with eggs and sausage",
            ingredients: "Tortilla, Eggs, Sausage, Cheese, Potatoes, Salsa",
            image: "breakfast-burrito.jpg", isBestSeller: "true", isNewAdded: "false", isVegan: "false",
            extras: "Bacon:2.00,Guacamole:2.50", calories: "520", protein: "24.8", carbs: "38.9",
            fat: "32.4", fiber: "4.8", sugar: "5.2", cookingTime: "8-10 minute", spiceLevel: "Medium",
            servingSize: "350g", difficulty: "Easy", isGlutenFree: "false", isDairyFree: "false",
            isVegetarian: "false", isSpicy: "true", containsNuts: "false", allergens: "Gluten,Dairy,Eggs"
        }
    ];

    const headers = [
        "name", "category", "price", "discountPercentage", "description", "ingredients", "image", 
        "isBestSeller", "isNewAdded", "isVegan", "extras", "calories", "protein", "carbs", "fat", 
        "fiber", "sugar", "cookingTime", "spiceLevel", "servingSize", "difficulty", "isGlutenFree", 
        "isDairyFree", "isVegetarian", "isSpicy", "containsNuts", "allergens"
    ];
    
    let csvContent = headers.join(",") + "\n";
    
    templateData.forEach(row => {
        const rowData = headers.map(header => `"${row[header]}"`).join(",");
        csvContent += rowData + "\n";
    });

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'products_template.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
    
    toast.info("Template with 21 products downloaded successfully!", { theme: "dark" });
};

    const handleFileUpload = async (event) => {
        const file = event.target.files[0];
        if (!file) return;

        setImportFile(file);
        setImportErrors([]);

        try {
            const products = await parseImportFile(file);
            setImportPreview(products);
            toast.success(`Found ${products.length} products to import`, { theme: "dark" });
        } catch (error) {
            console.error("Error parsing file:", error);
            toast.error("Error reading file. Please check the format.", { theme: "dark" });
        }
    };

    const parseImportFile = (file) => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            
            reader.onload = (e) => {
                try {
                    const content = e.target.result;
                    let products = [];

                    if (file.name.endsWith('.csv')) {
                        products = parseCSV(content);
                    } else {
                        products = parseCSV(content);
                    }

                    const validatedProducts = products.map((product, index) => ({
                        ...product,
                        _row: index + 2
                    }));

                    resolve(validatedProducts);
                } catch (error) {
                    reject(error);
                }
            };

            reader.onerror = () => reject(new Error("Failed to read file"));
            
            if (file.name.endsWith('.csv')) {
                reader.readAsText(file);
            } else {
                reader.readAsArrayBuffer(file);
            }
        });
    };

    const parseCSV = (content) => {
        const lines = content.split('\n').filter(line => line.trim());
        if (lines.length < 2) return [];

        const headers = lines[0].split(',').map(h => h.replace(/"/g, '').trim());
        const products = [];

        for (let i = 1; i < lines.length; i++) {
            let values = [];
            let inQuotes = false;
            let currentValue = '';
            
            for (let char of lines[i]) {
                if (char === '"') {
                    inQuotes = !inQuotes;
                } else if (char === ',' && !inQuotes) {
                    values.push(currentValue.trim().replace(/"/g, ''));
                    currentValue = '';
                } else {
                    currentValue += char;
                }
            }
            values.push(currentValue.trim().replace(/"/g, ''));

            const product = {};
            headers.forEach((header, index) => {
                product[header] = values[index] || '';
            });

            if (product.name && product.category && product.price) {
                // Parse extras
                const parsedExtras = [];
                if (product.extras) {
                    const extrasArray = product.extras.split(',');
                    extrasArray.forEach(extra => {
                        const [name, price] = extra.split(':');
                        if (name && price) {
                            const numericPrice = parseFloat(price.trim());
                            if (!isNaN(numericPrice)) {
                                parsedExtras.push({
                                    name: name.trim(),
                                    price: numericPrice.toFixed(2)
                                });
                            }
                        }
                    });
                }

                // Parse allergens
                const parsedAllergens = product.allergens ? 
                    product.allergens.split(',').map(a => a.trim()).filter(a => a) : [];

                // Calculate discounted price
                const priceValue = parseFloat(product.price) || 0;
                const discountValue = parseFloat(product.discountPercentage) || 0;
                let discountedPrice = priceValue;
                if (discountValue > 0 && discountValue <= 100) {
                    discountedPrice = priceValue * (1 - discountValue / 100);
                }

                products.push({
                    name: product.name,
                    category: product.category,
                    price: priceValue,
                    discountPercentage: discountValue,
                    discountedPrice: discountedPrice,
                    description: product.description || '',
                    ingredients: product.ingredients || '',
                    image: product.image || null,
                    isBestSeller: product.isBestSeller === 'true',
                    isNewAdded: product.isNewAdded === 'true',
                    isVegan: product.isVegan === 'true',
                    extras: parsedExtras,
                    nutrition: {
                        calories: parseFloat(product.calories) || 0,
                        protein: parseFloat(product.protein) || 0,
                        carbs: parseFloat(product.carbs) || 0,
                        fat: parseFloat(product.fat) || 0,
                        fiber: parseFloat(product.fiber) || 0,
                        sugar: parseFloat(product.sugar) || 0
                    },
                    preparation: {
                        cookingTime: product.cookingTime || '',
                        spiceLevel: product.spiceLevel || '',
                        servingSize: product.servingSize || '',
                        difficulty: product.difficulty || ''
                    },
                    dietaryInfo: {
                        isGlutenFree: product.isGlutenFree === 'true',
                        isDairyFree: product.isDairyFree === 'true',
                        isVegetarian: product.isVegetarian === 'true',
                        isSpicy: product.isSpicy === 'true',
                        containsNuts: product.containsNuts === 'true'
                    },
                    allergens: parsedAllergens
                });
            }
        }

        return products;
    };

    const processImport = async () => {
        if (!importPreview.length) return;

        setIsImporting(true);
        setImportProgress(0);
        setImportErrors([]);

        const errors = [];
        let successCount = 0;

        // Creează un map de imagini după nume
        const imageMap = new Map();
        importImages.forEach(file => {
            imageMap.set(file.name, file);
        });

        for (let i = 0; i < importPreview.length; i++) {
            const product = importPreview[i];
            
            try {
                if (!product.name || !product.category || !product.price) {
                    errors.push({
                        row: product._row,
                        message: "Missing required fields (name, category, or price)"
                    });
                    continue;
                }

                const formData = new FormData();
                formData.append("name", product.name);
                formData.append("category", product.category);
                formData.append("price", product.price.toString());
                formData.append("discountPercentage", product.discountPercentage.toString());
                formData.append("description", product.description);
                formData.append("ingredients", product.ingredients);
                formData.append("isBestSeller", product.isBestSeller.toString());
                formData.append("isNewAdded", product.isNewAdded.toString());
                formData.append("isVegan", product.isVegan.toString());
                formData.append("extras", JSON.stringify(product.extras || []));
                formData.append("nutrition", JSON.stringify(product.nutrition || {}));
                formData.append("preparation", JSON.stringify(product.preparation || {}));
                formData.append("dietaryInfo", JSON.stringify(product.dietaryInfo || {}));
                formData.append("allergens", JSON.stringify(product.allergens || []));

                // Găsește imaginea după nume
                if (product.image && imageMap.has(product.image)) {
                    formData.append("image", imageMap.get(product.image));
                } else if (product.image) {
                    console.warn(`Image not found for product ${product.name}: ${product.image}`);
                }

                const response = await axios.post(`${url}/api/food/add`, formData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });

                if (response.data.success) {
                    successCount++;
                } else {
                    errors.push({
                        row: product._row,
                        message: response.data.message || "Failed to add product"
                    });
                }
            } catch (error) {
                errors.push({
                    row: product._row,
                    message: error.response?.data?.message || "Network error"
                });
            }

            const progress = Math.round(((i + 1) / importPreview.length) * 100);
            setImportProgress(progress);
        }

        setIsImporting(false);
        setImportErrors(errors);

        if (successCount > 0) {
            toast.success(`Successfully imported ${successCount} products!`, { theme: "dark" });
            onProductsImported();
            
            // Resetează importul după succes
            setImportFile(null);
            setImportPreview([]);
            setImportImages([]);
        }

        if (errors.length > 0) {
            toast.error(`Failed to import ${errors.length} products`, { theme: "dark" });
        }
    };

    if (!isOpen) return null;

    return (
        <motion.div
            className="fixed inset-0 z-[9999] flex items-center justify-center bg-black bg-opacity-70 backdrop-blur-sm"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        >
            <motion.div
                className="relative bg-gray-800 border border-gray-700 rounded-2xl shadow-2xl w-full max-w-4xl mx-4 max-h-[90vh] overflow-y-auto"
                initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                transition={{ type: "spring", damping: 25, stiffness: 300 }}
            >
                <div className="flex items-center justify-between p-6 border-b border-gray-700">
                    <h3 className="text-2xl font-bold text-white">Bulk Import Products</h3>
                    <button 
                        onClick={() => {
                            onClose();
                            setImportFile(null);
                            setImportPreview([]);
                            setImportErrors([]);
                            setImportImages([]);
                        }} 
                        className="text-gray-400 hover:text-white transition-colors duration-200 p-2 rounded-lg hover:bg-gray-700"
                    >
                        <X size={24} />
                    </button>
                </div>

                <div className="p-6 space-y-6">
                    {/* File Upload Section */}
                    <div className="space-y-4">
                        <label className="block text-lg font-semibold text-white">Upload Excel/CSV File</label>
                        
                        <div className="bg-blue-900/20 border border-blue-700 rounded-lg p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h4 className="text-blue-300 font-medium">Download Template</h4>
                                    <p className="text-blue-200 text-sm">Use our template to ensure correct formatting</p>
                                </div>
                                <button
                                    onClick={downloadTemplate}
                                    className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg transition-colors duration-200 flex items-center gap-2"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                    </svg>
                                    Download Template
                                </button>
                            </div>
                        </div>

                        <label htmlFor="import-file" className="cursor-pointer group">
                            <div className="w-full h-32 border-2 border-dashed border-gray-600 rounded-xl flex flex-col items-center justify-center transition-all duration-300 group-hover:border-green-500 group-hover:bg-gray-700/50">
                                {importFile ? (
                                    <div className="text-center">
                                        <svg className="w-12 h-12 text-green-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                        <p className="text-green-400 font-medium">{importFile.name}</p>
                                        <p className="text-gray-400 text-sm">Click to change file</p>
                                    </div>
                                ) : (
                                    <div className="text-center">
                                        <svg className="w-12 h-12 text-gray-400 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
                                        </svg>
                                        <p className="text-gray-400 text-sm">Click to upload Excel or CSV file</p>
                                        <p className="text-gray-500 text-xs mt-1">Supports .xlsx, .xls, .csv files</p>
                                    </div>
                                )}
                            </div>
                            <input 
                                onChange={handleFileUpload} 
                                type="file" 
                                id="import-file" 
                                hidden 
                                accept=".xlsx,.xls,.csv"
                            />
                        </label>
                    </div>

                    {/* Image Upload Section */}
                    <div className="space-y-4">
                        <label className="block text-lg font-semibold text-white">Upload Product Images</label>
                        
                        <label htmlFor="import-images" className="cursor-pointer group">
                            <div className="w-full h-32 border-2 border-dashed border-gray-600 rounded-xl flex flex-col items-center justify-center transition-all duration-300 group-hover:border-blue-500 group-hover:bg-gray-700/50">
                                <svg className="w-12 h-12 text-gray-400 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                                <p className="text-gray-400 text-sm">Drag & drop product images here</p>
                                <p className="text-gray-500 text-xs mt-1">or click to select files</p>
                            </div>
                            <input 
                                onChange={(e) => setImportImages(prev => [...prev, ...Array.from(e.target.files)])} 
                                type="file" 
                                id="import-images" 
                                hidden 
                                multiple 
                                accept="image/*"
                            />
                        </label>

                        {importImages.length > 0 && (
                            <div className="bg-gray-700/30 rounded-lg p-4">
                                <h4 className="text-white font-medium mb-2">
                                    Selected Images ({importImages.length})
                                </h4>
                                <div className="grid grid-cols-4 gap-3 max-h-40 overflow-y-auto">
                                    {importImages.map((file, index) => (
                                        <div key={index} className="relative group">
                                            <img 
                                                src={URL.createObjectURL(file)} 
                                                alt={file.name}
                                                className="w-16 h-16 object-cover rounded-lg"
                                            />
                                            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all rounded-lg flex items-center justify-center">
                                                <button
                                                    type="button"
                                                    onClick={() => setImportImages(prev => prev.filter((_, i) => i !== index))}
                                                    className="opacity-0 group-hover:opacity-100 bg-red-500 text-white rounded-full p-1 transition-all"
                                                >
                                                    <X size={12} />
                                                </button>
                                            </div>
                                            <p className="text-gray-400 text-xs truncate mt-1" title={file.name}>
                                                {file.name}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Preview Section */}
                    {importPreview.length > 0 && (
                        <div className="space-y-4">
                            <div className="flex justify-between items-center">
                                <h4 className="text-lg font-semibold text-white">
                                    Preview ({importPreview.length} products)
                                </h4>
                                <button
                                    onClick={processImport}
                                    disabled={isImporting}
                                    className="bg-green-600 hover:bg-green-500 disabled:bg-green-800 text-white px-6 py-2 rounded-lg transition-colors duration-200 flex items-center gap-2"
                                >
                                    {isImporting ? (
                                        <>
                                            <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                                            Importing... ({importProgress}%)
                                        </>
                                    ) : (
                                        <>
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                                            </svg>
                                            Start Import
                                        </>
                                    )}
                                </button>
                            </div>

                            {isImporting && (
                                <div className="w-full bg-gray-700 rounded-full h-2">
                                    <div 
                                        className="bg-green-500 h-2 rounded-full transition-all duration-300"
                                        style={{ width: `${importProgress}%` }}
                                    ></div>
                                </div>
                            )}

                            <div className="bg-gray-700/30 rounded-lg p-4 max-h-64 overflow-y-auto">
                                <table className="min-w-full">
                                    <thead>
                                        <tr className="border-b border-gray-600">
                                            <th className="text-left text-xs font-medium text-gray-400 pb-2">Name</th>
                                            <th className="text-left text-xs font-medium text-gray-400 pb-2">Category</th>
                                            <th className="text-left text-xs font-medium text-gray-400 pb-2">Price</th>
                                            <th className="text-left text-xs font-medium text-gray-400 pb-2">Discount</th>
                                            <th className="text-left text-xs font-medium text-gray-400 pb-2">Ingredients</th>
                                            <th className="text-left text-xs font-medium text-gray-400 pb-2">Extras</th>
                                            <th className="text-left text-xs font-medium text-gray-400 pb-2">Image</th>
                                            <th className="text-left text-xs font-medium text-gray-400 pb-2">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {importPreview.slice(0, 10).map((product, index) => {
                                            const hasImage = importImages.some(img => img.name === product.image);
                                            return (
                                                <tr key={index} className="border-b border-gray-600/50">
                                                    <td className="py-2 text-sm text-white">{product.name}</td>
                                                    <td className="py-2 text-sm text-gray-300">{product.category}</td>
                                                    <td className="py-2 text-sm text-green-400">{product.price} €</td>
                                                    <td className="py-2 text-sm text-orange-400">
                                                        {product.discountPercentage > 0 ? `${product.discountPercentage}%` : '0%'}
                                                    </td>
                                                    <td className="py-2 text-sm text-gray-300 max-w-xs truncate" title={product.ingredients}>
                                                        {product.ingredients || <span className="text-gray-500">No ingredients</span>}
                                                    </td>
                                                    <td className="py-2 text-sm text-gray-300">
                                                        {product.extras?.length > 0 ? (
                                                            <div className="text-xs">
                                                                {product.extras.map((extra, idx) => (
                                                                    <div key={idx}>{extra.name} (+{extra.price}€)</div>
                                                                ))}
                                                            </div>
                                                        ) : (
                                                            <span className="text-gray-500">No extras</span>
                                                        )}
                                                    </td>
                                                    <td className="py-2 text-sm">
                                                        {product.image ? (
                                                            <span className={hasImage ? "text-green-400" : "text-yellow-400"}>
                                                                {hasImage ? '✓ Ready' : '⏳ Missing'}
                                                            </span>
                                                        ) : (
                                                            <span className="text-gray-400">No image</span>
                                                        )}
                                                    </td>
                                                    <td className="py-2 text-sm">
                                                        {hasImage || !product.image ? (
                                                            <span className="text-green-400">Ready</span>
                                                        ) : (
                                                            <span className="text-yellow-400">Waiting for image</span>
                                                        )}
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                                {importPreview.length > 10 && (
                                    <p className="text-gray-400 text-sm mt-2">
                                        ... and {importPreview.length - 10} more products
                                    </p>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Errors Display */}
                    {importErrors.length > 0 && (
                        <div className="space-y-3">
                            <h4 className="text-lg font-semibold text-red-400">Import Errors</h4>
                            <div className="bg-red-900/20 border border-red-700 rounded-lg p-4 max-h-48 overflow-y-auto">
                                {importErrors.map((error, index) => (
                                    <div key={index} className="text-red-300 text-sm mb-2">
                                        <strong>Row {error.row}:</strong> {error.message}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Instructions */}
                    <div className="bg-gray-700/30 rounded-lg p-4">
                        <h4 className="text-lg font-semibold text-white mb-3">File Format Instructions</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-300">
                            <div>
                                <p><strong>Required Columns:</strong></p>
                                <ul className="list-disc list-inside space-y-1 mt-2">
                                    <li><code>name</code> - Product name</li>
                                    <li><code>category</code> - Existing category</li>
                                    <li><code>price</code> - Price in euros</li>
                                    <li><code>description</code> - Product description</li>
                                </ul>
                            </div>
                            <div>
                                <p><strong>Optional Columns:</strong></p>
                                <ul className="list-disc list-inside space-y-1 mt-2">
                                    <li><code>discountPercentage</code> - Discount percentage (0-100)</li>
                                    <li><code>ingredients</code> - List of ingredients</li>
                                    <li><code>image</code> - Image filename (must match uploaded images)</li>
                                    <li><code>isBestSeller</code> - true/false</li>
                                    <li><code>isNewAdded</code> - true/false</li>
                                    <li><code>isVegan</code> - true/false</li>
                                    <li><code>extras</code> - Format: "Extra1:1.50,Extra2:2.00"</li>
                                    <li><code>calories, protein, carbs, fat, fiber, sugar</code> - Nutritional info</li>
                                    <li><code>cookingTime, spiceLevel, servingSize, difficulty</code> - Preparation info</li>
                                    <li><code>isGlutenFree, isDairyFree, isVegetarian, isSpicy, containsNuts</code> - Dietary info</li>
                                    <li><code>allergens</code> - Comma separated list</li>
                                </ul>
                            </div>
                        </div>
                        <div className="mt-4 p-3 bg-blue-900/20 rounded-lg">
                            <p className="text-blue-300 text-sm">
                                <strong>Tip:</strong> Make sure image filenames in CSV match exactly with uploaded images (case-sensitive).
                            </p>
                            <p className="text-blue-300 text-sm mt-1">
                                <strong>Ingredients Format:</strong> List ingredients separated by commas - Example: "Tomato sauce, Mozzarella, Basil"
                            </p>
                            <p className="text-blue-300 text-sm mt-1">
                                <strong>Extras Format:</strong> Use "Name:Price,Name:Price" - Example: "Extra Cheese:1.50,Olives:0.75"
                            </p>
                            <p className="text-blue-300 text-sm mt-1">
                                <strong>Allergens Format:</strong> Comma separated list - Example: "Gluten,Dairy,Nuts"
                            </p>
                        </div>
                    </div>
                </div>
            </motion.div>
        </motion.div>
    );
};

export default ImportProductsModal;