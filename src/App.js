import { BrowserRouter, Routes, Route } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';
import SignIn from './SignIn';
import Dashboard from './Dashboard';
import Karyawan from './pages/Karyawan';
import Admin from './pages/Admin';
import Absensi from './pages/Absensi';
import Rekap from './pages/Rekap';
import PengaturanWaktu from './pages/PengaturanWaktu';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<SignIn />} />
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard />  </ProtectedRoute>} />
        <Route path="/absensi" element={<ProtectedRoute><Absensi />  </ProtectedRoute>} />
        <Route path="/karyawan" element={<ProtectedRoute><Karyawan />  </ProtectedRoute>} />
        <Route path="/admin" element={<ProtectedRoute><Admin />  </ProtectedRoute>} />
        <Route path="/rekap" element={<ProtectedRoute><Rekap />  </ProtectedRoute>} />
        <Route path="/pengaturan-waktu" element={<ProtectedRoute><PengaturanWaktu />  </ProtectedRoute>} />

      </Routes>
    </BrowserRouter>
  );
}

export default App;
