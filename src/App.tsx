import React, { useEffect, useState, useRef, useContext, createContext } from "react";

const GlobalStyles = () => (
  <style>{`
    body {
      margin: 0;
      font-family: system-ui, -apple-system, "Segoe UI", Roboto, sans-serif;
      background: linear-gradient(to bottom, #fafafa, #f3f3f3);
      color: #222;
    }
    h1, h2 { margin: 0 0 0.5rem; }
    button {
      cursor: pointer;
      border-radius: 10px;
      border: 1px solid #ccc;
      background: white;
      box-shadow: 0 2px 5px rgba(0,0,0,0.1);
      padding: 8px 12px;
      transition: all 0.15s ease-in-out;
    }
    button:hover {
      transform: translateY(-1px);
      box-shadow: 0 4px 8px rgba(0,0,0,0.15);
    }
    select, input {
      border-radius: 8px;
      border: 1px solid #ccc;
      padding: 6px 10px;
      background: white;
    }
    table {
      border-collapse: collapse;
      width: 100%;
    }
    th, td {
      border-bottom: 1px solid #eee;
      padding: 6px 8px;
      text-align: left;
    }
    th { background: #f9f9f9; }
    .card {
      background: white;
      border-radius: 16px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.05);
      padding: 12px;
      margin: 4px 0;
    }
  `}</style>
);


/*************************************************
 * Piano Learning — Multi‑game (PT/EN/DE)
 * Games:
 *  - Note Reading (click the letter)
 *  - Note Writing (drag note to exact pitch)
 *  - Note Matching (text ↔ text across EN/PT/DE)
 *
 * Strong types + self‑checks + fixed drag ranges.
 *************************************************/

/********************** I18N ************************/
const LANGS = [
  { code: "pt", label: "PT", flag: "🇵🇹" },
  { code: "en", label: "EN", flag: "🇬🇧" },
  { code: "de", label: "DE", flag: "🇩🇪" },
];
const LANG_CODES = ['pt','en','de'] as const;

interface Cockpit { language: string; randomGame: string; game: string; selectGame: string }
interface Games { noteReading: string; intervals: string; dragNote: string; matchNotes: string }
interface Locale {
  appTitle: string; cockpit: Cockpit; games: Games;
  request: string; expected: string; guess: string; history: string; noneYet: string; hour: string; correctQ: string;
  score: string; review: string; actions: string; clefLabel: string; new: string; startAuto: string; stopAuto: string; keyTime: string;
  manual: string; autoOn: string; streakSuf: string; status: string; hit: string; miss: string; targetNote: string; dragToStaff: string;
  treble: string; bass: string; mixed: string; objective: string;
  fromLang: string; toLang: string; randomPair: string;
}

type Dict = { pt: Locale; en: Locale; de: Locale };
const DICT: Dict = {
  pt: {
    appTitle: "Jogo Musical de Piano",
    cockpit: { language: "Língua", randomGame: "Jogo Aleatório", game: "Jogo", selectGame: "Selecionar jogo" },
    games: { noteReading: "Leitura de Notas", intervals: "Intervalos", dragNote: "Escrita de Notas", matchNotes: "Correspondência de Notas" },
    request: "Pedido",
    expected: "Esperado",
    guess: "Palpite",
    history: "Histórico",
    noneYet: "Ainda sem registos. Liga o modo Auto ou responde para adicionar entradas.",
    hour: "Hora",
    correctQ: "Certo?",
    score: "Pontuação",
    review: " Rever",
    actions: "Ações",
    clefLabel: "Clave",
    new: "Novo",
    startAuto: "Iniciar Auto (10s)",
    stopAuto: "Parar Auto (10s)",
    keyTime: "Tempo da Nota",
    manual: "Manual",
    autoOn: "Auto ligado",
    streakSuf: "seguidos",
    status: "Estado",
    hit: " Acertou",
    miss: " Falhou",
    targetNote: "Nota-alvo",
    dragToStaff: "Arrasta para a pauta",
    treble: "Clave de Sol (mão direita)",
    bass: "Clave de Fá (mão esquerda)",
    mixed: "Misto (alternado)",
    objective: "Objetivo: identificar a letra (C D E F G A B). Sem sustenidos neste modo. Teclado físico também funciona (c–b). Mostramos também os nomes em solfejo (Dó Ré Mi...).",
    fromLang: "De",
    toLang: "Para",
    randomPair: "Par Aleatório",
  },
  en: {
    appTitle: "Piano Learning Game",
    cockpit: { language: "Language", randomGame: "Random Game", game: "Game", selectGame: "Select game" },
    games: { noteReading: "Note Reading", intervals: "Intervals", dragNote: "Note Writing", matchNotes: "Note Matching" },
    request: "Prompt",
    expected: "Expected",
    guess: "Guess",
    history: "History",
    noneYet: "No entries yet. Turn on Auto or answer to add rows.",
    hour: "Time",
    correctQ: "Correct?",
    score: "Score",
    review: " Review",
    actions: "Actions",
    clefLabel: "Clef",
    new: "New",
    startAuto: "Start Auto (10s)",
    stopAuto: "Stop Auto (10s)",
    keyTime: "Note Time",
    manual: "Manual",
    autoOn: "Auto on",
    streakSuf: "in a row",
    status: "Status",
    hit: " Correct",
    miss: " Miss",
    targetNote: "Target note",
    dragToStaff: "Drag onto the staff",
    treble: "Treble clef (right hand)",
    bass: "Bass clef (left hand)",
    mixed: "Mixed (alternating)",
    objective: "Goal: identify the letter (C D E F G A B). No accidentals in this mode. Physical keyboard works (c–b). Solfège names are shown.",
    fromLang: "From",
    toLang: "To",
    randomPair: "Random Pair",
  },
  de: {
    appTitle: "Klavier Lernspiel",
    cockpit: { language: "Sprache", randomGame: "Zufallsspiel", game: "Spiel", selectGame: "Spiel wählen" },
    games: { noteReading: "Notenlesen", intervals: "Intervalle", dragNote: "Notenschreiben", matchNotes: "Noten-Zuordnung" },
    request: "Aufgabe",
    expected: "Erwartet",
    guess: "Eingabe",
    history: "Verlauf",
    noneYet: "Noch keine Einträge. Auto einschalten oder antworten, um Zeilen hinzuzufügen.",
    hour: "Zeit",
    correctQ: "Korrekt?",
    score: "Punktzahl",
    review: " Wiederholen",
    actions: "Aktionen",
    clefLabel: "Schlüssel",
    new: "Neu",
    startAuto: "Auto starten (10s)",
    stopAuto: "Auto stoppen (10s)",
    keyTime: "Notenzeit",
    manual: "Manuell",
    autoOn: "Auto an",
    streakSuf: "in Folge",
    status: "Status",
    hit: " Richtig",
    miss: " Falsch",
    targetNote: "Zielnote",
    dragToStaff: "Auf die Notenzeile ziehen",
    treble: "Violinschlüssel (rechte Hand)",
    bass: "Bassschlüssel (linke Hand)",
    mixed: "Gemischt (wechselnd)",
    objective: "Ziel: Den Buchstaben (C D E F G A H) erkennen. Keine Vorzeichen in diesem Modus. Tastatur (c–b) funktioniert. Solfège-Namen werden gezeigt.",
    fromLang: "Von",
    toLang: "Nach",
    randomPair: "Zufallspaar",
  },
};

