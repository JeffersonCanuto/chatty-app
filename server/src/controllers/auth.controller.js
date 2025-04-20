import User from "../models/user.model.js";
import generateJwtToken from "../lib/utils.js";
import cloudinary from "../lib/cloudinary.js";
import bcrypt from "bcryptjs";

/* FETCH (GET) - Check whether user is properly authenticated */
export const checkAuth = (req, res) => {
    try {
        const user = req.user;
        res.status(200).json(user);
    } catch(error) {
        console.error(`Error checking whether user is authenticated: ${error.message || error}`);
        return res.status(500).json({ message: 'Internal Server Error' });
    }
}

/* CREATE (POST) - Sign up a new user with the credentials provided at the Sign up form */
export const signup = async(req, res) => {
    const { fullName, email, password } = req.body;
    
    try {
        // Check whether all fields are filled with proper values
        if (!fullName || !email || !password) {
            return res.status(400).json({ message: 'All fields are required' });
        }

        // Check whether password is valid (>=6 characters long)
        if (password.length < 6) {
            return res.status(400).json({ message: 'Password must be at least 6 characters long' });
        }

        const user = await User.findOne({ email });

        // Check whether user does not exist in the database already
        if (user) {
            return res.status(400).json({ message: 'Email already exists' });
        }

        // Hash password to store it in the database
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create a new user in the database
        const newUser = new User({
            fullName,
            email,
            password: hashedPassword
        });

        if (newUser) {
            // Generate JWT token
            generateJwtToken(newUser._id, res);
            await newUser.save();

            res.status(201).json({
                _id: newUser._id,
                fullName: newUser.fullName,
                email: newUser.email,
                profilePicture: newUser.profilePicture
            });
        } else {
            res.status(400).json({ message: 'Invalid user data' });
        }
    } catch(error) {
        console.error(`Error while signing up: ${error.message || error}`);
        return res.status(500).json({ message: 'Internal Server Error' });
    }
};

/* CREATE (POST) - Login user with the credentials provided at the Login form */
export const login = async(req, res) => {
    const { email, password } = req.body;

    try {
        // Check whether email and password are provided
        if (!email || !password) {
            return res.status(400).json({ message: 'Email and password are required' });
        }

        // Check whether user exists by email
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        // Check whether password is correct
        const isPasswordCorrect = await bcrypt.compare(password, user.password);

        if (!isPasswordCorrect) {
            return res.status(400).json({ message: 'Invalid credentials' })
        }

        generateJwtToken(user._id, res)

        return res.status(200).json({
            _id: user._id,
            fullName: user.fullName,
            email: user.email,
            profilePicture: user.profilePicture
        });
    } catch(error) {
        console.error(`Error while logging in: ${error.message || error}`);
        return res.status(500).json({ message: 'Internal Server Error' });
    }
};

/* CREATE (POST) - Logout user by removing the existing JWT Token from the Cookies */
export const logout = (_, res) => {
    try {
        res.cookie('jwtToken', '', { maxAge: 0 });
        return res.status(200).json({ message: 'Logged out successfully' });
    } catch(error) {
        console.error(`Error while logging out: ${error.message || error}`);
        return res.status(500).json({ message: 'Internal Server Error' });
    }
};

/* UPDATE (PATCH) - Update user profile picture url in cloudinary and database */
export const updateProfile = async(req, res) => {
    try {
        const { profilePicture } = req.body;
        const userId = req.user._id;

        // Check whether profile picture has been provided
        if (!profilePicture) {
            return res.status(400).json({ message: 'Profile picture is required' });
        }

        // Upload profile picture to cloudinary in case it has been provided
        const uploadResponse = await cloudinary.uploader.upload(profilePicture);
        const updatedUser = await User.findByIdAndUpdate(userId, { profilePicture: uploadResponse.secure_url }, { new: true });

        res.status(200).json(updatedUser);
    } catch(error) {
        console.error(`Error while updating profile picture: ${error.message || error}`);
        return res.status(500).json({ message: 'Internal Server Error' });
    }
}