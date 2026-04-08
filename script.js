import { initializeApp } from "https://www.gstatic.com/firebasejs/12.11.0/firebase-app.js";
import {
  getDatabase,
  ref,
  push,
  onValue
} from "https://www.gstatic.com/firebasejs/12.11.0/firebase-database.js";

// ===============================
// 1. Groq 配置（测试版直连）
// ===============================
const GROQ_API_KEY = "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";
const GROQ_MODEL = "llama-3.3-70b-versatile";

// ===============================
// 2. Firebase 配置
// ===============================
const firebaseConfig = {
  apiKey: "AIzaSyBGn0IIF1utHHMZO96g184HemIzPsxlGBQ",
  authDomain: "halla-fixed-room-web.firebaseapp.com",
  databaseURL: "https://halla-fixed-room-web-default-rtdb.asia-southeast1.firebasedatabase.app/",
  projectId: "halla-fixed-room-web",
  storageBucket: "halla-fixed-room-web.firebasestorage.app",
  messagingSenderId: "758520054633",
  appId: "1:758520054633:web:ad8cd8d42b34c5feb1b3f8",
  measurementId: "G-SYX9VK3L4W"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
const roomRef = ref(db, "rooms/HANLA-001/messages");

// ===============================
// 3. 页面元素
// ===============================
const roleSelect = document.getElementById("roleSelect");
const nameInput = document.getElementById("nameInput");
const sourceLanguage = document.getElementById("sourceLanguage");
const targetLanguage = document.getElementById("targetLanguage");
const enterRoomBtn = document.getElementById("enterRoomBtn");

const currentRole = document.getElementById("currentRole");
const currentName = document.getElementById("currentName");
const currentSourceLang = document.getElementById("currentSourceLang");
const currentTargetLang = document.getElementById("currentTargetLang");

const onlineStaffList = document.getElementById("onlineStaffList");
const onlineCountBadge = document.getElementById("onlineCountBadge");

const chatMessages = document.getElementById("chatMessages");
const messageInput = document.getElementById("messageInput");
const sendBtn = document.getElementById("sendBtn");
const displayLanguageLabel = document.getElementById("displayLanguageLabel");

const quickButtons = document.querySelectorAll(".quick-btn");

// ===============================
// 4. 基础数据
// ===============================
const languageMap = {
  zh: "中文",
  ko: "한국어",
  en: "English",
  uz: "Oʻzbekcha",
  mn: "Монгол"
};

const languageNameMap = {
  zh: "Chinese",
  ko: "Korean",
  en: "English",
  uz: "Uzbek",
  mn: "Mongolian"
};

const mockStaff = [
  { id: 1, name: "李老师", lang: "zh", online: true },
  { id: 2, name: "김선생님", lang: "ko", online: true },
  { id: 3, name: "John", lang: "en", online: true }
];

let currentUser = {
  role: "",
  name: "",
  sourceLang: "zh",
  targetLang: "zh",
  entered: false
};

let messages = [];

// ===============================
// 5. UI
// ===============================
function renderOnlineStaff() {
  onlineStaffList.innerHTML = "";
  const onlineOnly = mockStaff.filter(staff => staff.online);
  onlineCountBadge.textContent = `在线老师 ${onlineOnly.length} 人`;

  onlineOnly.forEach(staff => {
    const item = document.createElement("div");
    item.className = "staff-item";
    item.innerHTML = `
      <div class="staff-left">
        <div class="avatar">${staff.name.charAt(0)}</div>
        <div>
          <div><strong>${staff.name}</strong></div>
          <div>${languageMap[staff.lang]}</div>
        </div>
      </div>
      <span class="online-badge">在线</span>
    `;
    onlineStaffList.appendChild(item);
  });
}

function escapeHtml(str) {
  const div = document.createElement("div");
  div.textContent = str ?? "";
  return div.innerHTML;
}

function getDisplayedText(message) {
  const lang = currentUser.targetLang || "zh";
  if (message.translations && message.translations[lang]) {
    return message.translations[lang];
  }
  return message.originalText || "";
}

function renderMessages() {
  chatMessages.innerHTML = "";

  messages.forEach(message => {
    const card = document.createElement("div");
    card.className = `message-card ${message.senderRole || "student"}`;

    const roleText = message.senderRole === "staff" ? "STAFF" : "STUDENT";
    const displayedText = getDisplayedText(message);

    card.innerHTML = `
      <div class="message-top">
        <span class="message-name">${escapeHtml(message.senderName || "匿名")}</span>
        <span class="role-tag">${roleText}</span>
        <span class="message-time">${escapeHtml(message.time || "")}</span>
      </div>
      <div class="message-text">${escapeHtml(displayedText)}</div>
      <div class="message-original">
        原文（${languageMap[message.originalLanguage] || message.originalLanguage || "-"}）：
        ${escapeHtml(message.originalText || "")}
      </div>
    `;

    chatMessages.appendChild(card);
  });

  chatMessages.scrollTop = chatMessages.scrollHeight;
}

function updateCurrentUserInfo() {
  currentRole.textContent = currentUser.entered
    ? (currentUser.role === "staff" ? "老师 Staff" : "学生 Student")
    : "未进入";

  currentName.textContent = currentUser.entered ? currentUser.name : "未进入";
  currentSourceLang.textContent = currentUser.entered ? languageMap[currentUser.sourceLang] : "-";
  currentTargetLang.textContent = currentUser.entered ? languageMap[currentUser.targetLang] : "-";
  displayLanguageLabel.textContent = languageMap[currentUser.targetLang] || "中文";
}

function getCurrentTime() {
  const now = new Date();
  const hh = String(now.getHours()).padStart(2, "0");
  const mm = String(now.getMinutes()).padStart(2, "0");
  return `${hh}:${mm}`;
}

// ===============================
// 6. Groq 翻译
// ===============================
async function translateSingle(text, sourceLang, targetLang) {
  if (sourceLang === targetLang) return text;

  const prompt = `
You are a precise translation engine.
Translate the user's message from ${languageNameMap[sourceLang] || sourceLang} to ${languageNameMap[targetLang] || targetLang}.

Rules:
1. Only output the translated text.
2. Do not explain.
3. Keep names, numbers, and school terms accurate.
4. Keep the tone natural and polite.
`;

  const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${GROQ_API_KEY}`
    },
    body: JSON.stringify({
      model: GROQ_MODEL,
      temperature: 0.2,
      messages: [
        { role: "system", content: prompt },
        { role: "user", content: text }
      ]
    })
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Groq 请求失败：${response.status} ${errText}`);
  }

  const data = await response.json();
  return data.choices?.[0]?.message?.content?.trim() || text;
}

