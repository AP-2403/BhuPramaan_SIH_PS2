import React, { useState } from 'react'
import {
  ShieldCheck,
  CheckCircle2,
  Lock,
  RefreshCw,
  Clock,
} from 'lucide-react'
import { useTranslation } from 'react-i18next'

export const AuditPage: React.FC = () => {
  const { t, i18n } = useTranslation()
  const isHindi = i18n.language === 'hi'
  const [verifying, setVerifying] = useState(false)
  const [verifiedCount, setVerifiedCount] = useState(148)

  const handleVerifyChain = () => {
    setVerifying(true)
    setTimeout(() => {
      setVerifying(false)
      setVerifiedCount((c) => c + 1)
    }, 800)
  }

  const sampleAuditLogs = [
    {
      id: 148,
      timestamp: '2026-09-28 16:53:25',
      actor: isHindi ? 'तहसील_प्रचालक (लखनऊ)' : 'tehsil_operator (Lucknow)',
      action: 'document.upload',
      entity: isHindi ? 'दस्तावेज़:54b54348 (खतौनी)' : 'document:54b54348 (Khatauni)',
      hash: 'e74b912c490a618d39f408b172a6bc8f420199e3a612089fb916a048dc721e29',
      prevHash: '61a084bc9123fe11029da1b827e43598712a819bce381a9807519e87123984af',
      status: isHindi ? 'सत्यापित' : 'VERIFIED',
    },
    {
      id: 147,
      timestamp: '2026-09-28 16:53:06',
      actor: isHindi ? 'तहसील_प्रचालक (लखनऊ)' : 'tehsil_operator (Lucknow)',
      action: 'document.upload',
      entity: isHindi ? 'दस्तावेज़:ef0c68fc (भूखण्ड मानचित्र)' : 'document:ef0c68fc (Cadastral Map)',
      hash: '61a084bc9123fe11029da1b827e43598712a819bce381a9807519e87123984af',
      prevHash: '129fa871bca4928174ea8b19283746a9b182746cba19827364102983746a9182',
      status: isHindi ? 'सत्यापित' : 'VERIFIED',
    },
    {
      id: 146,
      timestamp: '2026-09-28 14:10:22',
      actor: isHindi ? 'सिस्टम (पाइपलाइन)' : 'system (pipeline)',
      action: 'layout.analyze',
      entity: isHindi ? 'पृष्ठ:9d7e98c6/1 (७ क्षेत्र विभाजन)' : 'page:9d7e98c6/1 (7 regions detected)',
      hash: '129fa871bca4928174ea8b19283746a9b182746cba19827364102983746a9182',
      prevHash: '4a87b192837461a9b827364102983746a9182746cba19827364102983746a918',
      status: isHindi ? 'सत्यापित' : 'VERIFIED',
    },
    {
      id: 145,
      timestamp: '2026-09-28 13:45:10',
      actor: isHindi ? 'सत्यापक (लखनऊ)' : 'verifier (Lucknow)',
      action: 'field.correct',
      entity: isHindi ? 'फ़ील्ड:khasra_no (२४५/१ संशोधित)' : 'field:khasra_no (245/1 corrected)',
      hash: '4a87b192837461a9b827364102983746a9182746cba19827364102983746a918',
      prevHash: '0000a89f817293847a61b829384756cba19283746a918273645019283746a192',
      status: isHindi ? 'सत्यापित' : 'VERIFIED',
    },
  ]

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header Banner */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-1.5 rounded-lg bg-emerald-100 text-emerald-700">
              <ShieldCheck className="w-5 h-5" />
            </span>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">
              {t('audit.title')}
            </h1>
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700">
              {t('audit.roleBadge')}
            </span>
          </div>
          <p className="text-xs text-slate-500">
            {t('audit.jurisdiction')}
          </p>
        </div>

        {/* Action Button */}
        <button
          onClick={handleVerifyChain}
          disabled={verifying}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg shadow-emerald-600/25 transition-all cursor-pointer disabled:opacity-50 shimmer-sweep"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${verifying ? 'animate-spin' : ''}`} />
          <span>{verifying ? t('audit.validating') : t('audit.verifyBtn')}</span>
        </button>
      </div>

      {/* Cryptographic Seal Banner */}
      <div id="audit-seal-banner" className="bg-gradient-to-r from-emerald-950 via-slate-900 to-slate-900 rounded-3xl p-6 border border-emerald-500/40 text-white shadow-xl flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-emerald-500/20 border-2 border-emerald-400 flex items-center justify-center text-emerald-400 shadow-lg shadow-emerald-500/30 flex-shrink-0 animate-flicker">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-white">{t('audit.chainStatus')}</h2>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                {t('audit.val100')}
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-1 max-w-xl">
              {t('audit.chainDesc')}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 text-xs font-mono text-emerald-400 bg-emerald-950/60 border border-emerald-500/30 rounded-2xl px-4 py-3">
          <Lock className="w-4 h-4 text-emerald-400" />
          <div>
            <div className="text-[10px] text-slate-400 uppercase tracking-wider">{t('audit.headHash')}</div>
            <div className="text-xs font-bold">e74b912c...dc721e29</div>
          </div>
        </div>
      </div>

      {/* Audit Log Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900">
            {isHindi ? 'अपरिवर्तनीय संपादन बहीखाता (लेजर)' : 'Immutable Transition Ledger'}
          </h3>
          <span className="text-xs text-slate-500">
            {isHindi ? `हालिया ४ प्रविष्टियाँ (कुल ${verifiedCount})` : `Showing recent 4 of ${verifiedCount} entries`}
          </span>
        </div>

        <div className="divide-y divide-slate-100 text-xs">
          {sampleAuditLogs.map((log) => (
            <div key={log.id} className="p-4 hover:bg-slate-50/70 transition-colors space-y-2">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded text-[11px]">
                    #{log.id}
                  </span>
                  <span className="font-bold text-slate-900">{log.action}</span>
                  <span className="text-slate-500">· {log.entity}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-slate-400 flex items-center gap-1 font-mono text-[11px]">
                    <Clock className="w-3 h-3" />
                    {log.timestamp}
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                    {log.status}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-[11px] font-mono text-slate-500 bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                <div className="truncate">
                  <span className="text-slate-400 font-semibold mr-1">Prev:</span>
                  {log.prevHash}
                </div>
                <div className="truncate text-emerald-700 font-semibold">
                  <span className="text-slate-400 font-semibold mr-1">Hash:</span>
                  {log.hash}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

