import User from "../models/user.model.js";
import Message from "../models/message.model.js";
import cloudinary from "../lib/cloudinary.js";

/* FETCH (GET) - Retrieve all users/contacts for sidebar */
export const getUsersForSidebar = async(req, res) => {
    try {
        const loggedInUserId = req.user._id;
        const filteredUsers = await User.find({ _id: {$ne:loggedInUserId}}).select("-password");

        res.status(200).json(filteredUsers);
    } catch(error) {
        console.error(`Error while retrieving users for sidebar: ${error.message || error}`);
        return res.status(500).json({ message: 'Internal Server Error' });
    }
}

/* FETCH (GET) - Retrieve all messages between different users */
export const getMessages = async(req, res) => {
    try {
        const { id:userToChatId } = req.params;
        const currentId = req.user._id;

        const messages = await Message.find({
            $or: [
                {senderId: currentId, receiverId: userToChatId},
                {senderId: userToChatId, receiverId: currentId}
            ]
        });
        
        return res.status(200).json(messages);
    } catch(error) {
        console.error(`Error while fetching messages between users: ${error.message || error}`);
        return res.status(500).json({ message: 'Internal Server Error' });
    }
}

/* CREATE (POST) - Send text or image message to another user */
export const sendMessage = async(req, res) => {
    try {
        const { text, image } = req.body;
        const { id: receiverId } = req.params;
        const senderId = req.user._id;
        
        let imageUrl;

        if (image) {
            // Upload base64 image to cloudinary
            const uploadResponse = await cloudinary.uploader.upload(image);
            imageUrl = uploadResponse.secure_url;
        }

        const newMessage = new Message({
            senderId,
            receiverId,
            text,
            image: imageUrl
        });

        // Save message in the database
        await new Message.save();

        // TO-DO: Implement real time functionality goes here => socket.io
        return res.status(201).json(newMessage);
    } catch(error) {
        console.error(`Error while sending message: ${error.message || error}`);
        return res.status(500).json({ message: 'Internal Server Error' });
    }
}