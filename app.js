// 全真模擬考與題庫核心邏輯
let examQuestions = [];
let userAnswers = {}; // { qId: ["A"] }
let isSubmitted = false;
let lastWrongQuestions = [];

// 初始化：載入本地 questions.json 題庫
async function initExam() {
  try {
    const res = await fetch("questions.json");
    examQuestions = await res.json();
  } catch (err) {
    console.log("讀取本地題庫異常，載入備用題庫");
  }
  restartExam();
  updateKeyStatus();
}

// 重新開始全真模擬考
function restartExam() {
  isSubmitted = false;
  userAnswers = {};
  document.getElementById("scoreReportCard").classList.add("hidden");
  document.getElementById("submitBar").classList.remove("hidden");
  document.getElementById("totalExamCount").innerText = examQuestions.length;
  updateAnsweredCount();
  renderExamQuestions();
  window.scrollTo({ top: 0, behavior: "smooth" });
}

// 渲染考卷所有題目
function renderExamQuestions() {
  const container = document.getElementById("examContainer");
  container.innerHTML = "";

  examQuestions.forEach((q, idx) => {
    const card = document.createElement("div");
    card.id = `qCard-${q.id}`;
    card.className = "bg-white border border-slate-200 rounded-2xl p-5 shadow-xs transition";

    const isMulti = q.type === "multiple" || q.answer.length > 1;
    const inputType = isMulti ? "checkbox" : "radio";
    const userSelected = userAnswers[q.id] || [];

    let optionsHtml = Object.entries(q.options).map(([optKey, optVal]) => {
      const isChecked = userSelected.includes(optKey);
      let optStyle = "border-slate-200 hover:bg-slate-50";

      // 交卷後的答案對照樣式（綠對紅錯）
      if (isSubmitted) {
        const isCorrectOpt = q.answer.includes(optKey);
        if (isCorrectOpt) {
          optStyle = "bg-emerald-50 border-emerald-500 text-emerald-950 font-bold";
        } else if (isChecked && !isCorrectOpt) {
          optStyle = "bg-rose-50 border-rose-500 text-rose-950 line-through";
        }
      }

      return `
        <label class="flex items-start p-3 border rounded-xl cursor-pointer transition ${optStyle}">
          <input type="${inputType}" name="exam-q-${q.id}" value="${optKey}" 
            ${isChecked ? "checked" : ""} 
            ${isSubmitted ? "disabled" : ""}
            onchange="handleSelectOption('${q.id}', '${optKey}', ${isMulti})"
            class="mt-0.5 text-indigo-600 focus:ring-indigo-500 rounded border-slate-300">
          <span class="ml-3 text-xs leading-relaxed">
            <strong class="mr-1">${optKey}.</strong> ${optVal}
            ${isSubmitted && q.answer.includes(optKey) ? " <span class='text-emerald-600 ml-1 font-bold'>✓ 正確答案</span>" : ""}
            ${isSubmitted && isChecked && !q.answer.includes(optKey) ? " <span class='text-rose-600 ml-1 font-bold'>✗ 你的選擇</span>" : ""}
          </span>
        </label>
      `;
    }).join("");

    card.innerHTML = `
      <div class="flex items-center justify-between text-xs text-slate-400 mb-2">
        <span class="bg-indigo-50 text-indigo-700 font-bold px-2 py-0.5 rounded">第 ${idx + 1} 題 · ${q.subject || '考題'}</span>
        <span>${isMulti ? '【多選題】' : '【單選題】'} · ${q.category || ''}</span>
      </div>

      <p class="text-sm font-medium text-slate-900 mb-4 leading-normal">${q.question}</p>
      <div class="space-y-2 mb-3">${optionsHtml}</div>

      <!-- 交卷後才顯示的解析與論文出處 -->
      <div id="feedback-${q.id}" class="${isSubmitted ? '' : 'hidden'} mt-4 pt-3 border-t border-slate-100 space-y-2 text-xs">
        <div class="p-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 leading-relaxed">
          <span class="font-bold block text-slate-900 mb-1">💡 官方詳解：</span>
          ${q.explanation || '暫無解析'}
        </div>
        ${q.paper ? `
        <div class="p-2.5 bg-indigo-50/60 border border-indigo-100 rounded-xl text-indigo-900 leading-relaxed text-[11px]">
          <span class="font-bold">📜 權威學術出處 / 規範：</span>${q.paper}
        </div>` : ''}
        <div class="text-right pt-1">
          <button onclick="askQuestionAI('${q.id}')" class="text-indigo-600 hover:underline text-xs font-semibold">
            ✨ 請 AI 助教深入白話解說這題
          </button>
        </div>
        <div id="aiReply-${q.id}" class="hidden p-3 bg-indigo-50 border border-indigo-200 rounded-xl text-indigo-950 whitespace-pre-wrap leading-relaxed text-xs"></div>
      </div>
    `;

    container.appendChild(card);
  });
}

