import React from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import {
  CheckSquare,
  AlertTriangle,
  Clock,
  ArrowRight,
  Filter,
  Sparkles,
} from 'lucide-react'

export const ReviewQueuePage: React.FC = () => {
  const { t, i18n } = useTranslation()
  const isHindi = i18n.language === 'hi'

  const pendingTasks = [
    {
      id: 'task-101',
      docId: '9d7e98c6-f31c-494a-ad97-8fc569edea79',
      filename: 'a_000000_degraded.png',
      docType: isHindi ? 'खतौनी' : 'Khatauni',
      village: isHindi ? 'हसनपुर (०९०१०१०१)' : 'Hasanpur (09010101)',
      priority: 0.94,
      uncertainFields: 2,
      reason: isHindi
        ? 'खसरा २४५/१ पर कम ओसीआर विश्वास; अंकगणितीय अंश सत्यापन असफल'
        : 'Low OCR confidence on Khasra 245/1; Arithmetic share validation check failed',
      qualityScore: 0.68,
      age: isHindi ? '१८ मिनट पूर्व' : '18 mins ago',
      status: 'pending_review',
    },
    {
      id: 'task-102',
      docId: '54b54348-0219-416e-ba88-9ed8dabe54da',
      filename: '1_khatauni_degraded_sample.png',
      docType: isHindi ? 'खतौनी' : 'Khatauni',
      village: isHindi ? 'मोहनपुर (०९०१०१०४)' : 'Mohanpur (09010104)',
      priority: 0.88,
      uncertainFields: 1,
      reason: isHindi
        ? 'खातेदार नाम में फीकी स्याही; मानवीय पुष्टि अपेक्षित'
        : 'Faded ink in Owner Name field; Needs human eye confirmation',
      qualityScore: 0.72,
      age: isHindi ? '४२ मिनट पूर्व' : '42 mins ago',
      status: 'pending_review',
    },
    {
      id: 'task-103',
      docId: 'ef0c68fc-d0d7-4fb5-84e2-82a64467f42b',
      filename: '4_cadastral_map_sample.png',
      docType: isHindi ? 'भूखण्ड मानचित्र' : 'Cadastral Map',
      village: isHindi ? 'आलमबाग (०९०१०१०२)' : 'Alambagh (09010102)',
      priority: 0.82,
      uncertainFields: 1,
      reason: isHindi
        ? 'भूखण्ड ३१२ पर पार्सल सीमा कोण सहनशीलता चेतावनी'
        : 'Parcel boundary closure angle tolerance warning on plot 312',
      qualityScore: 0.65,
      age: isHindi ? '१ घंटा पूर्व' : '1 hour ago',
      status: 'assigned',
    },
  ]

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Role Context Header with panel3.png Digitizer Desk Backdrop */}
      <div className="relative rounded-3xl overflow-hidden border border-indigo-500/30 shadow-2xl bg-slate-950">
        {/* Background panel 3 image with dark gradient overlay */}
        <div className="absolute inset-0 z-0">
          <img
            src="/background/panel3.png"
            alt="Revenue Digitizer Verification Desk"
            className="w-full h-full object-cover object-center opacity-30 transform scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/85 to-indigo-950/60" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-amber-500/10 via-transparent to-transparent" />
        </div>

        {/* Ambient floating glow orb */}
        <div className="light-orb-gold -top-24 -left-16" />

        <div className="relative z-10 p-6 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-1.5 flex-wrap">
              <span className="p-1.5 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-400/30 animate-flicker">
                <CheckSquare className="w-5 h-5" />
              </span>
              <h1 className="text-xl font-bold text-white tracking-tight">
                {t('review.title')}
              </h1>
              <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-amber-500/15 border border-amber-400/30 text-amber-300 font-mono">
                {t('review.roleBadge')}
              </span>
            </div>
            <p className="text-xs text-slate-300 max-w-xl">
              {t('review.jurisdiction')}
            </p>
          </div>

          {/* Verifier Metrics Summary in Frosted Glass Cards */}
          <div className="flex items-center gap-3">
            <div className="px-3.5 py-2.5 rounded-2xl bg-slate-900/80 border border-slate-700/80 backdrop-blur-md text-center shadow-lg">
              <div className="text-base font-extrabold text-amber-400 font-mono">{pendingTasks.length}</div>
              <div className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">{t('review.pendingCount')}</div>
            </div>
            <div className="px-3.5 py-2.5 rounded-2xl bg-slate-900/80 border border-slate-700/80 backdrop-blur-md text-center shadow-lg">
              <div className="text-base font-extrabold text-emerald-400 font-mono">92.4%</div>
              <div className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">{t('review.autoAcceptRate')}</div>
            </div>
            <div className="px-3.5 py-2.5 rounded-2xl bg-slate-900/80 border border-slate-700/80 backdrop-blur-md text-center shadow-lg">
              <div className="text-base font-extrabold text-cyan-300 font-mono">4.2m</div>
              <div className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">{t('review.avgTurnaround')}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Queue Filter Controls */}
      <div id="review-filter-bar" className="bg-slate-100/70 p-3 rounded-xl border border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2">
          <Filter className="w-3.5 h-3.5 text-slate-500" />
          <button className="px-2.5 py-1 rounded-lg bg-white font-semibold text-slate-900 shadow-xs border border-slate-300">
            {t('review.filterAll')} ({pendingTasks.length})
          </button>
          <button className="px-2.5 py-1 rounded-lg hover:bg-slate-200 text-slate-600">
            {t('review.filterHigh')}
          </button>
          <button className="px-2.5 py-1 rounded-lg hover:bg-slate-200 text-slate-600">
            {t('review.filterMismatch')}
          </button>
        </div>

        <div className="text-slate-500 text-[11px] flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-amber-500" />
          <span>{t('review.lexiconNote')}</span>
        </div>
      </div>

      {/* Task Cards List */}
      <div id="review-queue-list" className="space-y-3">
        {pendingTasks.map((tItem) => (
          <div
            key={tItem.id}
            className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs hover:shadow-md transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 card-hover-glow"
          >
            <div className="space-y-1.5 flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-mono font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded">
                  {tItem.id}
                </span>
                <span className="font-bold text-slate-900 text-sm">{tItem.filename}</span>
                <span className="text-xs px-2.5 py-0.5 rounded-full font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
                  {tItem.docType}
                </span>
                <span className="text-xs text-slate-500">· {tItem.village}</span>
                <span className="text-xs text-slate-400 flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {tItem.age}
                </span>
              </div>

              <div className="flex items-center gap-2 text-xs text-red-600 font-medium">
                <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0" />
                <span>{tItem.reason}</span>
              </div>
            </div>

            {/* Right Action & Priority */}
            <div className="flex items-center gap-3 flex-shrink-0">
              <div className="text-right">
                <div className="text-xs text-slate-400 font-medium">{t('review.priorityLabel')}</div>
                <div className="text-sm font-extrabold text-rose-600 font-mono">
                  {(tItem.priority * 100).toFixed(0)}%
                </div>
              </div>

              <Link
                to={`/documents/${tItem.docId}`}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md shadow-indigo-600/25 transition-all cursor-pointer shimmer-sweep"
              >
                <span>{t('review.inspectBtn')}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
