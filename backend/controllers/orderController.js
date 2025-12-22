import orderModel from "../models/orderModel.js";
import userModel from "../models/userModel.js";
import OrderCounter from "../models/orderCounter.js";
import Stripe from "stripe";
import dotenv from "dotenv";
import { clearUserCart } from "./cartHelper.js";
import PromoCode from "../models/promoCodeModel.js";
import splitBillController from "./splitBillController.js";
import SplitPayment from "../models/splitPaymentModel.js";
import nodemailer from 'nodemailer';


dotenv.config();

const stripeKey = process.env.STRIPE_SECRET_KEY;
const stripe = new Stripe(stripeKey);

// ✅ Funcție helper care primește req ca parametru
const getBaseUrl = (req) => {
  const origin = req.headers.origin;

  if (origin) {
    return origin;
  }

  const host = req.headers.host;
  if (host) {
    const isLocalhost =
      host.includes("localhost") || host.includes("127.0.0.1");
    const protocol = isLocalhost ? "http" : "https";
    return `${protocol}://${host}`;
  }

  return "http://localhost:5173";
};

// ✅ Funcție helper pentru verificarea dacă TOATE item-urile din TOATE comenzile sunt complet plătite
const checkAllOrdersFullyPaid = async (userId) => {
  try {
    console.log(`🔍 [checkAllOrdersFullyPaid] Checking all orders for user ${userId}`);
    
    // Găsește toate order-urile userului
    const orders = await orderModel.find({ userId: userId });
    
    if (orders.length === 0) {
      console.log(`📭 [checkAllOrdersFullyPaid] No orders found for user ${userId}`);
      return true; // Niciun order = totul e plătit
    }
    
    // Găsește toate split bill-urile COMPLETATE pentru acest user
    const completedSplits = await SplitPayment.find({
      userId: userId,
      status: { $in: ['completed', 'paid', 'success'] } // Doar cele complet plătite
    });
    
    // Găsește split bill-urile PENDING pentru debugging
    const pendingSplits = await SplitPayment.find({
      userId: userId,
      status: 'pending'
    });
    
    console.log(`📊 [checkAllOrdersFullyPaid] Found:`, {
      orders: orders.length,
      completedSplits: completedSplits.length,
      pendingSplits: pendingSplits.length
    });
    
    // Verifică fiecare item din fiecare order
    let allItemsFullyPaid = true;
    let unpaidItems = [];
    
    for (const order of orders) {
      console.log(`📦 Checking order ${order._id} (${order.items?.length || 0} items)`);
      
      for (const item of order.items || []) {
        const itemId = item._id ? item._id.toString() : 'unknown';
        const itemName = item.name || 'Unnamed item';
        const foodId = item.foodId || 'unknown';
        
        // Calculează totalul item-ului
        const itemTotal = (item.price || 0) * (item.quantity || 1);
        
        // Calculează cât a fost plătit pentru acest item
        let totalPaidForItem = 0;
        
        // 1. Plăți directe din paidBy array
        if (item.paidBy && item.paidBy.length > 0) {
          totalPaidForItem += item.paidBy.reduce((sum, payment) => 
            sum + (payment.amount || 0), 0);
        }
        
        // 2. Plăți din split bills COMPLETATE pentru acest item
        for (const split of completedSplits) {
          const splitItem = split.items.find(si => {
            // Verifică multiple moduri de potrivire
            return (
              si._id === itemId ||
              (si._id && si._id.toString() === itemId) ||
              si.foodId === foodId ||
              (si.name === itemName && Math.abs(si.price - item.price) < 0.01)
            );
          });
          
          if (splitItem) {
            // Acest split bill completat include acest item - adaugă la totalul plătit
            const splitPaymentAmount = (splitItem.price || 0) * (splitItem.quantity || 0);
            totalPaidForItem += splitPaymentAmount;
            console.log(`   • Item "${itemName}" has completed split payment: ${splitPaymentAmount}`);
          }
        }
        
        // Verifică dacă item-ul este complet plătit
        const isItemFullyPaid = totalPaidForItem >= itemTotal;
        
        if (!isItemFullyPaid) {
          allItemsFullyPaid = false;
          unpaidItems.push({
            orderId: order._id,
            orderNumber: order.orderNumber,
            itemId: itemId,
            itemName: itemName,
            itemTotal: itemTotal,
            paidSoFar: totalPaidForItem,
            remaining: itemTotal - totalPaidForItem,
            status: item.status || 'unknown',
            hasPendingSplits: pendingSplits.some(split => 
              split.items.some(si => 
                si._id === itemId ||
                (si._id && si._id.toString() === itemId) ||
                si.foodId === foodId
              )
            )
          });
          
          console.log(`❌ Item "${itemName}" NOT fully paid: ${totalPaidForItem}/${itemTotal}`);
          if (pendingSplits.some(split => split.items.some(si => si._id === itemId))) {
            console.log(`   ⚠️ This item has PENDING split bill!`);
          }
        } else {
          console.log(`✅ Item "${itemName}" fully paid: ${totalPaidForItem}/${itemTotal}`);
        }
      }
    }
    
    // ✅ LOGICĂ SPECIALĂ: Dacă există split bills PENDING, userul TREBUIE să rămână ACTIV
    if (pendingSplits.length > 0) {
      console.log(`⚠️ [checkAllOrdersFullyPaid] User has ${pendingSplits.length} PENDING split bills`);
      console.log(`   • Pending split IDs:`, pendingSplits.map(s => s._id));
      console.log(`   • User MUST remain ACTIVE to pay these splits`);
      
      // Chiar dacă toate item-urile sunt "plătite" pe hârtie,
      // split bill-urile PENDING înseamnă că userul are datorii
      return false; // Forțează return false dacă există split bills pending
    }
    
    console.log(`📊 [checkAllOrdersFullyPaid] Final result:`, {
      totalOrders: orders.length,
      allItemsFullyPaid: allItemsFullyPaid,
      unpaidItemsCount: unpaidItems.length,
      hasPendingSplits: pendingSplits.length > 0,
      shouldUserBeActive: !allItemsFullyPaid || pendingSplits.length > 0
    });
    
    // Userul trebuie să fie activ dacă:
    // 1. Are item-uri neplătite SAU
    // 2. Are split bills pending
    return allItemsFullyPaid && pendingSplits.length === 0;
    
  } catch (error) {
    console.error("❌ [checkAllOrdersFullyPaid] Error:", error);
    return false;
  }
};

