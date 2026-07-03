import React, { useState, useEffect, useRef } from "react";
import {
  ChevronLeft, Bell, Menu, SlidersHorizontal, Plus, ClipboardList,
  CheckCircle2, XCircle, Star, Flame, Home as HomeIcon, Calendar as CalendarIcon,
  BarChart3, User, ChevronRight, Eye, EyeOff, Mail, Quote as QuoteIcon,
  Play, Pause, RotateCcw, LogOut, Target, AlertTriangle, Trophy, X
} from "lucide-react";

/* ------------------------------------------------------------------ */
/* MOCK DATA                                                           */
/* ------------------------------------------------------------------ */

const PRIORITY_STYLES = {
  High: { text: "#F87171", dot: "#EF4444" },
  Medium: { text: "#FBBF24", dot: "#F59E0B" },
  Low: { text: "#4ADE80", dot: "#22C55E" },
};

const initialTasks = [
  { id: 1, title: "Maths Practice", time: "9:00 AM - 10:00 AM", priority: "Medium", done: false },
  { id: 2, title: "Workout", time: "10:30 AM - 11:30 AM", priority: "High", done: false },
  { id: 3, title: "Physics Revision", time: "12:00 PM - 1:00 PM", priority: "Medium", done: false },
  { id: 4, title: "Read Book", time: "4:00 PM - 5:00 PM", priority: "Low", done: true },
  { id: 5, title: "Code Practice", time: "7:00 PM - 8:30 PM", priority: "High", done: false },
  { id: 6, title: "Plan Tomorrow", time: "9:00 PM - 9:30 PM", priority: "Low", done: false },
];

const initialNotifications = [
  { id: 1, title: "Workout starts in 30 minutes", sub: "10:30 AM - 11:30 AM", read: false, type: "reminder" },
  { id: 2, title: "You missed Physics Revision yesterday", sub: "Reschedule it from Planner", read: false, type: "missed" },
  { id: 3, title: "7 day streak! Keep it up 🔥", sub: "Complete a task today to extend it", read: false, type: "streak" },
  { id: 4, title: "You earned 20 points", sub: "For completing 'Read Book'", read: true, type: "points" },
];

const streakDots = ["S", "M", "T", "W", "T", "F", "S"];
const streakFilled = [false, true, true, true, true, true, false];
const streakToday = 5;

const CALENDAR_DOT_DAYS = { 1: "#3B82F6", 3: "#22C55E", 5: "#EF4444", 8: "#F59E0B", 11: "#3B82F6", 15: "#22C55E", 18: "#EF4444", 22: "#3B82F6", 25: "#22C55E", 28: "#F59E0B" };

const DEMO_DAY_POOL = [
  [{ title: "Team Meeting", time: "10:00 AM - 11:00 AM", color: "#3B82F6" }],
  [{ title: "Grocery Shopping", time: "5:00 PM - 6:00 PM", color: "#22C55E" }],
  [{ title: "Doctor Appointment", time: "2:00 PM - 2:30 PM", color: "#EF4444" }],
  [],
];

const analyticsWeek = [
  { day: "Mon", v: 20 }, { day: "Tue", v: 62 }, { day: "Wed", v: 78 },
  { day: "Thu", v: 40 }, { day: "Fri", v: 70 }, { day: "Sat", v: 50 }, { day: "Sun", v: 78 },
];

const heatmapRows = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const heatmapCols = 6;
function seedHeat(r, c) {
  return Math.abs(Math.sin(r * 3.1 + c * 1.7));
}

