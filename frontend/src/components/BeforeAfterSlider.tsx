import React, { useState, useRef, useCallback, useEffect } from 'react'
import { ZoomIn, ZoomOut, RotateCcw, Columns, SplitSquareVertical } from 'lucide-react'

interface BeforeAfterSliderProps {
  originalUrl: string
  restoredUrl: string
  binaryUrl?: string
  noStampUrl?: string
  title?: string
  altText?: string
}

export const BeforeAfterSlider: React.FC<BeforeAfterSliderProps> = ({
  originalUrl,
  restoredUrl,
  binaryUrl,
  noStampUrl,
  title = 'Image Restoration Comparison',
  altText = 'Document Image',
}) => {
  const [sliderPos, setSliderPos] = useState<number>(50) // percentage 0 - 100
  const [isDragging, setIsDragging] = useState<boolean>(false)
  const [afterVariant, setAfterVariant] = useState<'restored' | 'binary' | 'no_stamp'>('restored')
  const [viewMode, setViewMode] = useState<'slider' | 'sideBySide'>('slider')
  const [zoomLevel, setZoomLevel] = useState<number>(1.0)
  const containerRef = useRef<HTMLDivElement>(null)

  const activeAfterUrl =
    afterVariant === 'binary' && binaryUrl
      ? binaryUrl
      : afterVariant === 'no_stamp' && noStampUrl
      ? noStampUrl
      : restoredUrl

  const handleMove = useCallback((clientX: number) => {
    if (!containerRef.current) return
    const rect = containerRef.current.getBoundingClientRect()
    const x = clientX - rect.left
    const percent = Math.max(0, Math.min(100, (x / rect.width) * 100))
    setSliderPos(percent)
  }, [])

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (isDragging && e.touches.length > 0) {
      handleMove(e.touches[0].clientX)
    }
  }, [isDragging, handleMove])

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (isDragging) {
      handleMove(e.clientX)
    }
  }, [isDragging, handleMove])

  useEffect(() => {
    const handleMouseUp = () => setIsDragging(false)
    window.addEventListener('mouseup', handleMouseUp)
    window.addEventListener('touchend', handleMouseUp)
    return () => {
      window.removeEventListener('mouseup', handleMouseUp)
      window.removeEventListener('touchend', handleMouseUp)
    }
  }, [])

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
      {/* Control Toolbar */}
      <div className="bg-slate-50 border-b border-slate-200 px-4 py-3 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="font-semibold text-slate-800 text-sm">{title}</span>
          {/* Variant Selector */}
          <div className="flex bg-slate-200 p-0.5 rounded-lg text-xs font-medium text-slate-600">
            <button
              onClick={() => setAfterVariant('restored')}
              className={`px-2.5 py-1 rounded-md transition-all ${
                afterVariant === 'restored' ? 'bg-white text-slate-900 shadow-sm font-semibold' : 'hover:text-slate-900'
              }`}
            >
              Restored (CLAHE)
            </button>
            {binaryUrl && (
              <button
                onClick={() => setAfterVariant('binary')}
                className={`px-2.5 py-1 rounded-md transition-all ${
                  afterVariant === 'binary' ? 'bg-white text-slate-900 shadow-sm font-semibold' : 'hover:text-slate-900'
                }`}
              >
                Sauvola Binary (OCR)
              </button>
            )}
            {noStampUrl && (
              <button
                onClick={() => setAfterVariant('no_stamp')}
                className={`px-2.5 py-1 rounded-md transition-all ${
                  afterVariant === 'no_stamp' ? 'bg-white text-slate-900 shadow-sm font-semibold' : 'hover:text-slate-900'
                }`}
              >
                No Stamp
              </button>
            )}
          </div>
        </div>

        {/* View mode & Zoom tools */}
        <div className="flex items-center gap-2 text-xs">
          <button
            onClick={() => setViewMode(viewMode === 'slider' ? 'sideBySide' : 'slider')}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 font-medium text-slate-700"
          >
            {viewMode === 'slider' ? (
              <>
                <Columns className="w-3.5 h-3.5" />
                <span>Side by Side</span>
              </>
            ) : (
              <>
                <SplitSquareVertical className="w-3.5 h-3.5" />
                <span>Split Slider</span>
              </>
            )}
          </button>

          <div className="flex items-center border border-slate-300 rounded-lg bg-white overflow-hidden">
            <button
              onClick={() => setZoomLevel((z) => Math.max(0.6, z - 0.2))}
              className="p-1.5 hover:bg-slate-100 text-slate-600"
              title="Zoom Out"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <span className="px-2 font-mono text-[11px] text-slate-600 border-x border-slate-200">
              {Math.round(zoomLevel * 100)}%
            </span>
            <button
              onClick={() => setZoomLevel((z) => Math.min(2.5, z + 0.2))}
              className="p-1.5 hover:bg-slate-100 text-slate-600"
              title="Zoom In"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setZoomLevel(1.0)}
              className="p-1.5 hover:bg-slate-100 text-slate-600 border-l border-slate-200"
              title="Reset Zoom"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Comparison Canvas */}
      <div className="relative bg-slate-900 flex-1 min-h-[500px] overflow-auto flex items-center justify-center p-4">
        {viewMode === 'sideBySide' ? (
          <div className="grid grid-cols-2 gap-4 w-full max-w-6xl">
            {/* Left: Original */}
            <div className="flex flex-col items-center">
              <div className="bg-red-500/20 text-red-300 text-xs px-2.5 py-0.5 rounded-full mb-2 font-mono border border-red-500/40">
                Original (Degraded)
              </div>
              <div
                className="overflow-hidden rounded-lg shadow-xl border border-slate-700 bg-black flex items-center justify-center"
                style={{ transform: `scale(${zoomLevel})`, transformOrigin: 'top center' }}
              >
                <img src={originalUrl} alt={`Original ${altText}`} className="max-h-[600px] object-contain" />
              </div>
            </div>

            {/* Right: Restored */}
            <div className="flex flex-col items-center">
              <div className="bg-emerald-500/20 text-emerald-300 text-xs px-2.5 py-0.5 rounded-full mb-2 font-mono border border-emerald-500/40">
                {afterVariant === 'binary' ? 'Sauvola Binarized' : 'Restored (Deskew + CLAHE)'}
              </div>
              <div
                className="overflow-hidden rounded-lg shadow-xl border border-slate-700 bg-black flex items-center justify-center"
                style={{ transform: `scale(${zoomLevel})`, transformOrigin: 'top center' }}
              >
                <img src={activeAfterUrl} alt={`Restored ${altText}`} className="max-h-[600px] object-contain" />
              </div>
            </div>
          </div>
        ) : (
          /* Split Slider Mode */
          <div
            ref={containerRef}
            onMouseDown={() => setIsDragging(true)}
            onMouseMove={handleMouseMove}
            onTouchStart={() => setIsDragging(true)}
            onTouchMove={handleTouchMove}
            className="relative select-none cursor-ew-resize overflow-hidden rounded-lg shadow-2xl border border-slate-700"
            style={{
              transform: `scale(${zoomLevel})`,
              transformOrigin: 'center center',
            }}
          >
            {/* Bottom Layer: Restored (After) */}
            <img
              src={activeAfterUrl}
              alt={`Restored ${altText}`}
              className="block max-h-[650px] w-auto max-w-full pointer-events-none"
            />

            {/* Top Layer: Original (Before) clipped to sliderPos */}
            <div
              className="absolute inset-0 overflow-hidden pointer-events-none"
              style={{
                clipPath: `inset(0 ${100 - sliderPos}% 0 0)`,
              }}
            >
              <img
                src={originalUrl}
                alt={`Original ${altText}`}
                className="block max-h-[650px] w-auto max-w-full pointer-events-none"
              />
            </div>

            {/* Divider Line & Handle */}
            <div
              className="absolute top-0 bottom-0 w-0.5 bg-amber-400 pointer-events-none shadow-[0_0_10px_rgba(245,158,11,0.8)]"
              style={{ left: `${sliderPos}%` }}
            >
              <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-amber-500 text-white flex items-center justify-center shadow-lg border-2 border-white text-xs font-bold pointer-events-auto cursor-ew-resize">
                ⇄
              </div>
            </div>

            {/* Floating Labels */}
            <div className="absolute top-3 left-3 bg-black/75 backdrop-blur-md text-red-300 text-[11px] font-semibold px-2.5 py-1 rounded-md border border-red-500/30 pointer-events-none">
              Original (Before)
            </div>
            <div className="absolute top-3 right-3 bg-black/75 backdrop-blur-md text-emerald-300 text-[11px] font-semibold px-2.5 py-1 rounded-md border border-emerald-500/30 pointer-events-none">
              Restored (After)
            </div>
          </div>
        )}
      </div>

      {/* Interactive Helper Footer */}
      <div className="bg-slate-100 border-t border-slate-200 px-4 py-2 text-xs text-slate-500 flex justify-between items-center">
        <span>💡 Drag slider to compare degraded scan with enhanced output.</span>
        <span className="font-mono text-[11px] text-slate-600">
          Showing: {sliderPos.toFixed(0)}% Original / {(100 - sliderPos).toFixed(0)}% Restored
        </span>
      </div>
    </div>
  )
}
