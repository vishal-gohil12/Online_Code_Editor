import 'codemirror/lib/codemirror.css';
import 'codemirror/theme/material.css';
import 'codemirror/addon/edit/closebrackets';
import 'codemirror/mode/javascript/javascript';
import CodeMirror from 'codemirror';
import { useEffect, useRef, useState } from "react";
import { Socket } from "socket.io-client";
import axios from 'axios';

interface EditorProps {
    socketRef: React.MutableRefObject<Socket | null>;
    roomId: string | undefined;
    onCodeChange?: (code: string) => void | undefined;
}

export const Editor = ({ socketRef, roomId, onCodeChange }: EditorProps) => {
    const editorRef = useRef<CodeMirror.EditorFromTextArea | null>(null);
    const isRemoteChangeRef = useRef(false);
    const [output, setOutput] = useState<string | null>(null);

    useEffect(() => {
        const init = async () => {
            const textarea = document.getElementById("realtimeEditor");

            if (textarea instanceof HTMLTextAreaElement) {
                const editor = CodeMirror.fromTextArea(textarea, {
                    mode: { name: "javascript", json: true },
                    lineNumbers: true,
                    theme: 'material',
                    autoCloseBrackets: true,
                });

                editor.setSize('100%', 'calc(100vh - 150px)');
                editorRef.current = editor;

                editor.on("change", (instance, changes) => {
                    if (isRemoteChangeRef.current) {
                        isRemoteChangeRef.current = false;
                        return;
                    }
                    const { origin } = changes;
                    const code = instance.getValue();
                    if (onCodeChange != undefined) {
                        onCodeChange(code);
                    }
                    if (socketRef && origin !== 'setValue') {
                        console.log(origin);
                        socketRef.current?.emit('code-change', {
                            roomId,
                            code
                        });
                    }
                });
            }
        }

        init();
    }, []);

    useEffect(() => {
        const socket = socketRef?.current;
        if (socket) {
            socketRef.current?.on('code-change', ({ code }) => {
                if (editorRef.current && code !== null) {
                    isRemoteChangeRef.current = true;
                    editorRef.current.setValue(code);
                }
            });
        }

        return () => {
            socketRef.current?.off('code-change');
        }
    }, [socketRef.current]);

    useEffect(() => {
        const socket = socketRef?.current;
        if (socket) {
            socket.on('output-change', ({ output }) => {
                setOutput(output);
            });
        }

        return () => {
            socket?.off('output-change');
        }
    }, [socketRef.current]);

    const runCode = async () => {
        if (editorRef.current) {
            const code = editorRef.current.getValue();

            try {
                const response = await axios.post('http://localhost:8080/api/v1/room/execute', { code });
                const output = response.data.output;
                setOutput(output);

                if (socketRef.current) {
                    socketRef.current.emit('output-change', {
                        roomId,
                        output
                    });
                }

            } catch (error: any) {
                const errorMessage = `Error: ${error.response?.data?.error || error.message}`;
                setOutput(errorMessage);

                if (socketRef.current) {
                    socketRef.current.emit('output-change', {
                        roomId,
                        output: errorMessage
                    });
                }
            }

        }
    };

    return (
        <div className="flex flex-col h-full">
            <div className="flex-grow relative">
                <textarea id="realtimeEditor"></textarea>
                <button
                    onClick={runCode}
                    className="absolute top-2 right-2 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-400 transition"
                >
                    Run
                </button>
            </div>
            <div className="h-1/5 bg-[#282C34] text-white p-2 overflow-auto border-t border-gray-700">
                <h3 className="font-bold mb-2">Output:</h3>
                <pre className="whitespace-pre-wrap">{output}</pre>
            </div>
        </div>
    );
};
