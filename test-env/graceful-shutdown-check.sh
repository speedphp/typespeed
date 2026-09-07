#!/usr/bin/env bash
# 优雅停机冒烟测试：起服务 → 发 SIGTERM → 断言退出码 0
# 用法：npm run test:shutdown
set -e
cd "$(dirname "$0")/.."

PORT=${PORT:-8081}

# 直接使用本地 ts-node（避免 npx 包装导致信号转发问题）
./node_modules/.bin/ts-node --transpile-only app/src/main.ts > /tmp/ts-graceful-shutdown.log 2>&1 &
APP_PID=$!

# 等服务就绪（最多 15 秒）
READY=0
for i in $(seq 1 30); do
    if curl -sf "http://localhost:${PORT}/health" > /dev/null 2>&1; then
        READY=1
        break
    fi
    sleep 0.5
done

if [ "$READY" -ne 1 ]; then
    echo "FAIL: 服务未在 15 秒内就绪"
    kill -TERM "$APP_PID" 2>/dev/null
    exit 1
fi

# 发 SIGTERM
kill -TERM "$APP_PID"

# 等退出并检查退出码
wait "$APP_PID"
EXIT_CODE=$?

if [ "$EXIT_CODE" -eq 0 ]; then
    echo "PASS: 优雅停机退出码 0"
else
    echo "FAIL: 退出码 $EXIT_CODE"
    exit 1
fi