// ✅ Funcție helper pentru verificarea și deactivarea userului - VERSIUNE ULTIMATIVĂ
const checkAndDeactivateUser = async (userId) => {
  try {
    console.log(`🔍 [checkAndDeactivateUser] START - Checking user ${userId}`);

    // Mai întâi verifică starea curentă a userului
    const user = await userModel.findById(userId);
    if (!user) {
      console.log(`❌ [checkAndDeactivateUser] User ${userId} not found`);
      return false;
    }

    console.log(
      `📊 [checkAndDeactivateUser] User ${userId} current isActive: ${user.isActive}`
    );

    // Dacă userul este deja inactiv, nu facem nimic
    if (user.isActive === false) {
      console.log(
        `ℹ️ [checkAndDeactivateUser] User ${userId} is already inactive - no action needed`
      );
      return true;
    }

    // ✅ VERIFICARE COMPLETĂ: Toate item-urile din toate order-urile sunt plătite?
    const allItemsFullyPaid = await checkAllOrdersFullyPaid(userId);

    if (!allItemsFullyPaid) {
      // ❌ Userul are item-uri neplătite - TREBUIE SĂ RĂMÂNĂ ACTIV
      console.log(
        `⚠️ [checkAndDeactivateUser] User ${userId} KEPT ACTIVE - has unpaid items`
      );
      return false;
    }

    // ✅ TOATE ITEM-URILE SUNT PLĂTITE - verifică dacă există split bills pending
    const pendingSplits = await SplitPayment.countDocuments({
      userId: userId,
      status: "pending",
    });

    if (pendingSplits > 0) {
      // Split bills pending, dar toate item-urile sunt deja plătite?
      // Aceste split bills sunt probabil "stale" sau duplicate
      console.log(
        `🔍 [checkAndDeactivateUser] User has ${pendingSplits} pending splits but all items are paid`
      );
      console.log(`   • These splits might be stale or duplicate payments`);
      console.log(`   • Marking them as completed/expired`);

      // Marchează split bills-urile pending ca completed (pentru că item-urile sunt deja plătite)
      await SplitPayment.updateMany(
        {
          userId: userId,
          status: "pending",
        },
        {
          status: "completed",
          paymentDate: new Date(),
          notes: "Auto-completed: items already fully paid",
        }
      );
    }

    // ✅ TOATE CONDIȚIILE SUNT ÎNDEPLINITE - DEZACTIVĂM USERUL
    console.log(`✅ [checkAndDeactivateUser] User ${userId} DEACTIVATED:`);
    console.log(`   • All items in all orders are fully paid`);
    console.log(`   • No pending splits (or they were auto-completed)`);

    await userModel.findByIdAndUpdate(userId, { isActive: false });
    return true;
  } catch (error) {
    console.error("❌ [checkAndDeactivateUser] Error:", error);
    return false;
  }
};

// ✅ Funcție pentru curățarea order-urilor complet plătite
const clearFullyPaidOrders = async (userId) => {
  try {
    console.log(
      `🧹 [clearFullyPaidOrders] Checking fully paid orders for user ${userId}`
    );

    // Găsește order-urile complet plătite
    const orders = await orderModel.find({ userId: userId });

    let fullyPaidOrders = [];
    let partiallyPaidOrders = [];

    for (const order of orders) {
      // Folosește metoda isFullyPaid dacă există, altfolosește payment field
      if (typeof order.isFullyPaid === "function") {
        if (order.isFullyPaid()) {
          fullyPaidOrders.push(order._id);
        } else {
          partiallyPaidOrders.push(order._id);
        }
      } else {
        if (order.payment === true) {
          fullyPaidOrders.push(order._id);
        } else {
          partiallyPaidOrders.push(order._id);
        }
      }
    }

    console.log(
      `📊 [clearFullyPaidOrders] User ${userId} has ${fullyPaidOrders.length} fully paid and ${partiallyPaidOrders.length} partially/unpaid orders`
    );

    // Nu ștergem order-urile, doar le marcam ca procesate
    // Poți să adaugi logică aici pentru mutarea în istoric

    return {
      success: true,
      fullyPaidCount: fullyPaidOrders.length,
      partiallyPaidCount: partiallyPaidOrders.length,
      fullyPaidOrders: fullyPaidOrders,
    };
  } catch (error) {
    console.error(`❌ [clearFullyPaidOrders] Error:`, error);
    return { success: false, message: error.message };
  }
};

