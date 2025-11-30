// AppShell component placeholder - main layout wrapper
import Navbar from './Navbar'
import Sidebar from './Sidebar'

export default function AppShell({ children }) {
  return (
    <div className="app-shell">
      <Navbar />
      <div className="app-content">
        <Sidebar />
        <main>{children}</main>
      </div>
    </div>
  )
}

