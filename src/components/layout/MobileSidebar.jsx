/**
 * Mobile drawer overlay helper used by MainLayout / Sidebar.
 * Sidebar owns the drawer panel; this component owns the backdrop.
 */
export default function MobileSidebar({ open, onClose }) {
  if (!open) return null

  return (
    <button
      type="button"
      aria-label="Close menu"
      className="fixed inset-0 z-40 bg-[rgba(15,28,42,0.55)] backdrop-blur-[2px] transition-opacity lg:hidden"
      onClick={onClose}
    />
  )
}
