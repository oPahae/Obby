import { useState, useEffect } from 'react';
import Room from '../components/Room';
import RoomLocated from '../components/RoomLocated';
import axios from 'axios';
import { verifyAuth } from "../middlewares/auth";

export default function Index({ session }) {
  const [rooms, setRooms] = useState([]);
  const [ipInput, setIpInput] = useState('');
  const [portInput, setPortInput] = useState('');
  const [locatedRoom, setLocatedRoom] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [locateClicked, setLocateClicked] = useState(false);

  useEffect(() => {
    const fetchRooms = async () => {
      try {
        const response = await axios.get(`/api/room/getRooms?userId=${session.id}`);
        setRooms(response.data || []);
        setRooms(response.data);
      } catch (error) {
        console.error("Error fetching rooms:", error);
      }
    };
    fetchRooms();
  }, [session.id]);

  const handleLocateRoom = async () => {
    const strictIpRegex = /^(25[0-5]|2[0-4]\d|1\d{2}|[1-9]?\d)\.(25[0-5]|2[0-4]\d|1\d{2}|[1-9]?\d)\.(25[0-5]|2[0-4]\d|1\d{2}|[1-9]?\d)\.(25[0-5]|2[0-4]\d|1\d{2}|[1-9]?\d)$/;
    if (!strictIpRegex.test(ipInput)) {
      alert("Stop Joking");
      return
    }
    setLocateClicked(true);
    setIsLoading(true);
    setLocatedRoom(null);
    try {
      const response = await axios.post('/api/room/locate', { ip: ipInput, port: portInput });
      setLocatedRoom(response.data.room || null);
    } catch (error) {
      console.error('Error fetching room:', error);
      setLocatedRoom(null);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-6 bg-black min-h-screen flex justify-evenly items-start lg:flex-row">
      <div className="lg:max-w-[450px] overflow-auto lg:pr-6">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100 ml-4 mb-6">
          Your Joined Rooms
        </h1>
        <div className="flex flex-col gap-2 overflow-y-scroll h-[80vh]">
          {rooms.length > 0 ? (
            rooms.map((room, index) => (
              <div className="room" key={index}>
                <Room {...room} session={session} />
              </div>
            ))
          ) : (
            <div className="flex justify-center text-white">
              <div className="flex justify-center">
                <div className="w-8 h-8 border-4 border-white border-dashed rounded-full animate-spin"></div>
              </div>
            </div>
          )}
        </div>
      </div>
      <div className="lg:min-w-[500px] flex flex-col lg:items-center lg:justify-center mt-6 lg:mt-0 hidden lg:flex">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100 ml-4 mb-6">
          Locate Room
        </h1>
        <div className="bg-gradient-to-br from-blue-500 to-purple-700 text-white p-8 rounded-xl shadow-xl transform transition-transform duration-500 w-full lg:w-3/4">
          <div className="mb-4">
            <label htmlFor="ip" className="block text-sm font-medium mb-1">IP Address</label>
            <input
              id="ip"
              type="text"
              value={ipInput}
              onChange={e => setIpInput(e.target.value)}
              className="w-full px-4 py-3 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition bg-gray-900 text-white placeholder-gray-500"
              placeholder="Enter IP"
              autoComplete='off'
            />
          </div>
          <div className="mb-4">
            <label htmlFor="port" className="block text-sm font-medium mb-1">Port</label>
            <input
              id="port"
              type="number"
              value={portInput}
              onChange={e => setPortInput(e.target.value)}
              className="w-full px-4 py-3 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition bg-gray-900 text-white placeholder-gray-500"
              placeholder="Enter Port"
              autoComplete='off'
            />
          </div>
          <button
            onClick={handleLocateRoom}
            className="w-full px-4 py-3 bg-gradient-to-r from-green-500 to-green-500 text-white rounded-lg shadow-lg transform transition-transform duration-200 hover:scale-105"
          >
            {isLoading ? "Locating.." : "Locate"}
          </button>
          {isLoading && (
            <div className="mt-3 flex justify-center">
              <img src="/progress.gif" className='w-[70px]' />
            </div>
          )}
          {!isLoading && locatedRoom && locateClicked && (
            <div className="mt-6">
              <RoomLocated
                id={locatedRoom.id}
                name={locatedRoom.name}
                owner={locatedRoom.owner}
                ip={locatedRoom.ip}
                port={locatedRoom.port}
                members={locatedRoom.members}
                img={locatedRoom.img ? `${locatedRoom.img}` : null}
                userID={session.id}
              />
            </div>
          )}
          {!isLoading && locatedRoom === null && locateClicked && (
            <div className="mt-6 text-center text-white font-semibold bg-red-700 rounded-lg shadow-lg py-2">
              Room not found :(
            </div>
          )}
        </div>
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