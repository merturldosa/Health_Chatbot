import { useState, useEffect } from 'react';
import { musicAPI } from '../services/api';
import './MusicTherapyPage.css';

const MusicTherapyPage = () => {
  const [programs, setPrograms] = useState([]);
  const [selectedProgram, setSelectedProgram] = useState(null);
  const [showHistory, setShowHistory] = useState(false);
  const [sessions, setSessions] = useState([]);
  const [filter, setFilter] = useState({ purpose: '', type: '' });

  useEffect(() => {
    loadPrograms();
    loadSessions();
  }, []);

  const loadPrograms = async () => {
    try {
      const response = await musicAPI.getPrograms(filter);
      setPrograms(response.data);
    } catch (error) {
      console.error('프로그램 로드 실패:', error);
    }
  };

  const loadSessions = async () => {
    try {
      const response = await musicAPI.getSessions();
      setSessions(response.data);
    } catch (error) {
      console.error('세션 로드 실패:', error);
    }
  };

  const openProgram = (program) => {
    setSelectedProgram(program);
  };

  const closeProgram = async (saveSession = false) => {
    if (saveSession && selectedProgram) {
      try {
        await musicAPI.createSession({
          music_type: selectedProgram.type,
          purpose: selectedProgram.purpose,
          duration_minutes: selectedProgram.duration_minutes,
        });
        loadSessions();
        alert('세션이 저장되었습니다!');
      } catch (error) {
        console.error('세션 저장 실패:', error);
      }
    }
    setSelectedProgram(null);
  };

  const deleteSession = async (sessionId) => {
    if (!confirm('이 세션을 삭제하시겠습니까?')) return;

    try {
      await musicAPI.deleteSession(sessionId);
      loadSessions();
    } catch (error) {
      console.error('세션 삭제 실패:', error);
    }
  };

  const getYouTubeEmbedUrl = (url) => {
    const videoId = url.split('v=')[1]?.split('&')[0];
    return `https://www.youtube.com/embed/${videoId}?autoplay=1`;
  };

  const purposeLabels = {
    sleep: '수면',
    anxiety: '불안완화',
    focus: '집중력',
    pain_relief: '통증완화',
  };

  const typeLabels = {
    binaural: '바이노럴 비트',
    nature: '자연의 소리',
    classical: '클래식',
    healing_frequency: '힐링 주파수',
  };

  return (
    <div className="music-therapy-container">
      <div className="music-therapy-header">
        <h1>🎵 음악 치료</h1>
        <button
          className="history-toggle-btn"
          onClick={() => setShowHistory(!showHistory)}
        >
          {showHistory ? '프로그램 보기' : '📊 기록 보기'}
        </button>
      </div>

      {!showHistory ? (
        <>
          <div className="filter-bar">
            <select
              value={filter.purpose}
              onChange={(e) => {
                setFilter({ ...filter, purpose: e.target.value });
                loadPrograms();
              }}
            >
              <option value="">전체 목적</option>
              <option value="sleep">수면</option>
              <option value="anxiety">불안완화</option>
              <option value="focus">집중력</option>
              <option value="pain_relief">통증완화</option>
            </select>

            <select
              value={filter.type}
              onChange={(e) => {
                setFilter({ ...filter, type: e.target.value });
                loadPrograms();
              }}
            >
              <option value="">전체 유형</option>
              <option value="binaural">바이노럴 비트</option>
              <option value="nature">자연의 소리</option>
              <option value="classical">클래식</option>
              <option value="healing_frequency">힐링 주파수</option>
            </select>
          </div>

          <div className="programs-grid">
            {programs.map((program) => (
              <div
                key={program.id}
                className={`music-card ${program.type}`}
                onClick={() => openProgram(program)}
              >
                <div className="music-icon">🎵</div>
                <h3>{program.name}</h3>
                <div className="music-meta">
                  <span className="purpose-tag">{purposeLabels[program.purpose]}</span>
                  <span className="type-tag">{typeLabels[program.type]}</span>
                </div>
                <p className="music-description">{program.description}</p>
                <p className="music-duration">{program.duration_minutes}분</p>
              </div>
            ))}
          </div>
        </>
      ) : (
        <div className="history-panel">
          <h2>음악 치료 기록</h2>
          {sessions.length === 0 ? (
            <p className="no-data">아직 기록이 없습니다.</p>
          ) : (
            <div className="sessions-list">
              {sessions.map((session) => {
                const program = programs.find((p) => p.type === session.music_type);
                return (
                  <div key={session.id} className="session-card">
                    <div className="session-info">
                      <span className="session-icon">🎵</span>
                      <div>
                        <h4>{typeLabels[session.music_type]} - {purposeLabels[session.purpose]}</h4>
                        <p className="session-meta">{session.duration_minutes}분</p>
                        <p className="session-date">
                          {new Date(session.created_at).toLocaleDateString('ko-KR')}{' '}
                          {new Date(session.created_at).toLocaleTimeString('ko-KR')}
                        </p>
                      </div>
                    </div>
                    <button className="delete-btn" onClick={() => deleteSession(session.id)}>
                      🗑️
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {selectedProgram && (
        <div className="music-player-modal">
          <div className="modal-content">
            <div className="modal-header">
              <h2>{selectedProgram.name}</h2>
              <button className="close-btn" onClick={() => closeProgram(false)}>
                ✕
              </button>
            </div>

            <div className="youtube-player">
              <iframe
                width="100%"
                height="400"
                src={getYouTubeEmbedUrl(selectedProgram.youtube_url)}
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              ></iframe>
            </div>

            <div className="program-details">
              <h3>효과</h3>
              <ul>
                {selectedProgram.benefits.map((benefit, i) => (
                  <li key={i}>{benefit}</li>
                ))}
              </ul>
            </div>

            <div className="modal-actions">
              <button className="save-btn" onClick={() => closeProgram(true)}>
                세션 저장 후 닫기
              </button>
              <button className="cancel-btn" onClick={() => closeProgram(false)}>
                저장 안함
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MusicTherapyPage;
