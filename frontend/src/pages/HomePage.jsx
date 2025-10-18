import { Link } from 'react-router-dom';
import './HomePage.css';

const HomePage = () => {
  return (
    <div className="home-page">
      <div className="hero-section">
        <h1>AI 건강 상담 챗봇</h1>
        <p>인공지능 기반 건강 관리 솔루션</p>
        <div className="cta-buttons">
          <Link to="/chat" className="btn-primary">
            상담 시작하기
          </Link>
          <Link to="/health" className="btn-secondary">
            건강 기록 보기
          </Link>
        </div>
      </div>

      <div className="features-section">
        <h2>주요 기능</h2>
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon">💬</div>
            <h3>증상 상담</h3>
            <p>AI가 증상을 분석하고 초기 상담을 제공합니다</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">📊</div>
            <h3>건강 기록</h3>
            <p>혈압, 혈당 등 건강 데이터를 기록하고 관리합니다</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">💊</div>
            <h3>복약 관리</h3>
            <p>약 복용 시간을 관리하고 알림을 받습니다</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">🧠</div>
            <h3>정신 건강</h3>
            <p>스트레스와 우울감을 체크하고 조언을 받습니다</p>
          </div>
        </div>
      </div>

      <div className="disclaimer-section">
        <h3>⚠️ 중요 안내</h3>
        <p>
          본 서비스는 <strong>정보 제공 목적</strong>으로만 사용되며 의학적 진단이나 치료를
          대체하지 않습니다. 건강 문제가 있는 경우 반드시 전문 의료인과 상담하시기 바랍니다.
        </p>
      </div>
    </div>
  );
};

export default HomePage;
