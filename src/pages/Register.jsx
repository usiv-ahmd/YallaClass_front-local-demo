import { useState } from 'react';
import '../styles/auth.css';

export default function Register() {
  const [role, setRole] = useState('student');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    specialty: '',
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const dataToSend = {
      name: formData.name,
      email: formData.email,
      password: formData.password,
      role: role,
    };

    if (role === 'instructor') {
      dataToSend.specialty = formData.specialty;
    }

    console.log("Role:", role);
    console.log("Data to send:", dataToSend);
  };

  return (
    <div className="auth-container">
      <h2>إنشاء حساب جديد</h2>

      <div className="role-selector">
        <button 
          className={role === 'student' ? 'active' : ''} 
          onClick={() => setRole('student')}
        >
          طالب (Student)
        </button>
        <button 
          className={role === 'instructor' ? 'active' : ''} 
          onClick={() => setRole('instructor')}
        >
          محاضر (Instructor)
        </button>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>الاسم الكامل</label>
          <input 
            type="text" 
            name="name" 
            placeholder="الاسم الكامل" 
            onChange={handleChange} 
            required 
          />
        </div>
        <div className="form-group">
          <label>البريد الإلكتروني</label>
          <input 
            type="email" 
            name="email" 
            placeholder="البريد الإلكتروني" 
            onChange={handleChange} 
            required 
          />
        </div>
        <div className="form-group">
          <label>كلمة المرور</label>
          <input 
            type="password" 
            name="password" 
            placeholder="كلمة المرور" 
            onChange={handleChange} 
            required 
          />
        </div>
        {role === 'instructor' && (
          <div className="form-group">
            <label>التخصص / المجال</label>
            <input 
              type="text" 
              name="specialty" 
              placeholder="التخصص / المجال" 
              onChange={handleChange} 
            />
          </div>
        )}

          <button type="submit" className='submit-btn'>
            إنشاء حساب كـ {role === 'student' ? 'طالب' : 'محاضر'}
          </button>
      </form>
    </div>
  );
}