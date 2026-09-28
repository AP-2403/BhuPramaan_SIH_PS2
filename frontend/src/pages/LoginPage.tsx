import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowRight, Lock, User as UserIcon, Sparkles } from 'lucide-react'
import { login, type User } from '../api'

interface LoginPageProps {
  onLoginSuccess: (user: User) => void
}


const DEMO_PRESETS = [
  { username: 'tehsil_operator', role: 'Tehsil Operator', desc: 'Uploads land records & monitors pipeline' },
  { username: 'verifier', role: 'Revenue Verifier', desc: 'Inspects flagged fields & corrects OCR' },
  { username: 'district_officer', role: 'District Officer', desc: 'District-level dashboards & approvals' },
  { username: 'state_officer', role: 'State Officer', desc: 'State-wide drilldowns & policy oversight' },
  { username: 'auditor', role: 'Auditor', desc: 'Cryptographic hash-chain audit inspection' },
  { username: 'admin', role: 'Administrator', desc: 'Model retraining & rule configuration' },
  { username: 'citizen', role: 'Citizen', desc: 'Public application status lookup' },
]

export const LoginPage: React.FC<LoginPageProps> = ({ onLoginSuccess }) => {
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
      navigate('/upload')
    } catch (err: any) {
      setError(err.message || 'Invalid credentials')
    } finally {
      setLoading(false)
    }
  }

  const handleQuickLogin = async (u: string) => {
    setLoading(true)
    setError(null)
    try {
      const user = await login(u, 'Demo@1234')
      onLoginSuccess(user)
      navigate('/upload')
    } catch (err: any) {
      setError(err.message || 'Quick login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12">
      <div className="max-w-4xl w-full grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
        {/* Left Side: Login Form */}
        <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-xl">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-2xl bg-amber-500 text-slate-950 flex items-center justify-center font-bold text-2xl shadow-lg shadow-amber-500/25">
              भू
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900 tracking-tight">
                Sign In to BhuLekh-AI
              </h2>
              <p className="text-xs text-slate-500">Government Revenue Portal</p>
            </div>
          </div>

          {error && (
            <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Username</label>
              <div className="relative">
                <UserIcon className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-300 text-xs focus:outline-amber-500 bg-slate-50 font-medium"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-300 text-xs focus:outline-amber-500 bg-slate-50 font-medium"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs shadow-md shadow-amber-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>{loading ? 'Authenticating...' : 'Sign In'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="mt-6 pt-4 border-t border-slate-100 text-center text-[11px] text-slate-400">
            Protected by JWT Bearer Auth & Role-Based Access Control (RBAC)
          </div>
        </div>

        {/* Right Side: Quick Demo Role Switcher */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-amber-600 font-bold text-xs uppercase tracking-wider">
            <Sparkles className="w-4 h-4" />
            <span>Fast Demo Mode (1-Click Switch)</span>
          </div>
          <h3 className="text-xl font-extrabold text-slate-900 tracking-tight">
            Select a Demo Profile to Experience Any Role
          </h3>
          <p className="text-xs text-slate-500">
            Click any role below to automatically authenticate with pre-seeded permissions:
          </p>

          <div className="space-y-2">
            {DEMO_PRESETS.map((p) => (
              <button
                key={p.username}
                onClick={() => handleQuickLogin(p.username)}
                disabled={loading}
                className="w-full p-3 rounded-2xl bg-white hover:bg-amber-50/50 border border-slate-200 hover:border-amber-400 text-left transition-all shadow-sm hover:shadow-md flex items-center justify-between group cursor-pointer"
              >
                <div>
                  <div className="text-xs font-bold text-slate-800 group-hover:text-amber-600 transition-colors">
                    {p.role} ({p.username})
                  </div>
                  <div className="text-[11px] text-slate-500">{p.desc}</div>
                </div>
                <div className="w-7 h-7 rounded-xl bg-slate-100 group-hover:bg-amber-500 group-hover:text-slate-950 text-slate-400 flex items-center justify-center transition-colors">
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
