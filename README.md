# 小兒急性氣喘發作處置計算機 (Pediatric Acute Asthma Exacerbation Calculator)

這是一個專為兒科急診與臨床醫護人員設計的單頁式 Web 應用程式 (SPA)。本工具整合了 **PRAM Score (Pediatric Respiratory Assessment Measure)** 評分系統，能協助醫療人員快速評估病童氣喘發作的嚴重程度，並依據體重自動精算出第一線支氣管擴張劑與全身性類固醇的標準安全劑量。

## ✨ 核心功能 (Features)

*   **PRAM 嚴重度評估：** 透過 5 項臨床指標（血氧飽和度、胸骨上凹陷、斜角肌收縮、呼吸音進入量、喘鳴音），快速得出 0-12 分的 PRAM 總分，並自動分級（輕度、中度、重度）。
*   **動態用藥指引：** 依據嚴重度分級，即時提示臨床處置方針（如 SABA 霧化吸入頻率、是否需併用 SAMA 或介入 IV 治療）。
*   **藥物劑量精算：** 輸入病童體重後，系統會自動換算以下藥物劑量並標示最大安全上限 (Max Dose)：
    *   吸入性支氣管擴張劑：Salbutamol (SABA), Ipratropium (SAMA)
    *   口服類固醇：Prednisolone, Dexamethasone
    *   重度急救藥物：IV Magnesium Sulfate (硫酸鎂)
*   **醫囑單列印匯出 (PDF Export)：** 內建隱藏式 A4 醫囑單排版，一鍵點擊即可將病患資料、PRAM 評分與精算後的藥物劑量轉存為 PDF 檔。
*   **離線支援 (PWA)：** 支援無網際網路的環境（如急診室地下室），可透過手機瀏覽器直接安裝至主畫面作為本機 APP 使用。

## 📚 參考臨床指引 (Clinical Guidelines)

*   **評估工具：**  validated PRAM (Pediatric Respiratory Assessment Measure) 系統。
*   **處置原則：** 參考 GINA (Global Initiative for Asthma) 及一般兒科急診急性氣喘處置常規 (Pediatric Acute Asthma Pathways)。

## 🚀 部署與安裝 (Deployment)

本專案由純 HTML、CSS (Bootstrap 5) 與 JavaScript 撰寫，無須後端伺服器或資料庫。

1.  **線上發布 (GitHub Pages)：**
    進入專案的 `Settings > Pages`，將 Branch 設為 `main` 或 `master` 即可自動生成對外網址。
2.  **行動裝置安裝 (PWA)：**
    以手機 (Safari / Chrome) 開啟網頁後，選擇選單中的 **「加入主畫面 (Add to Home Screen)」** 即可離線使用。

## 📁 檔案結構 (File Structure)

```text
├── index.html       # 系統主程式與 UI 介面 (包含 PRAM 與劑量計算邏輯)
├── manifest.json    # PWA 應用程式清單 (定義 APP 名稱與顏色)
├── sw.js            # PWA Service Worker (處理離線快取)
└── icons/           # 放置 192x192 與 512x512 的 APP 圖示
