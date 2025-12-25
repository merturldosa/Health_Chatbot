import { useState, useRef, useEffect } from 'react';
import { chatAPI, speechAPI, emotionAPI } from '../services/api';
import { format } from 'date-fns';
import ReactMarkdown from 'react-markdown';
import { useChatLogger } from '../hooks/useChatLogger';
import { analyzeVoiceTone } from '../utils/voiceAnalyzer';
import './ChatBot.css';

const ChatBot = () => {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      message: '안녕하세요! 건강 상담 챗봇입니다. 어떤 증상이 있으신가요?',
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [sessionId, setSessionId] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [showSessions, setShowSessions] = useState(false);
  const [showLogMenu, setShowLogMenu] = useState(false);
  const [speakingIndex, setSpeakingIndex] = useState(null);

  // 음성 입력 관련 상태
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [voiceToneAnalysis, setVoiceToneAnalysis] = useState(null);

  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const recordingTimerRef = useRef(null);
  const recordingStreamRef = useRef(null);
  const voiceTonePromiseRef = useRef(null);

  // 대화 로그 자동 저장 훅
  const {
    downloadCurrentSession,
    downloadAllLogs,
    importLogs,
    clearLogs,
    getLogCount,
  } = useChatLogger(messages, sessionId);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    fetchSessions();
  }, []);

  const fetchSessions = async () => {
    try {
      const response = await chatAPI.getChatSessions();
      setSessions(response.data);
    } catch (error) {
      console.error('세션 목록 조회 실패:', error);
    }
  };

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMessage = input;
    setInput('');
    setMessages((prev) => [...prev, { role: 'user', message: userMessage }]);
    setLoading(true);

    try {
      const response = await chatAPI.symptomCheck({
        message: userMessage,
        chat_type: 'symptom_check',
        session_id: sessionId,
      });

      setSessionId(response.data.session_id);
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          message: response.data.message,
          urgency_level: response.data.urgency_level,
          suggested_action: response.data.suggested_action,
        },
      ]);

      // 세션 목록 새로고침
      fetchSessions();
    } catch (error) {
      console.error('채팅 오류:', error);
      console.error('에러 응답:', error.response);
      console.error('에러 데이터:', error.response?.data);
      console.error('에러 상세:', error.response?.data?.detail);
      const errorMessage = error.response?.data?.detail || error.message || '죄송합니다. 오류가 발생했습니다. 다시 시도해주세요.';
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          message: `오류: ${errorMessage}`,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const loadSession = async (sid) => {
    try {
      const response = await chatAPI.getChatHistory(sid);
      setMessages(response.data);
      setSessionId(sid);
      setShowSessions(false);
    } catch (error) {
      console.error('채팅 기록 불러오기 실패:', error);
      alert('채팅 기록을 불러오는데 실패했습니다.');
    }
  };

  const startNewChat = () => {
    setMessages([
      {
        role: 'assistant',
        message: '안녕하세요! 건강 상담 챗봇입니다. 어떤 증상이 있으신가요?',
      },
    ]);
    setSessionId(null);
    setShowSessions(false);
  };

  // 로그 임포트 핸들러
  const handleImportLogs = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    try {
      const count = await importLogs(file);
      alert(`${count}개의 대화 로그를 가져왔습니다.`);
      event.target.value = '';
    } catch (error) {
      console.error('로그 임포트 실패:', error);
      alert('로그 파일을 불러오는데 실패했습니다. JSON 형식을 확인해주세요.');
    }
  };

  // 음성 녹음 시작
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      recordingStreamRef.current = stream;

      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        // 녹음 완료 후 처리
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        await processVoiceInput(audioBlob);

        // 스트림 정리
        if (recordingStreamRef.current) {
          recordingStreamRef.current.getTracks().forEach((track) => track.stop());
          recordingStreamRef.current = null;
        }
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);
      setVoiceToneAnalysis(null);

      // 녹음 타이머 시작
      recordingTimerRef.current = setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);

      // 음성 톤 분석 시작 (병렬 실행)
      // 녹음과 동시에 실시간 음성 톤 분석
      console.log('🎤 음성 녹음 시작 + 음성 톤 분석 시작');
      voiceTonePromiseRef.current = analyzeVoiceTone(stream, 10000) // 최대 10초
        .then((analysis) => {
          console.log('🎭 음성 톤 분석 완료:', analysis);
          setVoiceToneAnalysis(analysis);
          return analysis;
        })
        .catch((error) => {
          console.error('음성 톤 분석 오류:', error);
          // 실패해도 진행 (텍스트 감정 분석만 수행)
          return null;
        });
    } catch (error) {
      console.error('마이크 권한 오류:', error);
      alert('마이크 권한이 필요합니다. 브라우저 설정에서 마이크 접근을 허용해주세요.');
    }
  };

  // 음성 녹음 중지
  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);

      // 타이머 정리
      if (recordingTimerRef.current) {
        clearInterval(recordingTimerRef.current);
        recordingTimerRef.current = null;
      }

      console.log('🎤 음성 녹음 중지');
    }
  };

  // 음성 입력 처리 (STT + 음성 톤 + 감정 분석)
  const processVoiceInput = async (audioBlob) => {
    setIsTranscribing(true);

    try {
      // 1. 오디오 → Base64 변환
      const reader = new FileReader();
      const audioBase64 = await new Promise((resolve, reject) => {
        reader.onloadend = () => {
          const base64 = reader.result.split(',')[1];
          resolve(base64);
        };
        reader.onerror = reject;
        reader.readAsDataURL(audioBlob);
      });

      // 2. Google STT로 음성 → 텍스트 변환
      console.log('🔄 음성을 텍스트로 변환 중...');
      const sttResponse = await speechAPI.transcribe({
        audio_base64: audioBase64,
        language_code: 'ko-KR',
        encoding: 'WEBM_OPUS',
        sample_rate_hertz: 48000,
      });

      if (!sttResponse.data.success) {
        throw new Error(sttResponse.data.error || '음성 인식 실패');
      }

      const transcript = sttResponse.data.transcript;
      console.log('📝 변환된 텍스트:', transcript);

      // 3. 음성 톤 분석 결과 대기 (이미 실행 중)
      let voiceToneData = voiceToneAnalysis;
      if (voiceTonePromiseRef.current && !voiceToneData) {
        console.log('⏳ 음성 톤 분석 완료 대기 중...');
        try {
          voiceToneData = await voiceTonePromiseRef.current;
        } catch (error) {
          console.warn('음성 톤 분석 실패, 텍스트 감정 분석만 진행:', error);
          voiceToneData = null;
        }
      }

      // 4. 감정 분석 (텍스트 + 음성 톤)
      console.log('🎭 감정 분석 중...');
      const emotionResponse = await emotionAPI.analyze({
        text: transcript,
        voice_analysis: voiceToneData, // 음성 톤 데이터 포함!
      });

      const emotionData = emotionResponse.data;
      console.log('😊 종합 감정 분석 결과:', emotionData);

      // 5. 텍스트를 input에 설정하고 감정 데이터 포함
      setInput(transcript);

      // 6. AI 챗봇에 전송 (감정 정보 포함)
      await sendMessageWithEmotion(transcript, emotionData);
    } catch (error) {
      console.error('음성 처리 오류:', error);
      alert(`음성 처리 중 오류가 발생했습니다: ${error.message || error}`);
    } finally {
      setIsTranscribing(false);
      voiceTonePromiseRef.current = null;
    }
  };

  // 감정 정보 포함하여 메시지 전송
  const sendMessageWithEmotion = async (text, emotionData) => {
    if (!text.trim() || loading) return;

    const userMessage = {
      role: 'user',
      message: text,
      emotion: emotionData, // 감정 데이터 포함
    };

    setMessages((prev) => [...prev, userMessage]);
    setLoading(true);
    setInput(''); // 입력창 초기화

    try {
      const response = await chatAPI.symptomCheck({
        message: text,
        chat_type: 'symptom_check',
        session_id: sessionId,
      });

      setSessionId(response.data.session_id);
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          message: response.data.message,
          urgency_level: response.data.urgency_level,
          suggested_action: response.data.suggested_action,
          response_style: emotionData.response_style, // AI 응답 스타일
        },
      ]);

      fetchSessions();
    } catch (error) {
      console.error('채팅 오류:', error);
      const errorMessage =
        error.response?.data?.detail ||
        error.message ||
        '죄송합니다. 오류가 발생했습니다. 다시 시도해주세요.';
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          message: `오류: ${errorMessage}`,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  // 음성 재생 함수 (TTS)
  const handleSpeak = (text, index) => {
    // 이미 재생 중이면 중지
    if (speakingIndex === index) {
      window.speechSynthesis.cancel();
      setSpeakingIndex(null);
      return;
    }

    // 다른 음성이 재생 중이면 중지
    window.speechSynthesis.cancel();

    // 마크다운 특수문자 제거 (간단한 정리)
    const cleanText = text
      .replace(/[#*_~`]/g, '')
      .replace(/\[([^\]]+)\]\([^\)]+\)/g, '$1')
      .replace(/\n+/g, ' ');

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = 'ko-KR';
    utterance.rate = 1.0;
    utterance.pitch = 1.0;

    utterance.onstart = () => {
      setSpeakingIndex(index);
    };

    utterance.onend = () => {
      setSpeakingIndex(null);
    };

    utterance.onerror = () => {
      setSpeakingIndex(null);
    };

    window.speechSynthesis.speak(utterance);
  };

  return (
    <div className="chatbot-container">
      <div className="chatbot-header">
        <h2>💬 AI 건강 상담</h2>
        <div className="header-actions">
          <button
            className="history-btn"
            onClick={() => setShowSessions(!showSessions)}
          >
            📜 대화 기록
          </button>
          <button
            className="log-menu-btn"
            onClick={() => setShowLogMenu(!showLogMenu)}
          >
            💾 로그 관리
          </button>
          <button className="new-chat-btn" onClick={startNewChat}>
            ➕ 새 대화
          </button>
        </div>
        <p className="disclaimer-text">
          ⚠️ 본 서비스는 정보 제공 목적이며 의학적 진단이 아닙니다
        </p>
      </div>

      {showLogMenu && (
        <div className="log-menu-panel">
          <h3>📥 대화 로그 관리</h3>
          <div className="log-menu-actions">
            <button className="log-action-btn" onClick={downloadCurrentSession}>
              📄 현재 대화 다운로드
            </button>
            <button className="log-action-btn" onClick={downloadAllLogs}>
              📦 전체 로그 다운로드
            </button>
            <button
              className="log-action-btn"
              onClick={() => fileInputRef.current?.click()}
            >
              📂 로그 가져오기
            </button>
            <button className="log-action-btn danger" onClick={clearLogs}>
              🗑️ 전체 로그 삭제
            </button>
          </div>
          <p className="log-info">
            저장된 로그: {getLogCount()}개 | 형식: Markdown (.md)
          </p>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleImportLogs}
            accept=".json"
            style={{ display: 'none' }}
          />
        </div>
      )}

      {showSessions && (
        <div className="sessions-panel">
          <h3>이전 대화 목록</h3>
          {sessions.length === 0 ? (
            <p className="no-sessions">저장된 대화가 없습니다.</p>
          ) : (
            <div className="sessions-list">
              {sessions.map((session) => (
                <div
                  key={session.session_id}
                  className={`session-item ${sessionId === session.session_id ? 'active' : ''}`}
                  onClick={() => loadSession(session.session_id)}
                >
                  <div className="session-preview">{session.preview}</div>
                  <div className="session-date">
                    {format(new Date(session.last_message_at), 'yyyy-MM-dd HH:mm')}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <div className="messages-container">
        {messages.map((msg, index) => (
          <div key={index} className={`message ${msg.role}`}>
            <div className="message-content">
              {/* 사용자 메시지에 감정 아이콘 표시 */}
              {msg.role === 'user' && msg.emotion && (
                <div className="emotion-indicator">
                  <span className="emotion-icon" title={msg.emotion.primary_emotion}>
                    {msg.emotion.emotion_icon}
                  </span>
                  <span className="emotion-label">
                    {msg.emotion.sentiment === 'positive' ? '긍정적' : msg.emotion.sentiment === 'negative' ? '부정적' : '중립적'}
                  </span>
                  {/* 음성 톤 분석 정보 표시 */}
                  {msg.emotion.voice_analysis && msg.emotion.voice_analysis.voice_detected && (
                    <span className="voice-tone-badge" title="음성 톤 분석">
                      🎙️
                      {msg.emotion.voice_analysis.overall_status === 'concern' ? '긴장' :
                       msg.emotion.voice_analysis.overall_status === 'attention' ? '주의' : '정상'}
                    </span>
                  )}
                </div>
              )}
              <ReactMarkdown>{msg.message}</ReactMarkdown>
              {msg.urgency_level && (
                <div className={`urgency-badge ${msg.urgency_level}`}>
                  긴급도: {msg.urgency_level}
                </div>
              )}
              {msg.suggested_action && (
                <div className="suggested-action">
                  <strong>권장 조치:</strong> {msg.suggested_action}
                </div>
              )}
              {msg.role === 'assistant' && (
                <button
                  className="speak-btn"
                  onClick={() => handleSpeak(msg.message, index)}
                  title={speakingIndex === index ? '중지' : '듣기'}
                >
                  {speakingIndex === index ? '⏸️ 중지' : '🔊 듣기'}
                </button>
              )}
            </div>
          </div>
        ))}
        {loading && (
          <div className="message assistant">
            <div className="message-content typing">
              <span></span>
              <span></span>
              <span></span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="input-container">
        {/* 음성 녹음 상태 표시 */}
        {isRecording && (
          <div className="recording-indicator">
            <span className="recording-dot"></span>
            <span>녹음 중... {recordingTime}초</span>
          </div>
        )}
        {isTranscribing && (
          <div className="transcribing-indicator">
            <span>🔄 음성을 텍스트로 변환 중...</span>
          </div>
        )}

        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="증상을 설명해주세요... (🎤 버튼으로 음성 입력)"
          rows="3"
          disabled={loading || isRecording || isTranscribing}
        />

        <div className="input-buttons">
          {/* 마이크 버튼 */}
          <button
            className={`mic-btn ${isRecording ? 'recording' : ''}`}
            onClick={isRecording ? stopRecording : startRecording}
            disabled={loading || isTranscribing}
            title={isRecording ? '녹음 중지' : '음성 입력'}
          >
            {isRecording ? '⏹️' : '🎤'}
          </button>

          {/* 전송 버튼 */}
          <button
            onClick={handleSend}
            disabled={loading || !input.trim() || isRecording || isTranscribing}
          >
            전송
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatBot;