type Lang = keyof Dict; // 'pt' | 'en' | 'de'
const LangCtx = createContext<{ lang: Lang; t: (k: string) => string }>({ lang: 'pt', t: (k) => k });
const useT = () => useContext(LangCtx).t;
const useLang = () => useContext(LangCtx).lang;

/********************** Constants ************************/
const LETTERS = ["C", "D", "E", "F", "G", "A", "B"] as const;
const SOLFEGE: Record<string, string> = { C: "Dó", D: "Ré", E: "Mi", F: "Fá", G: "Sol", A: "Lá", B: "Si" };
const TREBLE_NOTES = [
  "C4","D4","E4","F4","G4","A4","B4",
  "C5","D5","E5","F5","G5","A5","B5",
  "C6"
] as const; // C4..C6
const BASS_NOTES   = [
  "C2","D2","E2","F2","G2","A2","B2",
  "C3","D3","E3","F3","G3","A3","B3",
  "C4"
] as const; // C2..C4

type Clef = "treble" | "bass";

type HistoryRow = { ts: string; clef: Clef; note: string; expected?: string|null; guess?: string|null; correct: boolean; score: number };

type MatchHistoryRow = { ts: string; sourceLang: Lang; targetLang: Lang; prompt: string; expected: string; guess: string; correct: boolean; score: number };

/********************** Helpers ************************/
function randomFrom<T>(arr: readonly T[]): T { return arr[Math.floor(Math.random() * arr.length)]; }

