import React, { useEffect, useState } from "react";
import axios from "axios";
import Link from "next/link";

export default function Infos({ roomId, session }) {
  const [roomData, setRoomData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchRoomData = async () => {
      try {
        const response = await axios.post("/api/room/getInfos", { id: roomId });
        if (response.data && response.data.room) {
          setRoomData(response.data.room);
        } else {
          setError("Room not found :(");
        }
      } catch (err) {
        setError("Failed to fetch room data.");
      } finally {
        setLoading(false);
      }
    };

    if (roomId) {
      fetchRoomData();
    }
  }, [roomId]);

  if (loading)
    return (
      <div className="flex justify-center items-center h-96">
        <p className="text-2xl font-semibold text-gray-500 animate-pulse">
          Loading...
        </p>
      </div>
    );
  if (error)
    return (
      <div className="flex justify-center items-center h-96">
        <p className="text-xl text-red-500">{error}</p>
      </div>
    );

  return (
    <div className="p-8 bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 text-white rounded-3xl shadow-2xl transform transition-all duration-300">
      {/* Header Section */}
      <h1 className="text-4xl font-extrabold mb-6 text-center border-b-4 border-white pb-3">
        {roomData.name}
      </h1>

      {/* Room Info Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
        {/* Column 1 */}
        <div className="space-y-4">
          <p className="text-lg flex items-center select-text">
            <span className="font-semibold mr-2">IP:</span> {roomData.ip}
          </p>
          <p className="text-lg flex items-center select-text">
            <span className="font-semibold mr-2">Port:</span> {roomData.port}
          </p>
          <p className="text-lg flex items-center">
            <span className="font-semibold mr-2">Owner:</span> {roomData.owner}
          </p>
          <p className="text-lg flex items-center">
            <span className="font-semibold mr-2">Created At:</span> {new Date(roomData.createdAt).toLocaleString()}
          </p>
        </div>

        {/* Column 2 */}
        <div className="space-y-4">
          <p className="text-lg flex items-center">
            <span className="font-semibold mr-2">Type:</span> {roomData.type}
          </p>
          <p className="text-lg flex items-center">
            <span className="font-semibold mr-2">Description:</span> {roomData.description || "No description"}
          </p>
          <p className="text-lg flex items-center">
            <span className="font-semibold mr-2">Members:</span> {roomData.membersCount}/{roomData.maxMembers}
          </p>
          <p className="text-lg flex items-center">
            <span className="font-semibold mr-2">Restrictions:</span>
            {roomData.boysOnly && "Boys Only, "}
            {roomData.girlsOnly && "Girls Only, "}
            {roomData.plus18Only && "18+ Only, "}
            {!roomData.boysOnly && !roomData.girlsOnly && !roomData.plus18Only && "None"}
          </p>
        </div>
      </div>

      {/* Joined Users Section */}
      <div className="mt-8">
        <h2 className="text-3xl font-semibold mb-6 text-center">Joined Users</h2>
        {roomData.joinedUsers.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {roomData.joinedUsers.map((user) => (
              <Link href={user.userID._id === session.id ? '/Profile' : '/User?id=' + user.userID._id}
                key={user.userID._id}
                className="flex flex-col items-center p-4 bg-white text-gray-800 rounded-2xl shadow-lg hover:shadow-2xl transition-shadow duration-300 transform hover:scale-105"
              >
                <img
                  src={user.userID.img || "/user.png"}
                  alt={user.userID.username}
                  className="w-16 h-16 rounded-full object-cover border-4 border-indigo-500 mb-3 shadow-md"
                />
                <span className="font-medium text-lg text-center">
                  {user.userID.username}
                </span>
              </Link>
            ))}
          </div>
        ) : (
          <p className="text-center text-lg text-gray-200">No users have joined yet...</p>
        )}
      </div>
    </div>
  );
}