import React, { useMemo } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import './NutritionChart.css';

const NutritionChart = ({ meals }) => {
  // 영양소 데이터 계산
  const nutritionData = useMemo(() => {
    if (!meals || meals.length === 0) return null;

    const total = meals.reduce(
      (acc, meal) => ({
        carbs: acc.carbs + (meal.carbs || 0),
        protein: acc.protein + (meal.protein || 0),
        fat: acc.fat + (meal.fat || 0),
        calories: acc.calories + (meal.calories || 0),
      }),
      { carbs: 0, protein: 0, fat: 0, calories: 0 }
    );

    return total;
  }, [meals]);

  if (!nutritionData) {
    return (
      <div className="nutrition-chart-empty">
        <p>오늘의 식단을 기록하여 영양 분석을 확인하세요.</p>
      </div>
    );
  }

  const chartData = [
    { name: '탄수화물', value: nutritionData.carbs, color: '#FFBB28' }, // 노랑
    { name: '단백질', value: nutritionData.protein, color: '#FF8042' }, // 주황
    { name: '지방', value: nutritionData.fat, color: '#00C49F' },      // 초록
  ];

  const COLORS = chartData.map(item => item.color);
  const TARGET_CALORIES = 2000; // 목표 칼로리 (임시)
  const caloriesPercentage = Math.min((nutritionData.calories / TARGET_CALORIES) * 100, 100);

  return (
    <div className="nutrition-chart-container">
      <h3 className="section-title">오늘의 영양 섭취</h3>
      
      <div className="nutrition-summary">
        <div className="calories-display">
          <span className="current-calories">{nutritionData.calories.toFixed(0)}</span>
          <span className="target-calories"> / {TARGET_CALORIES} kcal</span>
        </div>
        <div className="calories-bar-bg">
          <div 
            className="calories-bar-fill" 
            style={{ width: `${caloriesPercentage}%`, backgroundColor: caloriesPercentage > 100 ? '#FF8042' : '#00C49F' }}
          ></div>
        </div>
      </div>

      <div className="macro-chart">
        <ResponsiveContainer width="100%" height={200}>
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={80}
              paddingAngle={5}
              dataKey="value"
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip formatter={(value) => `${value.toFixed(1)}g`} />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>

      <div className="macro-details">
        {chartData.map((item) => (
          <div key={item.name} className="macro-item">
            <span className="macro-label" style={{ color: item.color }}>● {item.name}</span>
            <span className="macro-value">{item.value.toFixed(1)}g</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default NutritionChart;
