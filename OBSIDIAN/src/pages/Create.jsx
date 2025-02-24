import { useState } from 'react';
import { verifyAuth } from "../middlewares/auth";
import axios from 'axios';

export default function Create({ session }) {
  const [name, setName] = useState('');
  const [image, setImage] = useState(null);
  const [maxMembers, setMaxMembers] = useState(1);
  const [type, setType] = useState('Studing');
  const [description, setDescription] = useState('');
  const [filters, setFilters] = useState({ boys: false, girls: false, adults: false });
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState("");
  const [roomDetails, setRoomDetails] = useState({});

  const handleCreateRoom = async () => {
    if(name === "") {
      alert("Please enter a name :(")
      return
    }

    setLoading(true)
    const ip = `${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`;
    const port = Math.floor(Math.random() * (9999 - 1000 + 1)) + 1000;
  
    const formData = {
      name: name,
      img: image || "",
      ip: ip,
      port: port,
      owner: session.username,
      ownerID: session.id,
      maxMembers: maxMembers,
      type: type,
      description: description,
      boysOnly: filters.boys,
      girlsOnly: filters.girls,
      plus18Only: filters.adults
    };
  
    try {
      const response = await axios.post('/api/room/create ', formData, {
        headers: {
          'Content-Type': 'application/json'
        }
      });
      setRoomDetails(response.data)
      setSuccess(true)
      setLoading(false)
    } catch (error) {
      console.error('Error :', error.response?.data || error.message)
      setError(error.response?.data || error.message)
      setLoading(false)
    }
  };

  const handleImageUpload = (file) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => setImage(reader.result);
    reader.onerror = (error) => console.error("Error reading file:", error);
  };

  return (
    <div className="p-6 bg-black min-h-screen flex items-start justify-center">
      <div className="bg-gradient-to-br from-blue-500 to-purple-700 text-white p-8 rounded-xl shadow-xl w-full max-w-md md:max-w-2xl">
        <h1 className="text-3xl font-bold mb-6">Create Room</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="mb-4">
            <label htmlFor="name" className="block text-sm font-medium mb-1">Room Name</label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              className="w-full px-4 py-3 border border-black rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-gray-800 text-white placeholder-gray-500"
              placeholder="Enter Room Name"
              required
              autoComplete='off'
            />
          </div>
          <div className="mb-4">
            <label htmlFor="image" className="block text-sm font-medium mb-1">Room Image</label>
            <input
              id="image"
              type="file"
              onChange={e => handleImageUpload(e.target.files[0])}
              className="w-full px-4 py-3 border border-black rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-gray-800 text-white placeholder-gray-500"
            />
          </div>
          <div className="mb-4">
            <label htmlFor="maxMembers" className="block text-sm font-medium mb-1">Max Members</label>
            <input
              id="maxMembers"
              type="number"
              min={1} max={100}
              value={maxMembers}
              onChange={e => setMaxMembers(e.target.value)}
              className="w-full px-4 py-3 border border-black rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-gray-800 text-white placeholder-gray-500"
              placeholder="Enter Max Members"
              required
            />
          </div>
          <div className="mb-4">
            <label htmlFor="type" className="block text-sm font-medium mb-1">Type</label>
            <select
              id="type"
              value={type}
              onChange={e => setType(e.target.value)}
              className="w-full px-4 py-3 border border-black rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-gray-800 text-white"
            >
              <option value="Studing">Studing</option>
              <option value="Gaming">Gaming</option>
              <option value="Chatting">Chatting</option>
              <option value="Designing">Designing</option>
              <option value="Other">Other</option>
            </select>
          </div>
          <div className="mb-4 md:col-span-2">
            <label htmlFor="description" className="block text-sm font-medium mb-1">Description</label>
            <textarea
              id="description"
              value={description}
              onChange={e => setDescription(e.target.value)}
              className="w-full px-4 py-3 border border-black rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-gray-800 text-white placeholder-gray-500"
              placeholder="Enter Room Description"
            ></textarea>
          </div>
          <div className="mb-4 md:col-span-2">
            <span className="block text-sm font-medium mb-1">Filters</span>
            <div className="flex items-center gap-4">
              <label>
                <input
                  type="checkbox"
                  checked={filters.boys}
                  onChange={e => setFilters({ ...filters, boys: e.target.checked })}
                  className="mr-2"
                />
                Only Boys
              </label>
              <label>
                <input
                  type="checkbox"
                  checked={filters.girls}
                  onChange={e => setFilters({ ...filters, girls: e.target.checked })}
                  className="mr-2"
                />
                Only Girls
              </label>
              <label>
                <input
                  type="checkbox"
                  checked={filters.adults}
                  onChange={e => setFilters({ ...filters, adults: e.target.checked })}
                  className="mr-2"
                />
                Only +18
              </label>
            </div>
          </div>
        </div>
        <button
          type='submit'
          onClick={handleCreateRoom}
          className="w-full flex justify-center items-center px-4 py-3 bg-gradient-to-r from-green-500 to-green-500 text-white rounded-lg shadow-lg transform transition-transform duration-200 hover:rotate-2 mt-4"
        >
          {loading ? "Creating..." : "Create"}
        </button>
        {loading && (
          <div className="mt-3 flex justify-center">
            <img src="/progress.gif" className='w-[60px]' />
          </div>
        )}
        {success && (
          <div className="mt-6 text-center text-green-400 font-semibold select-text">
            Room Created Successfully!<br />
            IP: {roomDetails.ip} <br />
            Port: {roomDetails.port}
          </div>
        )}
        {error != "" && (
          <div className="mt-6 text-center text-white font-semibold bg-red-700 rounded-lg shadow-lg">
            Error !<br />
            {error}
          </div>
        )}
      </div>
    </div>
  );
}

export async function getServerSideProps({ req, res }) {
  const user = verifyAuth(req, res);

  if (!user) {
    return {
      redirect: {
        destination: "/Login",
        permanent: false,
      },
    };
  }

  return {
    props: { session: { username: user.username, id: user.id } },
  };
}