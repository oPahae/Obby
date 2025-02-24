import { useState } from "react";
import { useRouter } from "next/router";

export default function RoomLocated({ id, name, owner, ip, port, members, img, userID }) {
  const router = useRouter();
  const [modalMessage, setModalMessage] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleJoinRoom = async () => {
    try {
      const response = await fetch("/api/room/join", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ roomId: id, userId: userID }),
      });

      const data = await response.json();

      if (response.status === 200) {
        router.push(`/Room?id=${id}`);
      } else {
        setModalMessage(data.message);
        setIsModalOpen(true);
      }
    } catch (error) {
      setModalMessage("An error occurred while trying to join the room :(");
      setIsModalOpen(true);
      console.error("Error joining room:", error);
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setModalMessage(null);
  };

  return (
    <>
      <div className="bg-black w-full text-gray-800 dark:text-gray-100 p-6 rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-105">
        <div className="flex flex-col sm:flex-row items-center gap-6">
          <div className="relative w-28 h-28 sm:w-32 sm:h-32 flex-shrink-0 mx-auto sm:mx-0">
            <img
              src={img}
              className="w-full h-full object-cover rounded-full border-4 border-indigo-500 shadow-md"
            />
            <div className="absolute inset-0 rounded-full border-2 border-gray-200 dark:border-gray-700" />
          </div>
          <div className="flex-1 text-center sm:text-left overflow-hidden">
            <h2 className="text-xl sm:text-2xl font-bold mb-2">{name}</h2>
            <p className="text-sm mb-1">
              <span className="font-medium text-pink-400">Owner :</span> {owner}
            </p>
            <p className="text-sm mb-1">
              <span className="font-medium text-blue-500">IP :</span> {ip}
            </p>
            <p className="text-sm mb-1">
              <span className="font-medium text-green-500">Port :</span> {port}
            </p>
            <p className="text-sm mb-1">
              <span className="font-medium text-purple-500">Members :</span> {members}
            </p>
            <div className="flex justify-center sm:justify-start gap-4 mt-4">
              <button
                onClick={handleJoinRoom}
                className="px-4 py-2 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-lg shadow-md transform transition-transform duration-200 hover:rotate-3"
              >
                Join !
              </button>
            </div>
          </div>
        </div>
      </div>

      {isModalOpen && (
        <div
          className="fixed h-[110vh] inset-0 z-50 flex justify-center items-center bg-black bg-opacity-50 backdrop-blur-sm"
          onClick={closeModal}
        >
          <div
            className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg max-w-md w-full text-center relative"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={closeModal}
              className="absolute top-2 right-2 text-gray-500 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white"
            >
              ✖
            </button>
            <h2 className="text-lg font-bold mb-4 text-gray-900 dark:text-gray-100">Notification</h2>
            <p className="text-gray-700 dark:text-gray-300">{modalMessage}</p>
            <button
              onClick={closeModal}
              className="mt-4 px-4 py-2 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-lg shadow-md"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </>
  );
}