import PlaceholderPage from '../../components/layout/PlaceholderPage'
import { findNavItemByPath } from '../../routes/navigation'
import { useAuth } from '../../hooks/useAuth'
import { useLocation } from 'react-router-dom'

/**
 * Renders a placeholder using metadata from the navigation config.
 * Falls back to generic copy if the path is not in the nav map.
 */
export default function ModulePlaceholder({
  title,
  subtitle,
  description,
  showActionPlaceholders = true,
}) {
  const { user } = useAuth()
  const location = useLocation()
  const navItem = findNavItemByPath(location.pathname, user?.role)

  return (
    <PlaceholderPage
      title={title || navItem?.title || 'Module'}
      subtitle={subtitle || navItem?.subtitle || title || 'Module'}
      description={
        description ||
        navItem?.description ||
        'This area is reserved for an upcoming AutoFlow module.'
      }
      showActionPlaceholders={showActionPlaceholders}
      nextStepNote="This module will be implemented in the next steps."
    />
  )
}
