import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import './SleepTracker.css';

const SleepTracker = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('record'); // 'record', 'history', 'stats'

  // 수면 기록 상태
  const [sleepStart, setSleepStart] = useState('');
  const [sleepEnd, setSleepEnd] = useState('');
  const [sleepQuality, setSleepQuality] = useState(5);
  const [deepSleepHours, setDeepSleepHours] = useState('');
  const [remSleepHours, setRemSleepHours] = useState('');
  const [lightSleepHours, setLightSleepHours] = useState('');
  const [awakeCount, setAwakeCount] = useState(0);
  const [sleepEnvironment, setSleepEnvironment] = useState('');
  const [roomTemperature, setRoomTemperature] = useState('');
  const [moodBefore, setMoodBefore] = useState('');
  const [moodAfter, setMoodAfter] = useState('');
  const [notes, setNotes] = useState('');

  // 수면 기록 목록 및 통계
  const [sleepRecords, setSleepRecords] = useState([]);
  const [sleepStats, setSleepStats] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 수면 환경 옵션
  const environmentOptions = [
    '조용함', '시끄러움', '어두움', '밝음', '쾌적함', '불편함'
  ];

  // 기분 옵션
  const moodOptions = [
    '매우 좋음', '좋음', '보통', '나쁨', '매우 나쁨'
  ];

  // 수면 기록 제출
  const handleSubmitSleep = async () => {
    if (!sleepStart || !sleepEnd) {
      alert('수면 시작 및 종료 시간을 입력해주세요');
      return;
    }

    const start = new Date(sleepStart);
    const end = new Date(sleepEnd);
    const durationMs = end - start;
    const durationHours = durationMs / (1000 * 60 * 60);

    if (durationHours <= 0) {
      alert('수면 종료 시간은 시작 시간보다 늦어야 합니다');
      return;
    }

    setIsSubmitting(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:8000/api/sleep/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          sleep_start: sleepStart,
          sleep_end: sleepEnd,
          duration_hours: parseFloat(durationHours.toFixed(2)),
          sleep_quality: sleepQuality,
          deep_sleep_hours: deepSleepHours ? parseFloat(deepSleepHours) : null,
          rem_sleep_hours: remSleepHours ? parseFloat(remSleepHours) : null,
          light_sleep_hours: lightSleepHours ? parseFloat(lightSleepHours) : null,
          awake_count: awakeCount || null,
          sleep_environment: sleepEnvironment || null,
          room_temperature: roomTemperature ? parseFloat(roomTemperature) : null,
          mood_before: moodBefore || null,
          mood_after: moodAfter || null,
          notes: notes || null
        })
      });

      if (!response.ok) throw new Error('수면 기록 실패');

      alert('수면 기록이 저장되었습니다');

      // 폼 초기화
      setSleepStart('');
      setSleepEnd('');
      setSleepQuality(5);
      setDeepSleepHours('');
      setRemSleepHours('');
      setLightSleepHours('');
      setAwakeCount(0);
      setSleepEnvironment('');
      setRoomTemperature('');
      setMoodBefore('');
      setMoodAfter('');
      setNotes('');

      // 기록 목록 새로고침
      fetchSleepRecords();
      fetchSleepStats();

      // 기록 탭으로 자동 전환
      setActiveTab('history');

    } catch (error) {
      console.error('수면 기록 오류:', error);
      alert('수면 기록 중 오류가 발생했습니다');
    } finally {
      setIsSubmitting(false);
    }
  };

  // 수면 기록 목록 조회
  const fetchSleepRecords = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:8000/api/sleep/?limit=30', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) throw new Error('수면 기록 조회 실패');

      const data = await response.json();
      setSleepRecords(data);
    } catch (error) {
      console.error('수면 기록 조회 오류:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // 수면 통계 조회
  const fetchSleepStats = async (days = 7) => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:8000/api/sleep/statistics?days=${days}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) throw new Error('수면 통계 조회 실패');

      const data = await response.json();
      setSleepStats(data);
    } catch (error) {
      console.error('수면 통계 조회 오류:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // 수면 기록 삭제
  const handleDeleteRecord = async (sleepId) => {
    if (!confirm('이 수면 기록을 삭제하시겠습니까?')) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:8000/api/sleep/${sleepId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) throw new Error('수면 기록 삭제 실패');

      alert('수면 기록이 삭제되었습니다');
      fetchSleepRecords();
      fetchSleepStats();
    } catch (error) {
      console.error('수면 기록 삭제 오류:', error);
      alert('수면 기록 삭제 중 오류가 발생했습니다');
    }
  };

  // 컴포넌트 마운트 시 데이터 로드
  useEffect(() => {
    if (activeTab === 'history') {
      fetchSleepRecords();
    } else if (activeTab === 'stats') {
      fetchSleepStats();
    }
  }, [activeTab]);

  // 수면 품질에 따른 색상
  const getQualityColor = (quality) => {
    if (quality >= 8) return '#4ade80';
    if (quality >= 6) return '#fbbf24';
    if (quality >= 4) return '#fb923c';
    return '#ef4444';
  };

  // 날짜 포맷팅
  const formatDateTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('ko-KR', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="sleep-tracker">
      <div className="sleep-tracker-header">
        <h2>😴 수면 관리</h2>
        <p>좋은 수면은 건강의 기본입니다</p>
      </div>

      <div className="sleep-tabs">
        <button
          className={activeTab === 'record' ? 'active' : ''}
          onClick={() => setActiveTab('record')}
        >
          기록하기
        </button>
        <button
          className={activeTab === 'history' ? 'active' : ''}
          onClick={() => setActiveTab('history')}
        >
          수면 기록
        </button>
        <button
          className={activeTab === 'stats' ? 'active' : ''}
          onClick={() => setActiveTab('stats')}
        >
          통계
        </button>
      </div>

      {activeTab === 'record' && (
        <div className="sleep-record-form">
          <div className="form-section">
            <h3>기본 정보</h3>
            <div className="form-group">
              <label>수면 시작 시간 *</label>
              <input
                type="datetime-local"
                value={sleepStart}
                onChange={(e) => setSleepStart(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label>수면 종료 시간 *</label>
              <input
                type="datetime-local"
                value={sleepEnd}
                onChange={(e) => setSleepEnd(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label>수면 품질: {sleepQuality}/10</label>
              <input
                type="range"
                min="1"
                max="10"
                value={sleepQuality}
                onChange={(e) => setSleepQuality(parseInt(e.target.value))}
                style={{
                  background: `linear-gradient(to right, ${getQualityColor(sleepQuality)} 0%, ${getQualityColor(sleepQuality)} ${sleepQuality * 10}%, #ddd ${sleepQuality * 10}%, #ddd 100%)`
                }}
              />
              <div className="quality-labels">
                <span>매우 나쁨</span>
                <span>매우 좋음</span>
              </div>
            </div>
          </div>

          <div className="form-section">
            <h3>상세 정보 (선택)</h3>
            <div className="form-row">
              <div className="form-group">
                <label>깊은 수면 (시간)</label>
                <input
                  type="number"
                  step="0.1"
                  placeholder="예: 2.5"
                  value={deepSleepHours}
                  onChange={(e) => setDeepSleepHours(e.target.value)}
                />
              </div>
              <div className="form-group">
                <label>렘 수면 (시간)</label>
                <input
                  type="number"
                  step="0.1"
                  placeholder="예: 1.5"
                  value={remSleepHours}
                  onChange={(e) => setRemSleepHours(e.target.value)}
                />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>얕은 수면 (시간)</label>
                <input
                  type="number"
                  step="0.1"
                  placeholder="예: 3.0"
                  value={lightSleepHours}
                  onChange={(e) => setLightSleepHours(e.target.value)}
                />
              </div>
              <div className="form-group">
                <label>깬 횟수</label>
                <input
                  type="number"
                  placeholder="0"
                  value={awakeCount}
                  onChange={(e) => setAwakeCount(parseInt(e.target.value) || 0)}
                />
              </div>
            </div>
            <div className="form-group">
              <label>수면 환경</label>
              <select
                value={sleepEnvironment}
                onChange={(e) => setSleepEnvironment(e.target.value)}
              >
                <option value="">선택하세요</option>
                {environmentOptions.map(env => (
                  <option key={env} value={env}>{env}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>실내 온도 (°C)</label>
              <input
                type="number"
                step="0.5"
                placeholder="예: 22.0"
                value={roomTemperature}
                onChange={(e) => setRoomTemperature(e.target.value)}
              />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>취침 전 기분</label>
                <select
                  value={moodBefore}
                  onChange={(e) => setMoodBefore(e.target.value)}
                >
                  <option value="">선택하세요</option>
                  {moodOptions.map(mood => (
                    <option key={mood} value={mood}>{mood}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>기상 후 기분</label>
                <select
                  value={moodAfter}
                  onChange={(e) => setMoodAfter(e.target.value)}
                >
                  <option value="">선택하세요</option>
                  {moodOptions.map(mood => (
                    <option key={mood} value={mood}>{mood}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="form-group">
              <label>메모</label>
              <textarea
                rows="3"
                placeholder="특이사항을 기록해보세요"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>
          </div>

          <button
            className="submit-button"
            onClick={handleSubmitSleep}
            disabled={isSubmitting}
          >
            {isSubmitting ? '저장 중...' : '수면 기록 저장'}
          </button>
        </div>
      )}

      {activeTab === 'history' && (
        <div className="sleep-history">
          {isLoading ? (
            <div className="loading">로딩 중...</div>
          ) : sleepRecords.length === 0 ? (
            <div className="empty-state">
              <p>아직 수면 기록이 없습니다</p>
              <p>수면 기록을 시작해보세요!</p>
            </div>
          ) : (
            <div className="records-list">
              {sleepRecords.map((record) => (
                <div key={record.id} className="record-card">
                  <div className="record-header">
                    <div className="record-date">
                      {formatDateTime(record.sleep_start)} - {formatDateTime(record.sleep_end)}
                    </div>
                    <button
                      className="delete-button"
                      onClick={() => handleDeleteRecord(record.id)}
                    >
                      🗑️
                    </button>
                  </div>
                  <div className="record-info">
                    <div className="info-item">
                      <span className="label">수면 시간:</span>
                      <span className="value">{record.duration_hours}시간</span>
                    </div>
                    <div className="info-item">
                      <span className="label">수면 품질:</span>
                      <span
                        className="value quality-badge"
                        style={{ backgroundColor: getQualityColor(record.sleep_quality) }}
                      >
                        {record.sleep_quality}/10
                      </span>
                    </div>
                  </div>
                  {(record.deep_sleep_hours || record.rem_sleep_hours || record.light_sleep_hours) && (
                    <div className="sleep-stages">
                      {record.deep_sleep_hours && (
                        <div className="stage-item">
                          <span>깊은 수면: {record.deep_sleep_hours}h</span>
                        </div>
                      )}
                      {record.rem_sleep_hours && (
                        <div className="stage-item">
                          <span>렘 수면: {record.rem_sleep_hours}h</span>
                        </div>
                      )}
                      {record.light_sleep_hours && (
                        <div className="stage-item">
                          <span>얕은 수면: {record.light_sleep_hours}h</span>
                        </div>
                      )}
                    </div>
                  )}
                  {record.notes && (
                    <div className="record-notes">
                      <p>{record.notes}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'stats' && (
        <div className="sleep-stats">
          {isLoading ? (
            <div className="loading">로딩 중...</div>
          ) : !sleepStats || sleepStats.count === 0 ? (
            <div className="empty-state">
              <p>통계를 표시할 수면 기록이 없습니다</p>
            </div>
          ) : (
            <>
              <div className="stats-header">
                <h3>최근 7일 수면 통계</h3>
                <div className="period-selector">
                  <button onClick={() => fetchSleepStats(7)}>7일</button>
                  <button onClick={() => fetchSleepStats(30)}>30일</button>
                  <button onClick={() => fetchSleepStats(90)}>90일</button>
                </div>
              </div>
              <div className="stats-grid">
                <div className="stat-card">
                  <div className="stat-icon">📊</div>
                  <div className="stat-label">총 기록</div>
                  <div className="stat-value">{sleepStats.count}일</div>
                </div>
                <div className="stat-card">
                  <div className="stat-icon">⏰</div>
                  <div className="stat-label">평균 수면 시간</div>
                  <div className="stat-value">{sleepStats.average_duration}시간</div>
                </div>
                <div className="stat-card">
                  <div className="stat-icon">⭐</div>
                  <div className="stat-label">평균 수면 품질</div>
                  <div className="stat-value">{sleepStats.average_quality}/10</div>
                </div>
                <div className="stat-card">
                  <div className="stat-icon">🌙</div>
                  <div className="stat-label">총 깊은 수면</div>
                  <div className="stat-value">{sleepStats.total_deep_sleep}시간</div>
                </div>
                <div className="stat-card">
                  <div className="stat-icon">💤</div>
                  <div className="stat-label">총 렘 수면</div>
                  <div className="stat-value">{sleepStats.total_rem_sleep}시간</div>
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default SleepTracker;
