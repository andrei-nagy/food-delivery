import mongoose from 'mongoose';

const adminUserSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    securityToken: { type: String, required: true },
});

const userAdminModel = mongoose.model('AdminUser', adminUserSchema);

export default userAdminModel;
