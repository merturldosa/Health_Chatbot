import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import './PregnancyChildcare.css';

const PregnancyChildcare = () => {
  const { user } = useAuth();
  const [activeMode, setActiveMode] = useState('pregnancy'); // pregnancy, postpartum, childcare
  const [pregnancyRecord, setPregnancyRecord] = useState(null);
  const [childRecords, setChildRecords] = useState([]);
  const [selectedChild, setSelectedChild] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [activeTab, setActiveTab] = useState('overview'); // overview, care, development, vaccination

  // 임신 정보
  useEffect(() => {
    fetchPregnancyRecord();
    fetchChildRecords();
  }, []);

  const fetchPregnancyRecord = async () => {
    // TODO: API 연동
    const mockPregnancy = {
      id: 1,
      conception_date: '2024-04-15',
      due_date: '2025-01-15',
      current_week: 32,
      pregnancy_status: 'normal',
      high_risk: false,
      weight_before_pregnancy: 58.5,
      current_weight: 68.2,
      last_checkup_date: '2024-12-05',
    };
    setPregnancyRecord(mockPregnancy);
  };

  const fetchChildRecords = async () => {
    // TODO: API 연동
    const mockChildren = [
      {
        id: 1,
        child_name: '지민',
        birth_date: '2021-03-20',
        gender: 'female',
        blood_type: 'A+',
        current_height: 102,
        current_weight: 16.5,
        age_months: 45,
      },
      {
        id: 2,
        child_name: '하준',
        birth_date: '2023-08-12',
        gender: 'male',
        blood_type: 'O+',
        current_height: 88,
        current_weight: 12.8,
        age_months: 16,
      },
    ];
    setChildRecords(mockChildren);
    if (mockChildren.length > 0) {
      setSelectedChild(mockChildren[0]);
    }
  };

  const calculateDDay = (dueDate) => {
    const today = new Date();
    const due = new Date(dueDate);
    const diffTime = due - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const calculateAge = (birthDate) => {
    const birth = new Date(birthDate);
    const today = new Date();
    const years = today.getFullYear() - birth.getFullYear();
    const months = today.getMonth() - birth.getMonth();
    const totalMonths = years * 12 + months;

    if (totalMonths < 12) {
      return `${totalMonths}개월`;
    } else {
      const ageYears = Math.floor(totalMonths / 12);
      const ageMonths = totalMonths % 12;
      return `${ageYears}세 ${ageMonths}개월`;
    }
  };

  const getPregnancyWeekInfo = (week) => {
    if (week <= 13) return { trimester: '1분기', icon: '🌱', color: '#4ade80' };
    if (week <= 26) return { trimester: '2분기', icon: '🌿', color: '#fbbf24' };
    return { trimester: '3분기', icon: '🌳', color: '#f87171' };
  };

  const prenatalCareData = [
    { id: 1, date: '2024-12-01', type: '음악 태교', duration: 30, notes: '모차르트 자장가 듣기' },
    { id: 2, date: '2024-12-03', type: '대화 태교', duration: 20, notes: '동화책 읽어주기' },
    { id: 3, date: '2024-12-05', type: '운동 태교', duration: 25, notes: '임산부 요가' },
    { id: 4, date: '2024-12-07', type: '음식 태교', duration: 0, notes: '신선한 과일과 채소 섭취' },
  ];

  const developmentMilestones = [
    { id: 1, milestone: '걷기', achieved: true, achieved_date: '2022-01-15', age_achieved: 10 },
    { id: 2, milestone: '첫 단어', achieved: true, achieved_date: '2022-03-20', age_achieved: 12 },
    { id: 3, milestone: '두 단어 조합', achieved: true, achieved_date: '2022-09-01', age_achieved: 18 },
    { id: 4, milestone: '세발자전거 타기', achieved: true, achieved_date: '2023-08-10', age_achieved: 29 },
    { id: 5, milestone: '숫자 1-10 세기', achieved: false, expected_age: 36 },
  ];

  const vaccinations = [
    { id: 1, vaccine_name: 'BCG', scheduled_date: '2021-04-20', completed: true, completion_date: '2021-04-20' },
    { id: 2, vaccine_name: 'B형간염 1차', scheduled_date: '2021-03-20', completed: true, completion_date: '2021-03-20' },
    { id: 3, vaccine_name: 'B형간염 2차', scheduled_date: '2021-04-20', completed: true, completion_date: '2021-04-20' },
    { id: 4, vaccine_name: 'DTaP 1차', scheduled_date: '2021-05-20', completed: true, completion_date: '2021-05-20' },
    { id: 5, vaccine_name: '폴리오 1차', scheduled_date: '2021-05-20', completed: true, completion_date: '2021-05-21' },
    { id: 6, vaccine_name: 'MMR 1차', scheduled_date: '2022-03-20', completed: true, completion_date: '2022-03-22' },
    { id: 7, vaccine_name: 'MMR 2차', scheduled_date: '2025-03-20', completed: false },
  ];

  const growthRecords = [
    { date: '2024-06-01', height: 95, weight: 14.5, head_circumference: 48 },
    { date: '2024-07-01', height: 96, weight: 14.8, head_circumference: 48.2 },
    { date: '2024-08-01', height: 97, weight: 15.2, head_circumference: 48.5 },
    { date: '2024-09-01', height: 98, weight: 15.5, head_circumference: 48.7 },
    { date: '2024-10-01', height: 100, weight: 15.9, head_circumference: 49 },
    { date: '2024-11-01', height: 101, weight: 16.2, head_circumference: 49.2 },
    { date: '2024-12-01', height: 102, weight: 16.5, head_circumference: 49.5 },
  ];

  return (
    <div className="pregnancy-childcare">
      <div className="header">
        <h2>👶 임신·육아 관리</h2>
        <div className="mode-selector">
          <button
            className={activeMode === 'pregnancy' ? 'active' : ''}
            onClick={() => setActiveMode('pregnancy')}
          >
            임신 관리
          </button>
          <button
            className={activeMode === 'postpartum' ? 'active' : ''}
            onClick={() => setActiveMode('postpartum')}
          >
            산후조리
          </button>
          <button
            className={activeMode === 'childcare' ? 'active' : ''}
            onClick={() => setActiveMode('childcare')}
          >
            육아 관리
          </button>
        </div>
      </div>

      {/* 임신 관리 모드 */}
      {activeMode === 'pregnancy' && pregnancyRecord && (
        <div className="pregnancy-mode">
          <div className="pregnancy-overview">
            <div className="pregnancy-card main-info">
              <div className="week-circle">
                <div className="week-number">{pregnancyRecord.current_week}주</div>
                <div className="week-label">
                  {getPregnancyWeekInfo(pregnancyRecord.current_week).trimester}
                </div>
              </div>
              <div className="pregnancy-details">
                <div className="info-item">
                  <span className="label">출산 예정일:</span>
                  <span className="value">{pregnancyRecord.due_date}</span>
                </div>
                <div className="info-item">
                  <span className="label">D-Day:</span>
                  <span className="value highlight">
                    {calculateDDay(pregnancyRecord.due_date)}일 남음
                  </span>
                </div>
                <div className="info-item">
                  <span className="label">임신 상태:</span>
                  <span className="value">
                    {pregnancyRecord.pregnancy_status === 'normal' ? '정상' : '주의'}
                    {pregnancyRecord.high_risk && ' (고위험)'}
                  </span>
                </div>
              </div>
            </div>

            <div className="pregnancy-card weight-info">
              <h4>체중 변화</h4>
              <div className="weight-comparison">
                <div className="weight-item">
                  <div className="weight-label">임신 전</div>
                  <div className="weight-value">{pregnancyRecord.weight_before_pregnancy}kg</div>
                </div>
                <div className="weight-arrow">→</div>
                <div className="weight-item">
                  <div className="weight-label">현재</div>
                  <div className="weight-value">{pregnancyRecord.current_weight}kg</div>
                </div>
              </div>
              <div className="weight-gain">
                증가: {(pregnancyRecord.current_weight - pregnancyRecord.weight_before_pregnancy).toFixed(1)}kg
              </div>
            </div>

            <div className="pregnancy-card checkup-info">
              <h4>마지막 검진</h4>
              <div className="checkup-date">{pregnancyRecord.last_checkup_date}</div>
              <button className="schedule-btn">다음 검진 예약</button>
            </div>
          </div>

          <div className="prenatal-care-section">
            <h3>태교 활동 기록</h3>
            <div className="care-timeline">
              {prenatalCareData.map(care => (
                <div key={care.id} className="care-item">
                  <div className="care-date">{care.date}</div>
                  <div className="care-type">{care.type}</div>
                  {care.duration > 0 && <div className="care-duration">{care.duration}분</div>}
                  <div className="care-notes">{care.notes}</div>
                </div>
              ))}
            </div>
            <button className="add-care-btn">+ 태교 활동 추가</button>
          </div>

          <div className="pregnancy-tips">
            <h3>🤖 AI 임신 조언</h3>
            <div className="tip-card">
              <p>현재 32주차입니다. 태아의 뇌가 급속도로 발달하는 시기예요.</p>
              <ul>
                <li>철분과 칼슘이 풍부한 음식을 섭취하세요</li>
                <li>매일 30분 이상 가벼운 산책을 권장합니다</li>
                <li>충분한 수분 섭취가 중요합니다 (하루 2L 이상)</li>
                <li>출산 준비 교육 프로그램 참여를 고려해보세요</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* 산후조리 모드 */}
      {activeMode === 'postpartum' && (
        <div className="postpartum-mode">
          <div className="postpartum-overview">
            <div className="recovery-status">
              <h3>산후 회복 상태</h3>
              <div className="status-grid">
                <div className="status-item">
                  <div className="status-icon">💪</div>
                  <div className="status-label">체력 회복</div>
                  <div className="status-bar">
                    <div className="status-fill" style={{ width: '75%' }} />
                  </div>
                  <div className="status-value">75%</div>
                </div>
                <div className="status-item">
                  <div className="status-icon">😊</div>
                  <div className="status-label">정서 안정</div>
                  <div className="status-bar">
                    <div className="status-fill" style={{ width: '80%' }} />
                  </div>
                  <div className="status-value">80%</div>
                </div>
                <div className="status-item">
                  <div className="status-icon">🍽️</div>
                  <div className="status-label">영양 상태</div>
                  <div className="status-bar">
                    <div className="status-fill" style={{ width: '85%' }} />
                  </div>
                  <div className="status-value">85%</div>
                </div>
              </div>
            </div>

            <div className="depression-screening">
              <h3>산후우울증 자가 검진</h3>
              <p className="screening-description">
                최근 2주 동안의 기분 상태를 체크해주세요
              </p>
              <button className="screening-btn">검진 시작</button>
              <div className="last-screening">
                마지막 검진: 2024-11-20 (점수: 5점 - 정상)
              </div>
            </div>
          </div>

          <div className="postpartum-care">
            <h3>산후조리 체크리스트</h3>
            <div className="checklist-items">
              <div className="checklist-item completed">
                <span className="checkbox">✓</span>
                <span>미역국 먹기</span>
              </div>
              <div className="checklist-item completed">
                <span className="checkbox">✓</span>
                <span>충분한 휴식 (8시간 수면)</span>
              </div>
              <div className="checklist-item">
                <span className="checkbox">○</span>
                <span>가벼운 산후 운동</span>
              </div>
              <div className="checklist-item">
                <span className="checkbox">○</span>
                <span>골반저근 운동</span>
              </div>
            </div>
          </div>

          <div className="postpartum-tips">
            <h3>🤖 AI 산후조리 조언</h3>
            <div className="tip-card">
              <p>산후 3주차입니다. 회복이 잘 진행되고 있습니다.</p>
              <ul>
                <li>무리한 활동은 피하고 충분히 휴식하세요</li>
                <li>철분과 단백질이 풍부한 음식을 섭취하세요</li>
                <li>정서적 변화는 자연스러운 현상입니다. 가족과 대화를 나누세요</li>
                <li>6주 검진을 잊지 마세요</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* 육아 관리 모드 */}
      {activeMode === 'childcare' && (
        <div className="childcare-mode">
          <div className="child-selector">
            {childRecords.map(child => (
              <div
                key={child.id}
                className={`child-card ${selectedChild?.id === child.id ? 'active' : ''}`}
                onClick={() => setSelectedChild(child)}
              >
                <div className="child-icon">{child.gender === 'female' ? '👧' : '👦'}</div>
                <div className="child-info">
                  <div className="child-name">{child.child_name}</div>
                  <div className="child-age">{calculateAge(child.birth_date)}</div>
                </div>
              </div>
            ))}
            <button className="add-child-btn" onClick={() => setShowAddModal(true)}>
              + 자녀 추가
            </button>
          </div>

          {selectedChild && (
            <>
              <div className="tabs">
                <button
                  className={activeTab === 'overview' ? 'active' : ''}
                  onClick={() => setActiveTab('overview')}
                >
                  개요
                </button>
                <button
                  className={activeTab === 'development' ? 'active' : ''}
                  onClick={() => setActiveTab('development')}
                >
                  발달 단계
                </button>
                <button
                  className={activeTab === 'growth' ? 'active' : ''}
                  onClick={() => setActiveTab('growth')}
                >
                  성장 기록
                </button>
                <button
                  className={activeTab === 'vaccination' ? 'active' : ''}
                  onClick={() => setActiveTab('vaccination')}
                >
                  예방접종
                </button>
              </div>

              <div className="tab-content">
                {/* 개요 탭 */}
                {activeTab === 'overview' && (
                  <div className="overview-tab">
                    <div className="child-details">
                      <h3>{selectedChild.child_name}의 정보</h3>
                      <div className="details-grid">
                        <div className="detail-item">
                          <span className="label">생년월일:</span>
                          <span className="value">{selectedChild.birth_date}</span>
                        </div>
                        <div className="detail-item">
                          <span className="label">나이:</span>
                          <span className="value">{calculateAge(selectedChild.birth_date)}</span>
                        </div>
                        <div className="detail-item">
                          <span className="label">성별:</span>
                          <span className="value">{selectedChild.gender === 'female' ? '여아' : '남아'}</span>
                        </div>
                        <div className="detail-item">
                          <span className="label">혈액형:</span>
                          <span className="value">{selectedChild.blood_type}</span>
                        </div>
                        <div className="detail-item">
                          <span className="label">현재 키:</span>
                          <span className="value">{selectedChild.current_height}cm</span>
                        </div>
                        <div className="detail-item">
                          <span className="label">현재 체중:</span>
                          <span className="value">{selectedChild.current_weight}kg</span>
                        </div>
                      </div>
                    </div>

                    <div className="quick-stats">
                      <div className="stat-card">
                        <div className="stat-icon">📏</div>
                        <div className="stat-label">성장 백분위</div>
                        <div className="stat-value">75%</div>
                        <div className="stat-desc">또래보다 큰 편</div>
                      </div>
                      <div className="stat-card">
                        <div className="stat-icon">⚖️</div>
                        <div className="stat-label">체중 백분위</div>
                        <div className="stat-value">60%</div>
                        <div className="stat-desc">정상 범위</div>
                      </div>
                      <div className="stat-card">
                        <div className="stat-icon">💉</div>
                        <div className="stat-label">예방접종</div>
                        <div className="stat-value">6/7</div>
                        <div className="stat-desc">1개 예정</div>
                      </div>
                    </div>
                  </div>
                )}

                {/* 발달 단계 탭 */}
                {activeTab === 'development' && (
                  <div className="development-tab">
                    <h3>발달 이정표</h3>
                    <div className="milestones-list">
                      {developmentMilestones.map(milestone => (
                        <div key={milestone.id} className={`milestone-item ${milestone.achieved ? 'achieved' : 'pending'}`}>
                          <div className="milestone-icon">
                            {milestone.achieved ? '✓' : '○'}
                          </div>
                          <div className="milestone-content">
                            <div className="milestone-title">{milestone.milestone}</div>
                            {milestone.achieved ? (
                              <div className="milestone-info">
                                달성일: {milestone.achieved_date} ({milestone.age_achieved}개월)
                              </div>
                            ) : (
                              <div className="milestone-info expected">
                                예상: {milestone.expected_age}개월
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                    <button className="add-milestone-btn">+ 이정표 추가</button>
                  </div>
                )}

                {/* 성장 기록 탭 */}
                {activeTab === 'growth' && (
                  <div className="growth-tab">
                    <h3>성장 기록 추이</h3>

                    <div className="growth-chart">
                      <h4>키 성장 추이</h4>
                      <div className="chart-container">
                        {growthRecords.map((record, idx) => (
                          <div key={idx} className="chart-bar-wrapper">
                            <div
                              className="chart-bar height"
                              style={{ height: `${(record.height / 120) * 100}%` }}
                            >
                              <span className="bar-value">{record.height}</span>
                            </div>
                            <div className="chart-label">
                              {new Date(record.date).getMonth() + 1}월
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="growth-chart">
                      <h4>체중 변화 추이</h4>
                      <div className="chart-container">
                        {growthRecords.map((record, idx) => (
                          <div key={idx} className="chart-bar-wrapper">
                            <div
                              className="chart-bar weight"
                              style={{ height: `${(record.weight / 20) * 100}%` }}
                            >
                              <span className="bar-value">{record.weight}</span>
                            </div>
                            <div className="chart-label">
                              {new Date(record.date).getMonth() + 1}월
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <button className="add-record-btn">+ 성장 기록 추가</button>
                  </div>
                )}

                {/* 예방접종 탭 */}
                {activeTab === 'vaccination' && (
                  <div className="vaccination-tab">
                    <h3>예방접종 기록</h3>
                    <div className="vaccination-progress">
                      완료: {vaccinations.filter(v => v.completed).length}/{vaccinations.length}
                    </div>
                    <div className="vaccination-list">
                      {vaccinations.map(vaccine => (
                        <div key={vaccine.id} className={`vaccination-item ${vaccine.completed ? 'completed' : 'pending'}`}>
                          <div className="vaccine-checkbox">
                            {vaccine.completed ? '✓' : '○'}
                          </div>
                          <div className="vaccine-content">
                            <div className="vaccine-name">{vaccine.vaccine_name}</div>
                            <div className="vaccine-date">
                              {vaccine.completed
                                ? `접종완료: ${vaccine.completion_date}`
                                : `예정일: ${vaccine.scheduled_date}`}
                            </div>
                          </div>
                          {!vaccine.completed && (
                            <button className="schedule-vaccine-btn">예약하기</button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="childcare-tips">
                <h3>🤖 AI 육아 조언</h3>
                <div className="tip-card">
                  <p>{selectedChild.child_name}({calculateAge(selectedChild.birth_date)})의 발달 상태가 양호합니다.</p>
                  <ul>
                    <li>언어 발달을 위해 매일 책을 읽어주세요</li>
                    <li>균형잡힌 영양 섭취가 중요합니다</li>
                    <li>충분한 수면 시간을 확보해주세요 (10-11시간)</li>
                    <li>또래 친구들과의 사회성 발달 기회를 만들어주세요</li>
                  </ul>
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default PregnancyChildcare;
