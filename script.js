import { initializeApp } from "https://www.gstatic.com/firebasejs/12.11.0/firebase-app.js";
import {
  getDatabase,
  ref,
  push,
  onValue,
  set,
  update,
  onDisconnect,
  get
} from "https://www.gstatic.com/firebasejs/12.11.0/firebase-database.js";

// ===============================
// 1. 后端接口地址
// ===============================
const API_BASE_URL = "/api";

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
const studentNameBox = document.getElementById("studentNameBox");
const roomNameInput = document.getElementById("roomNameInput");
const roomCategoryInput = document.getElementById("roomCategoryInput");
const createRoomBtn = document.getElementById("createRoomBtn");
const roomList = document.getElementById("roomList");
const targetLanguage = document.getElementById("targetLanguage");
const staffLoginBox = document.getElementById("staffLoginBox");
const staffUsernameInput = document.getElementById("staffUsernameInput");
const staffPasswordInput = document.getElementById("staffPasswordInput");

const adminPanel = document.getElementById("adminPanel");
const adminStaffUsernameInput = document.getElementById("adminStaffUsernameInput");
const adminStaffPasswordInput = document.getElementById("adminStaffPasswordInput");
const adminStaffNameInput = document.getElementById("adminStaffNameInput");
const saveStaffAccountBtn = document.getElementById("saveStaffAccountBtn");
const staffAccountList = document.getElementById("staffAccountList");

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
const uiLanguageSelect = document.getElementById("uiLanguageSelect");
const mobileSidebarToggle = document.getElementById("mobileSidebarToggle");
const sidebar = document.getElementById("sidebar");

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
const uiText = {
  zh: {
    appTitle: "International Student Support Room",
    appSubtitle: "国际学生固定咨询室 · 외국인 유학생 고정 상담실",
    createRoomTitle: "创建房间",
    roomNameLabel: "房间名称",
    roomCategoryLabel: "房间分类",
    roomListTitle: "房间列表",
    enterRoomTitle: "进入咨询室",
    roleLabel: "身份",
    nameLabel: "姓名 / 昵称",
    targetLangLabel: "接收语言",
    currentUserTitle: "当前身份",
    onlineStaffTitle: "当前在线老师",
    quickQuestionsTitle: "快捷问题",
    createRoomBtn: "创建房间",
    sendBtn: "发送消息",
    roomStatusText: "咨询室开放中",
notInRoomTitle: "未进入房间",
notInRoomSubtitle: "请选择左侧房间进入咨询",
onlineCountText: "老师 0 人 / 学生 0 人",
currentRolePrefix: "身份：",
currentNamePrefix: "姓名：",
currentSourceLangPrefix: "发送语言：",
currentTargetLangPrefix: "接收语言：",
messagePlaceholder: "请输入消息…",
displayLanguagePrefix: "显示语言：",
quickVisa: "签证",
quickTuition: "学费奖学金",
quickTranscript: "成绩单",
quickWork: "打工规定",
quickAttendance: "出勤规定",
mobileSidebarOpen: "收起房间与身份设置",
mobileSidebarClosed: "房间与身份设置",
roomListEnter: "进入",
staffOnline: "在线",
noOnlineStaff: "当前没有在线老师",
onlineCount: (staff, student) => `老师 ${staff} 人 / 学生 ${student} 人`,
roomCategoryPrefix: "房间分类：",
currentRoomPrefix: "当前房间：",
notEntered: "未进入",
autoDetect: "自动识别",
roleStudent: "学生",
roleStaff: "老师",
roleStudentOption: "学生 Student",
roleStaffOption: "老师 Staff",
sending: "翻译中...",
enterRoomNotice: (name) => `${name} 已进入房间`,
leaveRoomNotice: (name) => `${name} 已离开房间`,
autoReplyText: "您好，已收到您的咨询，我们会尽快为您解答。",
systemSenderName: "系统通知",
dutyStaffName: "国际处值班老师",
  },
  ko: {
    appTitle: "International Student Support Room",
    appSubtitle: "외국인 유학생 고정 상담실",
    createRoomTitle: "상담실 생성",
    roomNameLabel: "상담실 이름",
    roomCategoryLabel: "상담실 분류",
    roomListTitle: "상담실 목록",
    enterRoomTitle: "상담실 입장",
    roleLabel: "신분",
    nameLabel: "이름 / 닉네임",
    targetLangLabel: "수신 언어",
    currentUserTitle: "현재 신분",
    onlineStaffTitle: "현재 온라인 교직원",
    quickQuestionsTitle: "빠른 질문",
    createRoomBtn: "상담실 생성",
    sendBtn: "메시지 보내기",
    roomStatusText: "상담실 운영 중",
notInRoomTitle: "입장한 상담실 없음",
notInRoomSubtitle: "왼쪽 상담실 목록에서 입장하세요",
onlineCountText: "교직원 0명 / 학생 0명",
currentRolePrefix: "신분：",
currentNamePrefix: "이름：",
currentSourceLangPrefix: "발신 언어：",
currentTargetLangPrefix: "수신 언어：",
messagePlaceholder: "메시지를 입력하세요…",
displayLanguagePrefix: "표시 언어：",
quickVisa: "비자",
quickTuition: "등록금/장학금",
quickTranscript: "성적표",
quickWork: "아르바이트 규정",
quickAttendance: "출석 규정",
mobileSidebarOpen: "상담실/신분 설정 접기",
mobileSidebarClosed: "상담실/신분 설정",
roomListEnter: "입장",
staffOnline: "온라인",
noOnlineStaff: "현재 온라인 교직원이 없습니다",
onlineCount: (staff, student) => `교직원 ${staff}명 / 학생 ${student}명`,
roomCategoryPrefix: "상담실 분류: ",
currentRoomPrefix: "현재 상담실: ",
notEntered: "미입장",
autoDetect: "자동 인식",
roleStudent: "학생",
roleStaff: "교직원",
roleStudentOption: "학생 Student",
roleStaffOption: "교직원 Staff",
sending: "번역 중...",
enterRoomNotice: (name) => `${name}님이 상담실에 입장했습니다`,
leaveRoomNotice: (name) => `${name}님이 상담실을 나갔습니다`,
autoReplyText: "안녕하세요. 문의가 접수되었으며, 최대한 빨리 답변드리겠습니다.",
systemSenderName: "시스템 알림",
dutyStaffName: "국제교류처 당직 교직원",
  },
  en: {
    appTitle: "International Student Support Room",
    appSubtitle: "Fixed Consultation Room for International Students",
    createRoomTitle: "Create Room",
    roomNameLabel: "Room Name",
    roomCategoryLabel: "Room Category",
    roomListTitle: "Room List",
    enterRoomTitle: "Enter Support Room",
    roleLabel: "Role",
    nameLabel: "Name / Nickname",
    targetLangLabel: "Display Language",
    currentUserTitle: "Current User",
    onlineStaffTitle: "Online Staff",
    quickQuestionsTitle: "Quick Questions",
    createRoomBtn: "Create Room",
    sendBtn: "Send Message",
    roomStatusText: "Support Room Open",
notInRoomTitle: "No Room Joined",
notInRoomSubtitle: "Please choose a room on the left to enter",
onlineCountText: "Staff 0 / Students 0",
currentRolePrefix: "Role: ",
currentNamePrefix: "Name: ",
currentSourceLangPrefix: "Source Language: ",
currentTargetLangPrefix: "Display Language: ",
messagePlaceholder: "Type your message…",
displayLanguagePrefix: "Display Language: ",
quickVisa: "Visa",
quickTuition: "Tuition & Scholarship",
quickTranscript: "Transcript",
quickWork: "Work Rules",
quickAttendance: "Attendance Rules",
mobileSidebarOpen: "Hide Room & Identity Settings",
mobileSidebarClosed: "Room & Identity Settings",
roomListEnter: "Enter",
staffOnline: "Online",
noOnlineStaff: "No staff online",
onlineCount: (staff, student) => `Staff ${staff} / Students ${student}`,
roomCategoryPrefix: "Room Category: ",
currentRoomPrefix: "Current Room: ",
notEntered: "Not Entered",
autoDetect: "Auto Detect",
roleStudent: "Student",
roleStaff: "Staff",
roleStudentOption: "Student",
roleStaffOption: "Staff",
sending: "Translating...",
enterRoomNotice: (name) => `${name} entered the room`,
leaveRoomNotice: (name) => `${name} left the room`,
autoReplyText: "Hello, we have received your inquiry and will reply as soon as possible.",
systemSenderName: "System Notice",
dutyStaffName: "International Office Staff",
  }
};

