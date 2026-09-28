import React, { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import {
  FileUp,
  FileText,
  CheckSquare,
  Database,
  Map,
  BarChart3,
  BrainCircuit,
  ShieldCheck,
  Globe,
  UserCheck,
  LogOut,
  ChevronDown,
} from 'lucide-react'
import { login, removeAuthToken, type User } from '../api'

interface HeaderProps {
  currentUser: User | null
  onUserChange: (user: User | null) => void
}

const DEMO_ROLES = [
  { username: 'tehsil_operator', label: 'Tehsil Operator', role: 'tehsil_operator', scope: 'LKO (090101)' },
  { username: 'verifier', label: 'Revenue Verifier', role: 'verifier', scope: 'Lucknow (0901)' },
  { username: 'district_officer', label: 'District Officer', role: 'district_officer', scope: 'Lucknow (0901)' },
  { username: 'state_officer', label: 'State Officer', role: 'state_officer', scope: 'UP (09)' },
  { username: 'auditor', label: 'Auditor', role: 'auditor', scope: 'All-State' },
  { username: 'admin', label: 'Admin', role: 'admin', scope: 'System' },
  { username: 'citizen', label: 'Citizen', role: 'citizen', scope: 'Public' },
]

export const Header: React.FC<HeaderProps> = ({ currentUser, onUserChange }) => {
  const { t, i18n } = useTranslation()
  const location = useLocation()
  const navigate = useNavigate()
  const [showRoleDropdown, setShowRoleDropdown] = useState(false)
  const [switching, setSwitching] = useState(false)

  const toggleLanguage = () => {
    const nextLang = i18n.language === 'hi' ? 'en' : 'hi'
    i18n.changeLanguage(nextLang)
  }

  const handleSwitchRole = async (username: string) => {
    setSwitching(true)
    try {
      const user = await login(username)
      onUserChange(user)
      setShowRoleDropdown(false)
    } catch (err) {
      console.error('Failed to switch role', err)
    } finally {
      setSwitching(false)
    }
  }

  const handleLogout = () => {
    removeAuthToken()
    onUserChange(null)
    navigate('/login')
  }

  const navLinks = [
    { to: '/upload', label: t('nav.upload'), icon: FileUp },
    { to: '/documents', label: t('nav.documents'), icon: FileText },
    { to: '/review', label: t('nav.review'), icon: CheckSquare },
    { to: '/records', label: t('nav.records'), icon: Database },
    { to: '/map', label: t('nav.map'), icon: Map },
    { to: '/dashboard', label: t('nav.dashboard'), icon: BarChart3 },
    { to: '/learning', label: t('nav.learning'), icon: BrainCircuit },
    { to: '/audit', label: t('nav.audit'), icon: ShieldCheck },
  ]

  return (
    <header className="bg-slate-900 text-white border-b border-slate-800 sticky top-0 z-50 shadow-md">
      {/* Top Ministry Banner */}
      <div className="bg-slate-950 px-4 py-1 border-b border-slate-800/80 text-[11px] text-slate-400 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <span className="inline-block w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
          <span className="font-medium text-slate-300">
            राजस्व विभाग / Department of Revenue & Land Records
          </span>
          <span className="text-slate-600">|</span>
          <span className="text-amber-400 font-mono">DILRMP-Compliant Prototype</span>
        </div>

        {/* Demo Helper Switcher & Lang Toggle */}
        <div className="flex items-center gap-3">
          {/* Quick Demo Role Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowRoleDropdown(!showRoleDropdown)}
              className="flex items-center gap-1.5 px-2.5 py-0.5 rounded bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 font-medium transition-colors"
            >
              <UserCheck className="w-3 h-3" />
              <span>Demo Role: {currentUser ? currentUser.role : 'Switch'}</span>
              <ChevronDown className="w-2.5 h-2.5 opacity-70" />
            </button>

            {showRoleDropdown && (
              <div className="absolute right-0 mt-1 w-56 bg-slate-900 border border-slate-700 rounded-lg shadow-2xl py-1 z-50 text-xs">
                <div className="px-3 py-1.5 font-semibold text-slate-400 border-b border-slate-800">
                  Switch Active Demo Role:
                </div>
                {DEMO_ROLES.map((r) => (
                  <button
                    key={r.username}
                    onClick={() => handleSwitchRole(r.username)}
                    disabled={switching}
                    className={`w-full text-left px-3 py-1.5 flex items-center justify-between hover:bg-slate-800 ${
                      currentUser?.username === r.username ? 'bg-amber-500/10 text-amber-400 font-semibold' : 'text-slate-200'
                    }`}
                  >
                    <span>{r.label}</span>
                    <span className="text-[10px] text-slate-500 font-mono">{r.scope}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Language Toggle */}
          <button
            onClick={toggleLanguage}
            className="flex items-center gap-1 px-2 py-0.5 rounded hover:bg-slate-800 text-slate-300 font-medium transition-colors"
            title="Toggle Language"
          >
            <Globe className="w-3 h-3 text-amber-400" />
            <span>{i18n.language === 'hi' ? 'English' : 'हिन्दी'}</span>
          </button>
        </div>
      </div>

      {/* Main Header Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Portal Identity */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-600 via-amber-500 to-amber-400 flex items-center justify-center shadow-lg shadow-amber-500/20 group-hover:scale-105 transition-transform">
              <span className="text-white font-extrabold text-xl tracking-tighter">भू</span>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xl font-bold tracking-tight text-white group-hover:text-amber-400 transition-colors">
                  BhuLekh-AI
                </span>
                <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-400 border border-amber-500/30">
                  Gov-Tech
                </span>
              </div>
              <p className="text-xs text-slate-400 -mt-0.5 font-hindi">
                बुद्धिमान भू-अभिलेख डिजिटलीकरण प्रणाली
              </p>
            </div>
          </Link>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => {
              const Icon = link.icon
              const isActive = location.pathname.startsWith(link.to)
              return (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                    isActive
                      ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30 shadow-sm'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/80'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{link.label}</span>
                </Link>
              )
            })}
          </nav>

          {/* User Profile Pill or Login */}
          <div className="flex items-center gap-3">
            {currentUser ? (
              <div className="flex items-center gap-2">
                <div className="text-right hidden sm:block">
                  <div className="text-xs font-semibold text-slate-200">{currentUser.full_name}</div>
                  <div className="text-[10px] text-amber-400 font-mono uppercase tracking-wide">
                    {currentUser.role} {currentUser.district_code && `· ${currentUser.district_code}`}
                  </div>
                </div>
                <button
                  onClick={handleLogout}
                  className="p-2 rounded-lg bg-slate-800 hover:bg-red-500/20 hover:text-red-400 text-slate-400 transition-colors"
                  title={t('nav.logout')}
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <Link
                to="/login"
                className="px-3.5 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-slate-950 font-semibold text-xs shadow-md shadow-amber-500/20 transition-all"
              >
                Sign In
              </Link>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
