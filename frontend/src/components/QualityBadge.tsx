import React from 'react'
import { useTranslation } from 'react-i18next'
import { AlertTriangle, CheckCircle2, ShieldAlert } from 'lucide-react'

interface QualityBadgeProps {
  score?: number | null
  flags?: string[]
  showFlags?: boolean
  size?: 'sm' | 'md' | 'lg'
}

export const QualityBadge: React.FC<QualityBadgeProps> = ({
  score,
  flags = [],
  showFlags = true,
  size = 'md',
}) => {
  const { t } = useTranslation()

  if (score === undefined || score === null) {
    return <span className="text-xs text-slate-400">N/A</span>
  }

  // Thresholds: green >= 0.90, amber 0.75-0.90, red < 0.75
  let badgeStyle = 'badge-low-conf'
  let label = 'Degraded'
  let Icon = ShieldAlert

  if (score >= 0.85) {
    badgeStyle = 'badge-high-conf'
    label = 'Excellent'
    Icon = CheckCircle2
  } else if (score >= 0.60) {
    badgeStyle = 'badge-med-conf'
    label = 'Moderate'
    Icon = AlertTriangle
  }

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-xs px-2.5 py-1',
    lg: 'text-sm px-3.5 py-1.5 font-semibold',
  }[size]

  return (
    <div className="flex flex-wrap items-center gap-1.5">
      <div className={`inline-flex items-center gap-1.5 rounded-full font-medium ${badgeStyle} ${sizeClasses}`}>
        <Icon className={size === 'sm' ? 'w-3 h-3' : 'w-3.5 h-3.5'} />
        <span>{Math.round(score * 100)}%</span>
        <span className="opacity-75">({label})</span>
      </div>

      {showFlags && flags.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {flags.map((flag) => (
            <span
              key={flag}
              className="inline-flex items-center text-[10px] font-medium uppercase tracking-wider px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200"
            >
              {t(`quality.${flag}`, flag.replace('_', ' '))}
            </span>
          ))}
        </div>
      )}
    </div>
  )
}
