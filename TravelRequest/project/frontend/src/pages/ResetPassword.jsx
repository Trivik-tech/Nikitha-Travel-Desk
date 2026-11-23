import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Key, ArrowLeft, ShieldCheck, Lock, Plane, Eye, EyeOff, CheckCircle2 } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../api/axios';

// ── Shining Animated Stars Configurations (Slow & Gentle Ambient Twinkle) ────
const SHINING_SPARKLES = [
    { top: '8%', left: '12%', size: 22, duration: 6.5, delay: 0 },
    { top: '15%', left: '28%', size: 16, duration: 8.0, delay: 2.5 },
    { top: '22%', left: '6%', size: 24, duration: 9.0, delay: 1.0 },
    { top: '34%', left: '44%', size: 18, duration: 7.2, delay: 4.0 },
    { top: '50%', left: '16%', size: 22, duration: 8.5, delay: 1.8 },
    { top: '68%', left: '32%', size: 16, duration: 6.8, delay: 3.2 },
    { top: '78%', left: '10%', size: 20, duration: 9.5, delay: 2.0 },
    { top: '86%', left: '42%', size: 22, duration: 7.0, delay: 0.8 },
    { top: '10%', left: '68%', size: 18, duration: 7.8, delay: 2.2 },
    { top: '18%', left: '88%', size: 24, duration: 8.8, delay: 4.5 },
    { top: '72%', left: '84%', size: 18, duration: 7.4, delay: 1.5 },
    { top: '88%', left: '72%', size: 20, duration: 9.2, delay: 3.5 },
];

const TWINKLE_STARS = [
    { top: '5%', left: '22%', size: 4, duration: 5.2, delay: 0.5 },
    { top: '12%', left: '36%', size: 3, duration: 6.8, delay: 2.4 },
    { top: '19%', left: '18%', size: 5, duration: 6.0, delay: 1.2 },
    { top: '28%', left: '4%', size: 3, duration: 7.5, delay: 3.8 },
    { top: '38%', left: '24%', size: 4, duration: 6.2, delay: 1.8 },
    { top: '56%', left: '22%', size: 4, duration: 5.8, delay: 3.2 },
    { top: '68%', left: '12%', size: 5, duration: 7.8, delay: 2.1 },
    { top: '76%', left: '28%', size: 3, duration: 5.5, delay: 4.2 },
    { top: '6%', left: '82%', size: 4, duration: 2.7, delay: 0.8 },
    { top: '25%', left: '92%', size: 3, duration: 7.6, delay: 3.4 },
    { top: '40%', left: '84%', size: 4, duration: 5.4, delay: 4.6 },
    { top: '60%', left: '90%', size: 3, duration: 6.9, delay: 0.7 },
    { top: '80%', left: '92%', size: 4, duration: 6.3, delay: 3.6 },
];

