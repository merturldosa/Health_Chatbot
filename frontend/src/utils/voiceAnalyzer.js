/**
 * 음성 톤 분석 유틸리티
 *
 * Web Audio API를 사용하여 음성의 톤, 피치, 에너지를 분석합니다.
 * ContinuousVoiceMonitor와 ChatBot에서 공통으로 사용됩니다.
 */

/**
 * 오디오 스트림에서 음성 톤 분석
 *
 * @param {MediaStream} stream - 마이크 스트림
 * @param {number} duration - 분석 시간 (밀리초)
 * @returns {Promise<Object>} 음성 톤 분석 결과
 */
export const analyzeVoiceTone = async (stream, duration = 3000) => {
  return new Promise((resolve, reject) => {
    try {
      // Web Audio API 설정
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const analyser = audioContext.createAnalyser();
      const microphone = audioContext.createMediaStreamSource(stream);

      analyser.fftSize = 2048;
      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);
      const frequencyData = new Uint8Array(bufferLength);

      microphone.connect(analyser);

      // 분석 데이터 수집
      const pitchHistory = [];
      const volumeHistory = [];
      const energyHistory = [];

      const startTime = Date.now();
      let frameCount = 0;

      const analyze = () => {
        const elapsed = Date.now() - startTime;

        if (elapsed >= duration) {
          // 분석 종료
          microphone.disconnect();
          audioContext.close();

          // 결과 계산
          const result = calculateVoiceMetrics(pitchHistory, volumeHistory, energyHistory);
          resolve(result);
          return;
        }

        // 오디오 데이터 읽기
        analyser.getByteTimeDomainData(dataArray);
        analyser.getByteFrequencyData(frequencyData);

        // 볼륨 계산 (RMS)
        let sum = 0;
        for (let i = 0; i < dataArray.length; i++) {
          const value = dataArray[i] / 128.0 - 1.0;
          sum += value * value;
        }
        const rms = Math.sqrt(sum / dataArray.length);
        const volume = rms * 100;

        // 피치 추정 (주파수 분석)
        const nyquist = audioContext.sampleRate / 2;
        let maxValue = 0;
        let maxIndex = 0;
        for (let i = 0; i < frequencyData.length; i++) {
          if (frequencyData[i] > maxValue) {
            maxValue = frequencyData[i];
            maxIndex = i;
          }
        }
        const pitch = (maxIndex * nyquist) / analyser.frequencyBinCount;

        // 에너지 계산 (주파수 데이터의 합)
        let energy = 0;
        for (let i = 0; i < frequencyData.length; i++) {
          energy += frequencyData[i];
        }
        energy = energy / frequencyData.length;

        // 음성 감지 (볼륨 임계값)
        if (volume > 5) {
          pitchHistory.push(pitch);
          volumeHistory.push(volume);
          energyHistory.push(energy);
          frameCount++;
        }

        // 다음 프레임
        requestAnimationFrame(analyze);
      };

      // 분석 시작
      analyze();

      // 타임아웃 설정
      setTimeout(() => {
        if (audioContext.state !== 'closed') {
          microphone.disconnect();
          audioContext.close();
          reject(new Error('음성 톤 분석 타임아웃'));
        }
      }, duration + 1000);

    } catch (error) {
      reject(error);
    }
  });
};

/**
 * 음성 메트릭 계산
 *
 * @param {Array<number>} pitchHistory - 피치 히스토리
 * @param {Array<number>} volumeHistory - 볼륨 히스토리
 * @param {Array<number>} energyHistory - 에너지 히스토리
 * @returns {Object} 음성 분석 결과
 */
