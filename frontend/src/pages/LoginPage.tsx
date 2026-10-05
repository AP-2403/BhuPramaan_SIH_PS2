import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import {
  ArrowRight,
  Lock,
  User as UserIcon,
  Sparkles,
  Shield,
  ExternalLink,
  Eye,
  EyeOff,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react'
import { login, type User } from '../api'
import { ROLES, getRoleDefaultRoute } from '../roles'

interface LoginPageProps {
  onLoginSuccess: (user: User) => void
}

const DEMO_PRESETS = Object.values(ROLES)

export const LoginPage: React.FC<LoginPageProps> = ({ onLoginSuccess }) => {
  const { t, i18n } = useTranslation()
  const isHindi = i18n.language === 'hi'
  const navigate = useNavigate()

  // Form state
  const [username, setUsername] = useState('tehsil_operator')
  const [password, setPassword] = useState('Demo@1234')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'roles' | 'credentials'>('roles')
  const lightIntensity = 'radiant'

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      const user = await login(username, password)
      onLoginSuccess(user)
      navigate(getRoleDefaultRoute(user.role))
    } catch (err: any) {
      setError(err.message || 'Invalid credentials')
    } finally {
      setLoading(false)
    }
  }

  const handleQuickLogin = async (roleKey: string) => {
    setLoading(true)
    setError(null)
    try {
      const user = await login(roleKey, 'Demo@1234')
      onLoginSuccess(user)
      navigate(getRoleDefaultRoute(user.role))
    } catch (err: any) {
      setError(err.message || 'Quick login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="relative min-h-[calc(100vh-4rem)] flex flex-col justify-between overflow-hidden font-sans selection:bg-amber-400 selection:text-slate-950">
      {/* ── IMMERSIVE FULL-PAGE ARTWORK BACKGROUND ─────────────────────────── */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        <img
          src="/background/main_image.png"
          alt="BhuPramaan Smart Rural Land Ecosystem"
          className="w-full h-full object-cover object-center transform scale-[1.02] filter brightness-[0.78] contrast-[1.12]"
        />

        {/* Cinematic Multi-Layer Vignette Scrim for Crystal-Clear Text Legibility */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/65 to-slate-950/80" />
        <div className="absolute inset-0 bg-radial from-transparent via-slate-950/35 to-slate-950/85" />

        {/* ── LIGHT-THEMED HIGHLIGHT EFFECT ON TOP OF THE BRIDGE (Center: 50%, Top: 22.8%) ── */}
        <div
          className="absolute z-10 transition-all duration-700 pointer-events-none"
          style={{ left: '50.0%', top: '22.8%' }}
        >
          {/* Radiant Golden Sunlight & Celestial Light Aura */}
          <div
            className={`absolute -translate-x-1/2 -translate-y-1/2 rounded-full pointer-events-none transition-all duration-700 ${
              lightIntensity === 'radiant'
                ? 'w-80 h-80 sm:w-[480px] sm:h-[480px] bg-radial from-amber-300/50 via-amber-500/25 to-transparent blur-3xl opacity-100 animate-beacon'
                : 'w-60 h-60 sm:w-80 sm:h-80 bg-radial from-amber-400/30 via-amber-500/15 to-transparent blur-2xl opacity-75'
            }`}
          />

          {/* Cyan High-Tech Radiance Halo */}
          <div className="absolute -translate-x-1/2 -translate-y-1/2 w-56 h-56 sm:w-80 sm:h-80 rounded-full bg-radial from-cyan-400/25 via-blue-500/10 to-transparent blur-2xl animate-cyan-pulse pointer-events-none" />

          {/* Concentric Expanding Luminous Light Rings */}
          <div className="absolute -translate-x-1/2 -translate-y-1/2 w-32 h-32 sm:w-48 sm:h-48 rounded-full border border-amber-300/80 animate-ring-pulse-1 pointer-events-none" />
          <div className="absolute -translate-x-1/2 -translate-y-1/2 w-32 h-32 sm:w-48 sm:h-48 rounded-full border border-amber-400/60 animate-ring-pulse-2 pointer-events-none" />
          <div className="absolute -translate-x-1/2 -translate-y-1/2 w-32 h-32 sm:w-48 sm:h-48 rounded-full border border-cyan-400/50 animate-ring-pulse-3 pointer-events-none" />

          {/* Vertical Shimmering Sunbeam / Pillar of Light Radiating Down Across the Bridge Arch */}
          <div
            className={`absolute -translate-x-1/2 top-2 w-44 sm:w-64 h-56 sm:h-80 pointer-events-none bg-gradient-to-b from-amber-200/40 via-amber-400/20 to-transparent blur-md transform -skew-x-1 animate-beam-glow ${
              lightIntensity === 'radiant' ? 'opacity-95' : 'opacity-60'
            }`}
          />

          {/* Subtle Rotating Morning Sunburst Conic Rays */}
          <div
            className="absolute -translate-x-1/2 -translate-y-1/2 w-72 h-72 sm:w-[420px] sm:h-[420px] rounded-full opacity-45 animate-conic-rays pointer-events-none"
            style={{
              background:
                'conic-gradient(from 0deg, transparent 0deg, rgba(251, 191, 36, 0.45) 30deg, transparent 60deg, rgba(56, 189, 248, 0.35) 120deg, transparent 150deg, rgba(251, 191, 36, 0.45) 210deg, transparent 240deg, rgba(56, 189, 248, 0.35) 300deg, transparent 330deg)',
            }}
          />

          {/* Glowing Beacon Core on the Bridge-Top Seal */}
          <div className="absolute -translate-x-1/2 -translate-y-1/2 flex items-center justify-center">
            <span className="w-5 h-5 rounded-full bg-amber-400 animate-ping opacity-75" />
            <div className="w-11 h-11 rounded-full bg-gradient-to-tr from-amber-400 via-white to-amber-300 p-0.5 shadow-[0_0_35px_rgba(245,158,11,1)] flex items-center justify-center">
              <div className="w-full h-full rounded-full bg-slate-950 flex items-center justify-center">
                <ShieldCheck className="w-5 h-5 text-amber-300" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── FOREGROUND CONTENT CONTAINER ─────────────────────────────────── */}
      <div className="relative z-10 max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 flex-1 flex flex-col justify-between space-y-10">
        {/* ── TOP WELCOMING HERO BAR ─────────────────────────────────────── */}
        <div className="text-center space-y-3 pt-2">
          {/* Grand Modern Title */}
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white drop-shadow-md">
            {isHindi ? (
              <>
                भू-प्रमाण <span className="gradient-text-gold">एआई सत्यापन</span> पोर्टल
              </>
            ) : (
              <>
                BhuPramaan <span className="gradient-text-gold">AI Verification</span> Portal
              </>
            )}
          </h1>

          {/* Clean, Non-Congested Subtitle */}
          <p className="text-xs sm:text-sm lg:text-base text-slate-200/90 max-w-2xl mx-auto leading-relaxed font-normal drop-shadow">
            {isHindi
              ? 'ऐतिहासिक खतौनी, म्यूटेशन व मानचित्रों का द्वैध-ओसीआर मतदान, १७ वैधानिक नियमों एवं पोस्टजीआईएस द्वारा स्वचालित सत्यापन।'
              : 'Autonomous land record digitization, dual-engine OCR spatial voting, 17-rule statutory validation, and PostGIS cadastral GIS alignment.'}
          </p>
        </div>

        {/* ── MODERN ACCESS HUB: GLASS CONTAINER WITH TABS ───────────────── */}
        <div id="portal-access" className="max-w-4xl w-full mx-auto">
          <div className="rounded-3xl bg-slate-950/80 backdrop-blur-2xl border border-white/20 shadow-2xl p-6 sm:p-8 space-y-6 relative overflow-hidden">
            {/* Top Amber Highlight Border Line */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-500 via-amber-300 to-amber-500" />

            {/* Header & Tab Switcher */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-5">
              <div>
                <span className="text-[11px] font-bold text-amber-400 uppercase tracking-widest flex items-center gap-1.5">
                  <Shield className="w-3.5 h-3.5" />
                  Role-Based Access Control (RBAC)
                </span>
                <h2 className="text-lg sm:text-xl font-black text-white mt-0.5">
                  {isHindi ? 'कार्यक्षेत्र चुनें अथवा लॉगिन करें' : 'Select Workspace or Sign In'}
                </h2>
              </div>

              {/* Mode Tabs */}
              <div className="inline-flex p-1 rounded-2xl bg-slate-900 border border-slate-700/80 shadow-inner">
                <button
                  type="button"
                  onClick={() => setActiveTab('roles')}
                  className={`flex items-center gap-2 px-4 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    activeTab === 'roles'
                      ? 'bg-amber-500 text-slate-950 shadow-md'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>One-Click Role Demo</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('credentials')}
                  className={`flex items-center gap-2 px-4 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    activeTab === 'credentials'
                      ? 'bg-amber-500 text-slate-950 shadow-md'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Lock className="w-3.5 h-3.5" />
                  <span>Direct Sign-In</span>
                </button>
              </div>
            </div>

            {/* TAB 1: ONE-CLICK ROLE CARDS (CLEAN & NON-CONGESTED) */}
            {activeTab === 'roles' && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
                  {DEMO_PRESETS.map((p) => (
                    <button
                      key={p.role}
                      onClick={() => handleQuickLogin(p.role)}
                      disabled={loading}
                      className="p-4 rounded-2xl bg-slate-900/85 hover:bg-slate-900 border border-slate-800/90 hover:border-amber-400/80 transition-all text-left shadow-lg hover:shadow-xl hover:shadow-amber-500/10 group cursor-pointer backdrop-blur-md flex flex-col justify-between relative overflow-hidden"
                    >
                      <div className="space-y-2">
                        <div className="flex items-center justify-between gap-2">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${p.badgeClass}`}>
                            {p.scope}
                          </span>
                          <span className="text-[10px] font-mono text-slate-500 group-hover:text-amber-400 transition-colors">
                            {p.defaultRoute}
                          </span>
                        </div>

                        <div>
                          <h3 className="text-sm font-bold text-white group-hover:text-amber-300 transition-colors flex items-center justify-between">
                            <span>{isHindi ? p.titleHindi : p.label}</span>
                            <ArrowRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-amber-400 group-hover:translate-x-1 transition-all" />
                          </h3>
                          <p className="text-[11px] text-slate-400 mt-1 leading-snug line-clamp-2">
                            {p.desc}
                          </p>
                        </div>
                      </div>

                      <div className="mt-3 pt-2.5 border-t border-slate-800/60 flex items-center justify-between text-[10px] text-slate-500">
                        <span className="font-mono text-slate-400">@{p.role}</span>
                        <span className="text-amber-400 font-bold group-hover:underline">
                          Launch &rarr;
                        </span>
                      </div>
                    </button>
                  ))}
                </div>

                <div className="pt-2 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-400 border-t border-slate-800/60">
                  <span className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Clicking any role authenticates and routes to its dedicated workspace instantly.</span>
                  </span>
                  <a
                    href="https://www.youtube.com/watch?v=8hZgkcB8mU8"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-amber-400 hover:text-amber-300 font-semibold flex items-center gap-1 text-[11px]"
                  >
                    <span>Watch Video Walkthrough</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            )}

            {/* TAB 2: DIRECT OPERATOR CREDENTIALS */}
            {activeTab === 'credentials' && (
              <div className="max-w-md mx-auto space-y-4 py-2">
                {error && (
                  <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs">
                    {error}
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                      {t('login.username')}
                    </label>
                    <div className="relative">
                      <UserIcon className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        placeholder="e.g. tehsil_operator"
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-700 bg-slate-900/90 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 font-medium transition-all"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                      {t('login.password')}
                    </label>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-slate-700 bg-slate-900/90 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 font-medium transition-all"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 cursor-pointer"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    <div className="flex justify-between items-center mt-1.5 text-[11px] text-slate-400">
                      <span>Default Demo Password: <code className="text-amber-400 font-mono">Demo@1234</code></span>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs shadow-lg shadow-amber-500/25 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 mt-2 shimmer-sweep"
                  >
                    <span>{loading ? t('login.authenticating') : t('login.signInBtn')}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>

        {/* ── FLOATING STATS STRIP ───────────────────────────────────────── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-4xl w-full mx-auto pb-2">
          <div className="p-3 rounded-2xl bg-slate-950/75 border border-slate-800/80 backdrop-blur-md text-center shadow-lg">
            <div className="text-xl sm:text-2xl font-black text-amber-400">10.4s</div>
            <div className="text-[10px] text-slate-400 font-medium mt-0.5">Turnaround per Deed</div>
          </div>
          <div className="p-3 rounded-2xl bg-slate-950/75 border border-slate-800/80 backdrop-blur-md text-center shadow-lg">
            <div className="text-xl sm:text-2xl font-black text-emerald-400">82%</div>
            <div className="text-[10px] text-slate-400 font-medium mt-0.5">Manual Effort Saved</div>
          </div>
          <div className="p-3 rounded-2xl bg-slate-950/75 border border-slate-800/80 backdrop-blur-md text-center shadow-lg">
            <div className="text-xl sm:text-2xl font-black text-cyan-400">17</div>
            <div className="text-[10px] text-slate-400 font-medium mt-0.5">Statutory Rules Validated</div>
          </div>
          <div className="p-3 rounded-2xl bg-slate-950/75 border border-slate-800/80 backdrop-blur-md text-center shadow-lg">
            <div className="text-xl sm:text-2xl font-black text-purple-400">97.6%</div>
            <div className="text-[10px] text-slate-400 font-medium mt-0.5">Retrained Model Accuracy</div>
          </div>
        </div>
      </div>
    </div>
  )
}
