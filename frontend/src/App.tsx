import { useState, useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import './i18n'
import { Header } from './components/Header'
import { UploadPage } from './pages/UploadPage'
import { DocumentDetailPage } from './pages/DocumentDetailPage'
import { DocumentsListPage } from './pages/DocumentsListPage'
import { LoginPage } from './pages/LoginPage'
import { getStoredUser, setStoredUser, login, type User } from './api'


export function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(getStoredUser())

  // Ensure default demo session is active
  useEffect(() => {
    if (!currentUser) {
      login('tehsil_operator')
        .then((user) => setCurrentUser(user))
        .catch(() => {
          // If backend not reachable, provide fallback dev session
          const fallbackUser: User = {
            id: 'dev-operator-1',
            username: 'tehsil_operator',
            full_name: 'Tehsil Operator (Demo)',
            role: 'tehsil_operator',
            state_code: '09',
            district_code: '0901',
            tehsil_code: '090101',
          }
          setCurrentUser(fallbackUser)
          setStoredUser(fallbackUser)
        })
    }
  }, [currentUser])

  return (
    <BrowserRouter>
      <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
        <Header currentUser={currentUser} onUserChange={setCurrentUser} />

        <main className="flex-1">
          <Routes>
            <Route path="/" element={<Navigate to="/upload" replace />} />
            <Route path="/upload" element={<UploadPage />} />
            <Route path="/documents" element={<DocumentsListPage />} />
            <Route path="/documents/:id" element={<DocumentDetailPage />} />
            <Route path="/login" element={<LoginPage onLoginSuccess={setCurrentUser} />} />

            {/* Stubs for later milestones M3-M12 */}
            <Route
              path="/review"
              element={
                <div className="max-w-4xl mx-auto py-16 px-4 text-center">
                  <div className="p-8 bg-white rounded-3xl border border-slate-200 shadow-sm">
                    <h2 className="text-xl font-bold text-slate-800">Verification & Review Queue</h2>
                    <p className="text-slate-500 text-xs mt-1">Scheduled for Milestone M7 (Human-in-the-Loop Verification UI)</p>
                  </div>
                </div>
              }
            />
            <Route
              path="/records"
              element={
                <div className="max-w-4xl mx-auto py-16 px-4 text-center">
                  <div className="p-8 bg-white rounded-3xl border border-slate-200 shadow-sm">
                    <h2 className="text-xl font-bold text-slate-800">Land Records Repository</h2>
                    <p className="text-slate-500 text-xs mt-1">Scheduled for Milestone M5-M6 (Extracted & Validated Records)</p>
                  </div>
                </div>
              }
            />
            <Route
              path="/map"
              element={
                <div className="max-w-4xl mx-auto py-16 px-4 text-center">
                  <div className="p-8 bg-white rounded-3xl border border-slate-200 shadow-sm">
                    <h2 className="text-xl font-bold text-slate-800">Cadastral GIS Map (Leaflet)</h2>
                    <p className="text-slate-500 text-xs mt-1">Scheduled for Milestone M9 (Map Parsing & Parcel Linking)</p>
                  </div>
                </div>
              }
            />
            <Route
              path="/dashboard"
              element={
                <div className="max-w-4xl mx-auto py-16 px-4 text-center">
                  <div className="p-8 bg-white rounded-3xl border border-slate-200 shadow-sm">
                    <h2 className="text-xl font-bold text-slate-800">Executive KPI Dashboard</h2>
                    <p className="text-slate-500 text-xs mt-1">Scheduled for Milestone M10 (Recharts + 30-Day Historical Trends)</p>
                  </div>
                </div>
              }
            />
            <Route
              path="/learning"
              element={
                <div className="max-w-4xl mx-auto py-16 px-4 text-center">
                  <div className="p-8 bg-white rounded-3xl border border-slate-200 shadow-sm">
                    <h2 className="text-xl font-bold text-slate-800">Model Learning & Lexicon Growth</h2>
                    <p className="text-slate-500 text-xs mt-1">Scheduled for Milestone M8 (Active Feedback Loop)</p>
                  </div>
                </div>
              }
            />
            <Route
              path="/audit"
              element={
                <div className="max-w-4xl mx-auto py-16 px-4 text-center">
                  <div className="p-8 bg-white rounded-3xl border border-slate-200 shadow-sm">
                    <h2 className="text-xl font-bold text-slate-800">Tamper-Evident Audit Trail</h2>
                    <p className="text-slate-500 text-xs mt-1">Scheduled for Milestone M11 (SHA-256 Hash Chain Verification)</p>
                  </div>
                </div>
              }
            />
          </Routes>
        </main>

        {/* Footer */}
        <footer className="bg-slate-900 border-t border-slate-800 text-slate-400 py-6 text-xs">
          <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="font-bold text-white">BhuLekh-AI</span>
              <span>· Hackathon Prototype v0.2.0</span>
              <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono text-[10px]">
                Milestone M2
              </span>
            </div>
            <div className="text-[11px] text-slate-500 text-center sm:text-right">
              Demonstration prototype adhering to DILRMP standards · Synthetic & seed data used for evaluation
            </div>
          </div>
        </footer>
      </div>
    </BrowserRouter>
  )
}

export default App
