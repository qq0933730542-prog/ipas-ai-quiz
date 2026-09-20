# 03. LoRA: Low-Rank Adaptation of Large Language Models

## 📌 論文基本資訊
- **論文原名**：LoRA: Low-Rank Adaptation of Large Language Models
- **發表作者**：Edward J. Hu, Yelong Shen, Phillip Wallis, Zeyuan Allen-Zhu, Yuanzhi Li, Shean Wang, Lu Wang, Weizhu Chen
- **發表機構**：Microsoft Corporation
- **發表研討會**：ICLR 2022
- **論文直達**：[arXiv:2106.09685](https://arxiv.org/abs/2106.09685)

---

## 🎯 核心痛點：為什麼不能全量微調（Full Fine-Tuning）？
當大型語言模型達到 70B 或甚至 175B 參數時：
1. **顯存爆炸**：全量微調需要為每一個參數保存梯度（Gradient）與優化器狀態（Optimizer States，如 Adam 的一階與二階動量），消耗顯存是推論的 4~8 倍。
2. **多任務部署噩夢**：若一家企業有 100 個部門需要不同領域的專用微調模型，如果每個模型都儲存全量 70B 權重（約 140GB），硬碟與切換成本將難以承受。

**LoRA 核心洞察**：預訓練模型的權重矩陣雖然維度很高，但適應特定下游任務時的**本質維度（Intrinsic Rank）非常低**。

---

## ⚙️ 底層架構與數學機制

$$W = W_0 + \Delta W = W_0 + \frac{\alpha}{r} (B \times A)$$

1. **凍結預訓練矩陣 $W_0$**：維度為 $d \times k$，在訓練過程中完全不更新梯度。
2. **引入旁路低秩分解矩陣 $A$ 與 $B$**：
   - 矩陣 $A$ 維度為 $r \times k$，初始化為高斯隨機分佈。
   - 矩陣 $B$ 維度為 $d \times r$，初始化為全 0（保證訓練初始時 $\Delta W = 0$）。
   - 秩 $r \ll \min(d, k)$（通常設為 8, 16 或 32）。
3. **縮放因子 $\frac{\alpha}{r}$**：穩定超參數調校時的數值範圍。
4. **推論階段零額外延遲（Zero Inference Latency）**：
   - 訓練完成後，可直接將 $B \times A$ 矩陣加回原矩陣 $W_0$ 中！推論時不需要額外並行計算分支。

---

## 📝 iPAS 考試必背重點

| 特性 | 全參數量微調 (Full FT) | 提示工程 (Prompting) | LoRA (PEFT) |
|:---|:---:|:---:|:---:|
| **可訓練參數量** | 100% | 0% | **< 0.1%**（大幅降低 10,000 倍） |
| **GPU 顯存消耗** | 極大 | 極小 | **大幅降低 3 倍以上** |
| **專業風格/領域格式塑形** | 優良 | 易受 Context 長度限制 | **優良且輕量** |
| **儲存空間** | 數十 GB / 任務 | 無額外儲存 | **數十 MB / 任務**（即插即用） |

---

## 💡 考前 10 秒速記口訣
> **「凍結原始大底模，旁路低秩小矩陣；參數量砍萬倍省，相加部署零延遲。」**
