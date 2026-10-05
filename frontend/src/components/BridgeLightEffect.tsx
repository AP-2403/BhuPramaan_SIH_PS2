import React, { useState } from 'react'
import { Sparkles, Sun, ShieldCheck, MapPin, Eye, Info, CheckCircle2 } from 'lucide-react'

interface Hotspot {
  id: string
  x: number // percentage
  y: number // percentage
  label: string
  badge: string
  description: string
  icon: typeof Sparkles
  color: 'amber' | 'emerald' | 'cyan' | 'purple'
}

export const BridgeLightEffect: React.FC = () => {
  const [lightIntensity, setLightIntensity] = useState<'radiant' | 'focused' | 'ambient'>('radiant')
  const [activeHotspot, setActiveHotspot] = useState<string | null>('bridge-seal')
  const [isHoveredOnSeal, setIsHoveredOnSeal] = useState(false)

  const hotspots: Hotspot[] = [
    {
      id: 'bridge-seal',
      x: 50.0,
      y: 22.8,
      label: 'BhuPramaan Verified Seal',
      badge: 'Neural Attestation',
      description: 'The official digital seal crowning the bridge gateway. Integrates SHA-256 cryptographic chaining, Dual-OCR agreement, and statutory rule validation.',
      icon: ShieldCheck,
      color: 'amber',
    },
    {
      id: 'bridge-arch',
      x: 50.0,
      y: 41.5,
      label: 'Public Gateway Arch',
      badge: 'Unified Access',
      description: '"Access Your Verified Land Records. Secure, Transparent, Efficient." Seamless public-facing portal for citizens, tehsildars, and revenue verifiers.',
      icon: CheckCircle2,
      color: 'emerald',
    },
    {
      id: 'drone-survey',
      x: 17.5,
      y: 54.0,
      label: 'Autonomous Cadastral Drones',
      badge: 'Spatial Orthophoto',
      description: 'Continuous aerial ground boundary triangulation ensuring zero discrepancies between physical land holdings and registered textual deeds.',
      icon: Sparkles,
      color: 'cyan',
    },
    {
      id: 'vector-gis',
      x: 62.0,
      y: 73.0,
      label: 'PostGIS Cadastral GIS Vector',
      badge: 'Sub-Decimeter Vector',
      description: 'Interactive geodesic polygon overlay. Validates plot boundaries, area summation (Rule A001), and deed-to-geometry tolerance (Rule X002 <= 10%).',
      icon: MapPin,
      color: 'purple',
    },
  ]

  const activeSpotData = hotspots.find((h) => h.id === activeHotspot)

  return (
    <div className="relative w-full rounded-3xl overflow-hidden shadow-2xl border border-amber-500/30 bg-slate-950 group select-none">
      {/* Top Glass Floating Status Header */}
      <div className="absolute top-4 left-4 right-4 z-30 flex flex-wrap items-center justify-between gap-3 pointer-events-none">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-950/75 border border-amber-400/40 text-amber-300 text-xs font-semibold backdrop-blur-md shadow-lg pointer-events-auto">
          <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
          <span className="tracking-wide">AI Verified Cadastral Ecosystem</span>
        </div>

        {/* Light Control Pill */}
        <div className="inline-flex items-center p-1 rounded-xl bg-slate-950/80 border border-slate-700/80 backdrop-blur-md shadow-lg pointer-events-auto">
          <button
            onClick={() => setLightIntensity('radiant')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
              lightIntensity === 'radiant'
                ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sun className="w-3 h-3" />
            <span>Radiant Light</span>
          </button>
          <button
            onClick={() => setLightIntensity('focused')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
              lightIntensity === 'focused'
                ? 'bg-amber-500 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sparkles className="w-3 h-3" />
            <span>Spotlight</span>
          </button>
          <button
            onClick={() => setLightIntensity('ambient')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
              lightIntensity === 'ambient'
                ? 'bg-slate-800 text-amber-300 shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Eye className="w-3 h-3" />
            <span>Clean View</span>
          </button>
        </div>
      </div>

      {/* Main Artwork Container */}
      <div className="relative aspect-[16/9] w-full overflow-hidden bg-slate-950">
        <img
          src="/background/main_image.png"
          alt="BhuPramaan Smart Rural Governance & Land Verification Portal"
          className="w-full h-full object-cover object-center transform transition-transform duration-1000 ease-out group-hover:scale-[1.02]"
        />

        {/* Base Atmospheric Vignette & Soft Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-slate-950/40 pointer-events-none" />

        {/* ─── DYNAMIC LIGHTING HIGHLIGHT ON BRIDGE EMBLEM (Top: 22.8%, Left: 50.0%) ─── */}
        {lightIntensity !== 'ambient' && (
          <div
            className="absolute z-20 pointer-events-none"
            style={{ left: '50.0%', top: '22.8%' }}
          >
            {/* Luminous Light Halo Background Aura */}
            <div
              className={`absolute -translate-x-1/2 -translate-y-1/2 rounded-full pointer-events-none transition-all duration-700 ${
                lightIntensity === 'radiant' || isHoveredOnSeal
                  ? 'w-72 h-72 sm:w-96 sm:h-96 bg-radial from-amber-300/45 via-amber-500/20 to-transparent blur-2xl opacity-100'
                  : 'w-48 h-48 sm:w-64 sm:h-64 bg-radial from-amber-400/30 via-amber-500/10 to-transparent blur-xl opacity-75'
              }`}
            />

            {/* Cyan Accent Radiance for Modern High-Tech Feel */}
            <div
              className="absolute -translate-x-1/2 -translate-y-1/2 w-48 h-48 sm:w-64 sm:h-64 rounded-full pointer-events-none bg-radial from-cyan-400/25 via-blue-500/10 to-transparent blur-xl animate-cyan-pulse"
            />

            {/* Expanding Concentric Luminous Light Rings */}
            <div className="absolute -translate-x-1/2 -translate-y-1/2 w-28 h-28 sm:w-40 sm:h-40 rounded-full border border-amber-300/80 animate-ring-pulse-1 pointer-events-none" />
            <div className="absolute -translate-x-1/2 -translate-y-1/2 w-28 h-28 sm:w-40 sm:h-40 rounded-full border border-amber-400/60 animate-ring-pulse-2 pointer-events-none" />
            <div className="absolute -translate-x-1/2 -translate-y-1/2 w-28 h-28 sm:w-40 sm:h-40 rounded-full border border-cyan-400/50 animate-ring-pulse-3 pointer-events-none" />

            {/* Vertical Radiant Pillar / Sunbeam Shimmering Down Toward the Bridge Arch */}
            <div
              className={`absolute -translate-x-1/2 top-4 w-40 sm:w-56 h-48 sm:h-64 pointer-events-none bg-gradient-to-b from-amber-300/35 via-amber-400/15 to-transparent blur-md transform -skew-x-1 animate-beam-glow ${
                lightIntensity === 'radiant' ? 'opacity-90' : 'opacity-50'
              }`}
            />

            {/* Rotating Subtle Conic Rays */}
            <div
              className="absolute -translate-x-1/2 -translate-y-1/2 w-64 h-64 sm:w-80 sm:h-80 rounded-full opacity-35 animate-conic-rays pointer-events-none"
              style={{
                background: 'conic-gradient(from 0deg, transparent 0deg, rgba(251, 191, 36, 0.4) 30deg, transparent 60deg, rgba(56, 189, 248, 0.3) 120deg, transparent 150deg, rgba(251, 191, 36, 0.4) 210deg, transparent 240deg, rgba(56, 189, 248, 0.3) 300deg, transparent 330deg)',
              }}
            />

            {/* Interactive Pulse Target over the Seal */}
            <div
              onMouseEnter={() => {
                setIsHoveredOnSeal(true)
                setActiveHotspot('bridge-seal')
              }}
              onMouseLeave={() => setIsHoveredOnSeal(false)}
              onClick={() => setActiveHotspot('bridge-seal')}
              className="absolute -translate-x-1/2 -translate-y-1/2 w-24 h-24 sm:w-32 sm:h-32 rounded-full cursor-pointer pointer-events-auto group/seal flex items-center justify-center"
              title="Click to inspect the BhuPramaan Verified Land Record seal"
            >
              {/* Central Glowing Core Badge on Top of the Bridge */}
              <div className="relative flex items-center justify-center">
                <span className="absolute w-6 h-6 rounded-full bg-amber-400 animate-ping opacity-75" />
                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-amber-500 via-amber-300 to-white p-0.5 shadow-[0_0_25px_rgba(245,158,11,1)] group-hover/seal:scale-115 transition-transform duration-300 flex items-center justify-center">
                  <div className="w-full h-full rounded-full bg-slate-950 flex items-center justify-center">
                    <ShieldCheck className="w-5 h-5 text-amber-300" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ─── HOTSPOT MARKERS ACROSS THE LANDSCAPE ─── */}
        {hotspots.map((spot) => {
          if (spot.id === 'bridge-seal') return null // Handled with dedicated rich lighting above
          const isSelected = activeHotspot === spot.id
          const Icon = spot.icon

          return (
            <button
              key={spot.id}
              onClick={() => setActiveHotspot(spot.id)}
              style={{ left: `${spot.x}%`, top: `${spot.y}%` }}
              className={`absolute -translate-x-1/2 -translate-y-1/2 z-20 group/marker cursor-pointer focus:outline-none transition-all duration-300 ${
                isSelected ? 'scale-125 z-30' : 'hover:scale-110 opacity-90'
              }`}
              title={spot.label}
            >
              <div className="relative flex items-center justify-center">
                {isSelected && (
                  <span className="absolute w-8 h-8 rounded-full bg-amber-400/40 animate-ping" />
                )}
                <div className="w-8 h-8 rounded-full bg-slate-950/85 backdrop-blur-md border border-white/40 shadow-xl flex items-center justify-center group-hover/marker:border-amber-400 transition-colors">
                  <Icon className="w-4 h-4 text-amber-300" />
                </div>
              </div>
            </button>
          )
        })}

        {/* ─── ACTIVE HOTSPOT INFO CARD (Bottom Overlay) ─── */}
        {activeSpotData && (
          <div className="absolute bottom-4 left-4 right-4 z-30 pointer-events-auto">
            <div className="max-w-2xl mx-auto p-4 rounded-2xl bg-slate-950/85 backdrop-blur-xl border border-white/20 shadow-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 animate-float-subtle">
              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-extrabold text-white tracking-wide flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                    {activeSpotData.label}
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-400/30">
                    {activeSpotData.badge}
                  </span>
                </div>
                <p className="text-[11px] sm:text-xs text-slate-300 leading-relaxed max-w-xl">
                  {activeSpotData.description}
                </p>
              </div>

              <div className="flex items-center gap-2 flex-shrink-0 self-end sm:self-center">
                <span className="text-[10px] text-slate-400 font-mono hidden sm:inline">
                  Interactive Landmark
                </span>
                <div className="w-7 h-7 rounded-lg bg-amber-500/20 border border-amber-400/40 text-amber-300 flex items-center justify-center">
                  <Info className="w-3.5 h-3.5" />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Information & Feature Highlights Bar */}
      <div className="bg-slate-900/90 border-t border-slate-800 px-6 py-3.5 flex flex-wrap items-center justify-between gap-4 text-xs">
        <div className="flex items-center gap-3 text-slate-400">
          <span className="font-bold text-slate-200">Department of Land Resources (DoLR)</span>
          <span>·</span>
          <span>Digital India Land Records Modernization Programme (DILRMP)</span>
        </div>

        <div className="flex items-center gap-4 text-[11px] font-semibold text-amber-400/90">
          <span className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            17 Statutory Rules Active
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
            PostGIS Parcel Vector Alignment
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
            SHA-256 Ledger Provenance
          </span>
        </div>
      </div>
    </div>
  )
}