const goalsData = {
  Daily: [
    { title: "Study 4 Hours", sub: "3.2 / 4 Hours", pct: 80, color: "#3B82F6" },
    { title: "Workout", sub: "45 / 60 Min", pct: 75, color: "#22C55E" },
    { title: "Read 20 Pages", sub: "12 / 20 Pages", pct: 60, color: "#F59E0B" },
    { title: "No Junk Food", sub: "1 / 1 Day", pct: 100, color: "#22C55E" },
  ],
  Weekly: [
    { title: "Study 28 Hours", sub: "18 / 28 Hours", pct: 64, color: "#3B82F6" },
    { title: "Workout 5x", sub: "3 / 5 Sessions", pct: 60, color: "#22C55E" },
  ],
  Monthly: [{ title: "Read 4 Books", sub: "2 / 4 Books", pct: 50, color: "#F59E0B" }],
  Yearly: [{ title: "Save ₹1,00,000", sub: "₹42,000 / ₹1,00,000", pct: 42, color: "#3B82F6" }],
};

const FOCUS_PRESETS = [
  { label: "15 min", secs: 15 * 60 },
  { label: "25 min", secs: 25 * 60 },
  { label: "45 min", secs: 45 * 60 },
];

const TOTAL_TASKS_BASE = 18;

/* ------------------------------------------------------------------ */
/* TIME HELPERS                                                        */
/* ------------------------------------------------------------------ */

function getGreeting(hour) {
  if (hour < 12) return "Good Morning";
  if (hour < 17) return "Good Afternoon";
  if (hour < 21) return "Good Evening";
  return "Good Night";
}
function getGreetingEmoji(hour) {
  if (hour < 12) return "👋";
  if (hour < 17) return "☀️";
  if (hour < 21) return "🌇";
  return "🌙";
}
function useNow() {
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 30000);
    return () => clearInterval(t);
  }, []);
  return now;
}
function formatMMSS(totalSec) {
  const m = Math.floor(totalSec / 60).toString().padStart(2, "0");
  const s = Math.floor(totalSec % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
}
function formatTime12(hhmm) {
  if (!hhmm) return "";
  let [h, m] = hhmm.split(":").map(Number);
  const ampm = h >= 12 ? "PM" : "AM";
  h = h % 12 || 12;
  return `${h}:${m.toString().padStart(2, "0")} ${ampm}`;
}
function sameDay(a, b) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}
function getMonthMatrix(monthDate) {
  const year = monthDate.getFullYear();
  const month = monthDate.getMonth();
  const firstDay = new Date(year, month, 1);
  const startWeekday = (firstDay.getDay() + 6) % 7; // Monday = 0
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrevMonth = new Date(year, month, 0).getDate();
  const cells = [];
  for (let i = startWeekday - 1; i >= 0; i--) {
    cells.push({ day: daysInPrevMonth - i, curMonth: false, date: new Date(year, month - 1, daysInPrevMonth - i) });
  }
  for (let d = 1; d <= daysInMonth; d++) {
    cells.push({ day: d, curMonth: true, date: new Date(year, month, d) });
  }
  let nextDay = 1;
  while (cells.length % 7 !== 0) {
    cells.push({ day: nextDay, curMonth: false, date: new Date(year, month + 1, nextDay) });
    nextDay++;
  }
  const weeks = [];
  for (let i = 0; i < cells.length; i += 7) weeks.push(cells.slice(i, i + 7));
  return weeks;
}

/* ------------------------------------------------------------------ */
/* 3D GLOSSY ICON HELPER                                                */
/* ------------------------------------------------------------------ */

function glossyStyle(bg) {
  return {
    backgroundColor: bg,
    backgroundImage: "linear-gradient(150deg, rgba(255,255,255,0.45) 0%, rgba(255,255,255,0.05) 45%, rgba(0,0,0,0.12) 100%)",
    boxShadow: `0 6px 14px -4px ${bg}99, inset 0 -3px 5px rgba(0,0,0,0.28), inset 0 2px 2px rgba(255,255,255,0.45)`,
  };
}

function Icon3D({ icon: Icon, bg, size = 16, box = 36, iconColor = "#fff" }) {
  return (
    <div
      className="rounded-xl flex items-center justify-center shrink-0"
      style={{ width: box, height: box, ...glossyStyle(bg) }}
    >
      <Icon size={size} style={{ color: iconColor, filter: "drop-shadow(0 1px 1px rgba(0,0,0,0.35))" }} />
    </div>
  );
}

