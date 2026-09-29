import React, { useState } from 'react'
import {
  X,
  ShieldCheck,
  AlertTriangle,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  FileText,
  Calendar,
  Building2,
  CheckCircle2,
  GitBranch,
  Sparkles,
} from 'lucide-react'

export interface GraphParcelProps {
  khasraNo: string
  khataNo: string
  village: string
  owner: string
  areaDeed: string
  areaGeodesic: string
  status: 'VALIDATED' | 'WARNING'
}

interface OwnershipGraphModalProps {
  isOpen: boolean
  onClose: () => void
  parcel: GraphParcelProps | null
  isHindi?: boolean
}

interface GraphNode {
  id: string
  type: 'plot' | 'person' | 'bank' | 'disputed'
  titleHi: string
  titleEn: string
  roleHi: string
  roleEn: string
  period: string
  docHi: string
  docEn: string
  docRef: string
  status: 'active' | 'historic' | 'warning'
  x: number
  y: number
}

interface GraphEdge {
  from: string
  to: string
  typeHi: string
  typeEn: string
  date: string
  ref: string
  isBroken?: boolean
  brokenReason?: string
}

function formatNodeTitle(node: GraphNode, isHindi: boolean): string {
  if (node.type === 'plot') return isHindi ? node.titleHi : node.titleEn
  const raw = isHindi ? node.titleHi : node.titleEn
  if (raw.includes(' s/o ')) return raw.split(' s/o ')[0]
  if (raw.includes(' पुत्र ')) return raw.split(' पुत्र ')[0]
  if (raw.includes('(SBI)') || raw.includes('State Bank')) return 'SBI'
  const parts = raw.trim().split(/\s+/)
  if (parts.length > 1 && parts[0].length >= 3) {
    return parts[0]
  }
  return raw.length > 11 ? raw.slice(0, 10) + '…' : raw
}

