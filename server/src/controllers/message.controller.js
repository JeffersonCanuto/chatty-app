import User from "../models/user.model";

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