import React, { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import {
  FileText,
  Clock,
  MapPin,
  Sliders,
  Activity,
  Layers,
  RefreshCw,
  AlertTriangle,
} from 'lucide-react'
import { getDocument, getPageImageUrl, type DocumentDetail } from '../api'
import { BeforeAfterSlider } from '../components/BeforeAfterSlider'
import { QualityBadge } from '../components/QualityBadge'

export const DocumentDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>()

  const [document, setDocument] = useState<DocumentDetail | null>(null)
  const [loading, setLoading] = useState(true)

  const [error, setError] = useState<string | null>(null)
  const [activePageNo, setActivePageNo] = useState(1)
  const [activeTab, setActiveTab] = useState<'compare' | 'metrics' | 'variants'>('compare')

  useEffect(() => {
    if (!id) return
    setLoading(true)
    getDocument(id)
      .then((data) => {
        setDocument(data)
        setLoading(false)
      })
      .catch((err) => {
        setError(err.message || 'Failed to load document')
        setLoading(false)
      })
  }, [id])

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-16 text-center">
        <RefreshCw className="w-8 h-8 animate-spin text-amber-500 mx-auto mb-3" />
        <p className="text-slate-600 text-sm font-medium">Loading document details...</p>
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
      {/* Top Breadcrumb & Document Header Card */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5 mb-1.5">
            <span className="p-1.5 rounded-lg bg-amber-100 text-amber-700">
              <FileText className="w-4 h-4" />
            </span>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">
              {document.filename}
            </h1>
            <span className="text-xs px-2.5 py-0.5 rounded-full font-mono bg-slate-100 text-slate-700 border border-slate-200">
              {document.doc_type}
            </span>
            <span className="text-xs px-2.5 py-0.5 rounded-full font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
              {document.status}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500">
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              <span>Uploaded: {document.uploaded_at ? new Date(document.uploaded_at).toLocaleString() : 'N/A'}</span>
            </span>
            <span className="flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5" />
              <span>State: {document.state_code || '09'} · District: {document.district_code || '0901'}</span>
            </span>
            <span className="font-mono text-slate-400">ID: {document.id}</span>
          </div>
        </div>

        {/* Quality Score Highlight */}
        <div className="flex items-center gap-4 bg-slate-50 p-3.5 rounded-xl border border-slate-200">
          <div>
            <div className="text-[11px] text-slate-500 font-semibold uppercase tracking-wider">
              Document Quality
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
      <div className="flex border-b border-slate-200 text-sm font-semibold text-slate-500 space-x-6">
        <button
          onClick={() => setActiveTab('compare')}
          className={`pb-3 flex items-center gap-2 border-b-2 transition-all ${
            activeTab === 'compare'
              ? 'border-amber-500 text-amber-600 font-bold'
              : 'border-transparent hover:text-slate-900'
          }`}
        >
          <Sliders className="w-4 h-4" />
          <span>Before / After Restoration Slider</span>
        </button>

        <button
          onClick={() => setActiveTab('metrics')}
          className={`pb-3 flex items-center gap-2 border-b-2 transition-all ${
            activeTab === 'metrics'
              ? 'border-amber-500 text-amber-600 font-bold'
              : 'border-transparent hover:text-slate-900'
          }`}
        >
          <Activity className="w-4 h-4" />
          <span>Quality Metrics & Diagnostics</span>
        </button>

        <button
          onClick={() => setActiveTab('variants')}
          className={`pb-3 flex items-center gap-2 border-b-2 transition-all ${
            activeTab === 'variants'
              ? 'border-amber-500 text-amber-600 font-bold'
              : 'border-transparent hover:text-slate-900'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>All Image Variants</span>
        </button>
      </div>

      {/* Tab 1: Before/After Slider */}
      {activeTab === 'compare' && (
        <div>
          <BeforeAfterSlider
            originalUrl={getPageImageUrl(document.id, activePageNo, 'original')}
            restoredUrl={getPageImageUrl(document.id, activePageNo, 'restored')}
            binaryUrl={getPageImageUrl(document.id, activePageNo, 'binary')}
            noStampUrl={getPageImageUrl(document.id, activePageNo, 'no_stamp')}
            title={`Page ${activePageNo}: Restoration Comparison (Deskew, CLAHE, Illumination Correction)`}
          />
        </div>
      )}

      {/* Tab 2: Quality Metrics */}
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

      {/* Tab 3: All Image Variants Grid */}
      {activeTab === 'variants' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
            <h3 className="font-bold text-sm text-slate-800 mb-2">Original Degraded Scan</h3>
            <div className="bg-slate-900 rounded-lg overflow-hidden flex items-center justify-center p-2">
              <img
                src={getPageImageUrl(document.id, activePageNo, 'original')}
                alt="Original"
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
                className="max-h-[450px] object-contain"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
