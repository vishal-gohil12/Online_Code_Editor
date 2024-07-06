import { useState } from "react";
import {useNavigate} from "react-router-dom"
import {v4 as uuid} from "uuid";
import toast from "react-hot-toast";

export const Home = () => {
    const [username, setUsername] = useState('');
    const [roomId, setRoomId] = useState('');
    const navigate = useNavigate();

    const createNewRoom = (e:React.MouseEvent<HTMLAnchorElement>) => {
        e.preventDefault(); 
        const id = uuid();
        setRoomId(id);
        toast.success("New Room ID is Created");
    }

    const handleJoinRoom : React.MouseEventHandler<HTMLButtonElement> = (e) =>{ 
        e.preventDefault();
        if(!roomId || !username) {
            toast.error("Something went wrong!");
        }
        else {
            navigate(`/room/${roomId}`, {
                state: {
                    username
                }
            });
        }
    }

    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-[#1E1E1E] text-gray-300 p-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-center text-white-400">ROOM</h1>
        </div>
        <div className="bg-[#252526] shadow-lg rounded-lg p-6 w-full max-w-md">
          <form className="space-y-4">
            <div>
              <label className="block text-white">User Name:</label>
              <input
                type="text"
                placeholder="Enter the name of User"
                value={username}
                className="w-full px-4 py-2 mt-1 bg-[#3C3C3C] border border-[#555555] rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-white-400"
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-white-400">Room Id:</label>
              <input
                type="text"
                placeholder="Enter the Room ID"
                value={roomId}
                className="w-full px-4 py-2 mt-1 bg-[#3C3C3C] border border-[#555555] rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-white-400"
                onChange={(e) => setRoomId(e.target.value)}
              />
            </div>
            <button
              type="submit"
              className="w-full py-2 px-4 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700"
              onClick={handleJoinRoom}
            >
              Join
            </button>
          </form>
          <div className="mt-6 text-center">
           <a onClick={createNewRoom} href="#">
                <p className="text-blue-400 hover:text-blue-600 cursor-pointer">
                    Create room
                </p>
            </a>
          </div>
        </div>
      </div>
    );
  };
  