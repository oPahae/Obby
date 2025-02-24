import { useState } from 'react';
import axios from 'axios';
import RoomLocated from '../components/RoomLocated';
import { verifyAuth } from "../middlewares/auth";

export default function Locate({ session }) {
  const [ipInput, setIpInput] = useState('');
  const [portInput, setPortInput] = useState('');
  const [locatedRoom, setLocatedRoom] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [locateClicked, setLocateClicked] = useState(false);

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
    <div className="p-6 bg-black h-fit flex justify-center">
      <div className="bg-gradient-to-br from-blue-500 to-purple-700 text-white p-8 rounded-xl shadow-xl w-full max-w-md">
        <h1 className="text-3xl font-bold mb-6">Locate Room</h1>
        <div className="mb-4">
          <label htmlFor="ip" className="block text-sm font-medium mb-1">IP Address</label>
          <input
            id="ip"
            type="text"
            value={ipInput}
            onChange={e => setIpInput(e.target.value)}
            className="w-full px-4 py-3 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-gray-900 text-white placeholder-gray-500"
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
            className="w-full px-4 py-3 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-gray-900 text-white placeholder-gray-500"
            placeholder="Enter Port"
            autoComplete='off'
          />
        </div>
        <button
          onClick={handleLocateRoom}
          className="w-full px-4 py-3 bg-gradient-to-r from-green-500 to-green-500 text-white rounded-lg shadow-lg transform transition-transform duration-200 hover:-rotate-2"
        >
          {isLoading ? "Locating..." : "Locate"}
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