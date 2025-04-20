import jwt from "jsonwebtoken";

const generateJwtToken = (userId, res) => {
    // Create JWT token based on user ID
    const token = jwt.sign({ userId }, process.env.JWT_SECRET, {
        expiresIn: "7d"
    });

    // Store JWT token above in cookies
    res.cookie("jwtToken", token, {
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in miliseconds
        httpOnly: true, // prevents XSS attacks
        sameSite: "strict", // prevents CSRF attacks
        secure: process.env.NODE_ENV === "production"
    });
    
    return token;
}

export default generateJwtToken;