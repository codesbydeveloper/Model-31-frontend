import { Outlet } from 'react-router-dom'
import { APP_NAME, APP_SUBTITLE } from '../data/navigation'

/**
 * Auth shell for login and future auth screens.
 */
export default function AuthLayout() {
  return (
    <div className="relative flex min-h-svh w-full items-center justify-center overflow-x-hidden bg-[var(--bg-app)] px-4 py-8">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(26,107,138,0.08),_transparent_55%)]"
      />
      <div className="relative w-full max-w-md">
        <div className="sr-only">
          <h1>{APP_NAME}</h1>
          <p>{APP_SUBTITLE}</p>
        </div>
        <Outlet />
      </div>
    </div>
  )
}
