import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import './ContinuousVoiceMonitor.css';

/**
 * 상시 음성 모니터링 컴포넌트
 *
 * ⚠️ 프라이버시 보호 설계:
 * - 음성은 절대 녹음되지 않습니다
 * - MediaRecorder를 사용하지 않습니다 (녹음 기능 없음)
 * - Web Audio API의 Analyser만 사용하여 실시간 분석
 * - 오디오 데이터는 메모리에서만 처리 후 즉시 폐기
 * - 분석 결과(숫자)만 백엔드로 전송
 * - 음성 파일이 생성되거나 저장되지 않음
 */
const ContinuousVoiceMonitor = () => {
  const { user } = useAuth();
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [autoStartEnabled, setAutoStartEnabled] = useState(false);
  const [tabVisible, setTabVisible] = useState(true);
  const [mentalState, setMentalState] = useState({
    stress_level: 0,
    anxiety_indicator: 0,
    depression_indicator: 0,
    energy_level: 5,
    overall_status: 'normal',
  });
  const [audioStats, setAudioStats] = useState({
    average_pitch: 0,
    volume_level: 0,
    speech_detected: false,
  });
  const [alerts, setAlerts] = useState([]);

  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const microphoneRef = useRef(null);
  const animationFrameRef = useRef(null);
  const dataArrayRef = useRef(null);
  const pitchHistoryRef = useRef([]);
  const volumeHistoryRef = useRef([]);
  const analysisIntervalRef = useRef(null);
  const streamRef = useRef(null);
  const lastAnnouncementTimeRef = useRef(null); // 마지막 음성 안내 시간 (5분 간격 제한용)
  const symptomAnnouncementCountRef = useRef({}); // 증상별 안내 횟수 추적

  // 자동 시작 설정 로드
  useEffect(() => {
    const savedAutoStart = localStorage.getItem('voiceMonitor_autoStart');
    // Electron 환경이거나 자동 시작 설정이 켜져있으면 자동 시작
    const shouldAutoStart = savedAutoStart === 'true' || window.electronAPI?.isElectron;

    if (shouldAutoStart) {
      setAutoStartEnabled(true);
      // 페이지 로드 후 자동으로 시작
      setTimeout(() => {
        startMonitoring();
      }, 1000);
    }
  }, []);

  // 탭 가시성 감지 (Page Visibility API)
  useEffect(() => {
    const handleVisibilityChange = () => {
      const visible = !document.hidden;
      setTabVisible(visible);

      if (!visible && isMonitoring) {
        // 탭이 비활성화되면 경고
        console.warn('⚠️ 탭이 비활성화되어 모니터링이 일시 중지될 수 있습니다.');
      } else if (visible && autoStartEnabled && !isMonitoring) {
        // 탭이 다시 활성화되고 자동 시작이 켜져있으면 재시작
        console.log('✅ 탭 활성화 - 모니터링 재시작');
        startMonitoring();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [isMonitoring, autoStartEnabled]);

  // 모니터링 시작
  // ⚠️ 중요: 이 함수는 음성을 녹음하지 않습니다!
  // Web Audio API를 사용하여 실시간 분석만 수행하고 즉시 폐기합니다.
  const startMonitoring = async () => {
    try {
      // 마이크 권한 요청
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      // Web Audio API 설정 (분석 전용, 녹음 없음)
      audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
      analyserRef.current = audioContextRef.current.createAnalyser();
      microphoneRef.current = audioContextRef.current.createMediaStreamSource(stream);

      analyserRef.current.fftSize = 2048;
      const bufferLength = analyserRef.current.frequencyBinCount;
      dataArrayRef.current = new Uint8Array(bufferLength);

      microphoneRef.current.connect(analyserRef.current);
      // 주의: analyser는 destination에 연결하지 않음 = 재생/녹음 없음

      setIsMonitoring(true);

      // Electron API로 모니터링 상태 알림
      if (window.electronAPI) {
        window.electronAPI.updateMonitoringStatus(true);
      }

      // 실시간 오디오 분석 시작 (녹음 없이 분석만)
      analyzeAudioContinuously();

      // 주기적 정신 상태 분석 (30초마다)
      analysisIntervalRef.current = setInterval(() => {
        analyzeMentalState();
      }, 30000);

      console.log('상시 음성 모니터링 시작 (녹음 없음, 분석만)');
    } catch (error) {
      console.error('마이크 접근 오류:', error);
      alert('마이크 접근 권한이 필요합니다. 브라우저 설정에서 마이크 권한을 허용해주세요.');
    }
  };

  // 자동 시작 토글
  const toggleAutoStart = () => {
    const newValue = !autoStartEnabled;
    setAutoStartEnabled(newValue);
    localStorage.setItem('voiceMonitor_autoStart', newValue.toString());

    if (newValue && !isMonitoring) {
      startMonitoring();
    }
  };

  // 모니터링 토글
  const toggleMonitoring = () => {
    if (isMonitoring) {
      stopMonitoring();
    } else {
      startMonitoring();
    }
  };

  // 모니터링 중지
  const stopMonitoring = () => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }

    if (analysisIntervalRef.current) {
      clearInterval(analysisIntervalRef.current);
    }

    if (microphoneRef.current) {
      microphoneRef.current.disconnect();
    }

    if (audioContextRef.current) {
      audioContextRef.current.close();
    }

    // 마이크 스트림 정리
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }

    setIsMonitoring(false);

    // Electron API로 모니터링 상태 알림
    if (window.electronAPI) {
      window.electronAPI.updateMonitoringStatus(false);
    }

    console.log('상시 음성 모니터링 종료');
  };

  // 실시간 오디오 분석
  // ⚠️ 녹음 없음: 오디오 데이터를 읽어서 분석만 하고 즉시 버립니다
  // 어떤 파일도 생성되지 않으며, 네트워크로 음성 데이터가 전송되지 않습니다
  const analyzeAudioContinuously = () => {
    if (!analyserRef.current || !dataArrayRef.current) return;

    // 실시간 오디오 데이터 읽기 (메모리에서만 처리, 저장 안 함)
    analyserRef.current.getByteTimeDomainData(dataArrayRef.current);
    analyserRef.current.getByteFrequencyData(dataArrayRef.current);

    // 볼륨 계산
    let sum = 0;
    for (let i = 0; i < dataArrayRef.current.length; i++) {
      const value = dataArrayRef.current[i] / 128.0 - 1.0;
      sum += value * value;
    }
    const rms = Math.sqrt(sum / dataArrayRef.current.length);
    const volume = Math.round(rms * 100);

    // 주파수 분석 (간단한 피치 추정)
    const nyquist = audioContextRef.current.sampleRate / 2;
    const frequencies = new Uint8Array(analyserRef.current.frequencyBinCount);
    analyserRef.current.getByteFrequencyData(frequencies);

    let maxValue = 0;
    let maxIndex = 0;
    for (let i = 0; i < frequencies.length; i++) {
      if (frequencies[i] > maxValue) {
        maxValue = frequencies[i];
        maxIndex = i;
      }
    }

    const pitch = (maxIndex * nyquist) / analyserRef.current.frequencyBinCount;

    // 음성 감지 (볼륨 임계값)
    const speechDetected = volume > 5;

    // 통계 업데이트
    setAudioStats({
      average_pitch: Math.round(pitch),
      volume_level: volume,
      speech_detected: speechDetected,
    });

    // 히스토리 저장 (최근 100개)
    if (speechDetected) {
      pitchHistoryRef.current.push(pitch);
      if (pitchHistoryRef.current.length > 100) {
        pitchHistoryRef.current.shift();
      }

      volumeHistoryRef.current.push(volume);
      if (volumeHistoryRef.current.length > 100) {
        volumeHistoryRef.current.shift();
      }
    }

    // 다음 프레임 분석
    animationFrameRef.current = requestAnimationFrame(analyzeAudioContinuously);
  };

  // 정신 상태 분석
  const analyzeMentalState = () => {
    if (pitchHistoryRef.current.length < 10) {
      return; // 데이터 부족
    }

    // 평균 피치 계산
    const avgPitch = pitchHistoryRef.current.reduce((a, b) => a + b, 0) / pitchHistoryRef.current.length;

    // 피치 변동성 계산 (표준편차)
    const pitchVariance = pitchHistoryRef.current.reduce((sum, pitch) => {
      return sum + Math.pow(pitch - avgPitch, 2);
    }, 0) / pitchHistoryRef.current.length;
    const pitchStdDev = Math.sqrt(pitchVariance);

    // 평균 볼륨 계산
    const avgVolume = volumeHistoryRef.current.reduce((a, b) => a + b, 0) / volumeHistoryRef.current.length;

    // 정신 상태 추정 (간단한 휴리스틱)
    // 실제로는 ML 모델 사용 필요

    // 스트레스 지표: 피치 변동성과 볼륨으로 추정
    let stress = Math.min(10, (pitchStdDev / 50) * 10);

    // 불안 지표: 높은 피치와 높은 변동성
    let anxiety = 0;
    if (avgPitch > 200 && pitchStdDev > 40) {
      anxiety = Math.min(1, (avgPitch - 200) / 100);
    }

    // 우울증 지표: 낮은 피치와 낮은 볼륨
    let depression = 0;
    if (avgPitch < 150 && avgVolume < 20) {
      depression = Math.min(1, (150 - avgPitch) / 100);
    }

    // 에너지 레벨: 볼륨과 피치로 추정
    let energy = Math.min(10, (avgVolume / 10) + (avgPitch / 50));

    // 전체 상태 결정
    let overall = 'normal';
    if (stress > 7 || anxiety > 0.6 || depression > 0.6) {
      overall = 'concern';
    } else if (stress > 5 || anxiety > 0.4 || depression > 0.4) {
      overall = 'attention';
    }

    const newState = {
      stress_level: Math.round(stress * 10) / 10,
      anxiety_indicator: Math.round(anxiety * 100) / 100,
      depression_indicator: Math.round(depression * 100) / 100,
      energy_level: Math.round(energy * 10) / 10,
      overall_status: overall,
    };

    setMentalState(newState);

    // 정상 상태로 돌아오면 카운터 리셋 (다시 문제 발생 시 새로 안내)
    if (overall === 'normal') {
      symptomAnnouncementCountRef.current = {};
      console.log('✅ 정상 상태로 복귀 - 증상 안내 카운터 리셋');
    }

    // 이상 징후 감지 시 알림
    if (overall === 'concern') {
      const alertMessage = '주의가 필요한 정신 상태가 감지되었습니다. 휴식을 취하거나 전문가와 상담하세요.';
      // 증상 키: "concern" (우려 상태는 2번까지만 안내)
      addAlert(alertMessage, true, 'concern');

      // Electron 환경에서 시스템 알림
      if (window.electronAPI) {
        window.electronAPI.sendHealthStatusChange({
          message: `스트레스: ${newState.stress_level}/10, 불안: ${Math.round(newState.anxiety_indicator * 100)}%, 우울: ${Math.round(newState.depression_indicator * 100)}%`,
        });
      }

      // 백엔드로 데이터 전송
      sendAnalysisToBackend(newState);
    } else if (overall === 'attention') {
      // 주의 상태에서도 알림 (우려보다 낮은 우선순위)
      const alertMessage = '스트레스 수준이 다소 높습니다. 잠시 휴식을 취하세요.';
      // 증상 키: "attention" (주의 상태도 2번까지만 안내)
      addAlert(alertMessage, true, 'attention');
    }

    console.log('정신 상태 분석:', newState);
  };

  // 백엔드로 분석 결과 전송
  const sendAnalysisToBackend = async (state) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:8000/api/voice/continuous-analysis', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          ...state,
          timestamp: new Date().toISOString(),
        })
      });

      if (response.ok) {
        const result = await response.json();
        console.log('분석 결과 저장 완료:', result);
      } else {
        console.error('분석 결과 전송 실패:', response.status);
      }
    } catch (error) {
      console.error('분석 결과 전송 오류:', error);
    }
  };

  // 알림 추가
  const addAlert = (message, enableVoice = true, symptomKey = null) => {
    const newAlert = {
      id: Date.now(),
      message,
      timestamp: new Date().toISOString(),
    };

    setAlerts(prev => [newAlert, ...prev].slice(0, 10));

    // TTS로 알림 읽기 (같은 증상은 2번까지만 안내)
    if (enableVoice && 'speechSynthesis' in window && symptomKey) {
      // 해당 증상의 안내 횟수 확인
      const currentCount = symptomAnnouncementCountRef.current[symptomKey] || 0;

      if (currentCount < 2) {
        // 2번까지만 안내
        const utterance = new SpeechSynthesisUtterance(message);
        utterance.lang = 'ko-KR';
        utterance.rate = 0.9;
        window.speechSynthesis.speak(utterance);

        // 안내 횟수 증가
        symptomAnnouncementCountRef.current[symptomKey] = currentCount + 1;
        console.log(`🔊 음성 안내 실행 (${currentCount + 1}/2회): ${message}`);
      } else {
        console.log(`🔇 음성 안내 생략: "${symptomKey}" 증상은 이미 2번 안내됨`);
      }
    }
  };

  // 컴포넌트 언마운트 시 정리
  useEffect(() => {
    return () => {
      if (isMonitoring) {
        stopMonitoring();
      }
    };
  }, [isMonitoring]);

  const getStatusColor = (status) => {
    const colors = {
      normal: '#4ade80',
      attention: '#fbbf24',
      concern: '#f87171',
    };
    return colors[status] || '#94a3b8';
  };

  const getStatusText = (status) => {
    const texts = {
      normal: '정상',
      attention: '주의',
      concern: '우려',
    };
    return texts[status] || '알 수 없음';
  };

  return (
    <div className="continuous-voice-monitor">
      <div className="monitor-header">
        <div className="header-title">
          <h3>🎙️ 상시 음성 모니터링</h3>
          <p className="header-description">
            음성 패턴을 지속적으로 분석하여 정신 상태를 모니터링합니다
          </p>
        </div>
        <button
          className={`monitor-toggle ${isMonitoring ? 'active' : ''}`}
          onClick={toggleMonitoring}
        >
          {isMonitoring ? (
            <>
              <span className="status-icon pulsing">🔴</span>
              <span>모니터링 중지</span>
            </>
          ) : (
            <>
              <span className="status-icon">⚪</span>
              <span>모니터링 시작</span>
            </>
          )}
        </button>
      </div>

      {/* 자동 시작 및 탭 가시성 알림 */}
      <div className="monitor-controls">
        <div className="auto-start-control">
          <label className="toggle-label">
            <input
              type="checkbox"
              checked={autoStartEnabled}
              onChange={toggleAutoStart}
            />
            <span className="toggle-slider"></span>
            <span className="toggle-text">
              🚀 앱 실행 시 자동으로 시작
              {autoStartEnabled && <span className="badge">활성화</span>}
            </span>
          </label>
          <p className="control-description">
            ⚠️ 웹 브라우저 제약사항: 이 탭이 활성화되어 있을 때만 모니터링됩니다.
            다른 탭으로 이동하거나 화면을 끄면 일시 중지됩니다.
          </p>
        </div>

        {!tabVisible && isMonitoring && (
          <div className="tab-warning">
            <span className="warning-icon">⚠️</span>
            <span>탭이 비활성화되어 모니터링이 일시 중지될 수 있습니다. 이 탭으로 돌아오세요.</span>
          </div>
        )}
      </div>

      {isMonitoring && (
        <>
          {/* 현재 오디오 상태 */}
          <div className="audio-status">
            <h4>현재 오디오 상태</h4>
            <div className="status-grid">
              <div className="status-item">
                <div className="status-label">평균 피치</div>
                <div className="status-value">{audioStats.average_pitch} Hz</div>
              </div>
              <div className="status-item">
                <div className="status-label">볼륨 레벨</div>
                <div className="status-value">{audioStats.volume_level}%</div>
                <div className="volume-bar">
                  <div
                    className="volume-fill"
                    style={{ width: `${audioStats.volume_level}%` }}
                  />
                </div>
              </div>
              <div className="status-item">
                <div className="status-label">음성 감지</div>
                <div className="status-value">
                  {audioStats.speech_detected ? '🟢 감지됨' : '⚪ 없음'}
                </div>
              </div>
            </div>
          </div>

          {/* 정신 상태 분석 */}
          <div className="mental-state-analysis">
            <div className="analysis-header">
              <h4>정신 상태 분석</h4>
              <div
                className="overall-status"
                style={{ backgroundColor: getStatusColor(mentalState.overall_status) }}
              >
                {getStatusText(mentalState.overall_status)}
              </div>
            </div>

            <div className="mental-indicators">
              <div className="indicator-item">
                <div className="indicator-icon">😰</div>
                <div className="indicator-content">
                  <div className="indicator-label">스트레스 수준</div>
                  <div className="indicator-value">{mentalState.stress_level} / 10</div>
                  <div className="indicator-bar">
                    <div
                      className="indicator-fill stress"
                      style={{ width: `${mentalState.stress_level * 10}%` }}
                    />
                  </div>
                </div>
              </div>

              <div className="indicator-item">
                <div className="indicator-icon">😨</div>
                <div className="indicator-content">
                  <div className="indicator-label">불안 지표</div>
                  <div className="indicator-value">
                    {Math.round(mentalState.anxiety_indicator * 100)}%
                  </div>
                  <div className="indicator-bar">
                    <div
                      className="indicator-fill anxiety"
                      style={{ width: `${mentalState.anxiety_indicator * 100}%` }}
                    />
                  </div>
                </div>
              </div>

              <div className="indicator-item">
                <div className="indicator-icon">😔</div>
                <div className="indicator-content">
                  <div className="indicator-label">우울 지표</div>
                  <div className="indicator-value">
                    {Math.round(mentalState.depression_indicator * 100)}%
                  </div>
                  <div className="indicator-bar">
                    <div
                      className="indicator-fill depression"
                      style={{ width: `${mentalState.depression_indicator * 100}%` }}
                    />
                  </div>
                </div>
              </div>

              <div className="indicator-item">
                <div className="indicator-icon">⚡</div>
                <div className="indicator-content">
                  <div className="indicator-label">에너지 레벨</div>
                  <div className="indicator-value">{mentalState.energy_level} / 10</div>
                  <div className="indicator-bar">
                    <div
                      className="indicator-fill energy"
                      style={{ width: `${mentalState.energy_level * 10}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 알림 내역 */}
          {alerts.length > 0 && (
            <div className="alerts-section">
              <h4>🔔 감지된 알림</h4>
              <div className="alerts-list">
                {alerts.map(alert => (
                  <div key={alert.id} className="alert-item">
                    <div className="alert-time">
                      {new Date(alert.timestamp).toLocaleTimeString('ko-KR')}
                    </div>
                    <div className="alert-message">{alert.message}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 프라이버시 안내 */}
          <div className="privacy-notice">
            <div className="notice-icon">🔒</div>
            <div className="notice-content">
              <div className="notice-title">프라이버시 100% 보호</div>
              <p>
                <strong>⚠️ 녹음 없음:</strong> 음성은 절대 녹음되거나 저장되지 않습니다.<br/>
                실시간으로 분석만 하고 즉시 폐기됩니다.<br/>
                분석 결과(숫자)만 암호화되어 전송됩니다.<br/>
                언제든지 모니터링을 중지할 수 있습니다.
              </p>
            </div>
          </div>
        </>
      )}

      {!isMonitoring && (
        <div className="monitor-inactive">
          <div className="inactive-icon">🎤</div>
          <h4>모니터링이 비활성화되어 있습니다</h4>
          <p>
            상시 음성 모니터링을 활성화하면 음성 패턴을 실시간으로 분석하여
            <br />
            정신 건강 상태를 지속적으로 추적할 수 있습니다.
          </p>
          <ul className="feature-list">
            <li>✓ 스트레스 및 불안 수준 실시간 감지</li>
            <li>✓ 우울 증상 조기 발견</li>
            <li>✓ 에너지 레벨 추적</li>
            <li>✓ 이상 징후 즉시 알림</li>
          </ul>
          <div className="privacy-guarantee">
            <div className="guarantee-icon">🔒</div>
            <strong>녹음 없음 보장</strong>
            <p>음성은 절대 녹음되지 않으며 실시간 분석만 수행됩니다</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default ContinuousVoiceMonitor;
