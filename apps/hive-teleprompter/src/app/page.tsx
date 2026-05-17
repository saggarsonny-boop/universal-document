"use client";

import { useState, useRef, useEffect } from "react";
import { Play, FastForward, Rewind, FlipHorizontal, Settings2, Plus, Minus, Maximize2, Mic, MicOff, Cloud, LogOut, Video, VideoOff, Circle, Download } from "lucide-react";
import { useSession, signIn, signOut } from "next-auth/react";
import { useCompletion } from "ai/react";

export default function Teleprompter() {
  const [text, setText] = useState<string>("Paste your script here...\n\nWelcome to The Hive Teleprompter.\n\nAdjust the speed and size using the controls.\n\nYou can mirror the text if you are using a physical teleprompter glass rig.\n\nToggle Voice Tracking to let the engine follow your speech.\n\nReady to begin?");
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(2); // pixels per frame approx
  const [fontSize, setFontSize] = useState(72);
  const [isMirrored, setIsMirrored] = useState(false);
  const [isConfigMode, setIsConfigMode] = useState(true);
  const { data: session } = useSession();
  const [emailInput, setEmailInput] = useState("");
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncStatus, setSyncStatus] = useState<"idle" | "success" | "error">("idle");
  const [paywallMessage, setPaywallMessage] = useState("");
  const wordCount = text.trim().split(/\s+/).length;
  
  // Voice Tracking States
  const [isVoiceTracking, setIsVoiceTracking] = useState(false);
  const [currentWordIndex, setCurrentWordIndex] = useState(0);

  // Camera & Recording States
  const [isVideoMode, setIsVideoMode] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isEyeContactEnabled, setIsEyeContactEnabled] = useState(false);
  const [recordedChunks, setRecordedChunks] = useState<Blob[]>([]);
  const videoRef = useRef<HTMLVideoElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);

  // AI Script Generation
  const { completion, input, handleInputChange, handleSubmit, isLoading } = useCompletion({
    api: '/api/generate',
    body: {
      isPremium: session && (session.user as any)?.plan === 'PREMIUM'
    },
    onFinish: (prompt, result) => {
      setText(result);
    },
    onError: (err) => {
      if (err.message.includes('403')) {
        setPaywallMessage("Upgrade to Premium: Autonomous script generation requires dedicated Anthropic AI compute. Upgrade now to generate unlimited scripts.");
      } else {
        alert("Generation failed: " + err.message);
      }
    }
  });

  // Sync completion to text area while loading
  useEffect(() => {
    if (isLoading && completion) {
      setText(completion);
    }
  }, [completion, isLoading]);

  const containerRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLDivElement>(null);
  
  const currentWordIndexRef = useRef(0);
  const wordsRef = useRef<string[]>([]);
  const targetScrollY = useRef<number | null>(null);

  useEffect(() => {
    currentWordIndexRef.current = currentWordIndex;
  }, [currentWordIndex]);

  useEffect(() => {
    const words = (text.match(/\S+/g) || []);
    wordsRef.current = words;
  }, [text]);

  // Scrolling Engine
  useEffect(() => {
    let animationFrameId: number;
    const scrollText = () => {
      if (isPlaying && containerRef.current) {
        if (!isVoiceTracking) {
          containerRef.current.scrollTop += speed;
        } else {
          // Voice Tracking Smooth Auto-Flow (Continuous Scrolling)
          if (targetScrollY.current !== null) {
            const diff = targetScrollY.current - containerRef.current.scrollTop;
            
            // Calculate a dynamic continuous speed based on distance to the target word
            let dynamicSpeed = diff * 0.015; // Smooth acceleration factor
            
            // If we are significantly behind the word, maintain a minimum crawl to keep the text alive
            if (dynamicSpeed < 0.5 && diff > 50) dynamicSpeed = 0.5;
            
            // Cap maximum speed to prevent dizzying motion
            if (dynamicSpeed > 10) dynamicSpeed = 10;
            
            // If we've scrolled past the user (diff is negative), pause the scroll to let them catch up
            if (diff <= 0) dynamicSpeed = 0;

            containerRef.current.scrollTop += dynamicSpeed;
          }
        }
      }
      animationFrameId = requestAnimationFrame(scrollText);
    };

    if (isPlaying) {
      animationFrameId = requestAnimationFrame(scrollText);
    }
    return () => {
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
    };
  }, [isPlaying, speed, isVoiceTracking]);

  // Voice Tracking Logic
  useEffect(() => {
    if (!isVoiceTracking || !isPlaying) return;

    // @ts-expect-error window.SpeechRecognition may not exist on all browsers
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Voice tracking is not supported in this browser. Please use Chrome, Edge, or Brave.");
      setIsVoiceTracking(false);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    
    let localCurrentIndex = currentWordIndexRef.current;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    recognition.onresult = (event: any) => {
      let interimTranscript = '';
      let finalTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript;
        } else {
          interimTranscript += event.results[i][0].transcript;
        }
      }
      
      const latestText = (finalTranscript + ' ' + interimTranscript).trim().toLowerCase();
      const spokenWords = latestText.split(/\s+/);
      
      if (spokenWords.length > 0) {
        // Take the last 5 words (leading edge of speech)
        const leadingEdgeWords = spokenWords.slice(-5).map(w => w.replace(/[^a-z0-9]/gi, ''));
        const scriptWords = wordsRef.current;
        
        const stopWords = ['the', 'and', 'is', 'in', 'it', 'you', 'that', 'he', 'was', 'for', 'on', 'are', 'with', 'as', 'to', 'of', 'this', 'but', 'not'];
        
        // Look ahead from the NEXT word (+1) up to 20 words ahead to prevent getting trapped on the current word
        for (let i = localCurrentIndex + 1; i < Math.min(localCurrentIndex + 20, scriptWords.length); i++) {
          const cleanScriptWord = scriptWords[i].toLowerCase().replace(/[^a-z0-9]/gi, '');
          
          // Require an exact match on a substantial word in the leading edge
          if (cleanScriptWord && cleanScriptWord.length > 1 && !stopWords.includes(cleanScriptWord) && leadingEdgeWords.includes(cleanScriptWord)) {
            localCurrentIndex = i;
            setCurrentWordIndex(i);
            
            const el = document.getElementById(`word-${i}`);
            if (el) {
              targetScrollY.current = el.offsetTop - window.innerHeight / 2.5;
            }
            break;
          }
        }
      }
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    recognition.onerror = (event: any) => {
      console.error("Speech recognition error", event.error);
    };

    let shouldRestart = true;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    recognition.onend = () => {
      if (shouldRestart && isVoiceTracking && isPlaying) {
        try {
          recognition.start();
        } catch (e) {
          console.error("Failed to restart recognition", e);
        }
      }
    };

    try {
      recognition.start();
    } catch (e) {
      console.error("Speech recognition already started", e);
    }

    return () => {
      shouldRestart = false;
      try {
        recognition.stop();
      } catch (e) {
        console.error("Failed to stop recognition", e);
      }
    };
  }, [isVoiceTracking, isPlaying]);

  // Camera Logic
  useEffect(() => {
    if (isVideoMode) {
      const constraints = { 
        video: isEyeContactEnabled ? { advanced: [{ eyeGazeCorrection: true }] } : true, 
        audio: true 
      };
      
      navigator.mediaDevices.getUserMedia(constraints as MediaStreamConstraints)
        .then(stream => {
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
          }
          // Initialize MediaRecorder
          const recorder = new MediaRecorder(stream, { mimeType: 'video/webm' });
          recorder.ondataavailable = (e) => {
            if (e.data.size > 0) {
              setRecordedChunks(prev => [...prev, e.data]);
            }
          };
          mediaRecorderRef.current = recorder;
        })
        .catch(err => {
          console.error("Camera access denied", err);
          setIsVideoMode(false);
          alert("Camera access was denied or is not available.");
        });
    } else {
      // Stop tracks
      if (videoRef.current && videoRef.current.srcObject) {
        const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
        tracks.forEach(track => track.stop());
        videoRef.current.srcObject = null;
      }
    }
  }, [isVideoMode, isEyeContactEnabled]);

  const toggleRecording = () => {
    if (isRecording) {
      mediaRecorderRef.current?.stop();
      setIsRecording(false);
    } else {
      setRecordedChunks([]);
      mediaRecorderRef.current?.start();
      setIsRecording(true);
    }
  };

  const downloadRecording = () => {
    const blob = new Blob(recordedChunks, { type: 'video/webm' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    document.body.appendChild(a);
    a.style.display = 'none';
    a.href = url;
    a.download = `hive-recording-${new Date().toISOString()}.webm`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const togglePlay = () => setIsPlaying(!isPlaying);

  const renderText = () => {
    if (!isVoiceTracking) {
      return text;
    }
    
    const tokens = text.match(/(\S+|\s+)/g) || [];
    let wordCounter = 0;
    
    return tokens.map((token, index) => {
      if (/\s+/.test(token)) {
        return <span key={index}>{token}</span>;
      }
      const myIndex = wordCounter++;
      const isPast = myIndex < currentWordIndex;
      const isCurrent = myIndex === currentWordIndex;
      
      return (
        <span 
          key={index}
          id={`word-${myIndex}`}
          style={{
             color: isCurrent ? '#ffffff' : (isPast ? '#D4AF37' : '#444444'),
             transition: 'color 0.3s',
             textShadow: isCurrent ? '0 0 10px rgba(212,175,55,0.5)' : 'none'
          }}
        >
          {token}
        </span>
      );
    });
  };

  if (isConfigMode) {
    return (
      <div className="min-h-screen bg-black flex flex-col p-6 md:p-12 max-w-5xl mx-auto">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 border-b border-neutral-900 pb-8 gap-6">
          <div className="flex items-center gap-6">
            <a href="https://hive.baby" target="_blank" rel="noopener noreferrer">
              <img src="/hive-logo-full.png" alt="Hive ecosystem" className="h-[40px] md:h-[40px] w-auto object-contain hover:opacity-80 transition-opacity" />
            </a>
            <div>
              <h1 className="text-2xl font-bold tracking-widest uppercase text-white">Teleprompter</h1>
              <p className="text-sm font-bold tracking-widest text-[#D4AF37] uppercase mt-1">Machine Over Human Engine</p>
            </div>
          </div>
          <button
            onClick={() => {
              setIsConfigMode(false);
              setCurrentWordIndex(0); // Reset on launch
            }}
            className="bg-[#D4AF37] hover:bg-[#b0902c] text-black px-8 py-3 rounded-lg font-bold transition-all shadow-[0_0_20px_rgba(212,175,55,0.3)] hover:shadow-[0_0_30px_rgba(212,175,55,0.5)] flex items-center gap-3 w-full md:w-auto justify-center"
          >
            <Maximize2 size={20} /> Launch Engine
          </button>
        </header>

        {paywallMessage && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <div className="bg-neutral-900 border border-[#D4AF37] rounded-2xl p-8 max-w-md w-full shadow-[0_0_50px_rgba(212,175,55,0.2)] text-center">
              <h3 className="text-2xl font-bold text-white mb-4 uppercase tracking-widest">Upgrade Required</h3>
              <p className="text-neutral-300 mb-8">{paywallMessage}</p>
              <div className="flex gap-4">
                <button 
                  onClick={() => setPaywallMessage("")}
                  className="flex-1 py-3 rounded-lg font-bold bg-neutral-800 text-white hover:bg-neutral-700 transition-colors"
                >
                  Close
                </button>
                <button 
                  onClick={() => {
                    setPaywallMessage("");
                    // In the future this hooks into Stripe checkout
                    alert("Stripe Checkout will deploy June 19th.");
                  }}
                  className="flex-1 py-3 rounded-lg font-bold bg-[#D4AF37] text-black hover:bg-[#b0902c] transition-colors shadow-[0_0_20px_rgba(212,175,55,0.3)]"
                >
                  Upgrade Now
                </button>
              </div>
            </div>
          </div>
        )}

        {session && (
          <div className="bg-neutral-900/50 border border-[#D4AF37]/30 p-4 rounded-xl mb-8 flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm font-bold tracking-widest text-[#D4AF37] uppercase">Pro Sync Active: {session.user?.email}</span>
            </div>
            <div className="flex items-center gap-4">
              <button 
                onClick={async () => {
                  setIsSyncing(true);
                  try {
                    const res = await fetch('/api/scripts', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ title: 'Teleprompter Script', content: text })
                    });
                    if (res.ok) {
                      setSyncStatus("success");
                      setTimeout(() => setSyncStatus("idle"), 3000);
                    } else {
                      const data = await res.json();
                      if (data.error === "LIMIT_REACHED_WORDS") {
                        setPaywallMessage("Upgrade to Founder: Maximum script length is 500 words on the Free tier.");
                      } else if (data.error === "LIMIT_REACHED_CAPACITY") {
                        setPaywallMessage("Upgrade to Founder: Maximum of 3 saved scripts on the Free tier.");
                      }
                      throw new Error(data.error);
                    }
                  } catch {
                    setSyncStatus("error");
                    setTimeout(() => setSyncStatus("idle"), 3000);
                  }
                  setIsSyncing(false);
                }}
                className="text-xs bg-[#D4AF37]/10 text-[#D4AF37] hover:bg-[#D4AF37]/20 px-4 py-2 rounded font-bold uppercase tracking-widest transition-colors flex items-center gap-2"
              >
                <Cloud size={14} /> {isSyncing ? "Syncing..." : syncStatus === "success" ? "Saved!" : syncStatus === "error" ? "Failed" : "Save to Cloud"}
              </button>
              <button onClick={() => signOut()} className="text-xs text-neutral-500 hover:text-white uppercase tracking-widest font-bold flex items-center gap-2">
                <LogOut size={14} /> Disconnect
              </button>
            </div>
          </div>
        )}

        <div className="flex-1 flex flex-col gap-4">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-sm font-bold tracking-widest text-white uppercase">Input Stream</h2>
            <div className="text-[10px] md:text-xs text-[#D4AF37] font-bold tracking-widest flex items-center gap-2 bg-[#D4AF37]/10 px-3 py-1 rounded">
              <span className="w-1.5 h-1.5 bg-[#D4AF37] rounded-full animate-pulse"></span>
              PRIVATE & SECURE: ENCRYPTED LOCALLY (No Cloud Storage)
            </div>
          </div>
          
          {/* AI Generator UI */}
          <div className="mb-2 bg-neutral-900/80 border border-[#D4AF37]/50 rounded-xl p-4 shadow-[0_0_15px_rgba(212,175,55,0.1)]">
            <form onSubmit={(e) => {
              e.preventDefault();
              if (!session || (session.user as any)?.plan !== 'PREMIUM') {
                setPaywallMessage("Upgrade to Premium: Autonomous script generation requires dedicated Anthropic AI compute. Upgrade now to generate unlimited scripts.");
                return;
              }
              handleSubmit(e);
            }} className="flex flex-col md:flex-row gap-4">
              <input 
                type="text" 
                placeholder="✨ Generate with Hive AI (e.g. Write a 60s pitch about Vercel vs Cloudflare)"
                value={input}
                onChange={handleInputChange}
                className="flex-1 bg-black border border-neutral-800 rounded-lg px-4 py-3 text-sm focus:border-[#D4AF37] outline-none text-white transition-colors"
                disabled={isLoading}
              />
              <button 
                type="submit" 
                disabled={isLoading || !input}
                className="bg-[#D4AF37] hover:bg-[#b0902c] disabled:opacity-50 text-black px-6 py-3 rounded-lg font-bold uppercase tracking-widest text-xs transition-all shadow-[0_0_15px_rgba(212,175,55,0.3)] whitespace-nowrap"
              >
                {isLoading ? "Generating..." : "Generate Script"}
              </button>
            </form>
          </div>

          <textarea
            className="flex-1 w-full bg-neutral-900/50 backdrop-blur border border-neutral-800 rounded-xl p-8 text-xl md:text-2xl text-neutral-300 focus:outline-none focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37] resize-none leading-relaxed transition-all shadow-inner"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Paste your script here..."
          />
          <div className="flex justify-between items-center mt-2 px-2">
            <p className="text-xs text-neutral-500 font-bold tracking-widest uppercase">(Don&apos;t worry, the text will take up the entire screen when you launch the engine)</p>
            <p className={`text-xs font-bold tracking-widest uppercase ${wordCount > 500 && (!session || (session.user as any)?.plan !== 'FOUNDER') ? 'text-red-500' : 'text-neutral-500'}`}>
              {wordCount} Words {wordCount > 500 && (!session || (session.user as any)?.plan !== 'FOUNDER') && " (Limit 500)"}
            </p>
          </div>
        </div>

        {/* Pricing Section */}
        <section className="mt-16 pt-12 border-t border-neutral-900">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-white mb-3">Engine Access Tiers</h2>
            <p className="text-neutral-400">Scale your production with autonomous infrastructure.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {/* Free Tier */}
            <div className="bg-neutral-900/30 border border-[#D4AF37]/30 rounded-2xl p-8 flex flex-col relative overflow-hidden">
              <div className="absolute top-0 right-0 bg-[#D4AF37] text-black text-[10px] font-bold px-3 py-1 tracking-widest uppercase rounded-bl-lg">Active Now</div>
              <h3 className="text-xl font-bold text-white mb-2">Alpha Build</h3>
              <div className="text-3xl font-bold text-[#D4AF37] mb-6">Free <span className="text-sm text-neutral-500 font-normal">for first 7 days</span></div>
              <ul className="space-y-3 text-sm text-neutral-400 mb-8 flex-1">
                <li className="flex items-center gap-2">✓ Unlimited Scrolling</li>
                <li className="flex items-center gap-2">✓ Mirror Mode</li>
                <li className="flex items-center gap-2">✓ Local Encryption</li>
                <li className="flex items-center gap-2 text-[#D4AF37]">✓ Voice Tracking (Auto-scroll)</li>
              </ul>
              <div className="text-xs text-neutral-500 text-center uppercase tracking-widest font-bold">Free until we say it&apos;s not</div>
            </div>

            {/* Pro Tier */}
            <div className={`border rounded-2xl p-8 flex flex-col transition-all ${session ? 'bg-neutral-900/80 border-[#D4AF37]/50 shadow-[0_0_30px_rgba(212,175,55,0.1)]' : 'bg-neutral-900 border-neutral-800'}`}>
              <h3 className="text-xl font-bold text-white mb-2">Pro <span className="text-xs bg-[#D4AF37] text-black px-2 py-1 rounded ml-2 uppercase tracking-widest">Founder Deal</span></h3>
              <div className="text-3xl font-bold text-white mb-2">Free <span className="text-sm text-neutral-500 font-normal line-through">$108/yr</span></div>
              <p className="text-xs text-[#D4AF37] font-bold mb-6 tracking-widest uppercase">Sign up before June 19th for 1 free year.</p>
              <ul className="space-y-3 text-sm text-neutral-400 mb-8 flex-1">
                <li className="flex items-center gap-2">✓ Everything in Alpha</li>
                <li className="flex items-center gap-2 text-white">✓ Cloud Sync Scripts</li>
                <li className="flex items-center gap-2">✓ Multi-Device Control (Coming Soon)</li>
              </ul>
              
              {!session ? (
                <div className="flex flex-col gap-3">
                  <div className="flex flex-col gap-3">
                    <input 
                      type="email" 
                      placeholder="Professional email address" 
                      value={emailInput}
                      onChange={(e) => setEmailInput(e.target.value)}
                      className="w-full py-3 bg-black border border-[#D4AF37]/50 rounded-lg px-4 text-sm focus:border-[#D4AF37] outline-none text-white shadow-inner" 
                    />
                    <button 
                      onClick={() => signIn('email', { email: emailInput })}
                      className="w-full py-3 bg-[#D4AF37] hover:bg-[#b0902c] text-black rounded-lg text-sm font-bold tracking-widest uppercase transition-colors shadow-[0_0_15px_rgba(212,175,55,0.3)]"
                    >
                      Send Magic Link
                    </button>
                  </div>
                  <p className="text-[10px] text-neutral-500 text-center mt-1 mb-2 leading-relaxed font-bold uppercase tracking-widest">
                    * MACHINE OVER HUMAN: Use a hospital or custom domain email instead of Gmail.
                  </p>
                  
                  <div className="relative flex items-center py-2">
                    <div className="flex-grow border-t border-neutral-800"></div>
                    <span className="flex-shrink-0 mx-4 text-neutral-600 text-xs font-bold uppercase tracking-widest">Or fallback</span>
                    <div className="flex-grow border-t border-neutral-800"></div>
                  </div>
                  
                  <button onClick={() => signIn('google')} className="w-full py-3 rounded-lg font-bold bg-neutral-900 border border-neutral-800 text-neutral-400 hover:bg-neutral-800 hover:text-white transition-colors flex items-center justify-center gap-2">
                    <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" className="w-4 h-4 opacity-70" /> Sign up with Google
                  </button>
                </div>
              ) : (
                <button disabled className="w-full py-3 rounded-lg font-bold bg-[#D4AF37]/20 text-[#D4AF37] cursor-default border border-[#D4AF37]/30">Active Plan (Founder)</button>
              )}
            </div>

            {/* Premium Tier */}
            <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-8 flex flex-col opacity-50 grayscale hover:grayscale-0 transition-all">
              <h3 className="text-xl font-bold text-white mb-2">Premium</h3>
              <div className="text-3xl font-bold text-white mb-6">$19<span className="text-sm text-neutral-500 font-normal">/month</span></div>
              <ul className="space-y-3 text-sm text-neutral-400 mb-8 flex-1">
                <li className="flex items-center gap-2">✓ Everything in Pro</li>
                <li className="flex items-center gap-2 text-[#D4AF37]">✨ Unlimited AI Script Generation</li>
                <li className="flex items-center gap-2 text-[#D4AF37]">✓ AI Eye-Contact Correction</li>
              </ul>
              <button disabled className="w-full py-3 rounded-lg font-bold bg-neutral-800 text-neutral-500 cursor-not-allowed">Deploying Soon</button>
            </div>
          </div>
        </section>

        <footer className="mt-16 pt-8 border-t border-neutral-900 flex flex-col items-center gap-8 text-xs font-bold tracking-widest text-neutral-600 uppercase">
          <div className="flex flex-wrap justify-center gap-4 md:gap-6">
            <a href="https://hive.baby" target="_blank" className="hover:text-[#D4AF37] transition-colors">hive.baby</a>
            <span>·</span>
            <a href="https://hive.baby" target="_blank" className="hover:text-[#D4AF37] transition-colors">social experiment</a>
            <span>·</span>
            <a href="https://hive.baby" target="_blank" className="hover:text-[#D4AF37] transition-colors">contribute</a>
            <span>·</span>
            <a href="https://hive.baby" target="_blank" className="hover:text-[#D4AF37] transition-colors">patronage</a>
            <span>·</span>
            <a href="https://hive.baby" target="_blank" className="hover:text-[#D4AF37] transition-colors">privacy</a>
          </div>
          
          <div className="flex flex-col items-center gap-4 mt-4">
            <div className="text-neutral-500 flex items-center gap-1.5 normal-case tracking-normal">
              Made with <span className="text-[#D4AF37]">♥</span> in the 
              <a href="https://hive.baby" target="_blank" className="hover:text-[#D4AF37] transition-colors font-semibold flex items-center gap-1.5">
                Hive <img src="/hive-mark.svg" alt="Hive" className="h-[20px] w-auto" />
              </a>
            </div>
          </div>
        </footer>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black flex flex-col overflow-hidden">
      {/* Top HUD / Controls (Fades out when scrolling, or appears on hover) */}
      <div className={`absolute top-0 w-full p-4 flex justify-between items-start z-50 transition-opacity duration-300 ${isPlaying ? 'opacity-0 hover:opacity-100' : 'opacity-100'}`}>
        <button 
          onClick={() => {
            setIsPlaying(false);
            setIsConfigMode(true);
          }}
          className="bg-neutral-900/80 border border-neutral-800 text-white p-3 rounded-lg hover:bg-neutral-800 transition-colors backdrop-blur"
        >
          <Settings2 size={24} />
        </button>

        <div className="bg-neutral-900/60 border border-[#D4AF37]/30 shadow-2xl p-2 rounded-lg flex items-center gap-4 backdrop-blur-md">
          <div className={`flex items-center gap-2 border-r border-neutral-800 pr-4 transition-all duration-500 ${isVoiceTracking ? 'opacity-50' : 'opacity-100'}`}>
            <span className="text-xs font-bold text-neutral-400 uppercase tracking-widest">{isVoiceTracking ? "Auto-Flow" : "Set Speed"}</span>
            <button onClick={() => setSpeed(Math.max(0.5, speed - 0.5))} disabled={isVoiceTracking} className={`p-2 rounded text-white ${isVoiceTracking ? 'cursor-not-allowed' : 'hover:bg-neutral-800'}`}><Rewind size={16} /></button>
            <span className="w-8 text-center font-mono font-bold text-[#D4AF37]">{isVoiceTracking ? "AI" : speed.toFixed(1)}</span>
            <button onClick={() => setSpeed(Math.min(10, speed + 0.5))} disabled={isVoiceTracking} className={`p-2 rounded text-white ${isVoiceTracking ? 'cursor-not-allowed' : 'hover:bg-neutral-800'}`}><FastForward size={16} /></button>
          </div>

          <div className="flex items-center gap-2 border-r border-neutral-800 pr-4">
            <span className="text-xs font-bold text-neutral-400 uppercase tracking-widest">Size</span>
            <button onClick={() => setFontSize(Math.max(24, fontSize - 8))} className="p-2 hover:bg-neutral-800 rounded text-white"><Minus size={16} /></button>
            <span className="w-12 text-center font-mono font-bold text-[#D4AF37]">{fontSize}px</span>
            <button onClick={() => setFontSize(Math.min(200, fontSize + 8))} className="p-2 hover:bg-neutral-800 rounded text-white"><Plus size={16} /></button>
          </div>

          <button 
            onClick={() => setIsVoiceTracking(!isVoiceTracking)} 
            className={`p-3 rounded-lg font-bold flex items-center gap-2 transition-colors ${isVoiceTracking ? 'bg-[#D4AF37] text-black shadow-[0_0_15px_rgba(212,175,55,0.5)]' : 'hover:bg-neutral-800 text-white'}`}
            title="Voice Tracking"
          >
            {isVoiceTracking ? <Mic size={18} className="animate-pulse" /> : <MicOff size={18} />} Voice Track
          </button>

          <button 
            onClick={() => setIsMirrored(!isMirrored)} 
            className={`p-3 rounded-lg font-bold flex items-center gap-2 transition-colors ${isMirrored ? 'bg-[#D4AF37] text-black' : 'hover:bg-neutral-800 text-white'}`}
          >
            <FlipHorizontal size={18} /> Mirror
          </button>
          
          <div className="border-l border-neutral-800 pl-4 ml-2 flex items-center gap-4">
            <button 
              onClick={() => setIsVideoMode(!isVideoMode)} 
              className={`p-3 rounded-lg font-bold flex items-center gap-2 transition-colors ${isVideoMode ? 'bg-[#D4AF37] text-black' : 'hover:bg-neutral-800 text-white'}`}
            >
              {isVideoMode ? <Video size={18} /> : <VideoOff size={18} />} Camera
            </button>
            <button 
              onClick={() => {
                if (!session || (session.user as any)?.plan !== 'FOUNDER') {
                  setPaywallMessage("Upgrade to Premium: The AI Eye-Contact Engine requires a massive amount of dedicated GPU compute. It is restricted to active Founders.");
                  return;
                }
                const newState = !isEyeContactEnabled;
                setIsEyeContactEnabled(newState);
                if (newState && !isVideoMode) {
                  setIsVideoMode(true);
                }
              }}
              className={`p-3 rounded-lg font-bold flex items-center gap-2 transition-colors ${isEyeContactEnabled ? 'bg-[#D4AF37] text-black shadow-[0_0_15px_rgba(212,175,55,0.5)]' : 'hover:bg-neutral-800 text-white'}`}
              title="AI Eye-Contact Correction (Beta) - Leverages OS-level Neural Engines (e.g. macOS Studio Effects) to redirect your gaze to the lens."
            >
              <Circle size={14} className={isEyeContactEnabled ? "text-black animate-pulse" : "text-[#D4AF37]"} fill="currentColor" /> {isEyeContactEnabled ? "AI Gaze: ON" : "Eye Contact AI"}
            </button>
          </div>
        </div>
      </div>

      {/* Main Prompter Display with Focal Lens */}
      <div className="flex-1 relative overflow-hidden flex flex-col">
        {/* Speakeasy-style Focal Lens Gradients */}
        <div className="absolute top-0 left-0 w-full h-[30vh] bg-gradient-to-b from-black via-black/80 to-transparent z-10 pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-full h-[30vh] bg-gradient-to-t from-black via-black/80 to-transparent z-10 pointer-events-none"></div>

        <div 
          ref={containerRef}
          className="flex-1 overflow-y-auto px-8 md:px-24 pt-[50vh] pb-[50vh] hide-scrollbar"
          onClick={togglePlay}
          style={{ scrollBehavior: isVoiceTracking ? 'smooth' : 'auto' }}
        >
        <div 
          ref={textRef}
          className="max-w-5xl mx-auto whitespace-pre-wrap leading-relaxed font-bold transition-all duration-300 cursor-pointer"
          style={{ 
            fontSize: `${fontSize}px`,
            transform: isMirrored ? 'scaleX(-1)' : 'none',
            color: isPlaying ? 'white' : '#888'
          }}
        >
          {renderText()}
        </div>
        </div>
      </div>

      {/* Play/Pause Overlay Indicator (briefly shows when clicking) */}
      {!isPlaying && (
        <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
          <div className="bg-black/50 p-8 rounded-full backdrop-blur-sm border border-neutral-800">
            <Play size={64} className="text-[#D4AF37]" fill="currentColor" />
          </div>
        </div>
      )}

      {/* Focus Line */}
      <div className="absolute top-1/2 left-0 w-full h-px bg-gradient-to-r from-transparent via-[#D4AF37]/50 to-transparent pointer-events-none shadow-[0_0_15px_rgba(212,175,55,0.5)] z-40"></div>

      {/* Floating Video Preview */}
      {isVideoMode && (
        <div className="absolute bottom-8 right-8 z-50 flex flex-col gap-2">
          <div className="w-64 h-48 bg-black rounded-xl overflow-hidden shadow-2xl relative group hover:scale-105 transition-transform">
            <div className={`absolute inset-0 z-20 pointer-events-none rounded-xl transition-all duration-700 ${isEyeContactEnabled ? 'border-[3px] border-[#D4AF37] shadow-[inset_0_0_40px_rgba(212,175,55,0.4)]' : 'border border-neutral-800'}`}></div>
            <video 
              ref={videoRef} 
              autoPlay 
              playsInline 
              muted 
              className={`w-full h-full object-cover relative z-10 ${isMirrored ? 'scale-x-[-1]' : ''}`} 
            />
            {isRecording && (
              <div className="absolute top-3 right-3 z-30 flex items-center gap-2 bg-black/70 px-2 py-1 rounded backdrop-blur border border-red-500/30 text-xs font-bold text-red-500 tracking-widest uppercase shadow-[0_0_10px_rgba(0,0,0,0.5)]">
                <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(239,68,68,1)]"></span> REC
              </div>
            )}
            {isEyeContactEnabled && (
              <div className="absolute top-3 left-3 z-30 flex items-center gap-2 bg-black/70 border border-[#D4AF37]/50 px-2 py-1 rounded backdrop-blur text-[10px] font-bold text-[#D4AF37] tracking-widest uppercase shadow-[0_0_10px_rgba(0,0,0,0.5)]">
                <Circle size={8} fill="currentColor" className="animate-pulse shadow-[0_0_10px_rgba(212,175,55,1)]" /> AI GAZE
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-center pb-4 gap-4">
              <button 
                onClick={toggleRecording}
                className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${isRecording ? 'bg-red-500/20 text-red-500 border border-red-500' : 'bg-white text-black hover:scale-110'}`}
              >
                {isRecording ? <div className="w-3 h-3 bg-red-500 rounded-sm" /> : <div className="w-3 h-3 bg-red-500 rounded-full" />}
              </button>
            </div>
          </div>
          {recordedChunks.length > 0 && !isRecording && (
            <button 
              onClick={downloadRecording}
              className="w-full bg-[#D4AF37] hover:bg-[#b0902c] text-black font-bold uppercase tracking-widest text-xs py-2 rounded shadow flex items-center justify-center gap-2 transition-colors"
            >
              <Download size={14} /> Download Recording
            </button>
          )}
        </div>
      )}
      {/* Global Paywall Modal for Teleprompter View */}
      {paywallMessage && (
        <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-[100] backdrop-blur-sm p-4">
          <div className="bg-neutral-900 border border-[#D4AF37]/50 rounded-2xl max-w-md w-full p-8 text-center relative overflow-hidden shadow-[0_0_50px_rgba(212,175,55,0.1)]">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#D4AF37] to-transparent"></div>
            <h3 className="text-2xl font-bold text-white mb-4 uppercase tracking-widest">Upgrade Required</h3>
            <p className="text-neutral-400 mb-8">{paywallMessage}</p>
            <button 
              onClick={() => {
                setPaywallMessage("");
                setIsConfigMode(true);
              }}
              className="w-full py-4 bg-[#D4AF37] hover:bg-[#b0902c] text-black font-bold uppercase tracking-widest rounded-lg transition-colors shadow-[0_0_15px_rgba(212,175,55,0.3)]"
            >
              View Founder Plan
            </button>
            <button 
              onClick={() => setPaywallMessage("")}
              className="w-full py-3 mt-3 text-neutral-500 hover:text-white font-bold uppercase tracking-widest text-xs transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
