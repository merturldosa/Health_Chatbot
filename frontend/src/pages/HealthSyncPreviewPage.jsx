import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './HealthSyncPreviewPage.css';

const HealthSyncPreviewPage = () => {
  const navigate = useNavigate();
  const [syncStatus, setSyncStatus] = useState({
    apple: true,
    samsung: false,
    fitbit: false
  });
  
  const [isSyncing, setIsSyncing] = useState(false);

  // 모의 데이터 (실제 연동 시에는 네이티브 플러그인에서 가져옴)
  const healthData = {
    steps: { value: 8432, target: 10000, source: 'Apple Health' },
    sleep: { value: '7h 12m', quality: 'Good', source: 'Sleep Cycle' },
    heartRate: { value: 72, min: 60, max: 110, source: 'Apple Watch' },
    calories: { value: 1850, target: 2200, source: 'MyFitnessPal' }
  };

  const handleSync = () => {
    setIsSyncing(true);
    setTimeout(() => {
      setIsSyncing(false);
      alert('모든 웨어러블 기기와 데이터 동기화가 완료되었습니다.');
    }, 2000);
  };

  const toggleSource = (source) => {
    setSyncStatus(prev => ({ ...prev, [source]: !prev[source] }));
  };

  return (
    <div className="health-sync-container fade-in">
      <header className="sync-header">
        <button onClick={() => navigate(-1)} className="back-btn">← 뒤로</button>
        <h1>통합 건강 데이터 센터</h1>
        <p className="subtitle">웨어러블 기기 및 타사 건강 앱과 데이터를 연동합니다.</p>
      </header>

      <div className="sync-grid">
        {/* 왼쪽: 연동 관리 카드 */}
        <section className="integration-panel">
          <h2>📡 기기 및 앱 연동</h2>
          <div className="source-list">
            <div className={`source-item ${syncStatus.apple ? 'active' : ''}`}>
              <div className="source-icon apple">🍎</div>
              <div className="source-info">
                <h3>Apple Health</h3>
                <p>{syncStatus.apple ? '연동됨 (최근: 방금 전)' : '연동 안 됨'}</p>
              </div>
              <button 
                className={`toggle-btn ${syncStatus.apple ? 'on' : 'off'}`}
                onClick={() => toggleSource('apple')}
              >
                {syncStatus.apple ? 'ON' : 'OFF'}
              </button>
            </div>

            <div className={`source-item ${syncStatus.samsung ? 'active' : ''}`}>
              <div className="source-icon samsung">S</div>
              <div className="source-info">
                <h3>Samsung Health</h3>
                <p>{syncStatus.samsung ? '연동됨' : '연동하기'}</p>
              </div>
              <button 
                className={`toggle-btn ${syncStatus.samsung ? 'on' : 'off'}`}
                onClick={() => toggleSource('samsung')}
              >
                {syncStatus.samsung ? 'ON' : 'OFF'}
              </button>
            </div>

            <div className={`source-item ${syncStatus.fitbit ? 'active' : ''}`}>
              <div className="source-icon fitbit">⌚</div>
              <div className="source-info">
                <h3>Fitbit</h3>
                <p>{syncStatus.fitbit ? '연동됨' : '연동하기'}</p>
              </div>
              <button 
                className={`toggle-btn ${syncStatus.fitbit ? 'on' : 'off'}`}
                onClick={() => toggleSource('fitbit')}
              >
                {syncStatus.fitbit ? 'ON' : 'OFF'}
              </button>
            </div>
          </div>

          <button 
            className={`sync-now-btn ${isSyncing ? 'spinning' : ''}`} 
            onClick={handleSync}
            disabled={isSyncing}
          >
            {isSyncing ? '🔄 데이터 동기화 중...' : '🔄 지금 동기화'}
          </button>
        </section>

        {/* 오른쪽: 통합 대시보드 미리보기 */}
        <section className="preview-panel">
          <h2>📊 AI 통합 분석 미리보기</h2>
          <div className="data-cards">
            <div className="data-card steps">
              <div className="card-header">
                <span className="icon">👣</span>
                <span className="source-badge">From {healthData.steps.source}</span>
              </div>
              <div className="card-value">{healthData.steps.value.toLocaleString()}</div>
              <div className="card-label">걸음 수 / 목표 {healthData.steps.target.toLocaleString()}</div>
              <div className="progress-bar">
                <div className="fill" style={{width: '84%'}}></div>
              </div>
            </div>

            <div className="data-card heart">
              <div className="card-header">
                <span className="icon">❤️</span>
                <span className="source-badge">From {healthData.heartRate.source}</span>
              </div>
              <div className="card-value">{healthData.heartRate.value} <span className="unit">bpm</span></div>
              <div className="card-label">평균 심박수</div>
              <div className="micro-chart">
                {/* CSS로 간단한 파형 표현 */}
                <div className="wave"></div>
              </div>
            </div>

            <div className="data-card sleep">
              <div className="card-header">
                <span className="icon">🌙</span>
                <span className="source-badge">From {healthData.sleep.source}</span>
              </div>
              <div className="card-value">{healthData.sleep.value}</div>
              <div className="card-label">수면 시간 ({healthData.sleep.quality})</div>
            </div>
          </div>

          <div className="ai-insight-box">
            <h3>🤖 AI 건강 비서의 분석</h3>
            <p>
              "애플 워치로 측정된 심박수와 수면 데이터를 분석해보니, 
              평소보다 수면 효율이 <strong>15% 높습니다</strong>. 
              오늘 컨디션이 좋아 보이네요! 목표 걸음 수 달성까지 
              <strong>1,500보</strong> 남았습니다. 가벼운 산책을 추천해요."
            </p>
          </div>
        </section>
      </div>
    </div>
  );
};

export default HealthSyncPreviewPage;
