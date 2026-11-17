import { initializeApp } from "https://www.gstatic.com/firebasejs/11.10.0/firebase-app.js";
import {
  getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword,
  onAuthStateChanged, signOut, updateProfile, getIdTokenResult
} from "https://www.gstatic.com/firebasejs/11.10.0/firebase-auth.js";
import {
  getFirestore, doc, setDoc, getDoc, serverTimestamp, collection, getDocs, updateDoc
} from "https://www.gstatic.com/firebasejs/11.10.0/firebase-firestore.js";
import { firebaseConfig } from "./firebase-config.js";

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

const $ = (id) => document.getElementById(id);
const authSection = $("authSection");
const dashboardSection = $("dashboardSection");
const adminSection = $("adminSection");
let currentUser = null;
let volunteerCache = [];
const message = $("message");
let language = localStorage.getItem("iwk-language") || "en";

const translations = {
  en: {
    eyebrow: "FIELD MONITORING PLATFORM",
    title: "Document invasive species. Understand ecosystems.",
    intro: "A bilingual field-survey platform for recording invasive plants and animals across Kerala.",
    welcomeHeading: "Welcome to Invasive Watch Kerala",
    welcomeText: "Approved volunteers will be able to record field surveys, quadrat samples and invasive animal observations. Survey tools will be added in the next development stages.",
    feature1: "Plant quadrat sampling",
    feature2: "Invasive animal observations",
    feature3: "Location-based ecological records",
    feature4: "English and Malayalam interface",
    login: "Log in", register: "Register", email: "Email address",
    password: "Password", loginButton: "Log in", fullName: "Full name",
    registerButton: "Create volunteer account",
    approvalNote: "New accounts require administrator approval before field-survey access is granted.",
    volunteerPortal: "VOLUNTEER PORTAL", comingNext: "Coming in the next stages",
    comingNextText: "Survey creation, GPS location, plant quadrats, invasive animal sampling and offline field recording.",
    logout: "Log out", pending: "Pending approval", approved: "Approved",
    accountPending: "Your account has been created. An administrator must approve it before you can access field-survey tools.",
    accountApproved: "Your volunteer account is approved. Field-survey features will appear here as they are developed.",
    accountUnavailable: "Your account is signed in, but its volunteer profile could not be loaded. Please contact the administrator.",
    registerSuccess: "Account created. Please check the approval status below.",
    loginSuccess: "Login successful.", connection: "Firebase app initialized",
    connectionError: "Firebase connection needs attention",
    loginError: "Unable to log in. Check your email and password.",
    registerError: "Unable to create account. This email may already be registered.",
    logoutError: "Unable to log out. Please try again.",
    profileError: "Account created, but the volunteer profile could not be saved. Contact the administrator.",
    required: "Please complete all required fields."
  },
  ml: {
    eyebrow: "ഫീൽഡ് നിരീക്ഷണ പ്ലാറ്റ്ഫോം",
    title: "അധിനിവേശ ജീവികളെ രേഖപ്പെടുത്തൂ. ആവാസവ്യവസ്ഥകളെ മനസ്സിലാക്കൂ.",
    intro: "കേരളത്തിലുടനീളമുള്ള അധിനിവേശ സസ്യങ്ങളെയും മൃഗങ്ങളെയും രേഖപ്പെടുത്താനുള്ള ദ്വിഭാഷാ ഫീൽഡ് സർവേ പ്ലാറ്റ്ഫോം.",
    welcomeHeading: "ഇൻവേസീവ് വാച്ച് കേരളയിലേക്ക് സ്വാഗതം",
    welcomeText: "അംഗീകൃത സന്നദ്ധപ്രവർത്തകർക്ക് ഫീൽഡ് സർവേകൾ, ക്വാഡ്രാറ്റ് സാമ്പിളുകൾ, അധിനിവേശ മൃഗങ്ങളുടെ നിരീക്ഷണങ്ങൾ എന്നിവ രേഖപ്പെടുത്താം. തുടർന്നുള്ള വികസന ഘട്ടങ്ങളിൽ സർവേ സൗകര്യങ്ങൾ ലഭ്യമാകും.",
    feature1: "സസ്യങ്ങളുടെ ക്വാഡ്രാറ്റ് സാമ്പിളെടുപ്പ്",
    feature2: "അധിനിവേശ മൃഗങ്ങളുടെ നിരീക്ഷണം",
    feature3: "സ്ഥലാധിഷ്ഠിത പാരിസ്ഥിതിക രേഖകൾ",
    feature4: "ഇംഗ്ലീഷ്, മലയാളം ഇന്റർഫേസ്",
    login: "ലോഗിൻ", register: "രജിസ്റ്റർ", email: "ഇമെയിൽ വിലാസം",
    password: "പാസ്‌വേഡ്", loginButton: "ലോഗിൻ ചെയ്യുക", fullName: "പൂർണ്ണനാമം",
    registerButton: "സന്നദ്ധപ്രവർത്തക അക്കൗണ്ട് സൃഷ്ടിക്കുക",
    approvalNote: "ഫീൽഡ് സർവേ സൗകര്യങ്ങൾ ലഭിക്കുന്നതിന് പുതിയ അക്കൗണ്ടുകൾക്ക് അഡ്മിൻ അംഗീകാരം ആവശ്യമാണ്.",
    volunteerPortal: "സന്നദ്ധപ്രവർത്തക പോർട്ടൽ", comingNext: "അടുത്ത ഘട്ടങ്ങളിൽ ലഭ്യമാകും",
    comingNextText: "സർവേ സൃഷ്ടിക്കൽ, GPS സ്ഥാനം, സസ്യ ക്വാഡ്രാറ്റുകൾ, അധിനിവേശ മൃഗങ്ങളുടെ സാമ്പിളെടുപ്പ്, ഓഫ്‌ലൈൻ രേഖപ്പെടുത്തൽ.",
    logout: "ലോഗ് ഔട്ട്", pending: "അംഗീകാരം കാത്തിരിക്കുന്നു", approved: "അംഗീകരിച്ചു",
    accountPending: "നിങ്ങളുടെ അക്കൗണ്ട് സൃഷ്ടിച്ചു. ഫീൽഡ് സർവേ സൗകര്യങ്ങൾ ലഭിക്കുന്നതിന് അഡ്മിൻ അംഗീകാരം ആവശ്യമാണ്.",
    accountApproved: "നിങ്ങളുടെ സന്നദ്ധപ്രവർത്തക അക്കൗണ്ട് അംഗീകരിച്ചു. വികസിപ്പിക്കുന്നതനുസരിച്ച് ഫീൽഡ് സർവേ സൗകര്യങ്ങൾ ഇവിടെ ലഭ്യമാകും.",
    accountUnavailable: "നിങ്ങൾ ലോഗിൻ ചെയ്തിട്ടുണ്ട്, എന്നാൽ നിങ്ങളുടെ സന്നദ്ധപ്രവർത്തക പ്രൊഫൈൽ ലഭ്യമല്ല. അഡ്മിനുമായി ബന്ധപ്പെടുക.",
    registerSuccess: "അക്കൗണ്ട് സൃഷ്ടിച്ചു. താഴെ അംഗീകാര നില പരിശോധിക്കുക.",
    loginSuccess: "ലോഗിൻ വിജയകരമായി.",
    connection: "Firebase ആപ്പ് ആരംഭിച്ചു",
    connectionError: "Firebase കണക്ഷൻ പരിശോധിക്കേണ്ടതുണ്ട്",
    loginError: "ലോഗിൻ ചെയ്യാനായില്ല. ഇമെയിലും പാസ്‌വേഡും പരിശോധിക്കുക.",
    registerError: "അക്കൗണ്ട് സൃഷ്ടിക്കാനായില്ല. ഈ ഇമെയിൽ ഇതിനകം രജിസ്റ്റർ ചെയ്തിരിക്കാം.",
    logoutError: "ലോഗ് ഔട്ട് ചെയ്യാനായില്ല. വീണ്ടും ശ്രമിക്കുക.",
    profileError: "അക്കൗണ്ട് സൃഷ്ടിച്ചു, എന്നാൽ പ്രൊഫൈൽ സേവ് ചെയ്യാനായില്ല. അഡ്മിനുമായി ബന്ധപ്പെടുക.",
    required: "ആവശ്യമായ എല്ലാ വിവരങ്ങളും നൽകുക."
  }
};

