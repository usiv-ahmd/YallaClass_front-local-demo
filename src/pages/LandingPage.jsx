import { useNavigate } from "react-router-dom";
import {GraduationCap, Presentation } from "lucide-react";
import '../styles/landing.css';

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="landing-container">
      <div className="landing-badge">اول منصه اسئله للحصص بالعربي</div>

      <h1 className="landing-title">
        مرحباً بك في منصة <span>يلا كلاس</span>
      </h1>

      <p className="landing-subtitle">
        اختار هويتك عشان تبدأ — الطالب بيدخل بكود الحصة، والمدرس بيسجل دخوله.
      </p>

      <div className="landing-cards">
        <button type="button" onClick={() => navigate("/student-dashboard")} className="card landing-card">
          <div className="card-heading">
            <div className="card-heading-title">
              <span className="card-icon yellow"><GraduationCap size={26} /></span>
              <div>
                <span className="card-eyebrow">هتدخل على طول</span>
                <h3>أنا طالب</h3>
              </div>
            </div>
          </div>
          <p>اكتب اسمك وكود الحصة، وابدأ الإجابة مع زملائك من غير تسجيل.</p>
          <span className="landing-card-cta">دخول كطالب ←</span>
        </button>

        <button type="button" onClick={() => navigate("/login")} className="card landing-card">
          <div className="card-heading">
            <div className="card-heading-title">
              <span className="card-icon yellow"><Presentation size={26} /></span>
              <div>
                <span className="card-eyebrow">هتدخل على طول</span>
                <h3>أنا مدرس</h3>
              </div>
            </div>
          </div>
          <p>
            سجّل دخولك عشان تنشئ الحصة وتظبط الأسئله والطلاب.<br/>
            تقدر ترفع ملفات الحصة واحنا هنظبط لك اسئلة.
          </p>
          <span className="landing-card-cta">دخول كمدرس ←</span>
        </button>
      </div>
    </div>
  );
}