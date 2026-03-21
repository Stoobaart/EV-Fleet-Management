import { Outlet } from 'react-router'
import { Navbar } from '../shared/components/Navbar/Navbar'
import './Layout.scss'

export function Layout() {
  return (
    <>
      <Navbar />
      <div className="layout__content">
        <Outlet />
      </div>
    </>
  )
}