function t(key) {
  return translations[language][key] || translations.en[key] || key;
}

function applyLanguage() {
  document.documentElement.lang = language;
  document.querySelectorAll("[data-i18n]").forEach((element) => {
    const key = element.dataset.i18n;
    if (translations[language][key]) element.textContent = translations[language][key];
  });
  $("languageToggle").textContent = language === "en" ? "മലയാളം" : "English";
  $("logoutButton").textContent = t("logout");
  const badge = $("approvalBadge");
  if (badge.dataset.state) badge.textContent = t(badge.dataset.state);
}

function showMessage(text, type = "") {
  message.textContent = text;
  message.className = `message ${type}`;
}

function escapeHtml(value) {
  return String(value ?? "").replace(/[&<>"']/g, (char) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
  })[char]);
}

function formatDate(value) {
  if (!value) return "—";
  const date = typeof value.toDate === "function" ? value.toDate() : new Date(value);
  return Number.isNaN(date.getTime()) ? "—" : date.toLocaleDateString();
}

function renderVolunteerRows(filter = "") {
  const body = $("volunteerTableBody");
  const term = filter.trim().toLowerCase();
  const records = volunteerCache.filter((person) => {
    const searchable = `${person.name || ""} ${person.email || ""} ${person.approvalStatus || ""}`.toLowerCase();
    return searchable.includes(term);
  });
  body.replaceChildren();
  if (!records.length) {
    const row = document.createElement("tr");
    const cell = document.createElement("td");
    cell.colSpan = 5;
    cell.className = "empty-cell";
    cell.textContent = "No matching volunteer accounts.";
    row.append(cell);
    body.append(row);
    return;
  }
  for (const person of records) {
    const row = document.createElement("tr");
    const status = person.approvalStatus || "pending";
    const isAdmin = person.role === "admin";
    const nameCell = document.createElement("td");
    nameCell.textContent = person.name || "—";
    const emailCell = document.createElement("td");
    emailCell.textContent = person.email || "—";
    const dateCell = document.createElement("td");
    dateCell.textContent = formatDate(person.createdAt);
    const statusCell = document.createElement("td");
    const badge = document.createElement("span");
    badge.className = `table-status ${status}`;
    badge.textContent = isAdmin ? "Administrator" : status;
    statusCell.append(badge);
    const actionCell = document.createElement("td");
    if (!isAdmin) {
      if (status !== "approved") {
        const approve = document.createElement("button");
        approve.className = "button button-approve";
        approve.textContent = "Approve";
        approve.addEventListener("click", () => updateVolunteerStatus(person.uid, "approved", approve));
        actionCell.append(approve);
      }
      if (status !== "rejected") {
        const reject = document.createElement("button");
        reject.className = "button button-reject";
        reject.textContent = "Reject";
        reject.addEventListener("click", () => updateVolunteerStatus(person.uid, "rejected", reject));
        actionCell.append(reject);
      }
    } else {
      actionCell.textContent = "—";
    }
    row.append(nameCell, emailCell, dateCell, statusCell, actionCell);
    body.append(row);
  }
}