const calculateVoiceMetrics = (pitchHistory, volumeHistory, energyHistory) => {
  if (pitchHistory.length === 0) {
    // 음성 감지 안 됨
    return {
      stress_level: 0,
      anxiety_indicator: 0,
      energy_level: 0,
      overall_status: 'no_voice',
      voice_detected: false,
    };
  }

  // 평균 계산
  const avgPitch = pitchHistory.reduce((a, b) => a + b, 0) / pitchHistory.length;
  const avgVolume = volumeHistory.reduce((a, b) => a + b, 0) / volumeHistory.length;
  const avgEnergy = energyHistory.reduce((a, b) => a + b, 0) / energyHistory.length;

  // 피치 변동성 (표준편차)
  const pitchVariance = pitchHistory.reduce((sum, pitch) => {
    return sum + Math.pow(pitch - avgPitch, 2);
  }, 0) / pitchHistory.length;
  const pitchStdDev = Math.sqrt(pitchVariance);

  // 볼륨 변동성
  const volumeVariance = volumeHistory.reduce((sum, vol) => {
    return sum + Math.pow(vol - avgVolume, 2);
  }, 0) / volumeHistory.length;
  const volumeStdDev = Math.sqrt(volumeVariance);

  // 스트레스 지표 (0-10)
  // 높은 피치 변동성 + 높은 볼륨 변동성 = 스트레스
  let stress = Math.min(10, (pitchStdDev / 50) * 5 + (volumeStdDev / 20) * 5);

  // 불안 지표 (0-1)
  // 높은 피치 + 높은 변동성
  let anxiety = 0;
  if (avgPitch > 200 && pitchStdDev > 40) {
    anxiety = Math.min(1, (avgPitch - 200) / 100);
  }

  // 에너지 레벨 (0-10)
  // 볼륨 + 에너지로 계산
  let energyLevel = Math.min(10, (avgVolume / 10) + (avgEnergy / 50));

  // 전체 상태
  let overall = 'normal';
  if (stress > 7 || anxiety > 0.6) {
    overall = 'concern';
  } else if (stress > 5 || anxiety > 0.4) {
    overall = 'attention';
  }

  return {
    stress_level: Math.round(stress * 10) / 10,
    anxiety_indicator: Math.round(anxiety * 100) / 100,
    energy_level: Math.round(energyLevel * 10) / 10,
    overall_status: overall,
    voice_detected: true,
    // 추가 메타데이터
    avg_pitch: Math.round(avgPitch),
    avg_volume: Math.round(avgVolume * 10) / 10,
    pitch_variation: Math.round(pitchStdDev * 10) / 10,
    sample_count: pitchHistory.length,
  };
};

/**
 * MediaRecorder의 오디오 Blob에서 음성 톤 분석
 * (녹음 완료 후 분석 - 실시간 분석과 다름)
 *
 * @param {Blob} audioBlob - 오디오 Blob
 * @returns {Promise<Object>} 음성 톤 분석 결과
 */
export const analyzeAudioBlob = async (audioBlob) => {
  return new Promise((resolve, reject) => {
    try {
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const reader = new FileReader();

      reader.onload = async (e) => {
        try {
          const arrayBuffer = e.target.result;
          const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);

          // 오디오 버퍼에서 분석
          const channelData = audioBuffer.getChannelData(0); // 모노 채널
          const sampleRate = audioBuffer.sampleRate;

          // 프레임 단위로 분석 (10ms)
          const frameSize = Math.floor(sampleRate * 0.01);
          const pitchHistory = [];
          const volumeHistory = [];

          for (let i = 0; i < channelData.length; i += frameSize) {
            const frame = channelData.slice(i, i + frameSize);

            // 볼륨 (RMS)
            let sum = 0;
            for (let j = 0; j < frame.length; j++) {
              sum += frame[j] * frame[j];
            }
            const rms = Math.sqrt(sum / frame.length);
            const volume = rms * 100;

            if (volume > 5) {
              volumeHistory.push(volume);

              // 간단한 피치 추정 (Zero-Crossing Rate 기반)
              // 실제로는 FFT 필요하지만 간소화
              let zeroCrossings = 0;
              for (let j = 1; j < frame.length; j++) {
                if ((frame[j - 1] >= 0 && frame[j] < 0) || (frame[j - 1] < 0 && frame[j] >= 0)) {
                  zeroCrossings++;
                }
              }
              const pitch = (zeroCrossings / 2) * (sampleRate / frameSize);
              pitchHistory.push(pitch);
            }
          }

          // 결과 계산
          const energyHistory = volumeHistory; // 간소화
          const result = calculateVoiceMetrics(pitchHistory, volumeHistory, energyHistory);

          audioContext.close();
          resolve(result);
        } catch (error) {
          audioContext.close();
          reject(error);
        }
      };

      reader.onerror = () => {
        reject(new Error('오디오 파일 읽기 실패'));
      };

      reader.readAsArrayBuffer(audioBlob);
    } catch (error) {
      reject(error);
    }
  });
};
