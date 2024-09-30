import jwt  from "jsonwebtoken";

const authMiddleware = async (req, res, next) => {
    const { token } = req.headers;
    if (!token) {
        return req.json({success: false, message: "Not Authorized. Try to login again."})
    }
    try {
        const token_decode = jwt.verify(token, process.env.JWT_SECRET)
    } catch (error) {
        
    }
}


export default authMiddleware;