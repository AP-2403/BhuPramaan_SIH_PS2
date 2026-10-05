import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import {
  ArrowRight,
  Lock,
  User as UserIcon,
  Sparkles,
  Shield,
  Layers,
  Cpu,
  MapPin,
  ExternalLink,
  Play,
  Eye,
  EyeOff,
} from 'lucide-react'
import { login, type User } from '../api'
import { ROLES, getRoleDefaultRoute } from '../roles'
import { BridgeLightEffect } from '../components/BridgeLightEffect'

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
    <div className="relative min-h-screen bg-slate-950 text-slate-100 overflow-hidden font-sans selection:bg-amber-400 selection:text-slate-950">
      {/* ── AMBIENT BACKGROUND GLOW LIGHTING ──────────────────────────── */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[550px] bg-gradient-to-b from-amber-500/15 via-blue-500/10 to-transparent blur-[120px] pointer-events-none" />
      <div className="absolute top-1/3 -left-48 w-96 h-96 bg-amber-500/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-1/4 -right-48 w-96 h-96 bg-cyan-500/10 rounded-full blur-[100px] pointer-events-none" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 space-y-16">
        {/* ── WELCOME HERO HEADER ────────────────────────────────────── */}
        <div className="text-center max-w-4xl mx-auto space-y-5">
          {/* Top Pill Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-900/90 border border-amber-500/40 shadow-lg shadow-amber-500/10 backdrop-blur-xl">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span className="text-xs font-bold text-amber-300 tracking-wide uppercase">
              {isHindi
                ? 'स्मार्ट इंडिया हैकथॉन (SIH PS-2) · भूमि संसाधन विभाग (DoLR)'
                : 'Smart India Hackathon (SIH PS-2) · Dept. of Land Resources (DoLR)'}
            </span>
          </div>

          {/* Main Title with Modern Gradient Typography */}
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white leading-tight">
            {isHindi ? (
              <>
                भू-अभिलेखों का आधुनिक <span className="gradient-text-gold">एआई सत्यापन</span> एवं डिजिटल रूपांतरण
              </>
            ) : (
              <>
                Next-Gen Land Record <span className="gradient-text-gold">AI Verification</span> & Governance
              </>
            )}
          </h1>

          {/* Clean, Non-Congested Subtitle */}
          <p className="text-sm sm:text-base lg:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed font-normal">
            {isHindi
              ? 'ऐतिहासिक खतौनी, म्यूटेशन एवं भूखण्ड मानचित्रों को द्वैध-ओसीआर मतदान तथा १७ वैधानिक नियमों से सेकंडों में डिजिटल व सत्यापित करें।'
              : 'Transforming legacy revenue deeds and cadastral maps into verified, georeferenced, and tamper-evident digital assets in sub-seconds.'}
          </p>

          {/* Action Callouts */}
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <a
              href="#portal-access"
              className="px-6 py-3 rounded-2xl bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 hover:from-amber-400 hover:to-amber-300 text-slate-950 font-black text-xs sm:text-sm shadow-xl shadow-amber-500/25 transition-all flex items-center gap-2 cursor-pointer hover:scale-105 active:scale-95 shimmer-sweep"
            >
              <span>{isHindi ? 'कार्यक्षेत्र में प्रवेश करें' : 'Enter Portal Workspaces'}</span>
              <ArrowRight className="w-4 h-4" />
            </a>

            <a
              href="https://www.youtube.com/watch?v=8hZgkcB8mU8"
              target="_blank"
              rel="noopener noreferrer"
              className="px-5 py-3 rounded-2xl bg-slate-900/90 hover:bg-slate-800 text-slate-200 border border-slate-700/80 font-bold text-xs sm:text-sm shadow-lg backdrop-blur-md transition-all flex items-center gap-2 hover:border-amber-400"
            >
              <Play className="w-3.5 h-3.5 text-amber-400 fill-current" />
              <span>{isHindi ? 'डेमो वीडियो देखें' : 'Watch Demo Video'}</span>
              <ExternalLink className="w-3 h-3 text-slate-400" />
            </a>
          </div>

          {/* Key Metric Highlights Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-6 max-w-3xl mx-auto">
            <div className="p-3.5 rounded-2xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-md text-center">
              <div className="text-xl sm:text-2xl font-black text-amber-400">10.4s</div>
              <div className="text-[11px] text-slate-400 font-medium mt-0.5">Turnaround per Page</div>
            </div>
            <div className="p-3.5 rounded-2xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-md text-center">
              <div className="text-xl sm:text-2xl font-black text-emerald-400">82%</div>
              <div className="text-[11px] text-slate-400 font-medium mt-0.5">Less Manual Effort</div>
            </div>
            <div className="p-3.5 rounded-2xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-md text-center">
              <div className="text-xl sm:text-2xl font-black text-cyan-400">17</div>
              <div className="text-[11px] text-slate-400 font-medium mt-0.5">Statutory Rules</div>
            </div>
            <div className="p-3.5 rounded-2xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-md text-center">
              <div className="text-xl sm:text-2xl font-black text-purple-400">97.6%</div>
              <div className="text-[11px] text-slate-400 font-medium mt-0.5">Field Accuracy (v2)</div>
            </div>
          </div>
        </div>

        {/* ── VISUAL SHOWCASE: BRIDGE LIGHT EFFECT (main_image.png) ───── */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 px-2">
            <div>
              <div className="flex items-center gap-2 text-xs font-bold text-amber-400 uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Smart Rural Governance & Spatial Verification</span>
              </div>
              <h2 className="text-2xl font-extrabold text-white tracking-tight mt-1">
                {isHindi ? 'केंद्रीय सेतु सत्यापन शिखर' : 'The BhuPramaan Verification Gateway'}
              </h2>
            </div>
            <p className="text-xs text-slate-400 max-w-md sm:text-right">
              {isHindi
                ? 'सेतु के शिखर पर स्थित भू-प्रमाण मुहर पर प्रकाश प्रभाव देखें अथवा विभिन्न तकनीकी आयामों पर क्लिक करें।'
                : 'Hover or click the glowing BhuPramaan seal atop the bridge archway to inspect its neural attestation.'}
            </p>
          </div>

          {/* Interactive Bridge Light Effect Component */}
          <BridgeLightEffect />
        </div>

        {/* ── UNIFIED ACCESS HUB: ROLE-BASED ACCESS & CREDENTIALS ─────── */}
        <div id="portal-access" className="pt-8 space-y-6">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="text-xs font-bold text-amber-400 uppercase tracking-widest flex items-center justify-center gap-1.5">
              <Shield className="w-3.5 h-3.5" />
              Role-Based Access Control (RBAC)
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              {isHindi ? 'शासन एवं प्रशासनिक कार्यक्षेत्र' : 'Select Governance Workspace or Sign In'}
            </h2>
            <p className="text-xs sm:text-sm text-slate-400">
              {isHindi
                ? 'मूल्यांकन हेतु किसी भी भूमिका पर एक-क्लिक से प्रवेश करें अथवा अपने आधिकारिक परिचय-पत्र से लॉगिन करें।'
                : 'Instantly launch any role-specific workspace for hackathon evaluation or authenticate via credentials.'}
            </p>

            {/* Tab Selector */}
            <div className="inline-flex p-1 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl mt-4">
              <button
                type="button"
                onClick={() => setActiveTab('roles')}
                className={`flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
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
                className={`flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
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

          {/* TAB 1: ONE-CLICK ROLE CARDS */}
          {activeTab === 'roles' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 pt-2">
              {DEMO_PRESETS.map((p) => {
                return (
                  <button
                    key={p.role}
                    onClick={() => handleQuickLogin(p.role)}
                    disabled={loading}
                    className="p-5 rounded-2xl bg-slate-900/80 hover:bg-slate-900 border border-slate-800/80 hover:border-amber-400/80 transition-all text-left shadow-lg hover:shadow-2xl hover:shadow-amber-500/10 group cursor-pointer backdrop-blur-md flex flex-col justify-between relative overflow-hidden"
                  >
                    {/* Top ambient highlight on hover */}
                    <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-amber-400/0 group-hover:via-amber-400 transition-all" />

                    <div className="space-y-3">
                      <div className="flex items-center justify-between gap-2">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${p.badgeClass}`}>
                          {p.scope}
                        </span>
                        <span className="text-[10px] font-mono text-slate-500 group-hover:text-amber-400 transition-colors">
                          {p.defaultRoute}
                        </span>
                      </div>

                      <div>
                        <h3 className="text-base font-bold text-white group-hover:text-amber-300 transition-colors flex items-center justify-between">
                          <span>{isHindi ? p.titleHindi : p.label}</span>
                          <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-amber-400 group-hover:translate-x-1 transition-all" />
                        </h3>
                        <p className="text-xs text-slate-400 mt-1 leading-relaxed line-clamp-2">
                          {p.desc}
                        </p>
                      </div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-800/60 flex items-center justify-between text-[11px] text-slate-500">
                      <span className="flex items-center gap-1 font-mono">
                        <UserIcon className="w-3 h-3 text-slate-400" />
                        {p.role}
                      </span>
                      <span className="text-amber-400 font-bold group-hover:underline">
                        Enter &rarr;
                      </span>
                    </div>
                  </button>
                )
              })}
            </div>
          )}

          {/* TAB 2: DIRECT CREDENTIALS FORM */}
          {activeTab === 'credentials' && (
            <div className="max-w-md mx-auto p-8 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-2xl backdrop-blur-xl relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-500 via-amber-300 to-amber-500" />

              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-400/30 flex items-center justify-center text-amber-400 shadow-inner">
                  <Lock className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">
                    {t('login.signInTitle')}
                  </h3>
                  <p className="text-xs text-slate-400">{t('login.subtitle')}</p>
                </div>
              </div>

              {error && (
                <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs">
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
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-700 bg-slate-950/70 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 font-medium transition-all"
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
                      className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-slate-700 bg-slate-950/70 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 font-medium transition-all"
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
                    <span>Default Password: <code className="text-amber-400 font-mono">Demo@1234</code></span>
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

              <div className="mt-6 pt-4 border-t border-slate-800 flex items-center justify-center gap-2 text-[11px] text-slate-400 text-center">
                <Shield className="w-3.5 h-3.5 text-emerald-400" />
                <span>{t('login.secureTag')}</span>
              </div>
            </div>
          )}
        </div>

        {/* ── CORE TECHNOLOGICAL PILLARS (Modern & Uncongested) ───────── */}
        <div className="pt-6 space-y-6">
          <div className="text-center max-w-xl mx-auto">
            <span className="text-xs font-bold text-amber-400 uppercase tracking-widest">
              Architectural Highlights
            </span>
            <h2 className="text-2xl font-black text-white tracking-tight mt-1">
              Four Pillars of BhuPramaan
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-md space-y-3 hover:border-amber-400/50 transition-all">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-400/30 text-amber-400 flex items-center justify-center">
                <Layers className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-white">Neural Restoration</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Adaptive Sauvola binarization, Radon deskewing, and color-space suppression eliminate physical yellowing and dense revenue rubber stamps.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-md space-y-3 hover:border-cyan-400/50 transition-all">
              <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-400/30 text-cyan-400 flex items-center justify-center">
                <Cpu className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-white">Dual-OCR Voting</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                PaddleOCR (Devanagari fine-tuned) and Tesseract 5 vote at the token level via Spatial IoU, resolving ambiguous cursive ligatures.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-md space-y-3 hover:border-purple-400/50 transition-all">
              <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-400/30 text-purple-400 flex items-center justify-center">
                <MapPin className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-white">Cadastral Vector GIS</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                PostGIS MultiPolygon integration cross-verifies tabular deed holding areas with geodesic parcel geometries to prevent boundary fraud.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-md space-y-3 hover:border-emerald-400/50 transition-all">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-400/30 text-emerald-400 flex items-center justify-center">
                <Shield className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-white">Cryptographic Ledger</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Every scan, extraction, verifier edit, and approval is chained with SHA-256 hashes, creating an unalterable audit trail for judicial scrutiny.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
