'use client';

import { useState, useRef, useEffect } from 'react';
import { Mic, Send, Settings, Volume2, VolumeX, Image as ImageIcon, Check } from 'lucide-react';

const GOLD = "#D4AF37";
const MUTED = "#888";
const PAPER = "#f5f1e6";

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export function AACLiveCompanion() {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: 'Initialization complete. I am online and ready to assist your workflow.' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  // Voice & Avatar State
  const [isRecording, setIsRecording] = useState(false);
  const [voiceMode, setVoiceMode] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [avatar, setAvatar] = useState('/avatars/holo.png');
  const [showSettings, setShowSettings] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isSpeaking]);

  // Speech Recognition Setup
  const handleMicrophoneClick = () => {
    if (isRecording) {
      setIsRecording(false);
      return;
    }
    
    // @ts-ignore
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Voice input is not supported in this browser. Try Chrome or Safari.");
      return;
    }
    
    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = true;
    
    recognition.onstart = () => setIsRecording(true);
    recognition.onresult = (event: any) => {
      const transcript = Array.from(event.results)
        .map((result: any) => result[0].transcript)
        .join('');
      setInput(transcript);
    };
    recognition.onerror = () => setIsRecording(false);
    recognition.onend = () => setIsRecording(false);
    
    recognition.start();
  };

  // Speech Synthesis Setup
  const speakResponse = (text: string) => {
    if (!('speechSynthesis' in window) || !voiceMode) return;
    
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    
    // Try to find a premium/professional voice
    const voices = window.speechSynthesis.getVoices();
    const premiumVoice = voices.find(v => v.name.includes('Samantha') || v.name.includes('Daniel') || v.lang === 'en-GB') || voices[0];
    if (premiumVoice) utterance.voice = premiumVoice;
    
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    
    window.speechSynthesis.speak(utterance);
  };

  const handleSend = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!input.trim() || isLoading) return;
    
    const userMsg = input;
    setInput('');
    const newMessages = [...messages, { role: 'user', content: userMsg } as Message];
    setMessages(newMessages);
    setIsLoading(true);
    setIsSpeaking(true); // Trigger visual animation instantly for loading feel
    
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: newMessages })
      });
      
      const data = await res.json();
      if (data.content) {
        setMessages([...newMessages, { role: 'assistant', content: data.content }]);
        if (voiceMode) {
          speakResponse(data.content);
        } else {
          setIsSpeaking(false);
        }
      }
    } catch (e) {
      console.error(e);
      setIsSpeaking(false);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={containerStyle}>
      {/* Header / Avatar Display */}
      <div style={headerStyle}>
        <div style={avatarWrapperStyle}>
          <div style={{...avatarGlowStyle, opacity: isSpeaking ? 1 : 0}} className="avatar-pulse" />
          <img src={avatar} alt="AAC Avatar" style={avatarImgStyle} />
        </div>
        
        <div style={headerInfoStyle}>
          <h2 style={{ margin: 0, fontSize: 18, fontWeight: 600, color: GOLD }}>AAC Core</h2>
          <span style={{ fontSize: 12, color: MUTED, display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#10b981' }} />
            Encrypted & Isolated
          </span>
        </div>
        
        <button onClick={() => setShowSettings(!showSettings)} style={iconBtnStyle}>
          <Settings size={20} color={PAPER} />
        </button>
      </div>

      {/* Settings Modal (Overlay) */}
      {showSettings && (
        <div style={settingsModalStyle}>
          <h3 style={{ margin: '0 0 16px', fontSize: 16 }}>Companion Preferences</h3>
          
          <div style={{ marginBottom: 24 }}>
            <label style={{ display: 'block', fontSize: 12, color: MUTED, marginBottom: 8, textTransform: 'uppercase' }}>Voice Mode</label>
            <button 
              onClick={() => { setVoiceMode(!voiceMode); window.speechSynthesis.cancel(); setIsSpeaking(false); }}
              style={{...toggleBtnStyle, borderColor: voiceMode ? GOLD : '#333'}}
            >
              {voiceMode ? <Volume2 size={16} color={GOLD} /> : <VolumeX size={16} color={MUTED} />}
              {voiceMode ? 'Voice Output Active' : 'Voice Output Muted'}
            </button>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: 12, color: MUTED, marginBottom: 8, textTransform: 'uppercase' }}>Visual Representation</label>
            <div style={{ display: 'flex', gap: 12 }}>
              <button onClick={() => setAvatar('/avatars/holo.png')} style={{...avatarSelectBtnStyle, borderColor: avatar.includes('holo') ? GOLD : '#333'}}>
                <img src="/avatars/holo.png" style={avatarThumbStyle} />
                <span style={{ fontSize: 12 }}>Holographic</span>
                {avatar.includes('holo') && <Check size={14} color={GOLD} style={{marginLeft: 'auto'}}/>}
              </button>
              <button onClick={() => setAvatar('/avatars/cyber.png')} style={{...avatarSelectBtnStyle, borderColor: avatar.includes('cyber') ? GOLD : '#333'}}>
                <img src="/avatars/cyber.png" style={avatarThumbStyle} />
                <span style={{ fontSize: 12 }}>Cybernetic</span>
                {avatar.includes('cyber') && <Check size={14} color={GOLD} style={{marginLeft: 'auto'}}/>}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Chat Messages */}
      <div style={chatAreaStyle}>
        {messages.map((msg, idx) => (
          <div key={idx} style={{...messageRowStyle, justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start'}}>
            {msg.role === 'assistant' && (
              <img src={avatar} style={{ width: 28, height: 28, borderRadius: 14, objectFit: 'cover' }} />
            )}
            <div style={{
              ...bubbleStyle,
              background: msg.role === 'user' ? 'rgba(212, 175, 55, 0.1)' : 'rgba(255, 255, 255, 0.05)',
              border: msg.role === 'user' ? `1px solid rgba(212, 175, 55, 0.3)` : '1px solid rgba(255,255,255,0.1)',
              color: PAPER
            }}>
              {msg.content}
            </div>
          </div>
        ))}
        {isLoading && (
          <div style={{...messageRowStyle, justifyContent: 'flex-start'}}>
            <img src={avatar} style={{ width: 28, height: 28, borderRadius: 14, objectFit: 'cover' }} />
            <div style={{...bubbleStyle, background: 'transparent'}}>
              <span className="typing-dot" style={{ animationDelay: '0s' }}>.</span>
              <span className="typing-dot" style={{ animationDelay: '0.2s' }}>.</span>
              <span className="typing-dot" style={{ animationDelay: '0.4s' }}>.</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Waveform Visualization (Shows when AI speaks or User records) */}
      {(isSpeaking || isRecording) && (
        <div style={waveformContainerStyle}>
          <div className="wave-bar" style={{ animationDuration: '0.8s' }} />
          <div className="wave-bar" style={{ animationDuration: '0.5s' }} />
          <div className="wave-bar" style={{ animationDuration: '1.2s' }} />
          <div className="wave-bar" style={{ animationDuration: '0.6s' }} />
          <div className="wave-bar" style={{ animationDuration: '0.9s' }} />
          <span style={{ marginLeft: 12, fontSize: 12, color: isRecording ? '#ef4444' : GOLD, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            {isRecording ? 'Listening...' : 'Transmitting...'}
          </span>
        </div>
      )}

      {/* Input Area */}
      <form onSubmit={handleSend} style={inputContainerStyle}>
        <button 
          type="button" 
          onClick={handleMicrophoneClick}
          style={{...micBtnStyle, color: isRecording ? '#ef4444' : MUTED}}
        >
          <Mic size={20} />
          {isRecording && <span className="mic-pulse" style={micPulseIndicatorStyle} />}
        </button>
        
        <input 
          type="text" 
          placeholder="Transmit query or command..."
          value={input}
          onChange={e => setInput(e.target.value)}
          style={inputStyle}
          disabled={isRecording}
        />
        
        <button type="submit" disabled={!input.trim() || isLoading} style={sendBtnStyle}>
          <Send size={18} />
        </button>
      </form>

      {/* Injecting CSS Keyframes for Animations */}
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes pulse-glow {
          0% { box-shadow: 0 0 20px rgba(212, 175, 55, 0.2); }
          50% { box-shadow: 0 0 40px rgba(212, 175, 55, 0.6); }
          100% { box-shadow: 0 0 20px rgba(212, 175, 55, 0.2); }
        }
        .avatar-pulse { animation: pulse-glow 2s infinite ease-in-out; }
        
        @keyframes blink {
          0% { opacity: 0.2; }
          20% { opacity: 1; }
          100% { opacity: 0.2; }
        }
        .typing-dot { display: inline-block; font-size: 24px; animation: blink 1.4s infinite both; }
        
        @keyframes wave {
          0% { height: 4px; }
          50% { height: 24px; }
          100% { height: 4px; }
        }
        .wave-bar {
          width: 3px;
          background-color: ${GOLD};
          border-radius: 3px;
          animation: wave infinite ease-in-out;
        }
        
        @keyframes mic-record {
          0% { transform: scale(1); opacity: 0.8; }
          100% { transform: scale(2.5); opacity: 0; }
        }
        .mic-pulse {
          animation: mic-record 1.5s infinite ease-out;
        }
      `}} />
    </div>
  );
}

// STYLES
const containerStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  width: '100%',
  height: '700px', // Fixed height for the demo dashboard
  backgroundColor: 'rgba(10, 10, 10, 0.8)',
  backdropFilter: 'blur(16px)',
  border: '1px solid rgba(255, 255, 255, 0.1)',
  borderRadius: 24,
  overflow: 'hidden',
  position: 'relative'
};

const headerStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  padding: '20px 24px',
  borderBottom: '1px solid rgba(255,255,255,0.05)',
  backgroundColor: 'rgba(5, 5, 5, 0.6)'
};

const avatarWrapperStyle: React.CSSProperties = {
  position: 'relative',
  width: 48,
  height: 48,
  marginRight: 16
};

const avatarImgStyle: React.CSSProperties = {
  width: '100%',
  height: '100%',
  borderRadius: '50%',
  objectFit: 'cover',
  position: 'relative',
  zIndex: 2,
  border: '2px solid rgba(255,255,255,0.1)'
};

const avatarGlowStyle: React.CSSProperties = {
  position: 'absolute',
  inset: -4,
  borderRadius: '50%',
  backgroundColor: 'transparent',
  zIndex: 1,
  transition: 'opacity 0.3s'
};

const headerInfoStyle: React.CSSProperties = {
  flex: 1
};

const iconBtnStyle: React.CSSProperties = {
  background: 'transparent',
  border: 'none',
  cursor: 'pointer',
  padding: 8,
  borderRadius: '50%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  transition: 'background 0.2s'
};

const settingsModalStyle: React.CSSProperties = {
  position: 'absolute',
  top: 88,
  right: 24,
  width: 320,
  backgroundColor: '#111',
  border: '1px solid #333',
  borderRadius: 12,
  padding: 24,
  zIndex: 10,
  boxShadow: '0 24px 48px rgba(0,0,0,0.5)'
};

const toggleBtnStyle: React.CSSProperties = {
  width: '100%',
  display: 'flex',
  alignItems: 'center',
  gap: 12,
  padding: 16,
  backgroundColor: '#0a0a0a',
  border: '1px solid #333',
  borderRadius: 8,
  color: PAPER,
  cursor: 'pointer',
  fontSize: 14,
  fontWeight: 500,
  transition: 'all 0.2s'
};

const avatarSelectBtnStyle: React.CSSProperties = {
  flex: 1,
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: 8,
  padding: 12,
  backgroundColor: '#0a0a0a',
  border: '1px solid #333',
  borderRadius: 8,
  color: PAPER,
  cursor: 'pointer',
  transition: 'all 0.2s'
};

const avatarThumbStyle: React.CSSProperties = {
  width: 40,
  height: 40,
  borderRadius: 20,
  objectFit: 'cover'
};

const chatAreaStyle: React.CSSProperties = {
  flex: 1,
  overflowY: 'auto',
  padding: 24,
  display: 'flex',
  flexDirection: 'column',
  gap: 20
};

const messageRowStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'flex-end',
  gap: 12,
  width: '100%'
};

const bubbleStyle: React.CSSProperties = {
  padding: '14px 18px',
  borderRadius: 16,
  maxWidth: '75%',
  fontSize: 15,
  lineHeight: 1.6,
  boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
};

const waveformContainerStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  height: 40,
  padding: '0 24px',
  gap: 4,
  backgroundColor: 'rgba(212, 175, 55, 0.05)',
  borderTop: '1px solid rgba(212, 175, 55, 0.1)'
};

const inputContainerStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  padding: '16px 24px',
  backgroundColor: 'rgba(5, 5, 5, 0.8)',
  borderTop: '1px solid rgba(255,255,255,0.05)',
  gap: 16
};

const micBtnStyle: React.CSSProperties = {
  background: 'transparent',
  border: 'none',
  cursor: 'pointer',
  padding: 8,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  position: 'relative'
};

const micPulseIndicatorStyle: React.CSSProperties = {
  position: 'absolute',
  width: 20,
  height: 20,
  borderRadius: '50%',
  backgroundColor: '#ef4444',
  zIndex: -1
};

const inputStyle: React.CSSProperties = {
  flex: 1,
  backgroundColor: 'transparent',
  border: 'none',
  color: PAPER,
  fontSize: 15,
  outline: 'none',
  fontFamily: 'inherit'
};

const sendBtnStyle: React.CSSProperties = {
  backgroundColor: GOLD,
  color: '#000',
  border: 'none',
  width: 36,
  height: 36,
  borderRadius: 18,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  cursor: 'pointer',
  transition: 'opacity 0.2s'
};
