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
        اختار هويتك عشان تبدأ — الطالب بيدخل بكود الحصة، والمدرس بيسجل دخوله.
      </p>

      <div className="landing-cards">
        <Link to="/student-dashboard" className="card landing-card landing-card--student">
          <div className="landing-card-icon">🎓</div>
          <h3>أنا طالب</h3>
          <p>اكتب اسمك وكود الحصة، وابدأ الإجابة مع زملائك من غير تسجيل.</p>
          <span className="landing-card-cta">دخول كطالب ←</span>
        </Link>

        <Link to="/login" className="card landing-card landing-card--instructor">
          <div className="landing-card-icon">👨‍🏫</div>
          <h3>أنا مدرس</h3>
          <p>سجّل دخولك عشان تنشئ الحصة وتتحكم في الأسئلة والترتيب.</p>
          <span className="landing-card-cta">دخول كمدرس ←</span>
        </Link>
      </div>
    </div>
  );
}