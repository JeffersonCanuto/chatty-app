import User from "../models/user.model.js";
import Message from "../models/message.model.js";

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