function applyUILanguage(lang) {
  const t = uiText[lang] || uiText.zh;

  const setText = (id, value) => {
    const el = document.getElementById(id);
    if (el) el.textContent = value;
  };

  setText("uiAppTitle", t.appTitle);
  setText("uiAppSubtitle", t.appSubtitle);
  setText("uiCreateRoomTitle", t.createRoomTitle);
  setText("uiRoomNameLabel", t.roomNameLabel);
  setText("uiRoomCategoryLabel", t.roomCategoryLabel);
  setText("uiRoomListTitle", t.roomListTitle);
  setText("uiEnterRoomTitle", t.enterRoomTitle);
  setText("uiRoleLabel", t.roleLabel);
  setText("uiNameLabel", t.nameLabel);
  setText("uiTargetLangLabel", t.targetLangLabel);
  setText("uiCurrentUserTitle", t.currentUserTitle);
  setText("uiOnlineStaffTitle", t.onlineStaffTitle);
  setText("uiQuickQuestionsTitle", t.quickQuestionsTitle);
  setText("createRoomBtn", t.createRoomBtn);
  setText("sendBtn", t.sendBtn);
    setText("roomStatusText", t.roomStatusText);
  setText("roomTitle", t.notInRoomTitle);
  setText("roomSubtitle", t.notInRoomSubtitle);
  setText("onlineCountBadge", t.onlineCountText);

  const nameInputEl = document.getElementById("nameInput");
  if (nameInputEl) {
    if (lang === "ko") nameInputEl.placeholder = "이름 또는 닉네임을 입력하세요";
    else if (lang === "en") nameInputEl.placeholder = "Enter your name or nickname";
    else nameInputEl.placeholder = "请输入姓名或昵称";
  }

  const roomNameInputEl = document.getElementById("roomNameInput");
  if (roomNameInputEl) {
    if (lang === "ko") roomNameInputEl.placeholder = "예: AI 전공 조교 상담실";
    else if (lang === "en") roomNameInputEl.placeholder = "e.g. AI Major Assistant Room";
    else roomNameInputEl.placeholder = "例如：AI专业助教咨询室";
  }

  const roomCategoryInputEl = document.getElementById("roomCategoryInput");
  if (roomCategoryInputEl) {
    if (lang === "ko") roomCategoryInputEl.placeholder = "예: AI / 종합 / 호텔항공";
    else if (lang === "en") roomCategoryInputEl.placeholder = "e.g. AI / General / Hotel & Aviation";
    else roomCategoryInputEl.placeholder = "例如：AI / 综合 / 酒店航空";
  }

  const messageInputEl = document.getElementById("messageInput");
  if (messageInputEl) {
    messageInputEl.placeholder = t.messagePlaceholder;
  }
setText("uiCurrentRolePrefix", t.currentRolePrefix);
setText("uiCurrentNamePrefix", t.currentNamePrefix);
setText("uiCurrentSourceLangPrefix", t.currentSourceLangPrefix);
setText("uiCurrentTargetLangPrefix", t.currentTargetLangPrefix);

  const displayTip = document.querySelector(".input-tips span");
  if (displayTip) {
    displayTip.innerHTML = `${t.displayLanguagePrefix}<strong id="displayLanguageLabel">${displayLanguageLabel.textContent}</strong>`;
  }

  if (quickButtons[0]) quickButtons[0].textContent = t.quickVisa;
  if (quickButtons[1]) quickButtons[1].textContent = t.quickTuition;
  if (quickButtons[2]) quickButtons[2].textContent = t.quickTranscript;
  if (quickButtons[3]) quickButtons[3].textContent = t.quickWork;
  if (quickButtons[4]) quickButtons[4].textContent = t.quickAttendance;

  if (mobileSidebarToggle && !sidebar.classList.contains("mobile-open")) {
    mobileSidebarToggle.textContent = t.mobileSidebarClosed;
  }
  if (mobileSidebarToggle && sidebar.classList.contains("mobile-open")) {
    mobileSidebarToggle.textContent = t.mobileSidebarOpen;
  }

  listenRoomList();
  renderOnlineStaffReal();
  updateCurrentUserInfo();

  if (currentRoomId) {
    updateCurrentRoomInfo(currentRoomId, currentRoomInfo || {});
  }
}

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
let currentSessionJoinedAt = 0;
let currentDisconnectHandler = null;
let currentStaffAccount = null;
let stopStaffAccountsListener = null;

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
let stopMessagesListener = null;
let stopMembersListener = null;
let presenceHeartbeatStarted = false;

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
    const isSystem = message.senderRole === "system";

