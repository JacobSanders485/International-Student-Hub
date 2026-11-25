import React, { useEffect, useMemo, useState } from "react";

const STORAGE_KEY = "internationalStudentHub.task2.v1";
const PLAN_STORAGE_KEY = "internationalStudentHub.plan.v1";

const planTemplates = {
  "Change of Status": [
    ["Understand your current situation", "Write down questions to discuss with an ISSO advisor."],
    ["Review official guidance", "Read the relevant UTD ISSO information and note any questions."],
    ["Meet with an advisor", "Confirm which steps and timing apply to your circumstances."],
    ["Organize your documents", "Keep copies of relevant documents and official correspondence."],
    ["Review your next steps", "Check your plan against the latest instructions from official sources."]
  ],
  "Graduation": [
    ["Review your degree progress", "Check your degree audit and remaining academic requirements."],
    ["Meet with your academic advisor", "Confirm your expected completion term and outstanding requirements."],
    ["Review graduation information", "Check university application, commencement, and account deadlines."],
    ["Discuss post-graduation options", "Review official ISSO guidance and prepare questions for an advisor."],
    ["Prepare for your next chapter", "Organize records, contacts, and plans for after graduation."]
  ],
  "OPT and Social Tracking": [
    ["Explore official OPT information", "Read current UTD ISSO guidance and note questions."],
    ["Discuss timing with ISSO", "Confirm the timeline and requirements that apply to your situation."],
    ["Prepare your document checklist", "Use current official instructions to identify documents to gather."],
    ["Track application updates", "Keep confirmation details and monitor official communications."],
    ["Review employment reporting resources", "Learn where to find current guidance about reporting changes."]
  ],
  "Transfer": [
    ["Research the receiving university", "Review admission, academic, and international student information."],
    ["Talk with academic advisors", "Ask about course planning and transfer credit evaluation."],
    ["Contact UTD ISSO", "Discuss the transfer process and timing with an international student advisor."],
    ["Coordinate your transition", "Keep track of requests and communications with both institutions."],
    ["Prepare for your new campus", "Review housing, arrival, and student account information."]
  ],
  "Arrival at UTD": [
    ["Review your admission information", "Collect university instructions and note important dates."],
    ["Plan your arrival and housing", "Confirm travel plans, housing arrangements, and move-in details."],
    ["Review ISSO arrival resources", "Read current pre-arrival and post-arrival information."],
    ["Set up your UTD accounts", "Follow university instructions for NetID and student systems."],
    ["Explore campus and student life", "Find campus services, student organizations, and upcoming events."]
  ]
};

function loadPlan() {
  try {
    const saved = JSON.parse(localStorage.getItem(PLAN_STORAGE_KEY));
    if (saved && Array.isArray(saved.milestones)) return saved;
  } catch { /* use an empty plan */ }
  return { created: false, type: "Arrival at UTD", targetDate: "", milestones: [] };
}

const transitionTypes = [
  { name: "Change of Status", detail: "Plan a change to your immigration status.", art: "mint" },
  { name: "Graduation", detail: "Prepare for graduation and what comes next.", art: "sunset" },
  { name: "OPT and Social Tracking", detail: "Organize OPT-related questions and preparation.", art: "ocean" },
  { name: "Transfer", detail: "Plan a transfer to another university.", art: "sunset" },
  { name: "Arrival at UTD", detail: "Prepare for your first weeks at UTD.", art: "ocean" }
];

const templates = {
  "Change of Status": [
    ["Confirm your current immigration status", "Review the documents that describe your current status.", "Immigration"],
    ["Review official change-of-status information", "Read the current guidance that applies to your circumstances.", "Immigration"],
    ["Gather relevant documents", "List documents you may need and verify requirements with ISSO.", "Documents"],
    ["Contact an international student advisor", "Ask which process and resources apply to your situation.", "Support"],
    ["Review applicable forms and instructions", "Use current official forms and carefully review their instructions.", "Documents"],
    ["Check fees and submission instructions", "Confirm current fees and where materials must be submitted.", "Documents"],
    ["Submit the required application or request", "Follow the official process after confirming requirements.", "Application"],
    ["Save confirmation and monitor updates", "Keep copies of receipts and check for follow-up requests.", "Follow-up"]
  ],
  "Graduation": [
    ["Review your degree requirements", "Check your degree audit and remaining requirements.", "Academic"],
    ["Meet with your academic advisor", "Confirm your graduation timeline and outstanding requirements.", "Academic"],
    ["Review graduation application instructions", "Find the current university process and deadlines.", "University"],
    ["Check your student account", "Review balances, holds, and outstanding requirements.", "University"],
    ["Review international student considerations", "Ask ISSO how graduation may affect your individual situation.", "Immigration"],
    ["Explore post-graduation options", "Review official information and prepare advisor questions.", "Planning"],
    ["Confirm commencement details", "Review ceremony registration, tickets, and schedule.", "University"],
    ["Save important documents", "Keep copies of academic records and confirmations.", "Documents"]
  ],
  "OPT and Social Tracking": [
    ["Review official OPT information", "Read current ISSO and government guidance.", "Immigration"],
    ["Confirm your eligibility questions with ISSO", "Discuss your timeline and circumstances with an advisor.", "Support"],
    ["Review application timing", "Verify current filing windows and deadlines using official sources.", "Planning"],
    ["Gather required application materials", "Use the official checklist to identify needed documents.", "Documents"],
    ["Review forms and filing instructions", "Check the latest form version and official instructions.", "Documents"],
    ["Confirm fees and submission method", "Verify current fees and how the application must be submitted.", "Application"],
    ["Track your application status", "Save confirmation details and monitor official updates.", "Follow-up"],
    ["Review next steps before beginning employment", "Confirm applicable authorization and dates before working.", "Employment"]
  ],
  "Transfer": [
    ["Review the receiving university process", "Find official transfer and admission instructions.", "University"],
    ["Speak with an academic advisor", "Discuss course planning and how credits may transfer.", "Academic"],
    ["Contact UTD ISSO about your situation", "Ask about timing and steps that may apply to your record.", "Immigration"],
    ["Confirm your intended transfer timeline", "Coordinate dates with the relevant university offices.", "Planning"],
    ["Gather requested documents", "Use official instructions to prepare required materials.", "Documents"],
    ["Review housing and arrival plans", "Check move-in dates and housing options.", "Housing"],
    ["Confirm enrollment and account setup", "Follow receiving-university instructions for registration.", "Academic"],
    ["Save confirmations from both universities", "Keep records of requests, approvals, and communications.", "Follow-up"]
  ],
  "Arrival at UTD": [
    ["Review your admission and arrival information", "Collect university instructions and note important dates.", "University"],
    ["Confirm housing arrangements", "Review move-in details and confirm where you will stay.", "Housing"],
    ["Review travel and immigration documents", "Check official guidance and ask ISSO about questions.", "Immigration"],
    ["Activate your UTD account and NetID", "Follow UTD instructions to access university systems.", "Campus setup"],
    ["Review your class schedule", "Confirm enrollment details and academic-advisor questions.", "Academic"],
    ["Plan transportation to campus", "Explore routes and options for getting to campus.", "Transportation"],
    ["Explore student organizations and support", "Find communities and services that may help you settle in.", "Community"],
    ["Find a campus event to attend", "Choose an event or activity to become familiar with campus.", "Community"]
  ]
};

function makeTasks(type, targetDate) {
  const base = templates[type] || templates["Change of Status"];
  const start = targetDate ? new Date(`${targetDate}T12:00:00`) : new Date();
  return base.map((item, index) => {
    const due = new Date(start);
    due.setDate(due.getDate() - (base.length - index - 1) * 3);
    return {
      id: index + 1, name: item[0], description: item[1], category: item[2],
      due: Number.isNaN(due.getTime()) ? "" : due.toISOString().slice(0, 10), done: false
    };
  });
}

function initialState() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));

    if (saved?.tasks?.length) {
      return {
        ...saved,
        created: true
      };
    }
  } catch {
    // Use default state
  }

  return {
    created: false,
    type: "Change of Status",
    current: "F-1 student",
    target: "F-1 student",
    targetDate: "",
    tasks: []
  };
}

