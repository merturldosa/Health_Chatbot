/**
 * AI 건강 비서 "헬시" 서비스
 * - 시간대별 맞춤 인사
 * - 프로액티브 건강 팁
 * - 음성 안내 (TTS)
 * - 알림 및 리마인더
 */

class AIAssistantService {
  constructor() {
    this.name = '헬시';
    this.avatar = '🤖';
    this.ttsEnabled = false;
    this.currentUser = null;
  }

  /**
   * TTS 음성 안내
   */
  speak(text, options = {}) {
    if (!this.ttsEnabled || !('speechSynthesis' in window)) {
      console.log('TTS disabled or not supported');
      return;
    }

    // 기존 음성 중지
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);

    // 한국어 설정
    utterance.lang = 'ko-KR';
    utterance.rate = options.rate || 1.0; // 속도
    utterance.pitch = options.pitch || 1.2; // 음높이 (약간 높게 - 친근함)
    utterance.volume = options.volume || 0.8; // 볼륨

    // 한국어 음성 선택 (사용 가능한 경우)
    const voices = window.speechSynthesis.getVoices();
    const koreanVoice = voices.find(voice => voice.lang.startsWith('ko'));
    if (koreanVoice) {
      utterance.voice = koreanVoice;
    }

    window.speechSynthesis.speak(utterance);
  }

  /**
   * TTS 활성화/비활성화
   */
  setTTS(enabled) {
    this.ttsEnabled = enabled;
    localStorage.setItem('tts_enabled', enabled);
  }

  /**
   * TTS 상태 가져오기
   */
  getTTSEnabled() {
    const saved = localStorage.getItem('tts_enabled');
    return saved === 'true';
  }

  /**
   * 사용자 설정
   */
  setUser(user) {
    this.currentUser = user;
  }

  /**
   * 시간대별 인사말
   */
  getGreeting() {
    const hour = new Date().getHours();
    const userName = this.currentUser?.username || '회원';

    let greeting = '';
    let emoji = '';
    let tip = '';

    if (hour >= 5 && hour < 12) {
      greeting = `좋은 아침이에요, ${userName}님!`;
      emoji = '🌅';
      tip = '아침 물 한 잔으로 하루를 시작해보세요!';
    } else if (hour >= 12 && hour < 18) {
      greeting = `안녕하세요, ${userName}님!`;
      emoji = '☀️';
      tip = '오후에는 스트레칭으로 몸을 풀어주세요!';
    } else if (hour >= 18 && hour < 22) {
      greeting = `좋은 저녁이에요, ${userName}님!`;
      emoji = '🌆';
      tip = '저녁 식사 후 가벼운 산책을 권장해요!';
    } else {
      greeting = `늦은 시간이네요, ${userName}님!`;
      emoji = '🌙';
      tip = '충분한 수면이 건강의 기본입니다. 일찍 주무세요!';
    }

    return { greeting, emoji, tip };
  }

  /**
   * 랜덤 건강 팁
   */
  getHealthTip() {
    const tips = [
      {
        category: '수분',
        icon: '💧',
        title: '수분 섭취',
        message: '하루 8잔(2리터)의 물을 마시는 것을 목표로 하세요!',
      },
      {
        category: '운동',
        icon: '🏃',
        title: '규칙적인 운동',
        message: '하루 30분 걷기만으로도 큰 건강 효과가 있어요!',
      },
      {
        category: '수면',
        icon: '😴',
        title: '충분한 수면',
        message: '성인은 하루 7-9시간의 수면이 필요합니다!',
      },
      {
        category: '스트레스',
        icon: '🧘',
        title: '스트레스 관리',
        message: '하루 5분 명상으로 마음의 평화를 찾아보세요!',
      },
      {
        category: '영양',
        icon: '🥗',
        title: '균형 잡힌 식단',
        message: '채소와 과일을 다양하게 섭취하세요!',
      },
      {
        category: '자세',
        icon: '🪑',
        title: '바른 자세',
        message: '1시간마다 자세를 바꾸고 스트레칭하세요!',
      },
      {
        category: '햇빛',
        icon: '☀️',
        title: '비타민 D',
        message: '하루 15분 햇빛을 쬐면 비타민 D가 생성돼요!',
      },
      {
        category: '웃음',
        icon: '😄',
        title: '긍정적 마음',
        message: '웃음은 면역력을 높이고 스트레스를 줄여줘요!',
      },
    ];

    return tips[Math.floor(Math.random() * tips.length)];
  }

  /**
   * 증상별 맞춤 조언
   */
  getSymptomAdvice(symptom) {
    const adviceMap = {
      두통: {
        icon: '🤕',
        advice: '충분한 휴식과 수분 섭취가 중요해요. 지속되면 전문의 상담을 권장합니다.',
        actions: ['물 마시기', '어두운 곳에서 휴식', '카페인 줄이기'],
      },
      불면증: {
        icon: '😴',
        advice: '규칙적인 수면 패턴과 취침 전 루틴이 도움이 됩니다.',
        actions: ['22시 이전 취침', '블루라이트 차단', '명상하기'],
      },
      스트레스: {
        icon: '😰',
        advice: '호흡 운동과 명상으로 마음을 진정시켜보세요.',
        actions: ['심호흡 연습', '명상 듣기', '산책하기'],
      },
      소화불량: {
        icon: '🤢',
        advice: '가벼운 음식과 충분한 수분 섭취를 권장합니다.',
        actions: ['미음 섭취', '따뜻한 물', '소화제 복용'],
      },
      피로: {
        icon: '😫',
        advice: '충분한 휴식과 영양 섭취가 필요합니다.',
        actions: ['수면 취하기', '영양제 복용', '가벼운 운동'],
      },
    };

    return adviceMap[symptom] || {
      icon: '💊',
      advice: '증상이 지속되면 전문의 상담을 권장합니다.',
      actions: ['증상 관찰', '건강 기록', '병원 방문'],
    };
  }

  /**
   * 긴급도에 따른 메시지
   */
  getUrgencyMessage(level) {
    const messages = {
      emergency: {
        icon: '🚨',
        title: '응급 상황!',
        message: '즉시 119에 연락하거나 가까운 응급실을 방문하세요!',
        color: 'error',
      },
      high: {
        icon: '⚠️',
        title: '주의 필요',
        message: '빠른 시일 내에 병원 방문을 권장합니다.',
        color: 'warning',
      },
      medium: {
        icon: '📋',
        title: '관찰 필요',
        message: '증상이 지속되면 전문의 상담을 고려하세요.',
        color: 'warning',
      },
      low: {
        icon: '💚',
        title: '경미한 증상',
        message: '충분한 휴식과 수분 섭취를 권장합니다.',
        color: 'success',
      },
    };

    return messages[level] || messages.low;
  }

  /**
   * 프로액티브 알림 생성
   */
  generateProactiveNotifications() {
    const hour = new Date().getHours();
    const notifications = [];

    // 아침 (7-9시)
    if (hour >= 7 && hour < 9) {
      notifications.push({
        id: 'morning-water',
        type: 'reminder',
        icon: '💧',
        title: '아침 물 마시기',
        message: '일어나자마자 미지근한 물 한 잔을 마셔보세요!',
        priority: 'medium',
      });
    }

    // 점심 (12-13시)
    if (hour >= 12 && hour < 13) {
      notifications.push({
        id: 'lunch-walk',
        type: 'tip',
        icon: '🚶',
        title: '식후 산책',
        message: '점심 식사 후 10분 걷기로 소화를 도와보세요!',
        priority: 'low',
      });
    }

    // 오후 (15-16시)
    if (hour >= 15 && hour < 16) {
      notifications.push({
        id: 'afternoon-stretch',
        type: 'exercise',
        icon: '🤸',
        title: '스트레칭 시간',
        message: '오후 졸음 방지! 5분 스트레칭으로 몸을 깨워보세요!',
        priority: 'medium',
      });
    }

    // 저녁 (21-22시)
    if (hour >= 21 && hour < 22) {
      notifications.push({
        id: 'sleep-prep',
        type: 'reminder',
        icon: '🌙',
        title: '수면 준비',
        message: '곧 잠잘 시간이에요. 블루라이트 차단을 시작하세요!',
        priority: 'high',
      });
    }

    return notifications;
  }

  /**
   * 환영 메시지 (첫 로그인 시)
   */
  getWelcomeMessage(isFirstTime = false) {
    if (isFirstTime) {
      return {
        title: `안녕하세요! 저는 ${this.name}입니다 ${this.avatar}`,
        message: `저는 당신의 건강 비서예요!

언제든지 건강 상담이 필요하면 저를 찾아주세요.
증상 체크, 건강 기록, 복약 관리 등을 도와드릴게요!

함께 건강한 삶을 만들어가요! 💪`,
        tips: [
          '💬 증상 체크: AI 기반 증상 분석',
          '📊 건강 기록: 혈압, 혈당 등 기록',
          '💊 복약 관리: 약 복용 알림',
          '🧠 정신 건강: 스트레스 체크',
        ],
      };
    } else {
      const { greeting, emoji, tip } = this.getGreeting();
      return {
        title: `${greeting} ${emoji}`,
        message: `오늘도 건강한 하루 되세요!`,
        tip: tip,
      };
    }
  }

  /**
   * 칭찬 메시지 (목표 달성 시)
   */
  getPraiseMessage(achievement) {
    const praises = {
      mood_tracked: '오늘의 감정을 기록했어요! 자신의 마음을 돌보는 것은 정말 중요해요! 👏',
      medication_taken: '약 복용을 완료했네요! 꾸준한 관리가 건강의 비결이에요! 💊',
      exercise_done: '운동을 완료했어요! 정말 멋져요! 💪',
      water_goal: '오늘의 물 섭취 목표를 달성했어요! 수분 보충 완벽! 💧',
      sleep_good: '충분한 수면을 취했네요! 잘 쉬는 것도 건강 관리예요! 😴',
      stress_low: '스트레스 수치가 낮아요! 마음 관리를 잘 하고 계시네요! 🧘',
    };

    return praises[achievement] || '잘하고 계세요! 계속 이렇게 관리해요! 🌟';
  }

  /**
   * 격려 메시지 (목표 미달성 시)
   */
  getEncouragementMessage(missed) {
    const encouragements = {
      mood_not_tracked: '오늘의 기분은 어떠신가요? 잠깐 시간을 내서 기록해보세요! 📝',
      medication_missed: '약 복용 시간을 놓치셨나요? 괜찮아요, 지금이라도 복용하세요! ⏰',
      exercise_missed: '오늘은 운동하기 힘드셨나요? 내일은 가볍게 걷기부터 시작해봐요! 🚶',
      water_low: '오늘 물을 덜 마셨네요. 지금 물 한 잔 어떠세요? 💧',
      sleep_bad: '어젯밤 잘 못 주무셨나요? 오늘 일찍 주무시는 건 어떨까요? 🌙',
    };

    return encouragements[missed] || '괜찮아요! 내일은 더 잘할 수 있어요! 💪';
  }
}

// 싱글톤 인스턴스
const aiAssistant = new AIAssistantService();

export default aiAssistant;
