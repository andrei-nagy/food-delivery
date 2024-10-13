const placeOrderCash = async (req, res) => {
    try {
        let counter = await OrderCounter.findOne();

        if (!counter) {
            counter = new OrderCounter({ counter: 1 });
            await counter.save();
        }

        const orderNumber = counter.counter;

        const newOrder = new orderModel({
            userId: req.body.userId,
            items: req.body.items,
            amount: req.body.amount,
            tableNo: req.body.tableNo,
            userData: req.body.userData,
            orderNumber: orderNumber,
            payment: false  // Setăm comanda ca neplătită inițial (plata se face la livrare)
        });

        await newOrder.save();
        counter.counter += 1;
        await counter.save();

        await userModel.findByIdAndUpdate(req.body.userId, { cartData: {} });

        res.json({
            success: true,
            message: "Order placed successfully (cash/POS)"
        });
    } catch (error) {
        console.log(error);
        res.json({
            success: false,
            message: error
        });
    }
};
