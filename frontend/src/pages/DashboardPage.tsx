import React from 'react'
import {
  BarChart3,
  TrendingUp,
  ShieldAlert,
  CheckCircle,
  MapPin,
  FileCheck2,
  ArrowUpRight,
} from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { getStoredUser } from '../api'

export const DashboardPage: React.FC = () => {
  const { t, i18n } = useTranslation()
  const isHindi = i18n.language === 'hi'
  const user = getStoredUser()
  const isDistrictOfficer = user?.role === 'district_officer'

  const title = isDistrictOfficer
    ? (isHindi ? 'जिला राजस्व मूल्यांकन एवं डिजिटलीकरण डैशबोर्ड' : 'District Revenue Digitization & KPI Dashboard')
    : t('dashboard.title')

  const roleBadge = isDistrictOfficer
    ? (isHindi ? 'जिला राजस्व अधिकारी (लखनऊ)' : 'District Officer (Lucknow - 0901)')
    : t('dashboard.roleBadge')

  const jurisdiction = isDistrictOfficer
    ? (isHindi
        ? 'जिला ०९०१ (लखनऊ) · ५ तहसीलें (सदर, मलिहाबाद, बीकेटी, मोहनलालगंज, सरोजनीनगर) · कैडेस्ट्रल मानचित्र समन्वय'
        : 'District 0901 (Lucknow) · 5 Tehsils Monitored · Cadastral Vector GIS Sync Active')
    : t('dashboard.jurisdiction')

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header Banner with main_image.png Grand Portal Backdrop */}
      <div className="relative rounded-3xl overflow-hidden border border-purple-500/30 shadow-2xl bg-slate-950">
        {/* Background main image with dark gradient overlay */}
        <div className="absolute inset-0 z-0">
          <img
            src="/background/main_image.png"
            alt="Executive Land Analytics Portal"
            className="w-full h-full object-cover object-center opacity-25 transform scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/85 to-purple-950/50" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-amber-500/10 via-transparent to-transparent" />
        </div>

        {/* Ambient floating glow orb */}
        <div className="light-orb-gold -top-24 -right-16" />

        <div className="relative z-10 p-6 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-1.5 flex-wrap">
              <span className="p-1.5 rounded-xl bg-purple-500/20 text-purple-300 border border-purple-400/30 animate-flicker">
                <BarChart3 className="w-5 h-5" />
              </span>
              <h1 className="text-xl font-bold text-white tracking-tight">
                {title}
              </h1>
              <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-purple-500/15 border border-purple-400/30 text-purple-300 font-mono">
                {roleBadge}
              </span>
            </div>
            <p className="text-xs text-slate-300 max-w-xl">
              {jurisdiction}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-slate-900/80 border border-emerald-500/40 text-emerald-300 text-xs font-semibold backdrop-blur-md shadow-lg shadow-emerald-500/10">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              {t('dashboard.syncActive')}
            </span>
          </div>
        </div>
      </div>

      {/* KPI Stats Cards with Card Hover Glow */}
      <div id="dashboard-kpis" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm card-hover-glow relative overflow-hidden group">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-400 to-amber-600 opacity-80" />
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">{t('dashboard.totalDigitized')}</span>
            <span className="p-1.5 rounded-lg bg-amber-100 text-amber-600 group-hover:scale-110 transition-transform">
              <FileCheck2 className="w-4 h-4" />
            </span>
          </div>
          <div className="text-2xl font-black text-slate-900 font-mono">{isHindi ? '१,२४८' : '1,248'}</div>
          <div className="flex items-center gap-1 text-[11px] text-emerald-600 font-semibold mt-1">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>{t('dashboard.weekGrowth')}</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm card-hover-glow relative overflow-hidden group">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-400 to-emerald-600 opacity-80" />
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">{t('dashboard.autoAcceptRate')}</span>
            <span className="p-1.5 rounded-lg bg-emerald-100 text-emerald-600 group-hover:scale-110 transition-transform">
              <CheckCircle className="w-4 h-4" />
            </span>
          </div>
          <div className="text-2xl font-black text-slate-900 font-mono">{isHindi ? '९३.८%' : '93.8%'}</div>
          <div className="text-[11px] text-slate-500 mt-1">
            {t('dashboard.targetMet')}
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm card-hover-glow relative overflow-hidden group">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-cyan-400 to-blue-600 opacity-80" />
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">{t('dashboard.landAreaParsed')}</span>
            <span className="p-1.5 rounded-lg bg-blue-100 text-blue-600 group-hover:scale-110 transition-transform">
              <MapPin className="w-4 h-4" />
            </span>
          </div>
          <div className="text-2xl font-black text-slate-900 font-mono">{isHindi ? '४,८५० हे.' : '4,850 Ha'}</div>
          <div className="text-[11px] text-slate-500 mt-1">
            {t('dashboard.parcelsLinked')}
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm card-hover-glow relative overflow-hidden group">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-rose-400 to-red-600 opacity-80" />
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">{t('dashboard.activeDisputes')}</span>
            <span className="p-1.5 rounded-lg bg-rose-100 text-rose-600 group-hover:scale-110 transition-transform">
              <ShieldAlert className="w-4 h-4" />
            </span>
          </div>
          <div className="text-2xl font-black text-rose-600 font-mono">{isHindi ? '२' : '2'}</div>
          <div className="text-[11px] text-slate-500 mt-1">
            {t('dashboard.disputeNote')}
          </div>
        </div>
      </div>

      {/* Tehsil Breakdown Table */}
      <div id="tehsil-table-card" className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900">{t('dashboard.tehsilThroughput')}</h3>
            <p className="text-xs text-slate-500">{isHindi ? 'जनपद ०९०१ के प्रशासनिक प्रभागों की स्थिति' : 'Breakdown across District 0901 administrative units'}</p>
          </div>
          <button className="text-xs text-purple-700 font-semibold hover:underline flex items-center gap-1">
            <span>{isHindi ? 'डीआईएलआरएमपी रिपोर्ट डाउनलोड' : 'Export DILRMP Report'}</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">{t('dashboard.thTehsil')}</th>
                <th className="py-3 px-4">{isHindi ? 'एलजीडी कोड' : 'LGD Code'}</th>
                <th className="py-3 px-4">{t('dashboard.thDocs')}</th>
                <th className="py-3 px-4">{t('dashboard.thAutoRate')}</th>
                <th className="py-3 px-4">{t('dashboard.thQuality')}</th>
                <th className="py-3 px-4">{isHindi ? 'स्थिति' : 'Status'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
              {[
                { name: isHindi ? 'लखनऊ सदर' : 'Lucknow Sadar', code: '090101', count: isHindi ? '४१२' : '412', rate: '94.6%', conf: '0.942', status: isHindi ? 'उत्कृष्ट' : 'Optimal' },
                { name: isHindi ? 'मलिहाबाद' : 'Malihabad', code: '090102', count: isHindi ? '३४८' : '348', rate: '93.1%', conf: '0.928', status: isHindi ? 'उत्कृष्ट' : 'Optimal' },
                { name: isHindi ? 'मोहनलालगंज' : 'Mohanlalganj', code: '090103', count: isHindi ? '२८८' : '288', rate: '92.4%', conf: '0.915', status: isHindi ? 'उत्कृष्ट' : 'Optimal' },
                { name: isHindi ? 'बख्शी का तालाब' : 'Bakshi Ka Talab', code: '090104', count: isHindi ? '२००' : '200', rate: '95.1%', conf: '0.950', status: isHindi ? 'उत्कृष्ट' : 'Optimal' },
              ].map((row, idx) => (
                <tr key={idx} className="hover:bg-slate-50/60">
                  <td className="py-3 px-4 font-bold text-slate-900">{row.name}</td>
                  <td className="py-3 px-4 font-mono text-slate-500">{row.code}</td>
                  <td className="py-3 px-4">{row.count}</td>
                  <td className="py-3 px-4 text-emerald-600 font-bold">{row.rate}</td>
                  <td className="py-3 px-4 font-mono">{row.conf}</td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      {row.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

