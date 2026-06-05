import { Navigate, Route, Routes } from 'react-router-dom'
import { AdminRoute } from './components/auth/AdminRoute.tsx'
import { GuestRoute } from './components/auth/GuestRoute.tsx'
import { MechanicRoute } from './components/auth/MechanicRoute.tsx'
import { ProtectedRoute } from './components/auth/ProtectedRoute.tsx'
import { AppLayout } from './components/layout/AppLayout.tsx'
import { AdminDashboard } from './pages/AdminDashboard.tsx'
import { Dashboard } from './pages/Dashboard.tsx'
import { Login } from './pages/Login.tsx'
import { MechanicDashboard } from './pages/MechanicDashboard.tsx'
import { ServiceRequests } from './pages/ServiceRequests.tsx'
import { Vehicles } from './pages/Vehicles.tsx'

export default function App() {
  return (
    <Routes>
      <Route element={<GuestRoute />}>
        <Route path="/login" element={<Login />} />
      </Route>

      <Route element={<ProtectedRoute />}>
        <Route element={<AppLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="vehicles" element={<Vehicles />} />
          <Route path="service-requests" element={<ServiceRequests />} />
          <Route element={<MechanicRoute />}>
            <Route path="mechanic" element={<MechanicDashboard />} />
          </Route>
          <Route element={<AdminRoute />}>
            <Route path="admin" element={<AdminDashboard />} />
          </Route>
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