// 記錄作答
function handleSelectOption(qId, optKey, isMulti) {
  if (isSubmitted) return;

  if (isMulti) {
    if (!userAnswers[qId]) userAnswers[qId] = [];
    const idx = userAnswers[qId].indexOf(optKey);
    if (idx > -1) userAnswers[qId].splice(idx, 1);
    else userAnswers[qId].push(optKey);
  } else {
    userAnswers[qId] = [optKey];
  }

  updateAnsweredCount();
}

function updateAnsweredCount() {
  const answered = Object.values(userAnswers).filter(ans => ans.length > 0).length;
  document.getElementById("answeredCount").innerText = answered;
}

// 交卷計算成績
function submitExam() {
  const answered = Object.values(userAnswers).filter(ans => ans.length > 0).length;
  const total = examQuestions.length;

  if (answered < total) {
    if (!confirm(`您還有 ${total - answered} 題尚未作答，確定現在交卷嗎？`)) {
      return;
    }
  }

  isSubmitted = true;
  document.getElementById("submitBar").classList.add("hidden");

  let correctCount = 0;
  lastWrongQuestions = [];

  examQuestions.forEach(q => {
    const userSelected = (userAnswers[q.id] || []).sort();
    const correctAns = [...q.answer].sort();
    const isCorrect = JSON.stringify(userSelected) === JSON.stringify(correctAns);

    if (isCorrect) {
      correctCount++;
    } else {
      lastWrongQuestions.push(q);
    }
  });

  const wrongCount = total - correctCount;
  const score = Math.round((correctCount / total) * 100);
  const isPassed = score >= 70;

  // 顯示分數看板
  const card = document.getElementById("scoreReportCard");
  card.classList.remove("hidden");
  document.getElementById("resTotal").innerText = total;
  document.getElementById("resCorrect").innerText = correctCount;
  document.getElementById("resWrong").innerText = wrongCount;
  document.getElementById("resScore").innerText = `${score}分`;

  const title = document.getElementById("resultTitle");
  if (isPassed) {
    title.className = "text-lg font-bold text-emerald-600";
    title.innerText = `🎉 恭喜及格！成績：${score} 分（及格標準 70 分）`;
  } else {
    title.className = "text-lg font-bold text-rose-600";
    title.innerText = ` 測驗未達標準。成績：${score} 分（及格標準 70 分）`;
  }

  // 是否顯示只重練錯題按鈕
  const btnRetry = document.getElementById("btnRetryWrong");
  if (wrongCount > 0) btnRetry.classList.remove("hidden");
  else btnRetry.classList.add("hidden");

  // 自動記錄到永久錯題本
  try {
    let savedWrong = JSON.parse(localStorage.getItem("IPAS_WRONG_QUESTIONS") || "[]");
    lastWrongQuestions.forEach(wq => {
      if (!savedWrong.some(item => item.id === wq.id)) savedWrong.push(wq);
    });
    localStorage.setItem("IPAS_WRONG_QUESTIONS", JSON.stringify(savedWrong));
  } catch(e) {}

  // 切換整份試卷為檢討模式
  renderExamQuestions();
  window.scrollTo({ top: 0, behavior: "smooth" });
}

// 只重練本次做錯的題目
function retryWrongOnly() {
  if (lastWrongQuestions.length === 0) return;
  examQuestions = [...lastWrongQuestions];
  restartExam();
}

