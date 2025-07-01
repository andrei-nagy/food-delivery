// models/tableModel.js
import mongoose from 'mongoose';

const tableSchema = new mongoose.Schema({
    tableNumber: {
        type: Number,
        required: true,
        unique: true
    },
    status: {
        type: String,
        enum: ['free', 'occupied'],
        default: 'free'
    },
    createdOn: {
        type: Date,
        default: Date.now
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',  // Referință la utilizatorul care ocupă masa
        required: false
    }
});

const tableModel = mongoose.model('Table', tableSchema);

export default tableModel;
