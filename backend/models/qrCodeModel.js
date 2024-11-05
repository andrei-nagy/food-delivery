import mongoose from "mongoose";

const qrCodeSchema = new mongoose.Schema({
    tableNo: {
        type: String,
        required: true,
    },
    createdByUserName: {
        type: String,
        required: true,
    },
    qrImage: {
        type: String, // imaginea QR în format Base64
        required: true,
    },
    createdOn: {
        type: Date,
        default: Date.now,
    },
});

const qrCodeModel = mongoose.models.qrCodes || mongoose.model("qrCodes", qrCodeSchema)

export default qrCodeModel;
