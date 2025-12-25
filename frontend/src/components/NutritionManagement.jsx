import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import './NutritionManagement.css';

const NutritionManagement = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('today'); // today, diary, plan, recipes
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [dailyIntake, setDailyIntake] = useState(null);
  const [nutritionGoals, setNutritionGoals] = useState(null);
  const [foodDiary, setFoodDiary] = useState([]);
  const [nutritionPlan, setNutritionPlan] = useState(null);
  const [recommendedRecipes, setRecommendedRecipes] = useState([]);
  const [showAddMealModal, setShowAddMealModal] = useState(false);

  useEffect(() => {
    fetchDailyIntake(selectedDate);
    fetchNutritionGoals();
    fetchFoodDiary(selectedDate);
    fetchNutritionPlan();
    fetchRecommendedRecipes();
  }, [selectedDate]);

  const fetchDailyIntake = async (date) => {
    // TODO: API 연동
    const mockIntake = {
      date: date,
      total_calories: 1650,
      total_protein: 75,
      total_carbs: 180,
      total_fat: 55,
      total_fiber: 22,
      total_sugar: 35,
      water_intake: 1800,
    };
    setDailyIntake(mockIntake);
  };

  const fetchNutritionGoals = async () => {
    // TODO: API 연동
    const mockGoals = {
      daily_calories: 2000,
      daily_protein: 80,
      daily_carbs: 250,
      daily_fat: 70,
      daily_fiber: 25,
      daily_sugar: 50,
      daily_water: 2000,
    };
    setNutritionGoals(mockGoals);
  };

  const fetchFoodDiary = async (date) => {
    // TODO: API 연동
    const mockDiary = [
      {
        id: 1,
        meal_time: 'breakfast',
        time: '08:30',
        food_items: [
          { name: '계란 프라이', amount: '2개', calories: 180, protein: 12, carbs: 2, fat: 14 },
          { name: '현미밥', amount: '1공기', calories: 330, protein: 7, carbs: 70, fat: 3 },
          { name: '김치', amount: '50g', calories: 15, protein: 1, carbs: 3, fat: 0 },
        ],
      },
      {
        id: 2,
        meal_time: 'lunch',
        time: '12:30',
        food_items: [
          { name: '닭가슴살 샐러드', amount: '1인분', calories: 350, protein: 35, carbs: 25, fat: 12 },
          { name: '고구마', amount: '중간 1개', calories: 130, protein: 2, carbs: 30, fat: 0 },
        ],
      },
      {
        id: 3,
        meal_time: 'snack',
        time: '15:00',
        food_items: [
          { name: '사과', amount: '1개', calories: 95, protein: 0, carbs: 25, fat: 0 },
          { name: '아몬드', amount: '10알', calories: 70, protein: 3, carbs: 2, fat: 6 },
        ],
      },
      {
        id: 4,
        meal_time: 'dinner',
        time: '18:30',
        food_items: [
          { name: '연어 구이', amount: '100g', calories: 206, protein: 20, carbs: 0, fat: 13 },
          { name: '브로콜리', amount: '1컵', calories: 55, protein: 4, carbs: 11, fat: 0.5 },
          { name: '현미밥', amount: '1공기', calories: 330, protein: 7, carbs: 70, fat: 3 },
        ],
      },
    ];
    setFoodDiary(mockDiary);
  };

  const fetchNutritionPlan = async () => {
    // TODO: API 연동
    const mockPlan = {
      plan_name: 'AI 맞춤 건강 식단',
      start_date: '2024-01-01',
      duration_days: 30,
      dietary_preferences: ['고단백', '저탄수화물'],
      health_goals: ['체중 감량', '근육 증가'],
      ai_generated: true,
      weekly_guidelines: [
        '매일 단백질 80g 이상 섭취',
        '탄수화물은 전체 칼로리의 40% 이하',
        '건강한 지방(견과류, 생선) 섭취',
        '가공식품 최소화',
        '하루 물 2L 이상',
      ],
    };
    setNutritionPlan(mockPlan);
  };

  const fetchRecommendedRecipes = async () => {
    // TODO: API 연동
    const mockRecipes = [
      {
        id: 1,
        recipe_name: '퀴노아 닭가슴살 샐러드',
        meal_type: 'lunch',
        prep_time: 20,
        calories: 420,
        protein: 38,
        image_url: null,
        ingredients: ['퀴노아 100g', '닭가슴살 150g', '방울토마토 10개', '아보카도 1/2개', '올리브오일 1T'],
        instructions: [
          '퀴노아를 15분간 삶아 식힙니다',
          '닭가슴살을 구워 한입 크기로 자릅니다',
          '방울토마토와 아보카도를 준비합니다',
          '모든 재료를 섞고 올리브오일 드레싱을 뿌립니다',
        ],
        health_benefits: '고단백 저칼로리 식단에 완벽한 한 끼',
      },
      {
        id: 2,
        recipe_name: '연어 아보카도 덮밥',
        meal_type: 'dinner',
        prep_time: 15,
        calories: 580,
        protein: 35,
        image_url: null,
        ingredients: ['현미밥 1공기', '연어회 100g', '아보카도 1개', '김 1장', '간장 소스'],
        instructions: [
          '현미밥을 그릇에 담습니다',
          '연어회를 한입 크기로 자릅니다',
          '아보카도를 슬라이스합니다',
          '밥 위에 재료를 올리고 간장 소스를 뿌립니다',
        ],
        health_benefits: '오메가-3가 풍부한 건강한 저녁 식사',
      },
      {
        id: 3,
        recipe_name: '그릭 요거트 베리 볼',
        meal_type: 'breakfast',
        prep_time: 5,
        calories: 280,
        protein: 20,
        image_url: null,
        ingredients: ['그릭 요거트 200g', '블루베리 50g', '딸기 5개', '견과류 20g', '꿀 1T'],
        instructions: [
          '그릭 요거트를 볼에 담습니다',
          '블루베리와 딸기를 씻어 올립니다',
          '견과류를 뿌립니다',
          '꿀을 살짝 뿌려 완성합니다',
        ],
        health_benefits: '고단백 저칼로리 아침 식사',
      },
    ];
    setRecommendedRecipes(mockRecipes);
  };

  const getMealTimeLabel = (mealTime) => {
    const labels = {
      breakfast: '아침',
      lunch: '점심',
      dinner: '저녁',
      snack: '간식',
    };
    return labels[mealTime] || mealTime;
  };

  const getMealTimeIcon = (mealTime) => {
    const icons = {
      breakfast: '🌅',
      lunch: '☀️',
      dinner: '🌆',
      snack: '🍎',
    };
    return icons[mealTime] || '🍽️';
  };

  const calculatePercentage = (current, goal) => {
    if (!goal) return 0;
    return Math.min((current / goal) * 100, 100);
  };

  const getProgressColor = (percentage) => {
    if (percentage < 70) return '#fbbf24';
    if (percentage <= 100) return '#4ade80';
    return '#f87171';
  };

  return (
    <div className="nutrition-management">
      <div className="nutrition-header">
        <h2>🥗 영양 관리</h2>
        <div className="date-selector">
          <button onClick={() => {
            const date = new Date(selectedDate);
            date.setDate(date.getDate() - 1);
            setSelectedDate(date.toISOString().split('T')[0]);
          }}>←</button>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
          />
          <button onClick={() => {
            const date = new Date(selectedDate);
            date.setDate(date.getDate() + 1);
            setSelectedDate(date.toISOString().split('T')[0]);
          }}>→</button>
          <button onClick={() => setSelectedDate(new Date().toISOString().split('T')[0])}>
            오늘
          </button>
        </div>
      </div>

      <div className="tabs">
        <button
          className={activeTab === 'today' ? 'active' : ''}
          onClick={() => setActiveTab('today')}
        >
          오늘의 영양
        </button>
        <button
          className={activeTab === 'diary' ? 'active' : ''}
          onClick={() => setActiveTab('diary')}
        >
          식단 일기
        </button>
        <button
          className={activeTab === 'plan' ? 'active' : ''}
          onClick={() => setActiveTab('plan')}
        >
          영양 계획
        </button>
        <button
          className={activeTab === 'recipes' ? 'active' : ''}
          onClick={() => setActiveTab('recipes')}
        >
          추천 레시피
        </button>
      </div>

      <div className="tab-content">
        {/* 오늘의 영양 탭 */}
        {activeTab === 'today' && dailyIntake && nutritionGoals && (
          <div className="today-tab">
            <div className="nutrition-overview">
              <div className="calories-card">
                <h3>칼로리</h3>
                <div className="calories-ring">
                  <svg width="200" height="200">
                    <circle
                      cx="100"
                      cy="100"
                      r="80"
                      fill="none"
                      stroke="rgba(255,255,255,0.2)"
                      strokeWidth="15"
                    />
                    <circle
                      cx="100"
                      cy="100"
                      r="80"
                      fill="none"
                      stroke={getProgressColor(calculatePercentage(dailyIntake.total_calories, nutritionGoals.daily_calories))}
                      strokeWidth="15"
                      strokeDasharray={`${calculatePercentage(dailyIntake.total_calories, nutritionGoals.daily_calories) * 5.024} 502.4`}
                      strokeLinecap="round"
                      transform="rotate(-90 100 100)"
                    />
                    <text x="100" y="90" textAnchor="middle" fontSize="36" fill="white" fontWeight="700">
                      {dailyIntake.total_calories}
                    </text>
                    <text x="100" y="115" textAnchor="middle" fontSize="16" fill="white" opacity="0.8">
                      / {nutritionGoals.daily_calories}
                    </text>
                    <text x="100" y="135" textAnchor="middle" fontSize="14" fill="white" opacity="0.7">
                      kcal
                    </text>
                  </svg>
                </div>
              </div>

              <div className="macros-cards">
                <div className="macro-card">
                  <div className="macro-icon" style={{ color: '#3b82f6' }}>🥩</div>
                  <div className="macro-label">단백질</div>
                  <div className="macro-value">{dailyIntake.total_protein}g</div>
                  <div className="macro-goal">/ {nutritionGoals.daily_protein}g</div>
                  <div className="macro-bar">
                    <div
                      className="macro-fill"
                      style={{
                        width: `${calculatePercentage(dailyIntake.total_protein, nutritionGoals.daily_protein)}%`,
                        backgroundColor: '#3b82f6'
                      }}
                    />
                  </div>
                </div>

                <div className="macro-card">
                  <div className="macro-icon" style={{ color: '#f97316' }}>🍞</div>
                  <div className="macro-label">탄수화물</div>
                  <div className="macro-value">{dailyIntake.total_carbs}g</div>
                  <div className="macro-goal">/ {nutritionGoals.daily_carbs}g</div>
                  <div className="macro-bar">
                    <div
                      className="macro-fill"
                      style={{
                        width: `${calculatePercentage(dailyIntake.total_carbs, nutritionGoals.daily_carbs)}%`,
                        backgroundColor: '#f97316'
                      }}
                    />
                  </div>
                </div>

                <div className="macro-card">
                  <div className="macro-icon" style={{ color: '#fbbf24' }}>🥑</div>
                  <div className="macro-label">지방</div>
                  <div className="macro-value">{dailyIntake.total_fat}g</div>
                  <div className="macro-goal">/ {nutritionGoals.daily_fat}g</div>
                  <div className="macro-bar">
                    <div
                      className="macro-fill"
                      style={{
                        width: `${calculatePercentage(dailyIntake.total_fat, nutritionGoals.daily_fat)}%`,
                        backgroundColor: '#fbbf24'
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="additional-nutrients">
              <div className="nutrient-item">
                <span className="nutrient-icon">🌾</span>
                <span className="nutrient-label">식이섬유</span>
                <span className="nutrient-value">{dailyIntake.total_fiber}g / {nutritionGoals.daily_fiber}g</span>
                <div className="nutrient-bar">
                  <div
                    className="nutrient-fill"
                    style={{ width: `${calculatePercentage(dailyIntake.total_fiber, nutritionGoals.daily_fiber)}%` }}
                  />
                </div>
              </div>

              <div className="nutrient-item">
                <span className="nutrient-icon">🍬</span>
                <span className="nutrient-label">당류</span>
                <span className="nutrient-value">{dailyIntake.total_sugar}g / {nutritionGoals.daily_sugar}g</span>
                <div className="nutrient-bar">
                  <div
                    className="nutrient-fill"
                    style={{
                      width: `${calculatePercentage(dailyIntake.total_sugar, nutritionGoals.daily_sugar)}%`,
                      backgroundColor: dailyIntake.total_sugar > nutritionGoals.daily_sugar ? '#f87171' : '#4ade80'
                    }}
                  />
                </div>
              </div>

              <div className="nutrient-item">
                <span className="nutrient-icon">💧</span>
                <span className="nutrient-label">수분</span>
                <span className="nutrient-value">{dailyIntake.water_intake}ml / {nutritionGoals.daily_water}ml</span>
                <div className="nutrient-bar">
                  <div
                    className="nutrient-fill"
                    style={{
                      width: `${calculatePercentage(dailyIntake.water_intake, nutritionGoals.daily_water)}%`,
                      backgroundColor: '#3b82f6'
                    }}
                  />
                </div>
              </div>
            </div>

            <div className="ai-nutrition-advice">
              <h3>🤖 AI 영양 조언</h3>
              <div className="advice-card">
                <p>오늘 식단 분석 결과:</p>
                <ul>
                  <li>칼로리 섭취가 목표 대비 82%로 적절합니다</li>
                  <li>단백질 섭취가 우수합니다 (94%)</li>
                  <li>탄수화물이 약간 부족합니다. 저녁에 복합탄수화물을 추가하세요</li>
                  <li>수분 섭취를 늘려주세요 (현재 90%)</li>
                  <li>전반적으로 균형잡힌 식단입니다!</li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* 식단 일기 탭 */}
        {activeTab === 'diary' && (
          <div className="diary-tab">
            <button className="add-meal-btn" onClick={() => setShowAddMealModal(true)}>
              + 식사 기록 추가
            </button>

            <div className="meals-timeline">
              {foodDiary.map(meal => (
                <div key={meal.id} className="meal-entry">
                  <div className="meal-header">
                    <div className="meal-time-info">
                      <span className="meal-icon">{getMealTimeIcon(meal.meal_time)}</span>
                      <span className="meal-label">{getMealTimeLabel(meal.meal_time)}</span>
                      <span className="meal-time">{meal.time}</span>
                    </div>
                    <button className="edit-meal-btn">✏️</button>
                  </div>
                  <div className="food-items-list">
                    {meal.food_items.map((food, idx) => (
                      <div key={idx} className="food-item">
                        <div className="food-name">{food.name}</div>
                        <div className="food-amount">{food.amount}</div>
                        <div className="food-nutrients">
                          <span>{food.calories}kcal</span>
                          <span>P:{food.protein}g</span>
                          <span>C:{food.carbs}g</span>
                          <span>F:{food.fat}g</span>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="meal-summary">
                    총 칼로리: {meal.food_items.reduce((sum, food) => sum + food.calories, 0)}kcal
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 영양 계획 탭 */}
        {activeTab === 'plan' && nutritionPlan && (
          <div className="plan-tab">
            <div className="plan-header">
              <h3>{nutritionPlan.plan_name}</h3>
              <button className="generate-plan-btn">🤖 AI 계획 재생성</button>
            </div>

            <div className="plan-info">
              <div className="info-item">
                <span className="label">시작일:</span>
                <span className="value">{nutritionPlan.start_date}</span>
              </div>
              <div className="info-item">
                <span className="label">기간:</span>
                <span className="value">{nutritionPlan.duration_days}일</span>
              </div>
              <div className="info-item">
                <span className="label">식단 선호:</span>
                <span className="value">{nutritionPlan.dietary_preferences.join(', ')}</span>
              </div>
              <div className="info-item">
                <span className="label">건강 목표:</span>
                <span className="value">{nutritionPlan.health_goals.join(', ')}</span>
              </div>
            </div>

            <div className="plan-guidelines">
              <h4>주간 가이드라인</h4>
              <ul>
                {nutritionPlan.weekly_guidelines.map((guideline, idx) => (
                  <li key={idx}>{guideline}</li>
                ))}
              </ul>
            </div>

            {nutritionPlan.ai_generated && (
              <div className="ai-badge">
                🤖 AI가 당신의 건강 목표에 맞춰 생성한 맞춤 영양 계획입니다
              </div>
            )}
          </div>
        )}

        {/* 추천 레시피 탭 */}
        {activeTab === 'recipes' && (
          <div className="recipes-tab">
            <div className="recipes-grid">
              {recommendedRecipes.map(recipe => (
                <div key={recipe.id} className="recipe-card">
                  <div className="recipe-header">
                    <h4>{recipe.recipe_name}</h4>
                    <span className="meal-type-badge">{getMealTimeLabel(recipe.meal_type)}</span>
                  </div>
                  <div className="recipe-stats">
                    <span>⏱️ {recipe.prep_time}분</span>
                    <span>🔥 {recipe.calories}kcal</span>
                    <span>🥩 {recipe.protein}g 단백질</span>
                  </div>
                  <div className="recipe-benefit">{recipe.health_benefits}</div>
                  <div className="recipe-ingredients">
                    <h5>재료:</h5>
                    <ul>
                      {recipe.ingredients.map((ingredient, idx) => (
                        <li key={idx}>{ingredient}</li>
                      ))}
                    </ul>
                  </div>
                  <div className="recipe-instructions">
                    <h5>조리법:</h5>
                    <ol>
                      {recipe.instructions.map((instruction, idx) => (
                        <li key={idx}>{instruction}</li>
                      ))}
                    </ol>
                  </div>
                  <button className="add-to-plan-btn">식단에 추가</button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default NutritionManagement;
