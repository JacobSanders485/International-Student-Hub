import React, { useEffect, useMemo, useState } from "react";

const STORAGE_KEY = "internationalStudentHub.task2.v1";

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

function formatDate(value) {
  if (!value) return "No date";
  return new Date(`${value}T12:00:00`).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
}

function App() {
  const [state, setState] = useState(initialState);
  const [step, setStep] = useState("home");
  const [chosenType, setChosenType] = useState(state.type);
  const [filter, setFilter] = useState("All");
  const [helpSearch, setHelpSearch] = useState("");
  const [newTaskName, setNewTaskName] = useState("");
  const [newTaskCategory, setNewTaskCategory] = useState("Personal");
  const [newTaskDescription, setNewTaskDescription] = useState("");
  const [newTaskDue, setNewTaskDue] = useState("");

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

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
    ["Travel & Visa", "Questions about travel documents, visa information, and preparing to travel.", "Review official ISSO travel guidance and contact an advisor if your situation is unclear."],
    ["Maintaining Student Status", "Enrollment, I-20 updates, and questions about maintaining student status.", "Check relevant ISSO guidance before changing enrollment or your program."],
    ["Work & Employment", "Questions about CPT, OPT, and employment authorization.", "Review ISSO employment guidance and confirm timing before accepting or beginning work."],
    ["Documents & Forms", "Finding forms, understanding documentation, and where to submit requests.", "Locate the current official form and instructions through UTD."]
  ];
  const visibleTopics = topics.filter(topic => topic.join(" ").toLowerCase().includes(helpSearch.toLowerCase()));

  return (
    <div className="app-shell">
      <header className="topbar">
        <div className="brand"><span className="brand-mark">✳</span><span>International Student Hub</span></div>
        <nav>
          <button onClick={() => setStep("home")}>Home</button>
          <button className="login" onClick={() => alert("Sign Out is not implemented yet.")}>
            Sign Out
          </button>
        </nav>
      </header>

      {step === "home" && <main className="home-page">
        <h1>Welcome, Student!</h1>
        <p className="intro">Find resources, organize your next steps, and make your transition easier.</p>
        <div className="home-cards">
          <button className="home-card" onClick={() => setStep("help")}><span className="art mint" /><strong>Find Help</strong><small>Find university resources and support.</small><span className="card-link">Learn more →</span></button>
          <section className="home-card checklist-home-card">
            <span className="art sunset" />
            <strong>My Checklist</strong>

            {state.created ? (
              <>
                <small>
                  {counts.done}/{counts.total} tasks completed
                </small>

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
                    Enter
                  </button>

                  <button
                    className="card-link-button"
                    onClick={() => setStep("create")}
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
          <button className="home-card" onClick={() => setStep("create")}><span className="art ocean" /><strong>My Plan</strong><small>Organize your transition timeline.</small><span className="card-link">View →</span></button>
        </div>
        <div className="home-secondary">
          {["Events", "Transportation", "Community", "Services"].map((name, i) =>
            <button key={name} className="home-card mini-card" onClick={() => setStep("help")}><span className={`art ${["ocean","mint","sunset","mint"][i]}`} /><strong>{name}</strong><small>Explore local support.</small><span className="card-link">Learn →</span></button>)}
        </div>
      </main>}

      {step === "create" && <main className="flow-page">
        <div className="step-label">MY CHECKLIST · STEP 1 OF 2</div>
        <h1>What are you preparing for?</h1>
        <p className="intro">Choose the transition that best describes your situation.</p>
        <div className="type-grid">
          {transitionTypes.map(type => <button key={type.name} className={`type-card ${chosenType === type.name ? "selected" : ""}`} onClick={() => setChosenType(type.name)}>
            <span className={`art ${type.art}`} /><strong>{type.name}</strong><small>{type.detail}</small><span className="card-link">Select →</span>
          </button>)}
        </div>
        <div className="flow-actions"><button className="text-btn" onClick={() => setStep("home")}>← Back</button><button className="primary-btn" onClick={() => setStep("details")}>Continue</button></div>
      </main>}

      {step === "details" && <main className="flow-page details-page">
        <div className="step-label">MY CHECKLIST · STEP 2 OF 2</div>
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
        <div className="step-label">YOUR PERSONALIZED PLAN</div>
        <h1>Generated Checklist</h1>
        <p className="intro">{state.type} · {state.current} → {state.target}</p>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Done</th>
                <th>Task</th>
                <th>Suggested date</th>
                <th>Action</th>
              </tr>
            </thead>

            <tbody>
              {sortedTasks.map(task => (
                <tr key={task.id}>
                  <td>
                    <input
                      type="checkbox"
                      checked={task.done}
                      onChange={event =>
                        updateTask(task.id, { done: event.target.checked })
                      }
                      aria-label={`Complete ${task.name}`}
                    />
                  </td>

                  <td>
                    <strong>{task.name}</strong>
                    <small>{task.category}</small>
                    {task.description && <small>{task.description}</small>}
                  </td>

                  <td>
                    <input
                      type="date"
                      value={task.due}
                      onChange={event =>
                        updateTask(task.id, { due: event.target.value })
                      }
                    />
                  </td>

                  <td>
                    <button
                      className="delete-task-btn"
                      onClick={() => deleteTask(task.id)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
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
        <div className="flow-actions"><button className="text-btn" onClick={() => setStep("details")}>← Edit details</button><button className="primary-btn" onClick={() => setStep("dashboard")}>View Dashboard</button></div>
      </main>}

      {step === "dashboard" && <main className="result-page dashboard-page">
        <div className="step-label">YOUR PROGRESS</div>
        <h1>Checklist Dashboard</h1>
        <div className="progress-box"><div className="progress-bar"><span style={{ width: `${counts.percent}%` }} /></div><strong>{counts.percent}%</strong></div>
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

      {step === "help" && <main className="result-page help-page">
        <div className="step-label">OFFICIAL RESOURCES</div><h1>Find Help</h1>
        <p className="intro">Choose a topic to find a starting point for university support.</p>
        <input className="search" value={helpSearch} onChange={event => setHelpSearch(event.target.value)} placeholder="Search travel, employment, documents..." />
        <div className="topic-list">{visibleTopics.map(topic => <article key={topic[0]}><h2>{topic[0]}</h2><p>{topic[1]}</p><small>{topic[2]}</small></article>)}</div>
        <div className="flow-actions"><button className="text-btn" onClick={() => setStep("home")}>← Home</button><a className="primary-btn link-btn" href="https://isso.utdallas.edu/" target="_blank" rel="noreferrer">Open UTD ISSO ↗</a></div>
      </main>}
      <footer>International Student Hub · Student transition planning prototype</footer>
    </div>
  );
}

export default App;