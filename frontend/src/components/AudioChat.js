import React, { useState, useEffect, useRef, useContext, useCallback } from "react";
import { useReactMediaRecorder } from "react-media-recorder";
import { SessionContext } from "../contexts/SessionContext";
import useWebSocket from "../hooks/useWebSocket";

const AudioChat = () => {
  const { sessionData } = useContext(SessionContext);
  const audioQueue = useRef([]);
  const { status, startRecording, stopRecording, mediaBlobUrl } =
    useReactMediaRecorder({
      audio: true,
      echoCancellation: true,
      noiseSuppression: true,
    });

    const onMessage = useCallback((event) => {
      const message = JSON.parse(event.data);
      if (message.type === "audio_response") {
        const audioBlob = new Blob([
          Uint8Array.from(atob(message.data), (c) => c.charCodeAt(0)),
        ]);
        const audioUrl = URL.createObjectURL(audioBlob);
        audioQueue.current.push(audioUrl);
    
        if (audioQueue.current.length === 1) {
          playNextAudio();
        }
      }
    }, []);

  const { sendMessage, readyState } = useWebSocket(
    sessionData ? `ws://localhost:8000/stream/${sessionData.token}` : null, onMessage
  );

  const playNextAudio = useCallback(() => {
    if (audioQueue.current.length > 0) {
      const audioUrl = audioQueue.current.shift();
      const audio = new Audio(audioUrl);
      audio.play().catch((e) => console.error("Error playing audio:", e));
      audio.onended = () => {
        playNextAudio();
      };
    }
  }, []);

  useEffect(() => {
    if (mediaBlobUrl && readyState === WebSocket.OPEN) {
      const reader = new FileReader();
      reader.readAsDataURL(mediaBlobUrl);
      reader.onloadend = () => {
        const base64data = reader.result.split(",")[1];
        sendMessage(
          JSON.stringify({
            type: "audio_chunk",
            session_id: sessionData.sessionId,
            data: base64data,
            sequence_number: 0,
          })
        );
      };
    }
  }, [mediaBlobUrl, sendMessage, sessionData, readyState]);

  const handleRecordButtonClick = () => {
    if (status === "recording") {
      stopRecording();
    } else {
      startRecording();
    }
  };

  return (
    <div>
      <button onClick={handleRecordButtonClick}>
        {status === "recording" ? "Stop Recording" : "Start Recording"}
      </button>
      <p>Status: {status}</p>
    </div>
  );
};

export default AudioChat;