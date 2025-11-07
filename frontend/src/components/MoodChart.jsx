import React, { useState, useEffect } from 'react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Area,
  AreaChart
} from 'recharts';
import './MoodChart.css';

const MoodChart = ({ records }) => {
  const [chartType, setChartType] = useState('line'); // 'line', 'area', 'bar', 'pie'
  const [timeRange, setTimeRange] = useState(7); // 7, 14, 30 days

  // 감정별 색상 매핑
  const moodColors = {
    very_happy: '#FFD700',
    happy: '#FFA500',
    excited: '#FF69B4',
    neutral: '#A9A9A9',
    tired: '#87CEEB',
    sad: '#4682B4',
    very_sad: '#000080',
    angry: '#DC143C',
    anxious: '#9370DB',
    stressed: '#8B4513',
  };

  // 감정별 점수 (시각화용)
  const moodScores = {
    very_sad: 1,
    sad: 3,
    angry: 2,
    anxious: 3,
    stressed: 3,
    tired: 4,
    neutral: 5,
    happy: 7,
    very_happy: 9,
    excited: 8,
  };

  // 감정 이름 한글 변환
  const moodLabels = {
    very_happy: '매우 행복',
    happy: '행복',
    excited: '신남',
    neutral: '보통',
    tired: '피곤',
    sad: '슬픔',
    very_sad: '매우 슬픔',
    angry: '화남',
    anxious: '불안',
    stressed: '스트레스',
  };

  // 시간 범위로 필터링된 기록
  const getFilteredRecords = () => {
    const now = new Date();
    const cutoffDate = new Date(now.getTime() - timeRange * 24 * 60 * 60 * 1000);

    return records
      .filter(record => new Date(record.recorded_at) >= cutoffDate)
      .sort((a, b) => new Date(a.recorded_at) - new Date(b.recorded_at));
  };

  // 라인/에어리어 차트 데이터 준비
  const prepareTimeSeriesData = () => {
    const filteredRecords = getFilteredRecords();

    return filteredRecords.map(record => {
      const date = new Date(record.recorded_at);
      const baseScore = moodScores[record.mood_level] || 5;
      const adjustedScore = baseScore * (record.mood_intensity / 10);

      return {
        date: `${date.getMonth() + 1}/${date.getDate()}`,
        fullDate: date.toLocaleDateString('ko-KR'),
        score: adjustedScore,
        mood: moodLabels[record.mood_level] || record.mood_level,
        intensity: record.mood_intensity,
        color: moodColors[record.mood_level] || '#A9A9A9',
      };
    });
  };

  // 바 차트 데이터 (일별 평균)
  const prepareDailyAverageData = () => {
    const filteredRecords = getFilteredRecords();
    const dailyData = {};

    filteredRecords.forEach(record => {
      const date = new Date(record.recorded_at);
      const dateKey = `${date.getMonth() + 1}/${date.getDate()}`;

      if (!dailyData[dateKey]) {
        dailyData[dateKey] = { scores: [], count: 0 };
      }

      const baseScore = moodScores[record.mood_level] || 5;
      const adjustedScore = baseScore * (record.mood_intensity / 10);
      dailyData[dateKey].scores.push(adjustedScore);
      dailyData[dateKey].count++;
    });

    return Object.entries(dailyData).map(([date, data]) => ({
      date,
      avgScore: data.scores.reduce((a, b) => a + b, 0) / data.count,
      count: data.count,
    }));
  };

  // 파이 차트 데이터 (감정 분포)
  const prepareMoodDistribution = () => {
    const filteredRecords = getFilteredRecords();
    const distribution = {};

    filteredRecords.forEach(record => {
      const mood = record.mood_level;
      distribution[mood] = (distribution[mood] || 0) + 1;
    });

    return Object.entries(distribution).map(([mood, count]) => ({
      name: moodLabels[mood] || mood,
      value: count,
      color: moodColors[mood] || '#A9A9A9',
    }));
  };

  // 커스텀 툴팁
  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;

      return (
        <div className="mood-chart-tooltip">
          <p className="tooltip-date">{data.fullDate || data.date}</p>
          {data.mood && <p className="tooltip-mood">감정: {data.mood}</p>}
          {data.intensity && <p className="tooltip-intensity">강도: {data.intensity}/10</p>}
          {data.score && <p className="tooltip-score">점수: {data.score.toFixed(1)}/10</p>}
          {data.avgScore && <p className="tooltip-avg">평균: {data.avgScore.toFixed(1)}/10</p>}
          {data.count && data.count > 1 && <p className="tooltip-count">기록 수: {data.count}개</p>}
        </div>
      );
    }
    return null;
  };

  // 차트 데이터
  const timeSeriesData = prepareTimeSeriesData();
  const dailyAverageData = prepareDailyAverageData();
  const moodDistributionData = prepareMoodDistribution();

  if (records.length === 0) {
    return (
      <div className="mood-chart-empty">
        <span className="empty-chart-icon">📊</span>
        <p>차트를 표시할 감정 기록이 없습니다</p>
      </div>
    );
  }

  return (
    <div className="mood-chart-container">
      <div className="mood-chart-header">
        <h2 className="mood-chart-title">📈 감정 추이 분석</h2>
        <div className="mood-chart-controls">
          {/* 차트 타입 선택 */}
          <div className="chart-type-selector">
            <button
              className={chartType === 'line' ? 'active' : ''}
              onClick={() => setChartType('line')}
              title="라인 차트"
            >
              📈
            </button>
            <button
              className={chartType === 'area' ? 'active' : ''}
              onClick={() => setChartType('area')}
              title="에어리어 차트"
            >
              🏔️
            </button>
            <button
              className={chartType === 'bar' ? 'active' : ''}
              onClick={() => setChartType('bar')}
              title="바 차트"
            >
              📊
            </button>
            <button
              className={chartType === 'pie' ? 'active' : ''}
              onClick={() => setChartType('pie')}
              title="파이 차트"
            >
              🥧
            </button>
          </div>

          {/* 시간 범위 선택 */}
          <div className="time-range-selector">
            <button
              className={timeRange === 7 ? 'active' : ''}
              onClick={() => setTimeRange(7)}
            >
              7일
            </button>
            <button
              className={timeRange === 14 ? 'active' : ''}
              onClick={() => setTimeRange(14)}
            >
              14일
            </button>
            <button
              className={timeRange === 30 ? 'active' : ''}
              onClick={() => setTimeRange(30)}
            >
              30일
            </button>
          </div>
        </div>
      </div>

      <div className="mood-chart-content">
        {/* 라인 차트 */}
        {chartType === 'line' && (
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={timeSeriesData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E0E0E0" />
              <XAxis
                dataKey="date"
                stroke="#666"
                style={{ fontSize: '0.9rem' }}
              />
              <YAxis
                domain={[0, 10]}
                stroke="#666"
                style={{ fontSize: '0.9rem' }}
                label={{ value: '감정 점수', angle: -90, position: 'insideLeft' }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Line
                type="monotone"
                dataKey="score"
                stroke="#6A89FF"
                strokeWidth={3}
                dot={{ fill: '#6A89FF', r: 6 }}
                activeDot={{ r: 8 }}
                name="감정 점수"
              />
            </LineChart>
          </ResponsiveContainer>
        )}

        {/* 에어리어 차트 */}
        {chartType === 'area' && (
          <ResponsiveContainer width="100%" height={400}>
            <AreaChart data={timeSeriesData}>
              <defs>
                <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6A89FF" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#6A89FF" stopOpacity={0.1} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#E0E0E0" />
              <XAxis
                dataKey="date"
                stroke="#666"
                style={{ fontSize: '0.9rem' }}
              />
              <YAxis
                domain={[0, 10]}
                stroke="#666"
                style={{ fontSize: '0.9rem' }}
                label={{ value: '감정 점수', angle: -90, position: 'insideLeft' }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Area
                type="monotone"
                dataKey="score"
                stroke="#6A89FF"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorScore)"
                name="감정 점수"
              />
            </AreaChart>
          </ResponsiveContainer>
        )}

        {/* 바 차트 */}
        {chartType === 'bar' && (
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={dailyAverageData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E0E0E0" />
              <XAxis
                dataKey="date"
                stroke="#666"
                style={{ fontSize: '0.9rem' }}
              />
              <YAxis
                domain={[0, 10]}
                stroke="#666"
                style={{ fontSize: '0.9rem' }}
                label={{ value: '평균 점수', angle: -90, position: 'insideLeft' }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Bar
                dataKey="avgScore"
                fill="#6A89FF"
                radius={[8, 8, 0, 0]}
                name="일별 평균 점수"
              />
            </BarChart>
          </ResponsiveContainer>
        )}

        {/* 파이 차트 */}
        {chartType === 'pie' && (
          <ResponsiveContainer width="100%" height={400}>
            <PieChart>
              <Pie
                data={moodDistributionData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={120}
                fill="#8884d8"
                dataKey="value"
              >
                {moodDistributionData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* 차트 인사이트 */}
      <div className="mood-chart-insights">
        <div className="insight-card">
          <span className="insight-icon">💡</span>
          <div className="insight-content">
            <h4>분석 기간</h4>
            <p>최근 {timeRange}일간 {getFilteredRecords().length}개의 감정 기록</p>
          </div>
        </div>

        {timeSeriesData.length >= 2 && (
          <div className="insight-card">
            <span className="insight-icon">
              {timeSeriesData[timeSeriesData.length - 1].score > timeSeriesData[0].score ? '📈' : '📉'}
            </span>
            <div className="insight-content">
              <h4>감정 변화</h4>
              <p>
                {timeSeriesData[0].mood} → {timeSeriesData[timeSeriesData.length - 1].mood}
                {timeSeriesData[timeSeriesData.length - 1].score > timeSeriesData[0].score
                  ? ' (개선 중)'
                  : ' (주의 필요)'}
              </p>
            </div>
          </div>
        )}

        {moodDistributionData.length > 0 && (
          <div className="insight-card">
            <span className="insight-icon">⭐</span>
            <div className="insight-content">
              <h4>가장 많은 감정</h4>
              <p>
                {moodDistributionData.sort((a, b) => b.value - a.value)[0].name} (
                {moodDistributionData.sort((a, b) => b.value - a.value)[0].value}회)
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MoodChart;
