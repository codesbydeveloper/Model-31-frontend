import Badge from './Badge'
import { statusVariant } from '../../utils/table'

export default function StatusBadge({ status }) {
  return <Badge variant={statusVariant(status)}>{status}</Badge>
}