// ✅ Funcție pentru debugging extins al stării utilizatorului
const debugUserState = async (userId) => {
  try {
    console.log(`🔍 [debugUserState] DEBUG START for user ${userId}`);

    // 1. Verifică userul
    const user = await userModel.findById(userId);
    console.log(`👤 User info:`, {
      _id: user?._id,
      name: user?.name,
      email: user?.email,
      isActive: user?.isActive,
      cartData: user?.cartData ? "Has cart data" : "No cart data",
    });

    if (!user) {
      console.log(`❌ User not found`);
      return null;
    }

    // 2. Verifică toate order-urile
    const orders = await orderModel.find({ userId: userId });
    console.log(`📦 Total orders found: ${orders.length}`);

    let orderDetails = [];
    for (const order of orders) {
      let isOrderFullyPaid = false;

      if (typeof order.isFullyPaid === "function") {
        isOrderFullyPaid = order.isFullyPaid();
      } else {
        if (order.items && order.items.length > 0) {
          const allItemsFullyPaid = order.items.every((item) => {
            if (item.status === "fully_paid") return true;

            if (item.paidBy && item.paidBy.length > 0) {
              const totalPaid = item.paidBy.reduce(
                (sum, payment) => sum + (payment.amount || 0),
                0
              );
              const itemTotal = (item.price || 0) * (item.quantity || 1);
              return totalPaid >= itemTotal;
            }
            return false;
          });

          isOrderFullyPaid = order.payment === true && allItemsFullyPaid;
        } else {
          isOrderFullyPaid = order.payment === true;
        }
      }

      orderDetails.push({
        orderId: order._id,
        orderNumber: order.orderNumber,
        payment: order.payment,
        isFullyPaid: isOrderFullyPaid,
        itemsCount: order.items?.length || 0,
        items:
          order.items?.map((item) => ({
            name: item.name,
            quantity: item.quantity,
            price: item.price,
            status: item.status,
            paidByCount: item.paidBy?.length || 0,
            totalPaid:
              item.paidBy?.reduce((sum, p) => sum + (p.amount || 0), 0) || 0,
            itemTotal: (item.price || 0) * (item.quantity || 1),
          })) || [],
      });
    }

    console.log(`📊 Order details:`, orderDetails);

    // 3. Verifică split payments
    const splitPayments = await SplitPayment.find({ userId: userId });
    console.log(`💰 Split payments found: ${splitPayments.length}`);

    splitPayments.forEach((split) => {
      console.log(
        `   • Split ${split._id}: status=${split.status}, amount=${split.amount}, method=${split.paymentMethod}`
      );
    });

    // 4. Calculează statistici
    const fullyPaidOrders = orderDetails.filter((o) => o.isFullyPaid).length;
    const partiallyPaidOrders = orderDetails.filter(
      (o) => !o.isFullyPaid && o.payment === true
    ).length;
    const unpaidOrders = orderDetails.filter((o) => o.payment === false).length;

    console.log(`📈 Statistics:`);
    console.log(`   • Total orders: ${orders.length}`);
    console.log(`   • Fully paid orders: ${fullyPaidOrders}`);
    console.log(`   • Partially paid orders: ${partiallyPaidOrders}`);
    console.log(`   • Unpaid orders: ${unpaidOrders}`);
    console.log(`   • User isActive: ${user.isActive}`);
    console.log(`   • Should be active: ${fullyPaidOrders < orders.length}`);
    console.log(`🔍 [debugUserState] DEBUG END for user ${userId}`);

    return {
      user,
      orders: orderDetails,
      splitPayments,
      statistics: {
        totalOrders: orders.length,
        fullyPaidOrders,
        partiallyPaidOrders,
        unpaidOrders,
        userIsActive: user.isActive,
      },
    };
  } catch (error) {
    console.error(`❌ [debugUserState] Error:`, error);
    return null;
  }
};

const placeOrder = async (req, res) => {
  const frontend_url = getBaseUrl(req);

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
      paymentMethod: "Online card",
      specialInstructions: req.body.specialInstructions,
    });

    await newOrder.save();

    counter.counter += 1;
    await counter.save();

    const line_items = req.body.items.map((item) => ({
      price_data: {
        currency: "ron",
        product_data: {
          name: "Total Amount",
        },
        unit_amount: Math.round(req.body.amount * 100 * 5.08),
      },
      quantity: 1,
    }));

    const session = await stripe.checkout.sessions.create({
      line_items: line_items,
      mode: "payment",
      success_url: `${frontend_url}/verify?success=true&orderId=${newOrder._id}`,
      cancel_url: `${frontend_url}/verify?success=false&orderId=${newOrder._id}`,
    });

    res.json({
      success: true,
      session_url: session.url,
    });
  } catch (error) {
    console.error("❌ Error in placeOrder:", error);
    res.json({
      success: false,
      message: "Error placing order",
    });
  }
};

