import React, { useState } from 'react'
import {
  BrainCircuit,
  RefreshCw,
  BookOpen,
} from 'lucide-react'
import { useTranslation } from 'react-i18next'

export const LearningPage: React.FC = () => {
  const { t, i18n } = useTranslation()
  const isHindi = i18n.language === 'hi'
  const [retraining, setRetraining] = useState(false)
  const [modelVersion, setModelVersion] = useState('v1.0.2')

  const handleRetrain = () => {
    setRetraining(true)
    setTimeout(() => {
      setRetraining(false)
      setModelVersion('v1.0.3')
    }, 1200)
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header Banner */}
      <div id="learning-retrain-card" className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-1.5 rounded-lg bg-rose-100 text-rose-700">
              <BrainCircuit className="w-5 h-5" />
            </span>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">
              {t('learning.title')}
            </h1>
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-rose-50 border border-rose-200 text-rose-700">
              {t('learning.roleBadge')}
            </span>
          </div>
          <p className="text-xs text-slate-500">
            {t('learning.scope')}
          </p>
        </div>

        <button
          onClick={handleRetrain}
          disabled={retraining}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow-lg shadow-rose-600/25 transition-all cursor-pointer disabled:opacity-50 shimmer-sweep"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${retraining ? 'animate-spin' : ''}`} />
          <span>{retraining ? t('learning.calibrating') : t('learning.retrainBtn')}</span>
        </button>
      </div>

      {/* Model Performance Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">{t('learning.activeIteration')}</span>
          <div className="text-2xl font-black text-slate-900 mt-1">{modelVersion}</div>
          <p className="text-[11px] text-slate-500 mt-1">{t('learning.modelArch')}</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">{t('learning.ensembleCer')}</span>
          <div className="text-2xl font-black text-emerald-600 mt-1">3.12%</div>
          <p className="text-[11px] text-emerald-600 font-semibold mt-1">{t('learning.cerTrend')}</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">{t('learning.lexiconSize')}</span>
          <div className="text-2xl font-black text-indigo-600 mt-1">{isHindi ? '८४२ शब्द' : '842 Terms'}</div>
          <p className="text-[11px] text-slate-500 mt-1">{t('learning.lexiconGrowth')}</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">{t('learning.disputeRed')}</span>
          <div className="text-2xl font-black text-purple-600 mt-1">99.4%</div>
          <p className="text-[11px] text-slate-500 mt-1">{t('learning.disputeMetric')}</p>
        </div>
      </div>

      {/* Feedback Distribution & Learned Lexicon */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Feedback Confusion Categories */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900">
              {isHindi ? 'सत्यापन फीडबैक एवं त्रुटि विश्लेषण' : 'Verification Feedback Breakdown'}
            </h3>
            <span className="text-xs text-slate-500">
              {isHindi ? '१२८ कुल संशोधन' : '128 Total Corrections'}
            </span>
          </div>

          <div className="space-y-3">
            {[
              {
                label: isHindi
                  ? 'वर्ण व मात्रा भ्रम (इ बनाम ी, ब बनाम व)'
                  : 'Character / Matra Confusion (i vs ee, ba vs va)',
                pct: 42,
                color: 'bg-amber-500',
              },
              {
                label: isHindi
                  ? 'क्षेत्रफल इकाई मानकीकरण (बीघा / बिस्वा से वर्ग मी.)'
                  : 'Area Unit Normalization (Bigha / Biswa to Sq M)',
                pct: 28,
                color: 'bg-blue-500',
              },
              {
                label: isHindi
                  ? 'हस्तलिखित व तिरछे अंकों की पहचान'
                  : 'Handwritten / Skewed Digit Misreads',
                pct: 19,
                color: 'bg-indigo-500',
              },
              {
                label: isHindi
                  ? 'धुंधली स्याही एवं मुहर की अस्पष्टता'
                  : 'Faded Ink & Stamp Occlusion',
                pct: 11,
                color: 'bg-rose-500',
              },
            ].map((item, idx) => (
              <div key={idx} className="space-y-1">
                <div className="flex justify-between text-xs font-medium text-slate-700">
                  <span>{item.label}</span>
                  <span className="font-bold">{item.pct}%</span>
                </div>
                <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div className={`h-full ${item.color}`} style={{ width: `${item.pct}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Learned Regional Lexicon */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-indigo-600" />
              <h3 className="text-sm font-bold text-slate-900">
                {isHindi ? 'प्रशिक्षित राजस्व शब्दावली' : 'Learned Revenue Lexicon Sample'}
              </h3>
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-indigo-50 text-indigo-700">
              {isHindi ? 'सक्रिय शब्दकोश' : 'Active Dictionary'}
            </span>
          </div>

          <div className="divide-y divide-slate-100 text-xs">
            {[
              {
                raw: isHindi ? 'खता संख्या / खता' : 'khata sankhya / khata',
                canonical: isHindi ? 'खाता संख्या' : 'Khata Number',
                category: isHindi ? 'शीर्षक फ़ील्ड' : 'Header Field',
                count: isHindi ? '१८४' : '184',
              },
              {
                raw: isHindi ? 'काश्तकार / कास्तकार' : 'kashtkar / kastkar',
                canonical: isHindi ? 'काश्तकार' : 'Tenant / Cultivator',
                category: isHindi ? 'काश्तकारी श्रेणी' : 'Tenure Class',
                count: isHindi ? '१४२' : '142',
              },
              {
                raw: isHindi ? 'संक्रमणीय भूमिधर' : 'sankramaniya bhumidhar',
                canonical: isHindi ? 'भूमिधर संक्रमणीय अधिकार' : 'Bhumidhar (Transferable Rights)',
                category: isHindi ? 'भूमि श्रेणी' : 'Land Class',
                count: isHindi ? '९६' : '96',
              },
              {
                raw: isHindi ? 'हकदार / हक दार' : 'haqdaar / haq daar',
                canonical: isHindi ? 'हकदार' : 'Right Holder',
                category: isHindi ? 'सम्बन्ध' : 'Relation',
                count: isHindi ? '६८' : '68',
              },
            ].map((lex, idx) => (
              <div key={idx} className="py-2.5 flex items-center justify-between">
                <div>
                  <div className="font-bold text-slate-900">{lex.canonical}</div>
                  <div className="text-[11px] text-slate-400 font-mono">
                    {isHindi ? `मान्यता: "${lex.raw}"` : `Recognizes: "${lex.raw}"`}
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                    {lex.category}
                  </span>
                  <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                    {lex.count} {isHindi ? 'प्रविष्टियाँ' : 'hits'}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