async function buildTranslations(text, sourceLang) {
  const langs = ["zh", "ko", "en", "uz", "mn"];
  const result = {};

  for (const lang of langs) {
    try {
      result[lang] = await translateSingle(text, sourceLang, lang);
    } catch (error) {
      console.error(`翻译 ${lang} 失败`, error);
      result[lang] = text;
    }
  }

  return result;
}

// ===============================
// 7. Firebase 读写
// ===============================
async function sendMessageToFirebase(messageObj) {
  await push(roomRef, messageObj);
}

function listenMessages() {
  onValue(roomRef, snapshot => {
    const data = snapshot.val();

    if (!data) {
      messages = [];
      renderMessages();
      return;
    }

    messages = Object.keys(data)
      .map(key => ({
        id: key,
        ...data[key]
      }))
      .sort((a, b) => (a.createdAt || 0) - (b.createdAt || 0));

    renderMessages();
  });
}

// ===============================
// 8. 自动回复
// ===============================
async function autoReplyForStudent() {
  const text = "您好，已收到您的咨询，我们会尽快为您解答。";

  const autoReply = {
    senderName: "国际处值班老师",
    senderRole: "staff",
    originalText: text,
    originalLanguage: "zh",
    translations: await buildTranslations(text, "zh"),
    time: getCurrentTime(),
    createdAt: Date.now()
  };

  await sendMessageToFirebase(autoReply);
}

// ===============================
// 9. 事件
// ===============================
enterRoomBtn.addEventListener("click", () => {
  const name = nameInput.value.trim();

  if (!name) {
    alert("请输入姓名或昵称。");
    return;
  }

  currentUser = {
    role: roleSelect.value,
    name,
    sourceLang: sourceLanguage.value,
    targetLang: targetLanguage.value,
    entered: true
  };

  updateCurrentUserInfo();
  renderMessages();
  alert("已进入固定咨询房间。");
});

sendBtn.addEventListener("click", async () => {
  if (!currentUser.entered) {
    alert("请先进入咨询室。");
    return;
  }

  const text = messageInput.value.trim();
  if (!text) {
    alert("请输入消息内容。");
    return;
  }

  sendBtn.disabled = true;
  sendBtn.textContent = "翻译中...";

  try {
    const newMessage = {
      senderName: currentUser.name,
      senderRole: currentUser.role,
      originalText: text,
      originalLanguage: currentUser.sourceLang,
      translations: await buildTranslations(text, currentUser.sourceLang),
      time: getCurrentTime(),
      createdAt: Date.now()
    };

    await sendMessageToFirebase(newMessage);
    messageInput.value = "";

    if (currentUser.role === "student") {
      setTimeout(() => {
        autoReplyForStudent().catch(console.error);
      }, 800);
    }
  } catch (error) {
    console.error(error);
    alert(error.message || "发送失败");
  } finally {
    sendBtn.disabled = false;
    sendBtn.textContent = "发送消息";
  }
});

quickButtons.forEach(button => {
  button.addEventListener("click", () => {
    messageInput.value = button.dataset.text;
    messageInput.focus();
  });
});

// ===============================
// 10. 启动
// ===============================
renderOnlineStaff();
updateCurrentUserInfo();
listenMessages();
