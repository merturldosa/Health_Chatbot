import { useState, useEffect } from 'react';
import './VoiceCheckIn.css';

const VoiceCheckIn = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const [audioChunks, setAudioChunks] = useState([]);
  const [checkInResult, setCheckInResult] = useState(null);
  const [showResult, setShowResult] = useState(false);

  // 체크인 시간대
  const getCheckInType = () => {
    const hour = new Date().getHours();
    if (hour < 12) return { type: 'morning', label: '아침', icon: '🌅' };
    if (hour < 18) return { type: 'afternoon', label: '오후', icon: '☀️' };
    if (hour < 22) return { type: 'evening', label: '저녁', icon: '🌆' };
    return { type: 'night', label: '밤', icon: '🌙' };
  };

  const checkIn = getCheckInType();

  // 음성 녹음 시작
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      const chunks = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunks.push(e.data);
        }
      };

      recorder.onstop = async () => {
        const audioBlob = new Blob(chunks, { type: 'audio/webm' });
        await analyzeVoice(audioBlob);
        stream.getTracks().forEach(track => track.stop());
      };

      recorder.start();
      setMediaRecorder(recorder);
      setIsRecording(true);
      setAudioChunks([]);

      // TTS로 질문 읽기
      speakQuestion();
    } catch (error) {
      console.error('마이크 접근 오류:', error);
      alert('마이크 접근 권한이 필요합니다.');
    }
  };

  // 음성 녹음 중지
  const stopRecording = () => {
    if (mediaRecorder && mediaRecorder.state === 'recording') {
      mediaRecorder.stop();
      setIsRecording(false);
      setIsAnalyzing(true);
    }
  };

  // 질문 음성 안내
  const speakQuestion = () => {
    if ('speechSynthesis' in window) {
      const text = `${checkIn.label} 체크인입니다. 오늘 기분이 어떠세요? 편하게 말씀해주세요.`;
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'ko-KR';
      utterance.rate = 0.9;
      window.speechSynthesis.speak(utterance);
    }
  };

  // 음성 분석 (백엔드 API 호출 - 현재는 시뮬레이션)
  const analyzeVoice = async (audioBlob) => {
    // 실제로는 백엔드 API로 전송
    // const formData = new FormData();
    // formData.append('audio', audioBlob);
    // const response = await fetch('/api/voice/analyze', { method: 'POST', body: formData });

    // 시뮬레이션
    setTimeout(() => {
      const mockResult = {
        emotion: '긍정적',
        moodScore: 75,
        energyLevel: 7,
        stressLevel: 3,
        healthConcern: 'low',
        aiSuggestion: '전반적으로 좋은 상태입니다. 오늘 하루도 화이팅하세요! 수분 섭취를 잊지 마세요.',
        detectedText: '오늘 기분이 좋아요. 잘 잤어요.'
      };

      setCheckInResult(mockResult);
      setIsAnalyzing(false);
      setShowResult(true);

      // 결과 음성 안내
      speakResult(mockResult);
    }, 2000);
  };

  // 결과 음성 안내
  const speakResult = (result) => {
    if ('speechSynthesis' in window) {
      const text = `
        분석 완료되었습니다.
        감정 상태는 ${result.emotion}이고,
        기분 점수는 ${result.moodScore}점입니다.
        에너지 수준은 10점 만점에 ${result.energyLevel}점입니다.
        ${result.aiSuggestion}
      `;
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'ko-KR';
      utterance.rate = 0.9;
      window.speechSynthesis.speak(utterance);
    }
  };

  // 감정에 따른 이모지
  const getEmotionEmoji = (emotion) => {
    const emotions = {
      '매우 긍정적': '😄',
      '긍정적': '😊',
      '보통': '😐',
      '부정적': '😔',
      '매우 부정적': '😢'
    };
    return emotions[emotion] || '😊';
  };

  return (
    <div className="voice-checkin">
      <div className="checkin-header">
        <span className="checkin-time-icon">{checkIn.icon}</span>
        <h3>{checkIn.label} 체크인</h3>
        <p>오늘 기분이 어떠세요?</p>
      </div>

      {!showResult ? (
        <div className="recording-section">
          <button
            className={`record-button ${isRecording ? 'recording' : ''}`}
            onClick={isRecording ? stopRecording : startRecording}
            disabled={isAnalyzing}
          >
            {isAnalyzing ? (
              <>
                <span className="analyzing-icon">🔄</span>
                <span>분석 중...</span>
              </>
            ) : isRecording ? (
              <>
                <span className="mic-icon pulsing">🎤</span>
                <span>녹음 중... (탭하여 중지)</span>
              </>
            ) : (
              <>
                <span className="mic-icon">🎤</span>
                <span>탭하여 음성 체크인</span>
              </>
            )}
          </button>

          {isRecording && (
            <div className="recording-indicator">
              <div className="sound-wave">
                <span></span>
                <span></span>
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="result-section">
          <div className="result-card">
            <div className="result-emotion">
              <span className="emotion-emoji">{getEmotionEmoji(checkInResult.emotion)}</span>
              <span className="emotion-text">{checkInResult.emotion}</span>
            </div>

            <div className="result-metrics">
              <div className="metric-item">
                <span className="metric-label">기분 점수</span>
                <span className="metric-value">{checkInResult.moodScore}/100</span>
                <div className="metric-bar">
                  <div
                    className="metric-fill"
                    style={{
                      width: `${checkInResult.moodScore}%`,
                      backgroundColor: checkInResult.moodScore >= 70 ? '#4ade80' : '#fbbf24'
                    }}
                  />
                </div>
              </div>

              <div className="metric-item">
                <span className="metric-label">에너지 수준</span>
                <span className="metric-value">{checkInResult.energyLevel}/10</span>
                <div className="energy-dots">
                  {[...Array(10)].map((_, i) => (
                    <span
                      key={i}
                      className={`energy-dot ${i < checkInResult.energyLevel ? 'filled' : ''}`}
                    />
                  ))}
                </div>
              </div>

              <div className="metric-item">
                <span className="metric-label">스트레스 수준</span>
                <span className="metric-value">{checkInResult.stressLevel}/10</span>
                <div className="energy-dots">
                  {[...Array(10)].map((_, i) => (
                    <span
                      key={i}
                      className={`stress-dot ${i < checkInResult.stressLevel ? 'filled' : ''}`}
                    />
                  ))}
                </div>
              </div>
            </div>

            {checkInResult.detectedText && (
              <div className="detected-text">
                <div className="detected-label">💬 인식된 내용</div>
                <p>"{checkInResult.detectedText}"</p>
              </div>
            )}

            <div className="ai-suggestion">
              <div className="suggestion-icon">🤖</div>
              <p>{checkInResult.aiSuggestion}</p>
            </div>

            <button
              className="retry-button"
              onClick={() => setShowResult(false)}
            >
              다시 체크인하기
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default VoiceCheckIn;
