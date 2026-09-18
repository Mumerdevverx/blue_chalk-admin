import { BrowserRouter } from 'react-router-dom'
import AllRoutes from './allRoutes'
import { AuthProvider } from './auth/AuthContext'
import './App.css'

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AllRoutes />
      </AuthProvider>
    </BrowserRouter>
  )
}
