const { contextBridge, ipcRenderer } = require('electron');

// 렌더러 프로세스에서 안전하게 Electron API 사용
contextBridge.exposeInMainWorld('electronAPI', {
  // 알림 전송
  sendNotification: (data) => {
    ipcRenderer.send('notification', data);
  },

  // 모니터링 상태 업데이트
  updateMonitoringStatus: (isMonitoring) => {
    ipcRenderer.send('monitoring-status', isMonitoring);
  },

  // 건강 상태 변화 알림
  sendHealthStatusChange: (data) => {
    ipcRenderer.send('health-status-change', data);
  },

  // 플랫폼 정보
  platform: process.platform,

  // Electron 환경 확인
  isElectron: true,
});
