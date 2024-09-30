import { Jwt } from "jsonwebtoken";

const authMiddleware = async (req, res, next) => {
    const { token } = req.headers;
    if (!token) {
        return req.json({success: false, message: "Not Authorized. Try to login again."})
    }
}


export default authMiddleware;