const ResetPassword = () => {
    const [otp, setOtp] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [ripples, setRipples] = useState([]);

    const location = useLocation();
    const navigate = useNavigate();
    const email = location.state?.email || '';

    const handleButtonClick = (e) => {
        const button = e.currentTarget;
        const rect = button.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height) * 1.5;
        const x = e.clientX - rect.left - size / 2;
        const y = e.clientY - rect.top - size / 2;
        const newRipple = { x, y, size, id: Date.now() + Math.random() };
        setRipples((prev) => [...prev, newRipple]);
        setTimeout(() => {
            setRipples((prev) => prev.filter((r) => r.id !== newRipple.id));
        }, 700);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!email) {
            toast.error('Email not found. Please request an OTP first.');
            navigate('/forgot-password');
            return;
        }

        if (newPassword !== confirmPassword) {
            toast.error('Passwords do not match');
            return;
        }

        if (newPassword.length < 6) {
            toast.error('Password must be at least 6 characters');
            return;
        }

        setIsLoading(true);

        try {
            await api.post('/auth/reset-password', {
                email,
                otp,
                newPassword
            });

            setIsSuccess(true);
            toast.success('Password reset successfully!', {
                icon: '✅',
                style: { borderRadius: '15px', background: '#fff', color: '#6541e9', fontWeight: 600 }
            });

            setTimeout(() => {
                navigate('/login');
            }, 2500);

        } catch (error) {
            console.error('Reset password error:', error);
            const message = error?.response?.data?.message || error?.message || 'Failed to reset password';
            toast.error(message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div
            className="w-full flex-grow min-h-screen flex items-center justify-center p-3 sm:p-5 lg:p-6 py-4 sm:py-6 relative overflow-x-hidden overflow-y-auto"
            style={{
                /* Sunset dusk twilight gradient matching login & register */
                background: 'linear-gradient(135deg, #2a1e80 0%, #462ebc 28%, #6742db 50%, #9e59be 75%, #df8785 100%)',
            }}
        >
            {/* ═══════════ ANIMATED BACKGROUND ATMOSPHERE ═══════════ */}
            <motion.div
                className="absolute top-12 right-1/4 w-[420px] h-[340px] rounded-full pointer-events-none"
                style={{
                    background: 'radial-gradient(circle, rgba(255, 255, 255, 0.22) 0%, rgba(200, 180, 255, 0.12) 50%, transparent 70%)',
                    filter: 'blur(60px)',
                }}
                animate={{
                    x: [0, 35, -20, 0],
                    y: [0, -25, 15, 0],
                    scale: [1, 1.1, 0.95, 1],
                }}
                transition={{
                    duration: 14,
                    repeat: Infinity,
                    ease: 'easeInOut',
                }}
            />

            <motion.div
                className="absolute -bottom-20 right-10 w-[500px] h-[400px] rounded-full pointer-events-none"
                style={{
                    background: 'radial-gradient(circle, rgba(254, 205, 190, 0.35) 0%, rgba(223, 136, 132, 0.18) 50%, transparent 75%)',
                    filter: 'blur(75px)',
                }}
                animate={{
                    x: [0, -40, 25, 0],
                    y: [0, 20, -20, 0],
                    scale: [1, 1.08, 0.96, 1],
                }}
                transition={{
                    duration: 16,
                    repeat: Infinity,
                    ease: 'easeInOut',
                }}
            />

            <motion.div
                className="absolute top-1/3 left-10 w-[450px] h-[380px] rounded-full pointer-events-none"
                style={{
                    background: 'radial-gradient(circle, rgba(168, 85, 247, 0.25) 0%, rgba(99, 102, 241, 0.12) 50%, transparent 70%)',
                    filter: 'blur(80px)',
                }}
                animate={{
                    x: [0, 30, -30, 0],
                    y: [0, -30, 20, 0],
                }}
                transition={{
                    duration: 18,
                    repeat: Infinity,
                    ease: 'easeInOut',
                }}
            />

            {/* ═══════════ SHINING ANIMATED STARS ═══════════ */}
            <svg className="absolute w-0 h-0 pointer-events-none" aria-hidden="true">
                <defs>
                    <radialGradient id="starGleamReset" cx="50%" cy="50%" r="50%">
                        <stop offset="0%" stopColor="#ffffff" stopOpacity="1" />
                        <stop offset="35%" stopColor="#fff8db" stopOpacity="0.95" />
                        <stop offset="70%" stopColor="#fef08a" stopOpacity="0.6" />
                        <stop offset="100%" stopColor="#ffffff" stopOpacity="0.1" />
                    </radialGradient>
                </defs>
            </svg>

            {/* 1. Large 4-Point Sparkling Stars */}
            {SHINING_SPARKLES.map((star, idx) => (
                <motion.div
                    key={`sparkle-${idx}`}
                    className="absolute pointer-events-none select-none"
                    style={{
                        top: star.top,
                        left: star.left,
                        width: star.size,
                        height: star.size,
                    }}
                    initial={{ opacity: 0.15, scale: 0.6 }}
                    animate={{
                        opacity: [0.15, 0.9, 0.15],
                        scale: [0.6, 1.25, 0.6],
                        rotate: [0, 15, 0],
                    }}
                    transition={{
                        duration: star.duration,
                        repeat: Infinity,
                        delay: star.delay,
                        ease: 'easeInOut',
                    }}
                >
                    <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        className="w-full h-full drop-shadow-[0_0_10px_rgba(255,255,255,0.95)]"
                    >
                        <path
                            d="M12 0C12 6.627 6.627 12 0 12C6.627 12 12 17.373 12 24C12 17.373 17.373 12 24 12C17.373 12 12 6.627 12 0Z"
                            fill="url(#starGleamReset)"
                        />
                        <circle cx="12" cy="12" r="3" fill="#ffffff" />
                    </svg>
                </motion.div>
            ))}

            {/* 2. Twinkling Stars */}
            {TWINKLE_STARS.map((star, idx) => (
                <motion.div
                    key={`twinkle-${idx}`}
                    className="absolute rounded-full pointer-events-none"
                    style={{
                        top: star.top,
                        left: star.left,
                        width: `${star.size}px`,
                        height: `${star.size}px`,
                        backgroundColor: '#ffffff',
                        boxShadow: `0 0 ${star.size * 2.5}px ${star.size * 0.8}px rgba(255, 255, 255, 0.9)`,
                    }}
                    animate={{
                        opacity: [0.15, 0.85, 0.15],
                        scale: [0.75, 1.35, 0.75],
                    }}
                    transition={{
                        duration: star.duration,
                        repeat: Infinity,
                        delay: star.delay,
                        ease: 'easeInOut',
                    }}
                />
            ))}

            {/* 3. Meteor Trail */}
            <motion.div
                className="absolute pointer-events-none"
                style={{
                    top: '15%',
                    left: '18%',
                    width: '130px',
                    height: '2px',
                    transform: 'rotate(-28deg)',
                    background: 'linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.85) 65%, rgba(255,255,255,1) 100%)',
                    filter: 'drop-shadow(0 0 5px rgba(255,255,255,0.9))',
                }}
                animate={{
                    x: [-80, 520],
                    y: [-40, 270],
                    opacity: [0, 1, 0.8, 0],
                }}
                transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    repeatDelay: 9,
                    ease: 'easeOut',
                }}
            />

            {/* ═══════════ MAIN CONTENT CONTAINER ═══════════ */}
            <div className="w-full max-w-6xl mx-auto grid lg:grid-cols-12 gap-6 lg:gap-10 items-center relative z-10 py-2 sm:py-4">

                {/* ────────── LEFT COLUMN: HERO & ANIMATED FLIGHT PATH ────────── */}
                <div className="lg:col-span-7 text-white relative">
                    {/* Animated Flight Path with Gliding Plane */}
                    <div className="relative mb-3 sm:mb-5 h-12 sm:h-16 max-w-sm sm:max-w-md">
                        <svg className="w-full h-full overflow-visible" viewBox="0 0 400 80" fill="none">
                            <motion.path
                                d="M 10 65 Q 160 55, 330 25"
                                stroke="url(#contrailGradientReset)"
                                strokeWidth="2.5"
                                strokeDasharray="6 6"
                                initial={{ pathLength: 0, opacity: 0 }}
                                animate={{ pathLength: 1, opacity: 0.85 }}
                                transition={{ duration: 1.5, ease: 'easeOut' }}
                            />
                            <defs>
                                <linearGradient id="contrailGradientReset" x1="0%" y1="100%" x2="100%" y2="0%">
                                    <stop offset="0%" stopColor="#ffffff" stopOpacity="0.1" />
                                    <stop offset="60%" stopColor="#ffffff" stopOpacity="0.6" />
                                    <stop offset="100%" stopColor="#ffffff" stopOpacity="0.95" />
                                </linearGradient>
                            </defs>
                        </svg>

                        <motion.div
                            className="absolute top-0"
                            style={{ left: '80%', top: '18%' }}
                            animate={{
                                x: [0, 8, -6, 0],
                                y: [0, -5, 4, 0],
                                rotate: [35, 38, 33, 35],
                            }}
                            transition={{
                                duration: 5,
                                repeat: Infinity,
                                ease: 'easeInOut',
                            }}
                        >
                            <div className="relative">
                                <div className="absolute inset-0 bg-white/40 blur-md rounded-full scale-150 pointer-events-none" />
                                <Plane className="w-5 sm:w-6 h-5 sm:h-6 text-white drop-shadow-[0_2px_10px_rgba(255,255,255,0.7)]" />
                            </div>
                        </motion.div>
                    </div>

                    {/* Brand Badge */}
                    <motion.div
                        initial={{ opacity: 0, x: -30 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.6, ease: 'easeOut' }}
                        className="inline-flex items-center gap-2.5 px-3 py-1.5 rounded-2xl bg-white/15 backdrop-blur-md border border-white/25 shadow-lg mb-4 sm:mb-6 hover:bg-white/20 transition-all cursor-default"
                    >
                        <motion.div
                            className="p-1.5 rounded-lg bg-[#6541e9] text-white shadow-md flex items-center justify-center"
                            animate={{ rotate: [0, -6, 0] }}
                            transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                        >
                            <Plane className="w-3.5 h-3.5 text-white transform -rotate-45" />
                        </motion.div>
                        <span className="text-xs sm:text-sm font-bold text-white tracking-wide pr-1.5">
                            Nikitha Travel Request
                        </span>
                    </motion.div>

                    {/* Hero Headline */}
                    <motion.div
                        initial={{ opacity: 0, y: 25 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.7, delay: 0.15, ease: 'easeOut' }}
                    >
                        <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold text-white tracking-tight leading-[1.08] drop-shadow-md">
                            Set your new
                            <br />
                            <span className="text-white">password.</span>
                        </h1>
                    </motion.div>

                    {/* Subtitle */}
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.7, delay: 0.3, ease: 'easeOut' }}
                        className="mt-3 sm:mt-4 text-xs sm:text-base text-white/85 font-normal leading-relaxed max-w-md"
                    >
                        Verify your identity with the OTP code sent to your email and establish a strong credential for your account.
                    </motion.p>
                </div>

                {/* ────────── RIGHT COLUMN: FLOATING CARD ────────── */}
                <div className="lg:col-span-5 flex justify-center lg:justify-end">
                    <motion.div
                        initial={{ opacity: 0, y: 40, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        transition={{ duration: 0.65, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
                        className="w-full max-w-[400px]"
                    >
                        <motion.div
                            animate={{ y: [0, -6, 0] }}
                            transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
                            className="bg-white/95 backdrop-blur-2xl rounded-[2rem] p-5 sm:p-6 shadow-[0_20px_60px_-15px_rgba(20,10,60,0.4)] border border-white/60 relative overflow-hidden"
                        >
                            {/* Subtle internal shine */}
                            <div className="absolute top-0 right-0 w-36 h-36 bg-gradient-to-bl from-indigo-50/80 to-transparent rounded-full pointer-events-none" />

                            {/* Nikitha Official Logo - Blended seamlessly with background */}
                            <div className="flex justify-center mb-3 sm:mb-4 relative z-10">
                                <motion.div
                                    whileHover={{ scale: 1.03 }}
                                    transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                                    className="flex items-center justify-center"
                                >
                                    <img
                                        src="/nikitha-logo.png"
                                        alt="Nikitha Logo"
                                        className="h-20 sm:h-24 w-auto object-contain select-none"
                                    />
                                </motion.div>
                            </div>

                            {/* Conditional: Form vs Success */}
                            {!isSuccess ? (
                                <>
                                    {/* Header */}
                                    <div className="mb-3 sm:mb-4 relative z-10 text-center sm:text-left">
                                        <h2 className="text-xl sm:text-2xl font-black text-[#1e1b4b] tracking-tight leading-tight">
                                            Reset Password
                                        </h2>
                                        {email ? (
                                            <p className="text-[11px] sm:text-xs text-slate-500 font-medium mt-0.5 truncate">
                                                For: <span className="font-bold text-[#6541e9]">{email}</span>
                                            </p>
                                        ) : (
                                            <p className="text-[11px] sm:text-xs text-slate-500 font-medium mt-0.5">
                                                Enter your OTP & create a new password
                                            </p>
                                        )}
                                    </div>

                                    {/* Form */}
                                    <form onSubmit={handleSubmit} className="space-y-2.5 sm:space-y-3 relative z-10">
                                        {/* OTP Code */}
                                        <div className="space-y-1">
                                            <label className="block text-[10px] font-black uppercase tracking-wider text-[#6541e9]">
                                                6-DIGIT OTP CODE
                                            </label>
                                            <div className="relative">
                                                <input
                                                    type="text"
                                                    value={otp}
                                                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                                    placeholder="123456"
                                                    className="w-full px-3.5 py-2 sm:py-2.5 bg-white border border-slate-200/90 rounded-xl text-center font-mono text-base tracking-[0.3em] font-bold text-slate-900 placeholder:text-slate-300 focus:bg-white focus:border-[#6541e9] focus:ring-4 focus:ring-[#6541e9]/15 transition-all outline-none"
                                                    maxLength="6"
                                                    required
                                                />
                                                <Key className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
                                            </div>
                                        </div>

                                        {/* New Password */}
                                        <div className="space-y-1">
                                            <label className="block text-[10px] font-black uppercase tracking-wider text-[#6541e9]">
                                                NEW PASSWORD
                                            </label>
                                            <div className="relative">
                                                <input
                                                    type={showNewPassword ? 'text' : 'password'}
                                                    value={newPassword}
                                                    onChange={(e) => setNewPassword(e.target.value)}
                                                    placeholder="At least 6 characters"
                                                    className="w-full pl-3.5 pr-10 py-2 sm:py-2.5 bg-white border border-slate-200/90 rounded-xl text-xs sm:text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-[#6541e9] focus:ring-4 focus:ring-[#6541e9]/15 transition-all outline-none"
                                                    required
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => setShowNewPassword(!showNewPassword)}
                                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-[#6541e9] p-1 transition-colors"
                                                    title={showNewPassword ? 'Hide password' : 'Show password'}
                                                >
                                                    {showNewPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                                                </button>
                                            </div>
                                        </div>

                                        {/* Confirm Password */}
                                        <div className="space-y-1">
                                            <label className="block text-[10px] font-black uppercase tracking-wider text-[#6541e9]">
                                                CONFIRM PASSWORD
                                            </label>
                                            <div className="relative">
                                                <input
                                                    type={showConfirmPassword ? 'text' : 'password'}
                                                    value={confirmPassword}
                                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                                    placeholder="Repeat new password"
                                                    className="w-full pl-3.5 pr-10 py-2 sm:py-2.5 bg-white border border-slate-200/90 rounded-xl text-xs sm:text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-[#6541e9] focus:ring-4 focus:ring-[#6541e9]/15 transition-all outline-none"
                                                    required
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-[#6541e9] p-1 transition-colors"
                                                    title={showConfirmPassword ? 'Hide password' : 'Show password'}
                                                >
                                                    {showConfirmPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                                                </button>
                                            </div>
                                        </div>

                                        {/* Primary Button */}
                                        <div className="relative group pt-1">
                                            <div
                                                className="absolute -inset-1 rounded-2xl opacity-50 group-hover:opacity-90 blur-lg transition-all duration-500 pointer-events-none -z-10"
                                                style={{
                                                    background: 'linear-gradient(135deg, rgba(203, 15, 65, 0.7) 0%, rgba(133, 34, 120, 0.6) 45%, rgba(0, 105, 163, 0.7) 100%)',
                                                }}
                                            />

                                            <motion.button
                                                type="submit"
                                                disabled={isLoading}
                                                onClick={handleButtonClick}
                                                whileHover={{
                                                    scale: 1.02,
                                                    y: -1.5,
                                                }}
                                                whileTap={{
                                                    scale: 0.96,
                                                    y: 1,
                                                }}
                                                transition={{
                                                    type: 'spring',
                                                    stiffness: 450,
                                                    damping: 22,
                                                }}
                                                className="relative w-full py-2.5 sm:py-3 px-5 rounded-xl text-white font-bold text-xs sm:text-sm overflow-hidden flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed select-none"
                                                style={{
                                                    background: 'linear-gradient(120deg, #cb0f41 0%, #d8164b 25%, #852278 55%, #0069a3 85%, #0284c7 100%)',
                                                    backgroundSize: '200% 100%',
                                                    boxShadow: '0 8px 20px -4px rgba(203, 15, 65, 0.38), 0 6px 16px -4px rgba(0, 105, 163, 0.32)',
                                                    transition: 'background-position 0.6s cubic-bezier(0.4, 0, 0.2, 1), box-shadow 0.3s ease',
                                                }}
                                                onMouseEnter={(e) => {
                                                    e.currentTarget.style.backgroundPosition = '100% 0%';
                                                    e.currentTarget.style.boxShadow = '0 12px 25px -5px rgba(203, 15, 65, 0.45), 0 10px 20px -5px rgba(0, 105, 163, 0.4)';
                                                }}
                                                onMouseLeave={(e) => {
                                                    e.currentTarget.style.backgroundPosition = '0% 0%';
                                                    e.currentTarget.style.boxShadow = '0 8px 20px -4px rgba(203, 15, 65, 0.38), 0 6px 16px -4px rgba(0, 105, 163, 0.32)';
                                                }}
                                            >
                                                <motion.div
                                                    className="absolute inset-y-0 w-1/2 bg-gradient-to-r from-transparent via-white/30 to-transparent skew-x-[-25deg] pointer-events-none"
                                                    initial={{ left: '-100%' }}
                                                    whileHover={{ left: '160%' }}
                                                    transition={{ duration: 0.85, ease: 'easeInOut' }}
                                                />

                                                {ripples.map((ripple) => (
                                                    <motion.span
                                                        key={ripple.id}
                                                        initial={{ scale: 0, opacity: 0.65 }}
                                                        animate={{ scale: 2.2, opacity: 0 }}
                                                        transition={{ duration: 0.65, ease: 'easeOut' }}
                                                        className="absolute bg-white/40 rounded-full pointer-events-none"
                                                        style={{
                                                            left: ripple.x,
                                                            top: ripple.y,
                                                            width: ripple.size,
                                                            height: ripple.size,
                                                        }}
                                                    />
                                                ))}

                                                {isLoading ? (
                                                    <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin relative z-10" />
                                                ) : (
                                                    <span className="relative z-10 tracking-wide font-bold drop-shadow-sm flex items-center gap-2">
                                                        <span>Reset Password</span>
                                                        <ShieldCheck className="w-4 h-4" />
                                                    </span>
                                                )}
                                            </motion.button>
                                        </div>
                                    </form>

                                    <div className="mt-3 sm:mt-4 text-center relative z-10">
                                        <Link
                                            to="/forgot-password"
                                            className="inline-flex items-center gap-1.5 text-[11px] sm:text-xs font-bold text-[#6541e9] hover:underline transition-colors"
                                        >
                                            <ArrowLeft className="w-3.5 h-3.5" />
                                            Back to Forgot Password
                                        </Link>
                                    </div>
                                </>
                            ) : (
                                /* Success screen */
                                <div className="text-center relative z-10 py-3">
                                    <motion.div
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        transition={{ type: 'spring', stiffness: 350, damping: 20 }}
                                        className="w-14 h-14 rounded-2xl bg-emerald-50 border border-emerald-200/80 shadow-md flex items-center justify-center mx-auto mb-4"
                                    >
                                        <CheckCircle2 className="w-7 h-7 text-emerald-600" />
                                    </motion.div>

                                    <h2 className="text-2xl font-black text-[#1e1b4b] tracking-tight">
                                        Password Reset!
                                    </h2>
                                    <p className="text-xs text-slate-500 font-medium mt-1.5 leading-relaxed">
                                        Your password has been securely updated. You can now log in with your new credentials.
                                    </p>
                                    <p className="text-[11px] text-slate-400 mt-2 mb-5">
                                        Redirecting to login automatically...
                                    </p>

                                    <Link
                                        to="/login"
                                        className="block w-full py-3 px-5 rounded-xl text-white font-bold text-xs sm:text-sm text-center shadow-lg hover:shadow-xl transition-all"
                                        style={{
                                            background: 'linear-gradient(120deg, #cb0f41 0%, #d8164b 25%, #852278 55%, #0069a3 85%, #0284c7 100%)',
                                        }}
                                    >
                                        Go to Login Now
                                    </Link>
                                </div>
                            )}
                        </motion.div>
                    </motion.div>
                </div>
            </div>
        </div>
    );
};

export default ResetPassword;