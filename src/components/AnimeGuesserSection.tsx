import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Trophy, 
  Heart, 
  Flame, 
  Timer, 
  Volume2, 
  VolumeX, 
  RotateCcw, 
  ChevronRight, 
  HelpCircle,
  Play,
  CheckCircle2,
  XCircle,
  AlertCircle
} from 'lucide-react';

interface Question {
  id: number;
  emojis: string;
  answer: string;
  answers: string[];
  options: string[];
  image: string;
  video?: string;
  character: string;
  characterDescription: string;
}

export default function AnimeGuesserSection() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Game states
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [streak, setStreak] = useState(0);
  const [timeLeft, setTimeLeft] = useState(15);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [gameStatus, setGameStatus] = useState<'start' | 'playing' | 'answered' | 'gameover' | 'victory'>('start');

  // Input states
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [typedAnswer, setTypedAnswer] = useState('');
  const [isCorrectAnswer, setIsCorrectAnswer] = useState(false);
  const [shakeButton, setShakeButton] = useState<string | null>(null);
  const [shakeInput, setShakeInput] = useState(false);
  const [showVideo, setShowVideo] = useState(false);

  // Timer Ref
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Load questions
  useEffect(() => {
    async function fetchQuestions() {
      try {
        const response = await fetch('/api/questions');
        if (!response.ok) {
          throw new Error('Failed to summon questions from the scroll.');
        }
        const data = await response.json();
        setQuestions(data);
      } catch (err: any) {
        setError(err.message || 'Error loading guesser database.');
      } finally {
        setLoading(false);
      }
    }
    fetchQuestions();
  }, []);

  // Timer countdown hook
  useEffect(() => {
    if (gameStatus === 'playing') {
      if (timeLeft > 0) {
        timerRef.current = setTimeout(() => {
          setTimeLeft(prev => prev - 1);
        }, 1000);
      } else {
        // Time ran out!
        handleAnswer(null, true);
      }
    }

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [timeLeft, gameStatus]);

  // Web Audio sound generator to avoid external asset loading errors
  const playSfx = (type: 'correct' | 'incorrect' | 'bonus' | 'victory') => {
    if (!soundEnabled) return;
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);

      if (type === 'correct') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(523.25, ctx.currentTime); // C5
        osc.frequency.setValueAtTime(659.25, ctx.currentTime + 0.1); // E5
        gain.gain.setValueAtTime(0.1, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.35);
        osc.start();
        osc.stop(ctx.currentTime + 0.35);
      } else if (type === 'incorrect') {
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(150, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(90, ctx.currentTime + 0.25);
        gain.gain.setValueAtTime(0.12, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.25);
        osc.start();
        osc.stop(ctx.currentTime + 0.25);
      } else if (type === 'bonus') {
        // Star level-up chime
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
        osc.frequency.setValueAtTime(698.46, ctx.currentTime + 0.08); // F5
        osc.frequency.setValueAtTime(880.00, ctx.currentTime + 0.16); // A5
        osc.frequency.setValueAtTime(1046.50, ctx.currentTime + 0.24); // C6
        gain.gain.setValueAtTime(0.15, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);
        osc.start();
        osc.stop(ctx.currentTime + 0.5);
      } else if (type === 'victory') {
        // High ascending triumph fanfare
        osc.type = 'sine';
        [261.63, 329.63, 392.00, 523.25, 659.25, 783.99, 1046.50].forEach((freq, idx) => {
          const oscNode = ctx.createOscillator();
          const gainNode = ctx.createGain();
          oscNode.connect(gainNode);
          gainNode.connect(ctx.destination);
          oscNode.type = 'sine';
          oscNode.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.12);
          gainNode.gain.setValueAtTime(0.1, ctx.currentTime + idx * 0.12);
          gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + idx * 0.12 + 0.3);
          oscNode.start(ctx.currentTime + idx * 0.12);
          oscNode.stop(ctx.currentTime + idx * 0.12 + 0.3);
        });
      }
    } catch (err) {
      console.warn("Audio Context is blocked or not supported by browser security:", err);
    }
  };

  const startNewGame = () => {
    setCurrentIndex(0);
    setScore(0);
    setLives(3);
    setStreak(0);
    setTimeLeft(15);
    setGameStatus('playing');
    setSelectedOption(null);
    setTypedAnswer('');
    setIsCorrectAnswer(false);
    setShowVideo(false);
  };

  const normalizeText = (text: string) => {
    return text.toLowerCase().replace(/[^a-z0-9а-яөү]/g, '').trim();
  };

  const handleAnswer = (answerText: string | null, timedOut = false) => {
    if (gameStatus !== 'playing') return;

    if (timerRef.current) clearTimeout(timerRef.current);

    const currentQuestion = questions[currentIndex];
    let isCorrect = false;

    if (!timedOut && answerText !== null) {
      const normAnswer = normalizeText(answerText);
      // Verify against answer lists
      isCorrect = currentQuestion.answers.some(ans => normalizeText(ans) === normAnswer) ||
                  normalizeText(currentQuestion.answer) === normAnswer;
    }

    setIsCorrectAnswer(isCorrect);
    
    if (isCorrect) {
      // Correct! Add score
      const newScore = score + 10;
      const newStreak = streak + 1;
      
      setStreak(newStreak);

      // Check for 3-in-a-row streak bonus
      if (newStreak > 0 && newStreak % 3 === 0) {
        setScore(newScore + 20);
        playSfx('bonus');
      } else {
        setScore(newScore);
        playSfx('correct');
      }
    } else {
      // Incorrect or timed out
      setStreak(0);
      const remainingLives = lives - 1;
      setLives(remainingLives);
      playSfx('incorrect');

      // Set shake animations
      if (answerText) {
        if (selectedOption) {
          setShakeButton(selectedOption);
          setTimeout(() => setShakeButton(null), 500);
        } else {
          setShakeInput(true);
          setTimeout(() => setShakeInput(false), 500);
        }
      }

      if (remainingLives <= 0) {
        setTimeout(() => {
          setGameStatus('gameover');
        }, 1500);
        setGameStatus('answered');
        return;
      }
    }

    setGameStatus('answered');
  };

  const handleOptionClick = (option: string) => {
    if (gameStatus !== 'playing') return;
    setSelectedOption(option);
    handleAnswer(option);
  };

  const handleTextSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (gameStatus !== 'playing' || !typedAnswer.trim()) return;
    handleAnswer(typedAnswer);
  };

  const handleNextQuestion = () => {
    const nextIndex = currentIndex + 1;
    setShowVideo(false);
    if (nextIndex >= questions.length) {
      setGameStatus('victory');
      playSfx('victory');
    } else {
      setCurrentIndex(nextIndex);
      setTimeLeft(15);
      setSelectedOption(null);
      setTypedAnswer('');
      setIsCorrectAnswer(false);
      setGameStatus('playing');
    }
  };

  if (loading) {
    return (
      <div className="border-2 border-black bg-[#FDFCFB] p-12 text-center shadow-[6px_6px_0px_#000000] flex flex-col items-center justify-center min-h-[300px]">
        <Loader2 className="h-10 w-10 animate-spin text-indigo-600 mb-4" />
        <span className="font-mono text-sm font-black uppercase tracking-widest text-neutral-500">
          Gathering magical scrolls & emojis...
        </span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="border-2 border-rose-600 bg-rose-50 p-8 text-center shadow-[6px_6px_0px_#1A1A1A]">
        <AlertCircle className="h-10 w-10 text-rose-600 mx-auto mb-3" />
        <h4 className="text-sm font-black uppercase tracking-tight text-rose-800">Guesser Loading Failed</h4>
        <p className="text-2xs text-rose-700 mt-1 font-mono">{error}</p>
      </div>
    );
  }

  const currentQuestion = questions[currentIndex];

  return (
    <div id="anime-guesser-section-root" className="border-2 border-black bg-[#FDFCFB] text-[#1A1A1A] overflow-hidden shadow-[8px_8px_0px_#000000] font-sans">
      
      {/* Header bar */}
      <div className="border-b-2 border-black bg-indigo-50 p-4 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 border-2 border-black bg-black text-white flex items-center justify-center shadow-[2px_2px_0px_#1A1A1A]">
            <Trophy className="h-5 w-5 text-amber-400 fill-amber-400 stroke-[2]" />
          </div>
          <div>
            <h3 className="text-lg font-black uppercase tracking-tight">Anime Emoji Guesser</h3>
            <p className="text-2xs text-neutral-500 font-mono tracking-widest uppercase">
              Retro Game Arena // Challenge Arena
            </p>
          </div>
        </div>

        {/* Audio control & Stats indicator */}
        <div className="flex items-center gap-3">
          <button
            id="toggle-guesser-audio"
            onClick={() => setSoundEnabled(!soundEnabled)}
            className="border-2 border-black p-2 bg-white hover:bg-neutral-50 text-black shadow-[2px_2px_0px_#1A1A1A] cursor-pointer text-xs"
            title={soundEnabled ? "Mute audio" : "Unmute audio"}
          >
            {soundEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4 text-rose-500" />}
          </button>
          
          <div className="bg-white border-2 border-black px-3 py-1.5 flex items-center gap-1.5 text-xs font-mono font-black shadow-[2px_2px_0px_#1A1A1A]">
            <Trophy className="h-4 w-4 text-yellow-500 fill-yellow-500" />
            SCORE: {score}
          </div>
        </div>
      </div>

      <AnimatePresence mode="wait">
        
        {/* State 1: Start Screen */}
        {gameStatus === 'start' && (
          <motion.div
            key="start-screen"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            className="p-6 md:p-12 text-center flex flex-col items-center justify-center gap-6 min-h-[400px]"
          >
            <div className="text-6xl mb-2 animate-bounce">🎬🍥🪚🗡️</div>
            <h4 className="text-2xl md:text-3xl font-black uppercase tracking-tighter max-w-xl leading-tight">
              Can you guess the anime purely from Emojis?
            </h4>
            <p className="text-xs text-neutral-600 max-w-lg font-medium leading-relaxed">
              We have compiled 10 mysterious emoji sequences representing legendary anime titles (like One Piece, Naruto, Demon Slayer). Test your Otaku wisdom!
            </p>

            {/* Rules list */}
            <div className="bg-amber-50/50 border-2 border-black p-4 text-left max-w-md w-full text-2xs space-y-2.5 font-bold uppercase tracking-wide">
              <span className="text-indigo-600 font-mono font-black text-center block mb-1">
                -- COGNITIVE GUIDELINE SCHEMAS --
              </span>
              <div className="flex items-start gap-2">
                <span className="bg-black text-white text-[9px] px-1.5 py-0.5 font-mono">01</span>
                <span>+10 Points per correct answer. 15s timer limit.</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="bg-black text-white text-[9px] px-1.5 py-0.5 font-mono">02</span>
                <span>You have exactly 3 Lives. 3 strikes and it's GAME OVER.</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="bg-black text-white text-[9px] px-1.5 py-0.5 font-mono">03</span>
                <span>Streak Bonus: Get 3 in a row for an extra <span className="text-emerald-600 font-black">+20 points</span>!</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="bg-black text-white text-[9px] px-1.5 py-0.5 font-mono">04</span>
                <span>Hybrid answering: Choose multiple-choice options OR write custom input!</span>
              </div>
            </div>

            <button
              id="start-guesser-game"
              onClick={startNewGame}
              className="bg-black text-white px-8 py-4 text-sm font-black uppercase tracking-widest shadow-[4px_4px_0px_#4F46E5] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_#4F46E5] active:translate-y-[3px] transition-all flex items-center gap-2 cursor-pointer"
            >
              <Play className="h-5 w-5 fill-white" />
              START CHALLENGE
            </button>
          </motion.div>
        )}

        {/* State 2 & 3: Playing or Answered Question Screen */}
        {(gameStatus === 'playing' || gameStatus === 'answered') && currentQuestion && (
          <motion.div
            key={`question-${currentQuestion.id}`}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="p-4 md:p-6 space-y-6"
          >
            {/* Top Status Bar: Timer, Progress bar, Lives, Streaks */}
            <div className="grid grid-cols-1 md:grid-cols-3 items-center border-2 border-black bg-white p-3 shadow-[3px_3px_0px_#1A1A1A] gap-4">
              
              {/* Question Number & Timer */}
              <div className="flex items-center gap-4 justify-between md:justify-start">
                <span className="font-mono text-xs font-black uppercase bg-indigo-50 px-2 py-1 border border-black shrink-0">
                  Q: {currentIndex + 1} / {questions.length}
                </span>

                <div className="flex items-center gap-2">
                  <Timer className={`h-4.5 w-4.5 ${timeLeft <= 4 ? 'text-rose-600 animate-pulse' : 'text-neutral-700'}`} />
                  <span className={`font-mono text-xs font-black ${timeLeft <= 4 ? 'text-rose-600' : 'text-neutral-800'}`}>
                    {timeLeft}s SEC
                  </span>
                </div>
              </div>

              {/* Countdown Progress Slider bar */}
              <div className="h-3 border border-black bg-neutral-100 overflow-hidden relative">
                <div 
                  className={`h-full transition-all duration-1000 ${
                    timeLeft <= 4 ? 'bg-rose-500' : timeLeft <= 8 ? 'bg-amber-400' : 'bg-emerald-500'
                  }`}
                  style={{ width: `${(timeLeft / 15) * 100}%` }}
                />
              </div>

              {/* Hearts Lives count & Current Streak */}
              <div className="flex items-center justify-between md:justify-end gap-5 font-mono text-xs font-black uppercase">
                <div className="flex items-center gap-1">
                  <Flame className={`h-4.5 w-4.5 ${streak >= 3 ? 'text-amber-500 fill-amber-500 animate-bounce' : 'text-neutral-400'}`} />
                  STREAK: <span className="text-amber-600">{streak}</span>
                </div>

                <div className="flex items-center gap-1 text-rose-500">
                  <span className="text-neutral-500 mr-1 text-[10px]">LIVES:</span>
                  {[1, 2, 3].map((heartIdx) => (
                    <Heart 
                      key={heartIdx} 
                      className={`h-4.5 w-4.5 shrink-0 ${
                        heartIdx <= lives 
                          ? 'fill-rose-500 text-rose-500 scale-100' 
                          : 'text-neutral-300 scale-90'
                      } transition-transform`} 
                    />
                  ))}
                </div>
              </div>

            </div>

            {/* Emoji display card board */}
            <div className="border-4 border-black bg-amber-50/10 p-8 text-center flex flex-col items-center justify-center relative overflow-hidden min-h-[140px] shadow-[4px_4px_0px_#000000]">
              <span className="text-5xl md:text-6xl tracking-wider select-none animate-pulse">
                {currentQuestion.emojis}
              </span>
              <span className="text-[9px] font-mono font-black text-neutral-400 uppercase tracking-widest mt-4">
                - DECRYPT THE EMOJI COMBINATION -
              </span>
            </div>

            {/* Active Question: Playing Input and Options */}
            {gameStatus === 'playing' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Method A: Multiple Choice options */}
                <div className="space-y-3">
                  <h5 className="text-[10px] font-black uppercase tracking-widest text-neutral-500 font-mono">
                    Method A: Pick Option
                  </h5>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {currentQuestion.options.map((option) => (
                      <button
                        key={option}
                        id={`guesser-option-${option.toLowerCase().replace(/\s+/g, '-')}`}
                        onClick={() => handleOptionClick(option)}
                        className={`w-full bg-white border-2 border-black p-4 text-xs font-black uppercase tracking-wider text-left transition-all hover:bg-indigo-50 hover:border-indigo-600 shadow-[3px_3px_0px_#1A1A1A] hover:translate-x-[-1px] hover:shadow-[4px_4px_0px_#1A1A1A] cursor-pointer ${
                          shakeButton === option ? 'animate-shake border-rose-600 bg-rose-50' : ''
                        }`}
                      >
                        <span className="font-mono text-neutral-400 mr-2">✦</span>
                        {option}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Method B: Direct Text Guess input */}
                <div className="space-y-3">
                  <h5 className="text-[10px] font-black uppercase tracking-widest text-neutral-500 font-mono">
                    Method B: Type Guess (Extra Wiseman)
                  </h5>
                  <form 
                    onSubmit={handleTextSubmit} 
                    className={`border-2 border-black bg-white p-4 shadow-[3px_3px_0px_#1A1A1A] ${
                      shakeInput ? 'animate-shake border-rose-600 bg-rose-50' : ''
                    }`}
                  >
                    <p className="text-[10px] text-neutral-600 font-medium leading-relaxed mb-3">
                      Type the exact name (e.g. "one piece", "demon slayer", or characters like "luffy") in any language. Spelling/casing won't lock you out.
                    </p>
                    <div className="flex gap-2">
                      <input
                        id="typed-anime-guess-input"
                        type="text"
                        placeholder="TYPE ANIME TITLE OR KEYWORD..."
                        value={typedAnswer}
                        onChange={(e) => setTypedAnswer(e.target.value)}
                        className="flex-1 bg-neutral-50 border-2 border-black font-black uppercase tracking-wider text-xs px-3 py-2.5 focus:outline-none focus:bg-white text-[#1A1A1A]"
                      />
                      <button
                        id="submit-typed-anime-guess"
                        type="submit"
                        className="bg-black text-white px-5 py-2.5 text-xs font-black uppercase tracking-widest hover:bg-neutral-900 transition-all cursor-pointer"
                      >
                        CHECK
                      </button>
                    </div>
                  </form>
                </div>

              </div>
            )}

            {/* Answered View: Reveal main character info card, details, and explain outcome */}
            {gameStatus === 'answered' && (
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                className="border-3 border-black p-4 md:p-6 bg-white shadow-[6px_6px_0px_#000000] space-y-6"
              >
                {/* Result header */}
                <div className={`flex items-center gap-3 p-3 border-2 border-black ${
                  isCorrectAnswer 
                    ? 'bg-emerald-50 border-emerald-600 text-emerald-800' 
                    : 'bg-rose-50 border-rose-600 text-rose-800'
                }`}>
                  {isCorrectAnswer ? (
                    <CheckCircle2 className="h-6 w-6 stroke-[2.5]" />
                  ) : (
                    <XCircle className="h-6 w-6 stroke-[2.5]" />
                  )}
                  <div>
                    <h4 className="text-sm font-black uppercase tracking-tight font-mono">
                      {isCorrectAnswer ? 'Correct Answer! +10 POINTS' : 'Incorrect or Timed Out!'}
                    </h4>
                    <p className="text-2xs font-bold uppercase tracking-wider opacity-90 mt-0.5">
                      The answer is: <span className="underline">{currentQuestion.answer}</span>
                    </p>
                  </div>
                </div>

                {/* Main Character Showcase: Image & Bio Card */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
                  
                  {/* Left Column: Series Cover Image with Retro Badge */}
                  <div className="md:col-span-5 border-2 border-black overflow-hidden relative aspect-[4/5] bg-neutral-100 flex flex-col justify-between shadow-[4px_4px_0px_#1A1A1A]">
                    <div className="absolute top-2.5 left-2.5 bg-black text-white text-[8px] font-black uppercase px-2 py-1 tracking-widest border border-white z-10">
                      OFFICIAL SERIES COVER
                    </div>
                    {currentQuestion.image ? (
                      <img 
                        src={currentQuestion.image} 
                        alt={`${currentQuestion.answer} Cover`} 
                        referrerPolicy="no-referrer"
                        className="h-full w-full object-cover" 
                      />
                    ) : (
                      <div className="h-full w-full flex items-center justify-center font-mono text-2xs text-neutral-400 p-4 text-center">
                        Cover Art Unavailable
                      </div>
                    )}
                  </div>

                  {/* Right Column: Character Info & Story Intel */}
                  <div className="md:col-span-7 border-2 border-black p-5 bg-[#FDFCFB] flex flex-col justify-between shadow-[4px_4px_0px_#1A1A1A]">
                    <div className="space-y-4">
                      <div>
                        <span className="text-[9px] font-mono font-black text-[#6366F1] uppercase tracking-widest block">
                          ANIME: {currentQuestion.answer}
                        </span>
                        <h4 className="text-xl md:text-2xl font-black uppercase tracking-tight text-neutral-900 mt-1">
                          {currentQuestion.character}
                        </h4>
                        <div className="h-1 w-12 bg-black mt-2" />
                      </div>

                      <div className="bg-[#F7F5F0] border-2 border-black p-4">
                        <span className="text-[8px] font-mono font-black text-neutral-400 uppercase tracking-widest block mb-1">
                          COGNITIVE BIO INTEL
                        </span>
                        <p className="text-xs text-neutral-700 leading-relaxed font-medium">
                          {currentQuestion.characterDescription}
                        </p>
                      </div>

                      {currentQuestion.video && (
                        <div className="mt-2">
                          <button
                            id="toggle-trailer-video-btn"
                            type="button"
                            onClick={() => setShowVideo(!showVideo)}
                            className="w-full flex items-center justify-between border-2 border-black bg-indigo-50 hover:bg-indigo-100 px-3 py-2 text-[10px] font-mono font-black uppercase tracking-wider shadow-[2px_2px_0px_#1A1A1A] active:translate-y-[1.5px] active:shadow-[1px_1px_0px_#1A1A1A] transition-all cursor-pointer"
                          >
                            <span className="flex items-center gap-1.5">
                              <span>🎬</span>
                              <span>{showVideo ? "Hide Video Trailer" : "Watch Official Video Trailer / OST"}</span>
                            </span>
                            <span className="text-[9px] bg-indigo-600 text-white px-1.5 py-0.5 font-bold uppercase rounded-sm">
                              {showVideo ? "CLOSE" : "PLAY"}
                            </span>
                          </button>

                          <AnimatePresence>
                            {showVideo && (
                              <motion.div
                                initial={{ opacity: 0, height: 0, marginTop: 0 }}
                                animate={{ opacity: 1, height: "auto", marginTop: 8 }}
                                exit={{ opacity: 0, height: 0, marginTop: 0 }}
                                className="overflow-hidden border-2 border-black bg-neutral-900 aspect-video relative shadow-[2px_2px_0px_#1A1A1A]"
                              >
                                <iframe
                                  title={`Trailer for ${currentQuestion.answer}`}
                                  src={currentQuestion.video}
                                  frameBorder="0"
                                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                  allowFullScreen
                                  className="w-full h-full absolute inset-0"
                                />
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      )}
                    </div>

                    <div className="pt-4 border-t border-dashed border-neutral-200 mt-4">
                      <span className="text-[8px] font-mono font-black text-neutral-400 uppercase tracking-widest block">
                        STATUS STATUS REGISTER
                      </span>
                      <p className="text-[10px] text-neutral-500 font-bold uppercase mt-0.5">
                        Wisdom Database Checked // Active Index Resolved successfully.
                      </p>
                    </div>
                  </div>

                </div>

                {/* Continue button */}
                <div className="flex justify-end pt-2 border-t border-dashed border-neutral-300">
                  <button
                    id="guesser-next-question-btn"
                    onClick={handleNextQuestion}
                    className="bg-black text-white px-6 py-3 text-xs font-black uppercase tracking-widest shadow-[3px_3px_0px_#4F46E5] hover:translate-y-[1px] hover:shadow-[2px_2px_0px_#4F46E5] transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    CONTINUE NEXT
                    <ChevronRight className="h-4 w-4 stroke-[2.5]" />
                  </button>
                </div>

              </motion.div>
            )}

          </motion.div>
        )}

        {/* State 4: Game Over Screen */}
        {gameStatus === 'gameover' && (
          <motion.div
            key="game-over-screen"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="p-6 md:p-12 text-center flex flex-col items-center justify-center gap-5 min-h-[400px] bg-rose-50/10"
          >
            <div className="text-6xl mb-2 animate-pulse">💀🪦⚔️</div>
            <h4 className="text-2xl md:text-3xl font-black uppercase tracking-tight text-rose-700">
              Challenger Defeated!
            </h4>
            <p className="text-xs text-neutral-600 max-w-md font-medium">
              You lost all 3 lives! Even so, the path of the Otaku is forged through persistence, just like Will Serfort's training!
            </p>

            <div className="border-2 border-black bg-white p-4 shadow-[4px_4px_0px_#1A1A1A] max-w-sm w-full font-mono text-xs font-black uppercase space-y-2 text-left">
              <span className="text-center block text-[10px] text-neutral-400 tracking-wider">
                -- SCORE RECORD REPORT --
              </span>
              <div className="flex justify-between border-b border-neutral-100 pb-1 mt-1">
                <span>Final Score:</span>
                <span className="text-indigo-600">{score} pts</span>
              </div>
              <div className="flex justify-between border-b border-neutral-100 pb-1">
                <span>Questions Solved:</span>
                <span>{currentIndex} / {questions.length}</span>
              </div>
              <div className="flex justify-between">
                <span>Max Streak:</span>
                <span className="text-amber-600">{streak}</span>
              </div>
            </div>

            <button
              id="replay-guesser-game-over"
              onClick={startNewGame}
              className="bg-black text-white px-6 py-3.5 text-xs font-black uppercase tracking-widest shadow-[3px_3px_0px_#EF4444] hover:translate-y-[1px] hover:shadow-[2px_2px_0px_#EF4444] transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <RotateCcw className="h-4 w-4" />
              TRY AGAIN
            </button>
          </motion.div>
        )}

        {/* State 5: Victory Screen */}
        {gameStatus === 'victory' && (
          <motion.div
            key="victory-screen"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="p-6 md:p-12 text-center flex flex-col items-center justify-center gap-5 min-h-[400px] bg-emerald-50/10"
          >
            <div className="text-7xl mb-2 animate-bounce">👑🏆👑</div>
            <h4 className="text-2xl md:text-3xl font-black uppercase tracking-tight text-emerald-700">
              Grand Master Otaku!
            </h4>
            <p className="text-xs text-neutral-600 max-w-md font-medium">
              Absolutely outstanding! You conquered all 10 emoji puzzles perfectly and demonstrated profound wisdom of anime universes!
            </p>

            <div className="border-2 border-black bg-white p-4 shadow-[4px_4px_0px_#1A1A1A] max-w-sm w-full font-mono text-xs font-black uppercase space-y-2 text-left">
              <span className="text-center block text-[10px] text-neutral-400 tracking-wider">
                -- COGNITIVE VICTORY REGISTER --
              </span>
              <div className="flex justify-between border-b border-neutral-100 pb-1 mt-1">
                <span>Total Score:</span>
                <span className="text-emerald-600">{score} pts</span>
              </div>
              <div className="flex justify-between border-b border-neutral-100 pb-1">
                <span>Completed Tasks:</span>
                <span>10 / 10 Clear</span>
              </div>
              <div className="flex justify-between">
                <span>Lives Saved:</span>
                <span className="text-rose-500">{lives} / 3 Lives</span>
              </div>
            </div>

            <button
              id="replay-guesser-victory"
              onClick={startNewGame}
              className="bg-emerald-600 text-white px-7 py-3.5 text-xs font-black uppercase tracking-widest shadow-[3px_3px_0px_#000000] hover:translate-y-[1px] hover:shadow-[2px_2px_0px_#000000] transition-all flex items-center gap-1.5 cursor-pointer border-2 border-black"
            >
              <RotateCcw className="h-4 w-4" />
              CHALLENGE AGAIN
            </button>
          </motion.div>
        )}

      </AnimatePresence>

    </div>
  );
}

// Simple loader icon substitute to avoid standard import delay errors
function Loader2({ className }: { className?: string }) {
  return (
    <svg 
      className={`${className} animate-spin`} 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="3" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    >
      <path d="M21 12a9 9 0 1 1-6.219-8.56" />
    </svg>
  );
}
