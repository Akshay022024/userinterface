import React, { useState, useEffect } from "react";
import axiosInstance from "../axiosInstance";
import "./NoteList.css";
import getUserId from '../getUserId';

function NoteList() {
    const [notes, setNotes] = useState([]);
    const [error, setError] = useState({});
    const [timeouts, setTimeouts] = useState({});
    const [fullscreenNoteId, setFullscreenNoteId] = useState(null);
    const [theme, setTheme] = useState("light");
    const [showChat, setShowChat] = useState(false); // Chat visibility
    const [chatMessages, setChatMessages] = useState([]); // Chat messages
    const [newMessage, setNewMessage] = useState("");

    const toggleTheme = () => {
        const newTheme = theme === "light" ? "dark" : "light";
        setTheme(newTheme);
        document.documentElement.setAttribute("data-theme", newTheme);
    };

    const fetchNoteList = async () => {
        try {
            const userId = getUserId();
            const response = await axiosInstance.get(`/api/notes/${userId}`);
            setNotes(response.data);
            setError({});
        } catch (error) {
            console.error("Error while fetching notes:", error);
            setError({ fetch: "Failed to fetch notes. Please try again later." });
        }
    };

    const createNote = async () => {
        try {
            const userId = getUserId();
            const newNote = {
                title: "New Note",
                description: "Type here...",
                userId,
                pinned: false,
            };
            const response = await axiosInstance.post(`/api/notes/${userId}`, newNote);
            setNotes([...notes, response.data]);
        } catch (error) {
            console.error("Error while creating a note:", error);
        }
    };

    const deleteNote = async (id) => {
        try {
            const userId = getUserId();
            await axiosInstance.delete(`/api/notes/${userId}/${id}`);
            setNotes(notes.filter((note) => note.id !== id));
        } catch (error) {
            console.error("Error while deleting a note:", error);
        }
    };

    const pinNote = async (id) => {
        try {
            const userId = getUserId();
            const updatedNotes = notes.map((note) =>
                note.id === id ? { ...note, pinned: !note.pinned } : note
            );
            setNotes(updatedNotes);

            const noteToUpdate = notes.find((note) => note.id === id);
            await axiosInstance.put(`/api/notes/${userId}/${id}/pin`, {
                ...noteToUpdate,
                pinned: !noteToUpdate.pinned,
            });
        } catch (error) {
            console.error("Error while pinning a note:", error);
        }
    };

    const updateNote = async (id, field, value) => {
        try {
            const userId = getUserId();
            const updatedNote = notes.find((note) => note.id === id);
            await axiosInstance.put(`/api/notes/${userId}/${id}`, {
                ...updatedNote,
                [field]: value,
            });
        } catch (error) {
            console.error(`Error updating note with ID ${id}:`, error);
        }
    };

    const handleInputChange = (id, field, value) => {
        setNotes((prevNotes) =>
            prevNotes.map((note) =>
                note.id === id ? { ...note, [field]: value } : note
            )
        );

        if (timeouts[id]) {
            clearTimeout(timeouts[id]);
        }

        const timeout = setTimeout(() => {
            updateNote(id, field, value);
            setTimeouts((prev) => ({ ...prev, [id]: null }));
        }, 500);

        setTimeouts((prev) => ({ ...prev, [id]: timeout }));
    };

    const toggleFullscreen = (id) => {
        setFullscreenNoteId((prevId) => (prevId === id ? null : id));
    };

    const toggleChat = () => {
        setShowChat(!showChat);
    };

    const handleSendMessage = () => {
        if (newMessage.trim() !== "") {
            setChatMessages([...chatMessages, { sender: "user", text: newMessage }]);
            setNewMessage(""); // Clear the input field
            // Simulate AI reply
            setTimeout(() => {
                setChatMessages((prev) => [
                    ...prev,
                    { sender: "nyx", text: "Hey there... I am Nyx, your AI assistant! I am going to be available soon." },
                ]);
            }, 1000);
        }
    };

   

    useEffect(() => {
        fetchNoteList();
    }, []);

    return (
        <div className="noteList-container">
            <h1>Notes App</h1>
            {/* Nyx Robot Button */}
            <div
                className="nyx-robot-btn"
                onClick={toggleChat}
                title="Chat with Nyx"
            >
                🤖
                </div>
            

            {/* Chatbox */}
            {showChat && (
                <div className="chatbox-container">
                    <div className="chatbox">
                        <div className="chat-header">
                            <span>Chat with Nyx</span>
                            <button onClick={toggleChat}>✖</button>
                        </div>
                        <div className="chat-content">
                            {chatMessages.map((message, index) => (
                                <div
                                    key={index}
                                    className={`chat-message ${
                                        message.sender === "user" ? "user-message" : "nyx-message"
                                    }`}
                                >
                                    {message.text}
                                </div>
                            ))}
                        </div>
                        <div className="chat-input-container">
                            <input
                                type="text"
                                placeholder="Type a message..."
                                value={newMessage}
                                onChange={(e) => setNewMessage(e.target.value)}
                                onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                            />
                            <button onClick={handleSendMessage} className="send-btn">
                                ➤
                            </button>
                        </div>
                    </div>
                </div>
            )}
        
            <button className="theme-toggle-btn" onClick={toggleTheme}>
                {theme === "light" ? "☽" : "☀"}
            </button>

            {error.fetch && <p className="error-message">{error.fetch}</p>}
            <button className="create-btn" onClick={createNote}>+</button>

            <div className={`notes-grid ${fullscreenNoteId ? "fullscreen-active" : ""}`}>
                {notes.length === 0 ? (
                    <p className="no-notes">No notes available. Create one to get started!</p>
                ) : (
                    notes
                        .sort((a, b) => b.pinned - a.pinned)
                        .map((note) => (
                            <div
                                key={note.id}
                                className={`note-card ${
                                    note.pinned ? "pinned" : ""
                                } ${fullscreenNoteId === note.id ? "fullscreen" : ""}`}
                            >
                                {fullscreenNoteId === note.id && (
                                    <button
                                        onClick={() => toggleFullscreen(null)}
                                        className="exit-btn"
                                    >
                                        X
                                    </button>
                                )}
                                <button
                                    onClick={() => pinNote(note.id)}
                                    className="icon-btn pin-icon"
                                    title={note.pinned ? "Unpin" : "Pin"}
                                >
                                    <i className="fas fa-thumbtack"></i>
                                </button>
                                <input
                                    type="text"
                                    value={note.title}
                                    onChange={(e) =>
                                        handleInputChange(note.id, "title", e.target.value)
                                    }
                                    className="editable-title"
                                    placeholder="New Note"
                                />
                                <textarea
                                    value={note.description}
                                    onChange={(e) =>
                                        handleInputChange(note.id, "description", e.target.value)
                                    }
                                    className="editable-description"
                                    placeholder="Type here..."
                                />
                                <button
                                    onClick={() => toggleFullscreen(note.id)}
                                    className="icon-btn fullscreen-icon"
                                    title="Toggle Fullscreen"
                                >
                                    <i
                                        className={`fas ${
                                            fullscreenNoteId === note.id
                                                ? "fa-compress"
                                                : "fa-expand"
                                        }`}
                                    ></i>
                                </button>
                                <button
                                    onClick={() => deleteNote(note.id)}
                                    className="icon-btn delete-icon"
                                    title="Delete"
                                >
                                    <i className="fas fa-trash"></i>
                                </button>
                            </div>
                        ))
                )}
           

           
                
        </div>
       </div>
    );
}

export default NoteList;