async function loadVolunteers() {
  $("volunteerTableBody").innerHTML = '<tr><td colspan="5" class="empty-cell">Loading volunteer records…</td></tr>';
  try {
    const snapshot = await getDocs(collection(db, "volunteers"));
    volunteerCache = snapshot.docs.map((item) => ({ uid: item.id, ...item.data() }))
      .sort((a, b) => {
        const aDate = a.createdAt?.toMillis?.() || 0;
        const bDate = b.createdAt?.toMillis?.() || 0;
        return bDate - aDate;
      });
    $("totalVolunteerCount").textContent = volunteerCache.filter((p) => p.role !== "admin").length;
    $("pendingVolunteerCount").textContent = volunteerCache.filter((p) => p.role !== "admin" && (p.approvalStatus || "pending") === "pending").length;
    $("approvedVolunteerCount").textContent = volunteerCache.filter((p) => p.role !== "admin" && p.approvalStatus === "approved").length;
    renderVolunteerRows($("volunteerSearch").value);
    $("adminMessage").textContent = "Volunteer records loaded.";
  } catch (error) {
    console.error("Volunteer list error:", error);
    $("adminMessage").textContent = "Unable to load volunteers. Check Firestore permissions and try again.";
  }
}

async function updateVolunteerStatus(uid, status, button) {
  if (!currentUser) return;
  const confirmed = window.confirm(`Are you sure you want to ${status} this volunteer?`);
  if (!confirmed) return;
  button.disabled = true;
  try {
    await updateDoc(doc(db, "volunteers", uid), {
      approvalStatus: status,
      reviewedAt: serverTimestamp(),
      reviewedBy: currentUser.uid
    });
    await loadVolunteers();
    $("adminMessage").textContent = `Volunteer ${status} successfully.`;
  } catch (error) {
    console.error("Volunteer update error:", error);
    $("adminMessage").textContent = "Could not update this volunteer. Please try again.";
    button.disabled = false;
  }
}

