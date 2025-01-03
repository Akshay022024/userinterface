import { v4 as uuidv4 } from "uuid";
import CryptoJS from "crypto-js";

const getUserId = () => {
    // Check if a hashed user ID already exists in localStorage
    let userId = localStorage.getItem("userId");
    
    if (!userId) {
        // If not, generate a new UUID and hash it using SHA-256
        const rawId = uuidv4();
        userId = CryptoJS.SHA256(rawId).toString(CryptoJS.enc.Hex);
        localStorage.setItem("userId", userId); // Store the hashed user ID in localStorage
    }
    
    return userId; // Return the hashed user ID
};

export default getUserId;
