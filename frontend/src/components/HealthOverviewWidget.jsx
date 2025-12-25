import { useState, useEffect } from 'react';
import './HealthOverviewWidget.css';

const HealthOverviewWidget = () => {
  const [healthData, setHealthData] = useState({
    mentalHealth: 75,
    physicalHealth: 82,
    diseaseRisk: 25,
    improvementRate: 65,
  });

  const [isPlaying, setIsPlaying] = useState(false);

  // 음성 안내 (Web Speech API 사용)
  const speakHealthStatus = () => {
    if ('speechSynthesis' in window) {
      try {
        // 이전 음성 취소
        window.speechSynthesis.cancel();

        setIsPlaying(true);

        // 약간의 지연 후 음성 시작
        setTimeout(() => {
          const text = `현재 건강 상태를 안내해드립니다. 정신 건강 점수는 ${healthData.mentalHealth}점으로 양호합니다. 육체 건강 점수는 ${healthData.physicalHealth}점입니다. 질병 위험도는 ${healthData.diseaseRisk}퍼센트로 낮은 수준입니다. 질병 호전도는 ${healthData.improvementRate}퍼센트로 개선되고 있습니다. 건강한 하루 되세요.`;

          const utterance = new SpeechSynthesisUtterance(text);
          utterance.lang = 'ko-KR';
          utterance.rate = 0.9;
          utterance.pitch = 1.0;
          utterance.volume = 1.0;

          utterance.onend = () => {
            setIsPlaying(false);
          };

          utterance.onerror = (event) => {
            console.error('TTS 오류:', event);
            setIsPlaying(false);
            alert('음성 안내 중 오류가 발생했습니다.');
          };

          window.speechSynthesis.speak(utterance);
        }, 100);
      } catch (error) {
        console.error('음성 안내 오류:', error);
        setIsPlaying(false);
        alert('음성 안내 중 오류가 발생했습니다.');
      }
    } else {
      alert('음성 안내 기능을 지원하지 않는 브라우저입니다.');
    }
  };

  // 점수에 따른 색상
  const getScoreColor = (score) => {
    if (score >= 80) return '#4ade80';
    if (score >= 60) return '#fbbf24';
    if (score >= 40) return '#fb923c';
    return '#ef4444';
  };

  // 위험도에 따른 색상 (역순)
  const getRiskColor = (risk) => {
    if (risk <= 20) return '#4ade80';
    if (risk <= 40) return '#fbbf24';
    if (risk <= 60) return '#fb923c';
    return '#ef4444';
  };

  return (
    <div className="health-overview-widget">
      <div className="widget-header">
        <h3>🏥 건강 종합 현황</h3>
        <button
          className={`voice-button ${isPlaying ? 'playing' : ''}`}
          onClick={speakHealthStatus}
          disabled={isPlaying}
        >
          {isPlaying ? '🔊 재생중...' : '🔊 음성 안내'}
        </button>
      </div>

      <div className="health-metrics">
        {/* 정신 건강 */}
        <div className="metric-card">
          <div className="metric-icon">🧠</div>
          <div className="metric-content">
            <div className="metric-label">정신 건강</div>
            <div className="metric-value" style={{ color: getScoreColor(healthData.mentalHealth) }}>
              {healthData.mentalHealth}점
            </div>
            <div className="metric-bar">
              <div
                className="metric-fill"
                style={{
                  width: `${healthData.mentalHealth}%`,
                  backgroundColor: getScoreColor(healthData.mentalHealth)
                }}
              />
            </div>
            <div className="metric-status">
              {healthData.mentalHealth >= 80 ? '매우 좋음' :
               healthData.mentalHealth >= 60 ? '양호' :
               healthData.mentalHealth >= 40 ? '주의' : '개선 필요'}
            </div>
          </div>
        </div>

        {/* 육체 건강 */}
        <div className="metric-card">
          <div className="metric-icon">💪</div>
          <div className="metric-content">
            <div className="metric-label">육체 건강</div>
            <div className="metric-value" style={{ color: getScoreColor(healthData.physicalHealth) }}>
              {healthData.physicalHealth}점
            </div>
            <div className="metric-bar">
              <div
                className="metric-fill"
                style={{
                  width: `${healthData.physicalHealth}%`,
                  backgroundColor: getScoreColor(healthData.physicalHealth)
                }}
              />
            </div>
            <div className="metric-status">
              {healthData.physicalHealth >= 80 ? '매우 좋음' :
               healthData.physicalHealth >= 60 ? '양호' :
               healthData.physicalHealth >= 40 ? '주의' : '개선 필요'}
            </div>
          </div>
        </div>

        {/* 질병 위험도 */}
        <div className="metric-card">
          <div className="metric-icon">⚠️</div>
          <div className="metric-content">
            <div className="metric-label">질병 위험도</div>
            <div className="metric-value" style={{ color: getRiskColor(healthData.diseaseRisk) }}>
              {healthData.diseaseRisk}%
            </div>
            <div className="metric-bar">
              <div
                className="metric-fill"
                style={{
                  width: `${healthData.diseaseRisk}%`,
                  backgroundColor: getRiskColor(healthData.diseaseRisk)
                }}
              />
            </div>
            <div className="metric-status">
              {healthData.diseaseRisk <= 20 ? '낮음' :
               healthData.diseaseRisk <= 40 ? '보통' :
               healthData.diseaseRisk <= 60 ? '주의' : '높음'}
            </div>
          </div>
        </div>

        {/* 질병 호전도 */}
        <div className="metric-card">
          <div className="metric-icon">📈</div>
          <div className="metric-content">
            <div className="metric-label">질병 호전도</div>
            <div className="metric-value" style={{ color: getScoreColor(healthData.improvementRate) }}>
              {healthData.improvementRate}%
            </div>
            <div className="metric-bar">
              <div
                className="metric-fill"
                style={{
                  width: `${healthData.improvementRate}%`,
                  backgroundColor: getScoreColor(healthData.improvementRate)
                }}
              />
            </div>
            <div className="metric-status">
              {healthData.improvementRate >= 80 ? '매우 호전' :
               healthData.improvementRate >= 60 ? '호전중' :
               healthData.improvementRate >= 40 ? '유지' : '개선 필요'}
            </div>
          </div>
        </div>
      </div>

      {/* 간단한 추세 그래프 */}
      <div className="trend-section">
        <h4>📊 주간 건강 추세</h4>
        <div className="trend-chart">
          <div className="chart-bars">
            {[65, 68, 72, 75, 78, 80, 82].map((value, index) => (
              <div key={index} className="chart-bar-container">
                <div
                  className="chart-bar"
                  style={{
                    height: `${value}%`,
                    backgroundColor: getScoreColor(value)
                  }}
                >
                  <span className="bar-value">{value}</span>
                </div>
                <div className="bar-label">
                  {['월', '화', '수', '목', '금', '토', '일'][index]}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* AI 건강 조언 */}
      <div className="health-advice">
        <div className="advice-icon">🤖</div>
        <div className="advice-content">
          <div className="advice-title">AI 건강 조언</div>
          <div className="advice-text">
            전반적인 건강 상태가 양호합니다. 정신 건강 개선을 위해 매일 10분 명상을 추천드립니다.
            수면 시간을 7시간 이상 유지하시면 더욱 좋습니다.
          </div>
        </div>
      </div>
    </div>
  );
};

export default HealthOverviewWidget;
