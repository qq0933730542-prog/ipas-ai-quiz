# 05. Deep Residual Learning for Image Recognition (ResNet)

## 📌 論文基本資訊
- **論文原名**：Deep Residual Learning for Image Recognition
- **發表作者**：Kaiming He (何愷明), Xiangyu Zhang, Shaoqing Ren, Jian Sun
- **發表機構**：Microsoft Research
- **發表研討會**：CVPR 2016 (獲得 Best Paper 最佳論文獎)
- **論文直達**：[arXiv:1512.03385](https://arxiv.org/abs/1512.03385)

---

## 🎯 核心痛點：網路退化問題（Degradation Problem）
在深度學習發展初期，大家普遍認為「模型越深、特徵表達能力越強、準確率越高」。然而何愷明團隊發現：
- 當神經網路堆疊到 30~50 層以上時，**訓練集誤差反而比 20 層的淺層網路更高**！
- 這**不是**過擬合（因為過擬合是訓練集表現好、測試集差，退化問題是連訓練集都學不好）。
- 原因在於極深層網路的反向傳播過程中，連乘效應導致**梯度消失（Vanishing Gradient）**或資訊在層層非線性轉換中丟失。

---

## ⚙️ 底層架構：殘差塊（Residual Block）

```
         x (輸入)
         │ ＼
         │   [ 卷積層 Weight Layer ]
         │   [ 激活函數 ReLU ]
         │   [ 卷積層 Weight Layer ]
         │      │
         │   F(x) (殘差映射)
         ▼      ▼
        【 ⊕ 相加 】 ➔ 輸出 H(x) = F(x) + x
             │
         [ ReLU ]
```

### 數學原理：
- 原本目標：讓堆疊層直接擬合複雜的潛在映射 $H(x)$。
- 殘差思想：改為讓堆疊層去擬合差值 $F(x) = H(x) - x$。
- **恆等映射（Identity Mapping）的優勢**：若該層對性能沒有幫助，網路只需將權重優化為 0（$F(x) = 0$），輸出就直接等於輸入 $H(x) = x$，網絡退化風險瞬間化解。
- **梯度暢通傳遞**：
  $$\frac{\partial \text{Loss}}{\partial x} = \frac{\partial \text{Loss}}{\partial H} \left(\frac{\partial F}{\partial x} + 1\right)$$
  注意括號中的 **$+1$**！即使 $\frac{\partial F}{\partial x}$ 趨近於 0，梯度仍能藉由 $+1$ 的捷徑毫無阻礙地流回最前面的淺層！

---

## 📝 iPAS 考試必背重點
1. **跳躍連接（Skip / Shortcut Connection）**：跨層直連相加，不引入任何額外參數量與計算複雜度。
2. **深度突破**：ResNet 成功將網路深度提升至 152 層，並一舉包攬 ImageNet 分類、檢測、分割五項世界冠軍。
3. **在 Transformer 中的傳承**：Transformer 每個子層（Sub-layer）後的 **Add & Norm** 中的 "Add"，正是繼承了 ResNet 的殘差跳躍連接思想。

---

## 💡 考前 10 秒速記口訣
> **「深層網路怕退化，捷徑相加加個一；殘差歸零保底過，百五十層照樣訓。」**
