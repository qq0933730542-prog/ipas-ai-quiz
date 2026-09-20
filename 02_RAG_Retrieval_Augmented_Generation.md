# 02. Retrieval-Augmented Generation for NLP Tasks (RAG)

## 📌 論文基本資訊
- **論文原名**：Retrieval-Augmented Generation for Knowledge-Intensive NLP Tasks
- **發表作者**：Patrick Lewis, Ethan Perez, Aleksandara Piktus, Fabio Petroni, Vladimir Karpukhin, et al.
- **發表機構**：Facebook AI Research (Meta AI), University College London, NYU
- **發表研討會**：NeurIPS 2020
- **論文直達**：[arXiv:2005.11401](https://arxiv.org/abs/2005.11401)

---

## 🎯 核心痛點：大模型為什麼需要 RAG？
預訓練大語言模型（LLM）本質上是一個將知識儲存在神經網路權重中的「參數化記憶體（Parametric Memory）」：
1. **知識陳舊（Staleness）**：模型知識截止於訓練完畢那一刻，無法知曉今日最新新聞或即時股價。
2. **事實幻覺（Hallucination）**：遇到冷門或未學習過的領域，模型傾向於自信地胡言亂語。
3. **私有資料無法存取**：企業機密規章與內部財務報表不可能拿去給公開大模型預訓練。

**RAG 的解決方案**：引入「非參數化記憶體（Non-Parametric Memory）」，在生成前動態檢索外部知識庫，將相關文本作為 Context 塞入 Prompt 中輔助生成。

---

## ⚙️ 底層架構與 Pipeline 流程

```
【原始文件】 ➔ 【切塊 Chunking (附重疊 Overlap)】 ➔ 【Embedding 模型轉換為稠密向量】
                                                        │
                                                        ▼
【用戶提問】 ➔ 【同模型 Embedding】 ➔ 【向量資料庫 (Vector DB) 相似度比對 (Cosine)】
                                                        │
                                                        ▼
【選出最相關 Top-K 片段】 ➔ 【重排序 Re-ranking (可選)】 ➔ 【組合成 Prompt 上下文】
                                                        │
                                                        ▼
                                           【LLM 解讀並輸出精準答案】
```

### 關鍵機制（iPAS 必考）：
1. **Dense Retrieval（稠密語意檢索）**：不同於傳統基於字面完全匹配的 BM25 / TF-IDF，Dense Retrieval 能理解「感冒」與「上呼吸道感染」在語意空間上的相近性。
2. **Chunk Size 與 Overlap**：
   - Chunk 太小：語意不完整、缺少背景上下文。
   - Chunk 太大：檢索雜訊過多、塞爆 LLM 上下文視窗（Context Window）。
   - Overlap（如 10%~20%）：防止斷句恰好切在關鍵定義中間。

---

## 📝 iPAS 考試必背重點：技術選型比較

在 iPAS 考卷中，「企業如何低成本建立專屬客服或知識庫」是出題頻率最高的題目：

| 評估維度 | 預訓練 (Pre-training) | 全量微調 (Fine-Tuning) | 檢索增強生成 (RAG) |
|:---|:---:|:---:|:---:|
| **計算成本 / 算力** | 極高（數百萬美元、大量 GPU） | 中高（需專業硬體微調權重） | **極低**（僅需 Embedding + 向量庫） |
| **動態知識即時更新** | 無法即時更新 | 需重新微調才能更新 | **秒級更新**（只需上傳新文件） |
| **事實幻覺抑制** | 嚴重 | 改善有限（仍會產生幻覺） | **極佳**（可附帶引用出處與原文鏈結） |
| **資料隱私控管** | 難以切分權限 | 難以精細化權限切分 | **極佳**（可依員工職能動態過濾檢索範圍） |

---

## 💡 考前 10 秒速記口訣
> **「外部知識外掛夾，向量檢索找最搭；免調權重省大錢，有憑有據不唬爛。」**
