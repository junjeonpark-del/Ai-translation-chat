import { initializeApp } from "https://www.gstatic.com/firebasejs/12.11.0/firebase-app.js";
import {
  getDatabase,
  ref,
  push,
  onValue,
  set,
  update
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
const roomIndexRef = ref(db, "roomIndex");

// ===============================
// 3. 页面元素
// ===============================
const roleSelect = document.getElementById("roleSelect");
const nameInput = document.getElementById("nameInput");
const roomNameInput = document.getElementById("roomNameInput");
const roomCategoryInput = document.getElementById("roomCategoryInput");
const createRoomBtn = document.getElementById("createRoomBtn");
const roomList = document.getElementById("roomList");
const targetLanguage = document.getElementById("targetLanguage");

const currentRole = document.getElementById("currentRole");
const currentName = document.getElementById("currentName");
const currentSourceLang = document.getElementById("currentSourceLang");
const currentTargetLang = document.getElementById("currentTargetLang");

const onlineStaffList = document.getElementById("onlineStaffList");
const onlineCountBadge = document.getElementById("onlineCountBadge");
const roomTitle = document.getElementById("roomTitle");
const roomSubtitle = document.getElementById("roomSubtitle");
const roomIdBadge = document.getElementById("roomIdBadge");
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

let currentUser = {
  id: "",
  role: "",
  name: "",
  targetLang: "zh",
  entered: false
};

let currentRoomId = null;
let currentRoomInfo = null;
let currentRoomMemberRef = null;

function saveUserToLocal() {
  localStorage.setItem("consult_user", JSON.stringify({
    id: currentUser.id,
    role: currentUser.role,
    name: currentUser.name,
    targetLang: currentUser.targetLang
  }));
}

function loadUserFromLocal() {
  const raw = localStorage.getItem("consult_user");
  if (!raw) return;

  try {
    const saved = JSON.parse(raw);
    currentUser = {
      id: saved.id || "",
      role: saved.role || "",
      name: saved.name || "",
      targetLang: saved.targetLang || "zh",
      entered: false
    };

    roleSelect.value = currentUser.role || "student";
    nameInput.value = currentUser.name || "";
    targetLanguage.value = currentUser.targetLang || "zh";
  } catch (e) {
    console.error("读取本地身份信息失败", e);
  }
}
let messages = [];
let members = [];

// ===============================
// 5. UI
// ===============================
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
    const isMine = message.senderId && currentUser.id && message.senderId === currentUser.id;
    card.className = `message-card ${isMine ? "staff" : "student"}`;

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

  currentName.textContent = currentUser.name || "未进入";
  currentSourceLang.textContent = "自动识别";
  currentTargetLang.textContent = currentUser.targetLang ? languageMap[currentUser.targetLang] : "-";
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
  if (!currentRoomId) {
    throw new Error("请先进入房间");
  }

  const currentRoomRef = ref(db, `rooms/${currentRoomId}/messages`);
  await push(currentRoomRef, messageObj);
}

