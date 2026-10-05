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
  UserCheck,
  LogOut,
  ChevronDown,
  Play,
  Sparkles,
} from 'lucide-react'
import { login, removeAuthToken, type User } from '../api'
import { ROLES, getRoleDefaultRoute, isRouteAllowedForRole } from '../roles'

interface HeaderProps {
  currentUser: User | null
  onUserChange: (user: User | null) => void
  onStartTour?: () => void
}

const DEMO_ROLES = Object.values(ROLES)

export const Header: React.FC<HeaderProps> = ({ currentUser, onUserChange, onStartTour }) => {
  const { t, i18n } = useTranslation()
  const isHindi = i18n.language === 'hi'
  const location = useLocation()
  const navigate = useNavigate()
  const [showRoleDropdown, setShowRoleDropdown] = useState(false)
  const [switching, setSwitching] = useState(false)

  const isLoginPage = location.pathname === '/login'

  const handleSwitchRole = async (roleKey: string) => {
    setSwitching(true)
    try {
      const user = await login(roleKey)
      onUserChange(user)
      setShowRoleDropdown(false)
      // Navigate to the role's primary landing workspace
      navigate(getRoleDefaultRoute(user.role))
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

  // Master list of navigation links
  const allNavLinks = [
    { to: '/welcome', label: isHindi ? 'पोर्टल स्वागत' : 'Welcome', icon: Sparkles },
    { to: '/upload', label: t('nav.upload'), icon: FileUp },
    { to: '/documents', label: t('nav.documents'), icon: FileText },
    { to: '/review', label: t('nav.review'), icon: CheckSquare },
    { to: '/records', label: t('nav.records'), icon: Database },
    { to: '/map', label: t('nav.map'), icon: Map },
    { to: '/dashboard', label: t('nav.dashboard'), icon: BarChart3 },
    { to: '/learning', label: t('nav.learning'), icon: BrainCircuit },
    { to: '/audit', label: t('nav.audit'), icon: ShieldCheck },
  ]

  // Filter navigation links based on user's active RBAC role
  const visibleNavLinks = allNavLinks.filter((link) =>
    isRouteAllowedForRole(link.to, currentUser?.role)
  )

  const currentRoleCfg = currentUser?.role ? ROLES[currentUser.role] : null

  return (
    <header className="bg-slate-900 text-white border-b border-slate-800 sticky top-0 z-50 shadow-md">
      {/* Top Ministry Banner */}
      <div className="bg-slate-950 px-4 py-1.5 border-b border-slate-800/80 text-[11px] text-slate-400 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <span className="inline-block w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
          <span className="font-semibold text-slate-200">
            {t('common.ministry')}
          </span>
          <span className="text-slate-600 hidden sm:inline">|</span>
          <span className="text-amber-400 font-mono hidden sm:inline">
            {t('common.dilrmpStandard')}
          </span>
        </div>

        {/* Demo Helper Switcher & Clean Unilingual Toggle */}
        <div className="flex items-center gap-3">
          {/* Quick Demo Role Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowRoleDropdown(!showRoleDropdown)}
              className="flex items-center gap-1.5 px-2.5 py-0.5 rounded bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 font-medium transition-colors cursor-pointer text-xs"
            >
              <UserCheck className="w-3 h-3" />
              <span>
                {t('common.activeRole')}: {currentRoleCfg ? (isHindi ? currentRoleCfg.titleHindi : currentRoleCfg.label) : currentUser ? currentUser.role : 'Select Role'}
              </span>
              <ChevronDown className="w-2.5 h-2.5 opacity-70" />
            </button>

            {showRoleDropdown && (
              <div className="absolute right-0 mt-1 w-64 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl py-1 z-50 text-xs">
                <div className="px-3 py-1.5 font-bold text-slate-400 border-b border-slate-800 text-[10px] uppercase tracking-wider">
                  {t('common.switchRole')}:
                </div>
                {DEMO_ROLES.map((r) => (
                  <button
                    key={r.role}
                    onClick={() => handleSwitchRole(r.role)}
                    disabled={switching}
                    className={`w-full text-left px-3 py-2 flex items-center justify-between hover:bg-slate-800 transition-colors cursor-pointer ${
                      currentUser?.role === r.role
                        ? 'bg-amber-500/15 text-amber-400 font-bold'
                        : 'text-slate-200'
                    }`}
                  >
                    <div>
                      <div className="font-semibold">{isHindi ? r.titleHindi : r.label}</div>
                      <div className="text-[10px] text-slate-400 font-mono">{r.scope}</div>
                    </div>
                    <span className="text-[9px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 font-mono">
                      {r.defaultRoute}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Auto Demo Tour Launch Button */}
          {onStartTour && (
            <button
              onClick={onStartTour}
              className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-[11px] shadow-md shadow-amber-500/25 transition-all cursor-pointer animate-flicker shimmer-sweep"
              title={t('tour.launchBtn')}
            >
              <Play className="w-3 h-3 fill-current" />
              <span>{t('tour.launchBtn')}</span>
            </button>
          )}

          {/* Clean Segmented Language Switcher [ English | हिन्दी ] */}
          <div className="flex items-center bg-slate-900 border border-slate-700/80 rounded-lg p-0.5 text-xs">
            <button
              onClick={() => i18n.changeLanguage('en')}
              className={`px-2.5 py-0.5 rounded-md text-[11px] font-bold transition-all cursor-pointer ${
                !isHindi
                  ? 'bg-amber-500 text-slate-950 shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="Switch to English"
            >
              English
            </button>
            <button
              onClick={() => i18n.changeLanguage('hi')}
              className={`px-2.5 py-0.5 rounded-md text-[11px] font-bold transition-all cursor-pointer ${
                isHindi
                  ? 'bg-amber-500 text-slate-950 shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="हिन्दी में बदलें"
            >
              हिन्दी
            </button>
          </div>
        </div>
      </div>

      {/* Main Header Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Portal Identity */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-11 h-11 rounded-full bg-amber-500/10 border border-amber-400/40 flex items-center justify-center shadow-lg shadow-amber-500/20 group-hover:scale-105 transition-transform overflow-hidden p-0.5 animate-flicker">
              <img
                src="/logo.png"
                alt="BhuPramaan Logo"
                className="w-full h-full object-contain drop-shadow"
              />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xl font-extrabold tracking-tight text-white group-hover:text-amber-400 transition-colors">
                  {t('common.appName')}
                </span>
                <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40 animate-pulse">
                  {t('common.landVerified')}
                </span>
              </div>
              <p className="text-xs text-slate-400 -mt-0.5">
                {t('common.appSubtitle')}
              </p>
            </div>
          </Link>

          {/* Navigation Links: Hidden on Sign In page */}
          {!isLoginPage && (
            <nav className="hidden md:flex items-center gap-1">
              {visibleNavLinks.map((link) => {
                const Icon = link.icon
                const isActive = location.pathname.startsWith(link.to)
                return (
                  <Link
                    key={link.to}
                    to={link.to}
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                      isActive
                        ? 'bg-amber-500/15 text-amber-300 border border-amber-500/40 shadow-sm shadow-amber-500/10 font-semibold'
                        : 'text-slate-300 hover:text-white hover:bg-slate-800/80'
                    }`}
                  >
                    <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-amber-400' : ''}`} />
                    <span>{link.label}</span>
                  </Link>
                )
              })}
            </nav>
          )}

          {/* User Profile Pill or Login button: Clean view on /login */}
          <div className="flex items-center gap-3">
            {!isLoginPage && currentUser ? (
              <div className="flex items-center gap-2">
                <div className="text-right hidden sm:block">
                  <div className="text-xs font-semibold text-slate-200">{currentUser.full_name}</div>
                  <div className="flex items-center justify-end gap-1.5 mt-0.5">
                    <span
                      className={`text-[9px] font-bold px-1.5 py-0.2 rounded uppercase tracking-wider border ${
                        currentRoleCfg?.badgeClass || 'bg-slate-800 text-slate-300 border-slate-700'
                      }`}
                    >
                      {currentRoleCfg ? (isHindi ? currentRoleCfg.titleHindi : currentRoleCfg.label) : currentUser.role}
                    </span>
                    {currentUser.district_code && (
                      <span className="text-[10px] text-slate-400 font-mono">
                        {currentUser.district_code}
                      </span>
                    )}
                  </div>
                </div>
                <button
                  onClick={handleLogout}
                  className="p-2 rounded-lg bg-slate-800 hover:bg-red-500/20 hover:text-red-400 text-slate-400 transition-colors cursor-pointer"
                  title={t('nav.logout')}
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : !isLoginPage ? (
              <Link
                to="/login"
                className="px-3.5 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-slate-950 font-semibold text-xs shadow-md shadow-amber-500/20 transition-all"
              >
                {isHindi ? 'लॉग इन' : 'Sign In'}
              </Link>
            ) : null}
          </div>
        </div>
      </div>
    </header>
  )
}
