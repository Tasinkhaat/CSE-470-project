import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Profile = ({ user, setUser }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    bio: user?.bio || '',
    skillsToTeach: user?.skillsToTeach || [],
    skillsToLearn: user?.skillsToLearn || [],
    wishlist: user?.wishlist?.join(', ') || '',
    privacy: user?.privacy || 'public',
  });
  const [profilePicture, setProfilePicture] = useState(null);
  const [showTeachDropdown, setShowTeachDropdown] = useState(false);
  const [showLearnDropdown, setShowLearnDropdown] = useState(false);
  const [customSkillType, setCustomSkillType] = useState(null); // 'teach' or 'learn'
  const [customSkillInput, setCustomSkillInput] = useState('');
  const [progress, setProgress] = useState(user?.progress || []);

  const navigate = useNavigate();

  const predefinedSkills = [
    'JavaScript', 'Python', 'React', 'Node.js', 'Java',
    'C++', 'SQL', 'HTML', 'CSS', 'Graphic Design',
    'Photography', 'Machine Learning', 'Other',
  ];

  // Fetch latest progress when user changes
  useEffect(() => {
    setProgress(user?.progress || []);
  }, [user]);

  const skillStatuses = ['Not Started', 'In Progress', 'Completed'];

  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = new FormData();
    Object.keys(formData).forEach((key) => {
      if (key === 'skillsToTeach' || key === 'skillsToLearn') {
        formData[key].forEach((skill) => data.append(key, skill));
      } else if (key === 'wishlist') {
        data.append(key, formData[key].split(',').map((s) => s.trim()));
      } else {
        data.append(key, formData[key]);
      }
    });
    if (profilePicture) data.append('profilePicture', profilePicture);

    try {
      const res = await axios.put('http://localhost:5000/api/profile', data, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      setUser(res.data);
      setIsEditing(false);
      alert('Profile updated');
    } catch (error) {
      alert('Error updating profile');
    }
  };

  const handleCancel = () => {
    setFormData({
      name: user?.name || '',
      bio: user?.bio || '',
      skillsToTeach: user?.skillsToTeach || [],
      skillsToLearn: user?.skillsToLearn || [],
      wishlist: user?.wishlist?.join(', ') || '',
      privacy: user?.privacy || 'public',
    });
    setProfilePicture(null);
    setCustomSkillInput('');
    setCustomSkillType(null);
    setShowTeachDropdown(false);
    setShowLearnDropdown(false);
    setIsEditing(false);
  };

  const addCustomSkill = () => {
    const trimmedSkill = customSkillInput.trim();
    if (!trimmedSkill) return;

    const field = customSkillType === 'teach' ? 'skillsToTeach' : 'skillsToLearn';
    if (!formData[field].includes(trimmedSkill)) {
      setFormData({
        ...formData,
        [field]: [...formData[field], trimmedSkill],
      });
    }
    setCustomSkillInput('');
    setCustomSkillType(null);
  };

  const toggleSkill = (field, skill) => {
    if (skill === 'Other') {
      setCustomSkillType(field === 'skillsToTeach' ? 'teach' : 'learn');
    } else {
      setFormData({
        ...formData,
        [field]: formData[field].includes(skill)
          ? formData[field].filter((s) => s !== skill)
          : [...formData[field], skill],
      });
    }

    // Close dropdown after selection
    if (field === 'skillsToTeach') setShowTeachDropdown(false);
    else if (field === 'skillsToLearn') setShowLearnDropdown(false);
  };

  const removeSkill = (field, skill) => {
    setFormData({
      ...formData,
      [field]: formData[field].filter((s) => s !== skill),
    });
  };

  const handleDeleteAccount = async () => {
    if (!window.confirm('Are you sure you want to delete your account? This action cannot be undone.')) return;
    try {
      await axios.delete('/api/delete-account', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      localStorage.removeItem('token');
      setUser(null);
      alert('Account deleted successfully.');
      navigate('/signup');
    } catch (error) {
      alert('Failed to delete account.');
    }
  };

  const handleProgressChange = async (skill, status) => {
    try {
      const res = await axios.put('/api/profile/progress', { skill, status }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      setProgress(res.data);
      setUser({ ...user, progress: res.data });
    } catch (error) {
      alert('Failed to update progress');
    }
  };

  const renderSkillSelector = (label, field, showDropdown, setShowDropdown) => (
    <div className="mb-3">
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <div className="relative">
        <button
          type="button"
          onClick={() => setShowDropdown(!showDropdown)}
          className="w-full p-2 border border-gray-300 rounded shadow-sm text-left bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {formData[field].length > 0
            ? `${formData[field].length} skill(s) selected`
            : 'Select skills...'}
        </button>
        {showDropdown && (
          <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded shadow-lg max-h-60 overflow-y-auto">
            {predefinedSkills.map((skill) => (
              <div
                key={skill}
                onClick={() => toggleSkill(field, skill)}
                className={`p-2 cursor-pointer hover:bg-blue-50 ${
                  formData[field].includes(skill) ? 'bg-blue-100' : ''
                }`}
              >
                {skill}
              </div>
            ))}
          </div>
        )}
      </div>
      <div className="flex flex-wrap gap-2 mt-2">
        {formData[field].map((skill) => (
          <span
            key={skill}
            className="inline-flex items-center bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full"
          >
            {skill}
            <button
              type="button"
              onClick={() => removeSkill(field, skill)}
              className="ml-1 text-blue-600 hover:text-blue-800"
            >
              &times;
            </button>
          </span>
        ))}
      </div>
    </div>
  );

  return (
    <div className="bg-white p-6 rounded-lg shadow-md max-w-lg mx-auto">
      {isEditing ? (
        <>
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">Edit Profile</h2>
          <form onSubmit={handleSubmit}>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Name"
              className="w-full p-2 mb-3 border border-gray-300 rounded shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <textarea
              value={formData.bio}
              onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
              placeholder="Bio"
              className="w-full p-2 mb-3 border border-gray-300 rounded shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />

            {renderSkillSelector('Skills to Teach', 'skillsToTeach', showTeachDropdown, setShowTeachDropdown)}
            {renderSkillSelector('Skills to Learn', 'skillsToLearn', showLearnDropdown, setShowLearnDropdown)}

            <input
              type="text"
              value={formData.wishlist}
              onChange={(e) => setFormData({ ...formData, wishlist: e.target.value })}
              placeholder="Wishlist (comma-separated)"
              className="w-full p-2 mb-3 border border-gray-300 rounded shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />

            <select
              value={formData.privacy}
              onChange={(e) => setFormData({ ...formData, privacy: e.target.value })}
              className="w-full p-2 mb-3 border border-gray-300 rounded shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="public">Public</option>
              <option value="private">Private</option>
            </select>

            <input
              type="file"
              onChange={(e) => setProfilePicture(e.target.files[0])}
              className="w-full p-2 mb-3"
            />

            {user?.profilePicture && (
              <img
                src={`http://localhost:5000${user.profilePicture}`}
                alt="Profile"
                className="w-32 h-32 mb-3 rounded-full object-cover"
              />
            )}

            <div className="flex space-x-3">
              <button
                type="submit"
                className="w-full p-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
              >
                Save
              </button>
              <button
                type="button"
                onClick={handleCancel}
                className="w-full p-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition"
              >
                Cancel
              </button>
            </div>
          </form>

          {/* Custom Skill Modal */}
          {customSkillType && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
              <div className="bg-white p-6 rounded shadow-md w-96">
                <h3 className="text-lg font-semibold mb-3">Add Custom Skill</h3>
                <input
                  type="text"
                  value={customSkillInput}
                  onChange={(e) => setCustomSkillInput(e.target.value)}
                  placeholder="Enter custom skill"
                  className="w-full p-2 border border-gray-300 rounded mb-4"
                />
                <div className="flex justify-end space-x-3">
                  <button
                    onClick={() => setCustomSkillType(null)}
                    className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={addCustomSkill}
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                  >
                    Add
                  </button>
                </div>
              </div>
            </div>
          )}
        </>
      ) : (
        <>
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">My Profile</h2>
          <div className="flex items-center mb-6">
            <img
              src={user?.profilePicture ? `http://localhost:5000${user.profilePicture}` : 'http://localhost:5000/uploads/default.jpg'}
              alt="Profile"
              className="w-24 h-24 rounded-full object-cover mr-4"
            />
            <div>
              <h3 className="text-xl font-medium text-gray-800">{user?.name || 'No Name'}</h3>
              <p className="text-gray-600">{user?.bio || 'No bio provided'}</p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
              <h4 className="text-lg font-medium text-gray-700">Skills to Teach</h4>
              <p className="text-gray-600">
                {user?.skillsToTeach?.length > 0 ? user.skillsToTeach.join(', ') : 'None'}
              </p>
            </div>
            <div>
              <h4 className="text-lg font-medium text-gray-700">Skills to Learn</h4>
              <p className="text-gray-600">
                {user?.skillsToLearn?.length > 0 ? user.skillsToLearn.join(', ') : 'None'}
              </p>
            </div>
            <div>
              <h4 className="text-lg font-medium text-gray-700">Wishlist</h4>
              <p className="text-gray-600">
                {user?.wishlist?.length > 0 ? user.wishlist.join(', ') : 'None'}
              </p>
            </div>
            <div>
              <h4 className="text-lg font-medium text-gray-700">Privacy</h4>
              <p className="text-gray-600 capitalize">{user?.privacy || 'Public'}</p>
            </div>
          </div>

          {/* Skill Progress Tracking */}
          <div className="mb-6">
            <h4 className="text-lg font-medium text-gray-700 mb-2">Skill Progress</h4>
            {user?.skillsToLearn?.length > 0 ? (
              <div className="space-y-2">
                {user.skillsToLearn.map((skill) => {
                  const skillProgress = progress?.find((p) => p.skill === skill)?.status || 'Not Started';
                  return (
                    <div key={skill} className="flex items-center justify-between bg-gray-100 rounded p-2">
                      <span className="font-medium text-gray-800">{skill}</span>
                      <select
                        value={skillProgress}
                        onChange={(e) => handleProgressChange(skill, e.target.value)}
                        className="ml-2 p-1 rounded border border-gray-300"
                      >
                        {skillStatuses.map((status) => (
                          <option key={status} value={status}>{status}</option>
                        ))}
                      </select>
                      <span className={`ml-3 text-xs px-2 py-1 rounded-full ${
                        skillProgress === 'Completed' ? 'bg-green-200 text-green-800' :
                        skillProgress === 'In Progress' ? 'bg-yellow-200 text-yellow-800' :
                        'bg-gray-200 text-gray-800'
                      }`}>
                        {skillProgress}
                      </span>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-gray-600">No skills to track progress for.</p>
            )}
          </div>

          <button
            onClick={() => setIsEditing(true)}
            className="w-full p-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
          >
            Edit Profile
          </button>
          <button
            onClick={handleDeleteAccount}
            className="w-full p-2 mt-2 bg-red-600 text-white rounded hover:bg-red-700 transition"
          >
            Delete Account
          </button>
        </>
      )}
    </div>
  );
};

export default Profile;
