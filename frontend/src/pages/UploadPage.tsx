import React, { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import {
  UploadCloud,
  FileCheck,
  AlertCircle,
  Sparkles,
  ArrowRight,
  Eye,
  CheckCircle2,
  RefreshCw,
} from 'lucide-react'
import { uploadDocument, getPageImageUrl } from '../api'
import { QualityBadge } from '../components/QualityBadge'

const PIPELINE_STAGES = [
  { id: 'ingest', label: '1. Ingest' },
  { id: 'quality', label: '2. Quality' },
  { id: 'restore', label: '3. Restore' },
  { id: 'layout', label: '4. Layout' },
  { id: 'ocr', label: '5. OCR' },
  { id: 'extract', label: '6. Extract' },
  { id: 'validate', label: '7. Validate' },
  { id: 'route', label: '8. Route' },
]

export const UploadPage: React.FC = () => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [files, setFiles] = useState<File[]>([])
  const [stateCode, setStateCode] = useState('09')
  const [districtCode, setDistrictCode] = useState('0901')
  const [tehsilCode, setTehsilCode] = useState('090101')
  const [villageCode, setVillageCode] = useState('09010101')
  const [expectedDocType, setExpectedDocType] = useState('khatauni')

  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [activeStage, setActiveStage] = useState<string | null>(null)
  const [uploadResult, setUploadResult] = useState<any | null>(null)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  const handleFileDrop = (e: React.DragEvent) => {
    e.preventDefault()
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      setFiles(Array.from(e.dataTransfer.files))
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFiles(Array.from(e.target.files))
    }
  }

  const startPipeline = async () => {
    if (files.length === 0) return
    setUploading(true)
    setErrorMsg(null)
    setUploadResult(null)
    setActiveStage('ingest')
    setUploadProgress(15)

    try {
      // Trigger upload and ingestion
      const result = await uploadDocument(files, {
        state_code: stateCode,
        district_code: districtCode,
        tehsil_code: tehsilCode,
        village_code: villageCode,
        expected_doc_type: expectedDocType,
      })

      // Simulate live stage stepper progression
      const doc = result.documents ? result.documents[0] : result
      const docId = doc.id

      // Connect to SSE stream for live stage updates
      const eventSource = new EventSource(`/api/documents/${docId}/events`)
      eventSource.addEventListener('stage_update', (e) => {
        try {
          const payload = JSON.parse(e.data)
          setActiveStage(payload.stage)
          setUploadProgress(Math.round(payload.progress * 100))
        } catch (err) {
          console.error(err)
        }
      })

      eventSource.addEventListener('pipeline_complete', () => {
        eventSource.close()
        setUploadProgress(100)
        setActiveStage('route')
        setUploading(false)
        setUploadResult(result)
      })

      eventSource.onerror = () => {
        eventSource.close()
        setUploadProgress(100)
        setActiveStage('route')
        setUploading(false)
        setUploadResult(result)
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Upload failed')
      setUploading(false)
    }
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Page Title */}
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-3">
          <Sparkles className="w-8 h-8 text-amber-500" />
          <span>{t('upload.title')}</span>
        </h1>
        <p className="text-slate-600 mt-1 text-sm">{t('upload.subtitle')}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Upload Zone & Metadata */}
        <div className="lg:col-span-2 space-y-6">
          {/* Dropzone Card */}
          <div
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleFileDrop}
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-slate-300 hover:border-amber-500 bg-white hover:bg-amber-50/20 rounded-2xl p-10 text-center cursor-pointer transition-all shadow-sm group"
          >
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept=".pdf,.png,.jpg,.jpeg,.tif,.tiff,.zip"
              className="hidden"
              onChange={handleFileSelect}
            />
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <UploadCloud className="w-8 h-8" />
            </div>
            <h3 className="font-bold text-slate-800 text-base mb-1">
              {files.length > 0 ? `${files.length} file(s) selected` : t('upload.dropzone')}
            </h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              {t('upload.supportedFormats')}
            </p>

            {files.length > 0 && (
              <div className="mt-4 inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-100 text-slate-800 text-xs font-mono font-medium">
                <FileCheck className="w-4 h-4 text-emerald-600" />
                <span>{files.map((f) => f.name).join(', ')}</span>
              </div>
            )}
          </div>

          {/* Metadata Selector Panel */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-4">
              Optional Jurisdictional Metadata
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs">
              <div>
                <label className="block font-medium text-slate-700 mb-1">{t('upload.state')}</label>
                <select
                  value={stateCode}
                  onChange={(e) => setStateCode(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 text-slate-900 font-medium"
                >
                  <option value="09">09 - Uttar Pradesh (उत्तर प्रदेश)</option>
                  <option value="10">10 - Bihar (बिहार)</option>
                  <option value="08">08 - Rajasthan (राजस्थान)</option>
                </select>
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">{t('upload.district')}</label>
                <select
                  value={districtCode}
                  onChange={(e) => setDistrictCode(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 text-slate-900 font-medium"
                >
                  <option value="0901">0901 - Lucknow (लखनऊ)</option>
                  <option value="0902">0902 - Agra (आगरा)</option>
                  <option value="0903">0903 - Varanasi (वाराणसी)</option>
                </select>
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">{t('upload.tehsil')}</label>
                <input
                  type="text"
                  value={tehsilCode}
                  onChange={(e) => setTehsilCode(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 text-slate-900 font-medium"
                  placeholder="090101"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">{t('upload.village')}</label>
                <input
                  type="text"
                  value={villageCode}
                  onChange={(e) => setVillageCode(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 text-slate-900 font-medium"
                  placeholder="09010101"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block font-medium text-slate-700 mb-1">{t('upload.docType')}</label>
                <select
                  value={expectedDocType}
                  onChange={(e) => setExpectedDocType(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 text-slate-900 font-medium"
                >
                  <option value="khatauni">{t('upload.typeKhatauni')}</option>
                  <option value="mutation">{t('upload.typeMutation')}</option>
                  <option value="cadastral_map">{t('upload.typeMap')}</option>
                  <option value="sale_deed">{t('upload.typeSaleDeed')}</option>
                  <option value="unknown">{t('upload.typeUnknown')}</option>
                </select>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
              <span className="text-xs text-slate-500">
                {files.length} document(s) ready to process
              </span>
              <button
                onClick={startPipeline}
                disabled={files.length === 0 || uploading}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-slate-950 font-bold text-sm shadow-md shadow-amber-500/25 transition-all cursor-pointer"
              >
                {uploading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>{t('upload.processing')}</span>
                  </>
                ) : (
                  <>
                    <span>{t('upload.uploadBtn')}</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </div>

          {errorMsg && (
            <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm flex items-center gap-3">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}
        </div>

        {/* Right Column: Live Pipeline Stepper & Ingestion Result */}
        <div className="space-y-6">
          {/* Pipeline Stepper Card */}
          <div className="bg-slate-900 text-white rounded-2xl p-6 border border-slate-800 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-sm tracking-wide text-slate-200 uppercase">
                {t('pipeline.stages')}
              </h3>
              <span className="text-xs font-mono text-amber-400 font-semibold">
                {uploadProgress}%
              </span>
            </div>

            {/* Progress bar */}
            <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden mb-6">
              <div
                className="h-full bg-gradient-to-r from-amber-500 to-emerald-400 transition-all duration-300"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>

            {/* Stepper items */}
            <div className="space-y-3 text-xs">
              {PIPELINE_STAGES.map((stage, idx) => {
                const isCurrent = activeStage === stage.id
                const stageIndex = PIPELINE_STAGES.findIndex((s) => s.id === activeStage)
                const isDone = stageIndex > idx || uploadProgress === 100

                return (
                  <div
                    key={stage.id}
                    className={`flex items-center justify-between px-3 py-2 rounded-lg transition-colors ${
                      isCurrent
                        ? 'bg-amber-500/20 text-amber-300 font-semibold border border-amber-500/40'
                        : isDone
                        ? 'text-emerald-400'
                        : 'text-slate-500'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      {isDone ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      ) : isCurrent ? (
                        <div className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-ping" />
                      ) : (
                        <div className="w-2 h-2 rounded-full bg-slate-700" />
                      )}
                      <span>{t(`pipeline.${stage.id}`, stage.label)}</span>
                    </div>

                    {isDone && <span className="text-[10px] font-mono text-slate-400">OK</span>}
                    {isCurrent && <span className="text-[10px] font-mono text-amber-400">RUNNING</span>}
                  </div>
                )
              })}
            </div>
          </div>

          {/* Upload Output Card */}
          {uploadResult && (
            <div className="bg-white rounded-2xl p-6 border border-emerald-200 shadow-md">
              <div className="flex items-center gap-2 text-emerald-600 font-bold text-sm mb-3">
                <CheckCircle2 className="w-5 h-5" />
                <span>Ingestion & Restoration Completed</span>
              </div>

              {uploadResult.is_duplicate && (
                <div className="mb-3 px-3 py-2 rounded-lg bg-amber-50 text-amber-800 border border-amber-200 text-xs">
                  ⚠️ {t('upload.duplicateWarning')}
                </div>
              )}

              {/* Document details preview */}
              {(() => {
                const doc = uploadResult.documents ? uploadResult.documents[0] : uploadResult
                return (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-500">Document ID:</span>
                      <span className="font-mono text-slate-800 font-semibold">
                        {doc.id.slice(0, 12)}...
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-500">Quality:</span>
                      <QualityBadge score={doc.quality_score} flags={doc.quality_flags} size="sm" />
                    </div>

                    {/* Thumbnail preview */}
                    <div className="mt-3 rounded-lg overflow-hidden border border-slate-200 bg-slate-900 flex items-center justify-center max-h-40">
                      <img
                        src={getPageImageUrl(doc.id, 1, 'restored')}
                        alt="Restored Preview"
                        className="object-contain max-h-40 w-auto"
                      />
                    </div>

                    <button
                      onClick={() => navigate(`/documents/${doc.id}`)}
                      className="w-full mt-3 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold shadow-md transition-colors"
                    >
                      <Eye className="w-3.5 h-3.5 text-amber-400" />
                      <span>View Before/After Restoration</span>
                    </button>
                  </div>
                )
              })()}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
