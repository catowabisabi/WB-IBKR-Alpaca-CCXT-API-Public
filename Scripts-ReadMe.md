# 📦 package.json scripts 說明（中英對照）

## 🚀 生產環境指令

- `"start:prod"`  
  啟動生產環境伺服器  
  _Start production server_

- `"stop:prod"`  
  停止生產環境伺服器  
  _Stop production server_

- `"restart:prod"`  
  重啟生產環境伺服器  
  _Restart production server_

---

## 🛠️ 編譯與格式化

- `"build"`  
  編譯 NestJS 專案  
  _Build NestJS project_

- `"format"`  
  格式化程式碼  
  _Format code_

---

## 🧪 開發與除錯

- `"start"`  
  啟動 NestJS 伺服器（不會自動重啟）  
  _Start NestJS server_

- `"start:dev"`  
  開發模式啟動，會監控檔案變動並自動重啟  
  _Start in dev mode with auto-reload_  
  > ✅ **watch mode**：當檔案變動時，自動重新啟動伺服器

- `"start:debug"`  
  以除錯模式啟動，供 IDE 連接  
  _Start in debug mode_  
  > 🐞 **debug mode**：可在 VS Code 設中斷點、觀察變數

---

## 🔍 程式碼品質檢查

- `"lint"`  
  執行靜態碼檢查並自動修正錯誤  
  _Lint and fix issues_

---

## 🧪 測試相關指令

- `"test"`  
  執行所有單元測試  
  _Run unit tests_

- `"test:watch"`  
  監控測試檔案變化，自動重新執行測試  
  _Watch mode testing_  
  > ✅ **watch mode**：邊改邊跑測試最方便

- `"test:cov"`  
  產生測試覆蓋率報告  
  _Test coverage_  
  > 📊 **Coverage**：統計多少程式碼有被測試覆蓋

- `"test:debug"`  
  以除錯模式執行測試  
  _Debug mode test_  
  > 🐞 可追蹤測試流程、找出失敗原因

- `"test:e2e"`  
  執行端對端測試（模擬使用者操作流程）  
  _End-to-end tests_  
  > 🌐 測試完整流程：例如登入、API 請求與回應

---