if (isSystem) {
  card.className = "message-card system";
} else if (message.senderRole === "staff") {
  card.className = "message-card staff";
} else {
  card.className = "message-card student";
}

    const roleText =
  message.senderRole === "system"
    ? "SYSTEM"
    : message.senderRole === "staff"
    ? "STAFF"
    : "STUDENT";
    
    const displayedText = getDisplayedText(message);

card.innerHTML = `
  <div class="message-top">
    <span class="message-name">${escapeHtml(message.senderName || "匿名")}</span>
    <span class="role-tag">${roleText}</span>
    <span class="message-time">${escapeHtml(message.time || "")}</span>
  </div>
  <div class="message-text">${escapeHtml(displayedText)}</div>
  ${
    isSystem
      ? ""
      : `<div class="message-original">
          原文（${languageMap[message.originalLanguage] || message.originalLanguage || "-"}）：
          ${escapeHtml(message.originalText || "")}
        </div>`
  }
`;

    chatMessages.appendChild(card);
  });

  chatMessages.scrollTop = chatMessages.scrollHeight;
}

function updateCurrentUserInfo() {
  const currentUILang = localStorage.getItem("ui_lang") || "zh";
  const t = uiText[currentUILang] || uiText.zh;

  currentRole.textContent = currentUser.entered
    ? (currentUser.role === "staff" ? t.roleStaff : t.roleStudent)
    : t.notEntered;

  currentName.textContent = currentUser.name || t.notEntered;
  currentSourceLang.textContent = t.autoDetect;
  currentTargetLang.textContent = currentUser.targetLang ? languageMap[currentUser.targetLang] : "-";
  displayLanguageLabel.textContent = languageMap[currentUser.targetLang] || languageMap.zh;

  const roleOptions = roleSelect.querySelectorAll("option");
  if (roleOptions[0]) roleOptions[0].textContent = t.roleStudentOption;
  if (roleOptions[1]) roleOptions[1].textContent = t.roleStaffOption;
}