function parseNote(n: string){
  const m = /^([A-G])(#?)([0-9])$/.exec(n);
  if (!m) return null;
  const letter = m[1] as string; const sharp = m[2] === "#"; const octave = parseInt(m[3],10);
  return { letter, sharp, octave };
}

function letterDisplay(letter: string, lang: string){ return (lang === 'de' && letter === 'B') ? 'H' : letter; }
function pairForButton(letter: string, lang: string){ return (lang === 'pt') ? { main: SOLFEGE[letter], sub: letterDisplay(letter, lang) } : { main: letterDisplay(letter, lang), sub: SOLFEGE[letter] }; }
function nameIn(lang: Lang, letter: string){ return lang==='pt' ? SOLFEGE[letter] : letterDisplay(letter, lang); }

function clefName(clef: Clef, lang: string){
  if (lang==='pt') return clef==='treble' ? 'Clave de Sol' : 'Clave de Fá';
  if (lang==='en') return clef==='treble' ? 'Treble clef' : 'Bass clef';
  if (lang==='de') return clef==='treble' ? 'Violinschlüssel' : 'Bassschlüssel';
  return clef;
}

/************ Staff (SVG) with optional draggable head ************/
function Staff({ clef, note, mini=false, draggable=false, onDragEnd }:{
  clef: Clef; note?: string|null; mini?: boolean; draggable?: boolean; onDragEnd?: (meta: { y:number; centerY:number; lineGap:number })=>void;
}){
  const width = mini ? 240 : 520;
  const height = mini ? 90 : 180;
  const leftMargin = mini ? 70 : 110;
  const rightMargin = mini ? 18 : 26;
  const lineGap = mini ? 10 : 14;
  const centerY = height / 2;
  const linesY = [0,1,2,3,4].map(i => centerY - (lineGap*2) + i*lineGap);
  const clefSymbol = clef === "treble" ? "𝄞" : "𝄢";
  const anchor = clef === "treble" ? "B4" : "D3";

  const stepsFromAnchor = (target: string) => {
    const a = parseNote(anchor), b = parseNote(target);
    if (!a || !b) return 0;
    const idx = (l: string) => ({C:0,D:1,E:2,F:3,G:4,A:5,B:6}[l]!);
    const letterDiff = (idx(b.letter) - idx(a.letter)) + 7 * (b.octave - a.octave);
    return letterDiff; // 1 step = half-space
  };

  const yForNote = (n: string) => centerY - stepsFromAnchor(n) * (lineGap / 2);

  const ledgerYs = (yy: number) => {
    const ys: number[] = [];
    const topLine = linesY[0], bottomLine = linesY[4];
    const distAbove = topLine - yy; // >0 if above staff
    const distBelow = yy - bottomLine; // >0 if below staff
    if (distAbove > 0) { const count = Math.floor(distAbove / lineGap); for (let k=1;k<=count;k++) ys.push(topLine - k*lineGap); }
    if (distBelow > 0) { const count = Math.floor(distBelow / lineGap); for (let k=1;k<=count;k++) ys.push(bottomLine + k*lineGap); }
    return ys;
  };

  // drag state (y only)
  const svgRef = useRef<SVGSVGElement|null>(null);
  const [dragY, setDragY] = useState(centerY);
  const [isDragging, setIsDragging] = useState(false);
  const dragStartYRef = useRef<number|null>(null);
  const dragOffsetRef = useRef<number>(0);
  const movedRef = useRef(false);

  const toLocalY = (svgY: number) => {
    // Clamp to allowed musical range per clef, using SVG coords
    const topNote = clef === 'treble' ? 'C6' : 'C4';
    const bottomNote = clef === 'treble' ? 'C4' : 'C2';
    const yTop = yForNote(topNote);
    const yBottom = yForNote(bottomNote);
    const yMin = Math.min(yTop, yBottom);
    const yMax = Math.max(yTop, yBottom);
    return Math.max(yMin, Math.min(yMax, svgY));
  };

  const toSvgPoint = (clientX: number, clientY: number) => {
    const svg = svgRef.current!;
    const pt = (svg as any).createSVGPoint ? (svg as any).createSVGPoint() : { x: 0, y: 0, matrixTransform: (m: any)=>({ x: clientX, y: clientY }) };
    pt.x = clientX; pt.y = clientY;
    const ctm = svg.getScreenCTM?.();
    if (ctm && (ctm as any).inverse) {
      const p = pt.matrixTransform((ctm as any).inverse());
      return { x: p.x as number, y: p.y as number };
    }
    // Fallback: approximate with bounding rect
    const rect = svg.getBoundingClientRect();
    const scaleX = (svg as any).viewBox?.baseVal?.width ? ( (svg as any).viewBox.baseVal.width / rect.width ) : 1;
    const scaleY = (svg as any).viewBox?.baseVal?.height ? ( (svg as any).viewBox.baseVal.height / rect.height ) : 1;
    return { x: (clientX - rect.left) * scaleX, y: (clientY - rect.top) * scaleY };
  };

  const getLocal = (e: PointerEvent | any) => {
    const cx = e.clientX ?? (e.touches?.[0]?.clientX || 0);
    const cy = e.clientY ?? (e.touches?.[0]?.clientY || 0);
    return toSvgPoint(cx, cy);
  };

  const isOverNoteHead = (x: number, y: number) => {
    const cx = (mini ? 240 : 520) / 2;
    const cy = dragY; // current drawnY
    const rx = (mini ? 8.5 : 10.5) * 1.4; // enlarge hitbox a bit for easier grab
    const ry = (mini ? 6 : 7.5) * 1.4;
    const nx = (x - cx) / rx;
    const ny = (y - cy) / ry;
    return (nx*nx + ny*ny) <= 1.0;
  };

  const onPointerDown = (e: React.PointerEvent<SVGSVGElement>) => {
    if (!draggable) return;
    const { x, y } = getLocal(e.nativeEvent);
    if (!isOverNoteHead(x, y)) return; // only drag starting on note head
    dragStartYRef.current = y;
    dragOffsetRef.current = y - dragY;
    movedRef.current = false;
    setIsDragging(true);
    svgRef.current?.setPointerCapture?.(e.pointerId);
    e.preventDefault();
  };

  const onPointerMove = (e: React.PointerEvent<SVGSVGElement>) => {
    if (!draggable || !isDragging) return;
    const { y } = getLocal(e.nativeEvent);
    const ny = toLocalY(y - dragOffsetRef.current);
    if (Math.abs(ny - (dragStartYRef.current ?? ny)) > 2) movedRef.current = true;
    setDragY(ny);
    e.preventDefault();
  };

  const onPointerUp = (e: React.PointerEvent<SVGSVGElement>) => {
    if (!draggable || !isDragging) return;
    setIsDragging(false);
    if (movedRef.current) {
      onDragEnd && onDragEnd({ y: dragY, centerY, lineGap });
    }
    movedRef.current = false;
    dragStartYRef.current = null;
    svgRef.current?.releasePointerCapture?.(e.pointerId);
    e.preventDefault();
  };

  useEffect(()=>{
    // Initialize drag position within the allowed range for the clef
    const topNote = clef === 'treble' ? 'C6' : 'C4';
    const bottomNote = clef === 'treble' ? 'C4' : 'C2';
    const yTop = yForNote(topNote);
    const yBottom = yForNote(bottomNote);
    const yMin = Math.min(yTop, yBottom);
    const yMax = Math.max(yTop, yBottom);
    const startY = Math.max(yMin, Math.min(yMax, centerY));
    setDragY(startY);
  }, [clef, mini]);

  const drawnY = note ? yForNote(note) : dragY;

  return (
    <svg
      ref={svgRef}
      viewBox={`0 0 ${width} ${height}`}
      className={`w-full h-auto select-none ${isDragging ? 'cursor-grabbing' : (draggable ? 'cursor-grab' : '')}`}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
    >
      {/* staff lines */}
      {linesY.map((yy,i)=>(<line key={i} x1={leftMargin} x2={width-rightMargin} y1={yy} y2={yy} stroke="#333" strokeWidth={mini?0.8:1} />))}
      {/* clef glyph */}
      <text x={leftMargin - (mini? 22 : 28)} y={centerY} fontSize={mini? 36 : 56} textAnchor="end" dominantBaseline="middle">{clefSymbol}</text>

      {/* ledger lines for the drawn note */}
      {ledgerYs(drawnY).map((yy,i)=>(<line key={`l${i}`} x1={width/2 - (mini?16:22)} x2={width/2 + (mini?16:22)} y1={yy} y2={yy} stroke="#333" strokeWidth={mini?0.8:1} />))}

      {/* note head */}
      <ellipse cx={width/2} cy={drawnY} rx={mini? 8.5 : 10.5} ry={mini? 6 : 7.5} fill="#111" transform={`rotate(-15 ${width/2} ${drawnY})`} />
    </svg>
  );
}

/********************** Beep ************************/
function useBeep(){
  const ctxRef = useRef<AudioContext|null>(null);
  const ensure = () => {
    if (!ctxRef.current){
      const Ctx: any = (window as any).AudioContext || (window as any).webkitAudioContext;
      if (Ctx) ctxRef.current = new Ctx();
    }
    return ctxRef.current;
  };
  return (freq=880, dur=0.06) => {
    const ctx = ensure();
    if (!ctx) return;
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.type = 'sine';
    o.frequency.value = freq;
    o.connect(g);
    g.connect(ctx.destination);
    const t = ctx.currentTime;
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(0.25, t + 0.01);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.start(t);
    o.stop(t + dur + 0.01);
  };
}

/********************** App Shell ************************/
function AppShell(){
  const [lang,setLang] = useState<Lang>('pt');
  const [gameKey,setGameKey] = useState<'noteReading'|'dragNote'|'matchNotes'>('noteReading');
  const t = (key: string)=> {
    const value = key.split('.').reduce<any>((o,k)=> (o ?? {})[k], DICT[lang]);
    return typeof value === 'string' ? value : key;
  };

  // restore prefs and optional ?lang=
  useEffect(()=>{
    try {
      const lsLang = localStorage.getItem('musicGame.lang');
      const lsGame = localStorage.getItem('musicGame.lastGame');
      if (lsLang && ['pt','en','de'].includes(lsLang)) setLang(lsLang as Lang);
      if (lsGame && ['noteReading','dragNote','matchNotes'].includes(lsGame)) setGameKey(lsGame as any);
    } catch {}
    const params = new URLSearchParams(window.location.search);
    const q = params.get('lang'); if (q && ['pt','en','de'].includes(q)) setLang(q as Lang);
  },[]);

  useEffect(()=>{ try { localStorage.setItem('musicGame.lang', lang); } catch {} }, [lang]);
  useEffect(()=>{ try { localStorage.setItem('musicGame.lastGame', gameKey); } catch {} }, [gameKey]);

  const games = [
    { key:'noteReading', name: t('games.noteReading'), component: <NoteReadingGame /> },
    { key:'dragNote', name: t('games.dragNote'), component: <DragNoteGame /> },
    { key:'matchNotes', name: t('games.matchNotes'), component: <MatchNotesGame /> },
  ] as const;

  function randomGame(){ setGameKey((randomFrom(games) as any).key); }

  const game = games.find((g:any)=> g.key===gameKey) || games[0];

  return (
    <LangCtx.Provider value={{ lang, t }}>
      <div className="min-h-screen w-full bg-gradient-to-b from-neutral-50 to-neutral-100 text-neutral-800 p-4">
        {/* Header */}
        <div className="max-w-6xl mx-auto mb-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="text-sm text-neutral-600">{t('cockpit.language')}:</span>
            {LANGS.map((l)=> (
              <button key={l.code}
                onClick={()=>setLang(l.code as Lang)}
                className={`px-3 py-1 rounded-full border shadow-sm ${lang===l.code? 'bg-neutral-900 text-white':'bg-white'}`}>
                <span className="mr-1">{l.flag}</span>{l.label}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-neutral-600">{t('cockpit.game')}:</span>
            <select value={gameKey} onChange={(e)=> setGameKey(e.target.value as any)} className="px-3 py-2 rounded-xl bg-white border shadow">
              {games.map((g:any)=> <option key={g.key} value={g.key}>{g.name}</option>)}
            </select>
            <button onClick={randomGame} className="px-3 py-2 rounded-xl bg-indigo-600 text-white shadow hover:bg-indigo-700">{t('cockpit.randomGame')}</button>
          </div>
        </div>

        {/* Game container */}
        <div className="max-w-6xl mx-auto">
          {game.component}
        </div>
      </div>
    </LangCtx.Provider>
  );
}

/****************** Game 1: Note Reading ******************/
function NoteReadingGame(){
  const { t } = useContext(LangCtx);
  const lang = useLang();
  const [mode, setMode] = useState<'treble'|'bass'|'mixed'>("mixed");
  const [current, setCurrent] = useState(()=> pickNote("mixed"));
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [feedback, setFeedback] = useState<null|'hit'|'miss'>(null);
  const [autoRun, setAutoRun] = useState(false);
  const PER_NOTE_SECONDS = 10;
  const [remaining, setRemaining] = useState(PER_NOTE_SECONDS);
  const tickRef = useRef<any>(null);
  const [history, setHistory] = useState<HistoryRow[]>([]);

  function pickNote(m: 'treble'|'bass'|'mixed'){
    const clef: Clef = m === 'bass' ? 'bass' : m === 'treble' ? 'treble' : (Math.random()<0.5 ? 'treble' : 'bass');
    const note = clef === 'treble' ? randomFrom(TREBLE_NOTES) : randomFrom(BASS_NOTES);
    return { clef, note };
  }
  function next(){ setCurrent(pickNote(mode)); setFeedback(null); setRemaining(PER_NOTE_SECONDS); }
  function pushHistory({ guess, correct }:{ guess: string|null; correct: boolean }){
    const expected = parseNote(current.note)?.letter ?? null;
    setHistory(h => [{ ts:new Date().toLocaleTimeString(), clef: current.clef, note: current.note, expected, guess, correct, score: correct ? (score+1) : score }, ...h]);
  }
  function onGuess(letter: string){
    const expected = parseNote(current.note)?.letter;
    if (!expected) return;
    const ok = (letter === expected);
    if (ok){ setScore(s=>s+1); setStreak(s=>s+1); setFeedback('hit'); }
    else { setStreak(0); setFeedback('miss'); }
    pushHistory({ guess: letter, correct: ok });
    setTimeout(next, 300);
  }

  useEffect(()=>{
    const h = (e: KeyboardEvent)=>{ const k = e.key.toLowerCase(); if (["c","d","e","f","g","a","b","h"].includes(k)){ const mapped = (k==='h')? 'B' : k.toUpperCase(); onGuess(mapped); } };
    window.addEventListener('keydown', h); return ()=> window.removeEventListener('keydown', h);
  }, [current, mode]);

  useEffect(()=>{
    if (!autoRun) return; tickRef.current = setInterval(()=>{ setRemaining(r=>{ if (r<=1){ setStreak(0); setFeedback('miss'); pushHistory({ guess:null, correct:false }); setTimeout(next,200); return PER_NOTE_SECONDS; } return r-1; }); }, 1000);
    return ()=> { clearInterval(tickRef.current); tickRef.current=null; };
  }, [autoRun, current, mode]);

  const toggleAuto = ()=> setAutoRun(a=>{ const n=!a; if(n) setRemaining(PER_NOTE_SECONDS); return n; });
  const review = (item: any)=>{ setAutoRun(false); setCurrent({ clef: item.clef, note: item.note }); setFeedback(null); setRemaining(PER_NOTE_SECONDS); };

  return (
    <div>
      <header className="mb-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <h1 className="text-2xl font-bold">{useContext(LangCtx).t('games.noteReading')}</h1>
        <div className="flex items-center gap-2">
          <select value={mode} onChange={(e)=>{ const m = e.target.value as any; setMode(m); setScore(0); setStreak(0); setFeedback(null); setCurrent(pickNote(m)); setRemaining(PER_NOTE_SECONDS); }} className="px-3 py-2 rounded-xl border border-neutral-300 bg-white shadow-sm">
            <option value="treble">{t('treble')}</option>
            <option value="bass">{t('bass')}</option>
            <option value="mixed">{t('mixed')}</option>
          </select>
          <button onClick={()=>{ setScore(0); setStreak(0); next(); }} className="px-4 py-2 rounded-2xl shadow bg-blue-600 text-white hover:bg-blue-700">{t('new')}</button>
          <button onClick={toggleAuto} className={`px-4 py-2 rounded-2xl shadow ${autoRun? 'bg-red-600 hover:bg-red-700':'bg-emerald-600 hover:bg-emerald-700'} text-white`}>{autoRun? t('stopAuto') : t('startAuto')}</button>
        </div>
      </header>

      <div className={`rounded-2xl bg-white shadow p-4 ${feedback==='hit'?'ring-2 ring-green-500': feedback==='miss'?'ring-2 ring-red-500':''}`}>
        <Staff clef={current.clef} note={current.note} />
      </div>

      <div className="grid md:grid-cols-4 gap-3 mb-4 mt-4">
        <Card label={t('clefLabel')} value={clefName(current.clef, lang)} />
        <Card label={t('score')} value={String(score)} hint={`${streak} ${t('streakSuf')}`} />
        <Card label={t('keyTime')} value={`${remaining}s`} hint={autoRun? t('autoOn'): t('manual')} />
        <Card label={t('status')} value={feedback? (feedback==='hit'? t('hit'): t('miss')) : '—'} />
      </div>

      <div className="mt-4 grid grid-cols-7 gap-2">
        {LETTERS.map((l)=>{ const p = pairForButton(l, lang); return (
          <button key={l} onClick={()=> onGuess(l)} className="px-3 py-3 rounded-xl bg-white border border-neutral-300 hover:border-neutral-400 shadow text-lg font-semibold flex items-center justify-center gap-1">
            <span className="text-lg font-semibold">{p.main}</span>
            <span className="text-xs text-neutral-500">({p.sub})</span>
          </button>
        ); })}
      </div>

      {/* History */}
      <div className="mt-6">
        <h2 className="text-lg font-semibold mb-2">{t('history')}</h2>
        {history.length===0 ? (<p className="text-sm text-neutral-500">{t('noneYet')}</p>) : (
          <div className="overflow-auto rounded-xl border border-neutral-200 bg-white shadow">
            <table className="min-w-full text-sm">
              <thead className="bg-neutral-50"><tr>
                <th className="text-left px-3 py-2">{t('hour')}</th>
                <th className="text-left px-3 py-2">{t('request')}</th>
                <th className="text-left px-3 py-2">{t('expected')}</th>
                <th className="text-left px-3 py-2">{t('guess')}</th>
                <th className="text-left px-3 py-2">{t('correctQ')}</th>
                <th className="text-left px-3 py-2">{t('score')}</th>
                <th className="text-left px-3 py-2">{t('actions')}</th>
              </tr></thead>
              <tbody>
                {history.map((h,i)=> (
                  <tr key={i} className="border-t align-top">
                    <td className="px-3 py-2 whitespace-nowrap">{h.ts}</td>
                    <td className="px-3 py-2"><div className="w-56"><Staff clef={h.clef} note={h.note} mini /></div><div className="text-xs text-neutral-600 mt-1">{clefName(h.clef, lang)} — {h.note}</div></td>
                    <td className="px-3 py-2">{h.expected ? `${letterDisplay(h.expected as string, lang)} (${SOLFEGE[h.expected as string]})` : '—'}</td>
                    <td className="px-3 py-2">{h.guess ? `${letterDisplay(h.guess as string, lang)} (${SOLFEGE[h.guess as string]})` : '—'}</td>
                    <td className="px-3 py-2">{h.correct ? '✓' : '✗'}</td>
                    <td className="px-3 py-2">{h.score}</td>
                    <td className="px-3 py-2"><button onClick={()=>review(h)} className="px-2 py-1 rounded-lg bg-neutral-800 text-white hover:bg-neutral-700">{t('review')}</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <footer className="mt-6 text-sm text-neutral-500"><p>{t('objective')}</p></footer>
    </div>
  );
}

/****************** Game 2: Note Writing (drag exact) ******************/
function stepsFromAnchorForClef(clef: Clef, note: string){
  const anchor = clef === 'treble' ? 'B4' : 'D3';
  const a = parseNote(anchor)!; const b = parseNote(note)!;
  const idx = (l: string) => ({C:0,D:1,E:2,F:3,G:4,A:5,B:6}[l]!);
  return (idx(b.letter) - idx(a.letter)) + 7 * (b.octave - a.octave);
}
function stepsToNote(clef: Clef, stepsFromAnchor: number){
  const order = ['C','D','E','F','G','A','B'];
  let curIdx = clef==='treble' ? order.indexOf('B') : order.indexOf('D');
  let oct = clef==='treble' ? 4 : 3;
  const stepSign = stepsFromAnchor >= 0 ? 1 : -1;
  for (let s=0; s!==stepsFromAnchor; s+=stepSign){
    curIdx += stepSign;
    if (curIdx===7){ curIdx=0; oct+=1; }
    if (curIdx===-1){ curIdx=6; oct-=1; }
  }
  return `${order[curIdx]}${oct}`;
}
const TREBLE_STEPS_ALLOWED = TREBLE_NOTES.map(n=> stepsFromAnchorForClef('treble', n));
const BASS_STEPS_ALLOWED   = BASS_NOTES.map(n=> stepsFromAnchorForClef('bass', n));

function nearestAllowedNoteByY(clef: Clef, y: number, centerY: number, lineGap: number){
  const rawSteps = Math.round((centerY - y) * 2 / lineGap);
  const allowed = clef==='treble' ? TREBLE_STEPS_ALLOWED : BASS_STEPS_ALLOWED;
  let best = allowed[0]; let bestDist = Math.abs(rawSteps - best);
  for (const s of allowed){ const d = Math.abs(rawSteps - s); if (d < bestDist){ best = s; bestDist = d; } }
  const note = stepsToNote(clef, best);
  return { note, steps: best };
}

function DragNoteGame(){
  const { t } = useContext(LangCtx);
  const lang = useLang();
  const [mode, setMode] = useState<'treble'|'bass'|'mixed'>('mixed');

  // consistent first round
  const initClef: Clef = (Math.random()<0.5? 'treble':'bass');
  const [clef, setClef] = useState<Clef>(initClef);
  const [target, setTarget] = useState<string>(initClef==='treble' ? (randomFrom(TREBLE_NOTES as any) as string) : (randomFrom(BASS_NOTES as any) as string));

  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [feedback, setFeedback] = useState<null|'hit'|'miss'>(null);
  const [history, setHistory] = useState<HistoryRow[]>([]);
  const beep = useBeep();

  // AUTO mode (like NoteReading)
  const PER_NOTE_SECONDS = 10;
  const [autoRun, setAutoRun] = useState(false);
  const [remaining, setRemaining] = useState(PER_NOTE_SECONDS);
  const tickRef = useRef<any>(null);

  function nextRound(m: 'treble'|'bass'|'mixed'){
    const c: Clef = m==='bass'? 'bass' : m==='treble'? 'treble' : (Math.random()<0.5? 'treble':'bass');
    const nextTarget = c==='treble' ? (randomFrom(TREBLE_NOTES as any) as string) : (randomFrom(BASS_NOTES as any) as string);
    setClef(c);
    setTarget(nextTarget);
    setFeedback(null);
    setRemaining(PER_NOTE_SECONDS);
  }

  function handleDrop(meta: { y:number; centerY:number; lineGap:number }){
    const { note } = nearestAllowedNoteByY(clef, meta.y, meta.centerY, meta.lineGap);
    const expected = target; const guess = note; const ok = (guess === expected);
    if (ok){ setScore(s=>s+1); setStreak(s=>s+1); setFeedback('hit'); beep(1046.5, 0.07); }
    else { setStreak(0); setFeedback('miss'); beep(196, 0.08); }
    const row: HistoryRow = { ts:new Date().toLocaleTimeString(), clef, note: expected, expected, guess, correct: ok, score: ok? (score+1) : score } as any;
    setHistory(h => [row, ...h]);
    setTimeout(()=> nextRound(mode), 250);
  }

  const toggleAuto = ()=> setAutoRun(a=>{ const n=!a; if(n) setRemaining(PER_NOTE_SECONDS); return n; });

  useEffect(()=>{
    if (!autoRun) return;
    tickRef.current = setInterval(()=>{
      setRemaining(r => {
        if (r <= 1){
          const row: HistoryRow = { ts:new Date().toLocaleTimeString(), clef, note: target, expected: target, guess: null, correct: false, score } as any;
          setStreak(0);
          setFeedback('miss');
          setHistory(h => [row, ...h]);
          setTimeout(()=> nextRound(mode), 150);
          return PER_NOTE_SECONDS;
        }
        return r - 1;
      });
    }, 1000);
    return ()=> { clearInterval(tickRef.current); tickRef.current = null; };
  }, [autoRun, target, clef, mode, score]);

  return (
    <div>
      <header className="mb-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <h1 className="text-2xl font-bold">{t('games.dragNote')}</h1>
        <div className="flex items-center gap-2">
          <select value={mode} onChange={(e)=>{ const m = e.target.value as any; setMode(m); nextRound(m); }} className="px-3 py-2 rounded-xl border border-neutral-300 bg-white shadow-sm">
            <option value="treble">{t('treble')}</option>
            <option value="bass">{t('bass')}</option>
            <option value="mixed">{t('mixed')}</option>
          </select>
          <button onClick={()=> nextRound(mode)} className="px-4 py-2 rounded-2xl shadow bg-blue-600 text-white hover:bg-blue-700">{t('new')}</button>
          <button onClick={toggleAuto} className={`px-4 py-2 rounded-2xl shadow ${autoRun? 'bg-red-600 hover:bg-red-700':'bg-emerald-600 hover:bg-emerald-700'} text-white`}>{autoRun? t('stopAuto') : t('startAuto')}</button>
        </div>
      </header>

      <div className={`rounded-2xl bg-white shadow p-4 ${feedback==='hit'?'ring-2 ring-green-500': feedback==='miss'?'ring-2 ring-red-500':''}`}>
        <div className="grid md:grid-cols-4 gap-3 mb-4">
          <Card label={t('clefLabel')} value={clefName(clef, lang)} />
          <Card label={t('targetNote')} value={`${target}`} hint={`${letterDisplay(parseNote(target)!.letter, lang)} (${SOLFEGE[parseNote(target)!.letter]})`} />
          <Card label={t('score')} value={String(score)} hint={`${streak} ${t('streakSuf')}`} />
          <Card label={t('keyTime')} value={`${remaining}s`} hint={autoRun? t('autoOn'): t('manual')} />
        </div>

        <div className="rounded-2xl border border-neutral-200 overflow-hidden">
          <div className="p-3"><Staff clef={clef} note={null} draggable onDragEnd={handleDrop} /></div>
          <div className="px-4 pb-3 text-sm text-neutral-500">{t('dragToStaff')}</div>
        </div>

        {/* History */}
        <div className="mt-6">
          <h2 className="text-lg font-semibold mb-2">{t('history')}</h2>
          {history.length===0 ? (<p className="text-sm text-neutral-500">{t('noneYet')}</p>) : (
            <div className="overflow-auto rounded-xl border border-neutral-200 bg-white shadow">
              <table className="min-w-full text-sm">
                <thead className="bg-neutral-50"><tr>
                  <th className="text-left px-3 py-2">{t('hour')}</th>
                  <th className="text-left px-3 py-2">{t('request')}</th>
                  <th className="text-left px-3 py-2">{t('expected')}</th>
                  <th className="text-left px-3 py-2">{t('guess')}</th>
                  <th className="text-left px-3 py-2">{t('correctQ')}</th>
                  <th className="text-left px-3 py-2">{t('score')}</th>
                </tr></thead>
                <tbody>
                  {history.map((h,i)=> (
                    <tr key={i} className="border-t align-top">
                      <td className="px-3 py-2 whitespace-nowrap">{h.ts}</td>
                      <td className="px-3 py-2"><div className="w-56"><Staff clef={h.clef} note={h.note!} mini /></div><div className="text-xs text-neutral-600 mt-1">{clefName(h.clef, lang)} — {h.note}</div></td>
                      <td className="px-3 py-2">{h.expected}</td>
                      <td className="px-3 py-2">{h.guess ? (<><div className="w-56"><Staff clef={h.clef} note={h.guess} mini /></div><div className="text-xs text-neutral-600 mt-1">{h.guess}</div></>) : '—'}</td>
                      <td className="px-3 py-2">{h.correct ? '✓' : '✗'}</td>
                      <td className="px-3 py-2">{h.score}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/****************** Game 3: Note Matching (text only) ******************/
function MatchNotesGame(){
  const { t } = useContext(LangCtx);
  const uiLang = useLang();
  const [sourceLang, setSourceLang] = useState<Lang>('en');
  const [targetLang, setTargetLang] = useState<Lang>(uiLang);
  const [letter, setLetter] = useState<string>(randomFrom(LETTERS as any) as string);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [feedback, setFeedback] = useState<null|'hit'|'miss'>(null);
  const [history, setHistory] = useState<MatchHistoryRow[]>([]);

  useEffect(()=>{ // keep target default in sync with UI language if user hasn't changed it
    setTargetLang((prev)=> prev);
  }, [uiLang]);

  function ensureDifferent(a: Lang, b: Lang): [Lang, Lang]{
    if (a !== b) return [a,b];
    // choose the next different target automatically
    const idx = LANG_CODES.indexOf(a);
    const next = LANG_CODES[(idx+1)%LANG_CODES.length];
    return [a, next as Lang];
  }

  function setFrom(a: Lang){ const [s,tg] = ensureDifferent(a, targetLang); setSourceLang(s); setTargetLang(tg); }
  function setTo(b: Lang){ const [s,tg] = ensureDifferent(sourceLang, b); setSourceLang(s); setTargetLang(tg); }

  function randomPair(){
    let s = randomFrom(LANG_CODES);
    let t = randomFrom(LANG_CODES);
    if (s === t){ t = LANG_CODES[(LANG_CODES.indexOf(s)+1)%LANG_CODES.length]; }
    setSourceLang(s as Lang); setTargetLang(t as Lang);
  }

  function next(){
    setLetter(randomFrom(LETTERS as any) as string);
    setFeedback(null);
  }

  const expected = nameIn(targetLang, letter);
  const prompt = nameIn(sourceLang, letter);

  function onGuess(ans: string){
    const ok = (ans === expected);
    if (ok){ setScore(s=>s+1); setStreak(s=>s+1); setFeedback('hit'); }
    else { setStreak(0); setFeedback('miss'); }
    const label = (code: Lang)=> code.toUpperCase();
    const row: MatchHistoryRow = { ts:new Date().toLocaleTimeString(), sourceLang, targetLang, prompt: `${prompt} [${label(sourceLang)}→${label(targetLang)}]`, expected, guess: ans, correct: ok, score: ok? (score+1) : score };
    setHistory(h=> [row, ...h]);
    setTimeout(next, 250);
  }

  return (
    <div>
      <header className="mb-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <h1 className="text-2xl font-bold">{t('games.matchNotes')}</h1>
        <div className="flex items-center gap-2">
          {/* Pair selectors */}
          <label className="text-sm text-neutral-600">{t('fromLang')}:</label>
          <select value={sourceLang} onChange={(e)=> setFrom(e.target.value as Lang)} className="px-3 py-2 rounded-xl bg-white border shadow">
            {LANGS.map(L=> <option key={L.code} value={L.code as Lang}>{L.flag} {L.label}</option>)}
          </select>
          <span className="mx-1">→</span>
          <label className="text-sm text-neutral-600">{t('toLang')}:</label>
          <select value={targetLang} onChange={(e)=> setTo(e.target.value as Lang)} className="px-3 py-2 rounded-xl bg-white border shadow">
            {LANGS.map(L=> <option key={L.code} value={L.code as Lang}>{L.flag} {L.label}</option>)}
          </select>
          <button onClick={randomPair} className="px-3 py-2 rounded-xl bg-amber-600 text-white shadow hover:bg-amber-700">{t('randomPair')}</button>
          <button onClick={next} className="px-3 py-2 rounded-xl bg-blue-600 text-white shadow hover:bg-blue-700">{t('new')}</button>
        </div>
      </header>

      <div className={`rounded-2xl bg-white shadow p-6 text-center ${feedback==='hit'?'ring-2 ring-green-500': feedback==='miss'?'ring-2 ring-red-500':''}`}>
        <div className="text-sm text-neutral-500 mb-2">{t('request')}</div>
        <div className="text-4xl font-bold mb-4">{prompt}</div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 max-w-xl mx-auto">
          {(LETTERS as any).map((L: string)=> (
            <button key={L} onClick={()=> onGuess(nameIn(targetLang, L))} className="px-3 py-3 rounded-xl bg-white border border-neutral-300 hover:border-neutral-400 shadow text-lg font-semibold">
              {nameIn(targetLang, L)}
            </button>
          ))}
        </div>
      </div>

      {/* History */}
      <div className="mt-6">
        <h2 className="text-lg font-semibold mb-2">{t('history')}</h2>
        {history.length===0 ? (<p className="text-sm text-neutral-500">{t('noneYet')}</p>) : (
          <div className="overflow-auto rounded-xl border border-neutral-200 bg-white shadow">
            <table className="min-w-full text-sm">
              <thead className="bg-neutral-50"><tr>
                <th className="text-left px-3 py-2">{t('hour')}</th>
                <th className="text-left px-3 py-2">{t('request')}</th>
                <th className="text-left px-3 py-2">{t('expected')}</th>
                <th className="text-left px-3 py-2">{t('guess')}</th>
                <th className="text-left px-3 py-2">{t('correctQ')}</th>
                <th className="text-left px-3 py-2">{t('score')}</th>
              </tr></thead>
              <tbody>
                {history.map((h,i)=> (
                  <tr key={i} className="border-t align-top">
                    <td className="px-3 py-2 whitespace-nowrap">{h.ts}</td>
                    <td className="px-3 py-2">{h.prompt}</td>
                    <td className="px-3 py-2">{h.expected}</td>
                    <td className="px-3 py-2">{h.guess}</td>
                    <td className="px-3 py-2">{h.correct ? '✓' : '✗'}</td>
                    <td className="px-3 py-2">{h.score}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

/********************** Small Card ************************/
function Card({ label, value, hint }:{ label: string; value: string; hint?: string }){
  return (
    <div className="rounded-2xl p-4 shadow bg-white">
      <div className="text-xs uppercase tracking-wide text-neutral-500">{label}</div>
      <div className="text-xl font-semibold mt-1">{value}</div>
      {hint && <div className="text-xs text-neutral-500 mt-1">{hint}</div>}
    </div>
  );
}

/********************** Export ************************/
export default function App() {
  return (
    <>
      <GlobalStyles />
      <AppShell />
    </>
  );
}

/********************** Self-checks (light tests) ************************/
(function devSelfChecks(){
  try {
    console.assert(LETTERS.length === 7, 'LETTERS should have 7 entries');
    console.assert(TREBLE_NOTES[0] === 'C4', 'Treble range should start at C4');
    console.assert(TREBLE_NOTES[TREBLE_NOTES.length-1] === 'C6', 'Treble range should end at C6');
    console.assert(BASS_NOTES[0] === 'C2', 'Bass range should start at C2');
    console.assert(BASS_NOTES[BASS_NOTES.length-1] === 'C4', 'Bass range should end at C4');
    const i18nOk = DICT?.pt?.games?.dragNote && DICT?.en?.games?.dragNote && DICT?.de?.games?.dragNote && DICT?.pt?.games?.matchNotes;
    console.assert(!!i18nOk, 'i18n keys for games present in PT/EN/DE');
    // DE mapping check
    console.assert(letterDisplay('B','de') === 'H', 'German mapping B→H');
    // Match pair sanity
    const nm = nameIn('de','B');
    console.assert(nm==='H', 'nameIn should map de B→H');
  } catch (err) {
    console.error('Self-check failed:', err);
  }
})();
