import { Link, NavLink } from 'react-router'
import { LightningBoltIcon } from './LightningBoltIcon'
import './Navbar.scss'

const NAV_LINKS = [
  { to: '/', label: 'Dashboard' },
  { to: '/vehicles', label: 'Vehicles' },
]

export function Navbar() {
  return (
    <header className="navbar">
      <Link to="/" className="navbar__brand" aria-label="Go to Dashboard">
        <LightningBoltIcon />
        <span className="navbar__app-name">EV Fleet</span>
      </Link>

      <nav className="navbar__nav" aria-label="Main navigation">
        {NAV_LINKS.map(({ to, label }) => (
          <NavLink
            key={to}
            to={to}
            end
            className={({ isActive }) =>
              `navbar__link${isActive ? ' navbar__link--active' : ''}`
            }
          >
            {label}
          </NavLink>
        ))}
      </nav>
    </header>
  )
}
