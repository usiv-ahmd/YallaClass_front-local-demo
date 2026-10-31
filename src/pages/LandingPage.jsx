import { Link } from 'react-router-dom';
import '../styles/landing.css';

export default function LandingPage() {
  return (
    <div className="landing-container">
      <div className="landing-badge">🚀 المنصة التفاعلية الأولى</div>
      
      <h1 className="landing-title">
        مرحباً بك في منصة <span>يلا كلاس</span>
      </h1>
      
      <p className="landing-subtitle">
        تجربة تعليمية حماسية تجمع بين المحاضرين والطلاب في بيئة تنافسية مليئة بالتفاعل والمكافآت المباشرة!
      </p>

      <div className="landing-cards">
        <div className="landing-card">
          <div className="landing-card-icon">👨‍🏫</div>
          <h3>لوحة المحاضر</h3>
          <p>عرض الأسئلة والعدادات والتنافس المباشر للطلاب مع تحكم كامل وإحصائيات للحصة.</p>
        </div>

        <div className="landing-card">
          <div className="landing-card-icon">🎓</div>
          <h3>واجهة الطالب</h3>
          <p>إجابة سريعة، جمع نقاط السلسلة (Streak)، وفتح صناديق الهدايا والمفاجآت.</p>
        </div>
      </div>

      <div className="auth-pages">
        <Link to="/login">
          <button className="btn-secondary">تسجيل الدخول</button>
        </Link>
        <Link to="/register">
          <button className="btn-primary">إنشاء حساب جديد</button>
        </Link>
      </div>
    </div>
  );
}