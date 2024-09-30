import userModel from "../models/userModel";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import Validator  from "validator";



//login user
const loginUser = async (req,res) => {

}


// register user
const registerUser = async (req,res) => {
    const {name, password, email} = req.body;
    try {
        const exists = await userModel.findOne({email})
        if(exists){
            return res.json({success: false, message: "User already exists!"})
        }
    } catch (error) {
        
    }
}


export {loginUser, registerUser}