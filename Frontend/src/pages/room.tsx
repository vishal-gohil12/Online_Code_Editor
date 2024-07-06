import { useState, useRef, useEffect } from "react";
import { Navigate, useLocation, useNavigate, useParams } from "react-router-dom"
import { Socket } from "socket.io-client";
import { Client } from "../components/client";
import { Editor } from "../components/editor";
import { initalizingSokcet } from "../socket";
import toast from "react-hot-toast";

interface Client {
    socketId: string;
    username: string | null;
}

export const Room = () => {
    const socketRef = useRef<Socket | null>(null);
    const navigate = useNavigate();
    const codeRef = useRef<string | null>(null);
    const location = useLocation();
    const { roomId } = useParams();


    const [clients, setClients] = useState<Client[]>([]);

    interface JoinedUser {
        socketId: string,
        username: string,
        client: Client[]
    }

    useEffect(() => {
        const init = async () => {
            socketRef.current = await initalizingSokcet();

            socketRef.current?.on('connect_error', (err) => {
                console.log("Error : ", err);
                toast.error("Socket Connection Failed");
                navigate('/');
            })
            socketRef.current.emit("join", {
                roomId,
                username: location.state?.username,
            });

            socketRef.current.on("joined", ({ socketId, username, client }: JoinedUser) => {
                if (username !== location.state.username) {
                    toast.success(`${username} has Joined`);
                }
                setClients(client);
                socketRef.current?.emit('code-sync', {
                    code: codeRef.current,
                    socketId
                });
            });

            socketRef.current.on("leave", ({ socketId, username }: { socketId: string, username: string }) => {
                toast.success(`${username} has left the room`);
                setClients((prev) => {
                    return prev.filter(client => {
                        client.socketId !== socketId
                    });
                });
            })
        }
        init();

        return () => {
            socketRef.current?.disconnect();
            socketRef.current?.off("joined");
            socketRef.current?.off("leave");
        }
    }, []);

    const copyRoom = async () => {
        try {
            if (roomId) {
                await navigator.clipboard.writeText(roomId);
                toast.success("Text is Copy");
            }
        } catch (e) {
            toast.error("Can not copy text");
        }
    }

    const leaveRoom = () => {
        navigate("/");
    }

    if (!location.state) {
        return <Navigate to={"/"} />
    }

    return (
        <div className="flex flex-col md:flex-row h-screen bg-[#1E1E1E] text-white">
            {/* Sidebar */}
            <div className="h-1/3 md:h-full w-full md:w-[230px] bg-[#282C34] p-4 shadow-lg flex flex-col justify-between">
                <div className="flex flex-col flex-grow overflow-y-auto">
                    <div className="mb-4">
                        <h1 className="text-xl font-bold text-logo">CodeWeb</h1>
                    </div>
                    <div className="mb-2">
                        <h2 className="text-lg font-semibold">Connected</h2>
                    </div>
                    <div className="grid grid-cols-1 gap-2">
                        {clients && clients.map((user) => (
                            <Client name={user.username} key={user.socketId} />
                        ))}
                    </div>
                </div>
                <div className="space-y-2 mt-4">
                    <button
                        className="w-full bg-green-500 rounded-md p-2 text-white hover:bg-green-400 transition"
                        onClick={copyRoom}
                    >
                        Copy Room ID
                    </button>
                    <button
                        className="w-full bg-red-500 rounded-md p-2 text-white hover:bg-red-400 transition"
                        onClick={leaveRoom}
                    >
                        Leave
                    </button>
                </div>
            </div>
            {/* Main Content */}
            <div className="flex-1 p-4 overflow-auto">
                {socketRef.current && (
                    <Editor
                        socketRef={socketRef}
                        roomId={roomId}
                        onCodeChange={(code) => {
                            codeRef.current = code;
                        }}
                    />
                )}
            </div>
        </div>
    );
}
