import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import MoodChart from './MoodChart';
import './MoodTracker.css';

const MoodTracker = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('record'); // 'record', 'history', 'stats'

  // 감정 기록 상태
  const [selectedMood, setSelectedMood] = useState(null);
  const [moodIntensity, setMoodIntensity] = useState(5);
  const [note, setNote] = useState('');
  const [activities, setActivities] = useState([]);
  const [triggers, setTriggers] = useState([]);
  const [customActivity, setCustomActivity] = useState('');
  const [customTrigger, setCustomTrigger] = useState('');

  // AI 분석 결과
  const [aiAnalysis, setAiAnalysis] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 감정 기록 목록 및 통계
  const [moodRecords, setMoodRecords] = useState([]);
  const [moodStats, setMoodStats] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // 감정 옵션 (10가지)
  const moodOptions = [
    { value: 'very_happy', label: '매우 행복', emoji: '😁', color: '#FFD700' },
    { value: 'happy', label: '행복', emoji: '😊', color: '#FFA500' },
    { value: 'excited', label: '신남', emoji: '🤩', color: '#FF69B4' },
    { value: 'neutral', label: '보통', emoji: '😐', color: '#A9A9A9' },
    { value: 'tired', label: '피곤', emoji: '😴', color: '#87CEEB' },
    { value: 'sad', label: '슬픔', emoji: '😢', color: '#4682B4' },
    { value: 'very_sad', label: '매우 슬픔', emoji: '😭', color: '#000080' },
    { value: 'angry', label: '화남', emoji: '😡', color: '#DC143C' },
    { value: 'anxious', label: '불안', emoji: '😰', color: '#9370DB' },
    { value: 'stressed', label: '스트레스', emoji: '😓', color: '#8B4513' },
  ];

  // 활동 옵션
  const activityOptions = [
    '운동', '업무', '공부', '친구 만남', '가족 시간', '취미', '휴식', '명상', '산책', '여행'
  ];

  // 감정 유발 요인 옵션
  const triggerOptions = [
    '스트레스', '좋은 소식', '나쁜 소식', '성공', '실패', '갈등', '칭찬', '비난', '건강 문제', '날씨'
  ];

  // 감정 기록 제출
  const handleSubmitMood = async () => {
    if (!selectedMood) {
      alert('감정을 선택해주세요');
      return;
    }

    setIsSubmitting(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:8000/api/mood-records/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          mood_level: selectedMood,
          mood_intensity: moodIntensity,
          note: note || null,
          activities: activities.length > 0 ? activities : null,
          triggers: triggers.length > 0 ? triggers : null
        })
      });

      if (!response.ok) throw new Error('감정 기록 실패');

      const data = await response.json();
      setAiAnalysis(data);

      // 폼 초기화
      setSelectedMood(null);
      setMoodIntensity(5);
      setNote('');
      setActivities([]);
      setTriggers([]);

      // 기록 목록 새로고침
      fetchMoodRecords();

      // AI 분석 탭으로 자동 전환
      setTimeout(() => {
        setActiveTab('history');
      }, 3000);

    } catch (error) {
      console.error('감정 기록 오류:', error);
      alert('감정 기록 중 오류가 발생했습니다');
    } finally {
      setIsSubmitting(false);
    }
  };

  // 감정 기록 목록 가져오기
  const fetchMoodRecords = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:8000/api/mood-records/?limit=20', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) throw new Error('기록 조회 실패');

      const data = await response.json();
      setMoodRecords(data);
    } catch (error) {
      console.error('기록 조회 오류:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // 감정 통계 가져오기
  const fetchMoodStats = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:8000/api/mood-records/stats?days=30', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) throw new Error('통계 조회 실패');

      const data = await response.json();
      setMoodStats(data);
    } catch (error) {
      console.error('통계 조회 오류:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // 감정 기록 삭제
  const handleDeleteRecord = async (recordId) => {
    if (!window.confirm('이 감정 기록을 삭제하시겠습니까?')) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:8000/api/mood-records/${recordId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) throw new Error('삭제 실패');

      fetchMoodRecords();
      alert('감정 기록이 삭제되었습니다');
    } catch (error) {
      console.error('삭제 오류:', error);
      alert('삭제 중 오류가 발생했습니다');
    }
  };

  // 탭 변경 시 데이터 로드
  useEffect(() => {
    if (activeTab === 'history') {
      fetchMoodRecords();
    } else if (activeTab === 'stats') {
      fetchMoodStats();
    }
  }, [activeTab]);

  // 활동 추가/제거
  const toggleActivity = (activity) => {
    setActivities(prev =>
      prev.includes(activity)
        ? prev.filter(a => a !== activity)
        : [...prev, activity]
    );
  };

  const addCustomActivity = () => {
    if (customActivity.trim() && !activities.includes(customActivity.trim())) {
      setActivities(prev => [...prev, customActivity.trim()]);
      setCustomActivity('');
    }
  };

  // 감정 유발 요인 추가/제거
  const toggleTrigger = (trigger) => {
    setTriggers(prev =>
      prev.includes(trigger)
        ? prev.filter(t => t !== trigger)
        : [...prev, trigger]
    );
  };

  const addCustomTrigger = () => {
    if (customTrigger.trim() && !triggers.includes(customTrigger.trim())) {
      setTriggers(prev => [...prev, customTrigger.trim()]);
      setCustomTrigger('');
    }
  };

  // 감정 트렌드 한글 변환
  const getTrendText = (trend) => {
    const trendMap = {
      'improving': { text: '개선 중', emoji: '📈', color: '#4CAF50' },
      'stable': { text: '안정적', emoji: '➡️', color: '#2196F3' },
      'declining': { text: '주의 필요', emoji: '📉', color: '#FF9800' }
    };
    return trendMap[trend] || trendMap['stable'];
  };

  return (
    <div className="mood-tracker-container">
      <div className="mood-tracker-header">
        <h1 className="mood-tracker-title">
          <span className="mood-icon">🎭</span>
          감정 일기
        </h1>
        <p className="mood-tracker-subtitle">오늘의 감정을 기록하고 AI 분석을 받아보세요</p>
      </div>

      {/* 탭 네비게이션 */}
      <div className="mood-tabs">
        <button
          className={`mood-tab ${activeTab === 'record' ? 'active' : ''}`}
          onClick={() => setActiveTab('record')}
        >
          <span>✍️</span> 기록하기
        </button>
        <button
          className={`mood-tab ${activeTab === 'history' ? 'active' : ''}`}
          onClick={() => setActiveTab('history')}
        >
          <span>📖</span> 내 기록
        </button>
        <button
          className={`mood-tab ${activeTab === 'stats' ? 'active' : ''}`}
          onClick={() => setActiveTab('stats')}
        >
          <span>📊</span> 통계
        </button>
      </div>

      {/* 감정 기록하기 탭 */}
      {activeTab === 'record' && (
        <div className="mood-record-section">
          {/* AI 분석 결과 표시 */}
          {aiAnalysis && (
            <div className="ai-analysis-card fade-in">
              <div className="ai-analysis-header">
                <span className="ai-icon">🤖</span>
                <h3>AI 헬시의 분석</h3>
              </div>

              <div className="ai-analysis-content">
                <div className="analysis-section">
                  <h4>📋 감정 분석</h4>
                  <p>{aiAnalysis.ai_analysis}</p>
                </div>

                <div className="analysis-section">
                  <h4>💡 조언</h4>
                  <p>{aiAnalysis.ai_advice}</p>
                </div>
              </div>

              <button
                className="close-analysis-btn"
                onClick={() => setAiAnalysis(null)}
              >
                닫기
              </button>
            </div>
          )}

          {/* 감정 선택 */}
          <div className="mood-selection-card">
            <h3 className="section-title">지금 기분이 어떠신가요?</h3>
            <div className="mood-options-grid">
              {moodOptions.map((mood) => (
                <button
                  key={mood.value}
                  className={`mood-option ${selectedMood === mood.value ? 'selected' : ''}`}
                  onClick={() => setSelectedMood(mood.value)}
                  style={{
                    '--mood-color': mood.color
                  }}
                >
                  <span className="mood-emoji">{mood.emoji}</span>
                  <span className="mood-label">{mood.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* 감정 강도 */}
          {selectedMood && (
            <div className="mood-intensity-card fade-in">
              <h3 className="section-title">
                감정 강도: <span className="intensity-value">{moodIntensity}/10</span>
              </h3>
              <input
                type="range"
                min="1"
                max="10"
                value={moodIntensity}
                onChange={(e) => setMoodIntensity(parseInt(e.target.value))}
                className="mood-intensity-slider"
                style={{
                  '--intensity-percent': `${(moodIntensity / 10) * 100}%`
                }}
              />
              <div className="intensity-labels">
                <span>약함</span>
                <span>중간</span>
                <span>강함</span>
              </div>
            </div>
          )}

          {/* 메모 */}
          {selectedMood && (
            <div className="mood-note-card fade-in">
              <h3 className="section-title">📝 감정에 대해 더 자세히 말씀해주세요</h3>
              <textarea
                className="mood-note-textarea"
                placeholder="오늘 무슨 일이 있었나요? 어떤 생각을 하고 계신가요?"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                rows="4"
              />
            </div>
          )}

          {/* 활동 */}
          {selectedMood && (
            <div className="mood-activities-card fade-in">
              <h3 className="section-title">🎯 오늘 무엇을 하셨나요?</h3>
              <div className="tag-options">
                {activityOptions.map((activity) => (
                  <button
                    key={activity}
                    className={`tag-option ${activities.includes(activity) ? 'selected' : ''}`}
                    onClick={() => toggleActivity(activity)}
                  >
                    {activity}
                  </button>
                ))}
              </div>
              <div className="custom-tag-input">
                <input
                  type="text"
                  placeholder="직접 입력..."
                  value={customActivity}
                  onChange={(e) => setCustomActivity(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && addCustomActivity()}
                />
                <button onClick={addCustomActivity}>추가</button>
              </div>
            </div>
          )}

          {/* 감정 유발 요인 */}
          {selectedMood && (
            <div className="mood-triggers-card fade-in">
              <h3 className="section-title">💭 이 감정의 원인은 무엇인가요?</h3>
              <div className="tag-options">
                {triggerOptions.map((trigger) => (
                  <button
                    key={trigger}
                    className={`tag-option ${triggers.includes(trigger) ? 'selected' : ''}`}
                    onClick={() => toggleTrigger(trigger)}
                  >
                    {trigger}
                  </button>
                ))}
              </div>
              <div className="custom-tag-input">
                <input
                  type="text"
                  placeholder="직접 입력..."
                  value={customTrigger}
                  onChange={(e) => setCustomTrigger(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && addCustomTrigger()}
                />
                <button onClick={addCustomTrigger}>추가</button>
              </div>
            </div>
          )}

          {/* 제출 버튼 */}
          {selectedMood && (
            <button
              className="submit-mood-btn fade-in"
              onClick={handleSubmitMood}
              disabled={isSubmitting}
            >
              {isSubmitting ? '분석 중...' : '🤖 AI 분석 받기'}
            </button>
          )}
        </div>
      )}

      {/* 감정 기록 목록 탭 */}
      {activeTab === 'history' && (
        <div className="mood-history-section">
          {isLoading ? (
            <div className="loading-spinner">로딩 중...</div>
          ) : moodRecords.length === 0 ? (
            <div className="empty-state">
              <span className="empty-icon">📝</span>
              <p>아직 기록된 감정이 없습니다</p>
              <button onClick={() => setActiveTab('record')}>첫 감정 기록하기</button>
            </div>
          ) : (
            <div className="mood-records-list">
              {moodRecords.map((record) => {
                const mood = moodOptions.find(m => m.value === record.mood_level);
                const recordDate = new Date(record.recorded_at);

                return (
                  <div key={record.id} className="mood-record-card">
                    <div className="mood-record-header">
                      <div className="mood-record-emoji" style={{ color: mood?.color }}>
                        {mood?.emoji}
                      </div>
                      <div className="mood-record-info">
                        <h4>{mood?.label}</h4>
                        <span className="mood-record-date">
                          {recordDate.toLocaleDateString('ko-KR', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </span>
                      </div>
                      <div className="mood-record-intensity">
                        <span className="intensity-badge">{record.mood_intensity}/10</span>
                      </div>
                    </div>

                    {record.note && (
                      <div className="mood-record-note">
                        <p>{record.note}</p>
                      </div>
                    )}

                    {record.activities && (
                      <div className="mood-record-tags">
                        <strong>활동:</strong>
                        <div className="tag-list">
                          {JSON.parse(record.activities).map((activity, idx) => (
                            <span key={idx} className="tag">{activity}</span>
                          ))}
                        </div>
                      </div>
                    )}

                    {record.triggers && (
                      <div className="mood-record-tags">
                        <strong>요인:</strong>
                        <div className="tag-list">
                          {JSON.parse(record.triggers).map((trigger, idx) => (
                            <span key={idx} className="tag">{trigger}</span>
                          ))}
                        </div>
                      </div>
                    )}

                    {record.ai_analysis && (
                      <div className="mood-record-ai">
                        <details>
                          <summary>🤖 AI 분석 보기</summary>
                          <div className="ai-content">
                            <p><strong>분석:</strong> {record.ai_analysis}</p>
                            <p><strong>조언:</strong> {record.ai_advice}</p>
                          </div>
                        </details>
                      </div>
                    )}

                    <button
                      className="delete-record-btn"
                      onClick={() => handleDeleteRecord(record.id)}
                    >
                      삭제
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* 통계 탭 */}
      {activeTab === 'stats' && (
        <div className="mood-stats-section">
          {isLoading ? (
            <div className="loading-spinner">로딩 중...</div>
          ) : !moodStats || moodStats.total_records === 0 ? (
            <div className="empty-state">
              <span className="empty-icon">📊</span>
              <p>통계를 표시할 데이터가 부족합니다</p>
              <button onClick={() => setActiveTab('record')}>감정 기록하기</button>
            </div>
          ) : (
            <>
              {/* Recharts 감정 차트 */}
              <MoodChart records={moodRecords.length > 0 ? moodRecords : []} />

              <div className="stats-cards">
                <div className="stat-card">
                  <div className="stat-icon">📈</div>
                  <div className="stat-content">
                    <h3>감정 트렌드</h3>
                    <p className="stat-value" style={{ color: getTrendText(moodStats.mood_trend).color }}>
                      {getTrendText(moodStats.mood_trend).emoji} {getTrendText(moodStats.mood_trend).text}
                    </p>
                  </div>
                </div>

              <div className="stat-card">
                <div className="stat-icon">⭐</div>
                <div className="stat-content">
                  <h3>평균 감정 점수</h3>
                  <p className="stat-value">{moodStats.average_mood.toFixed(1)} / 10</p>
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-icon">
                  {moodOptions.find(m => m.value === moodStats.most_common_mood)?.emoji || '😊'}
                </div>
                <div className="stat-content">
                  <h3>가장 많은 감정</h3>
                  <p className="stat-value">
                    {moodOptions.find(m => m.value === moodStats.most_common_mood)?.label || '보통'}
                  </p>
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-icon">📝</div>
                <div className="stat-content">
                  <h3>총 기록 수</h3>
                  <p className="stat-value">{moodStats.total_records}개</p>
                </div>
              </div>

              <div className="stat-card full-width">
                <h3>감정 분포</h3>
                <div className="mood-distribution">
                  {Object.entries(moodStats.mood_distribution).map(([mood, count]) => {
                    const moodInfo = moodOptions.find(m => m.value === mood);
                    const percentage = (count / moodStats.total_records) * 100;

                    return (
                      <div key={mood} className="distribution-item">
                        <div className="distribution-label">
                          <span>{moodInfo?.emoji}</span>
                          <span>{moodInfo?.label}</span>
                          <span className="distribution-count">{count}회</span>
                        </div>
                        <div className="distribution-bar">
                          <div
                            className="distribution-fill"
                            style={{
                              width: `${percentage}%`,
                              background: moodInfo?.color
                            }}
                          />
                        </div>
                        <span className="distribution-percent">{percentage.toFixed(0)}%</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default MoodTracker;