// Accent colors for Find Help topic categories (text color, tint background).
const topicColors = {
  "Immigration": ["#1d4f91", "#e8f0fb"],
  "Employment": ["#6b3fa0", "#f1eafa"],
  "Travel": ["#0f6f7a", "#e3f4f5"],
  "Getting Started": ["#2f7d32", "#e8f5e9"],
  "Graduation": ["#9a5b00", "#fdf1dc"],
  "Documents": ["#4a5563", "#eef0f3"],
  "Campus Support": ["#b2416b", "#fbe9f0"],
  "Academics": ["#3949ab", "#eaecf8"],
  "Money": ["#1b7a4b", "#e4f4ea"],
  "Wellbeing": ["#8e3fae", "#f5e9fa"],
  "Campus Life": ["#c25a17", "#fcede2"],
  "Getting Around": ["#00796b", "#e0f2ef"],
  "Safety": ["#b42318", "#fdecea"]
};

function topicStyle(category) {
  const [color, tint] = topicColors[category] || ["#526b55", "#f0f3ef"];
  return { "--topic-color": color, "--topic-tint": tint };
}

function formatDate(value) {
  if (!value) return "No date";
  return new Date(`${value}T12:00:00`).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
}


const USERS_KEY = "unipath.localAccounts.v1";
const SESSION_KEY = "unipath.activeAccount.v1";

function readUsers() {
  try { return JSON.parse(localStorage.getItem(USERS_KEY)) || []; }
  catch { return []; }
}
function userStorageKey(userId, kind) { return `unipath.${userId}.${kind}.v1`; }
function loadUserState(userId) {
  try {
    const saved = JSON.parse(localStorage.getItem(userStorageKey(userId, "checklist")));
    if (saved && Array.isArray(saved.tasks)) return { ...saved, created: !!saved.created };
  } catch {}
  return { created: false, type: "Change of Status", current: "F-1 student", target: "F-1 student", targetDate: "", tasks: [] };
}
function loadUserPlan(userId) {
  try {
    const saved = JSON.parse(localStorage.getItem(userStorageKey(userId, "plan")));
    if (saved && Array.isArray(saved.milestones)) return saved;
  } catch {}
  return { created: false, type: "Arrival at UTD", targetDate: "", milestones: [] };
}

function App() {
  const [users, setUsers] = useState(readUsers);
  const [authUser, setAuthUser] = useState(() => {
    const id = localStorage.getItem(SESSION_KEY);
    return readUsers().find(user => user.id === id) || null;
  });
  const [authMode, setAuthMode] = useState("login");
  const [authName, setAuthName] = useState("");
  const [authEmail, setAuthEmail] = useState("");
  const [authPassword, setAuthPassword] = useState("");
  const [authError, setAuthError] = useState("");
  const [demoOpen, setDemoOpen] = useState(false);
  const [state, setState] = useState(() => {
    const id = localStorage.getItem(SESSION_KEY);
    return id ? loadUserState(id) : initialState();
  });
  const [step, setStep] = useState("home");
  const [chosenType, setChosenType] = useState(state.type);
  const [filter, setFilter] = useState("All");
  const [helpSearch, setHelpSearch] = useState("");
  const [helpCategory, setHelpCategory] = useState("All");
  const [helpFavoritesOnly, setHelpFavoritesOnly] = useState(false);
  const [favorites, setFavorites] = useState(() => JSON.parse(localStorage.getItem(`unipath.favorites.${localStorage.getItem(SESSION_KEY) || "guest"}`) || "[]"));
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [calendarMonth, setCalendarMonth] = useState(() => new Date(new Date().getFullYear(), new Date().getMonth(), 1));
  const [plan, setPlan] = useState(() => {
    const id = localStorage.getItem(SESSION_KEY);
    return id ? loadUserPlan(id) : loadPlan();
  });
  const [selectedPlanType, setSelectedPlanType] = useState(() => loadPlan().type || state.type || "Arrival at UTD");
  const [selectedPlanDate, setSelectedPlanDate] = useState(() => loadPlan().targetDate || "");
  const [communitySearch, setCommunitySearch] = useState("");
  const [newMilestone, setNewMilestone] = useState("");
  const [newTaskName, setNewTaskName] = useState("");
  const [newTaskCategory, setNewTaskCategory] = useState("Personal");
  const [newTaskDescription, setNewTaskDescription] = useState("");
  const [newTaskDue, setNewTaskDue] = useState("");

  useEffect(() => {
    if (authUser) localStorage.setItem(userStorageKey(authUser.id, "checklist"), JSON.stringify(state));
  }, [state, authUser]);

  useEffect(() => {
    if (authUser) localStorage.setItem(userStorageKey(authUser.id, "plan"), JSON.stringify(plan));
  }, [plan, authUser]);

  useEffect(() => {
    if (authUser) localStorage.setItem(`unipath.favorites.${authUser.id}`, JSON.stringify(favorites));
  }, [favorites, authUser]);

  useEffect(() => {
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
  }, [users]);

  const counts = useMemo(() => {
    const done = state.tasks.filter(task => task.done).length;
    return { done, total: state.tasks.length, remaining: state.tasks.length - done,
      percent: state.tasks.length ? Math.round(done / state.tasks.length * 100) : 0 };
  }, [state.tasks]);

  const nextTask = useMemo(() => {
    return state.tasks
      .filter(task => !task.done && task.due)
      .sort((a, b) => a.due.localeCompare(b.due))[0];
  }, [state.tasks]);

  const sortedTasks = useMemo(() => {
    return [...state.tasks].sort((a, b) => {
      // Tasks without deadlines appear last
      if (!a.due) return 1;
      if (!b.due) return -1;

      // Earliest deadline first
      return a.due.localeCompare(b.due);
    });
  }, [state.tasks]);

  const filteredTasks = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return sortedTasks.filter(task => {
      if (filter === "Open") return !task.done;
      if (filter === "Completed") return task.done;
      if (filter === "Overdue") return !task.done && task.due && new Date(`${task.due}T12:00:00`) < today;
      return true;
    });
  }, [sortedTasks, filter]);

  const planPhases = useMemo(() => {
    const groups = [
      { title: "1. Prepare", description: "Build your foundation and understand what comes next.", items: plan.milestones.slice(0, 2) },
      { title: "2. Take action", description: "Work through the main steps of your transition.", items: plan.milestones.slice(2, 4) },
      { title: "3. Confirm and settle in", description: "Review progress and prepare for what comes after.", items: plan.milestones.slice(4) }
    ];
    return groups.filter(group => group.items.length);
  }, [plan.milestones]);

  const planCounts = useMemo(() => {
    const done = plan.milestones.filter(item => item.done).length;
    const total = plan.milestones.length;
    return { done, total, percent: total ? Math.round(done / total * 100) : 0 };
  }, [plan.milestones]);

  const allDatedItems = useMemo(() => [
    ...state.tasks.filter(item => item.due).map(item => ({ id: `task-${item.id}`, title: item.name, date: item.due, done: item.done, kind: "Task" })),
    ...plan.milestones.filter(item => item.due).map(item => ({ id: `milestone-${item.id}`, title: item.title, date: item.due, done: item.done, kind: "Milestone" }))
  ].sort((a, b) => a.date.localeCompare(b.date)), [state.tasks, plan.milestones]);

  const notificationItems = useMemo(() => {
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const soon = new Date(today); soon.setDate(soon.getDate() + 7);
    return allDatedItems.filter(item => !item.done).map(item => ({
      ...item, days: Math.round((new Date(`${item.date}T12:00:00`) - today) / 86400000)
    })).filter(item => item.days < 0 || item.days <= 7).sort((a, b) => a.days - b.days);
  }, [allDatedItems]);

  function toggleFavorite(title) {
    setFavorites(current => current.includes(title) ? current.filter(item => item !== title) : [...current, title]);
  }

  function finishLogin(user) {
    setAuthUser(user);
    localStorage.setItem(SESSION_KEY, user.id);
    setState(loadUserState(user.id));
    setPlan(loadUserPlan(user.id));
    setFavorites(JSON.parse(localStorage.getItem(`unipath.favorites.${user.id}`) || "[]"));
    setChosenType(loadUserState(user.id).type);
    setStep("home");
    setAuthError("");
    setAuthPassword("");
  }

  function submitAuth(event) {
    event.preventDefault();
    const email = authEmail.trim().toLowerCase();
    if (!email || !authPassword) { setAuthError("Enter an email and password."); return; }
    if (authMode === "register") {
      if (!authName.trim()) { setAuthError("Enter your name."); return; }
      if (authPassword.length < 4) { setAuthError("Use a password with at least 4 characters for this demo."); return; }
      if (users.some(user => user.email === email)) { setAuthError("An account with that email already exists."); return; }
      const user = { id: `user-${Date.now()}`, name: authName.trim(), email, password: authPassword };
      const next = [...users, user];
      setUsers(next);
      localStorage.setItem(USERS_KEY, JSON.stringify(next));
      finishLogin(user);
    } else {
      const user = users.find(item => item.email === email && item.password === authPassword);
      if (!user) { setAuthError("Email or password is incorrect."); return; }
      finishLogin(user);
    }
  }

  function signOut() {
    localStorage.removeItem(SESSION_KEY);
    setAuthUser(null);
    setStep("home");
    setAuthPassword("");
  }

  function switchAccount(userId) {
    const user = users.find(item => item.id === userId);
    if (user) finishLogin(user);
  }

  function resetDemoData() {
    if (!window.confirm(`Reset all UniPath data for ${authUser.name}? This cannot be undone.`)) return;
    const freshState = { created: false, type: "Change of Status", current: "F-1 student", target: "F-1 student", targetDate: "", tasks: [] };
    const freshPlan = { created: false, type: "Arrival at UTD", targetDate: "", milestones: [] };
    setState(freshState);
    setPlan(freshPlan);
    setChosenType("Change of Status");
    setSelectedPlanType("Arrival at UTD");
    setSelectedPlanDate("");
    setFilter("All");
    setHelpSearch("");
    setHelpCategory("All");
    setCommunitySearch("");
    setStep("home");
  }

  function totalResetDemo() {
    if (!window.confirm("Delete ALL UniPath demo accounts and saved data from this browser? This cannot be undone.")) return;

    // Remove only UniPath data; leave unrelated websites' localStorage untouched.
    const keysToRemove = [];
    for (let index = 0; index < localStorage.length; index += 1) {
      const key = localStorage.key(index);
      if (key && (key.startsWith("unipath.") || key === "internationalStudentHub.task2.v1" || key === "internationalStudentHub.plan.v1")) {
        keysToRemove.push(key);
      }
    }
    keysToRemove.forEach(key => localStorage.removeItem(key));

    setUsers([]);
    setAuthUser(null);
    setState(initialState());
    setPlan({ created: false, type: "Arrival at UTD", targetDate: "", milestones: [] });
    setChosenType("Change of Status");
    setSelectedPlanType("Arrival at UTD");
    setSelectedPlanDate("");
    setAuthMode("register");
    setAuthName("");
    setAuthEmail("");
    setAuthPassword("");
    setAuthError("");
    setFilter("All");
    setHelpSearch("");
    setHelpCategory("All");
    setCommunitySearch("");
    setStep("home");
    setDemoOpen(false);
  }

  function openPlanSetup() {
    setSelectedPlanType(plan.created ? plan.type : (state.created ? state.type : chosenType));
    setSelectedPlanDate(plan.created ? (plan.targetDate || "") : (state.targetDate || ""));
    setStep("plan-setup");
  }

  function createPlan() {
    const source = planTemplates[selectedPlanType] || planTemplates["Arrival at UTD"];
    const targetDate = selectedPlanDate || "";
    const target = targetDate ? new Date(`${targetDate}T12:00:00`) : null;
    const milestones = source.map((item, index) => {
      const due = target ? new Date(target) : null;
      if (due) due.setDate(due.getDate() - (source.length - index - 1) * 7);
      return {
        id: `milestone-${Date.now()}-${index}`,
        title: item[0],
        description: item[1],
        due: due && !Number.isNaN(due.getTime()) ? due.toISOString().slice(0, 10) : "",
        done: false
      };
    });
    setPlan({ created: true, type: selectedPlanType, targetDate, milestones });
    setStep("plan");
  }

  function updateMilestone(id, updates) {
    setPlan(current => ({ ...current, milestones: current.milestones.map(item =>
      item.id === id ? { ...item, ...updates } : item) }));
  }

  function addMilestone() {
    if (!newMilestone.trim()) return;
    setPlan(current => ({ ...current, milestones: [...current.milestones, {
      id: `custom-${Date.now()}`, title: newMilestone.trim(), description: "Your own transition milestone.", due: "", done: false
    }] }));
    setNewMilestone("");
  }

  function deleteMilestone(id) {
    setPlan(current => ({ ...current, milestones: current.milestones.filter(item => item.id !== id) }));
  }

  function generateChecklist() {
    setState(current => ({
      ...current, 
      created: true,
      type: chosenType,
      tasks: makeTasks(chosenType, current.targetDate)
    }));
    setFilter("All");
    setStep("generated");
  }

  function updateTask(id, updates) {
    setState(current => ({ ...current, tasks: current.tasks.map(task =>
      task.id === id ? { ...task, ...updates } : task) }));
  }

  function addTask() {
  if (!newTaskName.trim()) {
    alert("Please enter a task name.");
    return;
  }

  const task = {
    id: Date.now(),
    name: newTaskName.trim(),
    description: newTaskDescription.trim(),
    category: newTaskCategory,
    due: newTaskDue,
    done: false
  };

  setState(current => ({
    ...current,
    tasks: [...current.tasks, task]
  }));

  // Clear the form after adding the task
  setNewTaskName("");
  setNewTaskDescription("");
  setNewTaskCategory("Personal");
  setNewTaskDue("");
}

