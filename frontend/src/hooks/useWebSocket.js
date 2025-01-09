import { useState, useEffect, useRef } from "react";

const useWebSocket = (url, onMessage) => {
  const [readyState, setReadyState] = useState(WebSocket.CLOSED);
  const websocket = useRef(null);
  const retryAttempts = useRef(0);
  const maxReconnectAttempts = 5;
  const reconnectDelay = 5000;

  const connect = () => {
    if (!url) return;
    websocket.current = new WebSocket(url);

    websocket.current.onopen = () => {
      console.log("WebSocket connected");
      setReadyState(WebSocket.OPEN);
      retryAttempts.current = 0;
    };

    websocket.current.onmessage = onMessage;

    websocket.current.onerror = (error) => {
      console.error("WebSocket error:", error);
    };

    websocket.current.onclose = (event) => {
      console.log("WebSocket closed:", event);
      setReadyState(WebSocket.CLOSED);
      if (retryAttempts.current < maxReconnectAttempts) {
        setTimeout(() => {
          retryAttempts.current += 1;
          connect();
        }, reconnectDelay * (retryAttempts.current + 1));
      } else {
        console.error("Max reconnect attempts reached.");
      }
    };
  };

  useEffect(() => {
    connect();

    return () => {
      if (websocket.current) {
        websocket.current.close();
      }
    };
  }, [url]);

  const sendMessage = (message) => {
    if (websocket.current && websocket.current.readyState === WebSocket.OPEN) {
      websocket.current.send(message);
    } else {
      console.error("WebSocket not connected. Unable to send message.");
    }
  };

  return { sendMessage, readyState };
};

export default useWebSocket;