import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
  Map as MapIcon,
  Layers,
  ChevronRight,
} from 'lucide-react'
import { OwnershipGraphModal } from '../components/OwnershipGraphModal'

interface ParcelData {
  khasraNo: string
  khataNo: string
  village: string
  owner: string
  areaDeed: string
  areaGeodesic: string
  areaDelta: string
  status: 'VALIDATED' | 'WARNING'
  color: string
}

export const CadastralMapPage: React.FC = () => {
  const { t, i18n } = useTranslation()
  const isHindi = i18n.language === 'hi'

  const parcels: ParcelData[] = [
    {
      khasraNo: '245/1',
      khataNo: '104',
      village: isHindi ? 'हसनपुर (०९०१०१०१)' : 'Hasanpur (09010101)',
      owner: isHindi ? 'रामेश्वर प्रसाद' : 'Rameshwar Prasad',
      areaDeed: isHindi ? '०.४१२ हे. (४,१२० वर्ग मी.)' : '0.412 Ha (4,120 m²)',
      areaGeodesic: isHindi ? '४,११५.८ वर्ग मी.' : '4,115.8 m²',
      areaDelta: isHindi ? '०.१०% (मान्य ≤ १०%)' : '0.10% (Passes Rule X002 ≤ 10%)',
      status: 'VALIDATED',
      color: '#10b981',
    },
    {
      khasraNo: '245/2',
      khataNo: '104',
      village: isHindi ? 'हसनपुर (०९०१०१०१)' : 'Hasanpur (09010101)',
      owner: isHindi ? 'सुरेश कुमार' : 'Suresh Kumar',
      areaDeed: isHindi ? '०.२०८ हे. (२,०८० वर्ग मी.)' : '0.208 Ha (2,080 m²)',
      areaGeodesic: isHindi ? '२,०७४.२ वर्ग मी.' : '2,074.2 m²',
      areaDelta: isHindi ? '०.२८% (मान्य ≤ १०%)' : '0.28% (Passes Rule X002 ≤ 10%)',
      status: 'VALIDATED',
      color: '#10b981',
    },
    {
      khasraNo: '246',
      khataNo: '105',
      village: isHindi ? 'हसनपुर (०९०१०१०१)' : 'Hasanpur (09010101)',
      owner: isHindi ? 'विजय प्रकाश' : 'Vijay Prakash',
      areaDeed: isHindi ? '०.५१० हे. (५,१०० वर्ग मी.)' : '0.510 Ha (5,100 m²)',
      areaGeodesic: isHindi ? '५,०८२.० वर्ग मी.' : '5,082.0 m²',
      areaDelta: isHindi ? '०.३५% (मान्य ≤ १०%)' : '0.35% (Passes Rule X002 ≤ 10%)',
      status: 'VALIDATED',
      color: '#10b981',
    },
    {
      khasraNo: '312',
      khataNo: '88',
      village: isHindi ? 'हसनपुर (०९०१०१०१)' : 'Hasanpur (09010101)',
      owner: isHindi ? 'कमला देवी' : 'Kamla Devi',
      areaDeed: isHindi ? '०.६२० हे. (६,२०० वर्ग मी.)' : '0.620 Ha (6,200 m²)',
      areaGeodesic: isHindi ? '५,४२०.० वर्ग मी.' : '5,420.0 m²',
      areaDelta: isHindi ? '१२.५८% (अमान्य > १०%)' : '12.58% (Flagged Rule X002 > 10%)',
      status: 'WARNING',
      color: '#f59e0b',
    },
  ]

  const [selectedParcel, setSelectedParcel] = useState<ParcelData | null>(parcels[0])
  const [isGraphModalOpen, setIsGraphModalOpen] = useState<boolean>(false)

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Top Banner with panel2.png Aerial GIS Backdrop */}
      <div className="relative rounded-3xl overflow-hidden border border-cyan-500/30 shadow-2xl bg-slate-950">
        {/* Background panel 2 image with dark gradient overlay */}
        <div className="absolute inset-0 z-0">
          <img
            src="/background/panel2.png"
            alt="Aerial Cadastral GIS Survey"
            className="w-full h-full object-cover object-center opacity-30 transform scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/85 to-slate-900/70" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-cyan-500/10 via-transparent to-transparent" />
        </div>

        {/* Ambient cyan glow orb */}
        <div className="light-orb-cyan -top-20 -right-20" />

        <div className="relative z-10 p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <span className="p-1.5 rounded-xl bg-cyan-500/20 text-cyan-300 border border-cyan-400/30 animate-cyan-pulse">
                <MapIcon className="w-5 h-5" />
              </span>
              <h1 className="text-xl font-bold text-white tracking-tight">
                {t('map.title')}
              </h1>
              <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-cyan-500/15 border border-cyan-400/30 text-cyan-300 font-mono">
                {t('map.villageBadge')}
              </span>
            </div>
            <p className="text-xs text-slate-300 max-w-2xl">
              {t('map.subtitle')}
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <span className="px-3 py-1.5 rounded-xl bg-slate-900/80 text-cyan-300 font-mono font-semibold border border-cyan-500/30 backdrop-blur-md">
              {t('map.epsg')}
            </span>
            <span className="px-3 py-1.5 rounded-xl bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-400/30 backdrop-blur-md flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              {t('map.summaryStatus')}
            </span>
          </div>
        </div>
      </div>

      {/* Map & Inspector Split Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Side: SVG / Canvas Cadastral Map Viewport (8 cols) */}
        <div id="cadastral-map-svg" className="lg:col-span-8 bg-slate-950 rounded-3xl p-6 border border-slate-800 shadow-2xl overflow-hidden relative min-h-[520px] flex flex-col justify-between">
          {/* Subtle GIS aerial watermark in background */}
          <div className="absolute inset-0 pointer-events-none opacity-10">
            <img
              src="/background/panel2.png"
              alt="Cadastral Overlay"
              className="w-full h-full object-cover"
            />
          </div>

          {/* Map Top Overlay */}
          <div className="flex items-center justify-between z-10">
            <div className="bg-slate-900/90 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-700 text-xs text-slate-300 flex items-center gap-2 shadow-lg">
              <Layers className="w-3.5 h-3.5 text-cyan-400" />
              <span>{isHindi ? 'ग्राम भूखण्ड स्तर: हसनपुर-उत्तर' : 'Village Parcel Layer: Hasanpur-North'}</span>
            </div>
            <div className="text-[11px] text-cyan-400 bg-slate-900/90 px-2.5 py-1 rounded-lg border border-cyan-500/30 font-mono flex items-center gap-1.5 shadow-lg">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
              <span>{isHindi ? 'अक्षांश: २६.८४६७° उ, देशांतर: ८०.९४६२° पू' : 'Lat: 26.8467° N, Lon: 80.9462° E'}</span>
            </div>
          </div>

          {/* Interactive Vector Parcel Diagram */}
          <div className="my-auto py-8 flex items-center justify-center">
            <svg
              viewBox="0 0 800 450"
              className="w-full max-w-2xl h-auto drop-shadow-2xl select-none"
            >
              {/* Background grid lines */}
              <defs>
                <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                  <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#1e293b" strokeWidth="0.5" />
                </pattern>
              </defs>
              <rect width="800" height="450" fill="url(#grid)" />

              {/* Road / Canal outline */}
              <path
                d="M 50 200 Q 250 260 500 180 T 750 220"
                fill="none"
                stroke="#475569"
                strokeWidth="12"
                strokeDasharray="4 2"
                opacity="0.5"
              />
              <text x="70" y="190" fill="#94a3b8" fontSize="10" fontWeight="bold">
                {t('map.pathway')}
              </text>

              {/* Parcel 245/1 */}
              <polygon
                points="120,80 320,60 300,220 110,210"
                fill={selectedParcel?.khasraNo === '245/1' ? '#10b981' : '#10b981'}
                fillOpacity={selectedParcel?.khasraNo === '245/1' ? '0.45' : '0.2'}
                stroke="#10b981"
                strokeWidth={selectedParcel?.khasraNo === '245/1' ? '3' : '1.5'}
                className="cursor-pointer transition-all hover:fill-opacity-50"
                onClick={() => setSelectedParcel(parcels[0])}
              />
              <text x="180" y="150" fill="#ffffff" fontSize="14" fontWeight="bold">
                {isHindi ? 'खसरा २४५/१' : 'Khasra 245/1'}
              </text>
              <text x="180" y="170" fill="#a7f3d0" fontSize="11">
                {isHindi ? '४,१२० वर्ग मी.' : '4,120 m²'}
              </text>

              {/* Parcel 245/2 */}
              <polygon
                points="320,60 480,50 460,210 300,220"
                fill={selectedParcel?.khasraNo === '245/2' ? '#10b981' : '#10b981'}
                fillOpacity={selectedParcel?.khasraNo === '245/2' ? '0.45' : '0.2'}
                stroke="#10b981"
                strokeWidth={selectedParcel?.khasraNo === '245/2' ? '3' : '1.5'}
                className="cursor-pointer transition-all hover:fill-opacity-50"
                onClick={() => setSelectedParcel(parcels[1])}
              />
              <text x="360" y="140" fill="#ffffff" fontSize="14" fontWeight="bold">
                {isHindi ? 'खसरा २४५/२' : 'Khasra 245/2'}
              </text>
              <text x="360" y="160" fill="#a7f3d0" fontSize="11">
                {isHindi ? '२,०८० वर्ग मी.' : '2,080 m²'}
              </text>

              {/* Parcel 246 */}
              <polygon
                points="480,50 680,70 660,230 460,210"
                fill={selectedParcel?.khasraNo === '246' ? '#10b981' : '#10b981'}
                fillOpacity={selectedParcel?.khasraNo === '246' ? '0.45' : '0.2'}
                stroke="#10b981"
                strokeWidth={selectedParcel?.khasraNo === '246' ? '3' : '1.5'}
                className="cursor-pointer transition-all hover:fill-opacity-50"
                onClick={() => setSelectedParcel(parcels[2])}
              />
              <text x="540" y="145" fill="#ffffff" fontSize="14" fontWeight="bold">
                {isHindi ? 'खसरा २४६' : 'Khasra 246'}
              </text>
              <text x="540" y="165" fill="#a7f3d0" fontSize="11">
                {isHindi ? '५,१०० वर्ग मी.' : '5,100 m²'}
              </text>

              {/* Parcel 312 (Warning - Area Mismatch) */}
              <polygon
                points="110,230 460,240 430,390 100,380"
                fill={selectedParcel?.khasraNo === '312' ? '#f59e0b' : '#f59e0b'}
                fillOpacity={selectedParcel?.khasraNo === '312' ? '0.45' : '0.2'}
                stroke="#f59e0b"
                strokeWidth={selectedParcel?.khasraNo === '312' ? '3' : '1.5'}
                className="cursor-pointer transition-all hover:fill-opacity-50"
                onClick={() => setSelectedParcel(parcels[3])}
              />
              <text x="240" y="310" fill="#ffffff" fontSize="14" fontWeight="bold">
                {isHindi ? 'खसरा ३१२ ⚠️' : 'Khasra 312 ⚠️'}
              </text>
              <text x="240" y="330" fill="#fde68a" fontSize="11">
                {isHindi ? 'क्षेत्रफल अंतर > १०%' : 'Area Delta > 10%'}
              </text>
            </svg>
          </div>

          {/* Map Footer Controls */}
          <div className="flex items-center justify-between text-xs text-slate-400 z-10 border-t border-slate-800 pt-3">
            <span>{isHindi ? '💡 खतौनी एवं क्षेत्रफल सत्यापन हेतु किसी भी पार्सल पर क्लिक करें।' : '💡 Click any parcel boundary to inspect linked Khatauni record and area comparison.'}</span>
            <span className="font-mono text-emerald-400 text-[11px]">{isHindi ? 'भू-स्थानिक परत सक्रिय' : 'GeoJSON Layer Active'}</span>
          </div>
        </div>

        {/* Right Side: Linked Record Details Panel (4 cols) */}
        <div id="parcel-inspector-card" className="lg:col-span-4 bg-white rounded-3xl p-6 border border-slate-200 shadow-xl space-y-5">
          {selectedParcel ? (
            <>
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div>
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                    {isHindi ? 'चयनित भूखण्ड' : 'Selected Parcel'}
                  </span>
                  <h3 className="text-xl font-extrabold text-slate-900 mt-0.5">
                    {isHindi ? `खसरा ${selectedParcel.khasraNo}` : `Khasra ${selectedParcel.khasraNo}`}
                  </h3>
                </div>
                <span
                  className={`text-[10px] font-bold px-2.5 py-1 rounded-full border ${
                    selectedParcel.status === 'VALIDATED'
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      : 'bg-amber-50 text-amber-700 border-amber-200'
                  }`}
                >
                  {selectedParcel.status === 'VALIDATED'
                    ? (isHindi ? '✓ सत्यापित मिलान' : '✓ Verified Match')
                    : (isHindi ? '⚠️ क्षेत्रफल चेतावनी' : '⚠️ Area Warning')}
                </span>
              </div>

              {/* Record Summary */}
              <div className="space-y-3 text-xs">
                <div>
                  <span className="text-slate-400 font-semibold block">{t('map.owner')}</span>
                  <span className="text-sm font-bold text-slate-900">{selectedParcel.owner}</span>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <span className="text-slate-400 font-semibold block">{isHindi ? 'खाता संख्या' : 'Khata Number'}</span>
                    <span className="font-mono font-bold text-slate-800">{selectedParcel.khataNo}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 font-semibold block">{isHindi ? 'ग्राम' : 'Village'}</span>
                    <span className="font-semibold text-slate-800 truncate block">{selectedParcel.village}</span>
                  </div>
                </div>

                {/* Area Comparison Box */}
                <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 space-y-2">
                  <div className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                    {isHindi ? 'अंतर-सत्यापन (नियम X002)' : 'Cross-Validation (Rule X002)'}
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500">{isHindi ? 'अभिलेखीय क्षेत्रफल:' : 'Textual Record Area:'}</span>
                    <span className="font-bold text-slate-900">{selectedParcel.areaDeed}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500">{isHindi ? 'स्थानिक नक्शा क्षेत्रफल:' : 'GIS Polygon Geodesic:'}</span>
                    <span className="font-mono font-bold text-slate-900">{selectedParcel.areaGeodesic}</span>
                  </div>
                  <div className="flex justify-between items-center pt-1 border-t border-slate-200 text-[11px]">
                    <span className="text-slate-500">{isHindi ? 'क्षेत्रफल अंतर:' : 'Area Discrepancy:'}</span>
                    <span
                      className={`font-bold ${
                        selectedParcel.status === 'VALIDATED' ? 'text-emerald-600' : 'text-amber-600'
                      }`}
                    >
                      {selectedParcel.areaDelta}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 space-y-2">
                <button
                  type="button"
                  id="open-lineage-graph-btn"
                  onClick={() => setIsGraphModalOpen(true)}
                  className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-md shadow-indigo-600/20 transition-all flex items-center justify-center gap-1.5 cursor-pointer active:scale-98"
                >
                  <span>{isHindi ? 'स्वामित्व वंशावली आरेख देखें' : 'Open Ownership Lineage Graph'}</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </>
          ) : (
            <div className="text-center py-16 text-slate-400 text-xs">
              {isHindi ? 'खतौनी अभिलेख देखने हेतु नक्शे में किसी पार्सल का चयन करें।' : 'Select a parcel from the map to inspect its linked land record.'}
            </div>
          )}
        </div>
      </div>

      {/* Ownership Lineage Graph Interactive Modal */}
      <OwnershipGraphModal
        isOpen={isGraphModalOpen}
        onClose={() => setIsGraphModalOpen(false)}
        parcel={selectedParcel}
        isHindi={isHindi}
      />
    </div>
  )
}
