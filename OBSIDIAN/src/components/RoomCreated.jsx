import Link from "next/link";

export default function RoomCreated({ _id, name, owner, ip, port, members, img }) {
    const handleDropRoom = async () => {
      try {
        const response = await fetch("/api/room/drop", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ roomID: _id }),
        });
  
        if (response.ok) {
          alert("Room dropped !")
          window.location.href = "/Profile"
        } else {
          console.error("Room can't be dropped !");
        }
      } catch (error) {
        console.error("Connexion error :", error);
      }
    }

    return (
      <div className="bg-black w-full text-gray-800 dark:text-gray-100 p-6 rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-105">
        <div className="flex flex-col sm:flex-row items-center gap-6">
          {/* Image avec cadre */}
          <div className="relative w-28 h-28 sm:w-32 sm:h-32 flex-shrink-0 mx-auto sm:mx-0">
            <img
              src={img}
              className="w-full h-full object-cover rounded-full border-4 border-indigo-500 shadow-md"
            />
            <div className="absolute inset-0 rounded-full border-2 border-gray-200 dark:border-gray-700" />
          </div>
  
          {/* Contenu */}
          <div className="flex-1 text-center sm:text-left">
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
  
            {/* Boutons */}
            <div className="flex justify-center sm:justify-start gap-4 mt-4">
              <Link href={"/Room?id="+_id} className="px-4 py-2 bg-gradient-to-r from-green-500 to-purple-600 text-white rounded-lg shadow-md transform transition-transform duration-200 hover:rotate-3">
                View
              </Link>
              <button onClick={handleDropRoom} className="px-4 py-2 bg-gradient-to-r from-red-500 to-purple-600 text-white rounded-lg shadow-md transform transition-transform duration-200 hover:rotate-3">
                Drop
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }
  