// 一鍵載入官方 790 題歷屆
async function loadOfficial790() {
  if (!confirm("確定要載入官方 790 題題庫並抽取 50 題進行全真模擬考嗎？")) return;

  try {
    const res = await fetch("https://yazelin.github.io/ipas-ai-quiz/questions.json");
    const data = await res.json();
    const rawList = data.questions || data;

    const letters = ["A", "B", "C", "D", "E"];
    const all790 = rawList.map((raw, idx) => {
      let opts = {};
      if (Array.isArray(raw.options)) {
        raw.options.forEach((opt, i) => { opts[letters[i]] = opt; });
      } else {
        opts = raw.options || {};
      }
      let ans = [];
      if (typeof raw.answer === "number") ans = [letters[raw.answer]];
      else if (Array.isArray(raw.answer)) ans = raw.answer.map(a => typeof a === "number" ? letters[a] : a);
      else if (typeof raw.answer === "string") ans = [raw.answer.trim().toUpperCase()];

      return {
        id: raw.id || `Q-${idx + 1}`,
        subject: raw.level || raw.subject || "初級",
        category: raw.category || raw.topic || "歷屆試題",
        type: ans.length > 1 ? "multiple" : "single",
        question: raw.question,
        options: opts,
        answer: ans,
        explanation: raw.explanation || "暫無官方解析。",
        paper: "經濟部 iPAS 官方能力鑑定公告試題"
      };
    });

    examQuestions = all790.sort(() => 0.5 - Math.random()).slice(0, 50);
    alert(`成功載入！已為您抽出 50 題模擬試題，開始作答！`);
    restartExam();
  } catch(err) {
    alert("載入官方題庫失敗，請確認網路連線。");
  }
}

// AI 助教
async function askQuestionAI(qId) {
  let apiKey = null;
  try { apiKey = localStorage.getItem("GEMINI_API_KEY"); } catch(e) {}
  if (!apiKey) {
    openKeyModal();
    return;
  }

  const q = examQuestions.find(item => item.id === qId);
  const box = document.getElementById(`aiReply-${qId}`);
  box.classList.remove("hidden");
  box.innerText = "正在聯網向 Gemini AI 檢索論文與深入解析...";

  const prompt = `你是 iPAS AI 應用規劃師考試助教。請用白話好懂的方式解說此題：
題目：${q.question}
選項：${JSON.stringify(q.options)}
正確答案：${q.answer.join(", ")}
請包含：
1. 核心觀念生活化比喻
2. 開創性學術論文出處（作者、年份）
3. 考前直覺判斷口訣`;

  try {
    const res = await callGemini(prompt, apiKey);
    box.innerText = res;
  } catch(e) {
    box.innerText = "連線失敗，請檢查 API Key。";
  }
}

async function callGemini(promptText, apiKey) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;
  const payload = {
    contents: [{ parts: [{ text: promptText }] }],
    tools: [{ googleSearch: {} }]
  };

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });
  const data = await res.json();
  if (data.candidates && data.candidates[0].content.parts[0].text) {
    return data.candidates[0].content.parts[0].text;
  }
  throw new Error("無法取得回答");
}

function toggleChat() {
  document.getElementById("chatDrawer").classList.toggle("hidden");
}

async function sendChat() {
  const input = document.getElementById("chatInput");
  const text = input.value.trim();
  if (!text) return;
  let apiKey = null;
  try { apiKey = localStorage.getItem("GEMINI_API_KEY"); } catch(e) {}
  if (!apiKey) {
    openKeyModal();
    return;
  }

  const box = document.getElementById("chatMessages");
  box.innerHTML += `<div class="p-2 bg-indigo-600 text-white rounded-xl text-right">${text}</div>`;
  input.value = "";

  const loadingId = "loading-" + Date.now();
  box.innerHTML += `<div id="${loadingId}" class="p-2 bg-white border rounded-xl text-slate-500">正在聯網思考中...</div>`;
  box.scrollTop = box.scrollHeight;

  try {
    const reply = await callGemini(text, apiKey);
    document.getElementById(loadingId).innerText = reply;
  } catch(e) {
    document.getElementById(loadingId).innerText = "連線失敗，請檢查 API Key。";
  }
  box.scrollTop = box.scrollHeight;
}

function openKeyModal() { document.getElementById("keyModal").classList.remove("hidden"); }
function closeKeyModal() { document.getElementById("keyModal").classList.add("hidden"); }
function saveKey() {
  const key = document.getElementById("apiKeyInput").value.trim();
  if (key) {
    try { localStorage.setItem("GEMINI_API_KEY", key); } catch(e) {}
    updateKeyStatus();
  }
  closeKeyModal();
}
function updateKeyStatus() {
  let key = null;
  try { key = localStorage.getItem("GEMINI_API_KEY"); } catch(e) {}
  const txt = document.getElementById("keyStatusText");
  if (key && txt) txt.innerText = "已啟用";
}

window.onload = initExam;
