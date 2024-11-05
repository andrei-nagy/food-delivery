import mongoose from "mongoose";

const qrCodeSchema = new mongoose.Schema({
    tableNo: String,
    restaurantId: String,
    qrImage: String, // imaginea în format Base64
    createdOn: Date,
});

const qrCodeModel = mongoose.models.qrCodes || mongoose.model("qrCodes", qrCodeSchema)

export default qrCodeModel;
