import { Routes, Route, Navigate } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import Login from './pages/Login';
import Register from './pages/Register';
import InstructorView from './pages/InstructorView';
import StudentView from './pages/StudentView';

import Loading from './Components/Loading';

function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      <Route path="/instructor-dashboard" element={<InstructorView />} />
      <Route path="/student-dashboard" element={<StudentView />} />
      <Route path="/dashboard" element={<div className="page"><Loading title={"صفحه الطالب"} description={"قيد الانشاء"} /></div>} />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;