import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Presentation, ArrowRight, ArrowLeft } from 'lucide-react';
import '../styles/auth.css';

const MOCK_INSTRUCTOR = {
  email: 'instructor@yalla.com',
  password: 'instructor123',
};

export default function Login() {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (error) setError('');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (
      formData.email.trim() === MOCK_INSTRUCTOR.email &&
      formData.password === MOCK_INSTRUCTOR.password
    ) {
      navigate('/instructor-dashboard');
    } else {
      setError('البريد أو كلمة المرور غلط');
    }
  };

  const fillMock = () => {
    setFormData({ ...MOCK_INSTRUCTOR });
    setError('');
  };

  return (
    <>
      <div className="card auth-container">
        <div className="auth-header">
          <h2>تسجيل دخول المدرس</h2>
          <p>سجّل دخولك عشان تنشئ الحصص وتتحكم فيها.</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>البريد الإلكتروني</label>
            <input
              type="email"
              name="email"
              placeholder="instructor@yalla.com"
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

          {error && <p className="auth-error">{error}</p>}

          <button type="submit" className="submit-btn">دخول كمدرس</button>
        </form>

        <p className="auth-switch">
          
        </p>

        <p className="auth-switch">
          انت طالب؟ <Link to="/student-dashboard">دوس هنا</Link><br/>
          ليس لديك حساب مدرس؟ <Link to="/register">إنشاء حساب جديد</Link>
        </p>

        <p className="auth-back">
          <Link to="/"><ArrowLeft size={14} /> رجوع للصفحة الرئيسية</Link>
        </p>
      </div>

      {/* ═══════════ MOCK LOGIN (temporary) ═══════════ */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 18 }}>
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