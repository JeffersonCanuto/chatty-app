import jwt from "jsonwebtoken";
import User from "../models/user.model.js";

const protectRoute = async(req, res, next) => {
    try {
        const token = req.cookies.jwtToken;

        // Check whether there is a JWT Token
        if (!token) {
            return res.status(401).json({ message: 'No token provided' });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Check whether JWT Token is a valid
        if (!decoded) {
            return res.status(401).json({ message: 'Invalid Token' });
        }

        const user = await User.findById(decoded.userId).select("-password");

        // Check whether user exists on the DB
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        req.user = user;

        next();
    } catch(error) {
        console.error(`Error in protectRoute middleware: ${error.message || error}`);
        return res.status(500).json({ message: 'Internal Server Error' });
    }
}

export default protectRoute;