const CARD = "bg-slate-900 border border-slate-800 rounded-2xl shadow-lg shadow-black/40";

/* ------------------------------------------------------------------ */
/* SHARED UI PIECES                                                    */
/* ------------------------------------------------------------------ */

function Screen({ children }) {
  return (
    <div className="min-h-[100dvh] w-full flex items-center justify-center bg-slate-950 sm:py-6">
      <div className="w-full h-[100dvh] sm:h-[760px] sm:w-[380px] sm:max-h-[92vh] bg-slate-950 text-slate-100 sm:rounded-[36px] sm:border sm:border-slate-800 sm:shadow-2xl overflow-hidden flex flex-col relative">
        {children}
      </div>
    </div>
  );
}

function TopBar({ title, onBack, right }) {
  return (
    <div className="flex items-center justify-between px-5 pt-6 pb-2">
      <button onClick={onBack} className="w-9 h-9 rounded-full flex items-center justify-center bg-slate-900/60 hover:bg-slate-800 transition">
        <ChevronLeft size={18} />
      </button>
      <h1 className="text-[17px] font-semibold">{title}</h1>
      <div className="w-9 h-9 flex items-center justify-center">{right}</div>
    </div>
  );
}

function BottomNav({ page, setPage }) {
  const items = [
    { key: "home", label: "Home", icon: HomeIcon },
    { key: "planner", label: "Planner", icon: ClipboardList },
    { key: "calendar", label: "Calendar", icon: CalendarIcon },
    { key: "analytics", label: "Analytics", icon: BarChart3 },
    { key: "goals", label: "Profile", icon: User },
  ];
  return (
    <div
      className="mt-auto border-t border-slate-800 bg-slate-950/95 backdrop-blur px-2 pt-2 flex justify-between shrink-0"
      style={{ paddingBottom: "max(1rem, env(safe-area-inset-bottom))" }}
    >
      {items.map(({ key, label, icon: Icon }) => {
        const active = page === key;
        return (
          <button key={key} onClick={() => setPage(key)} className="flex-1 flex flex-col items-center gap-1 py-1">
            <Icon size={20} strokeWidth={2.2} color={active ? "#3B82F6" : "#64748B"} />
            <span className="text-[10px]" style={{ color: active ? "#3B82F6" : "#64748B", fontWeight: active ? 600 : 400 }}>
              {label}
            </span>
          </button>
        );
      })}
    </div>
  );
}

function CircularProgress({ pct, color, size = 64, stroke = 6 }) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const offset = c - (Math.min(100, Math.max(0, pct)) / 100) * c;
  return (
    <svg width={size} height={size} className="-rotate-90">
      <circle cx={size / 2} cy={size / 2} r={r} stroke="#1E293B" strokeWidth={stroke} fill="none" />
      <circle cx={size / 2} cy={size / 2} r={r} stroke={color} strokeWidth={stroke} fill="none"
        strokeDasharray={c} strokeDashoffset={offset} strokeLinecap="round"
        style={{ transition: "stroke-dashoffset 0.6s ease" }} />
    </svg>
  );
}

