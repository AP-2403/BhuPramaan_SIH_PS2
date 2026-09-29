import React, { useState, useEffect, useRef, useCallback } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import {
  ChevronRight,
  ChevronLeft,
  X,
  Sparkles,
  CheckCircle2,
  Video,
  RotateCcw,
  Target,
  Compass,
  Layers,
  ArrowLeftRight,
  Play,
  Square,
  Mic,
  Volume2,
} from 'lucide-react'
import { login, type User } from '../api'

// ─── Audio helpers ────────────────────────────────────────────────────────────
// Files live in: frontend/public/audio/tour/
// Naming: step_01.mp3 … step_19.mp3, complete.mp3
// .wav is also accepted – the player tries .mp3 first then .wav automatically
const getAudioSrc = (stepIdx: number | 'complete'): string => {
  if (stepIdx === 'complete') return '/audio/tour/complete.m4a'
  const num = String(stepIdx + 1).padStart(2, '0')
  return `/audio/tour/step_${num}.m4a`
}

interface AutoTourGuideProps {
  active: boolean
  onClose: () => void
  currentUser: User | null
  onUserChange: (user: User | null) => void
}

interface StepConfig {
  step: number
  route: string
  role: string
  targetSelector: string
  tabButtonId?: string
  preferredSide?: 'left' | 'right' | 'bottom' | 'top'
  badgeColor: string
}

