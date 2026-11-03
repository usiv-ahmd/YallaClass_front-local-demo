import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { GraduationCap, Presentation } from 'lucide-react';
import '../styles/auth.css';

const MOCK_CREDENTIALS = {
  student: { email: 'student@yalla.com', password: 'student123' },
  instructor: { email: 'instructor@yalla.com', password: 'instructor123' },
};

export default function Login() {
  const [role, setRole] = useState('student');
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (role === 'instructor') {
      navigate('/instructor-dashboard');
    } else {
      navigate('/student-dashboard');
    }
  };




    // ── Autofill mock credentials ──────────────────
  const fillMock = (mockRole) => {
    const creds = MOCK_CREDENTIALS[mockRole];
    setRole(mockRole);
    setFormData({ email: creds.email, password: creds.password });
  };

  return (
    <>
      <div className="card auth-container">
        <h2>تسجيل الدخول</h2>

        <div className="role-selector">
          <button 
            type="button"
            className={role === 'student' ? 'active' : ''} 
            onClick={() => setRole('student')}
          >
            طالب (Student)
          </button>
          <button 
            type="button"
            className={role === 'instructor' ? 'active' : ''} 
            onClick={() => setRole('instructor')}
          >
            محاضر (Instructor)
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>البريد الإلكتروني</label>
            <input 
              type="email" 
              name="email" 
              placeholder="example@domain.com"
              value={formData.email}
              onChange={handleChange} 
              required 
            />
          </div>

          <div className="form-group">
            <label>كلمة المرور</label>
            <input 
              type="password" 
              name="password" 
              placeholder="••••••••"
              value={formData.password}
              onChange={handleChange} 
              required 
            />
          </div>

          <button type="submit" className="submit-btn">
            دخول كـ {role === 'student' ? 'طالب' : 'محاضر'}
          </button>
        </form>

        <p className="auth-switch">
          ليس لديك حساب؟ <Link to="/register">إنشاء حساب جديد</Link>
        </p>
      </div>

      {/* ═══════════ MOCK LOGIN (temporary) ═══════════ */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 18 }}>
        <button
          type="button"
          onClick={() => fillMock('student')}
          style={{
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 6,
            padding: '10px 12px', borderRadius: 10,
            border: '1px dashed rgba(8, 145, 178, 0.35)',
            background: 'rgba(8, 145, 178, 0.05)',
            color: '#0891b2', fontSize: '0.82rem', fontWeight: 600, cursor: 'pointer',
          }}
        >
          <GraduationCap size={16} /> دخول كطالب (Mock)
        </button>
        <button
          type="button"
          onClick={() => fillMock('instructor')}
          style={{
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 6,
            padding: '10px 12px', borderRadius: 10,
            border: '1px dashed rgba(124, 58, 237, 0.35)',
            background: 'rgba(124, 58, 237, 0.05)',
            color: '#7c3aed', fontSize: '0.82rem', fontWeight: 600, cursor: 'pointer',
          }}
        >
          <Presentation size={16} /> دخول كمحاضر (Mock)
        </button>
      </div>
      {/* ═══════════ /MOCK LOGIN ═══════════ */}
    </>
  );
}