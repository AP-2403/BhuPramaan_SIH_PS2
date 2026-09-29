import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ArrowRight, Lock, User as UserIcon, Sparkles, Shield } from 'lucide-react'
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
  const [username, setUsername] = useState('tehsil_operator')
  const [password, setPassword] = useState('Demo@1234')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

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
    <div className="relative min-h-[88vh] flex items-center justify-center px-4 py-12 overflow-hidden">
      {/* Background Hero Artwork with Soft Vignette */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-20 filter scale-105 pointer-events-none"
        style={{ backgroundImage: "url('/background/main_image.png')" }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-slate-900/90 via-slate-950/80 to-slate-900/95 pointer-events-none" />

      {/* Subtle Ambient Light Glows */}
      <div className="absolute top-1/4 left-10 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none animate-pulse" />
      <div className="absolute bottom-10 right-10 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none animate-cyan-pulse" />

      <div className="relative z-10 max-w-5xl w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Side: Login Form (5 cols) */}
        <div id="login-form-card" className="lg:col-span-5 bg-white/95 backdrop-blur-xl rounded-3xl p-8 border border-white/50 shadow-2xl relative overflow-hidden">
          {/* Top subtle light accent line */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-400 via-amber-500 to-amber-300" />

          {/* Language Switcher */}
          <div className="flex justify-end mb-4">
            <div className="inline-flex items-center bg-slate-100 border border-slate-300 rounded-lg p-0.5 text-xs">
              <button
                type="button"
                onClick={() => i18n.changeLanguage('en')}
                className={`px-2.5 py-0.5 rounded-md text-[11px] font-bold transition-all cursor-pointer ${
                  !isHindi ? 'bg-amber-500 text-slate-950 shadow-xs' : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                English
              </button>
              <button
                type="button"
                onClick={() => i18n.changeLanguage('hi')}
                className={`px-2.5 py-0.5 rounded-md text-[11px] font-bold transition-all cursor-pointer ${
                  isHindi ? 'bg-amber-500 text-slate-950 shadow-xs' : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                हिन्दी
              </button>
            </div>
          </div>

          <div className="flex items-center gap-3.5 mb-6">
            <div className="w-14 h-14 rounded-full bg-amber-500/10 border border-amber-300 shadow-md p-0.5 overflow-hidden flex items-center justify-center flex-shrink-0 animate-flicker">
              <img
                src="/logo.png"
                alt="BhuPramaan Logo"
                className="w-full h-full object-contain"
              />
            </div>
            <div>
              <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
                {t('login.signInTitle')}
              </h2>
              <p className="text-xs text-slate-500">{t('login.subtitle')}</p>
            </div>
          </div>

          {error && (
            <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">{t('login.username')}</label>
              <div className="relative">
                <UserIcon className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-300 text-xs focus:outline-amber-500 bg-slate-50/80 font-medium"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">{t('login.password')}</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-300 text-xs focus:outline-amber-500 bg-slate-50/80 font-medium"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-lg shadow-amber-500/25 transition-all flex items-center justify-center gap-2 cursor-pointer shimmer-sweep"
            >
              <span>{loading ? t('login.authenticating') : t('login.signInBtn')}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-center gap-2 text-[11px] text-slate-400 text-center">
            <Shield className="w-3.5 h-3.5 text-amber-500" />
            <span>{t('login.secureTag')}</span>
          </div>
        </div>

        {/* Right Side: Role Profiles with Differentiated Workspaces (7 cols) */}
        <div id="login-roles-grid" className="lg:col-span-7 space-y-4">
          <div className="flex items-center gap-2 text-amber-400 font-bold text-xs uppercase tracking-wider">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>Role-Based Access Control (RBAC) Demo</span>
          </div>
          <div>
            <h3 className="text-xl font-extrabold text-white tracking-tight drop-shadow-sm">
              {isHindi ? 'प्रत्येक भूमिका हेतु समर्पित कार्यक्षेत्र' : 'Each Role Opens a Dedicated Workspace'}
            </h3>
            <p className="text-xs text-slate-300 mt-0.5">
              {t('login.quickFillPrompt')}
            </p>
          </div>

          <div className="space-y-2.5">
            {DEMO_PRESETS.map((p) => (
              <button
                key={p.role}
                onClick={() => handleQuickLogin(p.role)}
                disabled={loading}
                className="w-full p-3.5 rounded-2xl bg-white/95 hover:bg-white border border-white/40 hover:border-amber-400 text-left transition-all shadow-md hover:shadow-xl flex items-center justify-between group cursor-pointer backdrop-blur-md"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-bold text-slate-900 group-hover:text-amber-600 transition-colors">
                      {isHindi ? p.titleHindi : p.label}
                    </span>
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${p.badgeClass}`}>
                      {p.scope}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-600">
                    {p.desc}
                  </div>
                </div>

                <div className="w-8 h-8 rounded-xl bg-slate-100 group-hover:bg-amber-500 group-hover:text-slate-950 text-slate-400 flex items-center justify-center transition-colors flex-shrink-0 ml-3">
                  <ArrowRight className="w-4 h-4" />
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
