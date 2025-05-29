import { useEffect, useRef, useState } from "react";

export const useTwitchChat = (url: string) => {
    const [messages, setMessages] = useState<string[]>([]);
    const wsRef = useRef<WebSocket | null>(null);

    useEffect(() => {
        const ws = new WebSocket(url);
        wsRef.current = ws;

        ws.onopen = () => {
            console.log("[WebSocket] Connected");
        };

        ws.onmessage = (event) => {
            const data = event.data;
            setMessages((prev)=> [...prev, data]);
            console.log("[WebSocket] Message received:", data);
        };

        ws.onerror = (error) => {
            console.error("[WebSocket] Error:", error);
        };

        ws.onclose = () => {
            console.log("[WebSocket] Disconnected");
        };
        return () => {
            if (wsRef.current) {
                wsRef.current.close();
                wsRef.current = null;
            }
        };
    }, [url]);

    const sendMessage = (msg: string) => {
        if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
            wsRef.current.send(msg);
            console.log("[WebSocket] Message sent:", msg);
        }
    };

    return {
        messages,
        sendMessage,
    };
}