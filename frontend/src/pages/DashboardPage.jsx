import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import FloatingHealthButton from '../components/FloatingHealthButton';
import HealthOverviewWidget from '../components/HealthOverviewWidget';
import VoiceCheckIn from '../components/VoiceCheckIn';
import ContinuousVoiceMonitor from '../components/ContinuousVoiceMonitor';
import MealCapture from '../components/MealCapture';
import MoodChart from '../components/MoodChart';
import NutritionChart from '../components/NutritionChart';
import { mealsAPI, mentalHealthAPI } from '../services/api';
import './DashboardPage.css';

const DashboardPage = () => {
  const { user } = useAuth();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState('day'); // day, week, month, year
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);
  const [showMealCapture, setShowMealCapture] = useState(false);
  const [todayMeals, setTodayMeals] = useState([]);
  const [moodRecords, setMoodRecords] = useState([]);
  const [todayTasks, setTodayTasks] = useState([
    { id: 1, type: 'meal', title: '아침 식사', completed: false, time: '08:00' },
    { id: 2, type: 'medication', title: '혈압약 복용', completed: false, time: '09:00' },
    { id: 3, type: 'meal', title: '점심 식사', completed: false, time: '12:00' },
    { id: 4, type: 'exercise', title: '30분 걷기', completed: false, time: '14:00' },
    { id: 5, type: 'meal', title: '저녁 식사', completed: false, time: '18:00' },
    { id: 6, type: 'meditation', title: '명상 10분', completed: false, time: '20:00' },
  ]);

  const minSwipeDistance = 50;
  const containerRef = useRef(null);
  const [scale, setScale] = useState(1);
  const [initialDistance, setInitialDistance] = useState(null);

      // 데이터 로딩
    useEffect(() => {
      const loadData = async () => {
        try {
          // 오늘 날짜 포맷 (YYYY-MM-DD)
          const dateObj = new Date(currentDate);
          dateObj.setHours(0, 0, 0, 0);
          const startDateStr = dateObj.toISOString();
          
          const endDateObj = new Date(currentDate);
          endDateObj.setHours(23, 59, 59, 999);
          const endDateStr = endDateObj.toISOString();
  
          // 식단 데이터 로드 (현재 선택된 날짜 하루치)
          const mealsRes = await mealsAPI.getAll({ 
            start_date: startDateStr, 
            end_date: endDateStr 
          }); 
          
          if (mealsRes.data) {
             setTodayMeals(Array.isArray(mealsRes.data) ? mealsRes.data : []);
          }
  
          // 감정 기록 로드 (최근 30일)
          const thirtyDaysAgo = new Date(currentDate);
          thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
          const moodRes = await mentalHealthAPI.getAll({ 
            start_date: thirtyDaysAgo.toISOString().split('T')[0],
            end_date: endDateStr.split('T')[0] // YYYY-MM-DD 형식
          });
          if (moodRes.data) {
            setMoodRecords(Array.isArray(moodRes.data) ? moodRes.data : []);
          }
  
        } catch (error) {
          console.error('데이터 로딩 실패:', error);
        }
      };
  
      loadData();
    }, [currentDate]);
  // 두 터치 포인트 간 거리 계산
  const getDistance = (touch1, touch2) => {
    const dx = touch1.clientX - touch2.clientX;
    const dy = touch1.clientY - touch2.clientY;
    return Math.sqrt(dx * dx + dy * dy);
  };

  const onTouchStart = (e) => {
    if (e.touches.length === 2) {
      // 핀치 줌 시작
      const distance = getDistance(e.touches[0], e.touches[1]);
      setInitialDistance(distance);
    } else if (e.touches.length === 1) {
      // 스와이프 시작
      setTouchEnd(null);
      setTouchStart(e.targetTouches[0].clientX);
    }
  };

  const onTouchMove = (e) => {
    if (e.touches.length === 2 && initialDistance) {
      // 핀치 줌
      const currentDistance = getDistance(e.touches[0], e.touches[1]);
      const scaleChange = currentDistance / initialDistance;

      // 스케일 변화에 따라 viewMode 변경
      if (scaleChange > 1.2) {
        // 확대 (더 작은 단위로)
        if (viewMode === 'year') setViewMode('month');
        else if (viewMode === 'month') setViewMode('week');
        else if (viewMode === 'week') setViewMode('day');
        setInitialDistance(currentDistance);
      } else if (scaleChange < 0.8) {
        // 축소 (더 큰 단위로)
        if (viewMode === 'day') setViewMode('week');
        else if (viewMode === 'week') setViewMode('month');
        else if (viewMode === 'month') setViewMode('year');
        setInitialDistance(currentDistance);
      }
    } else if (e.touches.length === 1) {
      setTouchEnd(e.targetTouches[0].clientX);
    }
  };

  const onTouchEnd = () => {
    setInitialDistance(null);

    if (!touchStart || !touchEnd) return;

    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe) {
      // 미래로 이동
      navigateDate(1);
    }
    if (isRightSwipe) {
      // 과거로 이동
      navigateDate(-1);
    }
  };

  const navigateDate = (direction) => {
    const newDate = new Date(currentDate);
    if (viewMode === 'day') {
      newDate.setDate(currentDate.getDate() + direction);
    } else if (viewMode === 'week') {
      newDate.setDate(currentDate.getDate() + direction * 7);
    } else if (viewMode === 'month') {
      newDate.setMonth(currentDate.getMonth() + direction);
    } else if (viewMode === 'year') {
      newDate.setFullYear(currentDate.getFullYear() + direction);
    }
    setCurrentDate(newDate);
  };

  const goToToday = () => {
    setCurrentDate(new Date());
    setViewMode('day');
  };

  const toggleTaskComplete = (taskId) => {
    setTodayTasks(
      todayTasks.map((task) =>
        task.id === taskId ? { ...task, completed: !task.completed } : task
      )
    );
  };

  const handleMealSaved = (mealData) => {
    // 식단 저장 후 오늘 식단 목록 새로고침
    // setTodayMeals((prev) => [mealData, ...prev]); 
    // 저장 후에는 전체 데이터를 다시 불러오는 것이 안전함 (영양 차트 업데이트 위해)
    // 간단히 추가만 할 경우 차트 데이터 포맷과 맞지 않을 수 있음.
    // 여기서는 일단 다시 로드하도록 트리거하거나, 형식을 맞춰서 추가.
    // mealData 구조 확인 필요. 일단 로드 함수 재호출이 깔끔함.
    // 하지만 currentDate 의존성 때문에 재호출하려면 별도 함수로 분리 필요.
    // 여기서는 간단히 리로드 대신 새로고침 효과를 위해 상태 업데이트
    
    // mealData가 API 응답(단일 식단 객체)이라고 가정
    if(mealData && mealData.meal) {
        setTodayMeals((prev) => [...prev, mealData.meal]);
    } else if (mealData) {
        setTodayMeals((prev) => [...prev, mealData]);
    }

    // 해당 시간의 식사 체크리스트 완료 처리
    const mealType = mealData?.meal_type || mealData?.meal?.meal_type;
    const taskIndex = todayTasks.findIndex((task) => {
      if (mealType === 'breakfast' && task.title.includes('아침')) return true;
      if (mealType === 'lunch' && task.title.includes('점심')) return true;
      if (mealType === 'dinner' && task.title.includes('저녁')) return true;
      return false;
    });
    if (taskIndex >= 0) {
      toggleTaskComplete(todayTasks[taskIndex].id);
    }
  };

  const getTaskIcon = (type) => {
    const icons = {
      meal: '🍽️',
      medication: '💊',
      exercise: '🏃',
      meditation: '🧘',
      checkup: '🏥',
    };
    return icons[type] || '📌';
  };

  const formatDate = () => {
    const isToday =
      currentDate.toDateString() === new Date().toDateString();

    if (viewMode === 'day') {
      const options = { year: 'numeric', month: 'long', day: 'numeric', weekday: 'short' };
      return (
        <div className="date-display">
          <div className="date-main">{isToday ? '오늘' : currentDate.toLocaleDateString('ko-KR', options)}</div>
          <div className="date-numeric">{currentDate.toLocaleDateString('ko-KR')}</div>
        </div>
      );
    }
    // 다른 뷰 모드 처리...
    return currentDate.toLocaleDateString('ko-KR');
  };

  const completedCount = todayTasks.filter((t) => t.completed).length;
  const progressPercentage = (completedCount / todayTasks.length) * 100;

  return (
    <div
      className="dashboard-page"
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
    >
      <div className="dashboard-header" onClick={goToToday}>
        <div className="app-title">애고 (ego)</div>
        <div className="user-greeting">안녕하세요, {user?.full_name || '사용자'}님</div>
      </div>

      <div className="timeline-container">
        <button className="nav-button prev" onClick={() => navigateDate(-1)}>
          ←
        </button>

        <div className="date-section">
          {formatDate()}
          <div className="view-mode-selector">
            <button
              className={viewMode === 'day' ? 'active' : ''}
              onClick={() => setViewMode('day')}
            >
              일
            </button>
            <button
              className={viewMode === 'week' ? 'active' : ''}
              onClick={() => setViewMode('week')}
            >
              주
            </button>
            <button
              className={viewMode === 'month' ? 'active' : ''}
              onClick={() => setViewMode('month')}
            >
              월
            </button>
            <button
              className={viewMode === 'year' ? 'active' : ''}
              onClick={() => setViewMode('year')}
            >
              년
            </button>
          </div>
        </div>

        <button className="nav-button next" onClick={() => navigateDate(1)}>
          →
        </button>
      </div>

      <div className="progress-section">
        <div className="progress-label">
          오늘의 건강 관리 {completedCount}/{todayTasks.length}
        </div>
        <div className="progress-bar">
          <div
            className="progress-fill"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
      </div>

      {/* 건강 종합 현황 위젯 */}
      <HealthOverviewWidget />

      {/* 영양 분석 차트 */}
      <NutritionChart meals={todayMeals} />

      {/* 감정 분석 차트 */}
      <MoodChart records={moodRecords} />

      {/* 상시 음성 모니터링 */}
      <ContinuousVoiceMonitor />

      {/* 음성 체크인 */}
      <VoiceCheckIn />

      <div className="tasks-section">
        <h3 className="section-title">오늘의 체크리스트</h3>
        <div className="tasks-list">
          {todayTasks.map((task) => (
            <div
              key={task.id}
              className={`task-card ${task.completed ? 'completed' : ''}`}
              onClick={() => toggleTaskComplete(task.id)}
            >
              <div className="task-icon">{getTaskIcon(task.type)}</div>
              <div className="task-content">
                <div className="task-title">{task.title}</div>
                <div className="task-time">{task.time}</div>
              </div>
              <div className="task-checkbox">
                {task.completed ? '✓' : '○'}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="quick-actions">
        <button
          className="action-btn primary"
          onClick={() => setShowMealCapture(true)}
        >
          <span>📸</span>
          <span>식단 기록</span>
        </button>
        <button className="action-btn">
          <span>💊</span>
          <span>복약</span>
        </button>
        <button className="action-btn">
          <span>😊</span>
          <span>기분</span>
        </button>
        <button className="action-btn">
          <span>🏃</span>
          <span>운동</span>
        </button>
      </div>

      {/* 오늘의 식단 기록 표시 */}
      {todayMeals.length > 0 && (
        <div className="todays-meals">
          <h3 className="section-title">오늘의 식단</h3>
          <div className="meals-list">
            {todayMeals.map((meal, index) => (
              <div key={index} className="meal-card">
                <img src={meal.image_url} alt="식단" />
                <div className="meal-info">
                  <div className="meal-match">
                    일치도: {meal.match_percentage?.toFixed(0)}%
                  </div>
                  <div className="meal-calories">
                    {meal.calories?.toFixed(0)} kcal
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {showMealCapture && (
        <MealCapture
          onClose={() => setShowMealCapture(false)}
          onMealSaved={handleMealSaved}
        />
      )}

      <FloatingHealthButton />
    </div>
  );
};

export default DashboardPage;
