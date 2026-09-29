import React, { useState, useEffect } from 'react'
import {
  Layers,
  Table as TableIcon,
  Stamp,
  PenTool,
  Map as MapIcon,
  FileText,
  Eye,
  EyeOff,
  Info,
} from 'lucide-react'
import { apiRequest } from '../api'

export interface LayoutRegion {
  id: string
  type: 'header' | 'table' | 'table_cell' | 'handwritten_block' | 'stamp' | 'signature' | 'map_region' | 'margin_note'
  bbox: [number, number, number, number] // [x0, y0, x1, y1]
  confidence: number
  label?: string
  properties?: Record<string, any>
}

export interface LayoutData {
  document_id: string
  page_no: number
  width: number
  height: number
  regions: LayoutRegion[]
  has_table: boolean
  has_map: boolean
  has_stamp: boolean
  has_signature: boolean
  has_handwritten_block: boolean
  table_cells_count: number
  script: string
  script_confidence?: number
  doc_type: string
  doc_type_confidence?: number
  quality_score?: number
}

interface LayoutOverlayProps {
  documentId: string
  pageNo: number
  imageUrl: string
}

const REGION_STYLES: Record<string, { border: string; bg: string; text: string; badge: string }> = {
  header: {
    border: 'border-purple-500',
    bg: 'bg-purple-500/15 hover:bg-purple-500/25',
    text: 'text-purple-700',
    badge: 'bg-purple-100 text-purple-800 border-purple-300',
  },
  table: {
    border: 'border-blue-600 border-2',
    bg: 'bg-blue-500/10 hover:bg-blue-500/20',
    text: 'text-blue-700',
    badge: 'bg-blue-100 text-blue-800 border-blue-300',
  },
  table_cell: {
    border: 'border-cyan-400/60',
    bg: 'bg-cyan-500/5 hover:bg-cyan-500/20',
    text: 'text-cyan-800',
    badge: 'bg-cyan-100 text-cyan-800 border-cyan-300',
  },
  handwritten_block: {
    border: 'border-pink-500',
    bg: 'bg-pink-500/15 hover:bg-pink-500/25',
    text: 'text-pink-700',
    badge: 'bg-pink-100 text-pink-800 border-pink-300',
  },
  stamp: {
    border: 'border-amber-500 border-2',
    bg: 'bg-amber-500/20 hover:bg-amber-500/30',
    text: 'text-amber-700',
    badge: 'bg-amber-100 text-amber-800 border-amber-300',
  },
  signature: {
    border: 'border-emerald-500 border-2',
    bg: 'bg-emerald-500/15 hover:bg-emerald-500/25',
    text: 'text-emerald-700',
    badge: 'bg-emerald-100 text-emerald-800 border-emerald-300',
  },
  map_region: {
    border: 'border-indigo-600 border-2',
    bg: 'bg-indigo-500/15 hover:bg-indigo-500/25',
    text: 'text-indigo-700',
    badge: 'bg-indigo-100 text-indigo-800 border-indigo-300',
  },
  margin_note: {
    border: 'border-slate-500',
    bg: 'bg-slate-500/15 hover:bg-slate-500/25',
    text: 'text-slate-700',
    badge: 'bg-slate-100 text-slate-800 border-slate-300',
  },
}