function getCurrentTime() {
  const now = new Date();
  const hh = String(now.getHours()).padStart(2, "0");
  const mm = String(now.getMinutes()).padStart(2, "0");
  return `${hh}:${mm}`;
}
function updateStaffLoginVisibility() {
  if (!staffLoginBox || !studentNameBox) return;

  if (roleSelect.value === "staff") {
    staffLoginBox.style.display = "block";
    studentNameBox.style.display = "none";
    if (nameInput) nameInput.value = "";
  } else {
    staffLoginBox.style.display = "none";
    studentNameBox.style.display = "block";
    if (staffUsernameInput) staffUsernameInput.value = "";
    if (staffPasswordInput) staffPasswordInput.value = "";
  }
}
function updateAdminPanelVisibility() {
  if (!adminPanel) return;

  if (currentUser.role === "staff" && currentStaffAccount?.isAdmin === true) {
    adminPanel.style.display = "block";
  } else {
    adminPanel.style.display = "none";
  }
}

function renderStaffAccounts(data = {}) {
  if (!staffAccountList) return;

  staffAccountList.innerHTML = "";

  Object.keys(data).forEach(username => {
    const account = data[username];
    const item = document.createElement("div");
    item.className = "staff-item";
    item.style.marginBottom = "8px";
    item.style.cursor = "pointer";

    item.innerHTML = `
      <div>
        <div><strong>${username}</strong></div>
        <div>${account.name || "-"}</div>
      </div>
      <span class="online-badge">${account.active ? "启用" : "停用"}</span>
    `;

    item.addEventListener("click", async () => {
      if (account.isAdmin === true) {
        alert("管理员账号不能停用。");
        return;
      }

      const newActive = !account.active;

      try {
        await update(ref(db, `staffAccounts/${username}`), {
          active: newActive
        });
        alert(`${username} 已${newActive ? "启用" : "停用"}。`);
      } catch (error) {
        console.error("更新老师账号状态失败", error);
        alert("更新老师账号状态失败。");
      }
    });

    staffAccountList.appendChild(item);
  });
}

