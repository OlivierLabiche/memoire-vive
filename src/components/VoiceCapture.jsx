import { useState } from "react";
import { T } from "../lib/constants.js";
import { useSpeech } from "../hooks/useSpeech.js";
import { classify } from "../lib/api.js";

export default function VoiceCapture({ onResult, onAddCourses }) {
  const [classifying, setClassifying] = useState(false);
  const { recording, liveTranscript, setLiveTranscript, start, stop } = useSpeech();

  const handleFinish = async (text) => {
    if (!text) { setLiveTranscript(""); return; }
    setLiveTranscript("Classification en cours…");
    setClassifying(true);
    try {
      const result = await classify(text);
      setLiveTranscript("");
      if (result?.mode === "course" && result.courses?.length) {
        onAddCourses(result.courses);
      } else {
        onResult(result || { mode: "tache", text });
      }
    } catch {
      setLiveTranscript("");
      onResult({ mode: "tache", text });
    } finally {
      setClassifying(false);
    }
  };

  const handleStart = () => start(handleFinish);

  return (
    <>
      {/* Mic button */}
      <button
        onClick={handleStart}
        style={{
          width: 48, height: 48, borderRadius: "50%", border: "none",
          background: "#D94F3B", color: "#FFF", cursor: "pointer",
          fontSize: 18, display: "flex", alignItems: "center", justifyContent: "center",
          boxShadow: "0 4px 14px rgba(217,79,59,0.35)",
          transition: "all 0.2s ease",
        }}
        onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.08)")}
        onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
      >
        🎙
      </button>

      {/* Recording overlay */}
      {(recording || classifying) && (
        <div
          style={{
            position: "fixed", inset: 0, zIndex: 200,
            background: "rgba(30,30,28,0.5)", backdropFilter: "blur(6px)",
            display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
            gap: 20, padding: 40,
          }}
          onClick={recording ? stop : undefined}
        >
          <div style={{
            width: 80, height: 80, borderRadius: "50%",
            background: recording ? "#D94F3B" : "#555",
            display: "flex", alignItems: "center", justifyContent: "center",
            animation: recording ? "recPulse 1.5s ease infinite" : "none",
            cursor: recording ? "pointer" : "default",
          }}>
            <span style={{ fontSize: 28, color: "#FFF" }}>{recording ? "🎙" : "⏳"}</span>
          </div>
          <p style={{
            fontSize: 15, fontFamily: T.font, fontWeight: 500, color: "#FFF",
            textAlign: "center", maxWidth: 360, lineHeight: 1.5,
          }}>
            {classifying ? "Classification en cours…" : liveTranscript || "Parle…"}
          </p>
          {recording && (
            <p style={{ fontSize: 12, fontFamily: T.font, color: "rgba(255,255,255,0.5)", marginTop: -10 }}>
              Appuie n'importe où pour arrêter
            </p>
          )}
        </div>
      )}
    </>
  );
}
