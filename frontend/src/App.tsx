import { useState, useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import './i18n'
import { Header } from './components/Header'
import { AutoTourGuide } from './components/AutoTourGuide'
import { UploadPage } from './pages/UploadPage'
import { DocumentDetailPage } from './pages/DocumentDetailPage'
import { DocumentsListPage } from './pages/DocumentsListPage'
import { LoginPage } from './pages/LoginPage'
import { ReviewQueuePage } from './pages/ReviewQueuePage'
import { DashboardPage } from './pages/DashboardPage'
import { AuditPage } from './pages/AuditPage'
import { LearningPage } from './pages/LearningPage'
import { CadastralMapPage } from './pages/CadastralMapPage'
import { RecordsPage } from './pages/RecordsPage'
import { getStoredUser, setStoredUser, login, type User } from './api'
import { getRoleDefaultRoute } from './roles'

export function App() {
  const { t } = useTranslation()
  const [currentUser, setCurrentUser] = useState<User | null>(getStoredUser())
  const [isTourActive, setIsTourActive] = useState(false)

  // Ensure session is valid; auto-refresh if credentials expired
  useEffect(() => {
    login('tehsil_operator')
      .then((user) => {
        setCurrentUser(user)
        setStoredUser(user)
      })
      .catch(() => {
        const stored = getStoredUser()
        if (stored) {
          setCurrentUser(stored)
        } else {
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
        }
      })
  }, [])

  return (
    <BrowserRouter>
      <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
        <Header
          currentUser={currentUser}
          onUserChange={setCurrentUser}
          onStartTour={() => setIsTourActive(true)}
        />

        <AutoTourGuide
          active={isTourActive}
          onClose={() => setIsTourActive(false)}
          currentUser={currentUser}
          onUserChange={setCurrentUser}
        />

        <main className="flex-1">
          <Routes>
            <Route
              path="/"
              element={
                currentUser ? (
                  <Navigate to={getRoleDefaultRoute(currentUser.role)} replace />
                ) : (
                  <Navigate to="/login" replace />
                )
              }
            />
            <Route path="/welcome" element={<LoginPage onLoginSuccess={setCurrentUser} />} />
            <Route path="/login" element={<LoginPage onLoginSuccess={setCurrentUser} />} />
            <Route path="/upload" element={<UploadPage />} />
            <Route path="/documents" element={<DocumentsListPage />} />
            <Route path="/documents/:id" element={<DocumentDetailPage />} />
            <Route path="/review" element={<ReviewQueuePage />} />
            <Route path="/records" element={<RecordsPage />} />
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/learning" element={<LearningPage />} />
            <Route path="/audit" element={<AuditPage />} />
            <Route path="/map" element={<CadastralMapPage />} />
          </Routes>
        </main>

        {/* Footer */}
        <footer className="bg-slate-900 border-t border-slate-800 text-slate-400 py-6 text-xs">
          <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="font-bold text-white">{t('footer.title')}</span>
              <span>· {t('footer.sub')}</span>
              <span className="px-2 py-0.5 rounded bg-slate-800 text-amber-400 font-mono text-[10px]">
                {t('footer.badge')}
              </span>
            </div>
            <div className="text-[11px] text-slate-500 text-center sm:text-right">
              {t('footer.disclaimer')}
            </div>
          </div>
        </footer>
      </div>
    </BrowserRouter>
  )
}

export default App