function listenStaffAccounts() {
  if (!currentStaffAccount?.isAdmin) return;

  if (stopStaffAccountsListener) {
    stopStaffAccountsListener();
    stopStaffAccountsListener = null;
  }

  const staffAccountsRef = ref(db, "staffAccounts");
  stopStaffAccountsListener = onValue(staffAccountsRef, snapshot => {
    const data = snapshot.val() || {};
    renderStaffAccounts(data);
  });
}

// ===============================
// 6. Groq 翻译
// ===============================
async function validateStaffLogin() {
  const username = staffUsernameInput?.value.trim();
  const password = staffPasswordInput?.value.trim();

  if (!username || !password) {
    alert("老师身份需要输入账号和密码。");
    return false;
  }

  try {
    const staffAccountRef = ref(db, `staffAccounts/${username}`);
    const snapshot = await get(staffAccountRef);

    if (!snapshot.exists()) {
      alert("老师账号不存在。");
      return false;
    }

    const account = snapshot.val();

    if (account.active !== true) {
      alert("该老师账号未启用。");
      return false;
    }

    if (account.password !== password) {
      alert("老师账号或密码错误。");
      return false;
    }

    currentStaffAccount = {
      username,
      ...account
    };

    if (account.name && !nameInput.value.trim()) {
      nameInput.value = account.name;
    }

    updateAdminPanelVisibility();
    listenStaffAccounts();

    return true;
  } catch (error) {
    console.error("老师账号验证失败", error);
    alert("老师账号验证失败，请稍后重试。");
    return false;
  }
}

async function translateSingle(text, sourceLang, targetLang) {
  if (sourceLang === targetLang) return text;

  const response = await fetch(`${API_BASE_URL}/api/translate`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      text,
      sourceLang,
      targetLang
    })
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`翻译请求失败：${response.status} ${errText}`);
  }

  const data = await response.json();
  return data.translatedText || text;
}

async function buildTranslations(text, sourceLang) {
  const neededLangs = new Set();

  neededLangs.add(sourceLang || "zh");
  neededLangs.add(currentUser.targetLang || "zh");

  members.forEach(member => {
    if (member.online && member.targetLang) {
      neededLangs.add(member.targetLang);
    }
  });

  const langs = Array.from(neededLangs);
  const result = {};

  await Promise.all(
    langs.map(async (lang) => {
      try {
        result[lang] = await translateSingle(text, sourceLang, lang);
      } catch (error) {
        console.error(`翻译 ${lang} 失败`, error);
        result[lang] = text;
      }
    })
  );

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
  if (stopMessagesListener) {
    stopMessagesListener();
    stopMessagesListener = null;
  }

  async function sendSystemNotice(text, roomId = currentRoomId) {
  if (!roomId) return;

  const noticeMessage = {
    senderId: "system_notice",
    senderName: "系统通知",
    senderRole: "system",
    originalText: text,
    originalLanguage: "zh",
    translations: {
      zh: text,
      ko: text,
      en: text,
      uz: text,
      mn: text
    },
    time: getCurrentTime(),
    createdAt: Date.now()
  };

  await push(ref(db, `rooms/${roomId}/messages`), noticeMessage);
}

  const currentRoomRef = ref(db, `rooms/${roomId}/messages`);

  stopMessagesListener = onValue(currentRoomRef, snapshot => {
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
.filter(message => {
  if (!currentSessionJoinedAt) return true;
  return (message.createdAt || 0) >= (currentSessionJoinedAt - 2000);
})
      .sort((a, b) => (a.createdAt || 0) - (b.createdAt || 0));

    renderMessages();
  });
}

