import React, { useState } from 'react'
import {
  Database,
  Search,
  Lock,
  CheckCircle2,
} from 'lucide-react'
import { useTranslation } from 'react-i18next'

export const RecordsPage: React.FC = () => {
  const { t, i18n } = useTranslation()
  const isHindi = i18n.language === 'hi'
  const [searchTerm, setSearchTerm] = useState('')

  const sampleRecords = [
    {
      id: 'REC-0901-2451',
      khasraNo: isHindi ? '२४५/१' : '245/1',
      khataNo: isHindi ? '१०४' : '104',
      village: isHindi ? 'हसनपुर (०९०१०१०१)' : 'Hasanpur (09010101)',
      district: isHindi ? 'लखनऊ' : 'Lucknow',
      ownerName: isHindi ? 'रामेश्वर प्रसाद' : 'Rameshwar Prasad',
      fatherName: isHindi ? 'राम लखन' : 'Ram Lakhan',
      maskedAadhaar: 'XXXX-XXXX-8924',
      areaOriginal: isHindi ? '०.४१२ हेक्टेयर' : '0.412 Hectares',
      areaSqM: isHindi ? '४,१२० वर्ग मी.' : '4,120 m²',
      landClass: isHindi ? 'भूमिधर संक्रमणीय अधिकार' : 'Bhumidhar (Transferable Rights)',
      parcelStatus: 'LINKED_AND_VALIDATED',
    },
    {
      id: 'REC-0901-2452',
      khasraNo: isHindi ? '२४५/२' : '245/2',
      khataNo: isHindi ? '१०४' : '104',
      village: isHindi ? 'हसनपुर (०९०१०१०१)' : 'Hasanpur (09010101)',
      district: isHindi ? 'लखनऊ' : 'Lucknow',
      ownerName: isHindi ? 'सुरेश कुमार' : 'Suresh Kumar',
      fatherName: isHindi ? 'रामेश्वर प्रसाद' : 'Rameshwar Prasad',
      maskedAadhaar: 'XXXX-XXXX-1205',
      areaOriginal: isHindi ? '०.२०८ हेक्टेयर' : '0.208 Hectares',
      areaSqM: isHindi ? '२,०८० वर्ग मी.' : '2,080 m²',
      landClass: isHindi ? 'भूमिधर संक्रमणीय अधिकार' : 'Bhumidhar (Transferable Rights)',
      parcelStatus: 'LINKED_AND_VALIDATED',
    },
    {
      id: 'REC-0901-3120',
      khasraNo: isHindi ? '३१२' : '312',
      khataNo: isHindi ? '८८' : '88',
      village: isHindi ? 'मोहनपुर (०९०१०१०४)' : 'Mohanpur (09010104)',
      district: isHindi ? 'लखनऊ' : 'Lucknow',
      ownerName: isHindi ? 'कमला देवी' : 'Kamla Devi',
      fatherName: isHindi ? 'पत्नी स्व. शिव प्रसाद' : 'W/o Late Shiv Prasad',
      maskedAadhaar: 'XXXX-XXXX-6341',
      areaOriginal: isHindi ? '०.६२० हेक्टेयर' : '0.620 Hectares',
      areaSqM: isHindi ? '६,२०० वर्ग मी.' : '6,200 m²',
      landClass: isHindi ? 'भूमिधर संक्रमणीय अधिकार' : 'Bhumidhar (Transferable Rights)',
      parcelStatus: 'LINKED_AND_VALIDATED',
    },
  ]

  const filteredRecords = sampleRecords.filter(
    (r) =>
      r.khasraNo.includes(searchTerm) ||
      r.khataNo.includes(searchTerm) ||
      r.ownerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.village.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header Banner */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-1.5 rounded-lg bg-emerald-100 text-emerald-700">
              <Database className="w-5 h-5" />
            </span>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">
              {t('records.title')}
            </h1>
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700">
              {t('records.roleBadge')}
            </span>
          </div>
          <p className="text-xs text-slate-500">
            {t('records.privacyNotice')}
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-semibold px-3 py-1.5 rounded-xl bg-slate-100 text-slate-700 border border-slate-200">
          <Lock className="w-3.5 h-3.5 text-slate-500" />
          <span>{t('records.secNotice')}</span>
        </div>
      </div>

      {/* Search Input Bar */}
      <div id="records-search-bar" className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-3">
        <Search className="w-5 h-5 text-slate-400 ml-2" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder={t('records.searchPlaceholder')}
          className="flex-1 bg-transparent text-sm text-slate-900 font-medium focus:outline-none placeholder:text-slate-400"
        />
        {searchTerm && (
          <button
            onClick={() => setSearchTerm('')}
            className="text-xs text-slate-400 hover:text-slate-600 px-2 py-1"
          >
            {t('records.clear')}
          </button>
        )}
      </div>

      {/* Records Cards List */}
      <div id="records-cards-list" className="space-y-4">
        {filteredRecords.map((rec) => (
          <div
            key={rec.id}
            className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs card-hover-glow relative overflow-hidden space-y-4"
          >
            <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-emerald-500/0 via-emerald-500/40 to-amber-500/0" />
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-800">
                  {rec.id}
                </span>
                <span className="text-sm font-bold text-slate-900">
                  {t('records.khasraLabel')}{' '}
                  <span className="text-amber-600 font-extrabold">{rec.khasraNo}</span>
                </span>
                <span className="text-xs text-slate-500 font-medium">· {t('records.khataLabel')} {rec.khataNo}</span>
                <span className="text-xs text-slate-500">· {rec.village}</span>
              </div>

              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>{t('records.linkedBadge')}</span>
                </span>
              </div>
            </div>

            {/* Grid Information */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
              <div>
                <span className="text-slate-400 font-semibold block mb-0.5">{t('records.thOwner')}</span>
                <span className="font-bold text-slate-900 text-sm">{rec.ownerName}</span>
                <span className="text-[11px] text-slate-500 block">{rec.fatherName}</span>
              </div>

              <div>
                <span className="text-slate-400 font-semibold block mb-0.5">{t('records.thIdentity')}</span>
                <span className="font-mono font-bold text-slate-700">{rec.maskedAadhaar}</span>
                <span className="text-[10px] text-emerald-600 block">{t('records.verifiedMasked')}</span>
              </div>

              <div>
                <span className="text-slate-400 font-semibold block mb-0.5">{t('records.thArea')}</span>
                <span className="font-extrabold text-slate-900 text-sm">{rec.areaOriginal}</span>
                <span className="text-[11px] text-slate-500 font-mono block">{t('records.geodesic')} {rec.areaSqM}</span>
              </div>

              <div>
                <span className="text-slate-400 font-semibold block mb-0.5">{t('records.thTenure')}</span>
                <span className="font-semibold text-slate-800">{rec.landClass}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