function Toast({ message }) {
  if (!message) return null;
  return (
    <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50 bg-slate-800 border border-slate-700 text-slate-100 text-xs px-4 py-2 rounded-full shadow-lg whitespace-nowrap">
      {message}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* LOGIN / SIGNUP PAGE                                                  */
/* ------------------------------------------------------------------ */

function LoginPage({ onLogin }) {
  const [mode, setMode] = useState("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [errors, setErrors] = useState({});
  const [forgotMsg, setForgotMsg] = useState("");
  const [toast, setToast] = useState("");

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(""), 2200);
    return () => clearTimeout(t);
  }, [toast]);

  const emailValid = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) || (!v.includes("@") && v.trim().length >= 3);

  function validate() {
    const e = {};
    if (mode === "signup" && !name.trim()) e.name = "Enter your name";
    if (!email.trim()) e.email = "Enter your email or username";
    else if (mode === "signup" && !emailValid(email)) e.email = "Enter a valid email";
    if (!password) e.password = "Enter your password";
    else if (password.length < 4) e.password = "Password must be at least 4 characters";
    if (mode === "signup" && confirm !== password) e.confirm = "Passwords do not match";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function handleSubmit() {
    if (!validate()) return;
    const displayName = mode === "signup" && name.trim()
      ? name.trim().split(" ")[0]
      : email.split("@")[0].replace(/[^a-zA-Z]/g, "") || "there";
    onLogin({ name: displayName.charAt(0).toUpperCase() + displayName.slice(1), email });
  }

  function handleGoogle() {
    setToast("Signed in with Google (demo)");
    setTimeout(() => onLogin({ name: "Guest", email: "guest@google.com" }), 700);
  }

  function handleForgot() {
    if (!email.trim()) {
      setErrors((e) => ({ ...e, email: "Enter your email first" }));
      return;
    }
    setForgotMsg(`Reset link sent to ${email}`);
    setTimeout(() => setForgotMsg(""), 3000);
  }

  return (
    <div className="flex-1 flex flex-col px-6 pt-14 pb-8 overflow-y-auto relative">
      <Toast message={toast} />
      <div className="flex justify-center mb-6">
        <div
          className="relative w-32 h-32 rounded-full flex items-center justify-center"
          style={{ background: "radial-gradient(circle at 35% 30%, rgba(59,130,246,0.35), rgba(30,41,59,0.05) 70%)" }}
        >
          <div
            className="w-20 h-24 rounded-lg flex flex-col items-center pt-5 gap-2 relative"
            style={{
              background: "linear-gradient(160deg, #E2E8F0, #CBD5E1)",
              boxShadow: "0 12px 24px -6px rgba(0,0,0,0.55), inset 0 2px 2px rgba(255,255,255,0.7), inset 0 -3px 5px rgba(0,0,0,0.15)",
            }}
          >
            <div
              className="absolute -top-3 w-9 h-4 rounded-sm"
              style={{ background: "linear-gradient(160deg,#60A5FA,#2563EB)", boxShadow: "0 3px 6px rgba(37,99,235,0.6)" }}
            />
            {[0, 1, 2].map((i) => (
              <div key={i} className="w-14 h-3 rounded-sm flex items-center px-1"
                style={{ background: "linear-gradient(160deg,#4ADE80,#16A34A)", boxShadow: "inset 0 1px 1px rgba(255,255,255,0.5)" }}>
                <CheckCircle2 size={9} className="text-white" />
              </div>
            ))}
          </div>
          <Bell
            size={24}
            className="absolute top-1 right-3 text-amber-400"
            fill="#F59E0B"
            style={{ filter: "drop-shadow(0 4px 6px rgba(245,158,11,0.6))", transform: "rotate(12deg)" }}
          />
        </div>
      </div>

      <h1 className="text-2xl font-bold text-center">{mode === "login" ? "Welcome Back!" : "Create Account"}</h1>
      <p className="text-slate-400 text-center text-sm mt-2 leading-relaxed">
        {mode === "login"
          ? <>Plan your tasks, achieve your goals<br />and be your best version.</>
          : <>Start planning today and build<br />habits that stick.</>}
      </p>

      <div className="mt-8 flex flex-col gap-3.5">
        {mode === "signup" && (
          <div>
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Full Name"
              className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-sm placeholder:text-slate-500 outline-none focus:border-blue-500" />
            {errors.name && <p className="text-red-400 text-[11px] mt-1 ml-1">{errors.name}</p>}
          </div>
        )}

        <div>
          <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email or Username"
            className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-sm placeholder:text-slate-500 outline-none focus:border-blue-500" />
          {errors.email && <p className="text-red-400 text-[11px] mt-1 ml-1">{errors.email}</p>}
        </div>

        <div>
          <div className="relative">
            <input type={showPw ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password"
              className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-sm placeholder:text-slate-500 outline-none focus:border-blue-500" />
            <button onClick={() => setShowPw((s) => !s)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500">
              {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          {errors.password && <p className="text-red-400 text-[11px] mt-1 ml-1">{errors.password}</p>}
        </div>

        {mode === "signup" && (
          <div>
            <input type={showPw ? "text" : "password"} value={confirm} onChange={(e) => setConfirm(e.target.value)} placeholder="Confirm Password"
              className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-sm placeholder:text-slate-500 outline-none focus:border-blue-500" />
            {errors.confirm && <p className="text-red-400 text-[11px] mt-1 ml-1">{errors.confirm}</p>}
          </div>
        )}

        {mode === "login" && (
          <div className="-mt-1">
            <button onClick={handleForgot} className="text-blue-400 text-xs text-left">Forgot Password?</button>
            {forgotMsg && <p className="text-emerald-400 text-[11px] mt-1">{forgotMsg}</p>}
          </div>
        )}

        <button onClick={handleSubmit} className="bg-blue-600 hover:bg-blue-500 transition text-white font-semibold rounded-xl py-3 mt-1 shadow-lg shadow-blue-900/40">
          {mode === "login" ? "Login" : "Sign Up"}
        </button>

        <div className="flex items-center gap-3 my-1">
          <div className="h-px bg-slate-800 flex-1" />
          <span className="text-slate-500 text-xs">or continue with</span>
          <div className="h-px bg-slate-800 flex-1" />
        </div>

        <div className="flex gap-3">
          <button onClick={handleGoogle} className="flex-1 flex items-center justify-center gap-2 bg-slate-900 border border-slate-800 rounded-xl py-2.5 text-sm hover:bg-slate-800 transition">
            <span className="font-bold text-[15px]" style={{ color: "#EA4335" }}>G</span> Google
          </button>
          <button onClick={handleSubmit} className="flex-1 flex items-center justify-center gap-2 bg-slate-900 border border-slate-800 rounded-xl py-2.5 text-sm hover:bg-slate-800 transition">
            <Mail size={15} /> Email
          </button>
        </div>

        <p className="text-center text-xs text-slate-400 mt-2">
          {mode === "login" ? "Don't have an account? " : "Already have an account? "}
          <button onClick={() => { setMode(mode === "login" ? "signup" : "login"); setErrors({}); }} className="text-blue-400 font-medium">
            {mode === "login" ? "Sign Up" : "Login"}
          </button>
        </p>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* NOTIFICATIONS PANEL                                                  */
/* ------------------------------------------------------------------ */

const NOTIF_ICON = { reminder: Bell, missed: AlertTriangle, streak: Flame, points: Trophy };
const NOTIF_COLOR = { reminder: "#3B82F6", missed: "#EF4444", streak: "#F59E0B", points: "#F5B400" };

function NotificationsPanel({ notifications, onMarkAllRead, onMarkRead, onClose }) {
  return (
    <>
      <div className="absolute inset-0 z-40" onClick={onClose} />
      <div className={`absolute top-16 right-5 w-72 ${CARD} z-50 overflow-hidden`}>
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800">
          <p className="text-sm font-semibold">Notifications</p>
          <button onClick={onMarkAllRead} className="text-[11px] text-blue-400">Mark all read</button>
        </div>
        <div className="max-h-72 overflow-y-auto">
          {notifications.length === 0 && <p className="text-center text-xs text-slate-500 py-6">You're all caught up 🎉</p>}
          {notifications.map((n) => {
            const Icon = NOTIF_ICON[n.type] || Bell;
            return (
              <button key={n.id} onClick={() => onMarkRead(n.id)}
                className="w-full flex items-start gap-2.5 px-4 py-3 border-b border-slate-800/60 last:border-0 text-left hover:bg-slate-800/50 transition">
                <Icon3D icon={Icon} bg={NOTIF_COLOR[n.type]} size={13} box={28} />
                <div className="flex-1 min-w-0">
                  <p className={`text-xs ${n.read ? "text-slate-400" : "text-slate-100 font-medium"}`}>{n.title}</p>
                  <p className="text-[10px] text-slate-500 mt-0.5">{n.sub}</p>
                </div>
                {!n