const payOrderCash = async (req, res) => {
  try {
    const {
      orders,
      amount,
      userId,
      promoCode,
      promoDiscount,
      tableNo,
      specialInstructions,
    } = req.body;

    if (!orders || orders.length === 0) {
      return res
        .status(400)
        .json({ success: false, message: "No orders provided." });
    }

    console.log(
      `💵 [payOrderCash] Processing cash payment for user ${userId}, ${orders.length} orders`
    );

    // ✅ VERIFICĂ STARE USER ÎNAINTE DE PROCESARE
    if (userId) {
      const userBefore = await userModel.findById(userId);
      console.log(
        `👤 [payOrderCash] User ${userId} status BEFORE processing:`,
        {
          isActive: userBefore?.isActive,
          name: userBefore?.name || "No name",
          email: userBefore?.email || "No email",
        }
      );
    }

    // ✅ INCREMENTEAZĂ USAGE-UL PENTRU PROMO CODE PENTRU CASH
    if (promoCode && promoCode !== "null" && promoCode !== "undefined") {
      try {
        console.log(`🔄 [payOrderCash] Looking for promo code: ${promoCode}`);
        const promoCodeDoc = await PromoCode.findOne({
          code: promoCode.toUpperCase().trim(),
        });

        if (promoCodeDoc) {
          console.log(
            `✅ [payOrderCash] Found promo code: ${promoCodeDoc.code}, current usage: ${promoCodeDoc.usedCount}`
          );

          // Incrementează contorul de utilizări
          const updatedPromo = await PromoCode.findByIdAndUpdate(
            promoCodeDoc._id,
            { $inc: { usedCount: 1 } },
            { new: true }
          );

          console.log(
            `✅ [payOrderCash] Promo code usage incremented to: ${updatedPromo.usedCount}`
          );
        } else {
          console.log(`❌ [payOrderCash] Promo code not found: ${promoCode}`);
        }
      } catch (promoError) {
        console.error(
          "❌ [payOrderCash] Error incrementing promo code usage:",
          promoError
        );
      }
    }

    // ✅ MODIFICAT: Actualizează order-urile CORECT pentru plăți complete
    for (const orderId of orders) {
      const order = await orderModel.findById(orderId);
      if (order) {
        console.log(`📝 [payOrderCash] Processing order: ${order._id}`);

        // Adaugă plățile pentru fiecare item (plata completă)
        order.items.forEach((item) => {
          if (!item.paidBy) {
            item.paidBy = [];
          }

          item.paidBy.push({
            userId: userId,
            amount: item.price * item.quantity,
            quantity: item.quantity,
            paymentDate: new Date(),
            paymentMethod: "cash",
          });

          item.status = "fully_paid";
        });

        // ✅ Apelează updatePaymentStatus dacă există
        if (typeof order.updatePaymentStatus === "function") {
          console.log(
            `🔄 [payOrderCash] Calling updatePaymentStatus for order ${order._id}`
          );
          order.updatePaymentStatus();
        } else {
          // Fallback
          order.payment = true;
          order.paymentMethod = "Cash / POS";
          order.paymentDate = new Date();
        }

        await order.save();
        console.log(`✅ [payOrderCash] Order ${order._id} marked as paid`);
      }
    }

    // ✅ VERIFICĂ STARE USER DUPĂ PROCESARE
    if (userId) {
      const userAfter = await userModel.findById(userId);
      console.log(
        `👤 [payOrderCash] User ${userId} status AFTER processing (before deactivation check):`,
        {
          isActive: userAfter?.isActive,
          name: userAfter?.name || "No name",
        }
      );

      // Curăță cart-ul DOAR pentru plăți complete
      const result = await clearUserCart(userId);
      console.log(`✅ [payOrderCash] Cart cleared for user ${userId}:`, result);

      // ⚠️ SCHIMBARE: Verifică dacă TOATE order-urile sunt plătite înainte de a dezactiva
      console.log(
        `🔍 [payOrderCash] Checking if user ${userId} should be deactivated...`
      );
      const userDeactivated = await checkAndDeactivateUser(userId);

      if (userDeactivated) {
        console.log(
          `✅ [payOrderCash] User ${userId} DEACTIVATED - ALL orders fully paid`
        );
      } else {
        console.log(
          `⚠️ [payOrderCash] User ${userId} KEPT ACTIVE - NOT all orders fully paid`
        );
      }

      // Debug final state
      const finalUser = await userModel.findById(userId);
      console.log(`👤 [payOrderCash] User ${userId} FINAL status:`, {
        isActive: finalUser?.isActive,
        name: finalUser?.name || "No name",
      });
    }

    console.log("✅ [payOrderCash] Cash payment processed successfully");

    res.json({
      success: true,
      message: "Cash payment processed successfully",
      data: { orders },
    });
  } catch (error) {
    console.log("🔴 [payOrderCash] Error:", error);
    res.json({
      success: false,
      message: "Error processing cash payment",
    });
  }
};

const payOrder = async (req, res) => {
  const frontend_url = getBaseUrl(req);

  try {
    const { orders, amount, userId, promoCode, promoDiscount } = req.body;

    if (!orders || orders.length === 0) {
      return res
        .status(400)
        .json({ success: false, message: "No orders provided." });
    }

    console.log(
      `💳 [payOrder] Processing card payment for user ${userId}, ${orders.length} orders, amount: ${amount}`
    );

    // ✅ VERIFICĂ STARE USER ÎNAINTE DE PROCESARE
    if (userId) {
      const userBefore = await userModel.findById(userId);
      console.log(`👤 [payOrder] User ${userId} status BEFORE processing:`, {
        isActive: userBefore?.isActive,
        name: userBefore?.name || "No name",
      });
    }

    // ✅ INCREMENTEAZĂ USAGE-UL PENTRU PROMO CODE (dacă există)
    if (promoCode && promoCode !== "null" && promoCode !== "undefined") {
      try {
        const promoCodeDoc = await PromoCode.findOne({
          code: promoCode.toUpperCase().trim(),
        });

        if (promoCodeDoc) {
          // Incrementează contorul de utilizări
          const updatedPromo = await PromoCode.findByIdAndUpdate(
            promoCodeDoc._id,
            { $inc: { usedCount: 1 } },
            { new: true }
          );
          console.log(
            `✅ [payOrder] Promo code ${promoCode} usage incremented`
          );
        }
      } catch (promoError) {
        console.error(
          "❌ [payOrder] Error incrementing promo code usage:",
          promoError
        );
      }
    }

    const line_items = [
      {
        price_data: {
          currency: "ron",
          product_data: {
            name: `Total for orders: ${orders.join(", ")}`,
          },
          unit_amount: Math.round(amount * 100 * 5.08),
        },
        quantity: 1,
      },
    ];

    // ✅ IMPORTANT: Asigură-te că userId este trimis în success_url
    const success_url = `${frontend_url}/verify?success=true&orderIds=${orders.join(
      ","
    )}&promoCode=${promoCode || ""}&userId=${userId || ""}`;

    console.log(`🎯 [payOrder] Success URL:`, success_url);

    const session = await stripe.checkout.sessions.create({
      line_items: line_items,
      mode: "payment",
      success_url: success_url,
      cancel_url: `${frontend_url}/verify?success=false`,
    });

    res.json({
      success: true,
      session_url: session.url,
    });
  } catch (error) {
    console.log("🔴 [payOrder] Error:", error);
    res.json({
      success: false,
      message: "Error processing payment",
    });
  }
};