async function markCurrentUserOffline(sendLeaveNotice = false) {
  if (!currentRoomId || !currentUser.id) return;

  const oldRoomId = currentRoomId;
  const leaveName = currentUser.name || "匿名";

  try {
    if (sendLeaveNotice) {
      const noticeMessage = {
        senderId: "system_notice",
        senderName: uiText.zh.systemSenderName,
        senderRole: "system",
        originalText: uiText.zh.leaveRoomNotice(leaveName),
        originalLanguage: "zh",
        translations: {
          zh: uiText.zh.leaveRoomNotice(leaveName),
          ko: uiText.ko.leaveRoomNotice(leaveName),
          en: uiText.en.leaveRoomNotice(leaveName),
          uz: uiText.en.leaveRoomNotice(leaveName),
          mn: uiText.en.leaveRoomNotice(leaveName)
        },
        time: getCurrentTime(),
        createdAt: Date.now()
      };

      await push(ref(db, `rooms/${oldRoomId}/messages`), noticeMessage);
    }

    await update(ref(db, `rooms/${oldRoomId}/members/${currentUser.id}`), {
      online: false,
      lastActiveAt: Date.now()
    });
  } catch (e) {
    console.error("标记离线失败", e);
  }
}

function startPresenceHeartbeat() {
  if (presenceHeartbeatStarted) return;
  presenceHeartbeatStarted = true;

  setInterval(async () => {
    if (!currentRoomId || !currentUser.id || !currentUser.entered) return;

    try {
      await update(ref(db, `rooms/${currentRoomId}/members/${currentUser.id}`), {
        online: true,
        lastActiveAt: Date.now()
      });
    } catch (e) {
      console.error("心跳更新失败", e);
    }
  }, 15000);
}

// ===============================
// 8. 自动回复
// ===============================
async function autoReplyForStudent() {
  const textZh = uiText.zh.autoReplyText;

  const autoReply = {
    senderId: "system_staff_auto_reply",
    senderName: uiText.zh.dutyStaffName,
    senderRole: "staff",
    originalText: textZh,
    originalLanguage: "zh",
    translations: {
      zh: uiText.zh.autoReplyText,
      ko: uiText.ko.autoReplyText,
      en: uiText.en.autoReplyText,
      uz: uiText.en.autoReplyText,
      mn: uiText.en.autoReplyText
    },
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
        <span class="online-badge">${(uiText[localStorage.getItem("ui_lang") || "zh"] || uiText.zh).roomListEnter}</span>
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
  let name = nameInput.value.trim();

  if (roleSelect.value === "staff") {
    const ok = await validateStaffLogin();
    if (!ok) {
      return;
    }
    name = nameInput.value.trim();
  } else {
    if (!name) {
      alert("请先输入姓名");
      return;
    }
  }

  if (currentRoomId && currentUser.id && currentRoomId !== roomId) {
    if (currentDisconnectHandler) {
      try {
        await currentDisconnectHandler.cancel();
      } catch (e) {
        console.error("取消旧断开监听失败", e);
      }
    }

    await markCurrentUserOffline(true);
  }

  const joinedAt = Date.now();
  currentSessionJoinedAt = joinedAt;

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

  // 切房间时先清空本地显示，避免看到旧房间残留
  messages = [];
  members = [];
  renderMessages();
  renderOnlineStaffReal();

  listenMessagesForRoom(roomId);
  listenMembersForRoom(roomId);

  await set(ref(db, `rooms/${roomId}/members/${currentUser.id}`), {
    name: currentUser.name,
    role: currentUser.role,
    targetLang: currentUser.targetLang,
    online: true,
    joinedAt: joinedAt,
    lastActiveAt: joinedAt
  });

  currentRoomMemberRef = ref(db, `rooms/${roomId}/members/${currentUser.id}`);

  currentDisconnectHandler = onDisconnect(currentRoomMemberRef);
  await currentDisconnectHandler.update({
    online: false,
    lastActiveAt: Date.now()
  });

  updateCurrentUserInfo();

  const enterNoticeMessage = {
    senderId: "system_notice",
    senderName: uiText.zh.systemSenderName,
    senderRole: "system",
    originalText: uiText.zh.enterRoomNotice(currentUser.name),
    originalLanguage: "zh",
    translations: {
      zh: uiText.zh.enterRoomNotice(currentUser.name),
      ko: uiText.ko.enterRoomNotice(currentUser.name),
      en: uiText.en.enterRoomNotice(currentUser.name),
      uz: uiText.en.enterRoomNotice(currentUser.name),
      mn: uiText.en.enterRoomNotice(currentUser.name)
    },
    time: getCurrentTime(),
    createdAt: Date.now()
  };

await push(ref(db, `rooms/${roomId}/messages`), enterNoticeMessage);
console.log("进入提示已直接写入 Firebase", roomId, currentUser.name);

  if (window.innerWidth <= 960 && sidebar) {
    sidebar.classList.remove("mobile-open");
    if (mobileSidebarToggle) {
      mobileSidebarToggle.textContent = "房间与身份设置";
    }
  }
}
// ===============================
// 10. 房间监听成员
// ===============================
function listenMembersForRoom(roomId) {
  if (stopMembersListener) {
    stopMembersListener();
    stopMembersListener = null;
  }

  const memberRef = ref(db, `rooms/${roomId}/members`);

  stopMembersListener = onValue(memberRef, snapshot => {
    const data = snapshot.val() || {};
    members = Object.keys(data).map(key => ({
      id: key,
      ...data[key]
    }));
    renderOnlineStaffReal();
  });
}
function hasOnlineStaff() {
  const now = Date.now();
  const ACTIVE_LIMIT = 40 * 1000; // 2分钟内算在线

  return members.some(member => {
    const lastActiveAt = member.lastActiveAt || member.joinedAt || 0;

    return (
      member.role === "staff" &&
      member.online === true &&
      (now - lastActiveAt < ACTIVE_LIMIT)
    );
  });
}
// ===============================
// 10. 真实在线老师与学生渲染函数
// ===============================
function renderOnlineStaffReal() {
  onlineStaffList.innerHTML = "";

  const now = Date.now();
  const ACTIVE_LIMIT = 40 * 1000; // 2分钟内算在线

  const activeMembers = members.filter(member => {
    const lastActiveAt = member.lastActiveAt || member.joinedAt || 0;
    return member.online === true && (now - lastActiveAt < ACTIVE_LIMIT);
  });

  const onlineStaff = activeMembers.filter(member => member.role === "staff");
  const onlineStudents = activeMembers.filter(member => member.role === "student");

  const currentUILang = localStorage.getItem("ui_lang") || "zh";
const t = uiText[currentUILang] || uiText.zh;
onlineCountBadge.textContent = t.onlineCount(onlineStaff.length, onlineStudents.length);

if (!onlineStaff.length) {
  const currentUILang = localStorage.getItem("ui_lang") || "zh";
  const t = uiText[currentUILang] || uiText.zh;

  onlineStaffList.innerHTML = `
      <div style="padding:10px; color:#64748b;">${t.noOnlineStaff}</div>
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
      <span class="online-badge">${t.staffOnline}</span>
    `;
    onlineStaffList.appendChild(item);
  });
}
function updateCurrentRoomInfo(roomId, roomInfo = {}) {
  const currentUILang = localStorage.getItem("ui_lang") || "zh";
  const t = uiText[currentUILang] || uiText.zh;

  roomTitle.textContent = roomInfo.name || t.notInRoomTitle;
  roomSubtitle.textContent = roomInfo.category
    ? `${t.roomCategoryPrefix}${roomInfo.category}`
    : t.notInRoomSubtitle;

  roomIdBadge.textContent = roomInfo.name
    ? `${t.currentRoomPrefix}${roomInfo.name}`
    : `${t.currentRoomPrefix}-`;
}

