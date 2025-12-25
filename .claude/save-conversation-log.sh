#!/bin/bash
# Claude Code 대화 로그 자동 저장 스크립트

# JSON 입력 읽기
input=$(cat)

# transcript_path 추출
transcript_path=$(echo "$input" | grep -o '"transcript_path":"[^"]*"' | cut -d'"' -f4)

if [ -z "$transcript_path" ]; then
    echo "Error: transcript_path not found in input"
    exit 1
fi

# 현재 날짜와 시간으로 파일명 생성
timestamp=$(date +"%Y%m%d_%H%M%S")
log_dir="conversation_logs"
log_file="${log_dir}/conversation_${timestamp}.json"

# transcript 파일 복사
if [ -f "$transcript_path" ]; then
    cp "$transcript_path" "$log_file"
    echo "Conversation log saved to: $log_file"
else
    echo "Error: Transcript file not found at $transcript_path"
    exit 1
fi
