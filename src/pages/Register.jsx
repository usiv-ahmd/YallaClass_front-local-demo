import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Presentation, ArrowLeft } from 'lucide-react';
import '../styles/auth.css';

export default function Register() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    specialty: '',
  });
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // TODO: send to backend
    console.log('Instructor registration:', { ...formData, role: 'instructor' });
    navigate('/instructor-dashboard');
  };

  return (
    <div className="card auth-container">
      <div className="auth-header">
        <h2>إنشاء حساب مدرس</h2>
        <p>املأ بياناتك عشان تنشئ حساب وتحكم في حصصك.</p>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>الاسم الكامل</label>
          <input type="text" name="name" placeholder="الاسم الكامل" onChange={handleChange} required />
        </div>

        <div className="form-group">
          <label>البريد الإلكتروني</label>
          <input type="email" name="email" placeholder="البريد الإلكتروني" onChange={handleChange} required />
        </div>

        <div className="form-group">
          <label>كلمة المرور</label>
          <input type="password" name="password" placeholder="كلمة المرور" onChange={handleChange} required />
        </div>

        <div className="form-group">
          <label>التخصص / المجال</label>
          <input type="text" name="specialty" placeholder="التخصص / المجال" onChange={handleChange} />
        </div>

        <button type="submit" className="submit-btn">إنشاء حساب مدرس</button>
      </form>

      <p className="auth-switch">
        عندك حساب بالفعل؟ <Link to="/login">سجّل دخول</Link>
      </p>

      <p className="auth-back">
        <Link to="/"><ArrowLeft size={14} /> رجوع للصفحة الرئيسية</Link>
      </p>
    </div>
  );
}