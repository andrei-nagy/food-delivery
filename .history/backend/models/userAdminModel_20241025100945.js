import mongoose from 'mongoose';

const adminUserSchema = new mongoose.Schema({
    name: {type: String, required: true},
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    securityToken: { type: String, required: true },
    userRole: { type: String, required: true },
    createdOn: { type: Date, default: Date.now }

});

const userAdminModel = mongoose.model('AdminUser', adminUserSchema);

export default userAdminModel;
