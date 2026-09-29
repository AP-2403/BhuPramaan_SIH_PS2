/**
 * BhuLekh-AI Role-Based Access Control (RBAC) & Navigation Config
 */

export interface RoleConfig {
  role: string
  label: string
  titleHindi: string
  badgeClass: string
  scope: string
  desc: string
  defaultRoute: string
  allowedRoutes: string[]
}

export const ROLES: Record<string, RoleConfig> = {
  tehsil_operator: {
    role: 'tehsil_operator',
    label: 'Tehsil Operator',
    titleHindi: 'तहसील ऑपरेटर',
    badgeClass: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
    scope: 'Tehsil 090101 (Lucknow Sadar)',
    desc: 'Uploads land records, scans, batch ZIPs, and monitors pipeline ingestion',
    defaultRoute: '/upload',
    allowedRoutes: ['/upload', '/documents'],
  },
  verifier: {
    role: 'verifier',
    label: 'Revenue Verifier',
    titleHindi: 'राजस्व सत्यापनकर्ता',
    badgeClass: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40',
    scope: 'District 0901 (Lucknow)',
    desc: 'Inspects low-confidence OCR, validates flagged fields, and submits corrections',
    defaultRoute: '/review',
    allowedRoutes: ['/review', '/documents', '/records'],
  },
  district_officer: {
    role: 'district_officer',
    label: 'District Officer',
    titleHindi: 'जिला राजस्व अधिकारी',
    badgeClass: 'bg-purple-500/20 text-purple-300 border-purple-500/40',
    scope: 'District 0901 (Lucknow)',
    desc: 'District-level KPI dashboards, cadastral GIS map, and final record approvals',
    defaultRoute: '/dashboard',
    allowedRoutes: ['/dashboard', '/records', '/map', '/documents'],
  },
  state_officer: {
    role: 'state_officer',
    label: 'State Officer',
    titleHindi: 'राज्य राजस्व आयुक्त',
    badgeClass: 'bg-blue-500/20 text-blue-300 border-blue-500/40',
    scope: 'State 09 (Uttar Pradesh)',
    desc: 'State-wide progress drilldown, cross-district comparisons, and policy oversight',
    defaultRoute: '/dashboard',
    allowedRoutes: ['/dashboard', '/records', '/map'],
  },
  auditor: {
    role: 'auditor',
    label: 'Independent Auditor',
    titleHindi: 'स्वतंत्र संपरीक्षक',
    badgeClass: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
    scope: 'All-State Jurisdiction',
    desc: 'Cryptographic SHA-256 hash-chain verification and tamper-evident audit logs (Read-Only)',
    defaultRoute: '/audit',
    allowedRoutes: ['/audit', '/records', '/documents'],
  },
  admin: {
    role: 'admin',
    label: 'System Administrator',
    titleHindi: 'सिस्टम प्रशासक',
    badgeClass: 'bg-rose-500/20 text-rose-300 border-rose-500/40',
    scope: 'System Root',
    desc: 'Model retraining pipelines, validation rule configuration, and full system management',
    defaultRoute: '/learning',
    allowedRoutes: ['/upload', '/documents', '/review', '/records', '/map', '/dashboard', '/learning', '/audit'],
  },
  citizen: {
    role: 'citizen',
    label: 'Public Citizen',
    titleHindi: 'नागरिक एवं भूस्वामी',
    badgeClass: 'bg-slate-500/20 text-slate-300 border-slate-500/40',
    scope: 'Public Access',
    desc: 'Public land record search by Khasra/Owner with privacy-preserving masked PII',
    defaultRoute: '/records',
    allowedRoutes: ['/records'],
  },
}

export function getRoleDefaultRoute(role?: string): string {
  if (!role || !ROLES[role]) return '/upload'
  return ROLES[role].defaultRoute
}

export function isRouteAllowedForRole(route: string, role?: string): boolean {
  if (!role || !ROLES[role]) return false
  const allowed = ROLES[role].allowedRoutes
  return allowed.some((r) => route === r || route.startsWith(r + '/'))
}