export const TOUR_STEPS_CONFIG: StepConfig[] = [
  // Page 1: Login & Security
  {
    step: 1,
    route: '/login',
    role: 'tehsil_operator',
    targetSelector: '#login-roles-grid',
    preferredSide: 'left',
    badgeColor: 'border-amber-500/40 text-amber-300 bg-amber-500/10',
  },
  {
    step: 2,
    route: '/login',
    role: 'tehsil_operator',
    targetSelector: '#login-form-card',
    preferredSide: 'right',
    badgeColor: 'border-amber-500/40 text-amber-300 bg-amber-500/10',
  },
  // Page 2: Ingestion & Upload
  {
    step: 3,
    route: '/upload',
    role: 'tehsil_operator',
    targetSelector: '#upload-dropzone',
    preferredSide: 'right',
    badgeColor: 'border-amber-500/40 text-amber-300 bg-amber-500/10',
  },
  {
    step: 4,
    route: '/upload',
    role: 'tehsil_operator',
    targetSelector: '#sample-docs-grid',
    preferredSide: 'right',
    badgeColor: 'border-amber-500/40 text-amber-300 bg-amber-500/10',
  },
  {
    step: 5,
    route: '/upload',
    role: 'tehsil_operator',
    targetSelector: '#pipeline-stepper-card',
    preferredSide: 'left', // Crucial: Stepper is on the right, card goes on LEFT!
    badgeColor: 'border-amber-500/40 text-amber-300 bg-amber-500/10',
  },
  // Page 3: Document Detail & Neural Inspection
  {
    step: 6,
    route: '/documents/54b54348-0219-416e-ba88-9ed8dabe54da',
    role: 'tehsil_operator',
    targetSelector: '#before-after-slider',
    tabButtonId: '#tab-compare-btn',
    preferredSide: 'left', // Keep slider & deed comparison completely unobstructed
    badgeColor: 'border-indigo-500/40 text-indigo-300 bg-indigo-500/10',
  },
  {
    step: 7,
    route: '/documents/54b54348-0219-416e-ba88-9ed8dabe54da',
    role: 'tehsil_operator',
    targetSelector: '#doc-layout-viewer',
    tabButtonId: '#tab-layout-btn',
    preferredSide: 'left', // Keep layout bounding boxes view unobstructed
    badgeColor: 'border-indigo-500/40 text-indigo-300 bg-indigo-500/10',
  },
  {
    step: 8,
    route: '/documents/54b54348-0219-416e-ba88-9ed8dabe54da',
    role: 'tehsil_operator',
    targetSelector: '#extraction-table-card',
    tabButtonId: '#tab-extraction-btn',
    preferredSide: 'right', // Table data on left, card docks on right
    badgeColor: 'border-emerald-500/40 text-emerald-300 bg-emerald-500/10',
  },
  {
    step: 9,
    route: '/documents/54b54348-0219-416e-ba88-9ed8dabe54da',
    role: 'tehsil_operator',
    targetSelector: '#validation-rules-card',
    tabButtonId: '#tab-validation-btn',
    preferredSide: 'right', // Rules report on left, card docks on right
    badgeColor: 'border-emerald-500/40 text-emerald-300 bg-emerald-500/10',
  },
  // Page 4: Human-in-the-Loop Review Queue
  {
    step: 10,
    route: '/review',
    role: 'verifier',
    targetSelector: '#review-queue-list',
    preferredSide: 'right', // Queue list items on left, card docks on right
    badgeColor: 'border-indigo-500/40 text-indigo-300 bg-indigo-500/10',
  },
  {
    step: 11,
    route: '/review',
    role: 'verifier',
    targetSelector: '#review-filter-bar',
    preferredSide: 'bottom',
    badgeColor: 'border-indigo-500/40 text-indigo-300 bg-indigo-500/10',
  },
  // Page 5: Cadastral Vector GIS & Geodesics
  {
    step: 12,
    route: '/map',
    role: 'district_officer',
    targetSelector: '#cadastral-map-svg',
    preferredSide: 'right', // Map is on the left, card goes on RIGHT!
    badgeColor: 'border-cyan-500/40 text-cyan-300 bg-cyan-500/10',
  },
  {
    step: 13,
    route: '/map',
    role: 'district_officer',
    targetSelector: '#parcel-inspector-card',
    preferredSide: 'left', // Inspector is on the right, card goes on LEFT!
    badgeColor: 'border-cyan-500/40 text-cyan-300 bg-cyan-500/10',
  },
  // Page 6: Executive Analytics & Throughput
  {
    step: 14,
    route: '/dashboard',
    role: 'state_officer',
    targetSelector: '#dashboard-kpis',
    preferredSide: 'bottom',
    badgeColor: 'border-purple-500/40 text-purple-300 bg-purple-500/10',
  },
  {
    step: 15,
    route: '/dashboard',
    role: 'state_officer',
    targetSelector: '#tehsil-table-card',
    preferredSide: 'top',
    badgeColor: 'border-purple-500/40 text-purple-300 bg-purple-500/10',
  },
  // Page 7: Citizen Public Registry & Identity Protection
  {
    step: 16,
    route: '/records',
    role: 'citizen',
    targetSelector: '#records-search-bar',
    preferredSide: 'bottom',
    badgeColor: 'border-emerald-500/40 text-emerald-300 bg-emerald-500/10',
  },
  {
    step: 17,
    route: '/records',
    role: 'citizen',
    targetSelector: '#records-cards-list',
    preferredSide: 'top',
    badgeColor: 'border-emerald-500/40 text-emerald-300 bg-emerald-500/10',
  },
  // Page 8: Active Learning & Cryptographic Audit
  {
    step: 18,
    route: '/learning',
    role: 'admin',
    targetSelector: '#learning-retrain-card',
    preferredSide: 'bottom',
    badgeColor: 'border-rose-500/40 text-rose-300 bg-rose-500/10',
  },
  {
    step: 19,
    route: '/audit',
    role: 'admin',
    targetSelector: '#audit-seal-banner',
    preferredSide: 'bottom',
    badgeColor: 'border-emerald-500/40 text-emerald-300 bg-emerald-500/10',
  },
]

