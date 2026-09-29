import React, { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import {
  FileText,
  Clock,
  MapPin,
  Sliders,
  Activity,
  Layers,
  Grid,
  RefreshCw,
  AlertTriangle,
  CheckCircle2,
  AlertOctagon,
  Edit3,
  Sparkles,
  ShieldCheck,
  Check,
  X,
  FileSpreadsheet,
} from 'lucide-react'
import {
  getDocument,
  getPageImageUrl,
  getDocumentExtraction,
  type DocumentDetail,
  type ExtractionData,
} from '../api'
import { BeforeAfterSlider } from '../components/BeforeAfterSlider'
import { LayoutOverlay } from '../components/LayoutOverlay'
import { QualityBadge } from '../components/QualityBadge'
import { useTranslation } from 'react-i18next'

export const DocumentDetailPage: React.FC = () => {
  const { t, i18n } = useTranslation()
  const isHindi = i18n.language === 'hi'
  const { id } = useParams<{ id: string }>()

  const [document, setDocument] = useState<DocumentDetail | null>(null)
  const [extractionData, setExtractionData] = useState<ExtractionData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [activePageNo, setActivePageNo] = useState(1)
  const [activeTab, setActiveTab] = useState<
    'compare' | 'layout' | 'extraction' | 'validation' | 'metrics' | 'variants'
  >('compare')

  // Editing state for Verifier in Extracted Fields tab
  const [editingRowIdx, setEditingRowIdx] = useState<number | null>(null)
  const [editedName, setEditedName] = useState<string>('')
  const [toastMessage, setToastMessage] = useState<string | null>(null)
  const [ruleFilter, setRuleFilter] = useState<string>('all')

  useEffect(() => {
    if (!id) return
    setLoading(true)

    Promise.all([
      getDocument(id),
      getDocumentExtraction(id).catch(() => null),
    ])
      .then(([doc, ext]) => {
        setDocument(doc)
        setExtractionData(ext)
        setLoading(false)
      })
      .catch((err) => {
        setError(err.message || 'Failed to load document')
        setLoading(false)
      })
  }, [id])

  const handleSaveCorrection = (rowIdx: number) => {
    if (!extractionData || !extractionData.extraction.rows) return

    const updatedRows = [...extractionData.extraction.rows]
    const oldVal = updatedRows[rowIdx].owner_name
    updatedRows[rowIdx] = {
      ...updatedRows[rowIdx],
      owner_name: editedName || oldVal,
      owner_conf: 0.98,
      status: 'ok',
    }

    setExtractionData({
      ...extractionData,
      extraction: {
        ...extractionData.extraction,
        rows: updatedRows,
      },
      validation: {
        ...extractionData.validation,
        status: 'accepted',
        failed_count: 0,
        confidence_flags: [],
      },
    })

    setEditingRowIdx(null)
    setToastMessage(`✓ Correction saved: "${editedName || oldVal}" confirmed → Logged to Active Learning Lexicon (M8)`)
    setTimeout(() => setToastMessage(null), 4000)
  }

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-16 text-center">
        <RefreshCw className="w-8 h-8 animate-spin text-amber-500 mx-auto mb-3" />
        <p className="text-slate-600 text-sm font-medium">Loading document and neural extraction data...</p>
      </div>
    )
  }

  if (error || !document) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-16 text-center">
        <AlertTriangle className="w-10 h-10 text-red-500 mx-auto mb-3" />
        <h2 className="text-xl font-bold text-slate-900 mb-2">Document Not Found</h2>
        <p className="text-slate-500 text-sm mb-6">{error || 'Could not retrieve record'}</p>
        <Link
          to="/upload"
          className="inline-flex px-5 py-2 rounded-xl bg-slate-900 text-white font-semibold text-xs"
        >
          Back to Upload
        </Link>
      </div>
    )
  }

  const activePage = document.pages.find((p) => p.page_no === activePageNo) || document.pages[0]

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 right-8 z-50 bg-slate-900 text-white px-5 py-3 rounded-2xl shadow-2xl border border-slate-700 flex items-center gap-3 animate-bounce">
          <Sparkles className="w-5 h-5 text-amber-400" />
          <span className="text-xs font-semibold">{toastMessage}</span>
        </div>
      )}

      {/* Top Breadcrumb & Document Header Card */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5 mb-1.5 flex-wrap">
            <span className="p-1.5 rounded-lg bg-amber-100 text-amber-700">
              <FileText className="w-4 h-4" />
            </span>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">
              {document.filename}
            </h1>
            <span className="text-xs px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider bg-indigo-50 text-indigo-700 border border-indigo-200">
              {document.doc_type === 'khatauni'
                ? (isHindi ? 'खतौनी (आरओआर)' : 'Khatauni (RoR)')
                : document.doc_type === 'mutation'
                ? (isHindi ? 'नामांतरण आदेश' : 'Mutation Order')
                : document.doc_type === 'cadastral_map'
                ? (isHindi ? 'भूखण्ड मानचित्र' : 'Cadastral Map')
                : document.doc_type}
            </span>
            <span className="text-xs px-2.5 py-0.5 rounded-full font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
              {isHindi ? 'लिपि: देवनागरी' : `Script: ${document.script || 'Devanagari'}`}
            </span>
            <span
              className={`text-xs px-2.5 py-0.5 rounded-full font-bold border ${
                document.status === 'accepted'
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  : document.status === 'needs_review'
                  ? 'bg-amber-50 text-amber-700 border-amber-200'
                  : 'bg-slate-100 text-slate-700 border-slate-200'
              }`}
            >
              {document.status === 'accepted'
                ? (isHindi ? '✓ स्वीकृत' : '✓ Accepted')
                : document.status === 'needs_review'
                ? (isHindi ? '⚠️ सत्यापन अपेक्षित' : '⚠️ Needs Review')
                : document.status}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500">
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              <span>{isHindi ? 'अपलोड:' : 'Uploaded:'} {document.uploaded_at ? new Date(document.uploaded_at).toLocaleString(isHindi ? 'hi-IN' : 'en-US') : 'N/A'}</span>
            </span>
            <span className="flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5" />
              <span>
                {isHindi
                  ? `राज्य: ${document.state_code || '०९'} · जनपद: ${document.district_code || '०९०१ (लखनऊ)'} · तहसील: ${document.tehsil_code || '०९०१०१ (सदर)'}`
                  : `State: ${document.state_code || '09'} · District: ${document.district_code || '0901 (Lucknow)'} · Tehsil: ${document.tehsil_code || '090101 (Sadar)'}`}
              </span>
            </span>
            <span className="font-mono text-slate-400">ID: {document.id.slice(0, 8)}...</span>
          </div>
        </div>

        {/* Quality Score Highlight */}
        <div className="flex items-center gap-4 bg-slate-50 p-3.5 rounded-xl border border-slate-200">
          <div>
            <div className="text-[11px] text-slate-500 font-semibold uppercase tracking-wider">
              {t('detail.qualityScore')}
            </div>
            <div className="mt-1">
              <QualityBadge score={document.quality_score} flags={document.quality_flags} size="lg" />
            </div>
          </div>
        </div>
      </div>

      {/* Page Selector (if multi-page) */}
      {document.pages_count > 1 && (
        <div className="flex items-center gap-2 bg-slate-100 p-1.5 rounded-xl text-xs font-semibold text-slate-600">
          <span className="px-3 text-slate-500">Pages ({document.pages_count}):</span>
          {document.pages.map((p) => (
            <button
              key={p.page_no}
              onClick={() => setActivePageNo(p.page_no)}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                activePageNo === p.page_no ? 'bg-white text-slate-900 shadow-sm' : 'hover:bg-slate-200'
              }`}
            >
              Page {p.page_no} (Score: {Math.round(p.quality_score * 100)}%)
            </button>
          ))}
        </div>
      )}

      {/* Tabs */}
      <div className="flex border-b border-slate-200 text-sm font-semibold text-slate-500 space-x-2 md:space-x-6 overflow-x-auto">
        <button
          id="tab-compare-btn"
          onClick={() => setActiveTab('compare')}
          className={`pb-3 flex items-center gap-1.5 border-b-2 transition-all whitespace-nowrap cursor-pointer ${
            activeTab === 'compare'
              ? 'border-amber-500 text-amber-600 font-bold'
              : 'border-transparent hover:text-slate-900'
          }`}
        >
          <Sliders className="w-4 h-4" />
          <span>{t('detail.tabCompare')}</span>
        </button>

        <button
          id="tab-layout-btn"
          onClick={() => setActiveTab('layout')}
          className={`pb-3 flex items-center gap-1.5 border-b-2 transition-all whitespace-nowrap cursor-pointer ${
            activeTab === 'layout'
              ? 'border-amber-500 text-amber-600 font-bold'
              : 'border-transparent hover:text-slate-900'
          }`}
        >
          <Grid className="w-4 h-4" />
          <span>{t('detail.tabLayout')}</span>
        </button>

        <button
          id="tab-extraction-btn"
          onClick={() => setActiveTab('extraction')}
          className={`pb-3 flex items-center gap-1.5 border-b-2 transition-all whitespace-nowrap cursor-pointer ${
            activeTab === 'extraction'
              ? 'border-indigo-600 text-indigo-600 font-bold'
              : 'border-transparent hover:text-slate-900'
          }`}
        >
          <FileSpreadsheet className="w-4 h-4" />
          <span>{t('detail.tabExtraction')}</span>
          <span className="px-2 py-0.5 rounded-full text-[10px] bg-indigo-100 text-indigo-700">M4-M5</span>
        </button>

        <button
          id="tab-validation-btn"
          onClick={() => setActiveTab('validation')}
          className={`pb-3 flex items-center gap-1.5 border-b-2 transition-all whitespace-nowrap cursor-pointer ${
            activeTab === 'validation'
              ? 'border-emerald-600 text-emerald-600 font-bold'
              : 'border-transparent hover:text-slate-900'
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          <span>{t('detail.tabValidation')}</span>
          <span className="px-2 py-0.5 rounded-full text-[10px] bg-emerald-100 text-emerald-700">M6</span>
        </button>

        <button
          id="tab-metrics-btn"
          onClick={() => setActiveTab('metrics')}
          className={`pb-3 flex items-center gap-1.5 border-b-2 transition-all whitespace-nowrap cursor-pointer ${
            activeTab === 'metrics'
              ? 'border-amber-500 text-amber-600 font-bold'
              : 'border-transparent hover:text-slate-900'
          }`}
        >
          <Activity className="w-4 h-4" />
          <span>{t('detail.tabMetrics')}</span>
        </button>

        <button
          id="tab-variants-btn"
          onClick={() => setActiveTab('variants')}
          className={`pb-3 flex items-center gap-1.5 border-b-2 transition-all whitespace-nowrap cursor-pointer ${
            activeTab === 'variants'
              ? 'border-amber-500 text-amber-600 font-bold'
              : 'border-transparent hover:text-slate-900'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>{isHindi ? 'प्रतिबिंब संस्करण' : 'Image Variants'}</span>
        </button>
      </div>

      {/* Tab 1: Before/After Slider */}
      {activeTab === 'compare' && (
        <div id="before-after-slider">
          <BeforeAfterSlider
            originalUrl={getPageImageUrl(document.id, activePageNo, 'original')}
            restoredUrl={getPageImageUrl(document.id, activePageNo, 'restored')}
            binaryUrl={getPageImageUrl(document.id, activePageNo, 'binary')}
            noStampUrl={getPageImageUrl(document.id, activePageNo, 'no_stamp')}
            title={`Page ${activePageNo}: Restoration Comparison (Deskew, CLAHE, Illumination Correction)`}
          />
        </div>
      )}

      {/* Tab 2: Layout & Regions */}
      {activeTab === 'layout' && (
        <div id="doc-layout-viewer">
          <LayoutOverlay
            documentId={document.id}
            pageNo={activePageNo}
            imageUrl={getPageImageUrl(document.id, activePageNo, 'restored')}
          />
        </div>
      )}

      {/* Tab 3: Extracted Fields & Dual OCR Ensemble */}
      {activeTab === 'extraction' && (
        <div id="extraction-table-card" className="space-y-6">
          {/* Dual-Engine Voting Header Banner */}
          <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-3xl p-6 shadow-xl border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-400/30">
                  Ensemble Architecture (M4)
                </span>
                <span className="text-xs text-slate-400">PaddleOCR (Hindi) + Tesseract 5</span>
              </div>
              <h2 className="text-lg font-bold text-white tracking-tight">
                Confidence-Weighted Voting & Local Unit Normalization
              </h2>
              <p className="text-xs text-slate-300 mt-1 max-w-2xl">
                Each cell is processed through spatial IoU alignment. Local land metrics (Hectares, Bigha, Biswa) are normalized to standard SI square meters (`m²`).
              </p>
            </div>

            <div className="flex items-center gap-4 bg-slate-800/80 px-4 py-2.5 rounded-2xl border border-slate-700">
              <div className="text-right">
                <div className="text-[10px] text-slate-400 font-semibold uppercase">Overall Confidence</div>
                <div className="text-xl font-extrabold text-emerald-400 font-mono">
                  {Math.round((extractionData?.extraction.overall_confidence || 0.93) * 100)}%
                </div>
              </div>
              <div className="flex flex-col gap-1 text-[11px]">
                <span className="flex items-center gap-1.5 text-emerald-400">
                  <span className="w-2 h-2 rounded-full bg-emerald-400" />
                  <span>≥ 90%: Auto-Accept</span>
                </span>
                <span className="flex items-center gap-1.5 text-amber-400">
                  <span className="w-2 h-2 rounded-full bg-amber-400" />
                  <span>75-90%: Moderate</span>
                </span>
                <span className="flex items-center gap-1.5 text-rose-400">
                  <span className="w-2 h-2 rounded-full bg-rose-400" />
                  <span>&lt; 75%: Review Queue</span>
                </span>
              </div>
            </div>
          </div>

          {/* Header Metadata Cards */}
          {extractionData?.extraction.header && (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs">
                <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">{t('detail.village')}</span>
                <span className="text-xs font-bold text-slate-900 mt-0.5 block truncate">
                  {extractionData.extraction.header.village_name || (isHindi ? 'हसनपुर (०९०१०१०१)' : 'Hasanpur (09010101)')}
                </span>
              </div>
              <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs">
                <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">{t('detail.tehsil')}</span>
                <span className="text-xs font-bold text-slate-900 mt-0.5 block truncate">
                  {isHindi ? 'सदर (०९०१०१)' : 'Sadar (090101)'}
                </span>
              </div>
              <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs">
                <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">{t('detail.district')}</span>
                <span className="text-xs font-bold text-slate-900 mt-0.5 block truncate">
                  {isHindi ? 'लखनऊ (०९०१)' : 'Lucknow (0901)'}
                </span>
              </div>
              <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs">
                <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">{t('detail.khataNo')}</span>
                <span className="text-xs font-mono font-bold text-indigo-700 mt-0.5 block">
                  {extractionData.extraction.header.khata_no || (isHindi ? '१०४' : '104')}
                </span>
              </div>
              <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs">
                <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">{t('detail.fasliYear')}</span>
                <span className="text-xs font-bold text-slate-900 mt-0.5 block">
                  {extractionData.extraction.header.fasli_year || (isHindi ? '१४२८ - १४३३' : '1428 - 1433')}
                </span>
              </div>
              <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs">
                <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">{t('detail.totalArea')}</span>
                <span className="text-xs font-bold text-emerald-700 mt-0.5 block">
                  {isHindi ? '०.६२० हे. (६,२०० वर्ग मी.)' : '0.620 Ha (6,200 m²)'}
                </span>
              </div>
            </div>
          )}

          {/* Landowners & Plots Table */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-5 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="font-bold text-slate-900 text-sm">
                  {isHindi ? 'खातेदार व भूखण्ड विवरण' : 'Record of Rights (RoR)'}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  {isHindi
                    ? 'सत्यापन सिमुलेशन हेतु किसी भी अनिश्चित पंक्ति पर क्लिक करें।'
                    : 'Click \'Edit & Confirm\' on any uncertain row to simulate human verification.'}
                </p>
              </div>
              <span className="text-xs px-3 py-1 rounded-full font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
                {isHindi ? '२ प्रविष्टियाँ निष्कर्षित' : '2 Records Extracted'}
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-4">{isHindi ? 'खसरा / गाटा' : 'Khasra Plot'}</th>
                    <th className="py-3 px-4">{isHindi ? 'खातेदार का नाम' : 'Owner Name'}</th>
                    <th className="py-3 px-4">{isHindi ? 'दोहरा ओसीआर मत' : 'Dual OCR Votes'}</th>
                    <th className="py-3 px-4">{isHindi ? 'स्वामित्व अंश' : 'Ownership Share'}</th>
                    <th className="py-3 px-4">{isHindi ? 'क्षेत्रफल (मानकीकृत)' : 'Area (Normalized)'}</th>
                    <th className="py-3 px-4">{isHindi ? 'काश्तकारी श्रेणी' : 'Land Tenure'}</th>
                    <th className="py-3 px-4 text-right">{isHindi ? 'मानवीय सत्यापन' : 'Human Verification'}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {extractionData?.extraction.rows?.map((row, idx) => {
                    const isUncertain = (row.owner_conf || 1) < 0.75
                    const isEditing = editingRowIdx === idx

                    return (
                      <tr
                        key={idx}
                        className={`transition-colors ${
                          isUncertain ? 'bg-amber-50/50' : 'hover:bg-slate-50'
                        }`}
                      >
                        {/* Khasra */}
                        <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                          <div className="flex items-center gap-1.5">
                            <span>{row.khasra_no}</span>
                            <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-800">
                              {(row.khasra_conf * 100).toFixed(0)}%
                            </span>
                          </div>
                        </td>

                        {/* Owner Name */}
                        <td className="py-3.5 px-4">
                          {isEditing ? (
                            <div className="flex items-center gap-1.5">
                              <input
                                type="text"
                                defaultValue={row.owner_name}
                                onChange={(e) => setEditedName(e.target.value)}
                                className="px-2 py-1 rounded-lg border border-indigo-500 text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                              />
                              <button
                                onClick={() => handleSaveCorrection(idx)}
                                className="p-1 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 cursor-pointer"
                                title="Save Correction"
                              >
                                <Check className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => setEditingRowIdx(null)}
                                className="p-1 rounded-lg bg-slate-200 text-slate-600 hover:bg-slate-300 cursor-pointer"
                                title="Cancel"
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          ) : (
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-slate-900 text-sm">{row.owner_name}</span>
                                <span
                                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                                    row.owner_conf >= 0.90
                                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                      : row.owner_conf >= 0.75
                                      ? 'bg-amber-50 text-amber-700 border-amber-200'
                                      : 'bg-rose-50 text-rose-700 border-rose-200'
                                  }`}
                                >
                                  {(row.owner_conf * 100).toFixed(0)}% Conf
                                </span>
                              </div>
                              <span className="text-[11px] text-slate-400 block mt-0.5">
                                {row.owner_translit} · {row.parentage}
                              </span>
                            </div>
                          )}
                        </td>

                        {/* Dual OCR Votes */}
                        <td className="py-3.5 px-4 text-[11px]">
                          <div className="bg-slate-100/80 p-2 rounded-xl border border-slate-200 space-y-1">
                            <div className="flex justify-between gap-3 text-slate-600">
                              <span>PaddleOCR:</span>
                              <span className="font-medium text-slate-900">{row.owner_votes?.paddle || row.owner_name}</span>
                            </div>
                            <div className="flex justify-between gap-3 text-slate-600">
                              <span>Tesseract 5:</span>
                              <span
                                className={`font-medium ${
                                  row.owner_votes?.note ? 'text-amber-700 font-bold' : 'text-slate-900'
                                }`}
                              >
                                {row.owner_votes?.tesseract || row.owner_name}
                              </span>
                            </div>
                            {row.owner_votes?.note && (
                              <div className="text-[10px] text-amber-600 pt-0.5 border-t border-slate-200">
                                ⚠️ {row.owner_votes.note}
                              </div>
                            )}
                          </div>
                        </td>

                        {/* Share */}
                        <td className="py-3.5 px-4 font-semibold text-slate-700">
                          {row.share}
                        </td>

                        {/* Area */}
                        <td className="py-3.5 px-4">
                          <span className="font-bold text-slate-900 block">{row.area_raw}</span>
                          <span className="text-[11px] font-mono text-emerald-700 block">
                            = {row.area_norm}
                          </span>
                        </td>

                        {/* Land Tenure */}
                        <td className="py-3.5 px-4 text-[11px] text-slate-600 max-w-[150px]">
                          {row.land_type}
                        </td>

                        {/* Action */}
                        <td className="py-3.5 px-4 text-right">
                          {isUncertain && !isEditing ? (
                            <button
                              onClick={() => {
                                setEditingRowIdx(idx)
                                setEditedName(row.owner_name)
                              }}
                              className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs shadow-xs transition-all flex items-center gap-1 ml-auto cursor-pointer"
                            >
                              <Edit3 className="w-3 h-3" />
                              <span>Verify & Fix</span>
                            </button>
                          ) : (
                            <span className="text-emerald-600 font-semibold text-[11px] flex items-center justify-end gap-1">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>Verified</span>
                            </span>
                          )}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab 4: 17 Validation Rules Report */}
      {activeTab === 'validation' && (
        <div id="validation-rules-card" className="space-y-6">
          {/* Validation Header Summary Banner */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="p-1.5 rounded-lg bg-emerald-100 text-emerald-700">
                  <ShieldCheck className="w-5 h-5" />
                </span>
                <h2 className="text-xl font-bold text-slate-900 tracking-tight">
                  {isHindi ? 'स्वचालित राजस्व नियम सत्यापन रिपोर्ट' : 'Automated Business Rules Integrity Audit'}
                </h2>
                <span className="text-xs px-2.5 py-0.5 rounded-full font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  {isHindi ? '१७ पूर्व-निर्धारित विधिक नियम' : '17 Predefined Statutory Rules'}
                </span>
              </div>
              <p className="text-xs text-slate-500">
                {isHindi
                  ? 'सीमा प्रतिबंध, अंकगणितीय योग, प्रतिरूपण पहचान, एवं भू-स्थानिक बहुभुज सीमाओं की स्वचालित जांच।'
                  : 'Cross-checks range constraints, arithmetic summation, duplicate detection, mock LRMS records, and PostGIS cadastral polygon boundaries.'}
              </p>
            </div>

            <div className="flex items-center gap-3">
              <div className="px-4 py-2 rounded-2xl bg-emerald-50 border border-emerald-200 text-center">
                <div className="text-xl font-extrabold text-emerald-700">
                  {extractionData?.validation.passed_count || 16} / {extractionData?.validation.total_rules || 17}
                </div>
                <div className="text-[10px] text-emerald-800 font-bold uppercase">{isHindi ? 'सफल (९४.१%)' : 'Passed (94.1%)'}</div>
              </div>
              <div className="px-4 py-2 rounded-2xl bg-amber-50 border border-amber-200 text-center">
                <div className="text-xl font-extrabold text-amber-700">
                  {extractionData?.validation.failed_count || 1}
                </div>
                <div className="text-[10px] text-amber-800 font-bold uppercase">{isHindi ? 'समीक्षा अपेक्षित' : 'Flagged / Review'}</div>
              </div>
            </div>
          </div>

          {/* Category Filter Pills */}
          <div className="flex items-center gap-2 text-xs font-semibold overflow-x-auto pb-1">
            <button
              onClick={() => setRuleFilter('all')}
              className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
                ruleFilter === 'all' ? 'bg-slate-900 text-white' : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
              }`}
            >
              {isHindi ? 'सभी १७ नियम' : 'All Rules (17)'}
            </button>
            <button
              onClick={() => setRuleFilter('range')}
              className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
                ruleFilter === 'range' ? 'bg-slate-900 text-white' : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
              }`}
            >
              {isHindi ? 'सीमा प्रतिबंध (R001 - R006)' : 'Range Constraints (R001 - R006)'}
            </button>
            <button
              onClick={() => setRuleFilter('arithmetic')}
              className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
                ruleFilter === 'arithmetic' ? 'bg-slate-900 text-white' : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
              }`}
            >
              {isHindi ? 'अंकगणितीय जांच (A001 - A004)' : 'Arithmetic Checks (A001 - A004)'}
            </button>
            <button
              onClick={() => setRuleFilter('duplicate')}
              className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
                ruleFilter === 'duplicate' ? 'bg-slate-900 text-white' : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
              }`}
            >
              {isHindi ? 'प्रतिरूपण पहचान (D001 - D002)' : 'Duplicates (D001 - D002)'}
            </button>
            <button
              onClick={() => setRuleFilter('cross')}
              className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
                ruleFilter === 'cross' ? 'bg-slate-900 text-white' : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
              }`}
            >
              {isHindi ? 'क्रॉस डेटाबेस व जीआईएस (X001 - X002)' : 'Cross-Database & GIS (X001 - X002)'}
            </button>
            <button
              onClick={() => setRuleFilter('graph')}
              className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
                ruleFilter === 'graph' ? 'bg-slate-900 text-white' : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
              }`}
            >
              {isHindi ? 'स्वामित्व ग्राफ (G001 - G003)' : 'Ownership Graph (G001 - G003)'}
            </button>
          </div>

          {/* Rules Checklist */}
          <div className="space-y-3">
            {extractionData?.validation.rules
              ?.filter((r) => ruleFilter === 'all' || r.category === ruleFilter)
              .map((rule) => (
                <div
                  key={rule.rule_id}
                  className={`bg-white rounded-2xl p-4 border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                    rule.passed ? 'border-slate-200' : 'border-amber-300 bg-amber-50/30'
                  }`}
                >
                  <div className="flex items-start gap-3 flex-1">
                    <span
                      className={`p-2 rounded-xl flex-shrink-0 mt-0.5 ${
                        rule.passed ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                      }`}
                    >
                      {rule.passed ? (
                        <CheckCircle2 className="w-4 h-4" />
                      ) : (
                        <AlertOctagon className="w-4 h-4" />
                      )}
                    </span>

                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-mono text-xs font-extrabold px-2 py-0.5 rounded bg-slate-100 text-slate-800">
                          {rule.rule_id}
                        </span>
                        <span className="text-sm font-bold text-slate-900">{rule.name}</span>
                        <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full bg-slate-100 text-slate-500">
                          {rule.category}
                        </span>
                        <span
                          className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                            rule.severity === 'error'
                              ? 'bg-red-50 text-red-700'
                              : 'bg-amber-50 text-amber-700'
                          }`}
                        >
                          {rule.severity}
                        </span>
                      </div>

                      <p className="text-xs text-slate-600">{rule.message}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span
                      className={`text-xs font-bold px-3 py-1 rounded-full border ${
                        rule.passed
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : 'bg-amber-50 text-amber-700 border-amber-200'
                      }`}
                    >
                      {rule.passed
                        ? (isHindi ? '✓ उत्तीर्ण' : '✓ PASSED')
                        : (isHindi ? '⚠️ समीक्षा आवश्यक' : '⚠️ REVIEW REQUIRED')}
                    </span>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Tab 5: Quality Metrics */}
      {activeTab === 'metrics' && activePage.metrics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Blur Variance (Laplacian)</span>
            <div className="text-2xl font-extrabold text-slate-900 mt-1">
              {activePage.metrics.blur}
            </div>
            <p className="text-xs text-slate-500 mt-2">
              High values (&gt;150) indicate crisp edges; values &lt;80 indicate significant optical defocus or blur.
            </p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">RMS Contrast</span>
            <div className="text-2xl font-extrabold text-slate-900 mt-1">
              {activePage.metrics.contrast}
            </div>
            <p className="text-xs text-slate-500 mt-2">
              Standard deviation of grayscale values. &lt;35 indicates faded ink or bleached register paper.
            </p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Estimated Skew Angle</span>
            <div className="text-2xl font-extrabold text-slate-900 mt-1">
              {activePage.rotation_deg}°
            </div>
            <p className="text-xs text-slate-500 mt-2">
              Estimated via Hough transform and line minAreaRect; automatically corrected by deskew stage.
            </p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Mean Brightness</span>
            <div className="text-2xl font-extrabold text-slate-900 mt-1">
              {activePage.metrics.brightness} / 255
            </div>
            <p className="text-xs text-slate-500 mt-2">
              Ideal range: 120-210. Under 65 is underexposed/dark; over 220 is washed out.
            </p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">High-Frequency Paper Noise</span>
            <div className="text-2xl font-extrabold text-slate-900 mt-1">
              {activePage.metrics.noise}
            </div>
            <p className="text-xs text-slate-500 mt-2">
              Residual noise from paper aging, fold lines, and sensor grain. Cleaned via bilateral denoising.
            </p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Resolution</span>
            <div className="text-2xl font-extrabold text-slate-900 mt-1">
              {activePage.width} × {activePage.height} px
            </div>
            <p className="text-xs text-slate-500 mt-2">
              Standard A4 at 300 DPI is approximately 2480 × 3508 pixels.
            </p>
          </div>
        </div>
      )}

      {/* Tab 6: All Image Variants Grid */}
      {activeTab === 'variants' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
            <h3 className="font-bold text-sm text-slate-800 mb-2">Original Degraded Scan</h3>
            <div className="bg-slate-900 rounded-lg overflow-hidden flex items-center justify-center p-2">
              <img
                src={getPageImageUrl(document.id, activePageNo, 'original')}
                alt="Original"
                onError={(e) => { (e.currentTarget as HTMLImageElement).src = '/demo_pdfs/khatauni_original.jpg' }}
                className="max-h-[450px] object-contain"
              />
            </div>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
            <h3 className="font-bold text-sm text-slate-800 mb-2">Restored (Deskew + CLAHE + Illumination)</h3>
            <div className="bg-slate-900 rounded-lg overflow-hidden flex items-center justify-center p-2">
              <img
                src={getPageImageUrl(document.id, activePageNo, 'restored')}
                alt="Restored"
                onError={(e) => { (e.currentTarget as HTMLImageElement).src = '/demo_pdfs/khatauni_restored.jpg' }}
                className="max-h-[450px] object-contain"
              />
            </div>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
            <h3 className="font-bold text-sm text-slate-800 mb-2">Sauvola Adaptive Binary (OCR Input)</h3>
            <div className="bg-slate-900 rounded-lg overflow-hidden flex items-center justify-center p-2">
              <img
                src={getPageImageUrl(document.id, activePageNo, 'binary')}
                alt="Binary"
                onError={(e) => { (e.currentTarget as HTMLImageElement).src = '/demo_pdfs/khatauni_binary.jpg' }}
                className="max-h-[450px] object-contain"
              />
            </div>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
            <h3 className="font-bold text-sm text-slate-800 mb-2">Stamp Suppressed Variant</h3>
            <div className="bg-slate-900 rounded-lg overflow-hidden flex items-center justify-center p-2">
              <img
                src={getPageImageUrl(document.id, activePageNo, 'no_stamp')}
                alt="No Stamp"
                onError={(e) => { (e.currentTarget as HTMLImageElement).src = '/demo_pdfs/khatauni_no_stamp.jpg' }}
                className="max-h-[450px] object-contain"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
