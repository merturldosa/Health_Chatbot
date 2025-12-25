import { useState, useEffect } from 'react';
import { meditationAPI } from '../services/api';
import './MeditationPage.css';

const MeditationPage = () => {
  const [programs, setPrograms] = useState([]);
  const [selectedProgram, setSelectedProgram] = useState(null);
  const [isActive, setIsActive] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const [showHistory, setShowHistory] = useState(false);
  const [sessions, setSessions] = useState([]);

  // 호흡 애니메이션 상태 (breathing exercises)
  const [breathPhase, setBreathPhase] = useState('inhale'); // inhale, hold, exhale, rest
  const [breathCount, setBreathCount] = useState(0);

  // 프로그램 목록 불러오기
  useEffect(() => {
    loadPrograms();
    loadSessions();
  }, []);

  const loadPrograms = async () => {
    try {
      const response = await meditationAPI.getPrograms();
      setPrograms(response.data);
    } catch (error) {
      console.error('프로그램 로드 실패:', error);
    }
  };

  const loadSessions = async () => {
    try {
      const response = await meditationAPI.getSessions();
      setSessions(response.data);
    } catch (error) {
      console.error('세션 로드 실패:', error);
    }
  };

  const selectProgram = (program) => {
    setSelectedProgram(program);
    setTimeLeft(program.duration_minutes * 60);
    setIsActive(false);
    setBreathPhase('inhale');
    setBreathCount(0);
  };

  const startSession = () => {
    setIsActive(true);

    // 명상 프로그램별 시작 음성 안내
    if (selectedProgram.type === 'meditation') {
      speakInstruction(`${selectedProgram.title}를 시작합니다. 편안한 자세로 앉아 눈을 감고 호흡에 집중해주세요.`);
    } else if (selectedProgram.type === 'breathing') {
      speakInstruction('호흡 운동을 시작합니다. 안내에 따라 호흡해주세요.');
    } else if (selectedProgram.type === 'guided') {
      speakInstruction('가이드 명상을 시작합니다. 편안히 앉아 안내를 들어주세요.');
    }
  };

  const pauseSession = () => {
    setIsActive(false);
    window.speechSynthesis.cancel();
  };

  const stopSession = async (completed = false) => {
    setIsActive(false);
    window.speechSynthesis.cancel();

    if (completed || timeLeft < selectedProgram.duration_minutes * 60) {
      // 세션 저장
      try {
        const durationMinutes = Math.ceil((selectedProgram.duration_minutes * 60 - timeLeft) / 60);
        await meditationAPI.createSession({
          session_type: selectedProgram.type,
          program_name: selectedProgram.id,
          duration_minutes: durationMinutes,
          completed: completed ? 'completed' : 'interrupted',
        });
        loadSessions();
        alert(completed ? '세션이 완료되었습니다! 🎉' : '세션이 저장되었습니다.');
      } catch (error) {
        console.error('세션 저장 실패:', error);
      }
    }

    setSelectedProgram(null);
    setTimeLeft(0);
  };

  const speakInstruction = (text) => {
    try {
      // 이전 음성 안내 취소
      window.speechSynthesis.cancel();

      // 약간의 지연 후 새 음성 안내 시작 (취소 후 즉시 실행 방지)
      setTimeout(() => {
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'ko-KR';
        utterance.rate = 0.85; // 더 느리고 차분하게
        utterance.pitch = 0.95; // 약간 낮은 톤
        utterance.volume = 1.0;

        // 에러 핸들링
        utterance.onerror = (event) => {
          console.error('TTS error:', event);
        };

        window.speechSynthesis.speak(utterance);
      }, 100);
    } catch (error) {
      console.error('음성 안내 오류:', error);
    }
  };

  // 타이머 로직
  useEffect(() => {
    if (!isActive || timeLeft <= 0) {
      if (timeLeft === 0 && isActive) {
        stopSession(true);
      }
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [isActive, timeLeft]);

  // 호흡 운동 애니메이션 로직
  useEffect(() => {
    if (!isActive || !selectedProgram || selectedProgram.type !== 'breathing') return;

    const breathingPatterns = {
      box_breathing: [
        { phase: 'inhale', duration: 4, text: '들이마시기' },
        { phase: 'hold', duration: 4, text: '참기' },
        { phase: 'exhale', duration: 4, text: '내쉬기' },
        { phase: 'rest', duration: 4, text: '휴식' },
      ],
      '478_breathing': [
        { phase: 'inhale', duration: 4, text: '들이마시기' },
        { phase: 'hold', duration: 7, text: '참기' },
        { phase: 'exhale', duration: 8, text: '내쉬기' },
      ],
    };

    const pattern = breathingPatterns[selectedProgram.id];
    if (!pattern) return;

    let currentStep = 0;
    let stepTimer;

    const runBreathCycle = () => {
      const step = pattern[currentStep];
      setBreathPhase(step.phase);

      // 음성 안내 (각 단계마다 안내)
      speakInstruction(step.text);

      stepTimer = setTimeout(() => {
        currentStep++;
        if (currentStep >= pattern.length) {
          currentStep = 0;
          setBreathCount((prev) => prev + 1);
        }
        runBreathCycle();
      }, step.duration * 1000);
    };

    runBreathCycle();

    return () => clearTimeout(stepTimer);
  }, [isActive, selectedProgram, breathCount]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const deleteSession = async (sessionId) => {
    if (!confirm('이 세션을 삭제하시겠습니까?')) return;

    try {
      await meditationAPI.deleteSession(sessionId);
      loadSessions();
    } catch (error) {
      console.error('세션 삭제 실패:', error);
    }
  };

  return (
    <div className="meditation-container">
      <div className="meditation-header">
        <h1>🧘 명상 & 호흡</h1>
        <button
          className="history-toggle-btn"
          onClick={() => setShowHistory(!showHistory)}
        >
          {showHistory ? '프로그램 보기' : '📊 기록 보기'}
        </button>
      </div>

      {!showHistory ? (
        <>
          {!selectedProgram ? (
            <div className="programs-grid">
              {programs.map((program) => (
                <div
                  key={program.id}
                  className={`program-card ${program.type}`}
                  onClick={() => selectProgram(program)}
                >
                  <div className="program-icon">
                    {program.type === 'meditation' ? '🧘' : '🌬️'}
                  </div>
                  <h3>{program.name}</h3>
                  <p className="program-duration">{program.duration_minutes}분</p>
                  <p className="program-description">{program.description}</p>
                  <div className="program-benefits">
                    {program.benefits.slice(0, 3).map((benefit, i) => (
                      <span key={i} className="benefit-tag">
                        {benefit}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="session-container">
              <div className="session-header">
                <h2>{selectedProgram.name}</h2>
                <button className="back-btn" onClick={() => setSelectedProgram(null)}>
                  ← 뒤로
                </button>
              </div>

              <div className="timer-display">
                <div className="time-text">{formatTime(timeLeft)}</div>
                {selectedProgram.type === 'breathing' && (
                  <div className={`breath-circle ${breathPhase} ${isActive ? 'active' : ''}`}>
                    <div className="breath-text">
                      {breathPhase === 'inhale' && '들이마시기'}
                      {breathPhase === 'hold' && '참기'}
                      {breathPhase === 'exhale' && '내쉬기'}
                      {breathPhase === 'rest' && '휴식'}
                    </div>
                  </div>
                )}
              </div>

              <div className="session-controls">
                {!isActive ? (
                  <button className="control-btn start" onClick={startSession}>
                    시작
                  </button>
                ) : (
                  <button className="control-btn pause" onClick={pauseSession}>
                    일시정지
                  </button>
                )}
                <button className="control-btn stop" onClick={() => stopSession(false)}>
                  중지
                </button>
              </div>

              <div className="instructions-panel">
                <h3>가이드</h3>
                <ol>
                  {selectedProgram.instructions.map((instruction, i) => (
                    <li key={i}>{instruction}</li>
                  ))}
                </ol>
              </div>
            </div>
          )}
        </>
      ) : (
        <div className="history-panel">
          <h2>명상/호흡 기록</h2>
          {sessions.length === 0 ? (
            <p className="no-data">아직 기록이 없습니다.</p>
          ) : (
            <div className="sessions-list">
              {sessions.map((session) => {
                const program = programs.find((p) => p.id === session.program_name);
                return (
                  <div key={session.id} className="session-card">
                    <div className="session-info">
                      <span className="session-icon">
                        {session.session_type === 'meditation' ? '🧘' : '🌬️'}
                      </span>
                      <div>
                        <h4>{program?.name || session.program_name}</h4>
                        <p className="session-meta">
                          {session.duration_minutes}분 • {session.completed === 'completed' ? '완료' : '중단'}
                        </p>
                        <p className="session-date">
                          {new Date(session.created_at).toLocaleDateString('ko-KR')} {new Date(session.created_at).toLocaleTimeString('ko-KR')}
                        </p>
                      </div>
                    </div>
                    <button
                      className="delete-btn"
                      onClick={() => deleteSession(session.id)}
                    >
                      🗑️
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default MeditationPage;