export const AutoTourGuide: React.FC<AutoTourGuideProps> = ({
  active,
  onClose,
  currentUser,
  onUserChange,
}) => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const location = useLocation()

  const [currentStepIdx, setCurrentStepIdx] = useState(0)
  const [isCompleted, setIsCompleted] = useState(false)
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null)
  const [isTargetVisible, setIsTargetVisible] = useState(false)
  const [dockFlipped, setDockFlipped] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const [audioMissing, setAudioMissing] = useState(false)

  const checkTargetIntervalRef = useRef<number | null>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const audioCtxRef = useRef<AudioContext | null>(null)
  const gainNodeRef = useRef<GainNode | null>(null)
  const [gainBoost, setGainBoost] = useState<number>(1.5)

  // ── Web Audio API Gain Node initialization ────────────────────────────────
  const setupWebAudio = useCallback((audio: HTMLAudioElement) => {
    try {
      if (!audioCtxRef.current) {
        const AudioCtxClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
        if (AudioCtxClass) {
          const ctx = new AudioCtxClass()
          const gain = ctx.createGain()
          gain.gain.value = gainBoost
          const source = ctx.createMediaElementSource(audio)
          source.connect(gain)
          gain.connect(ctx.destination)
          audioCtxRef.current = ctx
          gainNodeRef.current = gain
        }
      }
      if (audioCtxRef.current && audioCtxRef.current.state === 'suspended') {
        audioCtxRef.current.resume()
      }
    } catch {
      // Audio element already wired to media element source or context active
    }
  }, [gainBoost])

  // Update gain node whenever user changes boost setting
  useEffect(() => {
    if (gainNodeRef.current && audioCtxRef.current) {
      gainNodeRef.current.gain.setValueAtTime(gainBoost, audioCtxRef.current.currentTime)
    }
  }, [gainBoost])

  // ── Local audio player ───────────────────────────────────────────────────
  const playAudio = useCallback((stepIdx: number | 'complete') => {
    const src = getAudioSrc(stepIdx)
    if (!audioRef.current) {
      audioRef.current = new Audio()
    }
    const audio = audioRef.current
    audio.pause()
    audio.src = src
    audio.load()
    setupWebAudio(audio)
    setAudioMissing(false)
    const playPromise = audio.play()
    if (playPromise !== undefined) {
      playPromise
        .then(() => setIsPlaying(true))
        .catch(() => {
          // File not found or playback blocked — silent fail
          setIsPlaying(false)
          setAudioMissing(true)
        })
    }
    audio.onended = () => setIsPlaying(false)
    audio.onerror = () => { setIsPlaying(false); setAudioMissing(true) }
  }, [setupWebAudio])

  const stopAudio = useCallback(() => {
    audioRef.current?.pause()
    if (audioRef.current) audioRef.current.currentTime = 0
    setIsPlaying(false)
  }, [])

  const togglePlayback = useCallback(() => {
    if (isPlaying) {
      stopAudio()
    } else {
      playAudio(isCompleted ? 'complete' : currentStepIdx)
    }
  }, [isPlaying, isCompleted, currentStepIdx, playAudio, stopAudio])

  // Close: stop audio
  const handleClose = () => {
    stopAudio()
    onClose()
  }

  // Stop audio when tour deactivates
  useEffect(() => {
    if (!active) stopAudio()
  }, [active, stopAudio])

  // Reset when activated
  useEffect(() => {
    if (active) {
      setCurrentStepIdx(0)
      setIsCompleted(false)
      setDockFlipped(false)
      setIsPlaying(false)
      setAudioMissing(false)
      executeStep(0)
    } else {
      if (checkTargetIntervalRef.current) {
        clearInterval(checkTargetIntervalRef.current)
      }
      setTargetRect(null)
      setIsTargetVisible(false)
    }
  }, [active])

  // Update rect on scroll and resize
  const updateRect = useCallback(() => {
    if (isCompleted || !active) return
    const stepConfig = TOUR_STEPS_CONFIG[currentStepIdx]
    if (!stepConfig) return

    const el = document.querySelector(stepConfig.targetSelector)
    if (el) {
      const rect = el.getBoundingClientRect()
      setTargetRect(rect)
      setIsTargetVisible(true)
    } else {
      setTargetRect(null)
      setIsTargetVisible(false)
    }
  }, [active, isCompleted, currentStepIdx])

  useEffect(() => {
    window.addEventListener('scroll', updateRect, { passive: true })
    window.addEventListener('resize', updateRect, { passive: true })
    return () => {
      window.removeEventListener('scroll', updateRect)
      window.removeEventListener('resize', updateRect)
    }
  }, [updateRect])

  // Keyboard navigation: ArrowRight / ArrowLeft / Escape
  useEffect(() => {
    if (!active) return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') {
        e.preventDefault()
        handleNext()
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault()
        handlePrev()
      } else if (e.key === 'Escape') {
        e.preventDefault()
        handleClose()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [active, currentStepIdx, isCompleted])

  // Execute a specific step: auto-switches role if needed, navigates to target route, clicks tabs, scrolls into view
  const executeStep = async (idx: number) => {
    // Stop current audio when moving between steps
    stopAudio()
    setAudioMissing(false)

    if (idx >= TOUR_STEPS_CONFIG.length) {
      setIsCompleted(true)
      setTargetRect(null)
      setIsTargetVisible(false)
      return
    }

    setDockFlipped(false)
    const targetStep = TOUR_STEPS_CONFIG[idx]

    // Switch role if different
    if (currentUser?.role !== targetStep.role) {
      try {
        const switched = await login(targetStep.role)
        onUserChange(switched)
      } catch (e) {
        console.error('AutoTour: role switch error', e)
      }
    }

    // Navigate to route if different
    if (location.pathname !== targetStep.route) {
      navigate(targetStep.route)
    }

    // Poll for the target element to mount, click any needed tab, and scroll it into view
    if (checkTargetIntervalRef.current) {
      clearInterval(checkTargetIntervalRef.current)
    }

    let attempts = 0
    checkTargetIntervalRef.current = window.setInterval(() => {
      attempts++

      // Click tab button if configured
      if (targetStep.tabButtonId) {
        const tabBtn = document.querySelector(targetStep.tabButtonId) as HTMLButtonElement | null
        if (tabBtn) tabBtn.click()
      }

      const targetEl = document.querySelector(targetStep.targetSelector)
      if (targetEl) {
        if (checkTargetIntervalRef.current) clearInterval(checkTargetIntervalRef.current)
        const initialRect = targetEl.getBoundingClientRect()
        const viewportH = typeof window !== 'undefined' ? window.innerHeight : 800
        if (initialRect.height > viewportH * 0.7) {
          targetEl.scrollIntoView({ behavior: 'smooth', block: 'start' })
        } else {
          targetEl.scrollIntoView({ behavior: 'smooth', block: 'center' })
        }
        setTimeout(() => {
          const rect = targetEl.getBoundingClientRect()
          setTargetRect(rect)
          setIsTargetVisible(true)
          // Auto-play user voiceover for this step
          playAudio(idx)
        }, 200)
      } else if (attempts > 15) {
        if (checkTargetIntervalRef.current) clearInterval(checkTargetIntervalRef.current)
        setTargetRect(null)
        setIsTargetVisible(false)
        playAudio(idx)
      }
    }, 120)
  }

  // Navigation handlers
  const handleNext = () => {
    if (currentStepIdx < TOUR_STEPS_CONFIG.length - 1) {
      const nextIdx = currentStepIdx + 1
      setCurrentStepIdx(nextIdx)
      executeStep(nextIdx)
    } else {
      stopAudio()
      setIsCompleted(true)
      setTargetRect(null)
      setIsTargetVisible(false)
      // Auto-play completion audio
      setTimeout(() => playAudio('complete'), 400)
    }
  }

  const handlePrev = () => {
    if (currentStepIdx > 0) {
      const prevIdx = currentStepIdx - 1
      setCurrentStepIdx(prevIdx)
      executeStep(prevIdx)
    }
  }

  const handleRestart = () => {
    setCurrentStepIdx(0)
    setIsCompleted(false)
    executeStep(0)
  }

  if (!active) return null

  const currentStepNum = currentStepIdx + 1
  const stepConfig = TOUR_STEPS_CONFIG[currentStepIdx]

  // Viewport dimensions
  const W = typeof window !== 'undefined' ? window.innerWidth : 1280
  const H = typeof window !== 'undefined' ? window.innerHeight : 800

  // Calculate Cutout Dimensions for Backdrop Dimming
  let cutoutTop = 0
  let cutoutBottom = 0
  let cutoutLeft = 0
  let cutoutRight = 0
  let cutoutWidth = 0
  let cutoutHeight = 0

  if (targetRect && isTargetVisible) {
    cutoutTop = Math.max(0, targetRect.top - 8)
    cutoutBottom = Math.min(H, targetRect.bottom + 8)
    cutoutLeft = Math.max(0, targetRect.left - 8)
    cutoutRight = Math.min(W, targetRect.right + 8)
    cutoutWidth = Math.max(0, cutoutRight - cutoutLeft)
    cutoutHeight = Math.max(0, cutoutBottom - cutoutTop)
  }

  // Collision-Free Card Placement Algorithm
  // NEVER cover the highlighted panel and NEVER get cut off from the viewport!
  let cardPositionStyle: React.CSSProperties = {}
  const cardWidth = Math.min(W - 32, 390)

  if (targetRect && isTargetVisible) {
    let chosenSide: 'left' | 'right' | 'bottom' | 'top' = stepConfig.preferredSide || 'left'

    // If user clicked "Flip", invert left <-> right or bottom <-> top
    if (dockFlipped) {
      if (chosenSide === 'left') chosenSide = 'right'
      else if (chosenSide === 'right') chosenSide = 'left'
      else if (chosenSide === 'bottom') chosenSide = 'top'
      else if (chosenSide === 'top') chosenSide = 'bottom'
    }

    const spaceLeft = targetRect.left - 16
    const spaceRight = W - targetRect.right - 16
    const spaceBelow = H - targetRect.bottom - 16
    const spaceAbove = targetRect.top - 16

    let calculatedLeft = 20

    if (chosenSide === 'left') {
      if (spaceLeft >= cardWidth) {
        calculatedLeft = Math.max(16, targetRect.left - cardWidth - 16)
      } else {
        calculatedLeft = 20
      }
      // Anchored to bottom of screen so Prev/Next buttons are ALWAYS visible!
      cardPositionStyle = {
        position: 'fixed',
        bottom: '20px',
        left: `${calculatedLeft}px`,
        width: `${cardWidth}px`,
        maxHeight: `${Math.min(H - 40, 520)}px`,
        zIndex: 50,
        transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
      }
    } else if (chosenSide === 'right') {
      if (spaceRight >= cardWidth) {
        calculatedLeft = Math.min(W - cardWidth - 16, targetRect.right + 16)
      } else {
        calculatedLeft = W - cardWidth - 20
      }
      // Anchored to bottom of screen so Prev/Next buttons are ALWAYS visible!
      cardPositionStyle = {
        position: 'fixed',
        bottom: '20px',
        left: `${calculatedLeft}px`,
        width: `${cardWidth}px`,
        maxHeight: `${Math.min(H - 40, 520)}px`,
        zIndex: 50,
        transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
      }
    } else if (chosenSide === 'bottom') {
      if (spaceBelow >= 260) {
        calculatedLeft = Math.max(20, Math.min(W - cardWidth - 20, targetRect.left + (targetRect.width - cardWidth) / 2))
        const calculatedTop = targetRect.bottom + 14
        cardPositionStyle = {
          position: 'fixed',
          top: `${calculatedTop}px`,
          left: `${calculatedLeft}px`,
          width: `${cardWidth}px`,
          maxHeight: `${Math.min(H - calculatedTop - 20, 520)}px`,
          zIndex: 50,
          transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
        }
      } else {
        // Fallback when element extends too low: dock at bottom edge
        calculatedLeft = dockFlipped ? (W - cardWidth - 20) : 20
        cardPositionStyle = {
          position: 'fixed',
          bottom: '20px',
          left: `${calculatedLeft}px`,
          width: `${cardWidth}px`,
          maxHeight: `${Math.min(H - 40, 520)}px`,
          zIndex: 50,
          transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
        }
      }
    } else if (chosenSide === 'top') {
      if (spaceAbove >= 260) {
        calculatedLeft = Math.max(20, Math.min(W - cardWidth - 20, targetRect.left + (targetRect.width - cardWidth) / 2))
        cardPositionStyle = {
          position: 'fixed',
          bottom: `${H - targetRect.top + 14}px`,
          left: `${calculatedLeft}px`,
          width: `${cardWidth}px`,
          maxHeight: `${Math.min(targetRect.top - 28, 520)}px`,
          zIndex: 50,
          transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
        }
      } else {
        // Fallback when element is too near top: dock at bottom edge
        calculatedLeft = dockFlipped ? (W - cardWidth - 20) : 20
        cardPositionStyle = {
          position: 'fixed',
          bottom: '20px',
          left: `${calculatedLeft}px`,
          width: `${cardWidth}px`,
          maxHeight: `${Math.min(H - 40, 520)}px`,
          zIndex: 50,
          transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
        }
      }
    }
  } else {
    // Default fixed bottom-left dock when target is mounting/transitioning
    cardPositionStyle = {
      position: 'fixed',
      bottom: '20px',
      left: '20px',
      width: 'min(calc(100vw - 2.5rem), 390px)',
      maxHeight: 'min(calc(100vh - 40px), 520px)',
      zIndex: 50,
    }
  }

  return (
    <>
      {/* 4-Quadrant Backdrop Curtains: Blurs and dims the REST of the background */}
      {!isCompleted && targetRect && isTargetVisible && (
        <>
          {/* Top Curtain */}
          <div
            className="fixed left-0 right-0 top-0 bg-slate-950/70 backdrop-blur-[2px] pointer-events-none transition-all duration-300 z-40"
            style={{ height: `${cutoutTop}px` }}
          />

          {/* Bottom Curtain */}
          <div
            className="fixed left-0 right-0 bottom-0 bg-slate-950/70 backdrop-blur-[2px] pointer-events-none transition-all duration-300 z-40"
            style={{ top: `${cutoutBottom}px` }}
          />

          {/* Left Curtain */}
          <div
            className="fixed left-0 bg-slate-950/70 backdrop-blur-[2px] pointer-events-none transition-all duration-300 z-40"
            style={{
              top: `${cutoutTop}px`,
              width: `${cutoutLeft}px`,
              height: `${cutoutHeight}px`,
            }}
          />

          {/* Right Curtain */}
          <div
            className="fixed right-0 bg-slate-950/70 backdrop-blur-[2px] pointer-events-none transition-all duration-300 z-40"
            style={{
              top: `${cutoutTop}px`,
              left: `${cutoutRight}px`,
              height: `${cutoutHeight}px`,
            }}
          />

          {/* Glowing Animated Spotlight Frame directly over Target Section */}
          <div
            className="fixed pointer-events-none z-45 transition-all duration-300"
            style={{
              top: `${cutoutTop}px`,
              left: `${cutoutLeft}px`,
              width: `${cutoutWidth}px`,
              height: `${cutoutHeight}px`,
            }}
          >
            {/* High-visibility Golden Aura Ring */}
            <div className="w-full h-full rounded-3xl border-3 border-amber-400 shadow-[0_0_35px_rgba(245,158,11,0.65)] animate-pulse" />

            {/* Target Section Badge Pin */}
            <div className="absolute -top-4 left-6 px-3 py-1 rounded-full bg-amber-500 text-slate-950 font-black text-[11px] uppercase tracking-wider shadow-xl flex items-center gap-1.5 border border-amber-300">
              <Target className="w-3.5 h-3.5 animate-spin" />
              <span>{t(`tour.steps.${currentStepNum}.sectionName`, 'Current Focus')}</span>
            </div>
          </div>
        </>
      )}

      {/* Moving Detailed Explanation Block (Collision-Free, Non-Overlapping) */}
      {!isCompleted ? (
        <div style={cardPositionStyle} className="animate-in fade-in duration-200 flex flex-col min-h-0 select-none">
          <div
            className="rounded-2xl bg-slate-950/95 text-white border-2 border-amber-500/80 shadow-2xl backdrop-blur-2xl overflow-hidden flex flex-col flex-1 min-h-0 max-h-full relative"
          >
            {/* Top Accent Gradient Line */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-500 via-amber-400 to-emerald-400 flex-shrink-0" />

            {/* ── PINNED HEADER (never scrolls away) ── */}
            <div className="px-4 pt-3 pb-2 flex-shrink-0 space-y-1.5">
              {/* Header: Step Number, Role Badge, Voiceover Player, Flip & Close */}
              <div className="flex items-center justify-between gap-2 pt-0.5">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500 text-slate-950 text-[10px] font-black uppercase tracking-wider">
                    <Video className="w-3 h-3" />
                    <span>DEMO</span>
                  </span>
                  <span className="text-[11px] font-mono font-bold text-amber-300">
                    {t('tour.step')} {currentStepNum}/{TOUR_STEPS_CONFIG.length}
                  </span>
                  <span className={`text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full border ${stepConfig.badgeColor}`}>
                    {stepConfig.role.replace('_', ' ').toUpperCase()}
                  </span>

                  {/* Voiceover Player pill */}
                  <div className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                    audioMissing
                      ? 'bg-slate-800/60 text-slate-500 border-slate-700'
                      : isPlaying
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                      : 'bg-slate-800/80 text-slate-300 border-slate-700'
                  }`}>
                    <Mic className="w-2.5 h-2.5 flex-shrink-0" />
                    {audioMissing ? (
                      <span className="font-mono">no audio</span>
                    ) : (
                      <>
                        <span className="font-mono">
                          {String(currentStepIdx + 1).padStart(2, '0')}.m4a
                        </span>
                        {isPlaying && (
                          <span className="flex items-center gap-0.5">
                            <span className="w-0.5 h-2 bg-emerald-400 animate-pulse rounded-full" />
                            <span className="w-0.5 h-2.5 bg-emerald-300 animate-pulse delay-75 rounded-full" />
                            <span className="w-0.5 h-2 bg-emerald-400 animate-pulse delay-150 rounded-full" />
                          </span>
                        )}
                      </>
                    )}
                  </div>
                </div>

                {/* Header Controls: Play/Stop, Replay, Flip Side & Exit */}
                <div className="flex items-center gap-1 flex-shrink-0">
                  <button
                    type="button"
                    onClick={togglePlayback}
                    className="flex items-center gap-1 px-1.5 py-0.5 rounded-md text-slate-300 hover:text-emerald-300 hover:bg-slate-800 text-[10px] font-semibold transition-colors cursor-pointer border border-slate-800"
                    title={isPlaying ? 'Stop voiceover' : 'Play voiceover for this step'}
                  >
                    {isPlaying
                      ? <Square className="w-2.5 h-2.5 text-rose-400 fill-rose-400" />
                      : <Play className="w-2.5 h-2.5 text-emerald-400 fill-emerald-400" />
                    }
                    <span>{isPlaying ? 'Stop' : 'Play'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => { stopAudio(); setTimeout(() => playAudio(currentStepIdx), 80) }}
                    className="p-1 rounded-md text-slate-400 hover:text-amber-300 hover:bg-slate-800 transition-colors cursor-pointer border border-slate-800"
                    title="Replay voiceover from beginning"
                  >
                    <RotateCcw className="w-3 h-3 text-amber-400" />
                  </button>

                  {/* Volume Booster Toggle (100% -> 150% -> 200% -> 250%) */}
                  <button
                    type="button"
                    onClick={() => {
                      setGainBoost((prev) => (prev === 1.0 ? 1.5 : prev === 1.5 ? 2.0 : prev === 2.0 ? 2.5 : 1.0))
                    }}
                    className="flex items-center gap-1 px-1.5 py-0.5 rounded-md text-amber-300 hover:text-amber-200 hover:bg-slate-800 text-[10px] font-semibold transition-colors cursor-pointer border border-amber-500/30 bg-amber-500/10"
                    title={`Audio Boost: ${Math.round(gainBoost * 100)}% (Click to cycle 100%, 150%, 200%, 250%)`}
                  >
                    <Volume2 className="w-2.5 h-2.5 text-amber-400" />
                    <span className="font-mono text-[9px]">{Math.round(gainBoost * 100)}%</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setDockFlipped((f) => !f)}
                    className="flex items-center gap-1 px-1.5 py-0.5 rounded-md text-slate-400 hover:text-amber-400 hover:bg-slate-800 text-[10px] font-semibold transition-colors cursor-pointer border border-slate-800"
                    title="Move card to opposite side"
                  >
                    <ArrowLeftRight className="w-3 h-3" />
                    <span>Flip</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleClose}
                    className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
                    title={t('tour.exit')}
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Step Title */}
              <h3 className="text-sm font-extrabold text-white tracking-tight flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
                <span className="line-clamp-2">{t(`tour.steps.${currentStepNum}.title`)}</span>
              </h3>
            </div>

            {/* ── SCROLLABLE MIDDLE CONTENT ── */}
            <div className="overflow-y-auto flex-1 min-h-0 px-4 pb-2 space-y-2 text-xs">
              {/* Action Box */}
              <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-200 space-y-1">
                <div className="flex items-center gap-1.5 font-bold text-[10px] text-amber-300 uppercase tracking-wide">
                  <Compass className="w-3 h-3 text-amber-400 flex-shrink-0" />
                  <span>🎯 {t('tour.whatToDo')}</span>
                </div>
                <p className="text-[11px] text-slate-200 leading-relaxed font-medium">
                  {t(`tour.steps.${currentStepNum}.action`)}
                </p>
              </div>

              {/* Detail Box */}
              <div className="p-2.5 rounded-xl bg-slate-900/90 border border-slate-800 text-slate-300 space-y-1">
                <div className="flex items-center gap-1.5 font-bold text-[10px] text-emerald-400 uppercase tracking-wide">
                  <Layers className="w-3 h-3 text-emerald-400 flex-shrink-0" />
                  <span>💡 {t('tour.whatShows')}</span>
                </div>
                <p className="text-[11px] text-slate-300 leading-relaxed">
                  {t(`tour.steps.${currentStepNum}.details`)}
                </p>
              </div>
            </div>

            {/* ── PINNED NAV BAR (never scrolls away) ── */}
            <div className="flex items-center justify-between gap-2 px-4 py-2.5 border-t border-slate-800 flex-shrink-0 text-xs bg-slate-950/90">
              <button
                type="button"
                onClick={handlePrev}
                disabled={currentStepIdx === 0}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold disabled:opacity-40 disabled:pointer-events-none transition-all cursor-pointer text-xs"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                <span>{t('tour.prev')}</span>
              </button>

              {/* Step indicator pills */}
              <div className="flex items-center gap-1 overflow-hidden max-w-[150px]">
                {TOUR_STEPS_CONFIG.map((_, i) => (
                  <span
                    key={i}
                    className={`h-1.5 rounded-full transition-all ${
                      i === currentStepIdx
                        ? 'w-4 bg-amber-400'
                        : i < currentStepIdx
                        ? 'w-1 bg-emerald-400'
                        : 'w-1 bg-slate-700'
                    }`}
                  />
                ))}
              </div>

              <button
                type="button"
                onClick={handleNext}
                className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-slate-950 font-black shadow-md shadow-amber-500/25 transition-all cursor-pointer group text-xs"
              >
                <span>
                  {currentStepIdx === TOUR_STEPS_CONFIG.length - 1
                    ? t('tour.finish')
                    : t('tour.next')}
                </span>
                <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
              </button>
            </div>
          </div>
        </div>

      ) : (
        /* Grand Celebration Modal for Screen Recording End Cue */
        <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-xl flex items-center justify-center p-4 animate-in fade-in duration-300">
          <div className="max-w-2xl w-full bg-slate-900 border-2 border-emerald-500 rounded-3xl p-8 sm:p-10 shadow-2xl text-center space-y-6 relative overflow-hidden">
            {/* Ambient Background Glows */}
            <div className="absolute -top-24 -left-24 w-72 h-72 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-24 -right-24 w-72 h-72 bg-amber-500/20 rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10 space-y-3">
              <div className="w-20 h-20 rounded-3xl bg-emerald-500/20 border-2 border-emerald-400 flex items-center justify-center text-emerald-400 mx-auto shadow-xl shadow-emerald-500/30 animate-bounce">
                <CheckCircle2 className="w-10 h-10" />
              </div>

              <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                {t('tour.completedTitle')}
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 max-w-lg mx-auto leading-relaxed">
                {t('tour.completedSub')}
              </p>
            </div>

            {/* Mission Accomplished Banner */}
            <div className="bg-amber-950/60 border-2 border-amber-500/60 rounded-2xl p-5 text-amber-200 space-y-2 shadow-xl">
              <div className="flex items-center justify-center gap-2.5 font-black text-base sm:text-lg">
                <span className="text-xl">🏁</span>
                <span className="text-white tracking-wide">{t('tour.stopRecordingCue')}</span>
              </div>
              <p className="text-xs text-amber-300/90 font-medium text-center">
                {t('tour.stopRecordingSub')}
              </p>
            </div>

            {/* Demonstrated Features Summary Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-left text-[11px] pt-1 text-slate-300">
              <div className="p-2.5 rounded-xl bg-slate-800/80 border border-slate-700">
                <span className="text-emerald-400 font-bold block">✓ RBAC Roles</span>
                <span>6 Governmental Personas</span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-800/80 border border-slate-700">
                <span className="text-emerald-400 font-bold block">✓ 8-Stage CV</span>
                <span>CLAHE & Sauvola Denoise</span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-800/80 border border-slate-700">
                <span className="text-emerald-400 font-bold block">✓ Dual OCR</span>
                <span>Tesseract 5 + TrOCR</span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-800/80 border border-slate-700">
                <span className="text-emerald-400 font-bold block">✓ 17 Legal Rules</span>
                <span>Arithmetic & Tenure Checks</span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-800/80 border border-slate-700">
                <span className="text-emerald-400 font-bold block">✓ Cadastral GIS</span>
                <span>Rule X002 Geodesic Area</span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-800/80 border border-slate-700">
                <span className="text-emerald-400 font-bold block">✓ SHA-256 Audit</span>
                <span>Immutable Proof Ledger</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-center gap-4 pt-3 flex-wrap">
              {/* Play / Replay completion audio */}
              <button
                type="button"
                onClick={() => { stopAudio(); setTimeout(() => playAudio('complete'), 80) }}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 font-bold text-xs border border-emerald-500/40 transition-all cursor-pointer shadow-sm"
                title="Replay completion voiceover"
              >
                <Play className="w-4 h-4 text-emerald-400 fill-emerald-400" />
                <span>Replay Voice Cue</span>
              </button>

              <button
                type="button"
                onClick={handleRestart}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs border border-slate-700 transition-all cursor-pointer"
              >
                <RotateCcw className="w-4 h-4 text-amber-400" />
                <span>{t('tour.restartBtn')}</span>
              </button>

              <button
                type="button"
                onClick={handleClose}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-slate-950 font-black text-xs shadow-lg shadow-emerald-500/30 transition-all cursor-pointer"
              >
                <span>{t('tour.closeBtn')}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