const placeOrderCash = async (req, res) => {
  try {
    const { promoCode } = req.body;

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
      payment: false,
      paymentMethod: "Cash / POS",
      specialInstructions: req.body.specialInstructions,
      promoCode: promoCode || null,
    });

    await newOrder.save();
    counter.counter += 1;
    await counter.save();

    // ✅ INCREMENTEAZĂ PROMO CODE USAGE PENTRU CASH
    if (promoCode) {
      try {
        const promoCodeDoc = await PromoCode.findOne({ code: promoCode });
        if (promoCodeDoc) {
          await PromoCode.findByIdAndUpdate(promoCodeDoc._id, {
            $inc: { usedCount: 1 },
          });
          console.log(`✅ Promo code usage incremented for cash: ${promoCode}`);
        }
      } catch (promoError) {
        console.error(
          "❌ Error incrementing promo code usage for cash:",
          promoError
        );
      }
    }

    // ✅ ȘTERGE cartItems după salvarea comenzii - pentru cash
    if (req.body.userId) {
      await userModel.findByIdAndUpdate(req.body.userId, { cartData: {} });
    }

    res.json({
      success: true,
      message: "Order placed successfully (cash/POS)",
      orderId: newOrder._id,
    });
  } catch (error) {
    console.log("Error in placeOrderCash:", error);
    res.json({
      success: false,
      message: "Error placing order",
    });
  }
};

const verifyOrder = async (req, res) => {
  const { orderId, success, orderIds, promoCode, type, userId } = req.body;

  console.log(`🔍 [verifyOrder] Starting verification:`, {
    orderId, orderIds, promoCode, type, userId, success
  });

  try {
    if (success == "true") {
      // ✅ VERIFICĂ DACĂ ESTE SPLIT BILL
      if (type === "split") {
        console.log(`🔄 [verifyOrder] Redirecting to split bill verification`);
        return splitBillController.verifySplitBill(req, res);
      }

      // ✅ VERIFICĂ DACA ESTE PLATĂ PENTRU SPLIT BILL PENDING
      // Dacă userul are split bill pending, probabil plătește pentru ăla
      if (userId) {
        const pendingSplits = await SplitPayment.find({
          userId: userId,
          status: 'pending'
        });
        
        if (pendingSplits.length > 0) {
          console.log(`⚠️ [verifyOrder] User ${userId} has ${pendingSplits.length} pending splits`);
          console.log(`   • This payment might be for a split bill`);
          console.log(`   • Split IDs:`, pendingSplits.map(s => s._id));
          
          // Verifică dacă order-urile din request se potrivesc cu order-urile din split
          if (orderIds) {
            const orderIdArray = orderIds.split(",");
            const matchingSplit = pendingSplits.find(split => 
              split.originalOrderIds.some(id => 
                orderIdArray.includes(id.toString())
              )
            );
            
            if (matchingSplit) {
              console.log(`🔄 [verifyOrder] This payment matches pending split ${matchingSplit._id}`);
              console.log(`   • Redirecting to split bill verification`);
              
              // Redirecționează către verificarea split bill-ului
              req.body.type = 'split';
              return splitBillController.verifySplitBill(req, res);
            }
          }
        }
      }

      // ✅ CODUL EXISTENT PENTRU PROMO CODES...
      // ... (păstrează codul pentru promo codes)

      let targetUserId = userId;
      
      // Procesează un singur orderId (pentru placeOrder)
      if (orderId) {
        console.log(`📝 [verifyOrder] Processing single order: ${orderId}`);
        
        const order = await orderModel.findById(orderId);
        if (order) {
          // ✅ **IMPORTANT: Doar dacă NU are split bills pending pentru acest order!**
          const hasPendingSplitsForOrder = await SplitPayment.exists({
            userId: order.userId,
            status: 'pending',
            originalOrderIds: order._id
          });
          
          if (hasPendingSplitsForOrder) {
            console.log(`⚠️ [verifyOrder] Order ${orderId} has pending splits - NOT marking as paid`);
            // Nu marcam order-ul ca plătit dacă are split bills pending
          } else {
            // Adaugă plățile pentru fiecare item (plata completă)
            order.items.forEach(item => {
              if (!item.paidBy) {
                item.paidBy = [];
              }
              
              item.paidBy.push({
                userId: order.userId,
                amount: item.price * item.quantity,
                quantity: item.quantity,
                paymentDate: new Date(),
                paymentMethod: 'card'
              });
              
              item.status = 'fully_paid';
            });

            // ✅ Apelează updatePaymentStatus
            if (typeof order.updatePaymentStatus === 'function') {
              order.updatePaymentStatus();
            } else {
              order.payment = true;
              order.paymentMethod = "Online card";
              order.paymentDate = new Date();
            }
            
            await order.save();
            console.log(`✅ [verifyOrder] Order ${orderId} marked as paid`);
          }
          
          targetUserId = order.userId;
          
          // Curăță cart-ul pentru plăți complete
          const result = await clearUserCart(targetUserId);
          console.log(`✅ Cart cleared for user ${targetUserId}:`, result);
        }
      }

      // Procesează multiple orderIds (pentru payOrder)
      if (orderIds) {
        const orderIdArray = orderIds.split(",");
        console.log(`📝 [verifyOrder] Processing multiple orders: ${orderIdArray.length} orders`);
        
        // Obține userId din primul order pentru verificare
        if (!targetUserId && orderIdArray.length > 0) {
          const firstOrder = await orderModel.findById(orderIdArray[0]);
          if (firstOrder) {
            targetUserId = firstOrder.userId;
          }
        }
        
        // ✅ **VERIFICĂ MAI ÎNTÂI DACA USERUL ARE SPLIT BILLS PENDING**
        if (targetUserId) {
          const pendingSplits = await SplitPayment.find({
            userId: targetUserId,
            status: 'pending'
          });
          
          if (pendingSplits.length > 0) {
            console.log(`⚠️ [verifyOrder] User ${targetUserId} has ${pendingSplits.length} pending splits`);
            console.log(`   • This is likely a SPLIT BILL payment`);
            console.log(`   • Processing as split bill instead...`);
            
            // Redirecționează către verificarea split bill-ului
            req.body.type = 'split';
            req.body.userId = targetUserId;
            return splitBillController.verifySplitBill(req, res);
          }
        }
        
        // ✅ Dacă nu are split bills pending, procesează ca plată normală
        console.log(`✅ [verifyOrder] No pending splits - processing as normal payment`);
        
        // Marchează order-urile ca plătite (plata completă)
        for (const id of orderIdArray) {
          const order = await orderModel.findById(id);
          if (order) {
            // Adaugă plățile pentru fiecare item
            order.items.forEach(item => {
              if (!item.paidBy) {
                item.paidBy = [];
              }
              
              item.paidBy.push({
                userId: targetUserId,
                amount: item.price * item.quantity,
                quantity: item.quantity,
                paymentDate: new Date(),
                paymentMethod: 'card'
              });
              
              item.status = 'fully_paid';
            });

            // ✅ Apelează updatePaymentStatus
            if (typeof order.updatePaymentStatus === 'function') {
              order.updatePaymentStatus();
            } else {
              order.payment = true;
              order.paymentMethod = "Online card";
              order.paymentDate = new Date();
            }
            
            await order.save();
            console.log(`✅ [verifyOrder] Order ${id} marked as paid`);
          }
        }
        
        // Curăță cart-ul pentru plăți complete
        if (targetUserId) {
          const result = await clearUserCart(targetUserId);
          console.log(`✅ Cart cleared for user ${targetUserId}:`, result);
        }
      }

      // ✅ VERIFICĂ DUPĂ PROCESARE
      if (targetUserId) {
        console.log(`🔍 [verifyOrder] Checking if ALL orders are fully paid for user ${targetUserId}`);
        
        const userDeactivated = await checkAndDeactivateUser(targetUserId);
        
        if (userDeactivated) {
          console.log(`✅ [verifyOrder] User ${targetUserId} deactivated - ALL orders are fully paid`);
        } else {
          console.log(`⚠️ [verifyOrder] User ${targetUserId} kept active - NOT all orders are fully paid`);
        }
      }

      res.json({ success: true, message: "Paid" });
    } else {
      console.log(`❌ [verifyOrder] Payment failed`);
      res.json({ success: false, message: "Not Paid" });
    }
  } catch (error) {
    console.log("🔴 Error in verifyOrder:", error);
    res.json({ success: false, message: "Error verifying order" });
  }
};

