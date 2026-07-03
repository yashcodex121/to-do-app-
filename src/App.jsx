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
    <div className="min-h-screen w-full flex items-center justify-center bg-slate-950 py-6">
      <div className="w-[380px] min-h-[760px] bg-slate-950 text-slate-100 rounded-[36px] border border-slate-800 shadow-2xl overflow-hidden flex flex-col relative">
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
    <div className="mt-auto border-t border-slate-800 bg-slate-950/95 backdrop-blur px-2 pt-2 pb-4 flex justify-between">
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
                {!n.read && <span className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5 shrink-0" />}
              </button>
            );
          })}
        </div>
      </div>
    </>
  );
}

/* ------------------------------------------------------------------ */
/* HOME / DASHBOARD                                                     */
/* ------------------------------------------------------------------ */

function StatCard({ icon, iconBg, value, label }) {
  return (
    <div className={`${CARD} p-3 flex items-center gap-3`}>
      <Icon3D icon={icon} bg={iconBg} box={36} size={16} />
      <div>
        <p className="text-base font-bold leading-none">{value}</p>
        <p className="text-[11px] text-slate-400 mt-1">{label}</p>
      </div>
    </div>
  );
}

function DashboardLayout({ setPage, user, tasks, points, notifications, notifOpen, setNotifOpen, onMarkAllRead, onMarkRead }) {
  const now = useNow();
  const hour = now.getHours();
  const greeting = getGreeting(hour);
  const emoji = getGreetingEmoji(hour);
  const dateStr = now.toLocaleDateString("en-US", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
  const unread = notifications.filter((n) => !n.read).length;
  const doneToday = tasks.filter((t) => t.done).length;
  const nextTask = tasks.find((t) => !t.done);

  return (
    <div className="flex-1 flex flex-col px-5 pt-6 pb-4 overflow-y-auto gap-4 relative">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-xl font-bold flex items-center gap-1">{greeting}, {user?.name || "there"}! <span>{emoji}</span></h1>
          <p className="text-slate-400 text-xs mt-1">{dateStr}</p>
        </div>
        <button onClick={() => setNotifOpen((o) => !o)} className="w-10 h-10 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center relative shadow-lg shadow-black/40">
          <Bell size={17} />
          {unread > 0 && (
            <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 px-1 bg-red-500 rounded-full text-[9px] font-bold flex items-center justify-center">{unread}</span>
          )}
        </button>
      </div>

      {notifOpen && <NotificationsPanel notifications={notifications} onMarkAllRead={onMarkAllRead} onMarkRead={onMarkRead} onClose={() => setNotifOpen(false)} />}

      <div className={`${CARD} p-4`}>
        <div className="flex items-center gap-2 text-slate-400 text-xs mb-2"><QuoteIcon size={13} /> Daily Quote</div>
        <p className="text-sm italic text-slate-200">"Discipline today leads to freedom tomorrow."</p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <StatCard icon={ClipboardList} iconBg="#3B82F6" value={tasks.length + TOTAL_TASKS_BASE} label="Total Tasks" />
        <StatCard icon={CheckCircle2} iconBg="#22C55E" value={doneToday} label="Done Today" />
        <StatCard icon={XCircle} iconBg="#EF4444" value="3" label="Missed Today" />
        <StatCard icon={Star} iconBg="#F5B400" value={points} label="Points" />
      </div>

      <div className={`${CARD} p-4`}>
        <div className="flex items-center gap-3 mb-3">
          <Icon3D icon={Flame} bg="#F97316" box={40} size={20} />
          <div>
            <p className="font-bold text-sm">7 Days</p>
            <p className="text-[11px] text-slate-400">Current Streak</p>
          </div>
        </div>
        <div className="flex justify-between px-1">
          {streakDots.map((d, i) => (
            <div key={i} className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-semibold"
              style={{
                ...(streakFilled[i] ? glossyStyle("#22C55E") : { backgroundColor: "#1E293B" }),
                color: streakFilled[i] ? "#fff" : "#64748B",
                boxShadow: i === streakToday ? `${streakFilled[i] ? glossyStyle("#22C55E").boxShadow + "," : ""} 0 0 0 2px #3B82F6` : (streakFilled[i] ? glossyStyle("#22C55E").boxShadow : "none"),
              }}>
              {d}
            </div>
          ))}
        </div>
      </div>

      <button onClick={() => setPage("focus")}
        className="bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 transition rounded-2xl p-4 flex items-center justify-between shadow-lg shadow-blue-900/40">
        <div className="flex items-center gap-3">
          <Icon3D icon={Target} bg="rgba(255,255,255,0.18)" box={40} size={19} />
          <div className="text-left">
            <p className="font-semibold text-sm">Focus Mode</p>
            <p className="text-[11px] text-white/70">Start a distraction-free session</p>
          </div>
        </div>
        <Play size={18} fill="white" />
      </button>

      <div>
        <div className="flex items-center justify-between mb-2">
          <h2 className="font-semibold text-sm">Upcoming Tasks</h2>
          <button onClick={() => setPage("planner")} className="text-blue-400 text-xs">View All</button>
        </div>
        {nextTask ? (
          <div className={`${CARD} p-3 flex items-center justify-between`}>
            <div className="flex items-center gap-3">
              <span className="w-2 h-2 rounded-full mt-0.5" style={{ backgroundColor: PRIORITY_STYLES[nextTask.priority].dot }} />
              <div>
                <p className="text-sm font-medium">{nextTask.title}</p>
                <p className="text-[11px] text-slate-400">{nextTask.time}</p>
              </div>
            </div>
            <span className="text-[11px] font-medium" style={{ color: PRIORITY_STYLES[nextTask.priority].text }}>{nextTask.priority}</span>
          </div>
        ) : (
          <div className={`${CARD} p-3 text-center text-xs text-slate-400`}>All tasks done for today 🎉</div>
        )}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* ADD TASK MODAL                                                       */
/* ------------------------------------------------------------------ */

function AddTaskModal({ onClose, onAdd }) {
  const [title, setTitle] = useState("");
  const [start, setStart] = useState("09:00");
  const [end, setEnd] = useState("10:00");
  const [priority, setPriority] = useState("Medium");
  const [error, setError] = useState("");

  function handleSave() {
    if (!title.trim()) { setError("Enter a task title"); return; }
    if (end <= start) { setError("End time must be after start time"); return; }
    onAdd({ title: title.trim(), time: `${formatTime12(start)} - ${formatTime12(end)}`, priority });
    onClose();
  }

  return (
    <div className="absolute inset-0 z-50 flex items-end justify-center bg-black/60" onClick={onClose}>
      <div className="w-full bg-slate-900 border-t border-slate-800 rounded-t-3xl p-5 pb-8 shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="w-10 h-1 bg-slate-700 rounded-full mx-auto mb-4" />
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-semibold">Add New Task</h2>
          <button onClick={onClose} className="w-7 h-7 rounded-full bg-slate-800 flex items-center justify-center"><X size={14} /></button>
        </div>

        <label className="text-[11px] text-slate-400">Task Title</label>
        <input value={title} onChange={(e) => { setTitle(e.target.value); setError(""); }} placeholder="e.g. Revise Chemistry"
          className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2.5 text-sm mt-1 mb-3 outline-none focus:border-blue-500" />

        <div className="flex gap-3 mb-3">
          <div className="flex-1">
            <label className="text-[11px] text-slate-400">Start Time</label>
            <input type="time" value={start} onChange={(e) => setStart(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2.5 text-sm mt-1 outline-none focus:border-blue-500" />
          </div>
          <div className="flex-1">
            <label className="text-[11px] text-slate-400">End Time</label>
            <input type="time" value={end} onChange={(e) => setEnd(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2.5 text-sm mt-1 outline-none focus:border-blue-500" />
          </div>
        </div>

        <label className="text-[11px] text-slate-400">Priority</label>
        <div className="flex gap-2 mt-1 mb-4">
          {["Low", "Medium", "High"].map((p) => (
            <button key={p} onClick={() => setPriority(p)}
              className="flex-1 py-2 rounded-xl text-xs font-medium border transition"
              style={{
                backgroundColor: priority === p ? PRIORITY_STYLES[p].dot : "transparent",
                borderColor: priority === p ? PRIORITY_STYLES[p].dot : "#334155",
                color: priority === p ? "#fff" : "#94A3B8",
              }}>
              {p}
            </button>
          ))}
        </div>

        {error && <p className="text-red-400 text-[11px] mb-2">{error}</p>}

        <button onClick={handleSave} className="w-full bg-blue-600 hover:bg-blue-500 transition rounded-xl py-3 font-semibold text-sm shadow-lg shadow-blue-900/40">
          Save Task
        </button>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* PLANNER PAGE                                                         */
/* ------------------------------------------------------------------ */

function PlannerPage({ tasks, toggleTask, addTask }) {
  const [showAdd, setShowAdd] = useState(false);
  const now = useNow();
  const weekDays = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date(now);
    d.setDate(now.getDate() - now.getDay() + 1 + i); // Monday start
    return d;
  });

  return (
    <div className="flex-1 flex flex-col px-5 pt-6 pb-4 overflow-y-auto gap-4 relative">
      <div className="flex items-center justify-between">
        <Menu size={20} />
        <h1 className="text-[17px] font-semibold">Planner</h1>
        <SlidersHorizontal size={18} />
      </div>

      <div className="flex justify-between">
        {weekDays.map((d, i) => {
          const isToday = sameDay(d, now);
          return (
            <div key={i} className="w-9 flex flex-col items-center gap-1 py-2 rounded-xl"
              style={isToday ? glossyStyle("#3B82F6") : {}}>
              <span className="text-[10px] text-slate-400">{d.toLocaleDateString("en-US", { weekday: "short" })}</span>
              <span className="text-sm font-semibold">{d.getDate()}</span>
            </div>
          );
        })}
      </div>

      <button onClick={() => setShowAdd(true)}
        className="bg-blue-600 hover:bg-blue-500 transition rounded-xl py-3 flex items-center justify-center gap-2 font-semibold text-sm shadow-lg shadow-blue-900/40">
        <Plus size={16} /> Add Task
      </button>

      <h2 className="font-semibold text-sm">Today's Tasks ({tasks.length})</h2>

      <div className="flex flex-col gap-2.5">
        {tasks.map((t) => (
          <div key={t.id} className={`${CARD} p-3 flex items-center gap-3`}>
            <button onClick={() => toggleTask(t.id)} className="w-5 h-5 rounded-md border flex items-center justify-center shrink-0"
              style={{ backgroundColor: t.done ? "#22C55E" : "transparent", borderColor: t.done ? "#22C55E" : "#475569" }}>
              {t.done && <CheckCircle2 size={14} className="text-white" fill="#22C55E" />}
            </button>
            <div className="flex-1">
              <p className={`text-sm font-medium ${t.done ? "line-through text-slate-500" : ""}`}>{t.title}</p>
              <p className="text-[11px] text-slate-400">{t.time}</p>
            </div>
            <span className="text-[11px] font-medium" style={{ color: PRIORITY_STYLES[t.priority].text }}>{t.priority}</span>
          </div>
        ))}
      </div>

      {showAdd && <AddTaskModal onClose={() => setShowAdd(false)} onAdd={addTask} />}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* CALENDAR PAGE (fully functional)                                     */
/* ------------------------------------------------------------------ */

function CalendarPage({ setPage, tasks }) {
  const today = new Date();
  const [viewMonth, setViewMonth] = useState(new Date(today.getFullYear(), today.getMonth(), 1));
  const [selectedDate, setSelectedDate] = useState(today);
  const weeks = getMonthMatrix(viewMonth);

  function prevMonth() { setViewMonth((m) => new Date(m.getFullYear(), m.getMonth() - 1, 1)); }
  function nextMonth() { setViewMonth((m) => new Date(m.getFullYear(), m.getMonth() + 1, 1)); }

  const isSelectedToday = sameDay(selectedDate, today);
  const dayTasks = isSelectedToday
    ? tasks.map((t) => ({ title: t.title, time: t.time, color: PRIORITY_STYLES[t.priority].dot }))
    : DEMO_DAY_POOL[selectedDate.getDate() % DEMO_DAY_POOL.length];

  return (
    <div className="flex-1 flex flex-col px-5 pt-6 pb-4 overflow-y-auto gap-4">
      <TopBar title="Calendar" onBack={() => setPage("home")} right={null} />

      <div className="flex items-center justify-between px-1">
        <button onClick={prevMonth} className="w-7 h-7 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center">
          <ChevronLeft size={14} className="text-slate-400" />
        </button>
        <span className="text-sm font-semibold">{viewMonth.toLocaleDateString("en-US", { month: "long", year: "numeric" })}</span>
        <button onClick={nextMonth} className="w-7 h-7 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center">
          <ChevronRight size={14} className="text-slate-400" />
        </button>
      </div>

      <div className={`${CARD} p-3`}>
        <div className="grid grid-cols-7 text-center text-[10px] text-slate-500 mb-2">
          {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d) => <span key={d}>{d}</span>)}
        </div>
        {weeks.map((row, ri) => (
          <div key={ri} className="grid grid-cols-7 text-center mb-1">
            {row.map((cell, ci) => {
              const isSelected = sameDay(cell.date, selectedDate);
              const isToday = sameDay(cell.date, today);
              return (
                <div key={ci} className="flex flex-col items-center py-1">
                  <button
                    disabled={!cell.curMonth}
                    onClick={() => setSelectedDate(cell.date)}
                    className="w-7 h-7 rounded-full flex items-center justify-center text-xs transition"
                    style={{
                      ...(isSelected ? glossyStyle("#3B82F6") : {}),
                      color: isSelected ? "#fff" : cell.curMonth ? "#E2E8F0" : "#475569",
                      fontWeight: isSelected ? 700 : 400,
                      boxShadow: !isSelected && isToday ? "inset 0 0 0 1.5px #3B82F6" : isSelected ? glossyStyle("#3B82F6").boxShadow : "none",
                    }}
                  >
                    {cell.day}
                  </button>
                  {CALENDAR_DOT_DAYS[cell.day] && cell.curMonth && (
                    <span className="w-1 h-1 rounded-full mt-0.5" style={{ backgroundColor: CALENDAR_DOT_DAYS[cell.day] }} />
                  )}
                </div>
              );
            })}
          </div>
        ))}
      </div>

      <h2 className="font-semibold text-sm">
        {selectedDate.toLocaleDateString("en-US", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
      </h2>
      <div className="flex flex-col gap-2.5">
        {dayTasks.length === 0 && (
          <div className={`${CARD} p-4 text-center text-xs text-slate-400`}>No tasks scheduled for this day</div>
        )}
        {dayTasks.map((t, i) => (
          <div key={i} className={`${CARD} p-3 flex items-center gap-3`}>
            <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: t.color }} />
            <div>
              <p className="text-sm font-medium">{t.title}</p>
              <p className="text-[11px] text-slate-400">{t.time}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* ANALYTICS PAGE                                                       */
/* ------------------------------------------------------------------ */

function AnalyticsPage({ setPage }) {
  const maxV = 100;
  const w = 300, h = 110, pad = 10;
  const stepX = (w - pad * 2) / (analyticsWeek.length - 1);
  const points = analyticsWeek.map((d, i) => [pad + i * stepX, h - pad - (d.v / maxV) * (h - pad * 2)]);
  const path = points.map((p, i) => (i === 0 ? `M${p[0]},${p[1]}` : `L${p[0]},${p[1]}`)).join(" ");

  return (
    <div className="flex-1 flex flex-col px-5 pt-6 pb-4 overflow-y-auto gap-4">
      <div className="flex items-center justify-between">
        <button onClick={() => setPage("home")} className="w-9 h-9 rounded-full flex items-center justify-center bg-slate-900/60"><ChevronLeft size={18} /></button>
        <h1 className="text-[17px] font-semibold">Analytics</h1>
        <span className="text-[11px] bg-slate-900 border border-slate-800 rounded-full px-2.5 py-1 text-slate-300">This Week ▾</span>
      </div>

      <h2 className="font-semibold text-sm">Overview</h2>
      <div className="grid grid-cols-2 gap-3">
        <StatCard icon={ClipboardList} iconBg="#3B82F6" value="32" label="Total Tasks" />
        <StatCard icon={CheckCircle2} iconBg="#22C55E" value="25" label="Completed" />
        <StatCard icon={XCircle} iconBg="#EF4444" value="5" label="Missed" />
        <div className={`${CARD} p-3 flex items-center gap-3`}>
          <CircularProgress pct={78} color="#22C55E" size={36} stroke={4} />
          <div>
            <p className="text-base font-bold leading-none">78%</p>
            <p className="text-[11px] text-slate-400 mt-1">Success Rate</p>
          </div>
        </div>
      </div>

      <h2 className="font-semibold text-sm">Productivity</h2>
      <div className={`${CARD} p-3`}>
        <svg viewBox={`0 0 ${w} ${h + 20}`} width="100%" height={140}>
          <path d={path} fill="none" stroke="#3B82F6" strokeWidth="2.5" />
          {points.map(([x, y], i) => <circle key={i} cx={x} cy={y} r={3} fill="#3B82F6" />)}
          <text x={points[points.length - 1][0] - 14} y={points[points.length - 1][1] - 10} fill="#E2E8F0" fontSize="11" fontWeight="bold">
            {analyticsWeek[analyticsWeek.length - 1].v}%
          </text>
          {analyticsWeek.map((d, i) => <text key={d.day} x={points[i][0]} y={h + 15} fill="#64748B" fontSize="9" textAnchor="middle">{d.day}</text>)}
        </svg>
      </div>

      <h2 className="font-semibold text-sm">Task Completion Heatmap</h2>
      <div className={`${CARD} p-3`}>
        <div className="flex">
          <div className="flex flex-col justify-between mr-2 py-0.5">
            {heatmapRows.map((r) => <span key={r} className="text-[9px] text-slate-500 h-4 leading-4">{r}</span>)}
          </div>
          <div className="flex-1 grid grid-rows-7 gap-1">
            {heatmapRows.map((r, ri) => (
              <div key={r} className="grid gap-1" style={{ gridTemplateColumns: `repeat(${heatmapCols}, 1fr)` }}>
                {Array.from({ length: heatmapCols }).map((_, ci) => (
                  <div key={ci} className="h-4 rounded-sm" style={{ backgroundColor: `rgba(59,130,246,${0.15 + seedHeat(ri, ci) * 0.75})` }} />
                ))}
              </div>
            ))}
          </div>
        </div>
        <div className="flex justify-between text-[9px] text-slate-500 mt-1 pl-7">
          <span>12 AM</span><span>6 AM</span><span>12 PM</span><span>6 PM</span><span>12 AM</span>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* GOALS / PROFILE PAGE                                                 */
/* ------------------------------------------------------------------ */

function GoalsPage({ setPage, user, points, onLogout }) {
  const tabs = ["Daily", "Weekly", "Monthly", "Yearly"];
  const [tab, setTab] = useState("Daily");
  return (
    <div className="flex-1 flex flex-col px-5 pt-6 pb-4 overflow-y-auto gap-4">
      <TopBar title="Goals" onBack={() => setPage("home")} right={null} />

      <div className={`${CARD} p-4 flex items-center gap-3`}>
        <div className="w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg" style={glossyStyle("#3B82F6")}>
          {(user?.name || "U").charAt(0)}
        </div>
        <div className="flex-1">
          <p className="text-sm font-semibold">{user?.name || "User"}</p>
          <p className="text-[11px] text-slate-400">{user?.email}</p>
        </div>
        <div className="flex items-center gap-1 text-amber-400 text-xs font-semibold"><Star size={13} fill="#F5B400" /> {points}</div>
      </div>

      <div className="flex bg-slate-900 border border-slate-800 rounded-xl p-1 gap-1">
        {tabs.map((t) => (
          <button key={t} onClick={() => setTab(t)} className="flex-1 text-xs font-medium rounded-lg py-2 transition"
            style={{ backgroundColor: tab === t ? "#3B82F6" : "transparent", color: tab === t ? "#fff" : "#94A3B8" }}>
            {t}
          </button>
        ))}
      </div>

      <div className="flex flex-col gap-3">
        {goalsData[tab].map((g) => (
          <div key={g.title} className={`${CARD} p-3 flex items-center gap-4`}>
            <div className="relative w-16 h-16 flex items-center justify-center shrink-0">
              <CircularProgress pct={g.pct} color={g.color} size={64} stroke={6} />
              <span className="absolute text-sm font-bold">{g.pct}%</span>
            </div>
            <div>
              <p className="text-sm font-semibold">{g.title}</p>
              <p className="text-[11px] text-slate-400 mt-1">{g.sub}</p>
            </div>
          </div>
        ))}
      </div>

      <button onClick={onLogout}
        className="mt-auto flex items-center justify-center gap-2 bg-slate-900 border border-slate-800 hover:bg-red-500/10 hover:border-red-500/40 text-red-400 rounded-xl py-3 text-sm font-medium transition">
        <LogOut size={15} /> Log Out
      </button>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* FOCUS MODE PAGE                                                      */
/* ------------------------------------------------------------------ */

function FocusPage({ setPage, tasks, onComplete }) {
  const undone = tasks.filter((t) => !t.done);
  const [selectedId, setSelectedId] = useState(undone[0]?.id ?? null);
  const [duration, setDuration] = useState(25 * 60);
  const [remaining, setRemaining] = useState(25 * 60);
  const [running, setRunning] = useState(false);
  const [finished, setFinished] = useState(false);
  const intervalRef = useRef(null);

  useEffect(() => {
    if (running) {
      intervalRef.current = setInterval(() => {
        setRemaining((r) => {
          if (r <= 1) {
            clearInterval(intervalRef.current);
            setRunning(false);
            setFinished(true);
            onComplete(10);
            return 0;
          }
          return r - 1;
        });
      }, 1000);
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    return () => clearInterval(intervalRef.current);
  }, [running]); // eslint-disable-line

  const selectedTask = tasks.find((t) => t.id === selectedId);
  const pct = ((duration - remaining) / duration) * 100;

  function pickDuration(secs) { setDuration(secs); setRemaining(secs); setRunning(false); setFinished(false); }
  function reset() { setRemaining(duration); setRunning(false); setFinished(false); }

  return (
    <div className="flex-1 flex flex-col px-5 pt-6 pb-4 overflow-y-auto gap-6">
      <TopBar title="Focus Mode" onBack={() => setPage("home")} right={null} />

      {undone.length > 0 && (
        <div>
          <p className="text-xs text-slate-400 mb-2">Focusing on</p>
          <div className="flex gap-2 overflow-x-auto pb-1">
            {undone.map((t) => (
              <button key={t.id} onClick={() => setSelectedId(t.id)}
                className="shrink-0 px-3 py-2 rounded-xl text-xs font-medium border transition"
                style={{
                  backgroundColor: selectedId === t.id ? "#3B82F6" : "#0f172a",
                  borderColor: selectedId === t.id ? "#3B82F6" : "#1e293b",
                  color: selectedId === t.id ? "#fff" : "#94A3B8",
                }}>
                {t.title}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="flex flex-col items-center justify-center py-4">
        <div className="relative w-52 h-52 flex items-center justify-center">
          <CircularProgress pct={pct} color="#3B82F6" size={208} stroke={10} />
          <div className="absolute flex flex-col items-center">
            <span className="text-4xl font-bold tabular-nums">{formatMMSS(remaining)}</span>
            <span className="text-[11px] text-slate-400 mt-1">{running ? "Stay focused…" : finished ? "Session complete" : "Ready when you are"}</span>
          </div>
        </div>
      </div>

      {finished && (
        <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-2xl p-4 flex items-center gap-3">
          <Icon3D icon={Trophy} bg="#10B981" box={36} size={17} />
          <div>
            <p className="text-sm font-semibold text-emerald-300">Great work! +10 points</p>
            <p className="text-[11px] text-slate-400">{selectedTask ? `Focused on "${selectedTask.title}"` : "Session complete"}</p>
          </div>
        </div>
      )}

      {!running && !finished && (
        <div className="flex gap-2 justify-center">
          {FOCUS_PRESETS.map((p) => (
            <button key={p.label} onClick={() => pickDuration(p.secs)}
              className="px-4 py-1.5 rounded-full text-xs font-medium border transition"
              style={{
                backgroundColor: duration === p.secs ? "#1d4ed8" : "transparent",
                borderColor: duration === p.secs ? "#1d4ed8" : "#334155",
                color: duration === p.secs ? "#fff" : "#94A3B8",
              }}>
              {p.label}
            </button>
          ))}
        </div>
      )}

      <div className="flex items-center justify-center gap-4 mt-auto">
        <button onClick={reset} className="w-12 h-12 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center shadow-lg shadow-black/40">
          <RotateCcw size={17} className="text-slate-300" />
        </button>
        <button onClick={() => { setFinished(false); setRunning((r) => !r); }}
          className="w-16 h-16 rounded-full bg-blue-600 hover:bg-blue-500 transition flex items-center justify-center shadow-lg shadow-blue-900/40">
          {running ? <Pause size={24} fill="white" /> : <Play size={24} fill="white" className="ml-0.5" />}
        </button>
        <div className="w-12 h-12" />
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* APP ROOT (Router)                                                    */
/* ------------------------------------------------------------------ */

export default function App() {
  const [page, setPage] = useState("login");
  const [user, setUser] = useState(null);
  const [tasks, setTasks] = useState(initialTasks);
  const [points, setPoints] = useState(120);
  const [notifications, setNotifications] = useState(initialNotifications);
  const [notifOpen, setNotifOpen] = useState(false);

  const toggleTask = (id) =>
    setTasks((prev) => {
      const next = prev.map((t) => (t.id === id ? { ...t, done: !t.done } : t));
      const t = next.find((x) => x.id === id);
      setPoints((p) => Math.max(0, p + (t.done ? 5 : -5)));
      return next;
    });

  function addTask(newTask) {
    setTasks((prev) => [...prev, { id: (prev.at(-1)?.id || 0) + 1, done: false, ...newTask }]);
  }

  function handleLogin(userInfo) { setUser(userInfo); setPage("home"); }
  function handleLogout() { setUser(null); setNotifOpen(false); setPage("login"); }
  function markAllRead() { setNotifications((prev) => prev.map((n) => ({ ...n, read: true }))); }
  function markRead(id) { setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n))); }
  function handleFocusComplete(pts) { setPoints((p) => p + pts); }

  const showBottomNav = page !== "login" && page !== "focus";

  return (
    <Screen>
      {page === "login" && <LoginPage onLogin={handleLogin} />}
      {page === "home" && (
        <DashboardLayout setPage={setPage} user={user} tasks={tasks} points={points}
          notifications={notifications} notifOpen={notifOpen} setNotifOpen={setNotifOpen}
          onMarkAllRead={markAllRead} onMarkRead={markRead} />
      )}
      {page === "planner" && <PlannerPage tasks={tasks} toggleTask={toggleTask} addTask={addTask} />}
      {page === "calendar" && <CalendarPage setPage={setPage} tasks={tasks} />}
      {page === "analytics" && <AnalyticsPage setPage={setPage} />}
      {page === "goals" && <GoalsPage setPage={setPage} user={user} points={points} onLogout={handleLogout} />}
      {page === "focus" && <FocusPage setPage={setPage} tasks={tasks} onComplete={handleFocusComplete} />}
      {showBottomNav && <BottomNav page={page} setPage={setPage} />}
    </Screen>
  );
}
