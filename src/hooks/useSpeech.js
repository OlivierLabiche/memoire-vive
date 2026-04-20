import { useState, useRef } from "react";

export function useSpeech() {
  const [recording, setRecording] = useState(false);
  const [liveTranscript, setLiveTranscript] = useState("");
  const recognitionRef = useRef(null);

  const start = (onFinish) => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) {
      alert("Reconnaissance vocale non disponible dans ce navigateur");
      return;
    }
    const rec = new SR();
    rec.lang = "fr-FR";
    rec.continuous = true;
    rec.interimResults = true;
    let finalText = "";

    rec.onresult = (e) => {
      let interim = "";
      for (let i = e.resultIndex; i < e.results.length; i++) {
        if (e.results[i].isFinal) finalText += e.results[i][0].transcript + " ";
        else interim += e.results[i][0].transcript;
      }
      setLiveTranscript((finalText + interim).trim());
    };

    rec.onerror = (e) => {
      console.error("Speech error:", e.error);
      setRecording(false);
      setLiveTranscript("");
    };

    rec.onend = () => {
      setRecording(false);
      onFinish(finalText.trim());
    };

    recognitionRef.current = rec;
    rec.start();
    setRecording(true);
    setLiveTranscript("");
  };

  const stop = () => recognitionRef.current?.stop();

  return { recording, liveTranscript, setLiveTranscript, start, stop };
}
