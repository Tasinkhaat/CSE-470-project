import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { socket } from '../main';
import axios from 'axios';

const Navbar = ({ user, setUser }) => {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState(0);
  const [notificationList, setNotificationList] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [userMap, setUserMap] = useState({});

  useEffect(() => {
    if (user) {
      socket.on('newMessage', async (message) => {
        // Fetch sender's name if not already in userMap
        let senderName = userMap[message.sender];
        if (!senderName) {
          try {
            const res = await axios.get(`/api/profile/${message.sender}`, {
              headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
            });
            senderName = res.data.name;
            setUserMap((prev) => ({ ...prev, [message.sender]: senderName }));
          } catch {
            senderName = 'Unknown';
          }
        }
        setNotificationList((prev) => [
          { sender: message.sender, senderName, content: message.content },
          ...prev.slice(0, 4), // Keep only the last 5 notifications
        ]);
      });

      return () => {
        socket.off('newMessage');
      };
    }
  }, [user, userMap]);

  useEffect(() => {
    if (user && user._id) {
      socket.emit('join', user._id);
    }
  }, [user]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    setUser(null);
    navigate('/');
  };

  const handleBellClick = () => {
    setShowDropdown((prev) => !prev);
  };

  const handleNotificationClick = (senderId) => {
    setNotificationList((prev) => prev.filter((n) => n.sender !== senderId));
    setShowDropdown(false);
    navigate(`/messages/${senderId}`);
  };

  return (
    <nav className="bg-blue-600 text-white p-4 shadow-md">
      <div className="container mx-auto flex justify-between items-center">
        <Link to="/" className="text-2xl font-bold hover:text-blue-200 transition">
          SkillShare
        </Link>
        <div className="space-x-4 flex items-center">
          {user && (
            <div className="relative">
              <button className="relative" onClick={handleBellClick}>
                <span className="material-icons">notifications</span>
                {notificationList.length > 0 && (
                  <span className="absolute top-0 right-0 bg-red-500 text-white text-xs rounded-full px-1">
                    {notificationList.length}
                  </span>
                )}
              </button>
              {showDropdown && notificationList.length > 0 && (
                <div className="absolute right-0 mt-2 w-64 bg-white text-black rounded shadow-lg z-50">
                  <ul>
                    {notificationList.map((notif, idx) => (
                      <li
                        key={idx}
                        className="px-4 py-2 hover:bg-gray-100 cursor-pointer border-b last:border-b-0"
                        onClick={() => handleNotificationClick(notif.sender)}
                      >
                        <span className="font-semibold">New message</span> from <span className="text-blue-600">{notif.senderName || notif.sender}</span>:<br />
                        <span className="text-gray-700">{notif.content}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
          {user ? (
            <>
              <Link to="/profile" className="hover:text-blue-200 transition">
                Profile
              </Link>
              <button
                onClick={handleLogout}
                className="bg-blue-700 hover:bg-blue-800 text-white px-3 py-1 rounded transition"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="hover:text-blue-200 transition">
                Login
              </Link>
              <Link to="/signup" className="hover:text-blue-200 transition">
                Signup
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;