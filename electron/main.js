const { app, BrowserWindow, Tray, Menu, ipcMain, nativeImage } = require('electron');
const path = require('path');
const isDev = !app.isPackaged;

let mainWindow = null;
let tray = null;

// 백그라운드에서 계속 실행되도록 설정
app.setAppUserModelId('com.gjict.health-chatbot');

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 800,
    minHeight: 600,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      enableRemoteModule: false,
      preload: path.join(__dirname, 'preload.js'),
    },
    icon: path.join(__dirname, 'icon.png'),
    title: '애고 (ego) - AI 건강 관리',
  });

  // 개발 모드: Vite 개발 서버
  // 프로덕션: 빌드된 파일
  const startURL = isDev
    ? 'http://localhost:5173'
    : `file://${path.join(__dirname, '../frontend/dist/index.html')}`;

  mainWindow.loadURL(startURL);

  // 개발 모드에서 DevTools 자동 열기
  if (isDev) {
    mainWindow.webContents.openDevTools();
  }

  // 창을 닫을 때 트레이로 최소화 (완전히 종료하지 않음)
  mainWindow.on('close', (event) => {
    if (!app.isQuitting) {
      event.preventDefault();
      mainWindow.hide();
    }
    return false;
  });
}

function createTray() {
  // 트레이 아이콘 생성 (시스템 트레이에 상주)
  const trayIcon = nativeImage.createFromPath(
    path.join(__dirname, 'icon.png')
  ).resize({ width: 16, height: 16 });

  tray = new Tray(trayIcon);

  const contextMenu = Menu.buildFromTemplate([
    {
      label: '애고 (ego) 열기',
      click: () => {
        mainWindow.show();
      },
    },
    {
      label: '상시 모니터링 상태',
      enabled: false,
    },
    { type: 'separator' },
    {
      label: '종료',
      click: () => {
        app.isQuitting = true;
        app.quit();
      },
    },
  ]);

  tray.setToolTip('애고 (ego) - AI 건강 관리');
  tray.setContextMenu(contextMenu);

  // 트레이 아이콘 더블클릭 시 창 표시
  tray.on('double-click', () => {
    mainWindow.show();
  });
}

// 앱 실행 준비 완료
app.whenReady().then(() => {
  createWindow();
  createTray();

  // macOS: Dock 아이콘 클릭 시 창 다시 열기
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    } else {
      mainWindow.show();
    }
  });
});

// 모든 창이 닫혀도 앱 종료하지 않음 (백그라운드 실행)
app.on('window-all-closed', (event) => {
  // macOS가 아니면 종료 (macOS는 Cmd+Q로 명시적 종료)
  if (process.platform !== 'darwin') {
    // 트레이로 계속 실행
    event.preventDefault();
  }
});

// 앱 종료 전 정리
app.on('before-quit', () => {
  app.isQuitting = true;
});

// IPC 통신 (렌더러 프로세스와의 통신)
ipcMain.on('notification', (event, data) => {
  // 시스템 알림 표시
  const { Notification } = require('electron');

  if (Notification.isSupported()) {
    const notification = new Notification({
      title: data.title || '애고 (ego) 알림',
      body: data.message || '',
      icon: path.join(__dirname, 'icon.png'),
      urgency: data.priority === 'high' ? 'critical' : 'normal',
    });

    notification.show();

    // TTS 음성 안내는 웹에서 처리
    notification.on('click', () => {
      mainWindow.show();
    });
  }
});

// 백그라운드 작업 상태 업데이트
ipcMain.on('monitoring-status', (event, isMonitoring) => {
  if (tray) {
    const contextMenu = Menu.buildFromTemplate([
      {
        label: '애고 (ego) 열기',
        click: () => {
          mainWindow.show();
        },
      },
      {
        label: `상시 모니터링: ${isMonitoring ? '🔴 실행 중' : '⚪ 중지'}`,
        enabled: false,
      },
      { type: 'separator' },
      {
        label: '종료',
        click: () => {
          app.isQuitting = true;
          app.quit();
        },
      },
    ]);
    tray.setContextMenu(contextMenu);

    // 트레이 툴팁 업데이트
    tray.setToolTip(
      `애고 (ego) - ${isMonitoring ? '모니터링 실행 중' : '모니터링 중지'}`
    );
  }
});

// 건강 상태 변화 알림
ipcMain.on('health-status-change', (event, data) => {
  const { Notification } = require('electron');

  if (Notification.isSupported()) {
    const notification = new Notification({
      title: '🏥 건강 상태 변화 감지',
      body: data.message,
      icon: path.join(__dirname, 'icon.png'),
      urgency: 'critical',
    });

    notification.show();
    notification.on('click', () => {
      mainWindow.show();
    });
  }

  // 트레이 아이콘을 깜빡여서 주의 환기 (선택사항)
  if (tray) {
    let blinkCount = 0;
    const blinkInterval = setInterval(() => {
      if (blinkCount >= 6) {
        clearInterval(blinkInterval);
        return;
      }
      // 여기에 아이콘 변경 로직 추가 가능
      blinkCount++;
    }, 500);
  }
});
