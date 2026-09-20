# 04. Chain-of-Thought Prompting (思維鏈)

## 📌 論文基本資訊
- **論文原名**：Chain-of-Thought Prompting Elicits Reasoning in Large Language Models
- **發表作者**：Jason Wei, Xuezhi Wang, Dale Schuurmans, Maarten Bosma, Brian Ichter, Fei Xia, Ed Chi, Quoc Le, Denny Zhou
- **發表機構**：Google Research, Brain Team
- **發表研討會**：NeurIPS 2022
- **論文直達**：[arXiv:2201.11903](https://arxiv.org/abs/2201.11903)

---

## 🎯 核心痛點：直接問答案為什麼大模型總算錯？
在傳統 Standard Prompting 中，我們給予模型範例：
> Q: 小明有 5 顆蘋果，給了小華 2 顆後又買了 3 顆，小明現在有幾顆？
> A: 答案是 6。

當問題變得複雜（多步驟算術、符號推理、常識因果推導）時，模型試圖在**單一前向傳播（Single Forward Pass）中直接跨越所有思考環節生成答案**，極容易因 Token 機率預測偏差而產生荒謬結論。

**CoT 的突破**：要求模型模仿人類解題過程，先將思考過程拆解為中間推導步驟，一步一步輸出推理文字，再給出最終答案。

---

## ⚙️ 兩大主流分支手法

### 1. Few-shot CoT (少樣本思維鏈)
在提示詞中提供包含「解題推導步驟」的範例（Exemplars）：
```markdown
Q: 餐廳有 23 顆蘋果。廚師用了 20 顆做午餐，又買了 6 顆，現在剩幾顆？
A: 餐廳原本有 23 顆蘋果。用了 20 顆後剩 23 - 20 = 3 顆。又買了 6 顆，所以現在有 3 + 6 = 9 顆。答案是 9。

Q: 停車場有 12 輛車，開走了 4 輛，又來了 7 輛，現在有幾輛？
A: [模型將模仿上述步驟逐步推理]
```

### 2. Zero-shot CoT (零樣本思維鏈)
- **開創論文**：Kojima et al., NeurIPS 2022 - 《Large Language Models are Zero-Shot Reasoners》
- **神奇口訣**：在使用者提問最後加上 **"Let's think step by step"（讓我們一步一步思考）**。
- **效果**：即使不給任何範例，大模型也會自動觸發內部隱含的步驟推理機制，GSM8K 數學題準確率立即從 17.7% 暴增至 78.7%！

---

## 📝 iPAS 考試必背重點
1. **湧現能力（Emergent Ability）**：CoT 只在模型參數量突破一定規模（通常為 100B 參數以上）時才會顯著湧現，小型模型即便下達 CoT 提示也容易產生無效的中間推論。
2. **自我一致性（Self-Consistency）**：
   - 採樣多條不同的推理路徑（例如將 Temperature 設為 0.7 採樣 5 次），最終對答案進行投票取「眾數」。此手法可進一步大幅提升複雜題目的穩定度。
3. **衍生技術**：ToT (Tree of Thoughts 思維樹 - 具備回溯評估能力)、GoT (Graph of Thoughts 思維圖)。

---

## 💡 考前 10 秒速記口訣
> **「一步一步想清楚，中間步驟當階梯；小模無感大模靈，複雜推理奪高分。」**
