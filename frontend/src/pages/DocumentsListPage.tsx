import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { FileText, Search, Eye, RefreshCw, Upload } from 'lucide-react'
import { listDocuments } from '../api'
import { QualityBadge } from '../components/QualityBadge'

export const DocumentsListPage: React.FC = () => {
  const { t } = useTranslation()
  const [documents, setDocuments] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [page] = useState(1)
  const [, setTotal] = useState(0)


  const loadData = () => {
    setLoading(true)
    listDocuments({
      search: search || undefined,
      status: statusFilter || undefined,
      page,
      size: 15,
    })
      .then((data) => {
        setDocuments(data.items)
        setTotal(data.total)
        setLoading(false)
      })
      .catch((err) => {
        console.error(err)
        setLoading(false)
      })
  }

  useEffect(() => {
    loadData()
  }, [page, statusFilter])

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Title & Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            {t('nav.documents')}
          </h1>
          <p className="text-slate-500 text-xs mt-0.5">
            Repository of digitized and scanned land records across all jurisdictions
          </p>
        </div>

        <Link
          to="/upload"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs shadow-md transition-all self-start sm:self-auto"
        >
          <Upload className="w-3.5 h-3.5" />
          <span>Upload New Scan</span>
        </Link>
      </div>

      {/* Filter / Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by filename or ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && loadData()}
            className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 bg-slate-50 text-xs focus:bg-white focus:outline-amber-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-slate-50 border border-slate-200 text-xs font-medium text-slate-700 rounded-xl px-3 py-2"
          >
            <option value="">All Statuses</option>
            <option value="uploaded">Uploaded</option>
            <option value="processing">Processing</option>
            <option value="needs_review">Needs Review</option>
            <option value="accepted">Accepted</option>
          </select>

          <button
            onClick={loadData}
            className="p-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600"
            title="Refresh"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="py-16 text-center text-slate-400 text-xs">
            <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-amber-500" />
            Loading documents...
          </div>
        ) : documents.length === 0 ? (
          <div className="py-16 text-center text-slate-400 text-xs">
            <FileText className="w-8 h-8 mx-auto mb-2 text-slate-300" />
            No documents found matching the filter criteria.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-semibold">
                <tr>
                  <th className="px-5 py-3.5">Document</th>
                  <th className="px-5 py-3.5">Type</th>
                  <th className="px-5 py-3.5">Quality</th>
                  <th className="px-5 py-3.5">Status</th>
                  <th className="px-5 py-3.5">Uploaded</th>
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {documents.map((doc) => (
                  <tr key={doc.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="px-5 py-3.5 font-medium text-slate-900">
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-slate-400" />
                        <div>
                          <div className="font-semibold text-slate-800">{doc.filename}</div>
                          <div className="text-[10px] text-slate-400 font-mono">
                            ID: {doc.id.slice(0, 8)}... · {doc.pages || 1} page(s)
                          </div>
                        </div>
                      </div>
                    </td>

                    <td className="px-5 py-3.5">
                      <span className="px-2 py-0.5 rounded-full text-[11px] font-mono bg-slate-100 text-slate-700 border border-slate-200">
                        {doc.doc_type || 'unknown'}
                      </span>
                    </td>

                    <td className="px-5 py-3.5">
                      <QualityBadge score={doc.quality_score} showFlags={false} size="sm" />
                    </td>

                    <td className="px-5 py-3.5">
                      <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        {doc.status}
                      </span>
                    </td>

                    <td className="px-5 py-3.5 text-slate-500 text-[11px]">
                      {doc.uploaded_at ? new Date(doc.uploaded_at).toLocaleDateString() : 'N/A'}
                    </td>

                    <td className="px-5 py-3.5 text-right">
                      <Link
                        to={`/documents/${doc.id}`}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-semibold text-[11px] shadow-sm transition-all"
                      >
                        <Eye className="w-3 h-3 text-amber-400" />
                        <span>Inspect & Compare</span>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