const getOrderRating = async (req, res) => {
  const { orderId } = req.params;
  try {
    const order = await orderModel.findById(orderId);
    if (order) {
      res.json({ success: true, rating: order.orderRating || 0 });
    } else {
      res.json({ success: false, message: "Order not found" });
    }
  } catch (error) {
    console.error("Error fetching order:", error);
    res.json({ success: false, message: "Error fetching order" });
  }
};

const updateOrderRating = async (req, res) => {
  const { orderId, rating } = req.body;
  try {
    if (rating >= 1 && rating <= 5) {
      await orderModel.findByIdAndUpdate(orderId, { orderRating: rating });
      res.json({
        success: true,
        message: "Order rating updated successfully!",
      });
    } else {
      res.json({ success: false, message: "Rating must be between 1 and 5." });
    }
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: "Error updating rating" });
  }
};

const userOrders = async (req, res) => {
  try {
    const orders = await orderModel.find({ userId: req.body.userId });
    res.json({ success: true, data: orders });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: "Error fetching user orders" });
  }
};

const listOrders = async (req, res) => {
  try {
    const orders = await orderModel.find({});
    res.json({ success: true, data: orders });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: "Error fetching orders" });
  }
};

const updateStatus = async (req, res) => {
  try {
    await orderModel.findByIdAndUpdate(req.body.orderId, {
      status: req.body.status,
    });
    res.json({ success: true, message: "Status updated" });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: "Error updating status" });
  }
};

const updatePaymentStatus = async (req, res) => {
  try {
    await orderModel.findByIdAndUpdate(req.body.orderId, {
      payment: req.body.payment,
    });
    res.json({ success: true, message: "Payment status updated" });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: "Error updating payment status" });
  }
};