function deleteTask(id) {
  if (!window.confirm("Are you sure you want to delete this task?")) {
    return;
  }

  setState(current => ({
    ...current,
    tasks: current.tasks.filter(task => task.id !== id)
  }));
}

  function updateDetails(field, value) {
    setState(current => ({ ...current, [field]: value }));
  }

  function exportChecklist() {
    const lines = [
      `${state.type} Checklist`, `Current status: ${state.current}`,
      `Target status: ${state.target}`, `Transition date: ${state.targetDate || "Not set"}`, "",
      "Status | Task | Category | Suggested date",
      ...sortedTasks.map(task => `${task.done ? "Complete" : "To do"} | ${task.name} | ${task.category} | ${task.due || "Not set"}`),
      "", "Illustrative planning content only. Confirm requirements and deadlines with official UTD ISSO guidance."
    ];
    const url = URL.createObjectURL(new Blob([lines.join("\n")], { type: "text/plain" }));
    const link = document.createElement("a");
    link.href = url; link.download = "my-transition-checklist.txt"; link.click();
    URL.revokeObjectURL(url);
  }

  const topics = [
    { title: "F-1 Student Resources", category: "Immigration", description: "Guidance and resources for students in F-1 status, including maintaining status and common student questions.", next: "Start with the ISSO F-1 student resources and contact an advisor about individual circumstances.", url: "https://isso.utdallas.edu/immigration-status/f1-maintain/f1-students/", link: "Explore F-1 resources" },
    { title: "J-1 Student Resources", category: "Immigration", description: "Information for J-1 students about maintaining their exchange visitor status.", next: "Review the J-1 guidance and confirm program-specific questions with ISSO.", url: "https://isso.utdallas.edu/immigration-status/maintain-j-1/j1-students/", link: "Explore J-1 resources" },
    { title: "Maintaining F-1 Status", category: "Immigration", description: "Enrollment and other considerations for maintaining F-1 student status.", next: "Check the current ISSO guidance before making changes to enrollment or your program.", url: "https://isso.utdallas.edu/immigration-status/f1-maintain/", link: "Maintain F-1 status" },
    { title: "Enrollment Requirements", category: "Immigration", description: "Review information about enrollment requirements for international students.", next: "Discuss exceptions or changes to your enrollment with ISSO before acting.", url: "https://isso.utdallas.edu/immigration-status/enroll-req/", link: "Review enrollment requirements" },
    { title: "Change to F-1 Status", category: "Immigration", description: "ISSO information for people exploring a change to F-1 status.", next: "Read the official overview and ask ISSO which process applies to you.", url: "https://isso.utdallas.edu/immigration-status/f1-maintain/f1-change/", link: "View change-of-status guidance" },
    { title: "Change to J-1 Status", category: "Immigration", description: "ISSO information about changing to J-1 status.", next: "Confirm eligibility and process details with the appropriate ISSO advisor.", url: "https://isso.utdallas.edu/immigration-status/maintain-j-1/cos-j-1/", link: "View J-1 guidance" },
    { title: "Post-Completion OPT", category: "Employment", description: "Official UTD ISSO information about Optional Practical Training after program completion.", next: "Review current timing and application information with ISSO before making plans.", url: "https://isso.utdallas.edu/employment-and-internships/is-employment/opt/", link: "Explore OPT information" },
    { title: "STEM OPT Extension", category: "Employment", description: "Information about the STEM OPT extension for eligible students.", next: "Review the official requirements and discuss your circumstances with ISSO.", url: "https://isso.utdallas.edu/employment-and-internships/is-employment/opt-extension/", link: "Explore STEM OPT" },
    { title: "Curricular Practical Training", category: "Employment", description: "Information about CPT and employment connected to a student's curriculum.", next: "Confirm eligibility, authorization, and timing with ISSO before beginning work.", url: "https://isso.utdallas.edu/employment-and-internships/is-employment/cpt/", link: "Explore CPT information" },
    { title: "F-1 Employment Overview", category: "Employment", description: "A starting point for employment information for F-1 students.", next: "Use the official overview to find the employment category relevant to your plans.", url: "https://isso.utdallas.edu/employment-and-internships/is-employment/", link: "View employment resources" },
    { title: "Social Security Number and ITIN", category: "Employment", description: "UTD ISSO information about Social Security Numbers and Individual Taxpayer Identification Numbers.", next: "Review the university guidance and confirm which documentation is relevant to your situation.", url: "https://isso.utdallas.edu/employment-and-internships/ssn/", link: "SSN and ITIN information" },
    { title: "Taxes for International Students", category: "Employment", description: "Find UTD ISSO tax information and related resources.", next: "Review the current university information and note applicable filing responsibilities.", url: "https://isso.utdallas.edu/employment-and-internships/taxes/", link: "Explore tax resources" },
    { title: "Travel in F or J Status", category: "Travel", description: "Information for F-1 and J-1 students planning international travel.", next: "Check current travel guidance and required documents before booking travel.", url: "https://isso.utdallas.edu/travel-and-visas/travel/", link: "Review travel guidance" },
    { title: "Visa Preparation", category: "Travel", description: "Resources to help students prepare for a visa appointment.", next: "Review the official information and verify requirements with the relevant consulate.", url: "https://isso.utdallas.edu/travel-and-visas/visa-preparation/", link: "Prepare for a visa appointment" },
    { title: "Driving in the U.S.", category: "Travel", description: "UTD ISSO information about driving in the United States.", next: "Review local requirements and confirm current rules with official state resources.", url: "https://isso.utdallas.edu/travel-and-visas/driving/", link: "Driving information" },
    { title: "New Student Arrival Resources", category: "Getting Started", description: "Pre-arrival and post-arrival resources for students joining UT Dallas.", next: "Use this as a starting point for arrival preparation and campus setup.", url: "https://isso.utdallas.edu/joining-ut-dallas/pre-post-arrival-resources/", link: "View arrival resources" },
    { title: "Apply for an I-20", category: "Getting Started", description: "UTD ISSO instructions for the I-20 application process.", next: "Follow the current instructions and contact ISSO if any part of the process is unclear.", url: "https://isso.utdallas.edu/joining-ut-dallas/apply-i-20/", link: "I-20 application information" },
    { title: "Financial Requirements", category: "Getting Started", description: "Information about financial documentation and requirements for incoming students.", next: "Check the current requirements and deadlines in the official ISSO guidance.", url: "https://isso.utdallas.edu/joining-ut-dallas/expenses/", link: "Review financial requirements" },
    { title: "Transfer to UT Dallas", category: "Getting Started", description: "Resources for international students transferring to UT Dallas.", next: "Review the transfer instructions and coordinate timing with your current institution and ISSO.", url: "https://isso.utdallas.edu/joining-ut-dallas/transfer/", link: "Transfer information" },
    { title: "Graduation and Beyond", category: "Graduation", description: "ISSO information for students approaching graduation and considering next steps.", next: "Review the guidance early and speak with an advisor about your personal timeline.", url: "https://isso.utdallas.edu/leaving-utd/graduation/", link: "Explore graduation resources" },
    { title: "F-1 Transfer Out", category: "Graduation", description: "Information for F-1 students transferring their SEVIS record to another institution.", next: "Coordinate the process and timing with ISSO and the receiving school.", url: "https://isso.utdallas.edu/leaving-utd/f1-transfer-out/", link: "F-1 transfer-out guidance" },
    { title: "J-1 Transfer Out", category: "Graduation", description: "Information for J-1 students transferring to another program or institution.", next: "Confirm program-specific requirements and timing with ISSO.", url: "https://isso.utdallas.edu/leaving-utd/j1-transfer-out/", link: "J-1 transfer-out guidance" },
    { title: "ISSO Forms and Guides", category: "Documents", description: "Find official forms, guides, and brochures from the International Students and Scholars Office.", next: "Use the latest version of each form and follow its current submission instructions.", url: "https://isso.utdallas.edu/forms/", link: "Browse forms and guides" },
    { title: "ISSO Processing Times", category: "Documents", description: "Check published processing-time information for ISSO services.", next: "Allow for processing time and check the page again for current estimates.", url: "https://isso.utdallas.edu/processing-times/", link: "View processing times" },
    { title: "Immigration Calendar", category: "Documents", description: "A calendar of immigration-related dates and reminders from ISSO.", next: "Check the calendar regularly and confirm any date that affects your own situation.", url: "https://isso.utdallas.edu/immigration-status/immigration-calendar/", link: "Open immigration calendar" },
    { title: "International Student Success", category: "Campus Support", description: "ISSO's international student success resources and support information.", next: "Explore available support and identify the office or service that best fits your question.", url: "https://isso.utdallas.edu/isso-home/international-student-success/", link: "Explore student success resources" },
    { title: "On-Campus Resources", category: "Campus Support", description: "A directory of campus resources for international students.", next: "Browse available services and contact the relevant office for current details.", url: "https://isso.utdallas.edu/isso-home/international-student-success/on-campus-resources/", link: "Explore campus resources" },
    { title: "Off-Campus Resources", category: "Campus Support", description: "Resources and services available in the surrounding community.", next: "Check eligibility, location, hours, and current service details before visiting.", url: "https://isso.utdallas.edu/isso-home/international-student-success/off-campus-resources/", link: "Explore local resources" },
    { title: "Student Success Advising", category: "Campus Support", description: "Information about student success advising through ISSO.", next: "Reach out when you need help navigating university or transition-related questions.", url: "https://isso.utdallas.edu/isso-home/international-student-success/student-success-advising/", link: "Learn about advising" },
    { title: "Safety and U.S. Laws", category: "Campus Support", description: "ISSO resources introducing safety topics and laws relevant to life in the United States.", next: "Use these materials as an introduction and consult official authorities for specific legal questions.", url: "https://isso.utdallas.edu/isso-home/international-student-success/us-laws/", link: "Review safety and law resources" },
    { title: "Avoiding Scams", category: "Campus Support", description: "Learn about common scams and ways to recognize suspicious requests.", next: "Be cautious with unsolicited payment or personal-information requests; contact UTD if unsure.", url: "https://isso.utdallas.edu/isso-home/international-student-success/scams/", link: "Learn about scams" },
    { title: "UT Dallas Academic Resources", category: "Academics", description: "A starting point for academic support and student learning resources at UTD.", next: "Explore services that match your academic needs and contact the relevant office.", url: "https://utdallas.edu/academics/academic-resources/", link: "Explore academic resources" },
    { title: "Academic Calendar", category: "Academics", description: "Find university academic dates and semester deadlines.", next: "Check the current term's calendar for registration, classes, and important dates.", url: "https://utdallas.edu/academics/calendar/", link: "View academic calendar" },
    { title: "Tuition and Costs", category: "Money", description: "Explore tuition and cost information published by UT Dallas.", next: "Review the current academic-year information and confirm your own charges in official student systems.", url: "https://utdallas.edu/costs-scholarships-aid/costs/", link: "Review tuition and costs" },
    { title: "Scholarships", category: "Money", description: "Find scholarship information and listings from UT Dallas.", next: "Check eligibility, deadlines, and application requirements for each opportunity.", url: "https://utdallas.edu/costs-scholarships-aid/scholarships/", link: "Explore scholarships" },
    { title: "Student Services and Support", category: "Campus Support", description: "A broad overview of student services and support at UT Dallas.", next: "Use this directory to find the appropriate university office for your question.", url: "https://utdallas.edu/campus-life/student-services-support/", link: "Explore student services" },
    { title: "Mental Health Resources", category: "Wellbeing", description: "Find mental health and wellbeing resources at UT Dallas.", next: "Review available support options and reach out to the service that fits your needs.", url: "https://utdallas.edu/mental-health-resources/", link: "View wellbeing resources" },
    { title: "Campus Life and Student Spaces", category: "Campus Life", description: "Discover places and activities that support student life on campus.", next: "Explore spaces and services where you can study, connect, and participate.", url: "https://utdallas.edu/campus-life/student-spaces/", link: "Explore student spaces" },
    { title: "UT Dallas Campus Map and Directions", category: "Getting Around", description: "Find campus directions and visitor information.", next: "Use the map and directions to plan your route before traveling to campus.", url: "https://utdallas.edu/visitors/directions/", link: "View directions" },
    { title: "Dallas–Fort Worth Community", category: "Getting Around", description: "Explore community information and resources around the Dallas–Fort Worth area.", next: "Use this as a starting point to learn about the area beyond campus.", url: "https://utdallas.edu/dfw-community/", link: "Explore the DFW community" },
    { title: "UT Dallas Emergency Information", category: "Safety", description: "Find emergency and safety information from the university.", next: "Save the university's official emergency information for quick access.", url: "https://utdallas.edu/emergency/", link: "View emergency information" }
  ];
  const categories = ["All", ...new Set(topics.map(topic => topic.category))];
  const visibleTopics = topics.filter(topic =>
    (helpCategory === "All" || topic.category === helpCategory) &&
    `${topic.title} ${topic.category} ${topic.description} ${topic.next}`.toLowerCase().includes(helpSearch.toLowerCase()) &&
    (!helpFavoritesOnly || favorites.includes(topic.title))
  );

  if (!authUser) {
    return <div className="auth-shell">
      <section className="auth-card">
        <div className="brand auth-brand"><span className="brand-mark">✳</span><span>UniPath</span></div>
        <h1>{authMode === "login" ? "Welcome back" : "Create your account"}</h1>
        <p className="intro">{authMode === "login" ? "Sign in to access your saved transition plans and checklists." : "Create a local demo account to keep your UniPath progress in this browser."}</p>
        <form onSubmit={submitAuth} className="auth-form">
          {authMode === "register" && <label>Name<input value={authName} onChange={event => setAuthName(event.target.value)} placeholder="Your name" /></label>}
          <label>Email<input type="email" value={authEmail} onChange={event => setAuthEmail(event.target.value)} placeholder="you@example.com" /></label>
          <label>Password<input type="password" value={authPassword} onChange={event => setAuthPassword(event.target.value)} placeholder="Password" /></label>
          {authError && <p className="auth-error">{authError}</p>}
          <button className="primary-btn" type="submit">{authMode === "login" ? "Sign In" : "Create Account"}</button>
        </form>
        <button className="text-btn auth-switch" onClick={() => { setAuthMode(authMode === "login" ? "register" : "login"); setAuthError(""); }}>
          {authMode === "login" ? "Need an account? Create one" : "Already have an account? Sign in"}
        </button>
        <p className="auth-note">Prototype accounts are stored only in this browser. Do not use a real or reused password.</p>
      </section>
    </div>;
  }

  return (
    <div className="app-shell">
      <header className="topbar">
        <div className="brand"><span className="brand-mark">✳</span><span>UniPath</span></div>
        <nav>
          <button onClick={() => setStep("home")}>Home</button>
          <button onClick={() => setStep("calendar")}>Calendar</button>
          <button className="notification-trigger" onClick={() => setNotificationsOpen(open => !open)} aria-expanded={notificationsOpen} aria-label={`Notifications, ${notificationItems.length} reminders`}>
            Notifications {notificationItems.length > 0 && <span className="notification-count">{notificationItems.length}</span>}
          </button>
          <span className="account-label">{authUser.name}</span>
          <button className="login" onClick={signOut}>Sign Out</button>
        </nav>
      </header>
      {notificationsOpen && <aside className="notification-panel" aria-label="Notifications">
        <div className="notification-heading"><strong>Notifications</strong><button onClick={() => setNotificationsOpen(false)} aria-label="Close notifications">×</button></div>
        {notificationItems.length ? notificationItems.map(item => <article className="notification-item" key={item.id}>
          <span className={item.days < 0 ? "notification-overdue" : "notification-upcoming"}>{item.days < 0 ? `${Math.abs(item.days)} days overdue` : item.days === 0 ? "Due today" : `Due in ${item.days} days`}</span>
          <strong>{item.title}</strong><small>{item.kind} · {formatDate(item.date)}</small>
        </article>) : <p className="muted">You're all caught up. No upcoming deadlines in the next seven days.</p>}
        <button className="text-btn" onClick={() => { setNotificationsOpen(false); setStep("calendar"); }}>View calendar</button>
      </aside>}

      <button className="demo-toggle" onClick={() => setDemoOpen(open => !open)}>{demoOpen ? "Hide Demo Controls" : "Demo Controls"}</button>
      {demoOpen && <aside className="demo-panel">
        <div className="demo-panel-heading"><strong>Demo Controls</strong><button onClick={() => setDemoOpen(false)} aria-label="Close demo controls">×</button></div>
        <label>Switch account
          <select value={authUser.id} onChange={event => switchAccount(event.target.value)}>
            {users.map(user => <option key={user.id} value={user.id}>{user.name} ({user.email})</option>)}
          </select>
        </label>
        <div className="demo-nav-grid">
          {[["Home","home"],["Create checklist","create"],["Checklist details","details"],["Generated checklist","generated"],["Dashboard","dashboard"],["Calendar","calendar"],["Plan setup","plan-setup"],["My Plan","plan"],["Find Help","help"],["Events","events"],["Transportation","transportation"],["Community","community"],["Services","services"]].map(([label, destination]) =>
            <button key={destination} onClick={() => { setStep(destination); setDemoOpen(false); }}>{label}</button>)}
        </div>
        <button className="demo-reset" onClick={resetDemoData}>Reset current account data</button>
        <small>Clears this account's checklist and plan, but keeps the account itself.</small>
        <button className="demo-reset demo-total-reset" onClick={totalResetDemo}>Total reset — delete all accounts</button>
        <small>Deletes every UniPath demo account and all saved UniPath data in this browser. You will return to account creation.</small>
      </aside>}

      {step === "home" && <main className="home-page">
        <h1>Welcome, {authUser.name.split(" ")[0]}!</h1>
        <p className="intro">Find resources, organize your next steps, and make your transition easier.</p>
        <img className="home-campus-image" src="/images/campus.png" alt="UT Dallas campus" />
        <div className="home-cards">
          <button className="home-card" onClick={() => setStep("help")}><span className="art mint" /><strong>Find Help</strong><small>Find university resources and support.</small><span className="card-link">Learn more →</span></button>
          <section className="home-card checklist-home-card">
            <span className="art sunset" />
            <strong>My Checklist</strong>

            {state.created ? (
              <>
                <small>Action list · {counts.done}/{counts.total} tasks completed</small>

                <small>
                  Next deadline:{" "}
                  {nextTask
                    ? new Date(`${nextTask.due}T12:00:00`).toLocaleDateString()
                    : "No upcoming tasks"}
                </small>

                <div className="home-progress">
                  <span style={{ width: `${counts.percent}%` }} />
                </div>

                <div className="card-actions">
                  <button
                    className="card-link-button primary-small"
                    onClick={() => setStep("dashboard")}
                  >
                    Dashboard
                  </button>

                  <button
                    className="card-link-button"
                    onClick={() => setStep("generated")}
                  >
                    Edit checklist
                  </button>
                </div>
              </>
            ) : (
              <>
                <small>Create a personalized transition checklist.</small>

                <button
                  className="card-link-button primary-small"
                  onClick={() => setStep("create")}
                >
                  Create checklist
                </button>
              </>
            )}
          </section>
          <section className="home-card plan-home-card">
            <span className="art ocean" />
            <strong>My Plan</strong>
            {plan.created ? (
              <>
                <small>Transition roadmap · {planCounts.done}/{planCounts.total} milestones completed</small>
                <small>Transition: {plan.type}</small>
                <div className="home-progress"><span style={{ width: `${planCounts.percent}%` }} /></div>
                <div className="card-actions">
                  <button className="card-link-button primary-small" onClick={() => setStep("plan")}>View plan</button>
                  <button className="card-link-button" onClick={openPlanSetup}>Regenerate</button>
                </div>
              </>
            ) : (
              <>
                <small>Organize your transition timeline.</small>
                <button className="card-link-button primary-small" onClick={openPlanSetup}>Create plan</button>
              </>
            )}
          </section>
        </div>
        <div className="home-secondary">
          {[
            ["Events", "Discover campus activities, cultural celebrations, workshops, and ways to meet people."],
            ["Transportation", "Explore campus directions, public transit, parking, and getting around DFW."],
            ["Community", "Find student organizations, international student support, and ways to connect."],
            ["Services", "Browse health, wellbeing, academic, safety, and everyday student services."]
          ].map(([name, description], i) =>
            <button key={name} className="home-card mini-card" onClick={() => { setCommunitySearch(""); setStep(name.toLowerCase()); }}><span className={`art ${["ocean","mint","sunset","mint"][i]}`} /><strong>{name}</strong><small>{description}</small><span className="card-link">Explore →</span></button>)}
        </div>
      </main>}

      {step === "create" && <main className="flow-page">
        <div className="step-label">MY CHECKLIST</div>
        <h1>What are you preparing for?</h1>
        <p className="intro">Choose the transition that best describes your situation.</p>
        <div className="type-grid">
          {transitionTypes.map(type => <button key={type.name} className={`type-card ${chosenType === type.name ? "selected" : ""}`} onClick={() => setChosenType(type.name)}>
            <span className={`art ${type.art}`} /><strong>{type.name}</strong><small>{type.detail}</small><span className="card-link">Select →</span>
          </button>)}
        </div>
        <div className="flow-actions"><button className="text-btn" onClick={() => setStep(state.created ? "generated" : "home")}>{state.created ? "← Back to checklist" : "← Back"}</button><button className="primary-btn" onClick={() => setStep("details")}>Continue</button></div>
      </main>}

      {step === "details" && <main className="flow-page details-page">
        <div className="step-label">MY CHECKLIST</div>
        <h1>Tell us about your situation</h1>
        <p className="intro">A few details help us organize your sample checklist.</p>
        <div className="details-form">
          <label>Current status
            <select value={state.current} onChange={event => updateDetails("current", event.target.value)}>
              <option>F-1 student</option><option>J-1 student</option><option>Other / Not sure</option><option>Not applicable</option>
            </select>
          </label>
          <label>Target status
            <select value={state.target} onChange={event => updateDetails("target", event.target.value)}>
              <option>F-1 student</option><option>J-1 student</option><option>OPT</option><option>Other / Not sure</option><option>Not applicable</option>
            </select>
          </label>
          <label>Expected date
            <input type="date" value={state.targetDate} onChange={event => updateDetails("targetDate", event.target.value)} />
          </label>
          <p className="form-hint">The date helps suggest example task dates. It is not an official deadline.</p>
        </div>
        <div className="flow-actions"><button className="text-btn" onClick={() => setStep("create")}>← Back</button><button className="primary-btn" onClick={generateChecklist}>Generate Checklist</button></div>
      </main>}

      {step === "generated" && <main className="result-page">
        <div className="step-label">YOUR ACTION LIST</div>
        <h1>My Checklist</h1>
        <p className="intro">Your day-to-day action items. Check off tasks, adjust dates, and add your own.</p>
        <div className="plan-target-banner">
          <span>Preparing for</span>
          <strong>{state.type} · {state.current} → {state.target}</strong>
          <button className="text-btn" onClick={() => { setChosenType(state.type); setStep("create"); }}>Change plan</button>
        </div>
        <div className="checklist-overview">
          <div className="checklist-stat"><strong>{counts.remaining}</strong><span>Still to do</span></div>
          <div className="checklist-stat"><strong>{counts.done}</strong><span>Completed</span></div>
          <div className="checklist-stat"><strong>{nextTask ? formatDate(nextTask.due) : "—"}</strong><span>Next deadline</span></div>
        </div>
        <div className="task-toolbar">
          <div><h2>Your action items</h2><p>Manage the individual things you need to get done. Update dates, check off tasks, or remove items that no longer apply.</p></div>
          <label>Show<select value={filter} onChange={event => setFilter(event.target.value)}><option>All</option><option>Open</option><option>Completed</option><option>Overdue</option></select></label>
        </div>
        <div className="task-card-list">
          {filteredTasks.map(task => {
            const overdue = !task.done && task.due && new Date(`${task.due}T12:00:00`) < new Date(new Date().toDateString());
            return <article className={`action-task-card ${task.done ? "is-done" : ""}`} key={task.id}>
              <label className="action-task-check"><input type="checkbox" checked={task.done} onChange={event => updateTask(task.id, { done: event.target.checked })} /><span>{task.done ? "Done" : "Mark done"}</span></label>
              <div className="action-task-copy"><div className="action-task-tags"><span>{task.category}</span>{overdue && <span className="overdue-tag">Overdue</span>}</div><h3>{task.name}</h3>{task.description && <p>{task.description}</p>}</div>
              <label className="action-task-date">Due date<input type="date" value={task.due} onChange={event => updateTask(task.id, { due: event.target.value })} /></label>
              <button className="delete-task-btn" onClick={() => deleteTask(task.id)}>Remove</button>
            </article>;
          })}
          {!filteredTasks.length && <p className="empty-task-state">No tasks in this view. Try another filter or add a custom task below.</p>}
        </div>
        <div className="add-task-section">
          <h2>Add a Custom Task</h2>
          <p>Create your own task to add to this checklist.</p>

          <div className="add-task-form">
            <label>
              Task Name *
              <input
                type="text"
                placeholder="e.g. Schedule an advisor meeting"
                value={newTaskName}
                onChange={event => setNewTaskName(event.target.value)}
              />
            </label>

            <label>
              Category
              <select
                value={newTaskCategory}
                onChange={event => setNewTaskCategory(event.target.value)}
              >
                <option>Personal</option>
                <option>Immigration</option>
                <option>Academic</option>
                <option>Documents</option>
                <option>Housing</option>
                <option>Transportation</option>
                <option>Community</option>
                <option>Employment</option>
                <option>Other</option>
              </select>
            </label>

            <label>
              Due Date
              <input
                type="date"
                value={newTaskDue}
                onChange={event => setNewTaskDue(event.target.value)}
              />
            </label>

            <label>
              Description (Optional)
              <input
                type="text"
                placeholder="Add some details about this task..."
                value={newTaskDescription}
                onChange={event => setNewTaskDescription(event.target.value)}
              />
            </label>

            <button className="primary-btn" onClick={addTask}>
              + Add Task
            </button>
          </div>
        </div>
        <p className="disclaimer">These are illustrative planning tasks, not official immigration instructions or legal advice. Confirm requirements with UTD ISSO.</p>
        <div className="flow-actions"><span /><button className="primary-btn" onClick={() => setStep("dashboard")}>View Dashboard</button></div>
      </main>}

      {step === "dashboard" && <main className="result-page dashboard-page">
        <div className="step-label">YOUR PROGRESS</div>
        <h1>Task Progress</h1>
        <div className="progress-box"><div className="progress-bar"><span style={{ width: `${counts.percent}%` }} /></div><strong>{counts.percent}%</strong></div>
        <div className="dashboard-overview-grid">
          <article><span>Checklist</span><strong>{counts.done}/{counts.total}</strong><small>tasks completed</small></article>
          <article><span>Roadmap</span><strong>{planCounts.done}/{planCounts.total}</strong><small>milestones completed</small></article>
          <article><span>Next deadline</span><strong>{nextTask ? formatDate(nextTask.due) : "—"}</strong><small>{nextTask ? nextTask.name : "No pending dated tasks"}</small></article>
          <article><span>Upcoming</span><strong>{notificationItems.length}</strong><small>deadlines within seven days or overdue</small></article>
        </div>
        <div className="dashboard-quick-actions"><button className="primary-btn" onClick={() => setStep("generated")}>Open checklist</button><button className="secondary-btn" onClick={() => setStep("plan")}>View roadmap</button><button className="secondary-btn" onClick={() => setStep("calendar")}>Open calendar</button></div>
        <div className="dashboard-columns">
          <section>
            <h2>Completed Tasks</h2>

            {sortedTasks.filter(task => task.done).length ? (
              sortedTasks.filter(task => task.done).map(task => (
                <label className="dashboard-task" key={task.id}>
                  <input
                    type="checkbox"
                    checked={task.done}
                    onChange={event => updateTask(task.id, {
                      done: event.target.checked
                    })}
                  />

                  <span className="dashboard-task-info">
                    <strong>{task.name}</strong>
                    <small>Due: {formatDate(task.due)}</small>
                  </span>
                </label>
              ))
            ) : (
              <p className="muted">No completed tasks yet.</p>
            )}
          </section>
          <section>
            <h2>Remaining Tasks</h2>

            {sortedTasks.filter(task => !task.done).length ? (
              sortedTasks.filter(task => !task.done).map(task => (
                <label className="dashboard-task" key={task.id}>
                  <input
                    type="checkbox"
                    checked={task.done}
                    onChange={event => updateTask(task.id, {
                      done: event.target.checked
                    })}
                  />

                  <span className="dashboard-task-info">
                    <strong>{task.name}</strong>
                    <small>Due: {formatDate(task.due)}</small>
                  </span>
                </label>
              ))
            ) : (
              <p className="muted">Everything is complete!</p>
            )}
          </section>
        </div>
        <div className="dashboard-summary">{counts.done} of {counts.total} tasks completed · {counts.remaining} remaining</div>
        <div className="flow-actions"><button className="text-btn" onClick={() => setStep("generated")}>← Back to checklist</button><button className="primary-btn" onClick={exportChecklist}>Download Checklist</button></div>
      </main>}

      {step === "calendar" && <main className="result-page calendar-page">
        <div className="step-label">YOUR SCHEDULE</div><h1>Calendar</h1>
        <p className="intro">See your checklist tasks and roadmap milestones together. Select an item in its original page to update its details.</p>
        <div className="calendar-toolbar"><button className="secondary-btn" onClick={() => setCalendarMonth(new Date(calendarMonth.getFullYear(), calendarMonth.getMonth()-1, 1))}>← Previous</button><h2>{calendarMonth.toLocaleDateString(undefined, { month: "long", year: "numeric" })}</h2><button className="secondary-btn" onClick={() => setCalendarMonth(new Date(calendarMonth.getFullYear(), calendarMonth.getMonth()+1, 1))}>Next →</button></div>
        <div className="calendar-grid" role="grid" aria-label="Monthly calendar">
          {['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].map(day => <div className="calendar-weekday" key={day}>{day}</div>)}
          {Array.from({length: new Date(calendarMonth.getFullYear(), calendarMonth.getMonth(), 1).getDay()}, (_,i) => <div className="calendar-empty" key={`empty-${i}`} />)}
          {Array.from({length: new Date(calendarMonth.getFullYear(), calendarMonth.getMonth()+1, 0).getDate()}, (_,i) => {
            const day = i+1; const date = `${calendarMonth.getFullYear()}-${String(calendarMonth.getMonth()+1).padStart(2,'0')}-${String(day).padStart(2,'0')}`;
            const events = allDatedItems.filter(item => item.date === date);
            return <div className={`calendar-day ${date === new Date().toISOString().slice(0,10) ? "today" : ""}`} key={date}><strong>{day}</strong>{events.map(item => <button key={item.id} className={`calendar-event ${item.kind.toLowerCase()} ${item.done ? "done" : ""}`} title={`${item.kind}: ${item.title}`} onClick={() => setStep(item.kind === "Task" ? "generated" : "plan")}>{item.kind === "Task" ? "Task" : "Milestone"}: {item.title}</button>)}</div>;
          })}
        </div>
        <div className="calendar-legend"><span className="task-dot" /> Checklist task <span className="milestone-dot" /> Roadmap milestone <span className="done-dot" /> Completed</div>
        {!allDatedItems.length && <p className="muted">No dated tasks or milestones yet. Add dates in My Checklist or My Plan to see them here.</p>}
        <div className="flow-actions"><button className="text-btn" onClick={() => setStep("home")}>← Home</button><button className="primary-btn" onClick={() => setStep("generated")}>Manage checklist</button></div>
      </main>}

      {step === "plan-setup" && <main className="flow-page plan-setup-page">
        <div className="step-label">MY PLAN</div>
        <h1>Choose your transition</h1>
        <p className="intro">Select the category that best matches your current plans. You can change this whenever your situation changes.</p>
        <div className="plan-type-grid">
          {transitionTypes.map(type => <button key={type.name} className={`type-card ${selectedPlanType === type.name ? "selected" : ""}`} onClick={() => setSelectedPlanType(type.name)}>
            <span className={`art ${type.art}`} /><strong>{type.name}</strong><small>{type.detail}</small>
          </button>)}
        </div>
        <div className="plan-date-field"><label htmlFor="plan-target-date">Target date (optional)</label><input id="plan-target-date" type="date" value={selectedPlanDate} onChange={event => setSelectedPlanDate(event.target.value)} /><small>Used to suggest milestone dates. You can edit every date afterward.</small></div>
        <div className="flow-actions"><button className="text-btn" onClick={() => setStep("home")}>← Back</button><button className="primary-btn" onClick={createPlan}>Generate plan</button></div>
      </main>}

      {step === "plan" && <main className="result-page plan-page">
        <div className="step-label">YOUR BIG-PICTURE ROADMAP</div>
        <h1>My Plan</h1>
        <p className="intro">Your transition roadmap for {plan.type}. Follow the major phases, adjust target dates, and track progress toward your next chapter.</p>
        <div className="plan-target-banner"><span>Target date</span><strong>{plan.targetDate ? formatDate(plan.targetDate) : "Not set"}</strong><button className="text-btn" onClick={openPlanSetup}>Change roadmap</button></div>
        <div className="plan-progress-summary">
          <div className="home-progress"><span style={{ width: `${planCounts.percent}%` }} /></div>
          <strong>{planCounts.percent}% complete</strong>
          <small>{planCounts.done} of {planCounts.total} milestones completed</small>
        </div>
        <div className="plan-roadmap">
          {planPhases.map((phase, phaseIndex) => <section className="roadmap-phase" key={phase.title}>
            <div className="roadmap-phase-heading"><span className="phase-number">{phaseIndex + 1}</span><div><h2>{phase.title}</h2><p>{phase.description}</p></div><small>{phase.items.filter(item => item.done).length}/{phase.items.length} complete</small></div>
            <div className="roadmap-milestones">
              {phase.items.map(item => <article className={`milestone-card ${item.done ? "completed" : ""}`} key={item.id}>
                <label className="milestone-check"><input type="checkbox" checked={item.done} onChange={event => updateMilestone(item.id, { done: event.target.checked })} /><span>{item.done ? "Completed" : "Milestone"}</span></label>
                <div className="milestone-copy"><h3>{item.title}</h3><p>{item.description}</p></div>
                <label className="milestone-date">Target date<input type="date" value={item.due} onChange={event => updateMilestone(item.id, { due: event.target.value })} /></label>
                <button className="delete-task-btn" onClick={() => deleteMilestone(item.id)}>Remove</button>
              </article>)}
            </div>
          </section>)}
        </div>
        <div className="add-milestone">
          <h2>Add a milestone</h2>
          <div className="add-milestone-row"><input value={newMilestone} onChange={event => setNewMilestone(event.target.value)} onKeyDown={event => event.key === "Enter" && addMilestone()} placeholder="e.g. Attend international student orientation" /><button className="primary-btn" onClick={addMilestone}>Add milestone</button></div>
        </div>
        <p className="disclaimer">Milestones are general planning suggestions, not official immigration requirements or deadlines. Confirm individual requirements and dates with UTD ISSO and the relevant university office.</p>
        <div className="flow-actions"><button className="text-btn" onClick={() => setStep("home")}>← Home</button><button className="primary-btn" onClick={() => setStep("help")}>Find resources</button></div>
      </main>}

      {step === "help" && <main className="result-page help-page">
        <div className="step-label">UT DALLAS AND COMMUNITY RESOURCES</div>
        <h1>Find Help</h1>
        <p className="intro">Explore university resources by topic. Each link takes you to a specific official page so you can find the information you need.</p>
        <input aria-label="Search resources" className="search" value={helpSearch} onChange={event => setHelpSearch(event.target.value)} placeholder="Search OPT, travel, housing, tuition, advising..." />
        <div className="topic-chips" role="group" aria-label="Browse by topic">
          {categories.map(category => <button key={category} type="button"
            className={`topic-chip ${helpCategory === category ? "active" : ""}`}
            style={category === "All" ? undefined : topicStyle(category)}
            aria-pressed={helpCategory === category}
            onClick={() => setHelpCategory(category)}>{category}</button>)}
        </div>
        <div className="resource-filters">
          <label className="favorite-filter"><input type="checkbox" checked={helpFavoritesOnly} onChange={event => setHelpFavoritesOnly(event.target.checked)} /> Saved only</label>
          <span>{visibleTopics.length} resources</span>
        </div>
        <div className="topic-list">
          {visibleTopics.map(topic => <article key={topic.title} className="topic-card" style={topicStyle(topic.category)}>
            <span className="resource-category">{topic.category}</span>
            <h2>{topic.title}</h2>
            <p>{topic.description}</p>
            <small>{topic.next}</small>
            <div className="resource-provenance"><span>Source: {new URL(topic.url).hostname.replace(/^www\./, "")}</span><span>External official resource</span></div>
            <div className="resource-card-actions"><a href={topic.url} target="_blank" rel="noreferrer">{topic.link} ↗</a><button className="favorite-btn" aria-pressed={favorites.includes(topic.title)} onClick={() => toggleFavorite(topic.title)}>{favorites.includes(topic.title) ? "★ Saved" : "☆ Save"}</button></div>
          </article>)}
          {!visibleTopics.length && <p className="muted no-results">No resources match that search. Try a different keyword or select “All”.</p>}
        </div>
        <p className="resource-note">Source transparency: these links point to university offices and their published resources. Always check the linked page for its current version and date. Immigration information can change and depends on individual circumstances; use official ISSO guidance and contact an advisor for advice about your situation. UniPath is a planning aid, not an immigration authority.</p>
        <div className="flow-actions"><button className="text-btn" onClick={() => setStep("home")}>← Home</button><a className="primary-btn link-btn" href="https://isso.utdallas.edu/" target="_blank" rel="noreferrer">Visit UTD ISSO ↗</a></div>
      </main>}
      {(["events", "transportation", "community", "services"].includes(step)) && (() => {
        const pages = {
          events: {
            title: "Events", intro: "Find ways to get involved, meet other students, and experience campus life.",
            groups: [
              { heading: "Campus events and activities", items: [
                ["UT Dallas Events Calendar", "Browse university events, lectures, performances, workshops, and campus activities.", "https://utdallas.edu/about-us/calendar/", "Browse events"],
                ["Comet Calendar", "Explore student-facing events and activities from across campus.", "https://calendar.utdallas.edu/", "Open Comet Calendar"],
                ["UT Dallas Campus Life", "Discover campus activities, traditions, spaces, and student experiences.", "https://utdallas.edu/campus-life/", "Explore campus life"]
              ]},
              { heading: "International student updates", items: [
                ["ISSO News", "Check announcements and updates from the International Students and Scholars Office.", "https://isso.utdallas.edu/news/", "Read ISSO news"],
                ["International Student Success", "Explore programming and resources that support international students.", "https://isso.utdallas.edu/isso-home/international-student-success/", "Explore student success"]
              ]}
            ]
          },
          transportation: {
            title: "Transportation", intro: "Plan how to get to campus and move around Richardson and the Dallas–Fort Worth area.",
            groups: [
              { heading: "Public transportation", items: [
                ["DART", "Find public transit information, trip planning, fares, and service updates for the Dallas area.", "https://www.dart.org/", "Plan a DART trip"],
                ["DART Silver Line", "Learn about the Silver Line commuter rail connection serving the northern Dallas suburbs, including the UT Dallas area.", "https://www.dart.org/guide/transit-and-use/rail/rail-map/", "Explore the Silver Line"]
              ]},
              { heading: "Driving, parking, and directions", items: [
                ["UT Dallas Directions", "Find directions to campus and information for visitors arriving by car or other transportation.", "https://utdallas.edu/visitors/directions/", "Get directions"],
                ["UT Dallas Parking", "Review parking information, permits, and campus parking options.", "https://services.utdallas.edu/transit/park/", "Review parking options"],
                ["Driving in the U.S.", "Read ISSO's introductory information for international students who plan to drive.", "https://isso.utdallas.edu/travel-and-visas/driving/", "Read driving guidance"]
              ]}
            ]
          },
          community: {
            title: "Community", intro: "Build connections on campus and find support as you settle into a new community.",
            groups: [
              { heading: "Meet people and get involved", items: [
                ["UT Dallas Campus Life", "Explore student activities, campus culture, and opportunities to participate.", "https://utdallas.edu/campus-life/", "Explore campus life"],
                ["Student Spaces", "Find places on campus to study, gather, and spend time with other students.", "https://utdallas.edu/campus-life/student-spaces/", "Find student spaces"],
                ["DFW Community", "Learn more about the Dallas–Fort Worth community beyond campus.", "https://utdallas.edu/dfw-community/", "Explore the DFW area"]
              ]},
              { heading: "International student connections", items: [
                ["ISSO On-Campus Resources", "Find university resources and support available to international students on campus.", "https://isso.utdallas.edu/isso-home/international-student-success/on-campus-resources/", "Find on-campus resources"],
                ["ISSO Off-Campus Resources", "Explore resources for navigating life and settling into the surrounding community.", "https://isso.utdallas.edu/isso-home/international-student-success/off-campus-resources/", "Find off-campus resources"],
                ["International Student Success Advising", "Learn about student success advising and support through ISSO.", "https://isso.utdallas.edu/isso-home/international-student-success/student-success-advising/", "Explore advising"]
              ]}
            ]
          },
          services: {
            title: "Student Services", intro: "Find university offices and support for academics, health, wellbeing, safety, and everyday needs.",
            groups: [
              { heading: "Academic and student support", items: [
                ["Student Services and Support", "A directory-style starting point for student services and support at UT Dallas.", "https://utdallas.edu/campus-life/student-services-support/", "Explore student services"],
                ["Academic Resources", "Find academic support and resources to help you navigate coursework and university life.", "https://utdallas.edu/academics/academic-resources/", "Explore academic resources"],
                ["UT Dallas Directory", "Look up university departments, offices, and contact information.", "https://utdallas.edu/directory/", "Search the directory"]
              ]},
              { heading: "Health, wellbeing, and safety", items: [
                ["Student Health Services", "Find campus health information and student health resources.", "https://utdallas.edu/campus-health/", "Explore health resources"],
                ["Mental Health Resources", "Review mental health and wellbeing support available through UT Dallas.", "https://utdallas.edu/mental-health-resources/", "Find wellbeing support"],
                ["Campus Safety", "Review university safety information and resources.", "https://utdallas.edu/safety/", "Review safety resources"],
                ["Emergency Information", "Keep the university's emergency information and contacts accessible.", "https://utdallas.edu/emergency/", "View emergency information"]
              ]}
            ]
          }
        };
        const page = pages[step];
        const q = communitySearch.trim().toLowerCase();
        return <main className="result-page directory-page">
          <div className="step-label">CAMPUS AND COMMUNITY</div>
          <h1>{page.title}</h1>
          <p className="intro">{page.intro}</p>
          <input aria-label={`Search ${page.title} resources`} className="search" value={communitySearch} onChange={event => setCommunitySearch(event.target.value)} placeholder={`Search ${page.title.toLowerCase()} resources...`} />
          {page.groups.map(group => {
            const matches = group.items.filter(item => `${item[0]} ${item[1]}`.toLowerCase().includes(q));
            if (!matches.length) return null;
            return <section className="directory-group" key={group.heading}><h2>{group.heading}</h2><div className="directory-grid">{matches.map(item => <article className="directory-card" key={item[0]}><h3>{item[0]}</h3><p>{item[1]}</p><a href={item[2]} target="_blank" rel="noreferrer">{item[3]} ↗</a></article>)}</div></section>;
          })}
          {!page.groups.some(group => group.items.some(item => `${item[0]} ${item[1]}`.toLowerCase().includes(q))) && <p className="muted no-results">No results found. Try another search.</p>}
          <div className="flow-actions"><button className="text-btn" onClick={() => setStep("home")}>← Home</button><button className="primary-btn" onClick={() => setStep("help")}>Find more resources</button></div>
        </main>;
      })()}

      <footer>UniPath · Student transition planning prototype</footer>
    </div>
  );
}

export default App;