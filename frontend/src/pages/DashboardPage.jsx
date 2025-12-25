import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import './DashboardPage.css'; // 기존 CSS 대신 Tailwind 사용하지만, 호환성을 위해 유지

const DashboardPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [healthScore, setHealthScore] = useState(78); // 예시 데이터

  // 안전장치: 사용자 정보가 없으면 로딩 중 표시
  if (!user) {
    return <div className="p-10 text-center text-gray-500">사용자 정보를 불러오는 중입니다...</div>;
  }

  // 차트 예시 데이터
  const data = [
    { name: '월', score: 65 },
    { name: '화', score: 70 },
    { name: '수', score: 68 },
    { name: '목', score: 75 },
    { name: '금', score: 82 },
    { name: '토', score: 78 },
    { name: '일', score: 85 },
  ];

  const currentDate = new Date().toLocaleDateString('ko-KR', { 
    month: 'long', 
    day: 'numeric', 
    weekday: 'long' 
  });

  return (
    <div className="p-6 max-w-[1400px] mx-auto fade-in">
      {/* 1. 상단 헤더 영역 */}
      <header className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <p className="text-gray-500 text-sm font-medium mb-1">{currentDate}</p>
          <h1 className="text-3xl font-bold text-gray-900">
            안녕하세요, <span className="text-primary">{user.username}</span>님 👋
          </h1>
          <p className="text-gray-600 mt-2">오늘도 활기찬 하루를 시작해보세요!</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={() => navigate('/health-sync')}
            className="px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors shadow-sm flex items-center gap-2"
          >
            <span className="text-green-500">●</span> 기기 연동됨
          </button>
          <button 
            onClick={() => navigate('/chat')}
            className="px-6 py-2 bg-primary text-white rounded-xl font-bold shadow-lg shadow-teal-500/30 hover:bg-primary-dark transition-all transform hover:-translate-y-1"
          >
            AI 상담 시작하기
          </button>
        </div>
      </header>

      {/* 2. Bento Grid 레이아웃 */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6 auto-rows-[minmax(180px,auto)]">
        
        {/* Card 1: 종합 건강 점수 (Large) */}
        <div className="col-span-1 md:col-span-2 lg:col-span-1 bg-white rounded-[24px] p-6 shadow-sm border border-slate-100 flex flex-col justify-between relative overflow-hidden group hover:border-primary transition-colors">
          <div className="absolute top-0 right-0 w-32 h-32 bg-teal-50 rounded-bl-full -mr-8 -mt-8 transition-transform group-hover:scale-110"></div>
          <div>
            <h3 className="text-gray-500 font-medium text-sm">오늘의 건강 점수</h3>
            <div className="mt-4 flex items-end gap-2">
              <span className="text-6xl font-black text-gray-900 tracking-tighter">{healthScore}</span>
              <span className="text-xl text-gray-400 font-medium mb-2">/ 100</span>
            </div>
            <p className="text-sm text-green-600 font-medium mt-2 flex items-center gap-1">
              <span>▲</span> 지난주보다 3점 상승
            </p>
          </div>
          <div className="w-full bg-gray-100 h-2 rounded-full mt-4 overflow-hidden">
            <div className="bg-primary h-full rounded-full" style={{ width: `${healthScore}%` }}></div>
          </div>
        </div>

        {/* Card 2: 주간 활동 차트 (Wide) */}
        <div className="col-span-1 md:col-span-2 lg:col-span-2 bg-white rounded-[24px] p-6 shadow-sm border border-slate-100 hover:border-primary transition-colors">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-gray-900 font-bold text-lg">주간 컨디션 흐름</h3>
            <select className="bg-gray-50 border-none text-sm text-gray-500 rounded-lg p-2 outline-none">
              <option>이번 주</option>
              <option>지난 주</option>
            </select>
          </div>
          <div className="h-[140px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94A3B8', fontSize: 12}} />
                <YAxis hide />
                <Tooltip 
                  contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)'}}
                  cursor={{stroke: '#0D9488', strokeWidth: 1}}
                />
                <Line 
                  type="monotone" 
                  dataKey="score" 
                  stroke="#0D9488" 
                  strokeWidth={3} 
                  dot={{r: 4, fill: '#0D9488', strokeWidth: 2, stroke: '#fff'}}
                  activeDot={{r: 6}} 
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Card 3: 바로가기 (Small) */}
        <div className="col-span-1 bg-gradient-to-br from-gray-900 to-gray-800 rounded-[24px] p-6 text-white shadow-lg flex flex-col justify-between relative overflow-hidden cursor-pointer hover:shadow-xl transition-all"
             onClick={() => navigate('/mood')}>
          <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-bl-full -mr-4 -mt-4"></div>
          <div className="text-3xl">🎭</div>
          <div>
            <h3 className="font-bold text-lg mb-1">감정 일기</h3>
            <p className="text-gray-400 text-sm">오늘 기분은 어떠신가요?</p>
          </div>
        </div>

        {/* Card 4: 오늘의 복약 (Medium) */}
        <div className="col-span-1 md:col-span-2 lg:col-span-2 bg-teal-50 rounded-[24px] p-6 border border-teal-100 flex items-center justify-between">
          <div className="flex gap-4 items-center">
            <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-2xl shadow-sm">
              💊
            </div>
            <div>
              <h3 className="font-bold text-gray-900">저녁 약 복용 시간입니다</h3>
              <p className="text-teal-700 text-sm mt-1">식후 30분 • 비타민 C 외 2개</p>
            </div>
          </div>
          <button 
            onClick={() => navigate('/medication')}
            className="px-4 py-2 bg-white text-teal-700 font-bold rounded-lg text-sm hover:bg-teal-100 transition-colors"
          >
            복용 확인
          </button>
        </div>

        {/* Card 5: AI 인사이트 (Small) */}
        <div className="col-span-1 lg:col-span-2 bg-lime-50 rounded-[24px] p-6 border border-lime-100 flex gap-4">
          <div className="text-3xl">💡</div>
          <div>
            <h3 className="font-bold text-gray-900 mb-1">AI 건강 팁</h3>
            <p className="text-gray-700 text-sm leading-relaxed">
              "어제보다 걸음 수가 부족해요. 저녁 식사 후 <strong>20분 가벼운 산책</strong>이 
              혈당 조절과 숙면에 큰 도움이 됩니다. 함께 걸을까요?"
            </p>
          </div>
        </div>

      </div>

      {/* 3. 최근 활동 목록 */}
      <section className="mt-8">
        <h2 className="text-xl font-bold text-gray-900 mb-4">최근 활동 내역</h2>
        <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-sm">
          {[
            { icon: '🌙', title: '수면 기록', desc: '7시간 12분 수면 (좋음)', time: '오늘 오전 07:30' },
            { icon: '💊', title: '점심 약 복용', desc: '혈압약 복용 완료', time: '오늘 오후 01:15' },
            { icon: '💬', title: 'AI 상담', desc: '두통 증상 상담', time: '어제 오후 09:40' },
          ].map((item, index) => (
            <div key={index} className="flex items-center gap-4 p-4 border-b border-gray-50 last:border-none hover:bg-slate-50 transition-colors cursor-pointer">
              <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-lg">
                {item.icon}
              </div>
              <div className="flex-1">
                <h4 className="font-bold text-gray-900 text-sm">{item.title}</h4>
                <p className="text-gray-500 text-sm">{item.desc}</p>
              </div>
              <span className="text-xs text-gray-400">{item.time}</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default DashboardPage;