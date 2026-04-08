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

const languageMap = {
  zh: "中文",
  ko: "한국어",
  en: "English",
  uz: "Oʻzbekcha",
  mn: "Монгол"
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

let messages = [
  {
    id: 1,
    senderName: "系统通知",
    senderRole: "staff",
    originalText: "欢迎进入国际学生固定咨询室。",
    originalLanguage: "zh",
    translations: {
      zh: "欢迎进入国际学生固定咨询室。",
      ko: "국제학생 고정 상담실에 오신 것을 환영합니다.",
      en: "Welcome to the International Student Support Room.",
      uz: "Xalqaro talabalar doimiy maslahat xonasiga xush kelibsiz.",
      mn: "Олон улсын оюутны тогтмол зөвлөгөөний өрөөнд тавтай морилно уу."
    },
    time: "09:00"
  },
  {
    id: 2,
    senderName: "李老师",
    senderRole: "staff",
    originalText: "目前在线老师可协助签证、学费、成绩单、出勤等问题。",
    originalLanguage: "zh",
    translations: {
      zh: "目前在线老师可协助签证、学费、成绩单、出勤等问题。",
      ko: "현재 온라인 교직원이 비자, 등록금, 성적표, 출결 관련 문의를 도와드릴 수 있습니다.",
      en: "Online staff can currently assist with visas, tuition, transcripts, and attendance issues.",
      uz: "Hozir onlayn xodimlar viza, kontrakt, transcript va davomat masalalarida yordam bera oladi.",
      mn: "Одоо онлайн байгаа ажилтнууд виз, төлбөр, дүнгийн хуудас, ирцийн талаар туслах боломжтой."
    },
    time: "09:02"
  }
];

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

function getDisplayedText(message) {
  const lang = currentUser.targetLang || "zh";
  return message.translations[lang] || message.originalText;
}

function renderMessages() {
  chatMessages.innerHTML = "";

  messages.forEach(message => {
    const card = document.createElement("div");
    card.className = `message-card ${message.senderRole}`;

    const roleText = message.senderRole === "staff" ? "STAFF" : "STUDENT";
    const displayedText = getDisplayedText(message);

    card.innerHTML = `
      <div class="message-top">
        <span class="message-name">${message.senderName}</span>
        <span class="role-tag">${roleText}</span>
        <span class="message-time">${message.time}</span>
      </div>
      <div class="message-text">${displayedText}</div>
      <div class="message-original">
        原文（${languageMap[message.originalLanguage] || message.originalLanguage}）：
        ${message.originalText}
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

function fakeTranslate(text, targetLang) {
  const prefixMap = {
    zh: "【中文显示】",
    ko: "【한국어 표시】",
    en: "[English View] ",
    uz: "[Oʻzbekcha Ko‘rinish] ",
    mn: "[Монгол Харагдац] "
  };

  const prefix = prefixMap[targetLang] || "";
  return `${prefix}${text}`;
}

function buildTranslations(text) {
  return {
    zh: fakeTranslate(text, "zh"),
    ko: fakeTranslate(text, "ko"),
    en: fakeTranslate(text, "en"),
    uz: fakeTranslate(text, "uz"),
    mn: fakeTranslate(text, "mn")
  };
}

function getCurrentTime() {
  const now = new Date();
  const hh = String(now.getHours()).padStart(2, "0");
  const mm = String(now.getMinutes()).padStart(2, "0");
  return `${hh}:${mm}`;
}

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

sendBtn.addEventListener("click", () => {
  if (!currentUser.entered) {
    alert("请先进入咨询室。");
    return;
  }

  const text = messageInput.value.trim();

  if (!text) {
    alert("请输入消息内容。");
    return;
  }

  const newMessage = {
    id: Date.now(),
    senderName: currentUser.name,
    senderRole: currentUser.role,
    originalText: text,
    originalLanguage: currentUser.sourceLang,
    translations: buildTranslations(text),
    time: getCurrentTime()
  };

  messages.push(newMessage);
  renderMessages();
  messageInput.value = "";

  if (currentUser.role === "student") {
    setTimeout(() => {
      const autoReply = {
        id: Date.now() + 1,
        senderName: "国际处值班老师",
        senderRole: "staff",
        originalText: "您好，已收到您的咨询，我们会尽快为您解答。",
        originalLanguage: "zh",
        translations: {
          zh: "您好，已收到您的咨询，我们会尽快为您解答。",
          ko: "안녕하세요. 문의를 확인했으며, 최대한 빨리 답변드리겠습니다.",
          en: "Hello, we have received your inquiry and will respond as soon as possible.",
          uz: "Salom, sizning murojaatingiz qabul qilindi, tez orada javob beramiz.",
          mn: "Сайн байна уу, таны асуултыг хүлээн авлаа. Удахгүй хариу өгнө."
        },
        time: getCurrentTime()
      };

      messages.push(autoReply);
      renderMessages();
    }, 800);
  }
});

quickButtons.forEach(button => {
  button.addEventListener("click", () => {
    messageInput.value = button.dataset.text;
    messageInput.focus();
  });
});

renderOnlineStaff();
updateCurrentUserInfo();
renderMessages();
