# 01. Attention Is All You Need (Transformer)

## 📌 論文基本資訊
- **論文原名**：Attention Is All You Need
- **發表作者**：Ashish Vaswani, Noam Shazeer, Niki Parmar, Jakob Uszkoreit, Llion Jones, Aidan N. Gomez, Łukasz Kaiser, Illia Polosukhin
- **發表機構**：Google Brain & Google Research
- **發表研討會**：NeurIPS 2017
- **論文直達**：[arXiv:1706.03762](https://arxiv.org/abs/1706.03762)

---

## 🎯 核心痛點：傳統架構為何被淘汰？
在 Transformer 出現之前，自然語言處理（NLP）主流架構為循環神經網路（RNN）、LSTM 與 GRU。
1. **無法平行運算**：RNN 必須等前一個時間步 $t-1$ 的隱藏狀態計算完畢，才能計算時間步 $t$，嚴重浪費 GPU 平行計算能力。
2. **長距離依賴遺忘（Vanishing Gradient）**：雖然 LSTM 有遺忘門與記憶單元，但在處理超過數百個 Token 的長文本時，開頭資訊仍會被稀釋或遺失。

**Transformer 的顛覆性創新**：完全拋棄循環與卷積（"Is All You Need"），純粹依賴**自注意力機制（Self-Attention）**，實現全域 Token 一步直達與高度 GPU 平行化。

---

## ⚙️ 底層架構與關鍵數學公式

### 1. 縮放點積注意力（Scaled Dot-Product Attention）
$$\text{Attention}(Q, K, V) = \text{Softmax}\left(\frac{QK^T}{\sqrt{d_k}}\right)V$$
- **$Q$ (Query)**：當前字詞向外查詢的向量。
- **$K$ (Key)**：被查詢字詞的特徵標籤向量。
- **$V$ (Value)**：字詞所乘載的實質內容資訊。
- **縮放因子 $\frac{1}{\sqrt{d_k}}$ 的作用（iPAS 高頻考點）**：當向量維度 $d_k$ 很大時，點積數值會變得極大，導致 Softmax 函數落入梯度極小的飽和區（Gradient Vanishing）。除以 $\sqrt{d_k}$ 可將變異數穩定控制在 1，保證反向傳播梯度暢通。

### 2. 多頭注意力（Multi-Head Attention）
$$\text{MultiHead}(Q, K, V) = \text{Concat}(\text{head}_1, \dots, \text{head}_h)W^O$$
允許模型同時從多個不同的語意子空間（如語法關聯、指代關係、情感極性）共同捕捉資訊。

### 3. 位置編碼（Positional Encoding）
因為純 Attention 架構完全具備置換不變性（Permutation Invariance，句子順序打亂結果完全一樣），因此必須在輸入端顯式加上正弦與餘弦位置編碼：
$$PE_{(pos, 2i)} = \sin(pos / 10000^{2i/d_{\text{model}}})$$
$$PE_{(pos, 2i+1)} = \cos(pos / 10000^{2i/d_{\text{model}}})$$

---

## 📝 iPAS 考試必背重點與常見陷阱

| 考點題型 | 正確概念 | 常見混淆陷阱 |
|:---|:---|:---|
| **計算複雜度** | Self-Attention 矩陣複雜度為 $O(N^2)$，序列長度倍增會使顯存開銷呈平方級成長 | 誤以為與序列長度呈線性關係 $O(N)$ |
| **位置編碼** | Transformer 本身不具備位置感，**必須**加入 Positional Encoding | 誤以為 Self-Attention 內建時序順序 |
| **縮放因子** | 除以 $\sqrt{d_k}$ 是為了防止點積過大落入 Softmax 梯度飽和區 | 誤以為除以 $\sqrt{d_k}$ 是為了做 L2 正規化 |
| **Encoder vs. Decoder** | BERT 為 Encoder-only（雙向理解）；GPT 為 Decoder-only（自回歸生成） | 混淆兩者解碼遮罩（Causal Mask）的使用情境 |

---

## 💡 考前 10 秒速記口訣
> **「Q乘K轉置除根號，Softmax加權乘上V；沒了時序加編碼，平方複雜顯存爆。」**
