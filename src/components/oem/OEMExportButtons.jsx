import { Download } from 'lucide-react'
import Button from '../common/Button'
import { toOemExportRows } from '../../data/oemReporting'

function downloadFile(filename, content, mime) {
  const blob = new Blob([content], { type: mime })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  link.remove()
  URL.revokeObjectURL(url)
}

function csvCell(value) {
  const text = String(value ?? '')
  if (/[",\n]/.test(text)) return `"${text.replace(/"/g, '""')}"`
  return text
}

export default function OEMExportButtons({ rows, month, onExported, onExport }) {
  const exportRows = toOemExportRows(rows)
  const stamp = String(month || 'report').replace(/\s+/g, '-').toLowerCase()

  const exportCsv = async () => {
    if (onExport) {
      try {
        await onExport('csv')
        onExported?.('csv')
      } catch {
        /* error toast is handled by the caller */
      }
      return
    }
    const headers = [
      'Brand',
      'Month',
      'OptIns',
      'SalesInfluenced',
      'Attribution',
      'Compliance',
    ]
    const lines = [
      headers.join(','),
      ...exportRows.map((row) =>
        headers.map((key) => csvCell(row[key])).join(','),
      ),
    ]
    downloadFile(
      `oem-reporting-${stamp}.csv`,
      `${lines.join('\n')}\n`,
      'text/csv;charset=utf-8;',
    )
    onExported?.('csv')
  }

  const exportJson = async () => {
    if (onExport) {
      try {
        await onExport('json')
        onExported?.('json')
      } catch {
        /* parent shows the error toast */
      }
      return
    }
    downloadFile(
      `oem-reporting-${stamp}.json`,
      `${JSON.stringify(exportRows, null, 2)}\n`,
      'application/json;charset=utf-8;',
    )
    onExported?.('json')
  }

  return (
    <div className="flex flex-wrap gap-2">
      <Button type="button" variant="secondary" onClick={exportCsv}>
        <Download size={16} />
        Export CSV
      </Button>
      <Button type="button" variant="secondary" onClick={exportJson}>
        <Download size={16} />
        Export JSON
      </Button>
    </div>
  )
}