function listenMessagesForRoom(roomId) {
  const currentRoomRef = ref(db, `rooms/${roomId}/messages`);

  onValue(currentRoomRef, snapshot => {
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
  senderId: "system_staff_auto_reply",
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
// 9. 创建房间
// ===============================
async function createRoom() {
  const roomName = roomNameInput.value.trim();
  const roomCategory = roomCategoryInput.value.trim();

  if (!roomName) {
    alert("请输入房间名称");
    return;
  }

  const roomId = "room_" + Date.now();

  await set(ref(db, `rooms/${roomId}/info`), {
    name: roomName,
    category: roomCategory || "未分类",
    createdBy: currentUser.name || "unknown",
    createdAt: Date.now()
  });

  await set(ref(db, `roomIndex/${roomId}`), {
    name: roomName,
    category: roomCategory || "未分类",
    createdAt: Date.now()
  });

  roomNameInput.value = "";
  roomCategoryInput.value = "";
}

// ===============================
// 10. 房间列表监听
// ===============================
function listenRoomList() {
  onValue(roomIndexRef, snapshot => {
    const data = snapshot.val() || {};
    roomList.innerHTML = "";

    Object.keys(data).forEach(roomId => {
      const room = data[roomId];
      const item = document.createElement("div");
      item.className = "staff-item";
      item.style.cursor = "pointer";
      item.innerHTML = `
        <div>
          <div><strong>${escapeHtml(room.name)}</strong></div>
          <div>${escapeHtml(room.category || "")}</div>
        </div>
        <span class="online-badge">进入</span>
      `;

item.addEventListener("click", () => {
  joinRoom(roomId, room);
});

      roomList.appendChild(item);
    });
  });
}

// ===============================
// 10. 进入房间函数
// ===============================
async function joinRoom(roomId, roomInfo = {}) {
  const name = nameInput.value.trim();

  if (!name) {
    alert("请先输入姓名");
    return;
  }

  // 如果之前已经在别的房间，先把旧房间中的自己标记离线
  if (currentRoomId && currentUser.id && currentRoomId !== roomId) {
    await markCurrentUserOffline();
    function startPresenceHeartbeat() {
    setInterval(async () => {
    if (!currentRoomId || !currentUser.id) return;

    try {
      await update(ref(db, `rooms/${currentRoomId}/members/${currentUser.id}`), {
        online: true,
        lastActiveAt: Date.now()
      });
    } catch (e) {
      console.error("心跳更新失败", e);
    }
  }, 30000); // 每30秒更新一次
 }
}
  currentUser = {
    id: currentUser.id || localStorage.getItem("consult_user_id") || ("user_" + Date.now()),
    role: roleSelect.value,
    name,
    targetLang: targetLanguage.value,
    entered: true
  };

  localStorage.setItem("consult_user_id", currentUser.id);
  saveUserToLocal();

  currentRoomId = roomId;
  currentRoomInfo = roomInfo;
  updateCurrentRoomInfo(roomId, roomInfo);

  await set(ref(db, `rooms/${roomId}/members/${currentUser.id}`), {
  name: currentUser.name,
  role: currentUser.role,
  targetLang: currentUser.targetLang,
  online: true,
  joinedAt: Date.now(),
  lastActiveAt: Date.now()
});
  currentRoomMemberRef = ref(db, `rooms/${roomId}/members/${currentUser.id}`);
  listenMessagesForRoom(roomId);
  listenMembersForRoom(roomId);
  async function markCurrentUserOffline() {
  if (!currentRoomId || !currentUser.id) return;

  try {
    await update(ref(db, `rooms/${currentRoomId}/members/${currentUser.id}`), {
      online: false
    });
  } catch (e) {
    console.error("标记离线失败", e);
  }
}

  updateCurrentUserInfo();
  renderMessages();
  alert("已进入房间");
}
// ===============================
// 10. 房间监听成员
// ===============================
function listenMembersForRoom(roomId) {
  const memberRef = ref(db, `rooms/${roomId}/members`);

  onValue(memberRef, snapshot => {
    const data = snapshot.val() || {};
    members = Object.keys(data).map(key => ({
      id: key,
      ...data[key]
    }));
    renderOnlineStaffReal();
  });
}
// ===============================
// 10. 真实在线老师与学生渲染函数
// ===============================
function renderOnlineStaffReal() {
  onlineStaffList.innerHTML = "";

  const now = Date.now();
  const ACTIVE_LIMIT = 2 * 60 * 1000; // 2分钟内算在线

  const activeMembers = members.filter(member => {
    const lastActiveAt = member.lastActiveAt || member.joinedAt || 0;
    return member.online === true && (now - lastActiveAt < ACTIVE_LIMIT);
  });

  const onlineStaff = activeMembers.filter(member => member.role === "staff");
  const onlineStudents = activeMembers.filter(member => member.role === "student");

  onlineCountBadge.textContent = `老师 ${onlineStaff.length} 人 / 学生 ${onlineStudents.length} 人`;

  if (!onlineStaff.length) {
    onlineStaffList.innerHTML = `
      <div style="padding:10px; color:#64748b;">当前没有在线老师</div>
    `;
    return;
  }

  onlineStaff.forEach(staff => {
    const item = document.createElement("div");
    item.className = "staff-item";
    item.innerHTML = `
      <div class="staff-left">
        <div class="avatar">${staff.name?.charAt(0) || "教"}</div>
        <div>
          <div><strong>${escapeHtml(staff.name || "")}</strong></div>
          <div>${languageMap[staff.targetLang] || ""}</div>
        </div>
      </div>
      <span class="online-badge">在线</span>
    `;
    onlineStaffList.appendChild(item);
  });
}
function updateCurrentRoomInfo(roomId, roomInfo = {}) {
  roomTitle.textContent = roomInfo.name || "未进入房间";
  roomSubtitle.textContent = roomInfo.category
    ? `房间分类：${roomInfo.category}`
    : "请选择左侧房间进入咨询";
  roomIdBadge.textContent = roomInfo.name
    ? `当前房间：${roomInfo.name}`
    : "当前房间：-";
}

// ===============================
// 10. 语言自动识别
// ===============================
async function detectLanguage(text) {
  const prompt = `
Identify the language of the user's message.
Return only one code from this list:
zh
ko
en
uz
mn

Rules:
1. Output only the code.
2. No explanation.
3. No punctuation.
4. No extra words.
`;

  const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${GROQ_API_KEY}`
    },
    body: JSON.stringify({
      model: GROQ_MODEL,
      temperature: 0,
      messages: [
        { role: "system", content: prompt },
        { role: "user", content: text }
      ]
    })
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`语言识别失败：${response.status} ${errText}`);
  }

  const data = await response.json();
  let lang = data.choices?.[0]?.message?.content?.trim().toLowerCase() || "";

  // 清洗返回内容，防止出现 "ko."、"Korean"、"The answer is ko"
  lang = lang.replace(/[^a-z]/g, "");

  if (lang.includes("korean")) lang = "ko";
  if (lang.includes("chinese")) lang = "zh";
  if (lang.includes("english")) lang = "en";
  if (lang.includes("uzbek")) lang = "uz";
  if (lang.includes("mongolian")) lang = "mn";

  return ["zh", "ko", "en", "uz", "mn"].includes(lang) ? lang : "zh";
}

// ===============================
// 10. 事件
// ===============================

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
  const detectedLang = await detectLanguage(text);
console.log("detectedLang =", detectedLang, "text =", text);

const newMessage = {
  senderId: currentUser.id,
  senderName: currentUser.name,
  senderRole: currentUser.role,
  originalText: text,
  originalLanguage: detectedLang,
  translations: await buildTranslations(text, detectedLang),
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

targetLanguage.addEventListener("change", async () => {
  currentUser.targetLang = targetLanguage.value;
  saveUserToLocal();
  updateCurrentUserInfo();
  renderMessages();

  if (currentRoomId && currentUser.id) {
    await update(ref(db, `rooms/${currentRoomId}/members/${currentUser.id}`), {
      targetLang: currentUser.targetLang
    });
  }
});

roleSelect.addEventListener("change", () => {
  currentUser.role = roleSelect.value;
  saveUserToLocal();
  updateCurrentUserInfo();
});

nameInput.addEventListener("input", () => {
  currentUser.name = nameInput.value.trim();
  saveUserToLocal();
  updateCurrentUserInfo();
});

// ===============================
// 11. 启动
// ===============================
window.addEventListener("beforeunload", () => {
  if (currentRoomId && currentUser.id) {
    navigator.sendBeacon?.(
      `${firebaseConfig.databaseURL}rooms/${currentRoomId}/members/${currentUser.id}.json`,
      JSON.stringify({
        name: currentUser.name,
        role: currentUser.role,
        targetLang: currentUser.targetLang,
        online: false,
        joinedAt: Date.now()
      })
    );
  }
});

loadUserFromLocal();
updateCurrentUserInfo();
listenRoomList();
renderMessages();
startPresenceHeartbeat();

createRoomBtn.addEventListener("click", createRoom);
