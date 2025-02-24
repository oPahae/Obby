import { useState, useEffect } from "react";
import axios from "axios";
import RoomCreated from "../components/RoomCreated";
import { verifyAuth } from "../middlewares/auth";
import { useRouter } from "next/router";

export default function Profile({ session }) {
  const [isEditing, setIsEditing] = useState(false);
  const [initialValues, setInitialValues] = useState({});
  const [formValues, setFormValues] = useState({});
  const [img, setImg] = useState(null);
  const [rooms, setRooms] = useState([]);
  const [dropAccDivShown, setDropAccDivShown] = useState(false);
  const router = useRouter()

  useEffect(() => {
    const fetchData = async () => {
      try {
        const userResponse = await axios.get("/api/user/getInfos", {
          params: { userId: session.id },
        });
        const roomsResponse = await axios.get("/api/room/getOwnRooms", {
          params: { userId: session.id },
        });
        console.log(roomsResponse.data)

        const userData = userResponse.data;
        setInitialValues(userData);
        setFormValues(userData);
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

  const handleEdit = () => setIsEditing(true);

  const handleCancel = () => {
    setFormValues(initialValues);
    setIsEditing(false);
  };

  const handleChange = (field, value) => {
    setFormValues({ ...formValues, [field]: value });
  };

  const handleImageUpload = (file) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => setImg(reader.result);
    reader.onerror = (error) => console.error("Error reading file:", error);
  };

  const handleSave = async () => {
    try {
      const response = await axios.post("/api/user/updateInfos", {
        userId: session.id,
        updatedValues: formValues,
        img: img,
      });

      if (response.status === 200) {
        alert("Your information has been successfully updated!");
        setInitialValues(formValues);
        setIsEditing(false);
      } else {
        alert("Failed to update your information.");
      }
    } catch (error) {
      console.error("Error updating user information:", error);
      alert("An error occurred while saving your changes. Please try again.");
    }
  };

  const handleDropAcc = async() => {
    try {
      const response = await fetch("/api/user/drop?id=" + session.id)
      if(response.ok) {
        const res = await fetch('/api/auth/logout', { method: 'POST' });
        if (res.ok) router.push('/Login');
      }
    } catch (error) {
      alert("Something went wrong !")
    }
  }

  return (
    <div className="flex flex-col items-center overflow-y-scroll relative bg-black rounded-3xl shadow-2xl overflow-hidden p-8 space-y-8">
      <div className="w-full relative flex flex-col items-center justify-center">
        {/* Image Section */}
        <div className="w-full h-60 bg-gradient-to-b from-violet-500 to-black rounded-b-full flex items-center justify-center relative">
          <img
            src={img || formValues.img || "/user.png"}
            className="w-40 h-40 rounded-full border-4 border-white shadow-lg absolute top-12 hover:scale-105 hover:rotate-6 transition-all"
          />
          {isEditing && (
            <input
              type="file"
              onChange={(e) => handleImageUpload(e.target.files[0])}
              className="absolute w-[96px] cursor-pointer"
              style={{
                top: "100%",
                left: "50%",
                transform: "translate(-50%, -50%)",
              }}
            />
          )}
        </div>

        {/* Editable Username */}
        {isEditing ? (
          <input
            type="text"
            value={formValues.username || ""}
            onChange={(e) => handleChange("username", e.target.value)}
            className="text-4xl font-extrabold text-white mt-16 bg-transparent border-b border-gray-600 text-center focus:outline-none"
            placeholder="Enter your username"
          />
        ) : (
          <h1 className="text-4xl font-extrabold text-white mt-16">{formValues.username}</h1>
        )}

        {/* Editable Bio */}
        {isEditing ? (
          <textarea
            value={formValues.bio || ""}
            onChange={(e) => handleChange("bio", e.target.value)}
            className="w-full text-lg text-gray-300 bg-transparent border-b border-gray-600 mt-4 text-center focus:outline-none resize-none"
            rows={2}
            placeholder="Enter your bio"
          />
        ) : (
          <p className="text-lg text-gray-300 mt-4">{formValues.bio}</p>
        )}
      </div>

      {/* Editable User Info Section */}
      <section className="w-full bg-black text-white p-6 rounded-lg shadow-md">
        <h2 className="text-2xl font-bold mb-4">Your Infos</h2>
        {["email", "age", "country"].map((field) => (
          <div key={field} className="flex justify-between items-center mb-4">
            <input
              type="text"
              value={formValues[field] || ""}
              onChange={(e) => handleChange(field, e.target.value)}
              disabled={!isEditing}
              className="w-3/4 p-2 bg-transparent border-b border-gray-600 text-white"
              placeholder={field}
            />
          </div>
        ))}
        <div className="flex justify-between items-center mb-4">
          <select
            value={formValues.sex || ""}
            onChange={(e) => handleChange("sex", e.target.value)}
            disabled={!isEditing}
            className="w-3/4 p-2 bg-black border-b border-gray-600 text-white"
          >
            <option value="" disabled hidden>
              Select sex
            </option>
            <option value="Boy">Boy</option>
            <option value="Girl">Girl</option>
          </select>
        </div>
        {!isEditing ? (
          <button onClick={handleEdit} className="bg-violet-500 hover:bg-violet-600 text-white font-bold py-2 px-4 rounded">
            Edit
          </button>
        ) : (
          <div className="flex justify-start gap-2">
            <button onClick={handleSave} className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded">
              Save
            </button>
            <button onClick={handleCancel} className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded">
              Cancel
            </button>
          </div>
        )}
      </section>

      {/* Rooms Section */}
      <section className="w-full bg-black text-white p-6 rounded-lg shadow-md">
         <h2 className="text-2xl font-bold mb-4">Your Created Rooms</h2>
        <div className="w-full flex overflow-x-scroll overflow-y-hidden BLACK-SCROLL-BAR">
          {rooms.map((room, index) => (
            <RoomCreated key={index} {...room} />
          ))}
        </div>
      </section>

      {/* Drop Acc */}
      <section className="w-full bg-black text-white p-6 rounded-lg shadow-md">
        <h2 className="text-2xl font-bold mb-4">Delete Account</h2>
        <button onClick={e => setDropAccDivShown(e => !e)} className="rounded-xl px-2 py-2 bg-gradient-to-r from-red-500 to-red-900 font-semibold text-white">
          Delete my account permanently
        </button>
        {dropAccDivShown &&
          <div className="flex flex-col justify-between w-fit items-center p-6 m-2 gap-3">
            <p>Are you sure ? :(</p>
            <div className="flex flex-row gap-2">
              <button className="rounded-xl px-2 py-2 font-bold text-white bg-red-600" onClick={handleDropAcc}>Yes, delete my account</button>
              <button className="rounded-xl px-2 py-2 font-bold text-white bg-blue-600" onClick={e => setDropAccDivShown(e => !e)}>No, it was a joke</button>
            </div>
          </div>
        }
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
