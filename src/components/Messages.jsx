import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { socket } from '../main';

const Messages = ({ user }) => {
  const { userId } = useParams();
  const [messages, setMessages] = useState([]);
  const [content, setContent] = useState('');

  useEffect(() => {
    if (user) {
      axios
        .get(`http://localhost:5000/api/messages/${userId}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        })
        .then((res) => setMessages(res.data));

      // Listen for real-time new messages
      const handleNewMessage = (message) => {
        // Only update if the message is for this chat
        if (
          (message.sender === userId && message.receiver === user._id) ||
          (message.sender === user._id && message.receiver === userId)
        ) {
          setMessages((prev) => [...prev, message]);
        }
      };
      socket.on('newMessage', handleNewMessage);
      return () => {
        socket.off('newMessage', handleNewMessage);
      };
    }
  }, [userId, user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(
        'http://localhost:5000/api/messages',
        { receiverId: userId, content },
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
      );
      setContent('');
      const res = await axios.get(`http://localhost:5000/api/messages/${userId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      setMessages(res.data);
    } catch (error) {
      alert('Error sending message');
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-semibold text-gray-800 mb-4">Messages</h2>
      <div className="h-64 overflow-y-scroll border rounded p-4 mb-4 bg-gray-50">
        {messages.length === 0 ? (
          <p className="text-gray-600">No messages yet.</p>
        ) : (
          messages.map((msg) => (
            <div
              key={msg._id}
              className={`mb-3 p-2 rounded ${msg.sender._id === user._id ? 'bg-blue-100 text-right' : 'bg-gray-200'}`}
            >
              <p className="text-gray-800">
                <strong>{msg.sender.name}</strong>: {msg.content}
              </p>
              <small className="text-gray-500">{new Date(msg.timestamp).toLocaleString()}</small>
            </div>
          ))
        )}
      </div>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Type a message"
          className="w-full p-2 mb-3 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          type="submit"
          className="w-full p-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
        >
          Send
        </button>
      </form>
    </div>
  );
};

export default Messages;