export const LayoutOverlay: React.FC<LayoutOverlayProps> = ({
  documentId,
  pageNo,
  imageUrl,
}) => {
  const [layout, setLayout] = useState<LayoutData | null>(null)
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const [hoveredRegion, setHoveredRegion] = useState<LayoutRegion | null>(null)
  const [selectedRegion, setSelectedRegion] = useState<LayoutRegion | null>(null)

  // Visibility filters
  const [visibleTypes, setVisibleTypes] = useState<Record<string, boolean>>({
    header: true,
    table: true,
    table_cell: true,
    handwritten_block: true,
    stamp: true,
    signature: true,
    map_region: true,
  })

  useEffect(() => {
    setLoading(true)
    apiRequest<LayoutData>(`/documents/${documentId}/pages/${pageNo}/layout`)
      .then((data) => {
        setLayout(data)
        setLoading(false)
      })
      .catch((err) => {
        setError(err.message || 'Failed to load layout data')
        setLoading(false)
      })
  }, [documentId, pageNo])

  const toggleType = (t: string) => {
    setVisibleTypes((prev) => ({ ...prev, [t]: !prev[t] }))
  }

  if (loading) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-amber-500 border-t-transparent mb-3" />
        <p className="text-slate-600 text-sm font-medium">Analyzing layout structure & detecting regions...</p>
      </div>
    )
  }

  if (error || !layout) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-center text-red-700 text-sm">
        <p className="font-semibold mb-1">Layout Analysis Not Available</p>
        <p className="text-xs text-red-600">{error || 'Could not fetch page layout'}</p>
      </div>
    )
  }

  const activeRegion = hoveredRegion || selectedRegion

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
      {/* Top Banner & Filter Controls */}
      <div className="bg-slate-50 border-b border-slate-200 p-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-100 rounded-xl text-indigo-700">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900">Document Layout & Structural Regions</h3>
            <p className="text-xs text-slate-500">
              Page {pageNo} · {layout.width} × {layout.height} px · {layout.regions.length} detected regions
            </p>
          </div>
        </div>

        {/* Badges for classified Doc Type & Script */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-indigo-50 border border-indigo-200 text-indigo-700">
            Type: <span className="font-bold uppercase tracking-wider">{layout.doc_type}</span>
          </span>
          <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-700">
            Script: <span className="font-bold capitalize">{layout.script}</span>
          </span>
        </div>
      </div>

      {/* Layer Filter Pills */}
      <div className="bg-slate-100/70 border-b border-slate-200 px-4 py-2 flex flex-wrap items-center gap-2 text-xs">
        <span className="font-semibold text-slate-500 mr-1">Layer Visibility:</span>
        {[
          { key: 'header', label: 'Header', icon: FileText, color: 'text-purple-700' },
          { key: 'table', label: 'Table Grid', icon: TableIcon, color: 'text-blue-700' },
          { key: 'table_cell', label: `Cells (${layout.table_cells_count})`, icon: TableIcon, color: 'text-cyan-700' },
          { key: 'stamp', label: 'Stamps', icon: Stamp, color: 'text-amber-700' },
          { key: 'signature', label: 'Signatures', icon: PenTool, color: 'text-emerald-700' },
          { key: 'map_region', label: 'Cadastral Map', icon: MapIcon, color: 'text-indigo-700' },
        ].map(({ key, label, icon: Icon, color }) => (
          <button
            key={key}
            onClick={() => toggleType(key)}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg font-medium transition-all ${
              visibleTypes[key]
                ? 'bg-white text-slate-800 shadow-xs border border-slate-300'
                : 'bg-slate-200/60 text-slate-400 border border-transparent'
            }`}
          >
            {visibleTypes[key] ? <Eye className="w-3.5 h-3.5 text-emerald-600" /> : <EyeOff className="w-3.5 h-3.5 text-slate-400" />}
            <Icon className="w-3.5 h-3.5" />
            <span className={visibleTypes[key] ? color : 'text-slate-400'}>{label}</span>
          </button>
        ))}
      </div>

      {/* Canvas Area with Relative Coordinates */}
      <div className="relative bg-slate-900 overflow-auto flex items-center justify-center p-4 min-h-[600px]">
        <div className="relative inline-block select-none shadow-2xl rounded-lg overflow-hidden border border-slate-700">
          <img
            src={imageUrl}
            alt="Page Layout"
            className="block max-h-[750px] w-auto max-w-full pointer-events-none"
          />

          {/* Overlaid Bounding Boxes */}
          {layout.regions.map((region) => {
            if (!visibleTypes[region.type]) return null

            const [x0, y0, x1, y1] = region.bbox
            const leftPct = (x0 / layout.width) * 100
            const topPct = (y0 / layout.height) * 100
            const widthPct = ((x1 - x0) / layout.width) * 100
            const heightPct = ((y1 - y0) / layout.height) * 100

            const styleCfg = REGION_STYLES[region.type] || REGION_STYLES.header
            const isHovered = hoveredRegion?.id === region.id
            const isSelected = selectedRegion?.id === region.id

            return (
              <div
                key={region.id}
                onMouseEnter={() => setHoveredRegion(region)}
                onMouseLeave={() => setHoveredRegion(null)}
                onClick={() => setSelectedRegion(region)}
                style={{
                  left: `${leftPct}%`,
                  top: `${topPct}%`,
                  width: `${widthPct}%`,
                  height: `${heightPct}%`,
                }}
                className={`absolute cursor-pointer border transition-all ${styleCfg.border} ${styleCfg.bg} ${
                  isSelected ? 'ring-2 ring-amber-400 ring-offset-1 z-30' : ''
                } ${isHovered ? 'z-20 shadow-md' : 'z-10'}`}
              >
                {/* Compact Region Label */}
                {region.type !== 'table_cell' && (
                  <span
                    className={`absolute -top-3 left-1 text-[10px] font-bold px-1.5 py-0.2 rounded shadow-xs uppercase tracking-wider ${styleCfg.badge}`}
                  >
                    {region.label || region.type}
                  </span>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Interactive Region Details Footer */}
      <div className="bg-slate-50 border-t border-slate-200 px-4 py-3 flex flex-wrap items-center justify-between gap-3 text-xs">
        {activeRegion ? (
          <div className="flex items-center gap-3">
            <span className={`px-2 py-0.5 rounded font-bold uppercase ${REGION_STYLES[activeRegion.type]?.badge || 'bg-slate-200'}`}>
              {activeRegion.type}
            </span>
            <span className="font-semibold text-slate-800">
              {activeRegion.label || activeRegion.id}
            </span>
            <span className="font-mono text-slate-500">
              Box: [{activeRegion.bbox.join(', ')}]
            </span>
            <span className="text-emerald-700 font-semibold">
              Conf: {Math.round(activeRegion.confidence * 100)}%
            </span>
            {activeRegion.properties && (
              <span className="text-slate-600 bg-white border border-slate-200 px-2 py-0.5 rounded font-mono text-[11px]">
                {JSON.stringify(activeRegion.properties)}
              </span>
            )}
          </div>
        ) : (
          <div className="flex items-center gap-2 text-slate-500">
            <Info className="w-4 h-4 text-slate-400" />
            <span>Hover or click any detected bounding box on the document to inspect coordinates and properties.</span>
          </div>
        )}

        <div className="text-slate-400 font-mono text-[11px]">
          Cell count: {layout.table_cells_count} | Tables: {layout.has_table ? 1 : 0} | Map: {layout.has_map ? 'Yes' : 'No'}
        </div>
      </div>
    </div>
  )
}
