import { useEffect } from 'react';
import { format } from 'date-fns';

/**
 * 대화 로그 자동 저장 및 관리 훅
 * - localStorage에 실시간 자동 저장
 * - 마크다운 형식으로 다운로드
 */
export const useChatLogger = (messages, sessionId) => {
  // 실시간 자동 저장
  useEffect(() => {
    if (messages && messages.length > 0) {
      const logData = {
        sessionId,
        timestamp: new Date().toISOString(),
        messages,
      };

      // localStorage에 저장
      const existingLogs = JSON.parse(localStorage.getItem('chatLogs') || '[]');
      const currentLogIndex = existingLogs.findIndex(log => log.sessionId === sessionId);

      if (currentLogIndex >= 0) {
        existingLogs[currentLogIndex] = logData;
      } else {
        existingLogs.push(logData);
      }

      localStorage.setItem('chatLogs', JSON.stringify(existingLogs));
    }
  }, [messages, sessionId]);

  // 마크다운 형식으로 변환
  const convertToMarkdown = (logs) => {
    let markdown = '# 🏥 AI 건강 상담 대화 로그\n\n';
    markdown += `생성일: ${format(new Date(), 'yyyy-MM-dd HH:mm:ss')}\n\n`;
    markdown += '---\n\n';

    logs.forEach((log, index) => {
      markdown += `## 세션 ${index + 1}\n\n`;
      markdown += `**세션 ID**: ${log.sessionId || '신규 대화'}\n\n`;
      markdown += `**시간**: ${format(new Date(log.timestamp), 'yyyy-MM-dd HH:mm:ss')}\n\n`;
      markdown += '### 대화 내용\n\n';

      log.messages.forEach((msg, msgIndex) => {
        const role = msg.role === 'user' ? '👤 사용자' : '🤖 AI 상담사';
        markdown += `#### ${role}\n\n`;
        markdown += `${msg.message}\n\n`;

        if (msg.urgency_level) {
          markdown += `> **긴급도**: ${msg.urgency_level}\n\n`;
        }

        if (msg.suggested_action) {
          markdown += `> **권장 조치**: ${msg.suggested_action}\n\n`;
        }

        markdown += '---\n\n';
      });

      markdown += '\n\n';
    });

    return markdown;
  };

  // 현재 세션 다운로드
  const downloadCurrentSession = () => {
    const currentLog = {
      sessionId,
      timestamp: new Date().toISOString(),
      messages,
    };

    const markdown = convertToMarkdown([currentLog]);
    downloadMarkdown(markdown, `대화로그_${format(new Date(), 'yyyy-MM-dd_HHmmss')}.md`);
  };

  // 전체 로그 다운로드
  const downloadAllLogs = () => {
    const existingLogs = JSON.parse(localStorage.getItem('chatLogs') || '[]');

    if (existingLogs.length === 0) {
      alert('저장된 대화 로그가 없습니다.');
      return;
    }

    const markdown = convertToMarkdown(existingLogs);
    downloadMarkdown(markdown, `전체_대화로그_${format(new Date(), 'yyyy-MM-dd_HHmmss')}.md`);
  };

  // 마크다운 파일 다운로드 헬퍼 함수
  const downloadMarkdown = (content, filename) => {
    const blob = new Blob([content], { type: 'text/markdown;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);

    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    URL.revokeObjectURL(url);
  };

  // 이전 대화 임포트 (JSON 형식)
  const importLogs = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = (e) => {
        try {
          const importedData = JSON.parse(e.target.result);
          const existingLogs = JSON.parse(localStorage.getItem('chatLogs') || '[]');

          // 중복 제거 후 병합
          const mergedLogs = [...existingLogs];

          if (Array.isArray(importedData)) {
            importedData.forEach(newLog => {
              const exists = mergedLogs.some(log =>
                log.sessionId === newLog.sessionId &&
                log.timestamp === newLog.timestamp
              );

              if (!exists) {
                mergedLogs.push(newLog);
              }
            });
          } else {
            // 단일 세션 임포트
            const exists = mergedLogs.some(log =>
              log.sessionId === importedData.sessionId &&
              log.timestamp === importedData.timestamp
            );

            if (!exists) {
              mergedLogs.push(importedData);
            }
          }

          localStorage.setItem('chatLogs', JSON.stringify(mergedLogs));
          resolve(mergedLogs.length - existingLogs.length);
        } catch (error) {
          reject(error);
        }
      };

      reader.onerror = (error) => reject(error);
      reader.readAsText(file);
    });
  };

  // 로그 삭제
  const clearLogs = () => {
    if (window.confirm('모든 대화 로그를 삭제하시겠습니까?')) {
      localStorage.removeItem('chatLogs');
      alert('모든 로그가 삭제되었습니다.');
    }
  };

  // 로그 개수 가져오기
  const getLogCount = () => {
    const logs = JSON.parse(localStorage.getItem('chatLogs') || '[]');
    return logs.length;
  };

  return {
    downloadCurrentSession,
    downloadAllLogs,
    importLogs,
    clearLogs,
    getLogCount,
  };
};
