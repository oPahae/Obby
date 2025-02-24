import React, { useEffect, useState } from "react";
import axios from "axios";
import Link from "next/link";

export default function Tags({ roomId, userTagged, handleTag, session }) {
  const [roomData, setRoomData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchRoomData = async () => {
      try {
        const response = await axios.post("/api/room/getInfos", { id: roomId });
        if (response.data && response.data.room) {
          setRoomData(response.data.room)
          setLoading(false)
        } else {
          setError("Room not found :(");
        }
      } catch (err) {
        setError("Failed to fetch room data.");
      } finally {
        setLoading(false);
      }
    };
    if (roomId) fetchRoomData()
  }, [roomId]);

  useEffect(() => {
      const handleKeyDown = (e) => {
        if (e.key === "Tab") {
          e.preventDefault()
          console.log(roomData?.joinedUsers?.filter(e => e.userID?.username != session?.username)[0].userID.username)
          handleTag(roomData?.joinedUsers?.filter(e => e.userID?.username !== session?.username)[0]?.userID)
      }}
      window.addEventListener("keydown", handleKeyDown)
      return () => {
        window.removeEventListener("keydown", handleKeyDown);
      };
    }, [roomData]);

  if (loading)  return
  if (error)
    return (
      <div className="flex justify-center items-center h-96">
        <p className="text-xl text-red-500">{error}</p>
      </div>
    );

  return (
    <div className="w-fit h-fit px-8 py-2 bg-gray-900 bg-opacity-40 backdrop-blur-md rounded-t-xl text-white shadow-2xl transform transition-all duration-300 overflow-y-scroll">
      {roomData.joinedUsers.map(user => {
        return (
          user?.userID?.username?.includes(userTagged) && user?.userID?.username != session?.username &&
          <div key={user._id} onClick={() => handleTag(user.userID)} className="w-full h-[50px] px-6 py-2 flex justify-start items-center gap-4 cursor-pointer hover:bg-opacity-50 hover:backdrop-blur-md rounded-full">
            <img src={user.userID.img || "/user.png"} width={40} />
            <p className="font-semibold font-['arial']">{user.userID.username}</p>
            <hr />
          </div>
        )
      })}
    </div>
  );
}