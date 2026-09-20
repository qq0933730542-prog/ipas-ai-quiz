# 06. Dropout: A Simple Way to Prevent Overfitting

## 📌 論文基本資訊
- **論文原名**：Dropout: A Simple Way to Prevent Neural Networks from Overfitting
- **發表作者**：Nitish Srivastava, Geoffrey Hinton, Alex Krizhevsky, Ilya Sutskever, Ruslan Salakhutdinov
- **發表機構**：University of Toronto
- **發表期刊**：Journal of Machine Learning Research (JMLR) 2014
- **論文直達**：[JMLR 官方論文](https://jmlr.org/papers/v15/srivastava14a.html)

---

## 🎯 核心痛點：共適應性（Co-adaptation）與過擬合
神經網路擁有大量參數，當訓練資料有限時：
- 某些神經元容易依賴其他特定神經元的輸出才能做出正確預測，形成脆弱的「共適應性」。
- 模型過度記憶訓練集中的隨機雜訊，導致泛化能力（Generalization Ability）大幅下降。

---

## ⚙️ 機制原理：訓練與推論的關鍵差異（iPAS 必考）

### 1. 訓練階段（Training Time）
- 每個隱藏層節點以機率 $p$（通常設為 0.5）被隨機「暫時移除（設為 0）」。
- 每次前向與反向傳播都在訓練一個不同的「瘦身子神經網路（Thinned Network）」。
- 強迫每個神經元必須獨立學到魯棒（Robust）且具備代表性的特徵，無法依賴鄰居。

### 2. 測試 / 推論階段（Test / Inference Time）
- **所有節點全部保留參與運算**！
- 為了使測試時的總輸出期望值與訓練時一致，權重必須乘以 $(1-p)$（或者在訓練階段採用 Inverted Dropout，於激活值除以 $1-p$）。
- 本質上近似於對指數級數量的子模型進行幾何平均投票（Ensemble 集成學習）。

---

## 📝 iPAS 考試必背重點

| 正則化技術 | 核心原理 | 作用對象 | 備註 |
|:---|:---|:---|:---|
| **Dropout** | 隨機將節點激活值歸零 | 神經元激活值（Activation） | 僅在訓練階段開啟，推論階段關閉 |
| **L1 正則化 (Lasso)** | 損失函數加入權重絕對值和 $\lambda \sum \|w\|$ | 權重參數（Weights） | 傾向產生**稀疏解（Sparse Weights）**，具特徵挑選效果 |
| **L2 正則化 (Ridge)** | 損失函數加入權重平方和 $\frac{1}{2}\lambda \sum w^2$ | 權重參數（Weights） | 又稱**權重衰減（Weight Decay）**，使權重均勻趨近於 0 |
| **Early Stopping** | 驗證集損失連續上升時提前中斷訓練 | 訓練輪次（Epochs） | 防止模型進入過度擬合階段 |

---

## 💡 考前 10 秒速記口訣
> **「訓練隨機丟節點，不許抱團各自強；推論全上算均值，過度擬合煙消散。」**
