import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import './DiseaseManagement.css';

const DiseaseManagement = () => {
  const { user } = useAuth();
  const [diseases, setDiseases] = useState([]);
  const [selectedDisease, setSelectedDisease] = useState(null);
  const [treatmentPlan, setTreatmentPlan] = useState(null);
  const [todayChecklist, setTodayChecklist] = useState([]);
  const [progressData, setProgressData] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [activeTab, setActiveTab] = useState('overview'); // overview, treatment, checklist, progress

  const [newDisease, setNewDisease] = useState({
    disease_name: '',
    diagnosis_date: new Date().toISOString().split('T')[0],
    disease_type: 'chronic',
    severity: 'medium',
    current_status: 'active',
    symptoms: '',
    diagnosis_details: '',
  });

  // 질병 목록 불러오기
  useEffect(() => {
    fetchDiseases();
  }, []);

  // 선택된 질병의 상세 정보 불러오기
  useEffect(() => {
    if (selectedDisease) {
      fetchTreatmentPlan(selectedDisease.id);
      fetchTodayChecklist(selectedDisease.id);
      fetchProgressData(selectedDisease.id);
    }
  }, [selectedDisease]);

  const fetchDiseases = async () => {
    // TODO: API 연동
    // const response = await fetch('/api/diseases', {
    //   headers: { 'Authorization': `Bearer ${token}` }
    // });
    // const data = await response.json();

    // 시뮬레이션 데이터
    const mockDiseases = [
      {
        id: 1,
        disease_name: '고혈압',
        diagnosis_date: '2024-01-15',
        disease_type: 'chronic',
        severity: 'medium',
        current_status: 'active',
        symptoms: '두통, 어지러움',
      },
      {
        id: 2,
        disease_name: '당뇨병 2형',
        diagnosis_date: '2024-03-20',
        disease_type: 'chronic',
        severity: 'high',
        current_status: 'active',
        symptoms: '갈증, 피로',
      },
    ];

    setDiseases(mockDiseases);
    if (mockDiseases.length > 0) {
      setSelectedDisease(mockDiseases[0]);
    }
  };

  const fetchTreatmentPlan = async (diseaseId) => {
    // TODO: API 연동
    const mockPlan = {
      id: 1,
      disease_id: diseaseId,
      plan_duration_months: 6,
      start_date: '2024-01-15',
      end_date: '2024-07-15',
      treatment_goal: '혈압을 정상 범위로 유지하기 (120/80)',
      medications: ['암로디핀 5mg', '로사르탄 50mg'],
      lifestyle_changes: ['저염식 실천', '주 3회 이상 유산소 운동', '금주'],
      follow_up_schedule: '2주마다 혈압 측정, 월 1회 병원 방문',
      ai_generated: true,
    };
    setTreatmentPlan(mockPlan);
  };

  const fetchTodayChecklist = async (diseaseId) => {
    // TODO: API 연동
    const mockChecklist = [
      {
        id: 1,
        task_title: '아침 혈압약 복용',
        task_type: 'medication',
        scheduled_time: '08:00',
        completed: true,
        completed_at: '2024-01-20T08:15:00',
      },
      {
        id: 2,
        task_title: '혈압 측정',
        task_type: 'measurement',
        scheduled_time: '09:00',
        completed: true,
        completed_at: '2024-01-20T09:05:00',
        notes: '수축기: 128, 이완기: 82',
      },
      {
        id: 3,
        task_title: '30분 걷기',
        task_type: 'exercise',
        scheduled_time: '14:00',
        completed: false,
      },
      {
        id: 4,
        task_title: '저녁 혈압약 복용',
        task_type: 'medication',
        scheduled_time: '20:00',
        completed: false,
      },
    ];
    setTodayChecklist(mockChecklist);
  };

  const fetchProgressData = async (diseaseId) => {
    // TODO: API 연동
    const mockProgress = [
      {
        date: '2024-01-14',
        symptom_severity: 7,
        medication_adherence: 80,
        overall_improvement: 45,
        notes: '혈압이 조금 높음',
      },
      {
        date: '2024-01-15',
        symptom_severity: 6,
        medication_adherence: 100,
        overall_improvement: 50,
        notes: '약 복용 잘 지킴',
      },
      {
        date: '2024-01-16',
        symptom_severity: 5,
        medication_adherence: 100,
        overall_improvement: 55,
        notes: '증상 호전',
      },
      {
        date: '2024-01-17',
        symptom_severity: 5,
        medication_adherence: 100,
        overall_improvement: 60,
        notes: '안정적',
      },
      {
        date: '2024-01-18',
        symptom_severity: 4,
        medication_adherence: 100,
        overall_improvement: 65,
        notes: '많이 좋아짐',
      },
      {
        date: '2024-01-19',
        symptom_severity: 4,
        medication_adherence: 100,
        overall_improvement: 70,
        notes: '컨디션 좋음',
      },
      {
        date: '2024-01-20',
        symptom_severity: 3,
        medication_adherence: 100,
        overall_improvement: 75,
        notes: '목표에 근접',
      },
    ];
    setProgressData(mockProgress);
  };

  const handleAddDisease = async (e) => {
    e.preventDefault();
    // TODO: API 연동
    // await fetch('/api/diseases', { method: 'POST', body: JSON.stringify(newDisease) });

    const mockNewDisease = {
      id: diseases.length + 1,
      ...newDisease,
    };

    setDiseases([...diseases, mockNewDisease]);
    setShowAddForm(false);
    setNewDisease({
      disease_name: '',
      diagnosis_date: new Date().toISOString().split('T')[0],
      disease_type: 'chronic',
      severity: 'medium',
      current_status: 'active',
      symptoms: '',
      diagnosis_details: '',
    });
  };

  const handleChecklistToggle = async (taskId) => {
    const updatedChecklist = todayChecklist.map(task =>
      task.id === taskId
        ? {
            ...task,
            completed: !task.completed,
            completed_at: !task.completed ? new Date().toISOString() : null,
          }
        : task
    );
    setTodayChecklist(updatedChecklist);

    // TODO: API 연동
    // await fetch(`/api/diseases/${selectedDisease.id}/checklist/${taskId}/toggle`, { method: 'PATCH' });
  };

  const generateAITreatmentPlan = async () => {
    // TODO: API 연동
    alert('AI가 치료 계획을 생성 중입니다...');
  };

  const getSeverityColor = (severity) => {
    const colors = {
      low: '#4ade80',
      medium: '#fbbf24',
      high: '#f87171',
    };
    return colors[severity] || '#94a3b8';
  };

  const getTaskIcon = (taskType) => {
    const icons = {
      medication: '💊',
      measurement: '📊',
      exercise: '🏃',
      diet: '🥗',
      checkup: '🏥',
      other: '📌',
    };
    return icons[taskType] || '📌';
  };

  const completedTasks = todayChecklist.filter(t => t.completed).length;
  const totalTasks = todayChecklist.length;
  const completionRate = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

  return (
    <div className="disease-management">
      <div className="disease-header">
        <h2>🏥 질병 관리</h2>
        <button className="add-disease-btn" onClick={() => setShowAddForm(true)}>
          + 질병 추가
        </button>
      </div>

      {/* 질병 목록 */}
      <div className="disease-list">
        {diseases.map(disease => (
          <div
            key={disease.id}
            className={`disease-card ${selectedDisease?.id === disease.id ? 'active' : ''}`}
            onClick={() => setSelectedDisease(disease)}
          >
            <div className="disease-card-header">
              <h3>{disease.disease_name}</h3>
              <span
                className="severity-badge"
                style={{ backgroundColor: getSeverityColor(disease.severity) }}
              >
                {disease.severity === 'high' ? '높음' : disease.severity === 'medium' ? '중간' : '낮음'}
              </span>
            </div>
            <div className="disease-card-info">
              <p>진단일: {disease.diagnosis_date}</p>
              <p>증상: {disease.symptoms}</p>
            </div>
          </div>
        ))}
      </div>

      {/* 상세 정보 탭 */}
      {selectedDisease && (
        <div className="disease-details">
          <div className="tabs">
            <button
              className={activeTab === 'overview' ? 'active' : ''}
              onClick={() => setActiveTab('overview')}
            >
              개요
            </button>
            <button
              className={activeTab === 'treatment' ? 'active' : ''}
              onClick={() => setActiveTab('treatment')}
            >
              치료 계획
            </button>
            <button
              className={activeTab === 'checklist' ? 'active' : ''}
              onClick={() => setActiveTab('checklist')}
            >
              오늘의 체크리스트
            </button>
            <button
              className={activeTab === 'progress' ? 'active' : ''}
              onClick={() => setActiveTab('progress')}
            >
              진행 상황
            </button>
          </div>

          <div className="tab-content">
            {/* 개요 탭 */}
            {activeTab === 'overview' && (
              <div className="overview-tab">
                <div className="info-section">
                  <h3>질병 정보</h3>
                  <div className="info-grid">
                    <div className="info-item">
                      <span className="label">질병명:</span>
                      <span className="value">{selectedDisease.disease_name}</span>
                    </div>
                    <div className="info-item">
                      <span className="label">진단일:</span>
                      <span className="value">{selectedDisease.diagnosis_date}</span>
                    </div>
                    <div className="info-item">
                      <span className="label">유형:</span>
                      <span className="value">
                        {selectedDisease.disease_type === 'chronic' ? '만성' : '급성'}
                      </span>
                    </div>
                    <div className="info-item">
                      <span className="label">중증도:</span>
                      <span className="value" style={{ color: getSeverityColor(selectedDisease.severity) }}>
                        {selectedDisease.severity === 'high' ? '높음' : selectedDisease.severity === 'medium' ? '중간' : '낮음'}
                      </span>
                    </div>
                    <div className="info-item">
                      <span className="label">현재 상태:</span>
                      <span className="value">
                        {selectedDisease.current_status === 'active' ? '치료중' : '완치'}
                      </span>
                    </div>
                    <div className="info-item full-width">
                      <span className="label">증상:</span>
                      <span className="value">{selectedDisease.symptoms}</span>
                    </div>
                  </div>
                </div>

                <div className="today-summary">
                  <h3>오늘의 진행률</h3>
                  <div className="progress-ring">
                    <svg width="150" height="150">
                      <circle
                        cx="75"
                        cy="75"
                        r="65"
                        fill="none"
                        stroke="rgba(255,255,255,0.2)"
                        strokeWidth="10"
                      />
                      <circle
                        cx="75"
                        cy="75"
                        r="65"
                        fill="none"
                        stroke="#4ade80"
                        strokeWidth="10"
                        strokeDasharray={`${completionRate * 4.08} 408`}
                        strokeLinecap="round"
                        transform="rotate(-90 75 75)"
                      />
                      <text x="75" y="75" textAnchor="middle" dy="0.3em" fontSize="32" fill="white" fontWeight="700">
                        {Math.round(completionRate)}%
                      </text>
                    </svg>
                  </div>
                  <p className="summary-text">
                    {completedTasks}/{totalTasks} 작업 완료
                  </p>
                </div>
              </div>
            )}

            {/* 치료 계획 탭 */}
            {activeTab === 'treatment' && treatmentPlan && (
              <div className="treatment-tab">
                <div className="treatment-header">
                  <h3>치료 계획</h3>
                  <button className="ai-generate-btn" onClick={generateAITreatmentPlan}>
                    🤖 AI 계획 생성
                  </button>
                </div>

                <div className="treatment-info">
                  <div className="info-item">
                    <span className="label">치료 기간:</span>
                    <span className="value">{treatmentPlan.plan_duration_months}개월</span>
                  </div>
                  <div className="info-item">
                    <span className="label">시작일:</span>
                    <span className="value">{treatmentPlan.start_date}</span>
                  </div>
                  <div className="info-item">
                    <span className="label">종료일:</span>
                    <span className="value">{treatmentPlan.end_date}</span>
                  </div>
                </div>

                <div className="treatment-section">
                  <h4>🎯 치료 목표</h4>
                  <p>{treatmentPlan.treatment_goal}</p>
                </div>

                <div className="treatment-section">
                  <h4>💊 처방 약물</h4>
                  <ul>
                    {treatmentPlan.medications.map((med, idx) => (
                      <li key={idx}>{med}</li>
                    ))}
                  </ul>
                </div>

                <div className="treatment-section">
                  <h4>🏃 생활 습관 개선</h4>
                  <ul>
                    {treatmentPlan.lifestyle_changes.map((change, idx) => (
                      <li key={idx}>{change}</li>
                    ))}
                  </ul>
                </div>

                <div className="treatment-section">
                  <h4>📅 추적 관찰 일정</h4>
                  <p>{treatmentPlan.follow_up_schedule}</p>
                </div>

                {treatmentPlan.ai_generated && (
                  <div className="ai-badge">
                    <span>🤖 AI가 생성한 치료 계획입니다</span>
                  </div>
                )}
              </div>
            )}

            {/* 체크리스트 탭 */}
            {activeTab === 'checklist' && (
              <div className="checklist-tab">
                <h3>오늘의 체크리스트</h3>
                <div className="checklist-progress">
                  <div className="progress-bar">
                    <div
                      className="progress-fill"
                      style={{ width: `${completionRate}%` }}
                    />
                  </div>
                  <span className="progress-text">
                    {completedTasks}/{totalTasks} 완료 ({Math.round(completionRate)}%)
                  </span>
                </div>

                <div className="checklist-items">
                  {todayChecklist.map(task => (
                    <div
                      key={task.id}
                      className={`checklist-item ${task.completed ? 'completed' : ''}`}
                      onClick={() => handleChecklistToggle(task.id)}
                    >
                      <div className="task-icon">{getTaskIcon(task.task_type)}</div>
                      <div className="task-content">
                        <div className="task-title">{task.task_title}</div>
                        <div className="task-time">{task.scheduled_time}</div>
                        {task.notes && <div className="task-notes">{task.notes}</div>}
                        {task.completed_at && (
                          <div className="task-completed-time">
                            완료: {new Date(task.completed_at).toLocaleTimeString('ko-KR')}
                          </div>
                        )}
                      </div>
                      <div className="task-checkbox">
                        {task.completed ? '✓' : '○'}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 진행 상황 탭 */}
            {activeTab === 'progress' && (
              <div className="progress-tab">
                <h3>진행 상황</h3>

                <div className="progress-chart">
                  <h4>증상 호전도 추이</h4>
                  <div className="chart-container">
                    {progressData.map((data, idx) => (
                      <div key={idx} className="chart-bar-wrapper">
                        <div
                          className="chart-bar improvement"
                          style={{ height: `${data.overall_improvement}%` }}
                          title={`호전도: ${data.overall_improvement}%`}
                        >
                          <span className="bar-value">{data.overall_improvement}</span>
                        </div>
                        <div className="chart-label">
                          {new Date(data.date).getDate()}일
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="progress-chart">
                  <h4>증상 심각도 추이</h4>
                  <div className="chart-container">
                    {progressData.map((data, idx) => (
                      <div key={idx} className="chart-bar-wrapper">
                        <div
                          className="chart-bar severity"
                          style={{ height: `${data.symptom_severity * 10}%` }}
                          title={`심각도: ${data.symptom_severity}/10`}
                        >
                          <span className="bar-value">{data.symptom_severity}</span>
                        </div>
                        <div className="chart-label">
                          {new Date(data.date).getDate()}일
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="progress-chart">
                  <h4>복약 순응도</h4>
                  <div className="chart-container">
                    {progressData.map((data, idx) => (
                      <div key={idx} className="chart-bar-wrapper">
                        <div
                          className="chart-bar adherence"
                          style={{ height: `${data.medication_adherence}%` }}
                          title={`순응도: ${data.medication_adherence}%`}
                        >
                          <span className="bar-value">{data.medication_adherence}</span>
                        </div>
                        <div className="chart-label">
                          {new Date(data.date).getDate()}일
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="progress-notes">
                  <h4>진행 기록</h4>
                  {progressData.map((data, idx) => (
                    <div key={idx} className="progress-note">
                      <div className="note-date">{data.date}</div>
                      <div className="note-content">{data.notes}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 질병 추가 모달 */}
      {showAddForm && (
        <div className="modal-overlay" onClick={() => setShowAddForm(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>질병 추가</h3>
            <form onSubmit={handleAddDisease}>
              <div className="form-group">
                <label>질병명</label>
                <input
                  type="text"
                  value={newDisease.disease_name}
                  onChange={(e) => setNewDisease({ ...newDisease, disease_name: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label>진단일</label>
                <input
                  type="date"
                  value={newDisease.diagnosis_date}
                  onChange={(e) => setNewDisease({ ...newDisease, diagnosis_date: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label>유형</label>
                <select
                  value={newDisease.disease_type}
                  onChange={(e) => setNewDisease({ ...newDisease, disease_type: e.target.value })}
                >
                  <option value="chronic">만성</option>
                  <option value="acute">급성</option>
                </select>
              </div>

              <div className="form-group">
                <label>중증도</label>
                <select
                  value={newDisease.severity}
                  onChange={(e) => setNewDisease({ ...newDisease, severity: e.target.value })}
                >
                  <option value="low">낮음</option>
                  <option value="medium">중간</option>
                  <option value="high">높음</option>
                </select>
              </div>

              <div className="form-group">
                <label>증상</label>
                <textarea
                  value={newDisease.symptoms}
                  onChange={(e) => setNewDisease({ ...newDisease, symptoms: e.target.value })}
                  rows="3"
                />
              </div>

              <div className="form-group">
                <label>진단 상세</label>
                <textarea
                  value={newDisease.diagnosis_details}
                  onChange={(e) => setNewDisease({ ...newDisease, diagnosis_details: e.target.value })}
                  rows="3"
                />
              </div>

              <div className="form-actions">
                <button type="button" onClick={() => setShowAddForm(false)}>
                  취소
                </button>
                <button type="submit">추가</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default DiseaseManagement;