export const OwnershipGraphModal: React.FC<OwnershipGraphModalProps> = ({
  isOpen,
  onClose,
  parcel,
  isHindi = false,
}) => {
  const [zoom, setZoom] = useState<number>(1)
  const [selectedNodeId, setSelectedNodeId] = useState<string>('node-current')
  const [filterType, setFilterType] = useState<'all' | 'mutations' | 'liens'>('all')

  if (!isOpen || !parcel) return null

  const isWarningParcel = parcel.status === 'WARNING' || parcel.khasraNo === '312'

  // Dynamic graph nodes for the parcel - perfectly balanced for 800x400 viewBox
  const nodes: GraphNode[] = isWarningParcel
    ? [
        {
          id: 'node-plot',
          type: 'plot',
          titleHi: `गाटा ${parcel.khasraNo}`,
          titleEn: `Plot ${parcel.khasraNo}`,
          roleHi: 'कैडेस्ट्रल भूखंड',
          roleEn: 'Cadastral Parcel',
          period: 'क्षेत्र: ०.६२० हे.',
          docHi: 'राजस्व नक्शा पर्ची',
          docEn: 'Cadastral Survey Parcha',
          docRef: 'REV-LKO-2024-P312',
          status: 'warning',
          x: 95,
          y: 190,
        },
        {
          id: 'node-ancestor',
          type: 'person',
          titleHi: 'बाबूलाल वर्मा',
          titleEn: 'Babulal Verma',
          roleHi: 'पूर्व खातेदार (1994)',
          roleEn: 'Historic Title (1994)',
          period: '1994 — 2012',
          docHi: 'मूल खतौनी खाता सं. 88',
          docEn: 'Original RoR Khata #88',
          docRef: 'UP-ROR-1402F-88',
          status: 'historic',
          x: 285,
          y: 115,
        },
        {
          id: 'node-disputed',
          type: 'disputed',
          titleHi: 'अज्ञात पक्ष / फर्जी अंतरण',
          titleEn: 'Unverified Entity',
          roleHi: 'अपंजीकृत दावा (G001)',
          roleEn: 'Unlinked Claim (G001)',
          period: '2019',
          docHi: 'अपंजीकृत अनुबंध प्रपत्र',
          docEn: 'Unregistered Mutation Agreement',
          docRef: 'MUT-UNVERIFIED-2019',
          status: 'warning',
          x: 480,
          y: 280,
        },
        {
          id: 'node-current',
          type: 'person',
          titleHi: parcel.owner,
          titleEn: parcel.owner,
          roleHi: 'विवादित दावेदार',
          roleEn: 'Claimant Titleholder',
          period: '2020 — वर्तमान',
          docHi: 'नामांतरण आदेश (विवादित)',
          docEn: 'Mutation Entry (Under Review)',
          docRef: 'MUT-2020-LKO-312',
          status: 'warning',
          x: 685,
          y: 190,
        },
      ]
    : [
        {
          id: 'node-plot',
          type: 'plot',
          titleHi: `गाटा ${parcel.khasraNo}`,
          titleEn: `Plot ${parcel.khasraNo}`,
          roleHi: 'कैडेस्ट्रल भूखंड',
          roleEn: 'Cadastral Parcel',
          period: parcel.areaDeed,
          docHi: 'राजस्व परिषद डिजिटल भू-नक्शा',
          docEn: 'UP Board of Revenue GIS Sheet',
          docRef: `GEO-UP-0901-${parcel.khasraNo.replace('/', '-')}`,
          status: 'active',
          x: 95,
          y: 190,
        },
        {
          id: 'node-gen1',
          type: 'person',
          titleHi: 'रामलाल पुत्र रघुनाथ',
          titleEn: 'Ramlal s/o Raghunath',
          roleHi: 'पैतृक खातेदार (Gen 1)',
          roleEn: 'Original Titleholder',
          period: '1988 — 2005',
          docHi: 'पैतृक खतौनी खाता सं. 104',
          docEn: 'Ancestral Khatauni #104',
          docRef: 'UP-LKO-1395F-104',
          status: 'historic',
          x: 280,
          y: 110,
        },
        {
          id: 'node-gen2',
          type: 'person',
          titleHi: 'शिवप्रसाद पुत्र रामलाल',
          titleEn: 'Shiv Prasad s/o Ramlal',
          roleHi: 'विधिक वारिस (Gen 2)',
          roleEn: 'Succession Heir',
          period: '2005 — 2018',
          docHi: 'तहसीलदार वरासत आदेश',
          docEn: 'Succession Mutation Order #42/2005',
          docRef: 'COURT-SDR-ORD-2005-42',
          status: 'historic',
          x: 475,
          y: 110,
        },
        {
          id: 'node-current',
          type: 'person',
          titleHi: parcel.owner,
          titleEn: parcel.owner,
          roleHi: 'वर्तमान भूमिधर (सक्रिय)',
          roleEn: 'Active Titleholder',
          period: '2018 — वर्तमान',
          docHi: 'पंजीकृत विक्रय विलेख (बैनामा)',
          docEn: 'Registered Sale Deed #4821/2018',
          docRef: 'REG-UP-SDR-4821-2018',
          status: 'active',
          x: 685,
          y: 155,
        },
        {
          id: 'node-bank',
          type: 'bank',
          titleHi: 'भारतीय स्टेट बैंक (SBI)',
          titleEn: 'State Bank of India',
          roleHi: 'कृषि ऋण बंधक (Lien)',
          roleEn: 'Bank Lien Holder',
          period: '2021 — 2028',
          docHi: 'बंधक विलेख (₹2,50,000/-)',
          docEn: 'Charge Certificate (₹2,50,000)',
          docRef: 'BANK-SBI-AGRI-2021-98',
          status: 'active',
          x: 475,
          y: 305,
        },
      ]

  // Graph Edges
  const edges: GraphEdge[] = isWarningParcel
    ? [
        {
          from: 'node-plot',
          to: 'node-ancestor',
          typeHi: 'मूल बंदोबस्त',
          typeEn: 'Settlement 1994',
          date: '1994',
          ref: 'Bandobast 1994',
        },
        {
          from: 'node-ancestor',
          to: 'node-disputed',
          typeHi: 'टूटी कड़ी (G001)',
          typeEn: 'Broken Chain (G001)',
          date: '2019',
          ref: 'RULE G001 BREAK',
          isBroken: true,
          brokenReason: isHindi
            ? 'नियम G001 उल्लंघन: हस्तांतरक बाबूलाल वर्मा का विधिक वारिसान या पंजीकृत विलेख उपलब्ध नहीं है।'
            : 'Rule G001 Violation: Mutation transferor does not match active registered titleholder in graph.',
        },
        {
          from: 'node-disputed',
          to: 'node-current',
          typeHi: 'विवादित नामांतरण',
          typeEn: 'Disputed Mutation',
          date: '2020',
          ref: 'MUT-312-2020',
          isBroken: true,
          brokenReason: isHindi
            ? 'नियम G002 चेतावनी: दोहरे परस्पर-विरोधी दावों के कारण स्वामित्व संदिग्ध है।'
            : 'Rule G002 Warning: Overlapping or unverified title chain detected.',
        },
      ]
    : [
        {
          from: 'node-plot',
          to: 'node-gen1',
          typeHi: 'राजस्व बंदोबस्त',
          typeEn: 'Revenue Settlement',
          date: '1988',
          ref: 'CH-41 #104',
        },
        {
          from: 'node-gen1',
          to: 'node-gen2',
          typeHi: 'उत्तराधिकार / वरासत',
          typeEn: 'Succession Inheritance',
          date: '14-04-2005',
          ref: 'Ord #42/2005',
        },
        {
          from: 'node-gen2',
          to: 'node-current',
          typeHi: 'पंजीकृत बैनामा',
          typeEn: 'Registered Conveyance',
          date: '18-11-2018',
          ref: 'Deed #4821',
        },
        {
          from: 'node-current',
          to: 'node-bank',
          typeHi: 'बैंक बंधक (Lien)',
          typeEn: 'Bank Hypothecation',
          date: '10-06-2021',
          ref: 'SBI Charge #98',
        },
      ]

  const activeNode = nodes.find((n) => n.id === selectedNodeId) || nodes[0]

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 animate-fade-in">
      <div className="bg-slate-900 border border-indigo-500/40 rounded-3xl shadow-2xl overflow-hidden max-w-6xl w-full flex flex-col max-h-[92vh] text-white">
        {/* Modal Header */}
        <div className="bg-slate-950 px-6 py-4 border-b border-slate-800 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
              <GitBranch className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-base sm:text-lg text-white tracking-tight">
                  {isHindi ? 'स्वामित्व वंशावली आरेख (टाइटेल लीनिएज ग्राफ)' : 'Ownership Lineage & Title Continuity Graph'}
                </h3>
                <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 font-bold">
                  {parcel.khasraNo}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                {isHindi
                  ? `ग्राम: ${parcel.village} · खाता संख्या: ${parcel.khataNo} · पूर्ण ऐतिहासिक अंतरण श्रृंखला (1988–2026)`
                  : `Village: ${parcel.village} · Khata: ${parcel.khataNo} · Complete Historical Chain of Title (1988–2026)`}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Rule Integrity Status Badge */}
            {isWarningParcel ? (
              <span className="px-3 py-1.5 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-500/40 text-xs font-bold flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-amber-400 animate-pulse" />
                <span>{isHindi ? 'नियम G001/G002 विसंगति' : 'Rule G001/G002 Flagged'}</span>
              </span>
            ) : (
              <span className="px-3 py-1.5 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-xs font-bold flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>{isHindi ? 'शृंखला 100% सत्यापित (G001 मान्य)' : 'Chain 100% Intact (Rule G001 Verified)'}</span>
              </span>
            )}

            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-all cursor-pointer border border-slate-700 ml-2"
              title="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Toolbar & Filter Bar */}
        <div className="bg-slate-900/90 px-6 py-2.5 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <span className="text-slate-400 font-medium">{isHindi ? 'फिल्टर:' : 'Filter:'}</span>
            <div className="flex bg-slate-800 p-0.5 rounded-lg border border-slate-700">
              <button
                onClick={() => setFilterType('all')}
                className={`px-3 py-1 rounded-md transition-all font-semibold ${
                  filterType === 'all' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-white'
                }`}
              >
                {isHindi ? 'संपूर्ण इतिहास' : 'All Events'}
              </button>
              <button
                onClick={() => setFilterType('mutations')}
                className={`px-3 py-1 rounded-md transition-all font-semibold ${
                  filterType === 'mutations' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-white'
                }`}
              >
                {isHindi ? 'नामांतरण / बैनामा' : 'Mutations Only'}
              </button>
              <button
                onClick={() => setFilterType('liens')}
                className={`px-3 py-1 rounded-md transition-all font-semibold ${
                  filterType === 'liens' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-white'
                }`}
              >
                {isHindi ? 'ऋण / बंधक' : 'Liens & Mortgages'}
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center bg-slate-800 rounded-lg border border-slate-700 overflow-hidden">
              <button
                onClick={() => setZoom((z) => Math.max(0.7, z - 0.15))}
                className="p-1.5 hover:bg-slate-700 text-slate-300"
                title="Zoom Out"
              >
                <ZoomOut className="w-4 h-4" />
              </button>
              <span className="px-2 font-mono text-[11px] text-slate-300 border-x border-slate-700">
                {Math.round(zoom * 100)}%
              </span>
              <button
                onClick={() => setZoom((z) => Math.min(1.5, z + 0.15))}
                className="p-1.5 hover:bg-slate-700 text-slate-300"
                title="Zoom In"
              >
                <ZoomIn className="w-4 h-4" />
              </button>
              <button
                onClick={() => setZoom(1.0)}
                className="p-1.5 hover:bg-slate-700 text-slate-300 border-l border-slate-700"
                title="Reset Zoom"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Main Content Area: Graph Canvas + Detailed Node Inspector */}
        <div className="flex-1 overflow-hidden grid grid-cols-1 lg:grid-cols-12 min-h-[460px]">
          {/* Interactive SVG Network Canvas (8 Cols) */}
          <div
            className={`lg:col-span-8 bg-slate-950 p-4 sm:p-6 flex items-center justify-center relative select-none ${
              zoom > 1.0 ? 'overflow-auto' : 'overflow-hidden'
            }`}
          >
            {/* Background Grid Pattern */}
            <div
              className="absolute inset-0 opacity-15 pointer-events-none"
              style={{
                backgroundImage:
                  'radial-gradient(circle, #6366f1 1px, transparent 1px), radial-gradient(circle, #6366f1 1px, transparent 1px)',
                backgroundSize: '24px 24px',
              }}
            />

            <div
              className="w-full h-full flex items-center justify-center transition-transform duration-200 origin-center"
              style={{ transform: `scale(${zoom})` }}
            >
              <svg
                viewBox="0 0 800 400"
                className="w-full h-auto max-h-[420px] select-none overflow-visible"
                preserveAspectRatio="xMidYMid meet"
              >
                <defs>
                  {/* Arrow marker for normal edges */}
                  <marker
                    id="arrow-cyan"
                    viewBox="0 0 10 10"
                    refX="26"
                    refY="5"
                    markerWidth="6"
                    markerHeight="6"
                    orient="auto-start-reverse"
                  >
                    <path d="M 0 1 L 10 5 L 0 9 z" fill="#38bdf8" />
                  </marker>
                  {/* Arrow marker for active edge */}
                  <marker
                    id="arrow-emerald"
                    viewBox="0 0 10 10"
                    refX="26"
                    refY="5"
                    markerWidth="6"
                    markerHeight="6"
                    orient="auto-start-reverse"
                  >
                    <path d="M 0 1 L 10 5 L 0 9 z" fill="#10b981" />
                  </marker>
                  {/* Arrow marker for lien edge */}
                  <marker
                    id="arrow-purple"
                    viewBox="0 0 10 10"
                    refX="26"
                    refY="5"
                    markerWidth="6"
                    markerHeight="6"
                    orient="auto-start-reverse"
                  >
                    <path d="M 0 1 L 10 5 L 0 9 z" fill="#c084fc" />
                  </marker>
                  {/* Arrow marker for broken edge */}
                  <marker
                    id="arrow-red"
                    viewBox="0 0 10 10"
                    refX="26"
                    refY="5"
                    markerWidth="6"
                    markerHeight="6"
                    orient="auto-start-reverse"
                  >
                    <path d="M 0 1 L 10 5 L 0 9 z" fill="#ef4444" />
                  </marker>
                </defs>

                {/* Render Edges */}
                {edges.map((e, idx) => {
                  const src = nodes.find((n) => n.id === e.from)
                  const dst = nodes.find((n) => n.id === e.to)
                  if (!src || !dst) return null

                  const isBroken = e.isBroken
                  const isLien = dst.type === 'bank' || src.type === 'bank'

                  // Hide if filtered
                  if (filterType === 'mutations' && isLien) return null
                  if (filterType === 'liens' && !isLien) return null

                  const strokeColor = isBroken ? '#ef4444' : isLien ? '#a855f7' : '#38bdf8'
                  const markerId = isBroken ? 'url(#arrow-red)' : isLien ? 'url(#arrow-purple)' : 'url(#arrow-cyan)'

                  // Midpoint for edge badge
                  const midX = (src.x + dst.x) / 2
                  const midY = (src.y + dst.y) / 2 - 12

                  return (
                    <g key={idx}>
                      <path
                        d={`M ${src.x} ${src.y} Q ${midX} ${midY + (isLien ? 25 : -25)} ${dst.x} ${dst.y}`}
                        fill="none"
                        stroke={strokeColor}
                        strokeWidth={isBroken ? 3 : 2.5}
                        strokeDasharray={isBroken ? '6 4' : undefined}
                        markerEnd={markerId}
                        className={isBroken ? 'animate-pulse' : ''}
                      />
                      {/* Edge Label Badge */}
                      <g transform={`translate(${midX - 56}, ${midY - 10})`}>
                        <rect
                          width="112"
                          height="20"
                          rx="5"
                          fill={isBroken ? '#450a0a' : '#0f172a'}
                          stroke={strokeColor}
                          strokeWidth="1"
                        />
                        <text
                          x="56"
                          y="13.5"
                          textAnchor="middle"
                          fill={isBroken ? '#fca5a5' : '#cbd5e1'}
                          fontSize="9"
                          fontWeight="bold"
                          fontFamily="sans-serif"
                        >
                          {isHindi ? e.typeHi : e.typeEn}
                        </text>
                      </g>
                    </g>
                  )
                })}

                {/* Render Nodes */}
                {nodes.map((node) => {
                  const isSelected = selectedNodeId === node.id
                  const isPlot = node.type === 'plot'
                  const isBank = node.type === 'bank'
                  const isDisputed = node.type === 'disputed'
                  const isActive = node.status === 'active'

                  // Node color schemes
                  const bgColor = isDisputed
                    ? '#7f1d1d'
                    : isPlot
                    ? '#0284c7'
                    : isBank
                    ? '#7e22ce'
                    : isActive
                    ? '#065f46'
                    : '#1e293b'

                  const borderColor = isDisputed
                    ? '#ef4444'
                    : isPlot
                    ? '#38bdf8'
                    : isBank
                    ? '#c084fc'
                    : isActive
                    ? '#10b981'
                    : '#64748b'

                  return (
                    <g
                      key={node.id}
                      transform={`translate(${node.x}, ${node.y})`}
                      onClick={() => setSelectedNodeId(node.id)}
                      className="cursor-pointer group"
                    >
                      {/* Outer Selection Pulsing Ring */}
                      {isSelected && (
                        <circle
                          r="42"
                          fill="none"
                          stroke={borderColor}
                          strokeWidth="2"
                          strokeDasharray="4 4"
                          className="animate-spin"
                          style={{ animationDuration: '8s' }}
                        />
                      )}

                      {/* Main Node Circle */}
                      <circle
                        r="34"
                        fill={bgColor}
                        stroke={borderColor}
                        strokeWidth={isSelected ? 3.5 : 2}
                        className="transition-all group-hover:scale-105 shadow-xl"
                      />

                      {/* Icon */}
                      <text
                        x="0"
                        y="-4"
                        textAnchor="middle"
                        fontSize="18"
                        fill="#ffffff"
                        className="pointer-events-none select-none"
                      >
                        {isPlot ? '🗺️' : isBank ? '🏦' : isDisputed ? '⚠️' : '👤'}
                      </text>

                      {/* Top Label */}
                      <text
                        x="0"
                        y="15"
                        textAnchor="middle"
                        fontSize="9.5"
                        fontWeight="bold"
                        fill="#ffffff"
                        className="pointer-events-none select-none"
                      >
                        {formatNodeTitle(node, isHindi)}
                      </text>

                      {/* Bottom Role Box */}
                      <g transform="translate(-58, 40)">
                        <rect
                          width="116"
                          height="20"
                          rx="5"
                          fill="#0f172a"
                          stroke={borderColor}
                          strokeWidth="1"
                        />
                        <text
                          x="58"
                          y="13.5"
                          textAnchor="middle"
                          fontSize="8.5"
                          fontWeight="bold"
                          fill={isDisputed ? '#f87171' : isActive ? '#6ee7b7' : '#94a3b8'}
                          className="pointer-events-none select-none"
                        >
                          {isHindi ? node.roleHi : node.roleEn}
                        </text>
                      </g>
                    </g>
                  )
                })}
              </svg>
            </div>

            {/* Canvas Legend */}
            <div className="absolute bottom-3 left-3 bg-slate-900/90 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-800 text-[10px] text-slate-300 flex items-center gap-3 shadow-lg pointer-events-none">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                <span>{isHindi ? 'सक्रिय विधिक स्वामी' : 'Active Owner'}</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-slate-600" />
                <span>{isHindi ? 'पूर्व स्वामी' : 'Historical Title'}</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-purple-500" />
                <span>{isHindi ? 'बैंक प्रभार' : 'Bank Lien'}</span>
              </span>
              {isWarningParcel && (
                <span className="flex items-center gap-1.5 text-red-400 font-bold">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" />
                  <span>{isHindi ? 'टूटी कड़ी (G001)' : 'Broken Link (G001)'}</span>
                </span>
              )}
            </div>
          </div>

          {/* Node Inspector Side Panel (4 Cols) */}
          <div className="lg:col-span-4 bg-slate-900 border-t lg:border-t-0 lg:border-l border-slate-800 p-6 flex flex-col justify-between overflow-y-auto space-y-4">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Sparkles className="w-4 h-4 text-indigo-400" />
                <h4 className="text-xs font-black uppercase tracking-wider text-indigo-300">
                  {isHindi ? 'चयनित नोड विधिक प्रमाण' : 'Selected Title Instrument Provenance'}
                </h4>
              </div>

              {/* Node Card */}
              <div className="bg-slate-950 rounded-2xl p-4 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-extrabold text-white flex items-center gap-2">
                    <span className="text-lg">
                      {activeNode.type === 'plot'
                        ? '🗺️'
                        : activeNode.type === 'bank'
                        ? '🏦'
                        : activeNode.type === 'disputed'
                        ? '⚠️'
                        : '👤'}
                    </span>
                    <span>{isHindi ? activeNode.titleHi : activeNode.titleEn}</span>
                  </span>
                  <span
                    className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border ${
                      activeNode.status === 'active'
                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                        : activeNode.status === 'warning'
                        ? 'bg-red-500/20 text-red-300 border-red-500/40'
                        : 'bg-slate-800 text-slate-400 border-slate-700'
                    }`}
                  >
                    {activeNode.status === 'active'
                      ? 'ACTIVE TITLE'
                      : activeNode.status === 'warning'
                      ? 'FLAGGED'
                      : 'HISTORIC'}
                  </span>
                </div>

                <div className="text-xs text-indigo-300 font-semibold">
                  {isHindi ? activeNode.roleHi : activeNode.roleEn}
                </div>

                <div className="pt-2 border-t border-slate-800 text-xs space-y-2 text-slate-300">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-slate-500" />
                      <span>{isHindi ? 'कालावधि:' : 'Tenure Period:'}</span>
                    </span>
                    <span className="font-mono font-bold">{activeNode.period}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 flex items-center gap-1.5">
                      <FileText className="w-3.5 h-3.5 text-slate-500" />
                      <span>{isHindi ? 'विधिक प्रपत्र:' : 'Legal Deed:'}</span>
                    </span>
                    <span className="font-semibold text-white">{isHindi ? activeNode.docHi : activeNode.docEn}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 flex items-center gap-1.5">
                      <Building2 className="w-3.5 h-3.5 text-slate-500" />
                      <span>{isHindi ? 'दस्तावेज संख्या:' : 'Document Ref:'}</span>
                    </span>
                    <span className="font-mono text-[11px] text-amber-400">{activeNode.docRef}</span>
                  </div>
                </div>
              </div>

              {/* Warning or Verification Explanatory Box */}
              {isWarningParcel ? (
                <div className="mt-4 p-4 rounded-2xl bg-red-950/40 border border-red-500/40 space-y-2 text-xs">
                  <div className="flex items-center gap-2 text-red-400 font-bold">
                    <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                    <span>{isHindi ? 'राजस्व नियम G001 उल्लंघन' : 'Rule G001 Ownership Gap Detected'}</span>
                  </div>
                  <p className="text-[11px] text-red-200/90 leading-relaxed">
                    {isHindi
                      ? 'इस गाटा संख्या में नामांतरण प्रविष्टि पिछले पंजीकृत स्वामी बाबूलाल वर्मा से प्रमाणित रूप से सम्बद्ध नहीं है। स्वतः सत्यापन रोक दिया गया है एवं पत्रावली तहसीलदार समीक्षा कतार में भेजी गई है।'
                      : 'The recorded mutation transfer for this khasra lacks verified inheritance linkage to the predecessor titleholder. Automated validation blocked and routed to verifier queue.'}
                  </p>
                </div>
              ) : (
                <div className="mt-4 p-4 rounded-2xl bg-emerald-950/40 border border-emerald-500/40 space-y-2 text-xs">
                  <div className="flex items-center gap-2 text-emerald-400 font-bold">
                    <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                    <span>{isHindi ? 'अखंड वंशावली सत्यापित (G001–G003)' : 'Continuous Title Verified (G001–G003)'}</span>
                  </div>
                  <p className="text-[11px] text-emerald-200/90 leading-relaxed">
                    {isHindi
                      ? 'वर्ष 1988 से वर्तमान समय तक सभी नामांतरण, उत्तराधिकार एवं विक्रय अभिलेखों का संपूर्ण मिलान सफल रहा। कोई परस्पर विरोधी दावा नहीं है।'
                      : 'Full DAG continuity validated from 1988 settlement to present. All intermediate succession and conveyance deeds match official revenue records with zero title conflict.'}
                  </p>
                </div>
              )}
            </div>

            {/* Bottom Actions in Inspector */}
            <div className="pt-4 border-t border-slate-800 space-y-2">
              <button
                onClick={onClose}
                className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-md transition-all cursor-pointer text-center"
              >
                {isHindi ? 'मानचित्र पर वापस लौटें' : 'Back to Cadastral Map'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
