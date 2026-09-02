import React, { useState, useEffect, useRef } from 'react';
import { 
  Plus, MessageSquare, Trash2, Search, Send, Square, 
  ChevronDown, ChevronRight, BookOpen, CheckCircle, Database, ShieldAlert, Loader2,
  Mic, MicOff, Volume2, VolumeX, Globe, Info, AlertCircle
} from 'lucide-react';

import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import './Assistant.css';
import logo from '../../assets/logo1.png';

const API_BASE_URL = "/api";

const LANGUAGES = [
  { name: "English", code: "en" },
  { name: "Hindi", code: "hi" },
  { name: "Marathi", code: "mr" },
  { name: "Tamil", code: "ta" },
  { name: "Telugu", code: "te" },
  { name: "Bengali", code: "bn" },
  { name: "Gujarati", code: "gu" },
  { name: "Kannada", code: "kn" },
  { name: "Malayalam", code: "ml" },
  { name: "Punjabi", code: "pa" }
];

export default function Assistant() {
  const [sessions, setSessions] = useState(() => {
    const defaultId = Math.random().toString(36).substring(2, 9);
    return {
      [defaultId]: { id: defaultId, title: "New Healthcare Chat", messages: [] }
    };
  });
  const [currentSessionId, setCurrentSessionId] = useState(() => Object.keys(sessions)[0]);
  const [searchQuery, setSearchQuery] = useState("");
  const [inputQuery, setInputQuery] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [systemStatus, setSystemStatus] = useState({ online: false, vectorCount: 0 });
  const [expandedCitations, setExpandedCitations] = useState({});
  const [selectedLanguage, setSelectedLanguage] = useState("English");

  // Voice Recording & TTS States
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [playingAudioIndex, setPlayingAudioIndex] = useState(null);
  const currentAudioRef = useRef(null);

  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const abortControllerRef = useRef(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/status`);
        const data = await res.json();
        if (data.status === "online") {
          setSystemStatus({ online: true, vectorCount: data.vector_count });
        } else {
          setSystemStatus({ online: false, vectorCount: 0 });
        }
      } catch (err) {
        setSystemStatus({ online: false, vectorCount: 0 });
      }
    };
    fetchStatus();
    const interval = setInterval(fetchStatus, 15000);
    return () => clearInterval(interval);
  }, []);

  // Load persisted conversations for authenticated user
  useEffect(() => {
    const loadConversations = async () => {
      try {
        const token = localStorage.getItem("authToken");
        if (!token) return; // no authenticated user
        const res = await fetch(`${API_BASE_URL}/v1/conversations`, { headers: { Authorization: `Bearer ${token}` } });
        if (!res.ok) return;
        const data = await res.json();
        if (!Array.isArray(data)) return;
        const mapped = {};
        for (const c of data) {
          mapped[c.id] = { id: c.id, title: c.title || "Chat", messages: c.messages || [], backendSessionId: c.id };
        }
        if (Object.keys(mapped).length > 0) {
          setSessions(mapped);
          setCurrentSessionId(Object.keys(mapped)[0]);
        }
      } catch (e) {
        console.warn("Failed to load conversations:", e);
      }
    };
    loadConversations();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [sessions, currentSessionId, isGenerating, isTranscribing]);

  const activeSession = sessions[currentSessionId] || { title: "New Healthcare Chat", messages: [] };

  const handleNewChat = () => {
    const newId = Math.random().toString(36).substring(2, 9);
    setSessions(prev => ({
      ...prev,
      [newId]: { id: newId, title: "New Healthcare Chat", messages: [] }
    }));
    setCurrentSessionId(newId);
  };

  const handleDeleteSession = (id, e) => {
    e.stopPropagation();
    setSessions(prev => {
      const updated = { ...prev };
      delete updated[id];
      const keys = Object.keys(updated);
      if (keys.length === 0) {
        const freshId = Math.random().toString(36).substring(2, 9);
        updated[freshId] = { id: freshId, title: "New Healthcare Chat", messages: [] };
        setCurrentSessionId(freshId);
      } else if (currentSessionId === id) {
        setCurrentSessionId(keys[keys.length - 1]);
      }
      return updated;
    });
  };

  const toggleCitation = (msgIndex) => {
    setExpandedCitations(prev => ({
      ...prev,
      [msgIndex]: !prev[msgIndex]
    }));
  };

  // --------------------------------------------------
  // Voice Recording (STT via Whisper)
  // --------------------------------------------------
  // --------------------------------------------------
  // Voice Recording (STT via Web Speech API & Groq Whisper)
  // --------------------------------------------------
  const recognitionRef = useRef(null);

  const startRecording = async () => {
    try {
      // 1. Try Browser Web Speech API for instant real-time transcription
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (SpeechRecognition) {
        try {
          const rec = new SpeechRecognition();
          const langMap = {
            "English": "en-IN",
            "Hindi": "hi-IN",
            "Telugu": "te-IN",
            "Tamil": "ta-IN",
            "Marathi": "mr-IN",
            "Bengali": "bn-IN",
            "Gujarati": "gu-IN",
            "Kannada": "kn-IN",
            "Malayalam": "ml-IN",
            "Punjabi": "pa-IN"
          };
          rec.lang = langMap[selectedLanguage] || "en-US";
          rec.continuous = false;
          rec.interimResults = false;

          rec.onresult = (event) => {
            const transcript = event.results[0]?.[0]?.transcript;
            if (transcript && transcript.trim()) {
              console.log("[WebSpeech STT Result]:", transcript);
              setIsRecording(false);
              handleSendMessage(transcript);
            }
          };

          rec.onerror = (e) => {
            console.warn("[WebSpeech STT Warning]:", e.error);
          };

          rec.onend = () => {
            setIsRecording(false);
          };

          recognitionRef.current = rec;
          rec.start();
          setIsRecording(true);
          return;
        } catch (recErr) {
          console.warn("WebSpeech init warning, using MediaRecorder:", recErr);
        }
      }

      // 2. Fallback to MediaRecorder & /api/transcribe
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      let options = {};
      if (window.MediaRecorder) {
        if (MediaRecorder.isTypeSupported('audio/webm;codecs=opus')) {
          options = { mimeType: 'audio/webm;codecs=opus' };
        } else if (MediaRecorder.isTypeSupported('audio/webm')) {
          options = { mimeType: 'audio/webm' };
        } else if (MediaRecorder.isTypeSupported('audio/mp4')) {
          options = { mimeType: 'audio/mp4' };
        }
      }

      mediaRecorderRef.current = new MediaRecorder(stream, options);
      audioChunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorderRef.current.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: options.mimeType || 'audio/webm' });
        await handleAudioUpload(audioBlob);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
    } catch (err) {
      console.error("Error accessing microphone:", err);
      alert("Microphone access is required for voice input. Please check your browser permissions.");
      setIsRecording(false);
    }
  };

  const stopRecording = () => {
    if (recognitionRef.current) {
      try { recognitionRef.current.stop(); } catch (_) {}
      recognitionRef.current = null;
    }
    if (mediaRecorderRef.current && isRecording) {
      try { mediaRecorderRef.current.stop(); } catch (_) {}
    }
    setIsRecording(false);
  };

  const handleAudioUpload = async (audioBlob) => {
    setIsTranscribing(true);
    try {
      const formData = new FormData();
      formData.append("file", audioBlob, "voice_input.webm");
      formData.append("language", selectedLanguage);

      const response = await fetch(`${API_BASE_URL}/transcribe`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) throw new Error("Transcription failed.");

      const data = await response.json();
      if (data.text && data.text.trim()) {
        handleSendMessage(data.text);
      } else {
        alert("Could not detect clear speech. Please try speaking again.");
      }
    } catch (err) {
      console.error("STT Error:", err);
      alert("Voice transcription service unavailable. Please type your query or try again.");
    } finally {
      setIsTranscribing(false);
    }
  };

  // --------------------------------------------------
  // Text-to-Speech (TTS via gTTS + SpeechSynthesis Fallback)
  // --------------------------------------------------
  const handlePlayTTS = async (text, msgIdx) => {
    if (playingAudioIndex === msgIdx) {
      if (currentAudioRef.current) {
        currentAudioRef.current.pause();
        currentAudioRef.current = null;
      }
      if (window.speechSynthesis) window.speechSynthesis.cancel();
      setPlayingAudioIndex(null);
      return;
    }

    if (currentAudioRef.current) {
      currentAudioRef.current.pause();
      currentAudioRef.current = null;
    }
    if (window.speechSynthesis) window.speechSynthesis.cancel();

    setPlayingAudioIndex(msgIdx);

    // Clean text for natural speech output
    const cleanText = text.replace(/[#*`>_~]/g, "").trim();

    try {
      // 1. Try Backend gTTS audio stream
      const response = await fetch(`${API_BASE_URL}/tts`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: cleanText,
          language: selectedLanguage
        })
      });

      if (response.ok) {
        const audioBlob = await response.blob();
        const audioUrl = URL.createObjectURL(audioBlob);
        const audio = new Audio(audioUrl);

        currentAudioRef.current = audio;

        audio.onended = () => {
          setPlayingAudioIndex(null);
          currentAudioRef.current = null;
        };

        audio.onerror = () => {
          fallbackBrowserTTS(cleanText, msgIdx);
        };

        await audio.play();
        return;
      }
    } catch (err) {
      console.warn("Backend TTS stream failed, falling back to Web Speech Synthesis:", err);
    }

    // 2. Fallback to Browser SpeechSynthesis
    fallbackBrowserTTS(cleanText, msgIdx);
  };

  const fallbackBrowserTTS = (cleanText, msgIdx) => {
    if (!window.speechSynthesis) {
      setPlayingAudioIndex(null);
      return;
    }
    const utterance = new SpeechSynthesisUtterance(cleanText);
    const langMap = {
      "English": "en-IN",
      "Hindi": "hi-IN",
      "Telugu": "te-IN",
      "Tamil": "ta-IN",
      "Marathi": "mr-IN",
      "Bengali": "bn-IN",
      "Gujarati": "gu-IN",
      "Kannada": "kn-IN",
      "Malayalam": "ml-IN",
      "Punjabi": "pa-IN"
    };
    utterance.lang = langMap[selectedLanguage] || "en-US";
    utterance.rate = 0.95;
    utterance.onend = () => setPlayingAudioIndex(null);
    utterance.onerror = () => setPlayingAudioIndex(null);
    window.speechSynthesis.speak(utterance);
  };


  // --------------------------------------------------
  // Chat Execution (NDJSON Stream)
  // --------------------------------------------------
  const handleSendMessage = async (customQuery = null) => {
    const queryText = customQuery || inputQuery;
    if (!queryText.trim() || isGenerating) return;

    const targetSessionId = currentSessionId;
    setInputQuery("");
    setIsGenerating(true);

    const currentSess = sessions[targetSessionId] || { title: "New Healthcare Chat", messages: [] };

    if (currentSess.messages.length === 0) {
      const newTitle = queryText.length > 26 ? queryText.substring(0, 26) + "..." : queryText;
      setSessions(prev => ({
        ...prev,
        [targetSessionId]: { ...prev[targetSessionId], title: newTitle }
      }));
    }

    const userMsg = { role: "user", content: queryText };
    const initialAssistantMsg = { role: "assistant", content: "", citations: [] };

    setSessions(prev => ({
      ...prev,
      [targetSessionId]: {
        ...prev[targetSessionId],
        messages: [...(prev[targetSessionId]?.messages || []), userMsg, initialAssistantMsg]
      }
    }));

    // Persist user message to backend conversation (create conversation if needed)
    try {
      const token = localStorage.getItem("authToken");
      let backendId = sessions[targetSessionId]?.backendSessionId;
      const headers = token ? { "Content-Type": "application/json", Authorization: `Bearer ${token}` } : { "Content-Type": "application/json" };

      if (!backendId) {
        // Create conversation with initial user message
        const newTitle = currentSess.messages.length === 0 ? (queryText.length > 26 ? queryText.substring(0, 26) + "..." : queryText) : (currentSess.title || "New Healthcare Chat");
        const createResp = await fetch(`${API_BASE_URL}/v1/conversations`, {
          method: "POST",
          headers,
          body: JSON.stringify({ title: newTitle, messages: [{ role: "user", content: queryText, timestamp: new Date().toISOString() }] })
        });
        if (createResp.ok) {
          const created = await createResp.json();
          backendId = created.id;
          setSessions(prev => ({ ...(prev), [targetSessionId]: { ...(prev[targetSessionId] || {}), backendSessionId: backendId } }));
        }
      } else {
        // Append user message to existing conversation
        try {
          await fetch(`${API_BASE_URL}/v1/conversations/${backendId}/messages`, {
            method: "POST",
            headers,
            body: JSON.stringify({ role: "user", content: queryText, timestamp: new Date().toISOString() })
          });
        } catch (_) {}
      }
    } catch (e) {
      // Non-fatal: continue even if persistence fails
      console.warn("Conversation persistence failed:", e);
    }

    abortControllerRef.current = new AbortController();

    try {
      const historyPayload = (currentSess.messages || []).map(m => ({ role: m.role, content: m.content }));
      
      const response = await fetch(`${API_BASE_URL}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: queryText,
          history: historyPayload,
          language: selectedLanguage,
          session_id: sessions[targetSessionId].backendSessionId || null
        }),
        signal: abortControllerRef.current.signal
      });

      if (!response.ok) {
        let errorMsg = `Server error (${response.status})`;
        try {
          const errData = await response.json();
          if (errData && errData.detail) {
            errorMsg = `Server error: ${errData.detail}`;
          }
        } catch (_) {}
        throw new Error(errorMsg);
      }

      const contentType = response.headers.get("content-type") || "";

      if (contentType.includes("application/json")) {
        const data = await response.json();
        setSessions(prev => {
          const sess = prev[targetSessionId];
          if (!sess) return prev;
          const msgs = [...sess.messages];
          msgs[msgs.length - 1] = {
            ...msgs[msgs.length - 1],
            content: data.response,
            citations: data.citations || []
          };

          return {
            ...prev,
            [targetSessionId]: {
              ...sess,
              backendSessionId: data.session_id || sess.backendSessionId,
              messages: msgs
            }
          };
        });
        return;
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder("utf-8");
      let buffer = "";

      const processLine = (line) => {
        if (!line.trim()) return;
        try {
          const data = JSON.parse(line);
          if (data.type === "session") {
            setSessions(prev => ({
              ...prev,
              [targetSessionId]: {
                ...prev[targetSessionId],
                backendSessionId: data.session_id
              }
            }));
            return;
          }

          if (data.type === "citations") {
            setSessions(prev => {
              const sess = prev[targetSessionId];
              if (!sess) return prev;
              const msgs = [...sess.messages];
              const lastIdx = msgs.length - 1;
              if (lastIdx >= 0) {
                msgs[lastIdx] = { ...msgs[lastIdx], citations: data.citations };
              }
              return { ...prev, [targetSessionId]: { ...sess, messages: msgs } };
            });
          } else if (data.type === "token") {
            setSessions(prev => {
              const sess = prev[targetSessionId];
              if (!sess) return prev;
              const msgs = [...sess.messages];
              const lastIdx = msgs.length - 1;
              if (lastIdx >= 0) {
                msgs[lastIdx] = {
                  ...msgs[lastIdx],
                  content: (msgs[lastIdx].content || "") + data.content
                };
              }
              return { ...prev, [targetSessionId]: { ...sess, messages: msgs } };
            });
          }
        } catch (e) {
          console.error("NDJSON parse error:", e);
        }
      };

      while (true) {
        const { done, value } = await reader.read();
        if (done) {
          if (buffer.trim()) processLine(buffer);
          break;
        }

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop();

        for (const line of lines) {
          processLine(line);
        }
      }
      // Stream finished — append final assistant message to backend conversation
      try {
        const token = localStorage.getItem("authToken");
        const backendId = sessions[targetSessionId]?.backendSessionId;
        if (backendId) {
          const sess = (sessions[targetSessionId] || {});
          const msgs = sess.messages || [];
          const lastIdx = msgs.length - 1;
          const assistantContent = lastIdx >= 0 ? (msgs[lastIdx].content || "") : "";
          if (assistantContent && assistantContent.trim()) {
            const headers = token ? { "Content-Type": "application/json", Authorization: `Bearer ${token}` } : { "Content-Type": "application/json" };
            await fetch(`${API_BASE_URL}/v1/conversations/${backendId}/messages`, {
              method: "POST",
              headers,
              body: JSON.stringify({ role: "assistant", content: assistantContent, timestamp: new Date().toISOString() })
            });
          }
        }
      } catch (e) {
        console.warn("Failed to persist assistant message:", e);
      }
    } catch (err) {
      if (err.name !== 'AbortError') {
        const displayError = err.message && !err.message.includes("Failed to fetch")
          ? `⚠️ ${err.message}`
          : "⚠️ Cannot connect to the AI Assistant service. Please make sure the application is fully started.";

        setSessions(prev => {
          const sess = prev[targetSessionId];
          if (!sess) return prev;
          const msgs = [...sess.messages];
          const lastIdx = msgs.length - 1;
          if (lastIdx >= 0) {
            msgs[lastIdx] = {
              ...msgs[lastIdx],
              content: displayError
            };
          }
          return { ...prev, [targetSessionId]: { ...sess, messages: msgs } };
        });
      }
    } finally {
      setIsGenerating(false);
      abortControllerRef.current = null;
    }
  };

  const handleStopGeneration = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      setIsGenerating(false);
    }
  };

  const filteredSessions = Object.values(sessions).filter(s => 
    s.title.toLowerCase().includes(searchQuery.toLowerCase())
  ).reverse();

  return (
    <div className="assistant-container">
      {/* Sidebar */}
      <aside className="assistant-sidebar">
        <div className="assistant-sidebar-header">
          <div className="assistant-brand-title">RuralCare AI</div>
          <div className="assistant-brand-subtitle">Multilingual Health Assistant</div>
        </div>

        <button className="assistant-new-chat-btn" onClick={handleNewChat}>
          <Plus size={16} /> New Chat
        </button>

        <div className="assistant-search-box">
          <Search size={14} className="assistant-search-icon" />
          <input 
            type="text" 
            placeholder="Search conversations..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="assistant-history-label">CONVERSATION HISTORY</div>

        <div className="assistant-history-list">
          {filteredSessions.map((s) => (
            <div 
              key={s.id} 
              className={`assistant-history-item ${s.id === currentSessionId ? 'active' : ''}`}
              onClick={() => setCurrentSessionId(s.id)}
            >
              <MessageSquare size={14} />
              <span className="assistant-item-title">{s.title}</span>
              <button className="assistant-delete-btn" onClick={(e) => handleDeleteSession(s.id, e)}>
                <Trash2 size={13} />
              </button>
            </div>
          ))}
        </div>

        <div className="assistant-sidebar-footer">
          {systemStatus.online ? (
            <div className="assistant-status-indicator online">
              <Database size={13} /> AI System Online
            </div>
          ) : (
            <div className="assistant-status-indicator offline">
              <ShieldAlert size={13} /> Service Unavailable
            </div>
          )}
        </div>
      </aside>

      {/* Main Chat Area */}
      <main className="assistant-main-content">
        <header className="assistant-top-header">
          <div className="assistant-header-title">
            <h2>Healthcare AI Assistant</h2>
            <span>Ask health questions in your language</span>
          </div>

          <div className="assistant-header-actions">
            <div className="assistant-language-selector">
              <Globe size={15} className="assistant-lang-icon" />
              <select
                className="assistant-language-select"
                value={selectedLanguage}
                onChange={(e) => setSelectedLanguage(e.target.value)}
              >
                {LANGUAGES.map(lang => (
                  <option key={lang.code} value={lang.name}>
                    {lang.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </header>

        <div className="assistant-chat-viewport">
          {activeSession.messages.length === 0 ? (
            <div className="assistant-empty-state my-auto flex flex-col items-center justify-center space-y-6">
              {/* Quick Language Chips */}
              <div className="flex flex-wrap items-center justify-center gap-2 max-w-md">
                {[
                  { name: "Telugu", label: "తెలుగు" },
                  { name: "Hindi", label: "हिन्दी" },
                  { name: "Marathi", label: "मराठी" },
                  { name: "Tamil", label: "தமிழ்" },
                  { name: "Bengali", label: "বাংলা" },
                  { name: "Kannada", label: "ಕನ್ನಡ" },
                ].map((lang) => (
                  <button
                    key={lang.name}
                    type="button"
                    onClick={() => setSelectedLanguage(lang.name)}
                    className={`px-3 py-1.5 rounded-full text-xs font-extrabold transition-all border ${
                      selectedLanguage === lang.name
                        ? "bg-teal-600 text-white border-emerald-400 shadow-md shadow-teal-600/40"
                        : "bg-white/10 text-teal-200 border-white/15 hover:bg-white/20"
                    }`}
                  >
                    {lang.label} ({lang.name})
                  </button>
                ))}
              </div>

              {/* Large Central Microphone Pulse Ring */}
              <button
                type="button"
                onClick={isRecording ? stopRecording : startRecording}
                className={`relative w-28 h-28 rounded-full flex items-center justify-center transition-all duration-300 shadow-2xl border-2 ${
                  isRecording
                    ? "bg-rose-600 border-rose-400 text-white animate-pulse"
                    : "bg-gradient-to-br from-teal-500 via-emerald-600 to-lime-500 border-white text-white hover:scale-105"
                }`}
              >
                <span className="absolute -inset-3 rounded-full bg-teal-400/30 blur-lg animate-pulse-soft pointer-events-none" />
                <Mic size={42} className={isRecording ? "animate-bounce" : ""} />
              </button>

              <div className="text-center space-y-1">
                <h3 className="font-display font-extrabold text-xl text-white">
                  {isRecording ? "Listening to your voice..." : "Tap to Speak"}
                </h3>
                <p className="text-xs text-slate-300 font-medium max-w-sm">
                  Speak naturally in {selectedLanguage} about your symptoms, prescriptions, or health questions.
                </p>
              </div>

              {/* Quick sample prompt chips */}
              <div className="flex flex-wrap justify-center gap-2 max-w-lg pt-2">
                {[
                  "ఈ మందులు ఎలా వాడాలి?",
                  "फ्री डिस्पेन्सरी कहां है?",
                  "Side effects of Paracetamol?",
                  "ज्वर कमी करण्याचे उपाय"
                ].map((sample, sIdx) => (
                  <button
                    key={sIdx}
                    onClick={() => handleSendMessage(sample)}
                    className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-[11px] font-semibold text-teal-200 transition-all"
                  >
                    "{sample}"
                  </button>
                ))}
              </div>
            </div>
          ) : (


            activeSession.messages.map((msg, idx) => (
              <div key={idx} className={`assistant-message-row ${msg.role}`}>
                <div className="assistant-message-bubble">
                  {msg.role === "assistant" && (
                    <div className="assistant-meta flex items-center justify-between gap-2 mb-2 pb-1.5 border-b border-white/10">
                      <div className="flex items-center gap-1.5">
                        <span className="px-2 py-0.5 rounded-full bg-teal-500/20 text-teal-300 border border-teal-400/30 text-[10px] font-extrabold flex items-center gap-1">
                          <Info size={11} /> ⓘ AI Explanation
                        </span>
                        {msg.content?.includes("uncertain") && (
                          <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-400/30 text-[10px] font-extrabold flex items-center gap-1">
                            <AlertCircle size={11} /> ⚠️ Doctor Confirmation Advised
                          </span>
                        )}
                      </div>
                      {msg.content && !msg.content.startsWith("⚠️") && (
                        <button
                          className={`assistant-tts-btn px-2.5 py-1 rounded-xl text-xs font-bold bg-teal-500/20 text-teal-200 border border-teal-400/30 hover:bg-teal-500/30 transition-all flex items-center gap-1 ${playingAudioIndex === idx ? 'playing' : ''}`}
                          onClick={() => handlePlayTTS(msg.content, idx)}
                          title={`Listen in ${selectedLanguage}`}
                        >
                          {playingAudioIndex === idx ? <VolumeX size={13} /> : <Volume2 size={13} />}
                          {playingAudioIndex === idx ? "Stop" : `Listen in ${selectedLanguage}`}
                        </button>
                      )}
                    </div>
                  )}

                  {msg.role === "assistant" ? (
                    <div className="assistant-message-text">
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>
                        {msg.content || "..."}
                      </ReactMarkdown>
                    </div>
                  ) : (
                    <div>{msg.content}</div>
                  )}

                  {/* Citations Drawer */}
                  {msg.citations && msg.citations.length > 0 && (
                    <div className="assistant-citations-accordion">
                      <button 
                        className="assistant-citations-toggle"
                        onClick={() => toggleCitation(idx)}
                      >
                        <BookOpen size={13} />
                        {msg.citations.length} Clinical Reference Sources
                        {expandedCitations[idx] ? <ChevronDown size={13} /> : <ChevronRight size={13} />}
                      </button>

                      {expandedCitations[idx] && (
                        <div className="assistant-citations-list">
                          {msg.citations.map((cit, cIdx) => (
                            <div key={cIdx} className="assistant-citation-card">
                              <div className="assistant-citation-title">📄 {cit.source || "Clinical Guidance"} (Match score: {(cit.score * 100).toFixed(1)}%)</div>
                              <div className="assistant-citation-snippet">{(cit.text || cit.snippet || "").substring(0, 300)}...</div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <div className="assistant-bottom-deck">
          <div className="assistant-input-wrapper">
            <button 
              className={`assistant-mic-btn ${isRecording ? 'recording' : ''}`}
              onClick={isRecording ? stopRecording : startRecording}
              disabled={isTranscribing || isGenerating}
              title={isRecording ? "Stop Recording" : "Speak Query"}
            >
              {isTranscribing ? (
                <Loader2 size={18} className="spin-icon" />
              ) : isRecording ? (
                <MicOff size={18} />
              ) : (
                <Mic size={18} />
              )}
            </button>

            <input 
              type="text" 
              className="assistant-chat-input" 
              placeholder={isTranscribing ? "Transcribing voice audio..." : `Ask healthcare question in ${selectedLanguage}...`}
              value={inputQuery}
              onChange={(e) => setInputQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
              disabled={isGenerating || isTranscribing}
            />

            {isGenerating ? (
              <button className="assistant-action-btn stop" onClick={handleStopGeneration}>
                <Square size={14} /> Stop
              </button>
            ) : (
              <button 
                className="assistant-action-btn send" 
                onClick={() => handleSendMessage()}
                disabled={!inputQuery.trim() || isTranscribing}
              >
                <Send size={14} /> Ask AI
              </button>
            )}
          </div>

          <p className="text-[11px] text-center text-slate-400 font-medium pt-2 pb-1">
            RuralCare AI provides informational assistance and does not replace professional medical advice.
          </p>
        </div>
      </main>
    </div>
  );
}
