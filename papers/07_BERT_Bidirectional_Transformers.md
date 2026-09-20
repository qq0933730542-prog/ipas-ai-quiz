# 07. BERT: Bidirectional Transformers

## 📌 論文基本資訊
- **論文原名**：BERT: Pre-training of Deep Bidirectional Transformers for Language Understanding
- **發表作者**：Jacob Devlin, Ming-Wei Chang, Kenton Lee, Kristina Toutanova
- **發表機構**：Google AI Language
- **發表研討會**：NAACL 2019
- **論文直達**：[arXiv:1810.04805](https://arxiv.org/abs/1810.04805)

---

## 🎯 核心創新：真正雙向的語言理解
在 BERT 之前：
- **GPT-1 (OpenAI)**：單向自左向右（Left-to-Right）預測下一個詞，擅長生成文本，但無法利用未來的上下文理解當前單詞。
- **ELMo**：分別訓練從左到右與從右到左的兩套獨立 LSTM，最後簡單拼接，並非深層層間雙向融合。

**BERT 的突破**：採用 Transformer 的 **Encoder** 部分，透過全新設計的「完形填空」預訓練任務，達成全層深度的雙向上下文理解。

---

## ⚙️ 兩大核心預訓練任務

### 1. 遮罩語言模型（Masked Language Model, MLM）
- 隨機將句子中 15% 的 Token 挑出：
  - 80% 機率替換為特殊標記 `[MASK]`。
  - 10% 機率隨機替換為另一個無關單詞。
  - 10% 機率保持原單詞不變。
- 讓模型同時依據上文與下文預測被遮蔽的原單詞。

### 2. 下一句預測（Next Sentence Prediction, NSP）
- 輸入一對句子 A 與 B：
  - 50% 機率 B 是 A 的真正下一句（標籤為 IsNext）。
  - 50% 機率 B 是語料庫隨機抽取的句子（標籤為 NotNext）。
- 讓模型學習句子之間的連貫與邏輯關係。

---

## 📝 iPAS 考試必背對照：Encoder vs. Decoder

| 比較維度 | BERT 系列 (Encoder-only) | GPT 系列 (Decoder-only) | T5 / BART (Encoder-Decoder) |
|:---|:---|:---|:---|
| **注意力遮罩** | 無遮罩，所有 Token 雙向可見 | 因果遮罩（Causal Mask），只能看上文 | Encoder 雙向，Decoder 因果遮罩 |
| **強項任務** | 文本分類、情感分析、NER、語意比對 | 開放式對話、文章創作、程式碼生成 | 機器翻譯、文本摘要 |
| **運作範式** | 預訓練 + 微調（Fine-tuning） | 預訓練 + Prompting / In-context Learning | 序列到序列（Seq2Seq） |

---

## 💡 考前 10 秒速記口訣
> **「BERT 雙向填空準，分類抽取是行家；GPT 單向解碼續，生成聊天走天下。」**
