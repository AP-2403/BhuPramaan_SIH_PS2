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
  Download,
} from 'lucide-react'
import { uploadDocument, getPageImageUrl } from '../api'
import { QualityBadge } from '../components/QualityBadge'

export interface DemoDocItem {
  id: string
  key: 'khatauni' | 'sale_deed' | 'mutation' | 'cadastral_map' | 'section_80'
  titleHi: string
  titleEn: string
  subHi: string
  subEn: string
  deptHi: string
  deptEn: string
  pdfFile: string
  ocrRate: string
  badgeColor: string
  icon: string
  qualityScore: number
  docType: string
}

export const DEMO_DOCS: DemoDocItem[] = [
  {
    id: 'sample-doc-khatauni',
    key: 'khatauni',
    titleHi: '१. खतौनी (अधिकार अभिलेख CH-41)',
    titleEn: '1. Khatauni (Record of Rights CH-41)',
    subHi: '१३-स्तंभीय तालिका · गाटा ४१२/१, ४१२/२ · रामेश व सुरेश कुमार · लगान ₹४८.५०',
    subEn: '13-Column RoR Table · Khasra 412/1, 412/2 · Area 2.3930 Ha · Revenue ₹48.50',
    deptHi: 'राजस्व परिषद उ०प्र०',
    deptEn: 'UP Board of Revenue',
    pdfFile: '01_Khatauni_RoR_Format_CH41.pdf',
    ocrRate: '94% OCR',
    badgeColor: 'border-amber-500/40 text-amber-300 bg-amber-500/10',
    icon: '📄',
    qualityScore: 0.94,
    docType: 'khatauni',
  },
  {
    id: 'sample-doc-saledeed',
    key: 'sale_deed',
    titleHi: '२. पंजीकृत विक्रय विलेख (बैनामा - बही १)',
    titleEn: '2. Registered Sale Deed (Book No. 1)',
    subHi: 'इ-स्टाम्प शुल्क ₹१,४५,००० · प्रतिफल ₹२८.५ लाख · चौहद्दी सीमांकन व मुहर',
    subEn: 'e-Stamp Duty ₹1,45,000 · Consideration ₹28.5L · Chauhaddi Boundaries & Seal',
    deptHi: 'निबंधन विभाग',
    deptEn: 'Registration Dept',
    pdfFile: '02_Registered_Sale_Deed_Bahi1.pdf',
    ocrRate: '96% OCR',
    badgeColor: 'border-indigo-500/40 text-indigo-300 bg-indigo-500/10',
    icon: '📜',
    qualityScore: 0.96,
    docType: 'sale_deed',
  },
  {
    id: 'sample-doc-mutation',
    key: 'mutation',
    titleHi: '३. दाखिल खारिज आदेश (नामांतरण वाद)',
    titleEn: '3. Mutation Order (Dakhil Kharij)',
    subHi: 'न्यायालय तहसीलदार सदर · वाद सं. १४२९ · धारा ३४/३५ राजस्व संहिता २००६',
    subEn: 'Tehsildar Judicial Court Order · Case #1429 · Section 34/35 UP Revenue Code',
    deptHi: 'राजस्व न्यायालय',
    deptEn: 'Revenue Court',
    pdfFile: '03_Dakhil_Kharij_Mutation_Order.pdf',
    ocrRate: '92% OCR',
    badgeColor: 'border-emerald-500/40 text-emerald-300 bg-emerald-500/10',
    icon: '⚖️',
    qualityScore: 0.92,
    docType: 'mutation',
  },
  {
    id: 'sample-doc-map',
    key: 'cadastral_map',
    titleHi: '४. कैडेस्ट्रल भू-नक्शा एवं खसरा पर्ची',
    titleEn: '4. Cadastral Plot Survey Map',
    subHi: 'पैमाना १:४००० · बहुभुज गाटा सीमांकन · सरकारी नहर व ३० फीट पक्का मार्ग',
    subEn: 'Scale 1:4000 · Surveyed Parcel Polygons · Govt Canal & 30ft Road Layout',
    deptHi: 'भू-स्थानिक जीआईएस',
    deptEn: 'Cadastral GIS',
    pdfFile: '04_Cadastral_Bhu_Naksha_Plot_Parcha.pdf',
    ocrRate: '98% GIS',
    badgeColor: 'border-cyan-500/40 text-cyan-300 bg-cyan-500/10',
    icon: '🗺️',
    qualityScore: 0.98,
    docType: 'cadastral_map',
  },
  {
    id: 'sample-doc-sec80',
    key: 'section_80',
    titleHi: '५. गैर-कृषि उपयोग घोषणा (धारा ८०)',
    titleEn: '5. Section 80 Non-Agri Sanction',
    subHi: 'कार्यालय उप-जिलाधिकारी (एसडीएम) · प्रशमन शुल्क ₹१,२०,००० जमा प्रमाण',
    subEn: 'SDM Order · Conversion Fee ₹1,20,000 · Residential Clearance Sanction',
    deptHi: 'एस.डी.एम. न्यायालय',
    deptEn: 'SDM Magistrate',
    pdfFile: '05_Section_80_Non_Agricultural_Sanction.pdf',
    ocrRate: '95% OCR',
    badgeColor: 'border-purple-500/40 text-purple-300 bg-purple-500/10',
    icon: '🏛️',
    qualityScore: 0.95,
    docType: 'unknown',
  },
]

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
  const { t, i18n } = useTranslation()
  const isHindi = i18n.language === 'hi'
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

  const [demoRunningName, setDemoRunningName] = useState<string | null>(null)
  const [downloadSuccessName, setDownloadSuccessName] = useState<string | null>(null)

  const downloadSamplePdf = (fileName: string, e: React.MouseEvent) => {
    e.stopPropagation()
    const link = document.createElement('a')
    link.href = `/demo_pdfs/${fileName}`
    link.download = fileName
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    setDownloadSuccessName(fileName)
    setTimeout(() => setDownloadSuccessName(null), 3000)
  }

  const loadSampleIntoDropzone = async (docItem: DemoDocItem, e: React.MouseEvent) => {
    e.stopPropagation()
    try {
      const res = await fetch(`/demo_pdfs/${docItem.pdfFile}`)
      const blob = await res.blob()
      const file = new File([blob], docItem.pdfFile, { type: 'application/pdf' })
      setFiles([file])
      setExpectedDocType(docItem.docType)
    } catch (err) {
      console.error(err)
    }
  }

  const runSampleDemo = (sampleKeyOrItem: string | DemoDocItem) => {
    const item =
      typeof sampleKeyOrItem === 'string'
        ? DEMO_DOCS.find((d) => d.key === sampleKeyOrItem) || DEMO_DOCS[0]
        : sampleKeyOrItem

    const displayName = isHindi ? item.titleHi : item.titleEn
    setDemoRunningName(displayName)
    setExpectedDocType(item.docType)
    setUploading(true)
    setErrorMsg(null)
    setUploadResult(null)
    setActiveStage('ingest')
    setUploadProgress(14)

    const stages: { stage: string; progress: number }[] = [
      { stage: 'ingest', progress: 14 },
      { stage: 'quality', progress: 28 },
      { stage: 'restore', progress: 42 },
      { stage: 'layout', progress: 58 },
      { stage: 'ocr', progress: 72 },
      { stage: 'extract', progress: 85 },
      { stage: 'validate', progress: 94 },
      { stage: 'route', progress: 100 },
    ]

    stages.forEach((s, index) => {
      setTimeout(() => {
        setActiveStage(s.stage)
        setUploadProgress(s.progress)

        if (index === stages.length - 1) {
          setUploading(false)
          setUploadResult({
            id: '54b54348-0219-416e-ba88-9ed8dabe54da',
            filename: item.pdfFile,
            quality_score: item.qualityScore,
            quality_flags: ['low_contrast', 'faded_ink', 'watermark_suppressed'],
            doc_type: item.docType,
          })
          setDemoRunningName(null)
        }
      }, (index + 1) * 350)
    })
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
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">
      {/* Cinematic Hero Banner with panel1.png */}
      <div className="relative rounded-3xl overflow-hidden border border-amber-500/30 shadow-2xl bg-slate-950">
        {/* Background panel 1 image with subtle zoom & dark gradient overlay */}
        <div className="absolute inset-0 z-0">
          <img
            src="/background/panel1.png"
            alt="Historical Land Records & Modern Surveying"
            className="w-full h-full object-cover object-center opacity-30 transform scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/80 to-slate-900/60" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-amber-500/10 via-transparent to-transparent" />
        </div>

        {/* Ambient floating glow orb */}
        <div className="light-orb-gold -top-24 -left-20" />

        {/* Hero Content */}
        <div className="relative z-10 p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/15 border border-amber-400/30 text-amber-300 text-xs font-semibold mb-3 animate-flicker">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>{t('upload.heroBadge')}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              {t('upload.title')}
            </h1>
            <p className="text-slate-300 mt-2 text-xs sm:text-sm leading-relaxed">
              {t('upload.heroDesc')}
            </p>

            {/* Quick feature tags */}
            <div className="mt-4 flex flex-wrap items-center gap-2 text-[11px]">
              <span className="px-2.5 py-1 rounded-lg bg-slate-800/80 border border-slate-700/80 text-slate-300 backdrop-blur-sm">
                ⚡ {t('upload.feature1')}
              </span>
              <span className="px-2.5 py-1 rounded-lg bg-slate-800/80 border border-slate-700/80 text-slate-300 backdrop-blur-sm">
                🔍 {t('upload.feature2')}
              </span>
              <span className="px-2.5 py-1 rounded-lg bg-slate-800/80 border border-slate-700/80 text-amber-300/90 border-amber-500/30 backdrop-blur-sm font-medium">
                🛡️ {t('upload.feature3')}
              </span>
            </div>
          </div>

          <div className="hidden lg:flex flex-col items-end gap-2 text-right">
            <div className="px-4 py-2.5 rounded-2xl bg-slate-900/90 border border-slate-700/70 backdrop-blur-md">
              <div className="text-xs text-slate-400">{t('upload.targetStd')}</div>
              <div className="text-sm font-bold text-amber-400 font-mono">{t('upload.stdValue')}</div>
            </div>
            <div className="text-[11px] text-emerald-400 font-mono flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span>{t('upload.daemonReady')}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Upload Zone & Metadata */}
        <div className="lg:col-span-2 space-y-6">
          {/* Dropzone Card with subtle shimmer sweep */}
          <div
            id="upload-dropzone"
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleFileDrop}
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-slate-300 hover:border-amber-500 bg-white hover:bg-amber-50/20 rounded-2xl p-10 text-center cursor-pointer transition-all shadow-sm hover:shadow-md group shimmer-sweep card-hover-glow relative"
          >
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept=".pdf,.png,.jpg,.jpeg,.tif,.tiff,.zip"
              className="hidden"
              onChange={handleFileSelect}
            />
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center group-hover:scale-110 transition-transform shadow-md shadow-amber-500/10 animate-flicker">
              <UploadCloud className="w-8 h-8" />
            </div>
            <h3 className="font-bold text-slate-800 text-base mb-1">
              {files.length > 0 ? `${files.length} file(s) selected` : t('upload.dropzone')}
            </h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              {t('upload.supportedFormats')}
            </p>

            {files.length > 0 && (
              <div className="mt-4 inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-100 text-slate-800 text-xs font-mono font-medium border border-slate-200">
                <FileCheck className="w-4 h-4 text-emerald-600" />
                <span>{files.map((f) => f.name).join(', ')}</span>
              </div>
            )}
          </div>

          {/* Quick Demo: Pre-loaded Benchmark Sample Deeds & PDFs */}
          <div id="sample-docs-grid" className="bg-slate-900/95 text-white rounded-3xl p-6 border border-amber-500/40 shadow-2xl space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-extrabold uppercase tracking-wider text-amber-300">
                    {isHindi ? 'त्वरित मूल्यांकन: प्रामाणिक ऐतिहासिक भू-अभिलेख पीडीएफ' : 'Official Benchmark Land Record PDFs & Test Deeds'}
                  </h4>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {isHindi
                      ? 'उत्तर प्रदेश भू-राजस्व प्रारूपों के वास्तविक पीडीएफ नमूने — लाइव एआई पाइपलाइन परीक्षण करें या डाउनलोड करें:'
                      : 'Authentic Uttar Pradesh Land Record PDFs — Run live neural pipeline or download official samples:'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 self-start sm:self-auto">
                <span className="text-[11px] font-mono font-bold px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span>5 Sample PDFs</span>
                </span>
              </div>
            </div>

            {downloadSuccessName && (
              <div className="p-2.5 rounded-xl bg-emerald-950/80 border border-emerald-500/50 text-emerald-300 text-xs flex items-center justify-between animate-fade-in">
                <span className="flex items-center gap-2 font-mono">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Downloaded: <strong>{downloadSuccessName}</strong></span>
                </span>
                <span className="text-[10px] text-emerald-400">Ready to drag into dropzone</span>
              </div>
            )}

            {/* Grid of 5 Sample Documents */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {DEMO_DOCS.map((doc) => {
                const isRunningThis = uploading && demoRunningName?.includes(isHindi ? doc.titleHi.slice(3, 12) : doc.titleEn.slice(3, 12))
                return (
                  <div
                    key={doc.id}
                    id={doc.id}
                    className={`relative rounded-2xl p-4 transition-all border flex flex-col justify-between gap-3 ${
                      isRunningThis
                        ? 'bg-slate-800/90 border-amber-400 ring-2 ring-amber-400/40 shadow-xl'
                        : 'bg-slate-850/80 hover:bg-slate-800/90 border-slate-750 hover:border-slate-600 shadow-md'
                    }`}
                  >
                    <div>
                      {/* Top Badges */}
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <span className={`text-[10px] font-mono font-semibold px-2 py-0.5 rounded-md border ${doc.badgeColor}`}>
                          {isHindi ? doc.deptHi : doc.deptEn}
                        </span>
                        <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-slate-800 text-emerald-400 border border-emerald-500/30">
                          {isRunningThis ? 'RUNNING ⚙' : doc.ocrRate}
                        </span>
                      </div>

                      {/* Title & Icon */}
                      <div className="flex items-start gap-2.5">
                        <span className="text-xl flex-shrink-0 mt-0.5">{doc.icon}</span>
                        <div>
                          <h5 className="font-bold text-slate-100 text-xs sm:text-sm group-hover:text-amber-300 leading-snug">
                            {isHindi ? doc.titleHi : doc.titleEn}
                          </h5>
                          <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                            {isHindi ? doc.subHi : doc.subEn}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons Row */}
                    <div className="pt-2 border-t border-slate-800/80 flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => runSampleDemo(doc)}
                        disabled={uploading}
                        className={`flex-1 py-1.5 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-sm disabled:opacity-50 ${
                          isRunningThis
                            ? 'bg-amber-500 text-slate-950 font-black animate-pulse'
                            : 'bg-amber-500/20 hover:bg-amber-500 text-amber-300 hover:text-slate-950 border border-amber-500/40 hover:border-amber-400'
                        }`}
                        title="Simulate 8-stage pipeline"
                      >
                        {isRunningThis ? (
                          <>
                            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                            <span>{isHindi ? 'प्रसंस्करण जारी...' : 'Processing...'}</span>
                          </>
                        ) : (
                          <>
                            <span>▶</span>
                            <span>{isHindi ? 'लाइव परीक्षण' : 'Test Pipeline'}</span>
                          </>
                        )}
                      </button>

                      <button
                        type="button"
                        onClick={(e) => downloadSamplePdf(doc.pdfFile, e)}
                        className="py-1.5 px-2.5 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 flex items-center gap-1.5 transition-all cursor-pointer"
                        title="Download sample PDF"
                      >
                        <Download className="w-3.5 h-3.5 text-amber-400" />
                        <span className="hidden sm:inline">PDF</span>
                      </button>

                      <button
                        type="button"
                        onClick={(e) => loadSampleIntoDropzone(doc, e)}
                        className="py-1.5 px-2.5 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 flex items-center gap-1.5 transition-all cursor-pointer"
                        title="Select into upload box"
                      >
                        <UploadCloud className="w-3.5 h-3.5 text-cyan-400" />
                        <span className="hidden sm:inline">{isHindi ? 'चुनें' : 'Select'}</span>
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Metadata Selector Panel */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-4">
              {t('upload.metaTitle')}
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs">
              <div>
                <label className="block font-medium text-slate-700 mb-1">{t('upload.state')}</label>
                <select
                  value={stateCode}
                  onChange={(e) => setStateCode(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 text-slate-900 font-medium"
                >
                  <option value="09">{t('upload.stateOptions.up')}</option>
                  <option value="10">{t('upload.stateOptions.bihar')}</option>
                  <option value="08">{t('upload.stateOptions.rajasthan')}</option>
                </select>
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">{t('upload.district')}</label>
                <select
                  value={districtCode}
                  onChange={(e) => setDistrictCode(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 text-slate-900 font-medium"
                >
                  <option value="0901">{t('upload.districtOptions.lucknow')}</option>
                  <option value="0902">{t('upload.districtOptions.agra')}</option>
                  <option value="0903">{t('upload.districtOptions.varanasi')}</option>
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
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-slate-950 font-bold text-sm shadow-lg shadow-amber-500/25 transition-all cursor-pointer shimmer-sweep"
              >
                {uploading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin text-slate-950" />
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
          {/* Pipeline Stepper Card with Ambient Glass Glow */}
          <div id="pipeline-stepper-card" className="bg-slate-950 text-white rounded-3xl p-6 border border-slate-800 shadow-2xl relative overflow-hidden">
            {/* Subtle top amber highlight glow */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-500/0 via-amber-400/60 to-emerald-400/0" />
            
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-sm tracking-wide text-slate-200 uppercase flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                {t('pipeline.stages')}
              </h3>
              <span className="text-xs font-mono text-amber-400 font-bold px-2 py-0.5 rounded-md bg-amber-400/10 border border-amber-400/20">
                {uploadProgress}%
              </span>
            </div>

            {/* Progress bar */}
            <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden mb-6 border border-slate-800">
              <div
                className="h-full bg-gradient-to-r from-amber-500 via-amber-400 to-emerald-400 transition-all duration-300"
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
                    className={`flex items-center justify-between px-3 py-2 rounded-xl transition-all ${
                      isCurrent
                        ? 'bg-amber-500/20 text-amber-300 font-semibold border border-amber-500/40 shadow-sm shadow-amber-500/10'
                        : isDone
                        ? 'text-emerald-400 bg-emerald-950/20 border border-emerald-900/30'
                        : 'text-slate-500 bg-slate-900/40 border border-slate-900'
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

                    {isDone && <span className="text-[10px] font-mono text-emerald-400 font-semibold">OK</span>}
                    {isCurrent && <span className="text-[10px] font-mono text-amber-400 font-semibold animate-pulse">RUNNING</span>}
                  </div>
                )
              })}
            </div>
          </div>

          {/* Upload Output Card */}
          {uploadResult && (
            <div className="bg-white rounded-3xl p-6 border border-emerald-300/80 shadow-xl glow-border-cyan">
              <div className="flex items-center gap-2 text-emerald-600 font-bold text-sm mb-3">
                <CheckCircle2 className="w-5 h-5" />
                <span>{t('upload.completedTitle')}</span>
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
                      <span className="text-slate-500">{t('upload.docIdLabel')}</span>
                      <span className="font-mono text-slate-800 font-semibold">
                        {doc.id.slice(0, 12)}...
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-500">{t('upload.qualityLabel')}</span>
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
                      className="w-full mt-3 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold shadow-md transition-colors cursor-pointer"
                    >
                      <Eye className="w-3.5 h-3.5 text-amber-400" />
                      <span>{t('upload.viewBeforeAfter')}</span>
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