// ===============================
// 10. 语言自动识别
// ===============================
async function detectLanguage(text) {
  const value = (text || "").trim();

  if (!value) return "zh";

  if (/[가-힣]/.test(value)) {
    return "ko";
  }

  if (/[\u4e00-\u9fff]/.test(value)) {
    return "zh";
  }

  if (/[А-Яа-яЁё]/.test(value)) {
    return "mn";
  }

  if (/[A-Za-z]/.test(value)) {
    return "en";
  }

  return "zh";
}
// ===============================
// 10. 事件
// ===============================

async function handleSendMessage() {
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
  const currentUILang = localStorage.getItem("ui_lang") || "zh";
  const t = uiText[currentUILang] || uiText.zh;
  sendBtn.textContent = t.sending;

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

    if (currentUser.role === "student" && !hasOnlineStaff()) {
      setTimeout(() => {
        autoReplyForStudent().catch(console.error);
      }, 800);
    }
  } catch (error) {
    console.error(error);
    alert(error.message || "发送失败");
  } finally {
    sendBtn.disabled = false;
    const currentUILang2 = localStorage.getItem("ui_lang") || "zh";
    const t2 = uiText[currentUILang2] || uiText.zh;
    sendBtn.textContent = t2.sendBtn;
  }
}

sendBtn.addEventListener("click", handleSendMessage);

