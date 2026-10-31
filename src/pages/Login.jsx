import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../styles/auth.css';

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

  return (
    <div className="auth-container">
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
  );
}