const checkInactiveOrders = async (req, res) => {
  try {
    const { userId } = req.query;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "User ID is required",
      });
    }

    console.log(`🔍 [checkInactiveOrders] START for user ${userId}`);

    // 1. Verifică dacă utilizatorul există
    const user = await userModel.findOne({
      _id: userId,
    });

    if (!user) {
      console.log(`❌ [checkInactiveOrders] User ${userId} not found`);
      return res.json({
        success: true,
        shouldRedirectToOrderCompleted: false,
        message: "User not found",
      });
    }

    console.log(
      `👤 [checkInactiveOrders] User found: ${user.name || "No name"}, email: ${
        user.email || "No email"
      }, isActive: ${user.isActive}`
    );

    // 2. Dacă userul este deja inactiv
    if (user.isActive === false) {
      console.log(
        `ℹ️ [checkInactiveOrders] User ${userId} is ALREADY INACTIVE`
      );
      console.log(`   • User name: ${user.name || "No name"}`);
      console.log(`   • Email: ${user.email || "No email"}`);
      console.log(`   • isActive: ${user.isActive}`);
      console.log(`   • Returning: shouldRedirectToOrderCompleted = true`);

      // ✅ IMPORTANT: Rulăm debug pentru a vedea de ce e inactiv
      console.log(
        `🔍 [checkInactiveOrders] Running debug for inactive user ${userId}...`
      );
      await debugUserState(userId);

      return res.json({
        success: true,
        shouldRedirectToOrderCompleted: true,
        message: "User is already inactive",
        isActive: false,
        reason: "user_inactive",
      });
    }

    // 3. Verifică dacă TOATE comenzile sunt plătite
    console.log(
      `🔍 [checkInactiveOrders] Checking if all orders are fully paid for user ${userId}...`
    );
    const allOrdersFullyPaid = await checkAllOrdersFullyPaid(userId);

    if (!allOrdersFullyPaid) {
      console.log(
        `⚠️ [checkInactiveOrders] User ${userId} kept active - NOT all orders fully paid`
      );
      console.log(`   • User will NOT be redirected`);
      console.log(`   • User remains ACTIVE`);

      return res.json({
        success: true,
        shouldRedirectToOrderCompleted: false,
        message: "Not all orders are fully paid",
        allOrdersFullyPaid: false,
        isActive: true,
      });
    }

    // 4. Verifică pentru split bills neplătite
    console.log(
      `🔍 [checkInactiveOrders] Checking for unpaid split bills for user ${userId}...`
    );
    let hasUnpaidSplits = false;
    try {
      const splitPayments = await SplitPayment.find({
        userId: userId,
        status: "pending",
      });

      if (splitPayments.length > 0) {
        hasUnpaidSplits = true;
        console.log(
          `🔍 [checkInactiveOrders] User ${userId} has ${splitPayments.length} unpaid split bills`
        );
        console.log(
          `   • Split bill IDs:`,
          splitPayments.map((s) => s._id)
        );
      } else {
        console.log(
          `✅ [checkInactiveOrders] User ${userId} has NO unpaid split bills`
        );
      }
    } catch (splitError) {
      console.log("⚠️ Could not check split payments:", splitError);
    }

    // 5. ✅ DECIZIE FINALĂ:
    if (!hasUnpaidSplits) {
      // ✅ TOATE COMENZILE SUNT PLATITE ȘI NU EXISTĂ SPLIT BILLS NEPLĂTITE
      console.log(
        `✅ [checkInactiveOrders] ALL orders fully paid for user ${userId}.`
      );
      console.log(`   • No unpaid split bills`);
      console.log(`   • User is currently ACTIVE: ${user.isActive}`);
      console.log(`   • DEACTIVATING user ${userId}...`);

      await userModel.findByIdAndUpdate(userId, { isActive: false });

      const updatedUser = await userModel.findById(userId);
      console.log(`✅ [checkInactiveOrders] User ${userId} DEACTIVATED`);
      console.log(`   • New isActive status: ${updatedUser.isActive}`);

      return res.json({
        success: true,
        shouldRedirectToOrderCompleted: true,
        message: `All orders fully paid`,
        isActive: false,
        reason: "all_orders_paid",
      });
    } else {
      // ✅ COMENZILE SUNT PLATITE, DAR EXISTĂ SPLIT BILLS NEPLĂTITE
      console.log(
        `⚠️ [checkInactiveOrders] User ${userId}: Orders paid but has unpaid split bills.`
      );
      console.log(`   • User will NOT be redirected`);
      console.log(`   • User remains ACTIVE`);

      return res.json({
        success: true,
        shouldRedirectToOrderCompleted: false,
        message: `Orders paid but has unpaid split bills`,
        isActive: true,
        reason: "unpaid_split_bills",
      });
    }
  } catch (error) {
    console.error("❌ Error in checkInactiveOrders:", error);
    res.status(500).json({
      success: false,
      message: "Server error checking user status",
    });
  }
};

// ✅ Endpoint pentru debugging user state
const debugUserStatus = async (req, res) => {
  try {
    const { userId } = req.query;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "User ID is required",
      });
    }

    console.log(`🔍 [debugUserStatus] API call for user ${userId}`);

    const debugInfo = await debugUserState(userId);

    if (!debugInfo) {
      return res.status(500).json({
        success: false,
        message: "Debug failed",
      });
    }

    res.json({
      success: true,
      debugInfo,
    });
  } catch (error) {
    console.error("❌ Error in debugUserStatus:", error);
    res.status(500).json({
      success: false,
      message: "Server error debugging user status",
    });
  }
};


 const sendReceiptByEmail = async (req, res) => {
    try {
        const { orderId, customerEmail } = req.body;
        const token = req.headers.token;

        if (!token) {
            return res.status(401).json({ 
                success: false, 
                message: 'Token de autentificare lipsă' 
            });
        }

        if (!orderId || !customerEmail) {
            return res.status(400).json({
                success: false,
                message: 'ID-ul comenzii și adresa de email sunt obligatorii'
            });
        }

        // 1. Preia detaliile comenzii din baza de date
        const order = await Order.findById(orderId);
        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Comanda nu a fost găsită'
            });
        }

        // 2. Configurează transporter-ul Nodemailer
        const transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST || 'smtp.gmail.com',
            port: process.env.SMTP_PORT || 587,
            secure: process.env.SMTP_SECURE === 'true',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS,
            },
            tls: {
                rejectUnauthorized: false
            }
        });

        // 3. Generează conținutul HTML pentru chitanță
        const emailContent = generateReceiptHTML(order);

        // 4. Configurează opțiunile email-ului
        const mailOptions = {
            from: `"${process.env.EMAIL_FROM_NAME || 'Restaurant'}" <${process.env.EMAIL_USER}>`,
            to: customerEmail,
            subject: `Chitanță Comanda #${order.orderNumber || order._id} - Restaurantul Nostru`,
            html: emailContent,
            text: `Mulțumim pentru comanda dvs. #${order.orderNumber}. Total: ${order.totalAmount} €. Vă așteptăm cu drag data viitoare!`
        };

        // 5. Trimite email-ul
        const info = await transporter.sendMail(mailOptions);
        console.log(`📧 Email trimis către ${customerEmail}:`, info.messageId);

        // 6. Salvează în baza de date că email-ul a fost trimis
        order.receiptSent = true;
        order.receiptSentAt = new Date();
        order.receiptEmail = customerEmail;
        await order.save();

        res.json({
            success: true,
            message: 'Chitanță trimisă cu succes!',
            messageId: info.messageId,
            orderId: order._id
        });

    } catch (error) {
        console.error('❌ Eroare la trimiterea chitanței:', error);
        res.status(500).json({
            success: false,
            message: 'Eroare la trimiterea chitanței',
            error: error.message
        });
    }
};

