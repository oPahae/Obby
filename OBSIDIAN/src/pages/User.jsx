import { useState, useEffect } from "react";
import axios from "axios";
import RoomLocated from "../components/RoomLocated";
import { verifyAuth } from "../middlewares/auth";
import { useRouter } from "next/router";

export default function Profile({ session }) {
  const [initialValues, setInitialValues] = useState({});
  const [formValues, setFormValues] = useState({});
  const [img, setImg] = useState(null);
  const [rooms, setRooms] = useState([]);
  const router = useRouter()
  const { id } = router.query

  useEffect(() => {
    const fetchData = async () => {
      try {
        const userResponse = await axios.get("/api/user/getInfos", {
          params: { userId: id },
        });
        const roomsResponse = await axios.get("/api/room/getOwnRooms", {
          params: { userId: id },
        });
        console.log(roomsResponse.data)

        const userData = userResponse.data;
        setInitialValues(userData);
        setFormValues(userData);
        console.log(roomsResponse.data);
        setRooms(roomsResponse.data || []);

        if (userData.img) {
          setImg(userData.img);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };
    fetchData();
  }, [session.id]);

  return (
    <div className="flex flex-col items-center overflow-y-scroll relative bg-black rounded-3xl shadow-2xl overflow-hidden p-8 space-y-8">
      <div className="w-full relative flex flex-col items-center justify-center">
        {/* Image Section */}
        <div className="w-full h-60 bg-gradient-to-b from-violet-500 to-black rounded-b-full flex items-center justify-center relative">
          <img
            src={img || formValues.img || "/user.png"}
            className="w-40 h-40 rounded-full border-4 border-white shadow-lg absolute top-12 hover:scale-105 hover:rotate-6 transition-all"
          />
        </div>
        <h1 className="text-4xl font-extrabold text-white mt-16">{formValues.username}</h1>
        <p className="text-lg text-gray-300 mt-4">{formValues.bio}</p>
      </div>

      {/* Editable User Info Section */}
      <section className="w-full bg-black text-white p-6 rounded-lg shadow-md">
        <h2 className="text-2xl font-bold mb-4">{formValues.username || "someone"}'s Infos</h2>
        {["email", "age", "sex", "country"].map((field) => (
          <div key={field} className="flex justify-between items-center mb-4">
            <input
              type="text"
              value={formValues[field] || ""}
              disabled={true}
              className="w-3/4 p-2 bg-transparent border-b border-gray-600 text-white"
              placeholder={field}
            />
          </div>
        ))}
      </section>

      {/* Rooms Section */}
      <section className="w-full bg-black text-white p-6 rounded-lg shadow-md">
        <h2 className="text-2xl font-bold mb-4">{formValues.username || "someone"}'s Created Rooms</h2>
        <div className="w-full flex overflow-x-scroll">
          {rooms.map((room, index) => (
            <RoomLocated key={index}
              id={room._id}
              name={room.name}
              owner={room.owner}
              ip={room.ip}
              port={room.port}
              members={room.members}
              img={room.img ? `${room.img}` : null}
              userID={session.id}
            />
          ))}
        </div>
      </section>
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