quickButtons.forEach(button => {
  button.addEventListener("click", () => {
    messageInput.value = button.dataset.text;
    messageInput.focus();
  });
});
messageInput.addEventListener("keydown", (event) => {
  const isEnter =
    event.key === "Enter" ||
    event.code === "Enter" ||
    event.keyCode === 13;

  if (!isEnter) return;
  if (event.shiftKey) return;
  if (event.isComposing || event.keyCode === 229) return;

  event.preventDefault();
  event.stopPropagation();
  handleSendMessage();
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
  if (currentUser.role !== "staff") {
    currentStaffAccount = null;
    updateAdminPanelVisibility();
  }
  saveUserToLocal();
  updateCurrentUserInfo();
  updateStaffLoginVisibility();
});

nameInput.addEventListener("input", () => {
  currentUser.name = nameInput.value.trim();
  saveUserToLocal();
  updateCurrentUserInfo();
});

// ===============================
// 11. 启动
// ===============================
window.addEventListener("pagehide", () => {
  if (currentRoomId && currentUser.id) {
    const leaveNotice = {
      senderId: "system_notice",
      senderName: uiText.zh.systemSenderName,
      senderRole: "system",
      originalText: uiText.zh.leaveRoomNotice(currentUser.name || "匿名"),
      originalLanguage: "zh",
      translations: {
        zh: uiText.zh.leaveRoomNotice(currentUser.name || "匿名"),
        ko: uiText.ko.leaveRoomNotice(currentUser.name || "匿名"),
        en: uiText.en.leaveRoomNotice(currentUser.name || "匿名"),
        uz: uiText.en.leaveRoomNotice(currentUser.name || "匿名"),
        mn: uiText.en.leaveRoomNotice(currentUser.name || "匿名")
      },
      time: getCurrentTime(),
      createdAt: Date.now()
    };

    navigator.sendBeacon?.(
      `${firebaseConfig.databaseURL}rooms/${currentRoomId}/messages.json`,
      JSON.stringify(leaveNotice)
    );
  }
});

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
updateStaffLoginVisibility();
updateAdminPanelVisibility();
listenRoomList();
renderMessages();
startPresenceHeartbeat();

if (mobileSidebarToggle && sidebar) {
  mobileSidebarToggle.addEventListener("click", () => {
    sidebar.classList.toggle("mobile-open");

    const currentUILang = localStorage.getItem("ui_lang") || "zh";
    const t = uiText[currentUILang] || uiText.zh;

    mobileSidebarToggle.textContent = sidebar.classList.contains("mobile-open")
      ? t.mobileSidebarOpen
      : t.mobileSidebarClosed;
  });
}

createRoomBtn.addEventListener("click", createRoom);

if (saveStaffAccountBtn) {
  saveStaffAccountBtn.addEventListener("click", async () => {
    if (!currentStaffAccount?.isAdmin) {
      alert("只有管理员可以管理老师账号。");
      return;
    }

    const username = adminStaffUsernameInput.value.trim();
    const password = adminStaffPasswordInput.value.trim();
    const name = adminStaffNameInput.value.trim();

    if (!username || !password || !name) {
      alert("请完整填写老师账号、密码和姓名。");
      return;
    }

    try {
      const staffRef = ref(db, `staffAccounts/${username}`);
      const snapshot = await get(staffRef);

      if (snapshot.exists()) {
        alert("该老师账号已存在，请更换账号。");
        return;
      }

      await set(staffRef, {
        password,
        name,
        active: true,
        isAdmin: false
      });

      adminStaffUsernameInput.value = "";
      adminStaffPasswordInput.value = "";
      adminStaffNameInput.value = "";

      alert(`老师账号已创建。\n账号：${username}\n密码：${password}`);
    } catch (error) {
      console.error("保存老师账号失败", error);
      alert("保存老师账号失败。");
    }
  });
}

const savedUILang = localStorage.getItem("ui_lang") || "zh";
if (uiLanguageSelect) {
  uiLanguageSelect.value = savedUILang;
}
applyUILanguage(savedUILang);

if (uiLanguageSelect) {
  uiLanguageSelect.addEventListener("change", () => {
    const lang = uiLanguageSelect.value;
    localStorage.setItem("ui_lang", lang);
    applyUILanguage(lang);
  });
}
