# 小兒急性氣喘發作處置計算機 (Pediatric Acute Asthma Exacerbation Calculator)

這是一個專為兒科急診與臨床醫護人員設計的單頁式 Web 應用程式 (SPA)。本工具整合了 **PRAM Score (Pediatric Respiratory Assessment Measure)** 評分系統，能協助醫療人員快速評估病童氣喘發作的嚴重程度，並依據體重自動精算出第一線支氣管擴張劑與全身性類固醇的標準安全劑量。

## ✨ 核心功能 (Features)

*   **PRAM 嚴重度評估：** 透過 5 項臨床指標（血氧飽和度、胸骨上凹陷、斜角肌收縮、呼吸音進入量、喘鳴音），快速得出 0-12 分的 PRAM 總分，並自動分級（輕度、中度、重度）。
*   **動態用藥指引：** 依據嚴重度分級（輕度 1–3、中度 4–7、重度 8–12、危及生命 11–12 或瀕臨呼吸衰竭徵象），輸入即時更新處置方針。
*   **藥物劑量精算：** 輸入病童體重後，系統會自動換算以下藥物劑量並標示是否已達上限 (Max Dose)：
    *   吸入性支氣管擴張劑：Salbutamol MDI/霧化/連續霧化（< 20 kg / ≥ 20 kg）、Ipratropium（僅第 1 小時）
    *   全身性類固醇：Dexamethasone 0.6 mg/kg (max 12 mg, 首選)、Prednisolone 2 mg/kg 首劑 / 1 mg/kg/day (max 60 mg)、Methylprednisolone IV 2 mg/kg (max 80 mg)、Hydrocortisone IV 8 mg/kg (max 400 mg)
    *   重度急救藥物：IV Magnesium Sulfate 50 mg/kg (max 2 g)、等張輸液 bolus、過敏性休克時 IM epinephrine
*   **治療後再評估：** 以同樣 5 項重新評分，配合時間點（1 小時 / 2–4 小時 / 類固醇後 > 4–6 小時）給出出院、住院或 PICU 建議（TREKK 標準）。
*   **醫囑單列印匯出 (PDF Export)：** 內建隱藏式 A4 醫囑單排版，一鍵點擊即可將病患資料、PRAM 評分與精算後的藥物劑量轉存為 PDF 檔。
*   **離線支援 (PWA)：** 支援無網際網路的環境（如急診室地下室），可透過手機瀏覽器直接安裝至主畫面作為本機 APP 使用。

## 📚 參考臨床指引 (Clinical Guidelines)

*   **評估工具：** PRAM (Pediatric Respiratory Assessment Measure)，GINA 2026 建議 < 18 歲兒童使用。
*   **嚴重度分級：** GINA 2026 Summary Guide Figure 9。
*   **劑量與處置：** TREKK Bottom Line Recommendations: Asthma Exacerbations (v2.1, 2024)、TREKK Severe Asthma Algorithm 與 Order Set (v2.0, 2024)；適用 ≥ 12 個月兒童。

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
├── sw.js            # PWA Service Worker (網路優先、離線時用快取)
├── tests.cjs        # 計算引擎測試：node tests.cjs
└── icons/           # 192x192 與 512x512 的 APP 圖示

## 🧪 測試

計算邏輯集中在 `index.html` 的 `/*ENGINE-START*/ … /*ENGINE-END*/` 區塊，執行 `node tests.cjs` 驗證評分、分級、劑量上限與再評估邏輯。更新內容時請一併遞增 `sw.js` 的 `CACHE` 版本號。
