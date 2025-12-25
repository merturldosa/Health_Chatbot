import { useState, useRef } from 'react';
import axios from 'axios';
import './MealCapture.css';

const MealCapture = ({ onClose, onMealSaved }) => {
  const [capturedImage, setCapturedImage] = useState(null);
  const [mealType, setMealType] = useState('lunch');
  const [notes, setNotes] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [step, setStep] = useState(1); // 1: 촬영, 2: 분석 결과
  const fileInputRef = useRef(null);

  const mealTypes = [
    { value: 'breakfast', label: '아침', icon: '🌅' },
    { value: 'lunch', label: '점심', icon: '☀️' },
    { value: 'dinner', label: '저녁', icon: '🌙' },
    { value: 'snack', label: '간식', icon: '🍪' },
  ];

  const handleCapture = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setCapturedImage(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleSave = async () => {
    if (!capturedImage) {
      alert('식단 사진을 촬영해주세요.');
      return;
    }

    setIsAnalyzing(true);

    try {
      const token = localStorage.getItem('access_token');

      // 1. 식단 기록 생성
      const mealResponse = await axios.post(
        'http://localhost:8000/api/meals/',
        {
          meal_type: mealType,
          meal_date: new Date().toISOString(),
          image_url: capturedImage,
          notes: notes,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      const mealId = mealResponse.data.id;

      // 2. AI 분석 요청
      const analysisResponse = await axios.post(
        `http://localhost:8000/api/meals/${mealId}/analyze`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setAnalysisResult(analysisResponse.data);
      setStep(2); // 분석 결과 화면으로 전환
      setIsAnalyzing(false);

      // 부모 컴포넌트에 알림
      if (onMealSaved) {
        onMealSaved(analysisResponse.data);
      }
    } catch (error) {
      console.error('식단 저장 및 분석 실패:', error);
      alert('식단 저장 및 분석에 실패했습니다.');
      setIsAnalyzing(false);
    }
  };

  const handleRetake = () => {
    setCapturedImage(null);
    setAnalysisResult(null);
    setStep(1);
  };

  const getHealthScoreColor = (score) => {
    if (score >= 8) return '#4caf50';
    if (score >= 6) return '#ff9800';
    return '#f44336';
  };

  const getMatchPercentageColor = (percentage) => {
    if (percentage >= 80) return '#4caf50';
    if (percentage >= 60) return '#ff9800';
    return '#f44336';
  };

  return (
    <div className="meal-capture-overlay">
      <div className="meal-capture-modal">
        <div className="modal-header">
          <h2>식단 기록</h2>
          <button className="close-btn" onClick={onClose}>
            ✕
          </button>
        </div>

        {step === 1 ? (
          <div className="capture-step">
            <div className="meal-type-selector">
              {mealTypes.map((type) => (
                <button
                  key={type.value}
                  className={`meal-type-btn ${
                    mealType === type.value ? 'active' : ''
                  }`}
                  onClick={() => setMealType(type.value)}
                >
                  <span className="meal-icon">{type.icon}</span>
                  <span>{type.label}</span>
                </button>
              ))}
            </div>

            <div className="image-preview">
              {capturedImage ? (
                <img src={capturedImage} alt="촬영한 식단" />
              ) : (
                <div className="placeholder">
                  <span className="camera-icon">📸</span>
                  <p>식단 사진을 촬영하거나 선택하세요</p>
                </div>
              )}
            </div>

            <input
              type="file"
              ref={fileInputRef}
              onChange={handleCapture}
              accept="image/*"
              capture="environment"
              style={{ display: 'none' }}
            />

            <button
              className="capture-btn"
              onClick={() => fileInputRef.current.click()}
            >
              {capturedImage ? '📷 다시 촬영' : '📷 사진 촬영'}
            </button>

            <div className="notes-section">
              <label>메모 (선택사항)</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="식사에 대한 메모를 남겨보세요..."
                rows={3}
              />
            </div>

            <button
              className="analyze-btn"
              onClick={handleSave}
              disabled={!capturedImage || isAnalyzing}
            >
              {isAnalyzing ? (
                <>
                  <span className="spinner"></span> AI 분석 중...
                </>
              ) : (
                '✨ AI 분석하고 저장'
              )}
            </button>
          </div>
        ) : (
          <div className="analysis-result">
            <div className="result-image">
              <img src={capturedImage} alt="분석된 식단" />
            </div>

            <div className="analysis-summary">
              <div className="score-cards">
                <div className="score-card">
                  <div className="score-label">건강 점수</div>
                  <div
                    className="score-value"
                    style={{
                      color: getHealthScoreColor(
                        analysisResult?.health_score || 0
                      ),
                    }}
                  >
                    {analysisResult?.health_score?.toFixed(1) || 0} / 10
                  </div>
                </div>
                <div className="score-card">
                  <div className="score-label">추천 식단 일치도</div>
                  <div
                    className="score-value"
                    style={{
                      color: getMatchPercentageColor(
                        analysisResult?.meal?.match_percentage || 0
                      ),
                    }}
                  >
                    {analysisResult?.meal?.match_percentage?.toFixed(0) || 0}%
                  </div>
                </div>
              </div>

              <div className="detected-foods">
                <h4>감지된 음식</h4>
                <div className="food-tags">
                  {analysisResult?.detected_foods?.map((food, index) => (
                    <span key={index} className="food-tag">
                      {food}
                    </span>
                  ))}
                </div>
              </div>

              <div className="nutrition-info">
                <h4>영양 정보</h4>
                <div className="nutrition-grid">
                  <div className="nutrition-item">
                    <span className="nutrition-label">칼로리</span>
                    <span className="nutrition-value">
                      {analysisResult?.meal?.calories?.toFixed(0) || 0} kcal
                    </span>
                  </div>
                  <div className="nutrition-item">
                    <span className="nutrition-label">단백질</span>
                    <span className="nutrition-value">
                      {analysisResult?.meal?.protein?.toFixed(1) || 0}g
                    </span>
                  </div>
                  <div className="nutrition-item">
                    <span className="nutrition-label">탄수화물</span>
                    <span className="nutrition-value">
                      {analysisResult?.meal?.carbs?.toFixed(1) || 0}g
                    </span>
                  </div>
                  <div className="nutrition-item">
                    <span className="nutrition-label">지방</span>
                    <span className="nutrition-value">
                      {analysisResult?.meal?.fat?.toFixed(1) || 0}g
                    </span>
                  </div>
                </div>
              </div>

              <div className="ai-analysis">
                <h4>AI 분석</h4>
                <p>{analysisResult?.meal?.ai_analysis}</p>
              </div>

              <div className="ai-recommendation">
                <h4>💡 AI 추천사항</h4>
                <p>{analysisResult?.meal?.ai_recommendation}</p>
              </div>
            </div>

            <div className="result-actions">
              <button className="retake-btn" onClick={handleRetake}>
                다시 촬영
              </button>
              <button className="done-btn" onClick={onClose}>
                완료
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MealCapture;