async function renderUserDashboard(user) {
  currentUser = user;
  authSection.classList.add("hidden");
  dashboardSection.classList.remove("hidden");
  $("logoutButton").classList.remove("hidden");
  $("userGreeting").textContent = user.displayName || user.email || "Volunteer";
  adminSection.classList.add("hidden");

  try {
    const token = await getIdTokenResult(user, true);
    if (token.claims.admin === true) {
      adminSection.classList.remove("hidden");
      $("approvalBadge").textContent = "Administrator";
      $("approvalBadge").classList.add("admin-badge");
      $("accountMessage").textContent = "Administrator access is active. You can review volunteer applications below.";
      await loadVolunteers();
      return;
    }
    $("approvalBadge").classList.remove("admin-badge");
    const profileSnapshot = await getDoc(doc(db, "volunteers", user.uid));
    if (!profileSnapshot.exists()) {
      $("accountMessage").textContent = t("accountUnavailable");
      $("approvalBadge").dataset.state = "pending";
    } else {
      const profile = profileSnapshot.data();
      const isApproved = profile.approvalStatus === "approved";
      $("approvalBadge").dataset.state = isApproved ? "approved" : "pending";
      $("accountMessage").textContent = isApproved ? t("accountApproved") : t("accountPending");
    }
    applyLanguage();
  } catch (error) {
    console.error("Profile read error:", error);
    $("accountMessage").textContent = t("accountUnavailable");
  }
}

function showLoginTab() {
  $("loginForm").classList.remove("hidden");
  $("registerForm").classList.add("hidden");
  $("loginTab").classList.add("active");
  $("registerTab").classList.remove("active");
  showMessage("");
}

function showRegisterTab() {
  $("registerForm").classList.remove("hidden");
  $("loginForm").classList.add("hidden");
  $("registerTab").classList.add("active");
  $("loginTab").classList.remove("active");
  showMessage("");
}

$("languageToggle").addEventListener("click", () => {
  language = language === "en" ? "ml" : "en";
  localStorage.setItem("iwk-language", language);
  applyLanguage();
});

$("loginTab").addEventListener("click", showLoginTab);
$("registerTab").addEventListener("click", showRegisterTab);

$("registerForm").addEventListener("submit", async (event) => {
  event.preventDefault();
  const name = $("registerName").value.trim();
  const email = $("registerEmail").value.trim();
  const password = $("registerPassword").value;

  if (!name || !email || password.length < 6) {
    showMessage(t("required"), "error");
    return;
  }

  const button = $("registerForm").querySelector("button[type=submit]");
  button.disabled = true;
  try {
    const credential = await createUserWithEmailAndPassword(auth, email, password);
    await updateProfile(credential.user, { displayName: name });
    await setDoc(doc(db, "volunteers", credential.user.uid), {
      uid: credential.user.uid,
      name,
      email,
      language,
      role: "volunteer",
      approvalStatus: "pending",
      createdAt: serverTimestamp()
    });
    await renderUserDashboard(credential.user);
    showMessage(t("registerSuccess"), "success");
    $("registerForm").reset();
  } catch (error) {
    console.error("Registration error:", error);
    showMessage(error.code === "permission-denied" ? t("profileError") : t("registerError"), "error");
  } finally {
    button.disabled = false;
  }
});

$("loginForm").addEventListener("submit", async (event) => {
  event.preventDefault();
  const email = $("loginEmail").value.trim();
  const password = $("loginPassword").value;
  const button = $("loginForm").querySelector("button[type=submit]");
  button.disabled = true;
  try {
    await signInWithEmailAndPassword(auth, email, password);
    showMessage(t("loginSuccess"), "success");
  } catch (error) {
    console.error("Login error:", error);
    showMessage(t("loginError"), "error");
  } finally {
    button.disabled = false;
  }
});

$("logoutButton").addEventListener("click", async () => {
  try {
    await signOut(auth);
    showLoginTab();
  } catch (error) {
    console.error("Logout error:", error);
    showMessage(t("logoutError"), "error");
  }
});

$("volunteerSearch").addEventListener("input", () => renderVolunteerRows($("volunteerSearch").value));
$("refreshVolunteers").addEventListener("click", loadVolunteers);

onAuthStateChanged(auth, async (user) => {
  if (!user) {
    authSection.classList.remove("hidden");
    dashboardSection.classList.add("hidden");
    adminSection.classList.add("hidden");
    currentUser = null;
    $("logoutButton").classList.add("hidden");
    $("connectionStatus").textContent = t("connection");
    return;
  }
  await renderUserDashboard(user);
});

applyLanguage();
$("connectionStatus").textContent = t("connection");

// Register a basic app-shell service worker. Full offline survey capture
// and queued photo synchronisation are planned for Stage 6.
if ("serviceWorker" in navigator && location.protocol.startsWith("http")) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("./service-worker.js").catch((error) => {
      console.warn("Service worker registration failed:", error);
    });
  });
}
