import { useState, useEffect, useContext } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import api from '../api/axios';
import { AuthContext } from '../context/AuthContext';
import {
    Plane,
    Calendar,
    MapPin,
    Clock,
    ChevronRight,
    Search,
    Download,
    Ticket,
    PlaneTakeoff,
    Globe,
    ArrowRight,
    ArrowLeftRight,
    CheckCircle2,
    Settings,
    User as UserIcon,
    FileText,
    MoreHorizontal,
    Briefcase,
    Mail,
    SlidersHorizontal,
    Sparkles,
    ShieldCheck,
    LogOut,
    Bell,
    Compass,
    Plus,
    Building2,
    CheckCircle,
    AlertCircle,
    XCircle,
    Train,
    Bus,
    BusFront
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { generateTicketPDF } from '../utils/generateTicketPDF';
import CityAutocomplete from '../components/CityAutocomplete';

// ── Shining Animated Stars Configurations (Slow & Gentle Ambient Twinkle) ────
const SHINING_SPARKLES = [
    { top: '7%', left: '10%', size: 22, duration: 6.5, delay: 0 },
    { top: '14%', left: '26%', size: 16, duration: 8.0, delay: 2.5 },
    { top: '20%', left: '6%', size: 26, duration: 9.0, delay: 1.0 },
    { top: '32%', left: '46%', size: 18, duration: 7.2, delay: 4.0 },
    { top: '48%', left: '14%', size: 24, duration: 8.5, delay: 1.8 },
    { top: '64%', left: '30%', size: 16, duration: 6.8, delay: 3.2 },
    { top: '76%', left: '8%', size: 20, duration: 9.5, delay: 2.0 },
    { top: '84%', left: '40%', size: 22, duration: 7.0, delay: 0.8 },
    { top: '9%', left: '66%', size: 18, duration: 7.8, delay: 2.2 },
    { top: '16%', left: '90%', size: 24, duration: 8.8, delay: 4.5 },
    { top: '70%', left: '86%', size: 18, duration: 7.4, delay: 1.5 },
    { top: '86%', left: '74%', size: 20, duration: 9.2, delay: 3.5 },
];

const TWINKLE_STARS = [
    { top: '4%', left: '20%', size: 4, duration: 5.2, delay: 0.5 },
    { top: '11%', left: '38%', size: 3, duration: 6.8, delay: 2.4 },
    { top: '18%', left: '16%', size: 5, duration: 6.0, delay: 1.2 },
    { top: '26%', left: '3%', size: 3, duration: 7.5, delay: 3.8 },
    { top: '36%', left: '22%', size: 4, duration: 6.2, delay: 1.8 },
    { top: '42%', left: '3%', size: 3, duration: 7.0, delay: 0.9 },
    { top: '54%', left: '20%', size: 4, duration: 5.8, delay: 3.2 },
    { top: '66%', left: '10%', size: 5, duration: 7.8, delay: 2.1 },
    { top: '74%', left: '26%', size: 3, duration: 5.5, delay: 4.2 },
    { top: '80%', left: '3%', size: 4, duration: 7.2, delay: 2.8 },
    { top: '90%', left: '18%', size: 3, duration: 6.4, delay: 1.0 },
    { top: '5%', left: '80%', size: 4, duration: 6.0, delay: 1.7 },
    { top: '24%', left: '94%', size: 3, duration: 7.6, delay: 3.4 },
    { top: '38%', left: '86%', size: 4, duration: 5.4, delay: 4.6 },
    { top: '58%', left: '92%', size: 3, duration: 6.9, delay: 0.7 },
    { top: '78%', left: '94%', size: 4, duration: 6.3, delay: 3.6 },
];

// ── Interactive Ambient Transport Scene Backdrops ───────────────────────────
const InteractiveFlightBackdrop = ({ mouse }) => {
    return (
        <div className="absolute inset-0 overflow-hidden pointer-events-none select-none">
            {/* Ambient Cosmic Nebula Glow responding smoothly to mouse parallax */}
            <div
                className="absolute -top-24 -right-24 w-[540px] h-[500px] rounded-full transition-transform duration-200 ease-out"
                style={{
                    background: 'radial-gradient(circle, rgba(168, 85, 247, 0.4) 0%, rgba(99, 102, 241, 0.28) 45%, transparent 75%)',
                    filter: 'blur(60px)',
                    transform: `translate3d(${mouse.x * -30}px, ${mouse.y * -20}px, 0)`,
                }}
            />

            {/* Twinkling Flight Star Field */}
            <div className="absolute inset-0">
                {[
                    { top: '15%', left: '16%', delay: 0 },
                    { top: '28%', left: '52%', delay: 1.2 },
                    { top: '68%', left: '28%', delay: 2.1 },
                    { top: '38%', left: '76%', delay: 0.7 },
                    { top: '78%', left: '62%', delay: 1.8 },
                    { top: '22%', left: '88%', delay: 2.5 },
                ].map((s, idx) => (
                    <motion.div
                        key={idx}
                        className="absolute w-1.5 h-1.5 bg-white rounded-full shadow-[0_0_8px_#fff]"
                        style={{ top: s.top, left: s.left }}
                        animate={{ opacity: [0.2, 0.95, 0.2], scale: [0.8, 1.4, 0.8] }}
                        transition={{ duration: 3.2, repeat: Infinity, delay: s.delay, ease: 'easeInOut' }}
                    />
                ))}
            </div>

            {/* Drifting Translucent Flight Clouds */}
            <motion.div
                animate={{ x: [-150, 320] }}
                transition={{ duration: 25, repeat: Infinity, ease: 'linear' }}
                className="absolute top-8 left-6 opacity-25"
                style={{
                    transform: `translate3d(${mouse.x * -35}px, ${mouse.y * -20}px, 0)`,
                }}
            >
                <div className="w-64 h-16 bg-white/40 rounded-full blur-xl" />
            </motion.div>
            <motion.div
                animate={{ x: [260, -180] }}
                transition={{ duration: 30, repeat: Infinity, ease: 'linear' }}
                className="absolute bottom-12 right-1/4 opacity-20"
                style={{
                    transform: `translate3d(${mouse.x * -45}px, ${mouse.y * -25}px, 0)`,
                }}
            >
                <div className="w-80 h-20 bg-indigo-200/50 rounded-full blur-2xl" />
            </motion.div>

            {/* Interactive Airplane Scene with Real-Time Mouse Parallax */}
            <div
                className="absolute right-4 sm:right-10 lg:right-16 top-4 sm:top-8 hidden md:block transition-transform duration-150 ease-out"
                style={{
                    transform: `translate3d(${mouse.x * 32}px, ${mouse.y * 22}px, 0) rotate(${mouse.x * 3}deg)`,
                }}
            >
                <motion.div
                    animate={{ y: [0, -10, 0] }}
                    transition={{ duration: 5.5, repeat: Infinity, ease: 'easeInOut' }}
                    className="relative"
                >
                    <svg
                        viewBox="0 0 280 240"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                        className="w-64 sm:w-80 lg:w-96 h-48 sm:h-56 lg:h-64 drop-shadow-[0_20px_45px_rgba(0,0,0,0.45)]"
                    >
                        <defs>
                            <radialGradient id="flight-halo" cx="50%" cy="50%" r="50%">
                                <stop offset="0%" stopColor="#c084fc" stopOpacity="0.45" />
                                <stop offset="100%" stopColor="#818cf8" stopOpacity="0" />
                            </radialGradient>
                            <linearGradient id="contrail-glow" x1="0%" y1="100%" x2="100%" y2="0%">
                                <stop offset="0%" stopColor="#ffffff" stopOpacity="0" />
                                <stop offset="65%" stopColor="#ffffff" stopOpacity="0.3" />
                                <stop offset="100%" stopColor="#ffffff" stopOpacity="0.75" />
                            </linearGradient>
                        </defs>

                        {/* Glowing Jet Contrail Streak */}
                        <line
                            x1="22"
                            y1="212"
                            x2="142"
                            y2="132"
                            stroke="url(#contrail-glow)"
                            strokeWidth="3.5"
                            strokeLinecap="round"
                        />
                        <motion.circle
                            r="3"
                            fill="#ffffff"
                            animate={{
                                cx: [22, 142],
                                cy: [212, 132],
                                opacity: [0, 0.9, 0]
                            }}
                            transition={{ duration: 1.8, repeat: Infinity, ease: 'linear' }}
                        />

                        {/* Ambient Aura Halo */}
                        <circle cx="165" cy="105" r="75" fill="url(#flight-halo)" />

                        {/* Clean Rounded Airplane (Matches User's Preferred Watermark) */}
                        <g transform="translate(165, 105) rotate(-45)">
                            <path
                                d="M 0 -48 C 10 -48, 12 -38, 12 -22 L 12 -12 L 55 14 C 60 17, 60 23, 55 25 C 50 27, 46 25, 41 22 L 12 6 L 12 36 L 28 47 C 30 49, 30 53, 28 55 C 26 56, 22 55, 19 53 L 12 48 L 12 55 C 12 59, 6 62, 0 62 C -6 62, -12 59, -12 55 L -12 48 L -19 53 C -22 55, -26 56, -28 55 C -30 53, -30 49, -28 47 L -12 36 L -12 6 L -41 22 C -46 25, -50 27, -55 25 C -60 23, -60 17, -55 14 L -12 -12 L -12 -22 C -12 -38, -10 -48, 0 -48 Z"
                                stroke="rgba(255, 255, 255, 0.55)"
                                strokeWidth="11"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                fill="rgba(255, 255, 255, 0.08)"
                            />

                            {/* Pulsing Wingtip & Tail Navigation Beacon Lights */}
                            <circle cx="53" cy="19" r="4" fill="#22c55e" className="animate-ping" />
                            <circle cx="-53" cy="19" r="4" fill="#ef4444" className="animate-ping" />
                            <circle cx="0" cy="58" r="3" fill="#ffffff" className="animate-pulse" />
                        </g>
                    </svg>
                </motion.div>
            </div>
        </div>
    );
};

const InteractiveTrainBackdrop = ({ mouse }) => {
    return (
        <div className="absolute inset-0 overflow-hidden pointer-events-none select-none">
            {/* Ambient Emerald & Sapphire Glow */}
            <div
                className="absolute -top-24 -right-24 w-[540px] h-[480px] rounded-full transition-transform duration-200 ease-out"
                style={{
                    background: 'radial-gradient(circle, rgba(16, 185, 129, 0.35) 0%, rgba(37, 99, 235, 0.25) 50%, transparent 75%)',
                    filter: 'blur(55px)',
                    transform: `translate3d(${mouse.x * -25}px, ${mouse.y * -18}px, 0)`,
                }}
            />

            {/* High-Speed Dynamic Electric Railway Track Perspective */}
            <div className="absolute inset-x-0 bottom-3 h-28 overflow-hidden">
                <svg viewBox="0 0 900 110" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full opacity-65">
                    {/* Glowing Steel Rails */}
                    <line x1="0" y1="55" x2="900" y2="55" stroke="#10b981" strokeWidth="4.5" strokeOpacity="0.85" />
                    <line x1="0" y1="80" x2="900" y2="80" stroke="#38bdf8" strokeWidth="3.5" strokeOpacity="0.7" />

                    {/* Sleepers (Railway ties) */}
                    {Array.from({ length: 28 }).map((_, i) => (
                        <line
                            key={i}
                            x1={i * 34 + 10}
                            y1="45"
                            x2={i * 34}
                            y2="92"
                            stroke="#ffffff"
                            strokeWidth="3.5"
                            strokeLinecap="round"
                            strokeOpacity="0.3"
                        />
                    ))}

                    {/* Racing Electric Light Pulses */}
                    <motion.circle
                        cx="0"
                        cy="55"
                        r="6"
                        fill="#34d399"
                        animate={{ cx: [0, 900] }}
                        transition={{ duration: 1.6, repeat: Infinity, ease: 'linear' }}
                    />
                    <motion.circle
                        cx="0"
                        cy="80"
                        r="5"
                        fill="#60a5fa"
                        animate={{ cx: [0, 900] }}
                        transition={{ duration: 2.0, repeat: Infinity, ease: 'linear', delay: 0.5 }}
                    />
                </svg>
            </div>

            {/* Interactive Bullet Train Scene */}
            <div
                className="absolute right-4 sm:right-12 lg:right-20 top-6 sm:top-10 hidden md:block transition-transform duration-150 ease-out"
                style={{
                    transform: `translate3d(${mouse.x * 35}px, ${mouse.y * 25}px, 0)`,
                }}
            >
                <motion.div
                    animate={{ x: [0, 10, 0], y: [0, -4, 0] }}
                    transition={{ duration: 4.5, repeat: Infinity, ease: 'easeInOut' }}
                    className="relative"
                >
                    <svg
                        viewBox="0 0 280 180"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                        className="w-72 sm:w-88 lg:w-[26rem] h-48 sm:h-56 lg:h-64 text-white drop-shadow-[0_20px_45px_rgba(0,0,0,0.55)]"
                    >
                        <defs>
                            <radialGradient id="train-halo" cx="50%" cy="50%" r="50%">
                                <stop offset="0%" stopColor="#10b981" stopOpacity="0.45" />
                                <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
                            </radialGradient>
                            <linearGradient id="headlight-beam" x1="0%" y1="50%" x2="100%" y2="50%">
                                <stop offset="0%" stopColor="#fef08a" stopOpacity="0.8" />
                                <stop offset="100%" stopColor="#fef08a" stopOpacity="0" />
                            </linearGradient>
                        </defs>

                        {/* Headlight Beam projecting forward */}
                        <polygon points="232,84 280,68 280,108" fill="url(#headlight-beam)" opacity="0.65" />

                        {/* Glow halo */}
                        <circle cx="140" cy="80" r="75" fill="url(#train-halo)" />

                        {/* Bullet Train Shell */}
                        <path
                            d="M 20 104 L 175 104 C 215 104 245 92 254 74 C 248 54 212 44 175 44 L 20 44 C 14 44 10 49 10 56 L 10 92 C 10 99 14 104 20 104 Z"
                            stroke="rgba(255,255,255,0.92)"
                            strokeWidth="8"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            fill="rgba(255,255,255,0.15)"
                        />

                        {/* Streamlined Cockpit Windscreen */}
                        <path
                            d="M 185 53 L 226 62 C 220 75 204 80 185 80 Z"
                            stroke="#ffffff"
                            strokeWidth="6"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            fill="rgba(56, 189, 248, 0.45)"
                        />

                        {/* Glowing Passenger Windows */}
                        <rect x="30" y="58" width="24" height="18" rx="4" stroke="#ffffff" strokeWidth="5" fill="rgba(254, 240, 138, 0.35)" />
                        <rect x="66" y="58" width="24" height="18" rx="4" stroke="#ffffff" strokeWidth="5" fill="rgba(254, 240, 138, 0.35)" />
                        <rect x="102" y="58" width="24" height="18" rx="4" stroke="#ffffff" strokeWidth="5" fill="rgba(254, 240, 138, 0.35)" />
                        <rect x="138" y="58" width="24" height="18" rx="4" stroke="#ffffff" strokeWidth="5" fill="rgba(254, 240, 138, 0.35)" />

                        {/* High-speed Racing Stripe */}
                        <line x1="20" y1="92" x2="205" y2="92" stroke="#34d399" strokeWidth="5" strokeLinecap="round" />

                        {/* Dual Headlights */}
                        <circle cx="244" cy="80" r="5" fill="#fef08a" className="animate-pulse" />
                        <circle cx="240" cy="74" r="3" fill="#ffffff" />

                        {/* Roof Pantograph (Power collector) */}
                        <path d="M 90 44 L 105 28 L 120 44" stroke="#ffffff" strokeWidth="4" strokeLinecap="round" />
                        <line x1="95" y1="28" x2="115" y2="28" stroke="#38bdf8" strokeWidth="4" strokeLinecap="round" />
                    </svg>
                </motion.div>
            </div>
        </div>
    );
};

const InteractiveBusBackdrop = ({ mouse }) => {
    return (
        <div className="absolute inset-0 overflow-hidden pointer-events-none select-none">
            {/* Ambient Crimson & Amber Glow */}
            <div
                className="absolute -top-24 -right-24 w-[540px] h-[480px] rounded-full transition-transform duration-200 ease-out"
                style={{
                    background: 'radial-gradient(circle, rgba(239, 68, 68, 0.35) 0%, rgba(245, 158, 11, 0.28) 50%, transparent 75%)',
                    filter: 'blur(55px)',
                    transform: `translate3d(${mouse.x * -25}px, ${mouse.y * -18}px, 0)`,
                }}
            />

            {/* High-Speed Expressway Highway Road Surface */}
            <div className="absolute inset-x-0 bottom-3 h-28 overflow-hidden">
                <svg viewBox="0 0 900 110" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full opacity-65">
                    {/* Asphalt boundary lines */}
                    <line x1="0" y1="55" x2="900" y2="55" stroke="#f43f5e" strokeWidth="4.5" strokeOpacity="0.85" />
                    <line x1="0" y1="82" x2="900" y2="82" stroke="#fbbf24" strokeWidth="3.5" strokeOpacity="0.7" />

                    {/* Highway dashed center lane markers rushing past */}
                    <motion.line
                        x1="0"
                        y1="68"
                        x2="900"
                        y2="68"
                        stroke="#fef08a"
                        strokeWidth="4"
                        strokeDasharray="30 22"
                        animate={{ strokeDashoffset: [0, -104] }}
                        transition={{ duration: 1.1, repeat: Infinity, ease: 'linear' }}
                    />
                </svg>
            </div>

            {/* Interactive Luxury Touring Coach Scene */}
            <div
                className="absolute right-4 sm:right-12 lg:right-20 top-6 sm:top-10 hidden md:block transition-transform duration-150 ease-out"
                style={{
                    transform: `translate3d(${mouse.x * 35}px, ${mouse.y * 25}px, 0)`,
                }}
            >
                <motion.div
                    animate={{ x: [0, 8, 0], y: [0, -3, 0] }}
                    transition={{ duration: 3.8, repeat: Infinity, ease: 'easeInOut' }}
                    className="relative"
                >
                    <svg
                        viewBox="0 0 280 180"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                        className="w-72 sm:w-88 lg:w-[26rem] h-48 sm:h-56 lg:h-64 text-white drop-shadow-[0_20px_45px_rgba(0,0,0,0.55)]"
                    >
                        <defs>
                            <radialGradient id="bus-halo" cx="50%" cy="50%" r="50%">
                                <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.45" />
                                <stop offset="100%" stopColor="#ef4444" stopOpacity="0" />
                            </radialGradient>
                            <linearGradient id="bus-headlight" x1="0%" y1="50%" x2="100%" y2="50%">
                                <stop offset="0%" stopColor="#fef08a" stopOpacity="0.85" />
                                <stop offset="100%" stopColor="#fef08a" stopOpacity="0" />
                            </linearGradient>
                        </defs>

                        {/* Headlight Beam illuminating forward */}
                        <polygon points="230,86 280,68 280,112" fill="url(#bus-headlight)" opacity="0.7" />

                        {/* Glow halo */}
                        <circle cx="140" cy="80" r="75" fill="url(#bus-halo)" />

                        {/* Luxury Coach Shell */}
                        <path
                            d="M 22 106 L 195 106 C 220 106 242 96 244 76 C 246 54 226 42 200 42 L 28 42 C 18 42 14 48 14 58 L 14 94 C 14 102 18 106 22 106 Z"
                            stroke="rgba(255,255,255,0.92)"
                            strokeWidth="8"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            fill="rgba(255,255,255,0.15)"
                        />

                        {/* Panoramic Double-Decker Windscreen */}
                        <path
                            d="M 180 50 L 226 54 C 230 64 226 76 215 78 L 180 78 Z"
                            stroke="#ffffff"
                            strokeWidth="6"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            fill="rgba(251, 191, 36, 0.4)"
                        />

                        {/* Panoramic Touring Windows */}
                        <rect x="32" y="52" width="28" height="24" rx="4" stroke="#ffffff" strokeWidth="5" fill="rgba(254, 240, 138, 0.3)" />
                        <rect x="70" y="52" width="28" height="24" rx="4" stroke="#ffffff" strokeWidth="5" fill="rgba(254, 240, 138, 0.3)" />
                        <rect x="108" y="52" width="28" height="24" rx="4" stroke="#ffffff" strokeWidth="5" fill="rgba(254, 240, 138, 0.3)" />
                        <rect x="146" y="52" width="20" height="24" rx="4" stroke="#ffffff" strokeWidth="5" fill="rgba(254, 240, 138, 0.3)" />

                        {/* Side Highway Racing Stripe */}
                        <line x1="22" y1="92" x2="225" y2="92" stroke="#f59e0b" strokeWidth="5" strokeLinecap="round" />

                        {/* Multi-Axle Wheels */}
                        <circle cx="64" cy="110" r="14" stroke="#ffffff" strokeWidth="5" fill="#1e1b4b" />
                        <circle cx="64" cy="110" r="5" fill="#f59e0b" />

                        <circle cx="178" cy="110" r="14" stroke="#ffffff" strokeWidth="5" fill="#1e1b4b" />
                        <circle cx="178" cy="110" r="5" fill="#f59e0b" />

                        {/* Front Headlights & Rear Taillight Strobe */}
                        <circle cx="236" cy="88" r="5" fill="#fef08a" className="animate-pulse" />
                        <rect x="14" y="70" width="4" height="20" rx="2" fill="#ef4444" className="animate-pulse" />
                    </svg>
                </motion.div>
            </div>
        </div>
    );
};

const TRAVEL_MODE_CONFIG = {
    Flight: {
        id: 'Flight',
        name: 'Flights',
        emoji: '✈️',
        icon: Plane,
        portalTag: 'MMT',
        badgeText: 'CORPORATE FLIGHT BOOKING ENGINE • COMMERCIAL AIRLINES',
        heroTitlePrefix: 'Plan Your',
        heroTitleHighlight: 'Next Business Flight.',
        heroSubtitle: 'Instant corporate approval, flexible schedules, and verified flight itineraries for Nikitha employees.',
        originLabel: 'From (Origin)',
        originPlaceholder: 'e.g. Delhi (DEL)',
        destinationLabel: 'To (Destination)',
        destinationPlaceholder: 'e.g. Abu Dhabi (AUH)',
        departureLabel: 'Departure Date',
        returnLabel: 'Return Date',
        submitText: 'Submit Flight Request',
        gradient: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 25%, #4338ca 50%, #6366f1 75%, #a855f7 100%)',
        backdropComponent: InteractiveFlightBackdrop,
        pillGradient: 'from-blue-600 to-indigo-600',
        glowBorder: 'rgba(99, 102, 241, 0.45)',
        classOptions: ['Domestic', 'International'],
        classLabel: 'Sector Classification',
        defaultClass: 'Domestic',
        purposePlaceholder: 'e.g. Client Onsite Meeting / HQ Strategic Review'
    },
    Train: {
        id: 'Train',
        name: 'Trains',
        emoji: '🚆',
        icon: Train,
        portalTag: 'IRCTC',
        badgeText: 'INDIAN RAILWAYS CORPORATE DESK • IRCTC PREMIUM BOOKING',
        heroTitlePrefix: 'Book Your',
        heroTitleHighlight: 'Corporate Train Journey.',
        heroSubtitle: 'Confirm Vande Bharat, Rajdhani, Shatabdi & Express train berths with corporate travel priority.',
        originLabel: 'Boarding Station',
        originPlaceholder: 'e.g. New Delhi (NDLS)',
        destinationLabel: 'Destination Station',
        destinationPlaceholder: 'e.g. Mumbai Central (MMCT)',
        departureLabel: 'Journey Date',
        returnLabel: 'Return Date',
        submitText: 'Submit Train Request',
        gradient: 'linear-gradient(135deg, #091e3a 0%, #173868 25%, #1e4b8a 50%, #2563eb 75%, #059669 100%)',
        backdropComponent: InteractiveTrainBackdrop,
        pillGradient: 'from-emerald-600 to-teal-500',
        glowBorder: 'rgba(16, 185, 129, 0.45)',
        classOptions: [
            'AC 1st Class (1A)',
            'AC 2 Tier (2A)',
            'AC 3 Tier (3A)',
            'Executive Chair Car (EC)',
            'AC Chair Car (CC)',
            'Sleeper Class (SL)'
        ],
        classLabel: 'Rail Class Preference',
        defaultClass: 'AC 2 Tier (2A)',
        purposePlaceholder: 'e.g. Regional Branch Audit / Plant Inspection'
    },
    Bus: {
        id: 'Bus',
        name: 'Buses',
        emoji: '🚌',
        icon: Bus,
        portalTag: 'redBus',
        badgeText: 'CORPORATE INTERCITY COACH DESK • REDBUS EXPRESS HIGHWAY',
        heroTitlePrefix: 'Book Your',
        heroTitleHighlight: 'Intercity Bus Journey.',
        heroSubtitle: 'AC Sleeper, Volvo Multi-Axle & Luxury intercity express coach reservations with guaranteed seats.',
        originLabel: 'Boarding Point',
        originPlaceholder: 'e.g. Bengaluru (BLR)',
        destinationLabel: 'Drop-off Point',
        destinationPlaceholder: 'e.g. Hyderabad (HYD)',
        departureLabel: 'Travel Date',
        returnLabel: 'Return Date',
        submitText: 'Submit Bus Ticket',
        gradient: 'linear-gradient(135deg, #370617 0%, #6a040f 25%, #9d0208 50%, #d00000 75%, #ea580c 100%)',
        backdropComponent: InteractiveBusBackdrop,
        pillGradient: 'from-rose-600 to-amber-500',
        glowBorder: 'rgba(244, 63, 94, 0.45)',
        classOptions: [
            'AC Sleeper (2+1)',
            'Volvo Multi-Axle AC',
            'AC Seater / Semi-Sleeper',
            'Non-AC Sleeper',
            'Luxury Coach'
        ],
        classLabel: 'Bus Type Preference',
        defaultClass: 'AC Sleeper (2+1)',
        purposePlaceholder: 'e.g. Field Inspection / Regional Vendor Conference'
    }
};

const EmployeeDashboard = () => {
    const { user, logout } = useContext(AuthContext);
    const navigate = useNavigate();
    const location = useLocation();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    // Get today's local date as yyyy-mm-dd
    const getTodayLocal = () => {
        const now = new Date();
        const yyyy = now.getFullYear();
        const mm = String(now.getMonth() + 1).padStart(2, '0');
        const dd = String(now.getDate()).padStart(2, '0');
        return `${yyyy}-${mm}-${dd}`;
    };
    const todayLocal = getTodayLocal();

    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('book'); // 'book' | 'manage' | 'checkin' | 'details' | 'contacts' | 'flight'
    const [topNavTab, setTopNavTab] = useState('Listings'); // 'Listings' | 'Policy' | 'Billing' | 'Reports'
    const [searchQuery, setSearchQuery] = useState('');
    const [showAdvancedForm, setShowAdvancedForm] = useState(false);
    const [bookingFilter, setBookingFilter] = useState('ALL'); // 'ALL' | 'APPROVED' | 'PENDING' | 'BOOKED' | 'REJECTED'
    const [ripples, setRipples] = useState([]);

    const applyRegistryFilter = (filterKey) => {
        if (!filterKey) return;
        const normalized = filterKey.toUpperCase();
        setBookingFilter(normalized);
        setActiveTab('manage');
        setTimeout(() => {
            const el = document.getElementById('my-travel-registry');
            if (el) {
                el.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        }, 120);
    };

    const handleFilterChange = (filter) => {
        setBookingFilter(filter);
        navigate(`/employee?filter=${filter}`, { replace: true });
    };

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const tabParam = params.get('tab');
        if (tabParam && ['book', 'manage', 'checkin', 'flight', 'details'].includes(tabParam)) {
            setActiveTab(tabParam);
        }
        const filterParam = params.get('filter');
        if (filterParam) {
            applyRegistryFilter(filterParam);
        }
    }, [location.search]);

    useEffect(() => {
        const handler = (e) => {
            if (e.detail) {
                applyRegistryFilter(e.detail);
            }
        };
        const tabHandler = (e) => {
            if (e.detail && ['book', 'manage', 'checkin', 'flight', 'details'].includes(e.detail)) {
                setActiveTab(e.detail);
            }
        };
        window.addEventListener('filter-travel-registry', handler);
        window.addEventListener('employee-tab-change', tabHandler);
        return () => {
            window.removeEventListener('filter-travel-registry', handler);
            window.removeEventListener('employee-tab-change', tabHandler);
        };
    }, []);

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const currentTabInUrl = params.get('tab');
        if (currentTabInUrl !== activeTab) {
            params.set('tab', activeTab);
            navigate(`/employee?${params.toString()}`, { replace: true });
        }
        window.dispatchEvent(new CustomEvent('employee-tab-change', { detail: activeTab }));
    }, [activeTab]);

    const [formData, setFormData] = useState({
        fromLocation: '',
        toLocation: '',
        departureDate: '',
        returnDate: '',
        travelMode: 'Flight',
        travelType: 'Domestic',
        tripType: 'one-way',
        preferredTime: '',
        preferredReturnTime: '',
        purpose: ''
    });

    const activeModeConfig = TRAVEL_MODE_CONFIG[formData.travelMode] || TRAVEL_MODE_CONFIG.Flight;
    const ActiveModeIcon = activeModeConfig.icon;

    const handleModeChange = (newMode) => {
        setFormData(prev => ({
            ...prev,
            travelMode: newMode,
            travelType: TRAVEL_MODE_CONFIG[newMode]?.defaultClass || prev.travelType
        }));
    };

    const [heroMouse, setHeroMouse] = useState({ x: 0, y: 0 });

    const handleHeroMouseMove = (e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width - 0.5;
        const y = (e.clientY - rect.top) / rect.height - 0.5;
        setHeroMouse({ x, y });
    };

    const handleHeroMouseLeave = () => {
        setHeroMouse({ x: 0, y: 0 });
    };

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

    const filteredRequests = (() => {
        let list = requests;
        if (bookingFilter && bookingFilter !== 'ALL') {
            if (bookingFilter === 'PENDING') {
                list = list.filter(r => r.status === 'SUBMITTED' || r.status === 'PENDING');
            } else if (bookingFilter === 'APPROVED') {
                list = list.filter(r => r.status === 'APPROVED' || r.status === 'BOOKED');
            } else if (bookingFilter === 'BOOKED') {
                list = list.filter(r => r.status === 'BOOKED');
            } else if (bookingFilter === 'REJECTED') {
                list = list.filter(r => r.status === 'REJECTED');
            }
        }
        if (searchQuery.trim()) {
            const q = searchQuery.toLowerCase();
            list = list.filter(r =>
                r.fromLocation?.toLowerCase().includes(q) ||
                r.toLocation?.toLowerCase().includes(q) ||
                r.purpose?.toLowerCase().includes(q) ||
                r.status?.toLowerCase().includes(q) ||
                (r.id && r.id.toString().includes(q))
            );
        }
        return list;
    })();

    const fetchRequests = async () => {
        if (!user?.id) return;
        try {
            setLoading(true);
            const res = await api.get(`/requests/employee/${user.id}`);
            setRequests(res.data);
        } catch (error) {
            console.error('Fetch failed', error);
            toast.error('Failed to sync history');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!user?.accessToken) {
            navigate('/login');
            return;
        }
        fetchRequests();
    }, [user?.accessToken, navigate]);

    const handleSwapLocations = () => {
        setFormData(prev => ({
            ...prev,
            fromLocation: prev.toLocation,
            toLocation: prev.fromLocation
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!user?.id) return;

        if (!formData.fromLocation || !formData.toLocation || !formData.departureDate) {
            toast.error('Please enter origin, destination, and departure date');
            return;
        }

        const loadToast = toast.loading('Submitting corporate requisition...');
        try {
            const payload = {
                ...formData,
                returnDate: formData.tripType === 'round-trip' ? formData.returnDate : null,
            };

            await api.post(`/requests/${user.id}`, payload);
            toast.success('Corporate travel requisition logged successfully!', { id: loadToast });
            setFormData({
                fromLocation: '',
                toLocation: '',
                departureDate: '',
                returnDate: '',
                travelMode: 'Flight',
                travelType: 'Domestic',
                tripType: 'one-way',
                preferredTime: '',
                preferredReturnTime: '',
                purpose: ''
            });
            setShowAdvancedForm(false);
            fetchRequests();
            setActiveTab('manage');
        } catch (error) {
            console.error('Submission failed', error);
            const status = error.response?.status;
            if (status === 401) {
                toast.error('Unauthorized. Please log in again.', { id: loadToast });
                navigate('/login');
                return;
            }
            const message = error.response?.data || error.message || 'Submission failed';
            toast.error(message, { id: loadToast });
        }
    };

    const handleDownloadTicket = async (request, type = 'departure') => {
        const isReturn = type === 'return';
        const label = isReturn ? 'Return' : 'E-Ticket';
        const toastId = toast.loading(`Downloading ${label}...`);

        try {
            const hasFile = isReturn ? request.returnTicketPath : request.ticketPath;
            const endpoint = isReturn ? `/requests/${request.id}/return-ticket` : `/requests/${request.id}/ticket`;

            if (hasFile) {
                const response = await api.get(endpoint, { responseType: 'blob' });
                const url = window.URL.createObjectURL(new Blob([response.data], { type: response.headers['content-type'] }));
                const disposition = response.headers['content-disposition'];
                let filename = isReturn ? `return-ticket-${request.id}.pdf` : `ticket-${request.id}.pdf`;
                if (disposition) {
                    const match = disposition.match(/filename="?([^";]+)"?/);
                    if (match && match[1]) filename = match[1];
                }
                const link = document.createElement('a');
                link.href = url;
                link.setAttribute('download', filename);
                document.body.appendChild(link);
                link.click();
                link.remove();
                window.URL.revokeObjectURL(url);
                toast.success(`${label} downloaded successfully`, { id: toastId });
                return;
            }

            if (!isReturn) {
                generateTicketPDF(request);
                toast.success('Ticket generated successfully', { id: toastId });
            } else {
                toast.error('Return ticket not uploaded yet', { id: toastId });
            }
        } catch (error) {
            console.error('PDF Error:', error);
            toast.error(`Failed to download ${label.toLowerCase()}`, { id: toastId });
        }
    };

    const getStatusStyle = (status) => {
        switch (status) {
            case 'PENDING':
            case 'SUBMITTED':
                return 'bg-amber-50 text-amber-700 border-amber-200/80';
            case 'APPROVED':
                return 'bg-emerald-50 text-emerald-700 border-emerald-200/80';
            case 'REJECTED':
                return 'bg-rose-50 text-rose-700 border-rose-200/80';
            case 'BOOKED':
                return 'bg-blue-50 text-blue-700 border-blue-200/80';
            default:
                return 'bg-slate-50 text-slate-700 border-slate-200/80';
        }
    };

    // Destination curated photos
    const destinationPhotos = [
        'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=800&q=80', // Dubai
        'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80', // Athens
        'https://images.unsplash.com/photo-1525625293386-3f8f99389edd?auto=format&fit=crop&w=800&q=80', // Singapore
        'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=800&q=80', // Paris
        'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?auto=format&fit=crop&w=800&q=80', // London
    ];

    const userInitials = (user?.name || user?.email || 'AP')
        .split(' ')
        .map(n => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);

    const pendingCount = requests.filter(r => r.status === 'PENDING' || r.status === 'SUBMITTED').length;
    const bookedCount = requests.filter(r => r.status === 'BOOKED').length;

    return (
        <div
            className="w-full min-h-screen relative p-4 sm:p-6 lg:p-10 pt-6 sm:pt-8 lg:pt-10 pb-24 animate-fadeIn"
            style={{
                background: 'linear-gradient(135deg, #2a1e80 0%, #462ebc 28%, #6742db 50%, #9e59be 75%, #df8785 100%)',
                backgroundAttachment: 'fixed',
            }}
        >
            {/* ═══════════ FIXED ANIMATED BACKGROUND ATMOSPHERE ═══════════ */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
                {/* 1. Soft glowing cloud-like bokeh orbs drifting across sky */}
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

                {/* Global Star Gradient Definition */}
                <svg className="absolute w-0 h-0 pointer-events-none" aria-hidden="true">
                    <defs>
                        <radialGradient id="starGleamEmployee" cx="50%" cy="50%" r="50%">
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
                        key={`emp-sparkle-${idx}`}
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
                        <svg viewBox="0 0 24 24" fill="none" className="w-full h-full drop-shadow-[0_0_10px_rgba(255,255,255,0.95)]">
                            <path
                                d="M12 0C12 6.627 6.627 12 0 12C6.627 12 12 17.373 12 24C12 17.373 17.373 12 24 12C17.373 12 12 6.627 12 0Z"
                                fill="url(#starGleamEmployee)"
                            />
                            <circle cx="12" cy="12" r="3" fill="#ffffff" />
                        </svg>
                    </motion.div>
                ))}

                {/* 2. Twinkling Night Sky Stars */}
                {TWINKLE_STARS.map((star, idx) => (
                    <motion.div
                        key={`emp-twinkle-${idx}`}
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

                {/* 3. Shooting Star Meteor Trails */}
                <motion.div
                    className="absolute pointer-events-none"
                    style={{
                        top: '10%',
                        left: '15%',
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
                        repeatDelay: 8,
                        ease: 'easeOut',
                    }}
                />
            </div>

            {/* ═══════════ MAIN CONTENT WRAPPER ═══════════ */}
            <div className="w-full max-w-7xl mx-auto relative z-10 space-y-8">
                {/* ── 1. CINEMATIC EXECUTIVE HEADER ───────────────────────── */}
                <div className="relative">
                    {/* Soaring passenger jet with smooth gliding contrail */}
                    <div className="absolute top-2 right-4 pointer-events-none opacity-90 hidden lg:block">
                        <div className="relative">
                            <svg className="w-64 h-16 overflow-visible" viewBox="0 0 260 60" fill="none">
                                <motion.path
                                    d="M 10 50 Q 120 40, 240 15"
                                    stroke="url(#heroPlaneContrailEmployee)"
                                    strokeWidth="2"
                                    strokeDasharray="5 5"
                                    initial={{ pathLength: 0, opacity: 0 }}
                                    animate={{ pathLength: 1, opacity: 0.85 }}
                                    transition={{ duration: 1.6, ease: 'easeOut' }}
                                />
                                <defs>
                                    <linearGradient id="heroPlaneContrailEmployee" x1="0%" y1="100%" x2="100%" y2="0%">
                                        <stop offset="0%" stopColor="#ffffff" stopOpacity="0.05" />
                                        <stop offset="60%" stopColor="#ffffff" stopOpacity="0.5" />
                                        <stop offset="100%" stopColor="#ffffff" stopOpacity="0.95" />
                                    </linearGradient>
                                </defs>
                            </svg>
                            <motion.div
                                className="absolute -top-1 right-2"
                                animate={{ x: [0, 6, -4, 0], y: [0, -4, 3, 0], rotate: [28, 32, 26, 28] }}
                                transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
                            >
                                <PlaneTakeoff className="w-8 h-8 text-white drop-shadow-[0_2px_12px_rgba(255,255,255,0.7)]" />
                            </motion.div>
                        </div>
                    </div>

                    <div className="max-w-3xl">
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5 }}
                            className="inline-flex items-center px-4 py-1.5 rounded-full bg-white/15 backdrop-blur-md border border-white/25 text-[11px] font-black uppercase tracking-[0.2em] text-white shadow-sm mb-4"
                        >
                            CORPORATE MOBILITY DESK • EMPLOYEE FLIGHT PORTAL
                        </motion.div>

                        <motion.h1
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: 0.1 }}
                            className="text-4xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-[1.05] mb-3 drop-shadow-md"
                        >
                            Plan &amp; Manage
                            <br />
                            <span className="text-white">Corporate Travel.</span>
                        </motion.h1>

                        <motion.p
                            initial={{ opacity: 0, y: 15 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: 0.2 }}
                            className="text-sm sm:text-base text-white/90 font-medium leading-relaxed max-w-xl"
                        >
                            Reserve corporate flights, track manager authorizations in real-time, and download verified e-tickets.
                        </motion.p>
                    </div>
                </div>

                {/* ── 2. STATS ROW (4 COMPACT CARDS) ──────────────────────────────── */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-3.5">
                    {/* Card 1: Total Bookings */}
                    <motion.div
                        whileHover={{ y: -3, scale: 1.015 }}
                        whileTap={{ scale: 0.98 }}
                        transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                        onClick={() => applyRegistryFilter('ALL')}
                        className={`p-4 sm:p-4.5 rounded-2xl cursor-pointer transition-all duration-300 relative overflow-hidden bg-white border border-white/80 shadow-[0_12px_30px_-10px_rgba(20,10,60,0.1)] group ${
                            activeTab === 'manage' && bookingFilter === 'ALL'
                                ? 'border-[#6541e9] ring-2 ring-indigo-100/70 shadow-indigo-500/15'
                                : 'hover:border-indigo-100 hover:shadow-lg'
                        }`}
                    >
                        {/* Subtle Watermark Glyph in background corner */}
                        <div className="absolute -right-2 -bottom-2 opacity-[0.04] group-hover:opacity-[0.07] transition-opacity pointer-events-none">
                            <Compass className="w-20 h-20 text-slate-900" />
                        </div>

                        <div className="flex items-center justify-between relative z-10">
                            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-tr from-[#6541e9] to-[#818cf8] text-white flex items-center justify-center shadow-md shadow-indigo-500/25 group-hover:scale-105 transition-transform">
                                <Compass className="w-4 h-4 text-white" />
                            </div>
                            <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-indigo-50 text-[#6541e9] border border-indigo-100/80 flex items-center gap-1 shadow-2xs">
                                <span className="w-1.5 h-1.5 rounded-full bg-[#6541e9] animate-pulse" />
                                All Trips
                            </span>
                        </div>

                        <div className="mt-2.5 relative z-10">
                            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">
                                Total Bookings
                            </span>
                            <div className="flex items-baseline gap-1.5 mt-0.5">
                                <p className="text-2xl font-black tracking-tight text-slate-900">
                                    {requests.length}
                                </p>
                                <span className="text-[11px] font-bold text-slate-400">
                                    {requests.length === 1 ? 'trip' : 'trips'}
                                </span>
                            </div>
                            <span className="text-[11px] text-slate-400 font-medium block truncate">
                                All logged itineraries
                            </span>
                        </div>
                    </motion.div>

                    {/* Card 2: Confirmed Tickets */}
                    <motion.div
                        whileHover={{ y: -3, scale: 1.015 }}
                        whileTap={{ scale: 0.98 }}
                        transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                        onClick={() => applyRegistryFilter('BOOKED')}
                        className={`p-4 sm:p-4.5 rounded-2xl cursor-pointer transition-all duration-300 relative overflow-hidden bg-white border border-white/80 shadow-[0_12px_30px_-10px_rgba(20,10,60,0.1)] group ${
                            bookingFilter === 'BOOKED' && activeTab === 'manage'
                                ? 'border-emerald-500 ring-2 ring-emerald-100/70 shadow-emerald-500/15'
                                : 'hover:border-emerald-100 hover:shadow-lg'
                        }`}
                    >
                        <div className="absolute -right-2 -bottom-2 opacity-[0.04] group-hover:opacity-[0.07] transition-opacity pointer-events-none">
                            <Ticket className="w-20 h-20 text-slate-900" />
                        </div>

                        <div className="flex items-center justify-between relative z-10">
                            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 text-white flex items-center justify-center shadow-md shadow-emerald-500/25 group-hover:scale-105 transition-transform">
                                <Ticket className="w-4 h-4 text-white" />
                            </div>
                            <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-100/80 flex items-center gap-1 shadow-2xs">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                Confirmed
                            </span>
                        </div>

                        <div className="mt-2.5 relative z-10">
                            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">
                                Confirmed Tickets
                            </span>
                            <div className="flex items-baseline gap-1.5 mt-0.5">
                                <p className="text-2xl font-black tracking-tight text-slate-900">
                                    {bookedCount}
                                </p>
                                <span className="text-[11px] font-bold text-emerald-600">
                                    {bookedCount > 0 ? 'Verified' : 'None'}
                                </span>
                            </div>
                            <span className="text-[11px] text-slate-400 font-medium block truncate">
                                Ready for travel
                            </span>
                        </div>
                    </motion.div>

                    {/* Card 3: Awaiting Approval */}
                    <motion.div
                        whileHover={{ y: -3, scale: 1.015 }}
                        whileTap={{ scale: 0.98 }}
                        transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                        onClick={() => applyRegistryFilter('PENDING')}
                        className={`p-4 sm:p-4.5 rounded-2xl cursor-pointer transition-all duration-300 relative overflow-hidden bg-white border border-white/80 shadow-[0_12px_30px_-10px_rgba(20,10,60,0.1)] group ${
                            bookingFilter === 'PENDING' && activeTab === 'manage'
                                ? 'border-amber-500 ring-2 ring-amber-100/70 shadow-amber-500/15'
                                : 'hover:border-amber-100 hover:shadow-lg'
                        }`}
                    >
                        <div className="absolute -right-2 -bottom-2 opacity-[0.04] group-hover:opacity-[0.07] transition-opacity pointer-events-none">
                            <Clock className="w-20 h-20 text-slate-900" />
                        </div>

                        <div className="flex items-center justify-between relative z-10">
                            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-orange-400 text-white flex items-center justify-center shadow-md shadow-amber-500/25 group-hover:scale-105 transition-transform">
                                <Clock className="w-4 h-4 text-white" />
                            </div>
                            <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-amber-50 text-amber-700 border border-amber-100/80 flex items-center gap-1 shadow-2xs">
                                <span className={`w-1.5 h-1.5 rounded-full bg-amber-500 ${pendingCount > 0 ? 'animate-ping' : ''}`} />
                                Review
                            </span>
                        </div>

                        <div className="mt-2.5 relative z-10">
                            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">
                                Awaiting Sign-off
                            </span>
                            <div className="flex items-baseline gap-1.5 mt-0.5">
                                <p className="text-2xl font-black tracking-tight text-slate-900">
                                    {pendingCount}
                                </p>
                                <span className="text-[11px] font-bold text-amber-600">
                                    {pendingCount > 0 ? 'Action needed' : 'Clear'}
                                </span>
                            </div>
                            <span className="text-[11px] text-slate-400 font-medium block truncate">
                                Manager sign-off pending
                            </span>
                        </div>
                    </motion.div>

                    {/* Card 4: Executive Corporate Booking Desk */}
                    <motion.div
                        whileHover={{ y: -3, scale: 1.015 }}
                        whileTap={{ scale: 0.98 }}
                        transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                        onClick={() => {
                            setActiveTab('book');
                            window.scrollTo({ top: 380, behavior: 'smooth' });
                        }}
                        className="p-4 sm:p-4.5 rounded-2xl text-white shadow-[0_12px_30px_-8px_rgba(203,15,65,0.3)] cursor-pointer transition-all duration-300 relative overflow-hidden flex flex-col justify-between group border border-white/20 select-none"
                        style={{
                            background: 'linear-gradient(135deg, #cb0f41 0%, #d8164b 25%, #852278 55%, #0069a3 85%, #0284c7 100%)',
                        }}
                    >
                        {/* Ambient Glow & Vehicle Watermark */}
                        <div className="absolute -right-2 -bottom-2 opacity-15 group-hover:opacity-25 group-hover:scale-105 transition-all pointer-events-none">
                            <ActiveModeIcon className="w-24 h-24 text-white" />
                        </div>

                        <div className="flex items-center justify-between relative z-10">
                            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-white/20 backdrop-blur-md text-white flex items-center justify-center border border-white/30 shadow-sm group-hover:scale-105 transition-transform">
                                <ActiveModeIcon className="w-4 h-4 text-white drop-shadow-sm" />
                            </div>
                            <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-white/20 border border-white/30 text-white backdrop-blur-md shadow-2xs flex items-center gap-1">
                                <Sparkles className="w-2.5 h-2.5 text-amber-300" />
                                <span>Travel Desk</span>
                            </span>
                        </div>

                        <div className="mt-2.5 relative z-10">
                            <span className="text-[10px] font-black uppercase tracking-wider text-white/80 block">
                                Quick Requisition
                            </span>
                            <p className="text-lg sm:text-xl font-black text-white mt-0.5 leading-tight tracking-tight">
                                {formData.travelMode === 'Train'
                                    ? 'Book Train'
                                    : formData.travelMode === 'Bus'
                                    ? 'Book Bus'
                                    : 'Book Flight'}
                            </p>
                            <div className="mt-1.5 flex items-center justify-between text-[11px] font-black text-white/95 group-hover:text-white">
                                <span className="text-white/80 text-[10px] font-medium truncate">
                                    Flights • Trains • Buses
                                </span>
                                <span className="flex items-center gap-1 text-[10px] font-black bg-white/20 hover:bg-white/30 px-2 py-0.5 rounded-lg backdrop-blur-md transition-all shrink-0">
                                    <span>Book</span>
                                    <ArrowRight className="w-2.5 h-2.5 group-hover:translate-x-0.5 transition-transform" />
                                </span>
                            </div>
                        </div>
                    </motion.div>
                </div>

                {/* ── 3. MAIN WORKSPACE CARD ──────────────────────────────── */}
                <div className="bg-white backdrop-blur-2xl rounded-[2.8rem] p-7 sm:p-10 border border-white/80 shadow-[0_25px_70px_-15px_rgba(20,10,60,0.3)] space-y-8 relative overflow-hidden">
                    {/* Top Segmented Navigation Strip & Search Bar */}
                    <div className="flex flex-col lg:flex-row items-center justify-between gap-4 pb-2 border-b border-slate-100">
                        {/* Tab Buttons */}
                        <div className="flex items-center gap-1.5 p-1.5 bg-slate-100/90 rounded-2xl w-full lg:w-auto overflow-x-auto scrollbar-none">
                            <button
                                onClick={() => setActiveTab('book')}
                                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                                    activeTab === 'book'
                                        ? 'bg-[#6541e9] text-white shadow-md shadow-indigo-500/25 scale-[1.02]'
                                        : 'text-slate-600 hover:text-slate-900'
                                }`}
                            >
                                <PlaneTakeoff className="w-4 h-4" />
                                <span>Book Tickets</span>
                            </button>

                            <button
                                onClick={() => setActiveTab('manage')}
                                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                                    activeTab === 'manage'
                                        ? 'bg-[#6541e9] text-white shadow-md shadow-indigo-500/25 scale-[1.02]'
                                        : 'text-slate-600 hover:text-slate-900'
                                }`}
                            >
                                <Ticket className="w-4 h-4" />
                                <span>Manage Bookings</span>
                                {requests.length > 0 && (
                                    <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                                        activeTab === 'manage' ? 'bg-white/25 text-white' : 'bg-slate-200 text-slate-700'
                                    }`}>
                                        {requests.length}
                                    </span>
                                )}
                            </button>

                            <button
                                onClick={() => setActiveTab('checkin')}
                                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                                    activeTab === 'checkin'
                                        ? 'bg-[#6541e9] text-white shadow-md shadow-indigo-500/25 scale-[1.02]'
                                        : 'text-slate-600 hover:text-slate-900'
                                }`}
                            >
                                <CheckCircle2 className="w-4 h-4" />
                                <span>Check-in Desk</span>
                                <span className="text-[9px] font-extrabold px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-600 border border-emerald-100">
                                    Live
                                </span>
                            </button>

                            <button
                                onClick={() => setActiveTab('flight')}
                                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                                    activeTab === 'flight'
                                        ? 'bg-[#6541e9] text-white shadow-md shadow-indigo-500/25 scale-[1.02]'
                                        : 'text-slate-600 hover:text-slate-900'
                                }`}
                            >
                                <Compass className="w-4 h-4" />
                                <span>Travel Itineraries</span>
                            </button>

                            <button
                                onClick={() => setActiveTab('details')}
                                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                                    activeTab === 'details'
                                        ? 'bg-[#6541e9] text-white shadow-md shadow-indigo-500/25 scale-[1.02]'
                                        : 'text-slate-600 hover:text-slate-900'
                                }`}
                            >
                                <Briefcase className="w-4 h-4" />
                                <span>Passenger Details</span>
                            </button>
                        </div>

                        {/* Search Input */}
                        <div className="relative w-full lg:w-72">
                            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Search trips, PNR, destinations..."
                                className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-semibold text-slate-800 placeholder:text-slate-400 focus:bg-white focus:border-[#6541e9] focus:ring-4 focus:ring-[#6541e9]/10 outline-none transition-all shadow-xs"
                            />
                        </div>
                    </div>

                    {/* ═══════════════════════════════════════════════════════════════
                        PANORAMIC CINEMATIC MODE-AWARE HERO BANNER (INTERACTIVE)
                    ═══════════════════════════════════════════════════════════════ */}
                    {activeTab === 'book' && (
                        <div
                            onMouseMove={handleHeroMouseMove}
                            onMouseLeave={handleHeroMouseLeave}
                            className="relative rounded-[2.2rem] overflow-hidden shadow-2xl border border-white/50 p-6 sm:p-8 lg:p-10 transition-all duration-700 select-none"
                            style={{
                                background: activeModeConfig.gradient,
                            }}
                        >
                            {/* ── Interactive Mode Scene Backdrop (Mouse Parallax & Ambient Lights) ── */}
                            <AnimatePresence mode="wait">
                                <activeModeConfig.backdropComponent key={formData.travelMode} mouse={heroMouse} />
                            </AnimatePresence>

                            {/* Hero Content Header */}
                            <AnimatePresence mode="wait">
                                <motion.div
                                    key={formData.travelMode}
                                    initial={{ opacity: 0, y: 12 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -12 }}
                                    transition={{ duration: 0.35 }}
                                    className="relative z-10 max-w-xl text-white mb-6"
                                >
                                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md border border-white/20 text-[10px] font-black uppercase tracking-wider text-white shadow-sm mb-3">
                                        <Sparkles className="w-3 h-3 text-amber-300" />
                                        <span>{activeModeConfig.badgeText}</span>
                                    </div>
                                    <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-tight drop-shadow-md">
                                        {activeModeConfig.heroTitlePrefix}
                                        <span className="block text-transparent bg-clip-text bg-gradient-to-r from-white via-indigo-100 to-amber-200">
                                            {activeModeConfig.heroTitleHighlight}
                                        </span>
                                    </h1>
                                    <p className="text-xs sm:text-sm text-indigo-100/90 font-medium mt-2 leading-relaxed">
                                        {activeModeConfig.heroSubtitle}
                                    </p>
                                </motion.div>
                            </AnimatePresence>

                            {/* ── SEGMENTED MODE SELECTOR & TRIP TYPE PILLS ── */}
                            <div className="relative z-10 mt-6">
                                <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 mb-4">
                                    {/* Mode Pills with Highlighted Vehicle Badges */}
                                    <div className="inline-flex items-center p-1.5 rounded-2xl bg-black/40 backdrop-blur-xl border border-white/20 text-white shadow-xl">
                                        {Object.values(TRAVEL_MODE_CONFIG).map((mode) => {
                                            const IconComponent = mode.icon;
                                            const isSelected = formData.travelMode === mode.id;
                                            return (
                                                <button
                                                    key={mode.id}
                                                    type="button"
                                                    onClick={() => handleModeChange(mode.id)}
                                                    className={`relative px-4 sm:px-5 py-2.5 rounded-xl text-xs sm:text-sm font-black transition-all flex items-center gap-2.5 cursor-pointer select-none ${
                                                        isSelected
                                                            ? 'bg-white text-slate-900 shadow-xl scale-[1.02] ring-2 ring-white/90'
                                                            : 'text-white/85 hover:text-white hover:bg-white/10'
                                                    }`}
                                                >
                                                    {/* Glowing Vehicle Icon Avatar Badge */}
                                                    <div
                                                        className={`w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center transition-all ${
                                                            isSelected
                                                                ? `bg-gradient-to-tr ${mode.pillGradient} text-white shadow-md`
                                                                : 'bg-white/15 text-white/90'
                                                        }`}
                                                        style={{
                                                            boxShadow: isSelected ? `0 4px 14px ${mode.glowBorder}` : 'none'
                                                        }}
                                                    >
                                                        <IconComponent className="w-4 h-4 text-white drop-shadow-sm" />
                                                    </div>

                                                    <span className="font-extrabold tracking-tight">
                                                        {mode.name}
                                                    </span>

                                                    {/* Partner Tag Chip */}
                                                    <span
                                                        className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full transition-all ${
                                                            isSelected
                                                                ? 'bg-slate-100 text-slate-700 border border-slate-200'
                                                                : 'bg-white/10 text-white/70'
                                                        }`}
                                                    >
                                                        {mode.portalTag}
                                                    </span>

                                                    {isSelected && (
                                                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse ml-0.5" />
                                                    )}
                                                </button>
                                            );
                                        })}
                                    </div>

                                    {/* Segmented Trip Type Pill */}
                                    <div className="inline-flex items-center gap-1.5 p-1.5 rounded-2xl bg-black/30 backdrop-blur-md border border-white/15 text-white">
                                        <button
                                            type="button"
                                            onClick={() => setFormData(prev => ({ ...prev, tripType: 'one-way', returnDate: '' }))}
                                            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                                                formData.tripType === 'one-way'
                                                    ? 'bg-white text-[#1e1b4b] shadow-md font-black'
                                                    : 'text-white/80 hover:text-white hover:bg-white/10'
                                            }`}
                                        >
                                            <ActiveModeIcon className="w-3.5 h-3.5" />
                                            <span>One Way</span>
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setFormData(prev => ({ ...prev, tripType: 'round-trip' }))}
                                            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                                                formData.tripType === 'round-trip'
                                                    ? 'bg-white text-[#1e1b4b] shadow-md font-black'
                                                    : 'text-white/80 hover:text-white hover:bg-white/10'
                                            }`}
                                        >
                                            <ArrowLeftRight className="w-3.5 h-3.5" />
                                            <span>Round Trip</span>
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setShowAdvancedForm(!showAdvancedForm)}
                                            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                                                showAdvancedForm
                                                    ? 'bg-white/30 text-white ring-1 ring-white/50 font-black'
                                                    : 'text-white/70 hover:text-white hover:bg-white/10'
                                            }`}
                                        >
                                            <SlidersHorizontal className="w-3.5 h-3.5" />
                                            <span>Preferences</span>
                                            {showAdvancedForm && <span className="w-1.5 h-1.5 rounded-full bg-amber-300 animate-pulse" />}
                                        </button>
                                    </div>
                                </div>

                                {/* Floating Glass Search Console */}
                                <form onSubmit={handleSubmit}>
                                    <div className="bg-white/95 backdrop-blur-2xl rounded-3xl p-3 sm:p-4 shadow-[0_20px_50px_rgba(10,5,40,0.35)] border border-white grid grid-cols-1 lg:grid-cols-12 gap-3 items-center">

                                        {/* 1 & 2. Origin & Destination Smart Duo with Floating Center Swap Button */}
                                        <div className={`col-span-12 ${formData.tripType === 'round-trip' ? 'lg:col-span-5' : 'lg:col-span-6'} relative grid grid-cols-1 sm:grid-cols-2 gap-2 items-center`}>
                                            {/* Origin (From) */}
                                            <div className="p-2.5 rounded-2xl hover:bg-slate-50/80 transition-colors border border-slate-100 flex flex-col justify-center">
                                                <div className="flex items-center gap-2 mb-1.5">
                                                    <div className={`w-5 h-5 rounded-md bg-gradient-to-tr ${activeModeConfig.pillGradient} text-white flex items-center justify-center shadow-xs shrink-0`}>
                                                        <ActiveModeIcon className="w-3 h-3 text-white" />
                                                    </div>
                                                    <span className="text-[10px] font-black uppercase tracking-wider text-slate-500 truncate">
                                                        {activeModeConfig.originLabel}
                                                    </span>
                                                </div>
                                                <CityAutocomplete
                                                    onPlaceSelected={(place) => {
                                                        if (place && place.formatted_address) {
                                                            setFormData({ ...formData, fromLocation: place.formatted_address });
                                                        } else if (place && place.name) {
                                                            setFormData({ ...formData, fromLocation: place.name });
                                                        }
                                                    }}
                                                    required
                                                    placeholder={activeModeConfig.originPlaceholder}
                                                    className="w-full bg-transparent font-extrabold text-slate-900 placeholder:text-slate-400 outline-none text-xs sm:text-sm truncate"
                                                    value={formData.fromLocation}
                                                    onChange={(e) => setFormData({ ...formData, fromLocation: e.target.value })}
                                                />
                                            </div>

                                            {/* Mobile Swap Button */}
                                            <div className="flex sm:hidden justify-center -my-1 z-10">
                                                <button
                                                    type="button"
                                                    onClick={handleSwapLocations}
                                                    className="w-8 h-8 rounded-full bg-slate-100 hover:bg-[#6541e9] text-slate-600 hover:text-white flex items-center justify-center transition-all shadow-sm border border-slate-200 active:scale-90 cursor-pointer"
                                                    title="Swap Origin and Destination"
                                                >
                                                    <ArrowLeftRight className="w-3.5 h-3.5" />
                                                </button>
                                            </div>

                                            {/* Desktop Floating Center Swap Button */}
                                            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-20 hidden sm:flex items-center justify-center pointer-events-auto">
                                                <button
                                                    type="button"
                                                    onClick={handleSwapLocations}
                                                    className="w-8 h-8 rounded-full bg-white hover:bg-[#6541e9] text-slate-600 hover:text-white flex items-center justify-center transition-all shadow-md border border-slate-200 hover:border-[#6541e9] active:scale-90 cursor-pointer"
                                                    title="Swap Origin and Destination"
                                                >
                                                    <ArrowLeftRight className="w-3.5 h-3.5" />
                                                </button>
                                            </div>

                                            {/* Destination (To) */}
                                            <div className="p-2.5 rounded-2xl hover:bg-slate-50/80 transition-colors border border-slate-100 flex flex-col justify-center">
                                                <div className="flex items-center gap-2 mb-1.5">
                                                    <div className={`w-5 h-5 rounded-md bg-gradient-to-tr ${activeModeConfig.pillGradient} text-white flex items-center justify-center shadow-xs shrink-0`}>
                                                        <ActiveModeIcon className="w-3 h-3 text-white" />
                                                    </div>
                                                    <span className="text-[10px] font-black uppercase tracking-wider text-slate-500 truncate">
                                                        {activeModeConfig.destinationLabel}
                                                    </span>
                                                </div>
                                                <CityAutocomplete
                                                    onPlaceSelected={(place) => {
                                                        if (place && place.formatted_address) {
                                                            setFormData({ ...formData, toLocation: place.formatted_address });
                                                        } else if (place && place.name) {
                                                            setFormData({ ...formData, toLocation: place.name });
                                                        }
                                                    }}
                                                    required
                                                    placeholder={activeModeConfig.destinationPlaceholder}
                                                    className="w-full bg-transparent font-extrabold text-slate-900 placeholder:text-slate-400 outline-none text-xs sm:text-sm truncate"
                                                    value={formData.toLocation}
                                                    onChange={(e) => setFormData({ ...formData, toLocation: e.target.value })}
                                                />
                                            </div>
                                        </div>

                                        {/* 3. Departure Date */}
                                        <div className={`col-span-12 sm:col-span-6 ${formData.tripType === 'round-trip' ? 'lg:col-span-2' : 'lg:col-span-3'} p-2.5 rounded-2xl hover:bg-slate-50/80 transition-colors border border-slate-100 flex flex-col justify-center`}>
                                            <div className="flex items-center gap-1.5 mb-1">
                                                <Calendar className="w-3.5 h-3.5 text-[#6541e9]" />
                                                <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                                                    {activeModeConfig.departureLabel}
                                                </span>
                                            </div>
                                            <input
                                                required
                                                type="date"
                                                min={todayLocal}
                                                className="w-full bg-transparent font-extrabold text-slate-900 outline-none text-xs sm:text-sm cursor-pointer"
                                                value={formData.departureDate}
                                                onChange={(e) => {
                                                    const newDep = e.target.value;
                                                    setFormData(prev => ({
                                                        ...prev,
                                                        departureDate: newDep,
                                                        returnDate: prev.returnDate && prev.returnDate < newDep ? '' : prev.returnDate
                                                    }));
                                                }}
                                            />
                                        </div>

                                        {/* 4. Return Date (only if Round Trip) */}
                                        {formData.tripType === 'round-trip' && (
                                            <div className="col-span-12 sm:col-span-6 lg:col-span-2 p-2.5 rounded-2xl hover:bg-slate-50/80 transition-colors border border-slate-100 flex flex-col justify-center">
                                                <div className="flex items-center gap-1.5 mb-1">
                                                    <Calendar className="w-3.5 h-3.5 text-[#6541e9]" />
                                                    <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                                                        {activeModeConfig.returnLabel}
                                                    </span>
                                                </div>
                                                <input
                                                    required
                                                    type="date"
                                                    min={formData.departureDate || todayLocal}
                                                    className="w-full bg-transparent font-extrabold text-slate-900 outline-none text-xs sm:text-sm cursor-pointer"
                                                    value={formData.returnDate}
                                                    onChange={(e) => setFormData({ ...formData, returnDate: e.target.value })}
                                                />
                                            </div>
                                        )}

                                        {/* 5. Primary Submit Button with Nikitha Gradient & Ripple */}
                                        <div className="col-span-12 lg:col-span-3 flex items-center justify-end w-full">
                                            <div className="relative group w-full">
                                                <div
                                                    className="absolute -inset-0.5 rounded-2xl opacity-60 group-hover:opacity-100 blur-md transition-all duration-500 pointer-events-none -z-10"
                                                    style={{
                                                        background: 'linear-gradient(135deg, rgba(203, 15, 65, 0.7) 0%, rgba(133, 34, 120, 0.6) 45%, rgba(0, 105, 163, 0.7) 100%)',
                                                    }}
                                                />
                                                <motion.button
                                                    type="submit"
                                                    onClick={handleButtonClick}
                                                    whileHover={{ scale: 1.02 }}
                                                    whileTap={{ scale: 0.97 }}
                                                    className="relative w-full py-3.5 px-4 rounded-2xl text-white font-black text-xs sm:text-sm overflow-hidden flex items-center justify-center gap-2 cursor-pointer shadow-lg select-none whitespace-nowrap"
                                                    style={{
                                                        background: 'linear-gradient(120deg, #cb0f41 0%, #d8164b 25%, #852278 55%, #0069a3 85%, #0284c7 100%)',
                                                    }}
                                                >
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
                                                    <span className="tracking-tight">{activeModeConfig.submitText}</span>
                                                    <ArrowRight className="w-4 h-4 shrink-0" />
                                                </motion.button>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Collapsible Advanced Preferences Drawer */}
                                    <AnimatePresence>
                                        {showAdvancedForm && (
                                            <motion.div
                                                initial={{ opacity: 0, height: 0, y: -10 }}
                                                animate={{ opacity: 1, height: 'auto', y: 0 }}
                                                exit={{ opacity: 0, height: 0, y: -10 }}
                                                className="overflow-hidden mt-3"
                                            >
                                                <div className="bg-white/95 backdrop-blur-xl rounded-2xl p-4 shadow-xl border border-white grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-semibold text-slate-700">
                                                    <div>
                                                        <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                                                            Travel Mode
                                                        </label>
                                                        <select
                                                            value={formData.travelMode}
                                                            onChange={(e) => handleModeChange(e.target.value)}
                                                            className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs font-bold text-slate-800 outline-none focus:ring-2 focus:ring-[#6541e9]/20"
                                                        >
                                                            <option value="Flight">Flight (MMT / Airlines)</option>
                                                            <option value="Train">Train (IRCTC / Railways)</option>
                                                            <option value="Bus">Bus (redBus / Intercity Coaches)</option>
                                                        </select>
                                                    </div>

                                                    <div>
                                                        <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                                                            {activeModeConfig.classLabel}
                                                        </label>
                                                        <select
                                                            value={formData.travelType}
                                                            onChange={(e) => setFormData({ ...formData, travelType: e.target.value })}
                                                            className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs font-bold text-slate-800 outline-none focus:ring-2 focus:ring-[#6541e9]/20"
                                                        >
                                                            {activeModeConfig.classOptions.map((opt) => (
                                                                <option key={opt} value={opt}>{opt}</option>
                                                            ))}
                                                        </select>
                                                    </div>

                                                    <div>
                                                        <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                                                            Business Purpose
                                                        </label>
                                                        <input
                                                            type="text"
                                                            value={formData.purpose}
                                                            onChange={(e) => setFormData({ ...formData, purpose: e.target.value })}
                                                            placeholder={activeModeConfig.purposePlaceholder}
                                                            className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs font-bold text-slate-800 outline-none focus:ring-2 focus:ring-[#6541e9]/20"
                                                        />
                                                    </div>
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </form>
                            </div>
                        </div>
                    )}

                    {/* ═══════════════════════════════════════════════════════════════
                        RECENT BOOKINGS SECTION
                    ═══════════════════════════════════════════════════════════════ */}
                    {activeTab === 'book' && (
                        <div className="w-full">
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-2.5">
                                    <h3 className="text-xl font-black text-slate-900 tracking-tight">
                                        Recent Bookings
                                    </h3>
                                    <span className="px-2.5 py-0.5 rounded-full bg-indigo-50 text-[#6541e9] text-xs font-black border border-indigo-100">
                                        {requests.length} Trips
                                    </span>
                                </div>

                                {/* Filter Pills */}
                            <div className="flex items-center gap-1.5 text-xs font-bold">
                                {['ALL', 'APPROVED', 'BOOKED', 'PENDING', 'REJECTED'].map((filter) => (
                                    <button
                                        key={filter}
                                        onClick={() => handleFilterChange(filter)}
                                        className={`px-3 py-1 rounded-lg transition-all ${bookingFilter === filter
                                            ? 'bg-[#1e1b4b] text-white shadow-sm'
                                            : 'text-slate-500 hover:text-slate-900 bg-white border border-slate-200/80'
                                            }`}
                                    >
                                        {filter}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Destination Cards Grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                            {loading ? (
                                [1, 2, 3].map((i) => (
                                    <div key={i} className="h-56 bg-white animate-pulse rounded-3xl border border-slate-200/80 p-4" />
                                ))
                            ) : filteredRequests.length === 0 ? (
                                <div className="col-span-full py-16 px-6 bg-white rounded-3xl border border-dashed border-slate-200 text-center shadow-xs">
                                    <div className="w-14 h-14 rounded-2xl bg-indigo-50 border border-indigo-100 text-[#6541e9] flex items-center justify-center mx-auto mb-3 shadow-xs">
                                        <Plane className="w-7 h-7" />
                                    </div>
                                    <h4 className="text-base font-bold text-slate-800">No Bookings Found</h4>
                                    <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                                        You don't have any travel requests under this filter yet. Submit a new requisition above to get started.
                                    </p>
                                </div>
                            ) : (
                                /* Real User Dynamic Itinerary Cards */
                                filteredRequests.slice(0, 6).map((req, idx) => (
                                    <div
                                        key={req.id}
                                        className="relative h-56 rounded-3xl overflow-hidden shadow-lg group cursor-pointer border border-white bg-slate-900"
                                    >
                                        <img
                                            src={destinationPhotos[idx % destinationPhotos.length]}
                                            alt={req.toLocation}
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-80"
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />

                                        {/* Status Chip */}
                                        <div className="absolute top-3 left-3 flex items-center gap-1.5">
                                            <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border ${getStatusStyle(req.status)}`}>
                                                {req.status}
                                            </span>
                                            <span className="px-2 py-1 rounded-full bg-black/40 text-white text-[10px] font-bold backdrop-blur-md">
                                                #{req.id ? req.id.toString().slice(-4) : 'NK'}
                                            </span>
                                        </div>

                                        {/* Bottom Route & Action Button */}
                                        <div className="absolute bottom-4 inset-x-4 text-white">
                                            <p className="font-black text-sm sm:text-base leading-tight drop-shadow-md truncate">
                                                {req.fromLocation} → {req.toLocation}
                                            </p>
                                            <p className="text-xs text-white/80 font-medium mt-1">
                                                Departure: {new Date(req.departureDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                                            </p>

                                            <div className="flex items-center justify-between mt-3 pt-2 border-t border-white/20">
                                                <span className="px-2 py-0.5 rounded bg-white/20 backdrop-blur-md text-white font-bold text-[10px] flex items-center gap-1">
                                                    <span>{req.travelMode === 'Train' ? '🚆 Train' : req.travelMode === 'Bus' ? '🚌 Bus' : '✈️ Flight'}</span>
                                                </span>

                                                {req.status === 'BOOKED' ? (
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleDownloadTicket(req, 'departure');
                                                        }}
                                                        title="Download E-Ticket"
                                                        className="px-3 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs flex items-center gap-1.5 shadow-md transition-all active:scale-95"
                                                    >
                                                        <Download className="w-3.5 h-3.5" />
                                                        <span>E-Ticket</span>
                                                    </button>
                                                ) : (
                                                    <div className="w-8 h-8 rounded-full bg-white text-[#1e1b4b] flex items-center justify-center shadow-md group-hover:translate-x-1 transition-transform">
                                                        <ArrowRight className="w-4 h-4" />
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                )}

                    {/* ═══════════════════════════════════════════════════════════════
                        TAB 2: COMPLETE ITINERARY REGISTRY (MANAGE BOOKINGS)
                    ═══════════════════════════════════════════════════════════════ */}
                    {activeTab === 'manage' && (
                        <motion.div
                            id="my-travel-registry"
                            initial={{ opacity: 0, y: 15 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-white rounded-3xl p-6 sm:p-8 shadow-xl border border-slate-200/80 space-y-6 scroll-mt-24"
                        >
                            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 pb-4 border-b border-slate-100">
                                <div>
                                    <div className="flex items-center gap-3">
                                        <h3 className="text-2xl font-black text-slate-900 tracking-tight">
                                            Complete Itinerary Registry
                                        </h3>
                                        <span className="px-2.5 py-0.5 rounded-full bg-indigo-50 text-[#6541e9] text-xs font-black border border-indigo-100">
                                            {filteredRequests.length} {filteredRequests.length === 1 ? 'Trip' : 'Trips'}
                                        </span>
                                    </div>
                                    <p className="text-xs text-slate-500 font-medium mt-1">
                                        Manage your corporate requisitions, view approval logs, and download e-tickets.
                                    </p>
                                </div>
                                <div className="flex flex-wrap items-center gap-2.5">
                                    {/* Registry Filter Pills */}
                                    <div className="flex items-center gap-1 text-xs font-bold bg-slate-100/90 p-1 rounded-xl">
                                        {['ALL', 'APPROVED', 'BOOKED', 'PENDING', 'REJECTED'].map((filter) => (
                                            <button
                                                key={filter}
                                                onClick={() => handleFilterChange(filter)}
                                                className={`px-3 py-1 rounded-lg transition-all ${bookingFilter === filter
                                                    ? 'bg-[#1e1b4b] text-white shadow-sm'
                                                    : 'text-slate-500 hover:text-slate-900 hover:bg-white/70'
                                                    }`}
                                            >
                                                {filter}
                                            </button>
                                        ))}
                                    </div>
                                    <button
                                        onClick={() => setActiveTab('book')}
                                        className="px-4 py-2.5 rounded-xl bg-[#6541e9] text-white font-bold text-xs flex items-center gap-2 shadow-md hover:bg-[#5332ce] transition-all cursor-pointer shrink-0"
                                    >
                                        <Plus className="w-4 h-4" />
                                        <span>New Travel Request</span>
                                    </button>
                                </div>
                            </div>

                            {/* Data Table */}
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-xs">
                                    <thead>
                                        <tr className="border-b border-slate-200 text-slate-400 uppercase font-black tracking-wider text-[10px]">
                                            <th className="py-3.5 px-3">Req ID</th>
                                            <th className="py-3.5 px-3">Route</th>
                                            <th className="py-3.5 px-3">Dates</th>
                                            <th className="py-3.5 px-3">Mode</th>
                                            <th className="py-3.5 px-3">Status</th>
                                            <th className="py-3.5 px-3">Manager Note</th>
                                            <th className="py-3.5 px-3 text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100 font-semibold text-slate-700">
                                        {filteredRequests.length === 0 ? (
                                            <tr>
                                                <td colSpan="7" className="py-12 text-center text-slate-400">
                                                    No travel requisitions found matching your filter.
                                                </td>
                                            </tr>
                                        ) : (
                                            filteredRequests.map((req) => (
                                                <tr key={req.id} className="hover:bg-slate-50/80 transition-colors">
                                                    <td className="py-3.5 px-3 font-mono font-black text-slate-900">
                                                        #{req.id ? req.id.toString().slice(-4) : 'NK'}
                                                    </td>
                                                    <td className="py-3.5 px-3 font-bold text-slate-900">
                                                        <div className="flex items-center gap-1.5">
                                                            <span>{req.fromLocation}</span>
                                                            <ArrowRight className="w-3 h-3 text-slate-400" />
                                                            <span>{req.toLocation}</span>
                                                        </div>
                                                    </td>
                                                    <td className="py-3.5 px-3 text-slate-600">
                                                        {new Date(req.departureDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                                                        {req.returnDate && (
                                                            <span className="block text-[10px] text-slate-400">
                                                                Return: {new Date(req.returnDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                                                            </span>
                                                        )}
                                                    </td>
                                                    <td className="py-3.5 px-3">
                                                        <span className="px-2.5 py-1 rounded-lg bg-slate-100 font-bold text-slate-700 text-[11px] inline-flex items-center gap-1">
                                                            <span>{req.travelMode === 'Train' ? '🚆 Train' : req.travelMode === 'Bus' ? '🚌 Bus' : '✈️ Flight'}</span>
                                                        </span>
                                                    </td>
                                                    <td className="py-3.5 px-3">
                                                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border ${getStatusStyle(req.status)}`}>
                                                            {req.status}
                                                        </span>
                                                    </td>
                                                    <td className="py-3.5 px-3 text-slate-500 max-w-[200px] truncate">
                                                        {req.managerComments || '—'}
                                                    </td>
                                                    <td className="py-3.5 px-3 text-right">
                                                        {req.status === 'BOOKED' ? (
                                                            <button
                                                                onClick={() => handleDownloadTicket(req, 'departure')}
                                                                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm"
                                                            >
                                                                <Download className="w-3.5 h-3.5" />
                                                                <span>Ticket</span>
                                                            </button>
                                                        ) : (
                                                            <span className="text-[11px] text-slate-400 font-medium">In Review</span>
                                                        )}
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </motion.div>
                    )}

                    {/* ═══════════════════════════════════════════════════════════════
                        TAB 3: CHECK-IN DESK (QUICK ASSISTANCE)
                    ═══════════════════════════════════════════════════════════════ */}
                    {activeTab === 'checkin' && (
                        <motion.div
                            initial={{ opacity: 0, y: 15 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-white rounded-3xl p-8 shadow-xl border border-slate-200/80 max-w-2xl mx-auto text-center space-y-4"
                        >
                            <div className="w-16 h-16 rounded-2xl bg-indigo-50 border border-indigo-100 text-[#6541e9] flex items-center justify-center mx-auto shadow-md">
                                <CheckCircle2 className="w-8 h-8" />
                            </div>
                            <h3 className="text-2xl font-black text-slate-900 tracking-tight">
                                Corporate Web Check-in Desk
                            </h3>
                            <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
                                Web check-in opens 24 hours prior to scheduled departure. Your corporate PNR will be auto-synced with airline boarding systems.
                            </p>
                            <div className="pt-4">
                                <button
                                    onClick={() => setActiveTab('manage')}
                                    className="px-6 py-3 rounded-xl bg-[#6541e9] text-white font-bold text-xs shadow-lg hover:bg-[#5332ce] transition-all cursor-pointer"
                                >
                                    View Confirmed Bookings
                                </button>
                            </div>
                        </motion.div>
                    )}

                    {/* ═══════════════════════════════════════════════════════════════
                        TAB 4: FLIGHT DETAILS & E-TICKETS
                    ═══════════════════════════════════════════════════════════════ */}
                    {activeTab === 'flight' && (
                        <motion.div
                            initial={{ opacity: 0, y: 15 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-white rounded-3xl p-6 sm:p-8 shadow-xl border border-slate-200/80 space-y-6"
                        >
                            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
                                <div>
                                    <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                                        Confirmed Travel Itineraries
                                    </h3>
                                    <p className="text-xs text-slate-500 mt-1">
                                        Live ticket dossier, PNR codes, and passenger boarding documents issued by the travel desk.
                                    </p>
                                </div>
                                <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-black border border-emerald-200/80">
                                    {requests.filter(r => r.status === 'BOOKED').length} Confirmed Tickets
                                </span>
                            </div>

                            {requests.filter(r => r.status === 'BOOKED').length === 0 ? (
                                <div className="py-16 px-6 bg-slate-50/70 rounded-2xl border border-dashed border-slate-200 text-center">
                                    <div className="w-14 h-14 rounded-2xl bg-indigo-50 border border-indigo-100 text-[#6541e9] flex items-center justify-center mx-auto mb-3 shadow-xs">
                                        <ActiveModeIcon className="w-7 h-7" />
                                    </div>
                                    <h4 className="text-base font-bold text-slate-800">No Confirmed Travel Tickets Yet</h4>
                                    <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                                        Once your travel requisition is approved by your manager and ticketed by the admin desk, your live itinerary details and e-tickets will appear here.
                                    </p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {requests.filter(r => r.status === 'BOOKED').map((req) => (
                                        <div
                                            key={req.id}
                                            className="p-5 rounded-2xl border border-slate-200/80 hover:border-indigo-300 transition-all bg-gradient-to-br from-white to-slate-50 shadow-sm hover:shadow-md"
                                        >
                                            <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-xs font-mono font-black text-[#6541e9]">
                                                        Ref #{req.id}
                                                    </span>
                                                    <span className="px-2 py-0.5 rounded-lg bg-slate-100 text-[10px] font-black text-slate-700">
                                                        {req.travelMode === 'Train' ? '🚆 Train' : req.travelMode === 'Bus' ? '🚌 Bus' : '✈️ Flight'}
                                                    </span>
                                                </div>
                                                <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-black uppercase tracking-wider">
                                                    BOOKED
                                                </span>
                                            </div>

                                            <div className="flex items-center justify-between text-sm font-black text-slate-900 mb-2">
                                                <span>{req.fromLocation}</span>
                                                <ArrowRight className="w-4 h-4 text-slate-400" />
                                                <span>{req.toLocation}</span>
                                            </div>

                                            <div className="space-y-1.5 text-xs text-slate-600 mb-4">
                                                <p><span className="text-slate-400 font-bold">Departure:</span> {new Date(req.departureDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                                                {req.returnDate && (
                                                    <p><span className="text-slate-400 font-bold">Return:</span> {new Date(req.returnDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                                                )}
                                                {req.pnr && (
                                                    <p><span className="text-slate-400 font-bold">{req.travelMode === 'Train' ? 'IRCTC / PNR:' : req.travelMode === 'Bus' ? 'redBus / Ticket #:' : 'Airline PNR:'}</span> <span className="font-mono font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded">{req.pnr}</span></p>
                                                )}
                                                {req.agency && (
                                                    <p><span className="text-slate-400 font-bold">{req.travelMode === 'Train' ? 'Railway Division / Express:' : req.travelMode === 'Bus' ? 'Bus Operator / Coach:' : 'Agency/Airline:'}</span> {req.agency}</p>
                                                )}
                                            </div>

                                            <button
                                                onClick={() => handleDownloadTicket(req, 'departure')}
                                                className="w-full py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-sm"
                                            >
                                                <Download className="w-3.5 h-3.5" />
                                                <span>Download Confirmed E-Ticket</span>
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </motion.div>
                    )}

                    {/* ═══════════════════════════════════════════════════════════════
                        TAB 5: PASSENGER & CORPORATE DETAILS
                    ═══════════════════════════════════════════════════════════════ */}
                    {activeTab === 'details' && (
                        <motion.div
                            initial={{ opacity: 0, y: 15 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-white rounded-3xl p-8 shadow-xl border border-slate-200/80 max-w-2xl mx-auto space-y-6"
                        >
                            <div className="flex items-center gap-4 pb-4 border-b border-slate-100">
                                <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-[#6541e9] to-[#0069a3] text-white flex items-center justify-center font-black text-lg uppercase shadow-md">
                                    {userInitials}
                                </div>
                                <div>
                                    <h3 className="text-xl font-black text-slate-900">
                                        {user?.name || user?.email?.split('@')[0] || 'Traveler'}
                                    </h3>
                                    <p className="text-xs text-slate-500 font-medium">
                                        Corporate Email: {user?.email || 'user@company.com'}
                                    </p>
                                </div>
                            </div>

                            <div className="space-y-3 text-xs">
                                <div className="flex justify-between py-2 border-b border-slate-100">
                                    <span className="text-slate-400 font-bold uppercase text-[10px]">Access Role</span>
                                    <span className="font-black text-[#6541e9]">{user?.role || 'ROLE_EMPLOYEE'}</span>
                                </div>
                                <div className="flex justify-between py-2 border-b border-slate-100">
                                    <span className="text-slate-400 font-bold uppercase text-[10px]">Corporate Policy Tier</span>
                                    <span className="font-black text-slate-900">Executive Gold Tier</span>
                                </div>
                                <div className="flex justify-between py-2 border-b border-slate-100">
                                    <span className="text-slate-400 font-bold uppercase text-[10px]">Total Trips Logged</span>
                                    <span className="font-black text-slate-900">{requests.length} Itineraries</span>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default EmployeeDashboard;
