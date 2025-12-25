/**
 * 채팅 후 감정 표현 모달
 *
 * 사용자가 대화 후 자신의 감정과 상대방의 감정을 표현할 수 있는 UI
 */

import { useState } from 'react';
import { savePostChatEmotion, getEmotionIcon } from '../firebase/firestoreService';
import './PostChatEmotionModal.css';

const EMOTIONS = [
  { id: 'joy', label: '기쁨', icon: '😊' },
  { id: 'happiness', label: '행복', icon: '😊' },
  { id: 'love', label: '사랑', icon: '❤️' },
  { id: 'excitement', label: '흥분', icon: '🤩' },
  { id: 'calm', label: '평온', icon: '😌' },
  { id: 'neutral', label: '중립', icon: '😐' },
  { id: 'sadness', label: '슬픔', icon: '😢' },
  { id: 'anxiety', label: '불안', icon: '😰' },
  { id: 'fear', label: '두려움', icon: '😨' },
  { id: 'anger', label: '분노', icon: '😠' },
  { id: 'frustration', label: '좌절', icon: '😤' },
  { id: 'stress', label: '스트레스', icon: '😖' },
  { id: 'confusion', label: '혼란', icon: '😕' },
  { id: 'surprise', label: '놀람', icon: '😲' },
  { id: 'disgust', label: '혐오', icon: '🤢' },
];

const PostChatEmotionModal = ({ conversationId, currentUserId, otherUserName, onClose }) => {
  const [step, setStep] = useState(1); // 1: 내 감정, 2: 상대방 감정
  const [saving, setSaving] = useState(false);

  // 내 감정
  const [myEmotion, setMyEmotion] = useState('');
  const [myIntensity, setMyIntensity] = useState(5);
  const [myNotes, setMyNotes] = useState('');

  // 상대방 감정 (내가 인지한)
  const [otherEmotion, setOtherEmotion] = useState('');
  const [otherIntensity, setOtherIntensity] = useState(5);
  const [otherConfidence, setOtherConfidence] = useState(50);

  const handleNext = () => {
    if (!myEmotion) {
      alert('감정을 선택해주세요');
      return;
    }
    setStep(2);
  };

  const handleSubmit = async () => {
    if (!otherEmotion) {
      alert('상대방의 감정을 선택해주세요');
      return;
    }

    setSaving(true);

    try {
      const emotionData = {
        conversationId,
        userId: currentUserId,
        myEmotion: {
          primary: myEmotion,
          intensity: myIntensity,
          notes: myNotes,
          emotion_icon: getEmotionIcon(myEmotion),
        },
        perceivedOtherEmotion: {
          primary: otherEmotion,
          intensity: otherIntensity,
          confidence: otherConfidence,
          emotion_icon: getEmotionIcon(otherEmotion),
        },
      };

      const result = await savePostChatEmotion(emotionData);

      if (result.success) {
        alert('감정 표현이 저장되었습니다');
        onClose();
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      console.error('감정 표현 저장 실패:', error);
      alert('감정 표현 저장에 실패했습니다');
    } finally {
      setSaving(false);
    }
  };

  const selectedMyEmotion = EMOTIONS.find((e) => e.id === myEmotion);
  const selectedOtherEmotion = EMOTIONS.find((e) => e.id === otherEmotion);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>채팅 후 감정 표현</h2>
          <button className="modal-close" onClick={onClose}>
            ✕
          </button>
        </div>

        {step === 1 ? (
          /* 1단계: 내 감정 */
          <div className="modal-body">
            <div className="emotion-step">
              <h3>대화 후 나는 어떤 감정을 느꼈나요?</h3>
              <p className="step-description">
                방금 대화에서 느낀 감정을 솔직하게 선택해주세요
              </p>

              <div className="emotion-grid">
                {EMOTIONS.map((emotion) => (
                  <button
                    key={emotion.id}
                    className={`emotion-btn ${myEmotion === emotion.id ? 'selected' : ''}`}
                    onClick={() => setMyEmotion(emotion.id)}
                  >
                    <span className="emotion-btn-icon">{emotion.icon}</span>
                    <span className="emotion-btn-label">{emotion.label}</span>
                  </button>
                ))}
              </div>

              {myEmotion && (
                <>
                  <div className="intensity-section">
                    <label>
                      감정 강도: <strong>{myIntensity}</strong>/10
                      {selectedMyEmotion && (
                        <span className="intensity-icon">{selectedMyEmotion.icon}</span>
                      )}
                    </label>
                    <input
                      type="range"
                      min="1"
                      max="10"
                      value={myIntensity}
                      onChange={(e) => setMyIntensity(parseInt(e.target.value))}
                      className="intensity-slider"
                    />
                    <div className="intensity-labels">
                      <span>약함</span>
                      <span>강함</span>
                    </div>
                  </div>

                  <div className="notes-section">
                    <label>메모 (선택사항)</label>
                    <textarea
                      placeholder="감정에 대해 더 자세히 적어보세요..."
                      value={myNotes}
                      onChange={(e) => setMyNotes(e.target.value)}
                      rows={3}
                    />
                  </div>
                </>
              )}
            </div>
          </div>
        ) : (
          /* 2단계: 상대방 감정 */
          <div className="modal-body">
            <div className="emotion-step">
              <h3>{otherUserName}님은 어떤 감정이었을까요?</h3>
              <p className="step-description">
                대화 중 상대방이 느낀 것으로 보이는 감정을 선택해주세요
              </p>

              <div className="emotion-grid">
                {EMOTIONS.map((emotion) => (
                  <button
                    key={emotion.id}
                    className={`emotion-btn ${otherEmotion === emotion.id ? 'selected' : ''}`}
                    onClick={() => setOtherEmotion(emotion.id)}
                  >
                    <span className="emotion-btn-icon">{emotion.icon}</span>
                    <span className="emotion-btn-label">{emotion.label}</span>
                  </button>
                ))}
              </div>

              {otherEmotion && (
                <>
                  <div className="intensity-section">
                    <label>
                      감정 강도: <strong>{otherIntensity}</strong>/10
                      {selectedOtherEmotion && (
                        <span className="intensity-icon">{selectedOtherEmotion.icon}</span>
                      )}
                    </label>
                    <input
                      type="range"
                      min="1"
                      max="10"
                      value={otherIntensity}
                      onChange={(e) => setOtherIntensity(parseInt(e.target.value))}
                      className="intensity-slider"
                    />
                    <div className="intensity-labels">
                      <span>약함</span>
                      <span>강함</span>
                    </div>
                  </div>

                  <div className="intensity-section">
                    <label>
                      확신도: <strong>{otherConfidence}%</strong>
                    </label>
                    <p className="confidence-description">
                      상대방의 감정을 얼마나 확신하시나요?
                    </p>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={otherConfidence}
                      onChange={(e) => setOtherConfidence(parseInt(e.target.value))}
                      className="intensity-slider"
                    />
                    <div className="intensity-labels">
                      <span>불확실</span>
                      <span>확실</span>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        <div className="modal-footer">
          {step === 1 ? (
            <>
              <button className="btn-secondary" onClick={onClose}>
                취소
              </button>
              <button className="btn-primary" onClick={handleNext} disabled={!myEmotion}>
                다음
              </button>
            </>
          ) : (
            <>
              <button className="btn-secondary" onClick={() => setStep(1)}>
                이전
              </button>
              <button
                className="btn-primary"
                onClick={handleSubmit}
                disabled={!otherEmotion || saving}
              >
                {saving ? '저장 중...' : '저장'}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default PostChatEmotionModal;