// Funcție pentru generarea HTML-ului chitanței
function generateReceiptHTML(order) {
    const items = order.items || [];
    const totalAmount = order.totalAmount || 0;
    const subtotal = order.subtotal || totalAmount;
    const tax = order.tax || 0;
    const discount = order.discount || 0;
    const tipAmount = order.tipAmount || 0;
    
    // Calculează totalul fiecărui item
    const itemRows = items.map(item => {
        const itemTotal = (item.price || 0) * (item.quantity || 1);
        return `
        <tr>
            <td style="padding: 10px; border-bottom: 1px solid #eee;">${item.name || 'Produs'}</td>
            <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: center;">${item.quantity || 1}</td>
            <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">${(item.price || 0).toFixed(2)} €</td>
            <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">${itemTotal.toFixed(2)} €</td>
        </tr>
        `;
    }).join('');

    return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Chitanță Comanda #${order.orderNumber}</title>
        <style>
            body {
                font-family: 'Arial', sans-serif;
                line-height: 1.6;
                color: #333;
                max-width: 600px;
                margin: 0 auto;
                padding: 20px;
                background: #f5f5f5;
            }
            .receipt-container {
                background: white;
                border-radius: 10px;
                padding: 30px;
                box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            }
            .header {
                text-align: center;
                margin-bottom: 30px;
                padding-bottom: 20px;
                border-bottom: 2px solid #e86514;
            }
            .restaurant-name {
                color: #e86514;
                font-size: 24px;
                font-weight: bold;
                margin: 0;
            }
            .receipt-title {
                color: #666;
                margin: 10px 0;
                font-size: 18px;
            }
            .order-info {
                background: #f9f9f9;
                padding: 15px;
                border-radius: 8px;
                margin-bottom: 20px;
            }
            .info-row {
                display: flex;
                justify-content: space-between;
                margin-bottom: 8px;
            }
            .info-label {
                color: #666;
                font-weight: 500;
            }
            .info-value {
                color: #333;
                font-weight: 600;
            }
            table {
                width: 100%;
                border-collapse: collapse;
                margin: 20px 0;
            }
            th {
                background: #e86514;
                color: white;
                padding: 12px;
                text-align: left;
                font-weight: 600;
            }
            td {
                padding: 12px;
                border-bottom: 1px solid #eee;
            }
            .total-section {
                margin-top: 20px;
                padding-top: 20px;
                border-top: 2px solid #eee;
            }
            .total-row {
                display: flex;
                justify-content: space-between;
                margin-bottom: 10px;
                font-size: 16px;
            }
            .grand-total {
                font-size: 20px;
                font-weight: bold;
                color: #e86514;
                margin-top: 10px;
                padding-top: 10px;
                border-top: 2px solid #e86514;
            }
            .footer {
                text-align: center;
                margin-top: 30px;
                padding-top: 20px;
                border-top: 1px solid #ddd;
                color: #666;
                font-size: 14px;
            }
            .thank-you {
                color: #34C759;
                text-align: center;
                font-size: 18px;
                margin: 20px 0;
                font-weight: 600;
            }
        </style>
    </head>
    <body>
        <div class="receipt-container">
            <div class="header">
                <h1 class="restaurant-name">🍽️ Restaurantul Nostru</h1>
                <h2 class="receipt-title">Chitanță Comanda</h2>
            </div>
            
            <div class="order-info">
                <div class="info-row">
                    <span class="info-label">Număr Comandă:</span>
                    <span class="info-value">#${order.orderNumber || order._id}</span>
                </div>
                <div class="info-row">
                    <span class="info-label">Data:</span>
                    <span class="info-value">${new Date(order.createdAt).toLocaleString('ro-RO')}</span>
                </div>
                <div class="info-row">
                    <span class="info-label">Masa:</span>
                    <span class="info-value">${order.tableNumber || 'N/A'}</span>
                </div>
                <div class="info-row">
                    <span class="info-label">Status:</span>
                    <span class="info-value" style="color: #34C759;">${order.status || 'Completată'}</span>
                </div>
            </div>
            
            <table>
                <thead>
                    <tr>
                        <th>Produs</th>
                        <th>Cantitate</th>
                        <th>Preț unitar</th>
                        <th>Total</th>
                    </tr>
                </thead>
                <tbody>
                    ${itemRows}
                </tbody>
            </table>
            
            <div class="total-section">
                <div class="total-row">
                    <span>Subtotal:</span>
                    <span>${subtotal.toFixed(2)} €</span>
                </div>
                ${discount > 0 ? `
                <div class="total-row">
                    <span>Discount:</span>
                    <span style="color: #34C759;">-${discount.toFixed(2)} €</span>
                </div>
                ` : ''}
                ${tax > 0 ? `
                <div class="total-row">
                    <span>Taxa:</span>
                    <span>${tax.toFixed(2)} €</span>
                </div>
                ` : ''}
                ${tipAmount > 0 ? `
                <div class="total-row">
                    <span>Tips:</span>
                    <span>${tipAmount.toFixed(2)} €</span>
                </div>
                ` : ''}
                <div class="total-row grand-total">
                    <span>TOTAL PLATĂ:</span>
                    <span>${totalAmount.toFixed(2)} €</span>
                </div>
            </div>
            
            <div class="thank-you">
                ✅ Comanda a fost procesată cu succes!
            </div>
            
            <div class="footer">
                <p>Vă mulțumim că ați ales restaurantul nostru!</p>
                <p>📧 Pentru întrebări: contact@restaurant.ro</p>
                <p>📞 Telefon: +40 123 456 789</p>
                <p>📍 Adresa: Strada Exemplu, Nr. 1, Orașul Tău</p>
                <p>© ${new Date().getFullYear()} Restaurantul Nostru. Toate drepturile rezervate.</p>
            </div>
        </div>
    </body>
    </html>
    `;
}


export {
  placeOrderCash,
  placeOrder,
  verifyOrder,
  userOrders,
  listOrders,
  updateStatus,
  updateOrderRating,
  getOrderRating,
  updatePaymentStatus,
  payOrder,
  payOrderCash,
  checkInactiveOrders,
  clearFullyPaidOrders,
  debugUserStatus,
  sendReceiptByEmail
};
