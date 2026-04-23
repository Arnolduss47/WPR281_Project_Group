// Data
const STORAGE_KEYS = {
    issues: "issues",
    people: "people",
    projects: "projects" // Added this to fix hardcoding
};

const APP_PASSWORD = "password123";
const SUMMARY_OPTIONS = ["Login Issue", "Payment Problem", "UI Bug", "Performance Issue", "API Failure"];
const STATUS_OPTIONS = ["open", "resolved", "overdue"];
const PRIORITY_OPTIONS = ["low", "medium", "high"];

const DEFAULT_PEOPLE = [
    { id: 1, name: "Naledi", surname: "Mnisi", email: "naledi@admin.bugtracer.ac.za" , username: "Naledi.M"},
    { id: 2, name: "Angel", surname: "Mthenjane", email: "angel@admin.bugtracer.ac.za" , username: "Angle_mt"},
    { id: 3, name: "Armand", surname: "Bosman", email: "armand@admin.bugtracer.ac.za", username: "Armand444" },
    { id: 4, name: "Tshiamo", surname: "Manamela", email: "tshiamo@admin.bugtracer.ac.za", username: "Tshiamo_23" },
    
];

const DEFAULT_ISSUES = [
    { summary: "Login bug", desc: "Button broken", project: "Website", assigned: "Naledi", reporter: "Angel" , status: "open", priority: "high" ,dateCreated: "2026-03-12", targetDate: "2026-04-05"},
    { summary: "UI issue", desc: "Layout broken", project: "Website", assigned: "Angel",reporter: "Armand" , status: "resolved", priority: "medium", dateCreated: "2026-04-7", targetDate: "2026-04-20", resolvedDate: "2026-04-18", resolutionSummary: "Fixed CSS media queries" },
    { summary: "API error", desc: "No response", project: "Mobile App", assigned: "Armand",reporter: "Tshiamo" , status: "overdue", priority: "high", dateCreated: "2026-03-31", targetDate: "2026-04-15" },
    { summary: "Payment failure", desc: "Checkout not working", project: "Website", assigned: "Naledi",reporter: "Armand" , status: "open", priority: "high", dateCreated: "2026-04-01", targetDate: "2026-04-05" },
    { summary: "Slow API", desc: "Takes too long to respond", project: "Mobile App", assigned: "Angel",reporter: "Naledi" , status: "open", priority: "medium", dateCreated: "2026-04-02", targetDate: "2026-04-06" },
    { summary: "Crash on launch", desc: "App crashes immediately", project: "Mobile App", assigned: "Tshiamo",reporter: "Angle" , status: "resolved", priority: "high", dateCreated: "2026-04-01", targetDate: "2026-04-03", resolvedDate: "2026-04-02", resolutionSummary: "Fixed memory leak" },
    { summary: "Profile pic upload fails", desc: "Image upload returns 500 error", project: "Website", assigned: "Armand", reporter: "Naledi", status: "resolved", priority: "medium", dateCreated: "2026-03-25", targetDate: "2026-04-01", resolvedDate: "2026-03-30", resolutionSummary: "Increased server upload limit and fixed MIME type validation" },
    { summary: "Notification delay", desc: "Push notifications arrive 10+ minutes late", project: "Mobile App", assigned: "Naledi", reporter: "Armand", status: "open", priority: "medium", dateCreated: "2026-04-08", targetDate: "2026-04-28" },
    { summary: "Password reset broken", desc: "Reset email link expires immediately", project: "Website", assigned: "Angel", reporter: "Tshiamo", status: "overdue", priority: "high", dateCreated: "2026-03-15", targetDate: "2026-03-20" },
    { summary: "Map not loading", desc: "Google Maps fails on iOS Safari", project: "Mobile App", assigned: "Tshiamo", reporter: "Angel", status: "resolved", priority: "low", dateCreated: "2026-04-03", targetDate: "2026-04-10", resolvedDate: "2026-04-08", resolutionSummary: "Updated Maps SDK and added fallback tile layer" }
];

// Member 4: Updated state to load dynamic data
const state = {
    issues: JSON.parse(localStorage.getItem(STORAGE_KEYS.issues)) || DEFAULT_ISSUES,
    people: JSON.parse(localStorage.getItem(STORAGE_KEYS.people)) || DEFAULT_PEOPLE,
    // Fixes the hardcoded projects and it checks storage first, then defaults
    projects: JSON.parse(localStorage.getItem(STORAGE_KEYS.projects)) || ["Website", "Mobile App"],
    filters: { search: "", status: "", priority: "", assigned: "" },
    editingIssueId: null,
    editingPersonId: null
};

const elements = {
    loginPage: document.getElementById("loginPage"),
    dashboard: document.getElementById("dashboard"),
    peoplePage: document.getElementById("peoplePage"),
    viewPage: document.getElementById("viewPage"),
    formPage: document.getElementById("formPage"),
    statsPage: document.getElementById("statsPage"),
    issueTable: document.getElementById("issueTable"),
    overdueList: document.getElementById("overdueList"),
    table: document.getElementById("table"),
    pageTitle: document.getElementById("pageTitle"),
    formTitle: document.getElementById("formTitle"),
    details: document.getElementById("details"),
    openCount: document.getElementById("openCount"),
    resolvedCount: document.getElementById("resolvedCount"),
    overdueCount: document.getElementById("overdueCount"),
    error: document.getElementById("error"),
    pass: document.getElementById("pass"),
    searchBox: document.querySelector(".search-box"),
    filterBoxes: document.querySelectorAll(".filter-box"),
    summary: document.getElementById("summary"),
    desc: document.getElementById("desc"),
    project: document.getElementById("project"),
    assigned: document.getElementById("assigned"),
    status: document.getElementById("status"),
    priority: document.getElementById("priority"),
    dateCreated: document.getElementById("dateCreated"),
    targetDate: document.getElementById("targetDate"),
    resolutionSummary: document.getElementById("resolutionSummary"),
    resolvedDate: document.getElementById("resolvedDate"),
    reporter: document.getElementById("reporter"), 
    peopleList: document.getElementById("peopleList"),
    personForm: document.getElementById("personForm"),
    pName: document.getElementById("pName"),
    pSurname: document.getElementById("pSurname"),
    pEmail: document.getElementById("pEmail")
};

const overdueSection = elements.overdueList.parentElement;
const issueForm = document.querySelector("#formPage form");



// Setup


function loadArray(key, fallback) {
    try {
        const savedValue = JSON.parse(localStorage.getItem(key));
        return Array.isArray(savedValue) ? savedValue : fallback.map(item => ({ ...item }));
    } catch {
        return fallback.map(item => ({ ...item }));
    }
}

function normalizeIssue(issue) {
    return {
        summary: (issue.summary || "").trim(),
        desc: (issue.desc || "").trim(),
        reporter: (issue.reporter || "").trim(),  
        project: issue.project || state.projects[0],
        assigned: issue.assigned || state.people[0].name,
        status: issue.status || STATUS_OPTIONS[0],
        priority: issue.priority || PRIORITY_OPTIONS[0],
        dateCreated: issue.dateCreated || "",
        targetDate: issue.targetDate || "",
        resolvedDate: issue.resolvedDate || "",
        resolutionSummary: (issue.resolutionSummary || "").trim()
    };
}



function saveIssues() {
    localStorage.setItem(STORAGE_KEYS.issues, JSON.stringify(state.issues));
}

function savePeople() {
    localStorage.setItem(STORAGE_KEYS.people, JSON.stringify(state.people));
}

function uniqueValues(values) {
    return [...new Set(values.filter(Boolean))];
}

function escapeHtml(text) {
    return String(text)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#39;");
}

function labelText(value) {
    return value.charAt(0).toUpperCase() + value.slice(1);
}

function setOptions(selectElement, values, selectedValue = "", useLabelText = false) {
    selectElement.innerHTML = values
        .map(value => {
            const label = useLabelText ? labelText(value) : value;
            return `<option value="${escapeHtml(value)}">${escapeHtml(label)}</option>`;
        })
        .join("");

    if (selectedValue && values.includes(selectedValue)) {
        selectElement.value = selectedValue;
    } else if (values.length > 0) {
        selectElement.value = values[0];
    }
}



function hideAllPages() {
    elements.loginPage.style.display = "none";
    elements.dashboard.style.display = "none";
    elements.peoplePage.style.display = "none";
    elements.viewPage.style.display = "none";
    elements.formPage.style.display = "none";
    const projectsPage = document.getElementById("projectsPage"); //hides the projects page when switching pages
    if (projectsPage) projectsPage.style.display = "none";
}

function syncFilterInputs() {
    elements.searchBox.value = state.filters.search;
    if (elements.filterBoxes[0]) {
        elements.filterBoxes[0].value = state.filters.status;
    }
    if (elements.filterBoxes[1]) {
        elements.filterBoxes[1].value = state.filters.priority;
    }
}

function clearFilters(assigned = "") {
    state.filters = {
        search: "",
        status: "",
        priority: "",
        assigned
    };
    syncFilterInputs();
}

function isOverdue(issue) {
    if (!issue.targetDate || issue.status === "resolved") {
        return issue.status === "overdue";
    }

    const today = new Date();
    const targetDate = new Date(`${issue.targetDate}T00:00:00`);

    today.setHours(0, 0, 0, 0);
    return issue.status === "overdue" || targetDate < today;
}

function displayStatus(issue) {
    if (issue.status === "resolved") {
        return "resolved";
    }

    return isOverdue(issue) ? "overdue" : "open";
}

function statusBadge(status) {
    const classes = {
        open: "bg-primary",
        resolved: "bg-success",
        overdue: "bg-danger"
    };

    return `<span class="badge ${classes[status]}">${escapeHtml(labelText(status))}</span>`;
}

function priorityBadge(priority) {
    const classes = {
        low: "bg-secondary",
        medium: "bg-warning text-dark",
        high: "bg-danger"
    };

    return `<span class="badge ${classes[priority]}">${escapeHtml(labelText(priority))}</span>`;
}

function filteredIssues() {
    const searchText = state.filters.search.toLowerCase();

    return state.issues
        .map((issue, index) => ({ issue, index }))
        .filter(({ issue }) => {
            const status = displayStatus(issue);
            const matchesSearch =
                !searchText ||
                issue.summary.toLowerCase().includes(searchText) ||
                issue.assigned.toLowerCase().includes(searchText) ||
                issue.project.toLowerCase().includes(searchText);

            const matchesStatus = !state.filters.status || status === state.filters.status;
            const matchesPriority = !state.filters.priority || issue.priority === state.filters.priority;
            const matchesAssigned = !state.filters.assigned || issue.assigned === state.filters.assigned;

            return matchesSearch && matchesStatus && matchesPriority && matchesAssigned;
        });
}

function renderIssueTable() {
    const rows = filteredIssues();

    if (rows.length === 0) {
        elements.table.innerHTML = '<tr><td colspan="5" class="text-center text-muted">No issues found.</td></tr>';
        return;
    }

    elements.table.innerHTML = rows
        .map(({ issue, index }) => `
            <tr onclick="viewIssue(${index})">
                <td>${escapeHtml(issue.summary)}</td>
                <td>${escapeHtml(issue.project)}</td>
                <td>${priorityBadge(issue.priority)}</td>
                <td>${statusBadge(displayStatus(issue))}</td>
                <td>${escapeHtml(issue.assigned)}</td>
            </tr>
        `)
        .join("");
}

function renderOverdueList() {
    const overdueIssues = state.issues.filter(issue => displayStatus(issue) === "overdue");

    elements.overdueList.innerHTML = overdueIssues.length
        ? overdueIssues.map(issue => `<li>${escapeHtml(issue.summary)} (${escapeHtml(issue.assigned)})</li>`).join("")
        : "<li>No overdue issues.</li>";
}

function renderPeopleList() {
    if (state.people.length === 0) {
        elements.peopleList.innerHTML = '<div class="card p-3">No people added yet.</div>';
        return;
    }

    elements.peopleList.innerHTML = state.people
        .map(person => `
            <div class="person-card" onclick='showPersonIssues(${JSON.stringify(person.name)})'>
                <div class="person-info">
                    <div class="person-name">${escapeHtml(person.name)} ${escapeHtml(person.surname)}</div>
                    <div class="person-email">${escapeHtml(person.email)}</div>
                    <div class="person-email">@${escapeHtml(person.username || "N/A")}</div>
                </div>

                <div class="person-actions">
                    <button class="btn-edit" onclick="event.stopPropagation(); editPerson(${person.id})">Edit</button>
                    <button class="btn-delete" onclick="event.stopPropagation(); deletePerson(${person.id})">Delete</button>
                </div>
            </div>
        `)
        .join("");
}

function updateStats() {
    let open = 0;
    let resolved = 0;
    let overdue = 0;

    state.issues.forEach(issue => {
        const status = displayStatus(issue);

        if (status === "resolved") {
            resolved += 1;
        } else if (status === "overdue") {
            overdue += 1;
        } else {
            open += 1;
        }
    });

    elements.openCount.innerText = open;
    elements.resolvedCount.innerText = resolved;
    elements.overdueCount.innerText = overdue;
    renderOverdueList();
}

function issueDetails(issue) {
    return `
        <p><b>${escapeHtml(issue.summary)}</b></p>
        <p>${escapeHtml(issue.desc)}</p>
        <p><b>Reported By:</b> ${escapeHtml(issue.reporter || "N/A")}</p>
        <p><b>Status:</b> ${statusBadge(displayStatus(issue))}</p>
        <p><b>Priority:</b> ${priorityBadge(issue.priority)}</p>
        <p><b>Assigned:</b> ${escapeHtml(issue.assigned)}</p>
        <p><b>Project:</b> ${escapeHtml(issue.project)}</p>
        <p><b>Date Created:</b> ${escapeHtml(issue.dateCreated || "N/A")}</p>
        <p><b>Target Date:</b> ${escapeHtml(issue.targetDate || "N/A")}</p>
        <p><b>Resolved Date:</b> ${escapeHtml(issue.resolvedDate || "Not resolved")}</p>
        <p><b>Resolution:</b> ${escapeHtml(issue.resolutionSummary || "None")}</p>
    `;
}

function toggleResolutionFields(clearValues) {
    const resolved = elements.status.value === "resolved";

    elements.resolutionSummary.style.display = resolved ? "block" : "none";
    elements.resolvedDate.style.display = resolved ? "block" : "none";
    const resolvedDateLabel = document.getElementById("resolvedDateLabel");
    if (resolvedDateLabel) resolvedDateLabel.style.display = resolved ? "block" : "none";

    if (!resolved && clearValues) {
        elements.resolutionSummary.value = "";
        elements.resolvedDate.value = "";
    }
}

function resetIssueForm() {
    issueForm.reset();
    refreshFormOptions();
    elements.dateCreated.value = "";
    elements.targetDate.value = "";
    elements.resolutionSummary.value = "";
    elements.resolvedDate.value = "";
    toggleResolutionFields(true);
}

function fillIssueForm(issue) {
    refreshFormOptions(issue.summary, issue.project, issue.assigned, issue.status, issue.priority);
    elements.desc.value = issue.desc;
    elements.dateCreated.value = issue.dateCreated;
    elements.targetDate.value = issue.targetDate;
    elements.resolutionSummary.value = issue.resolutionSummary;
    elements.resolvedDate.value = issue.resolvedDate;
    toggleResolutionFields(false);
}

function currentIssueFromForm() {
    const issue = normalizeIssue({
        summary: elements.summary.value,
        desc: elements.desc.value,
        reporter: elements.reporter ? elements.reporter.value : "",   // ADD THIS LINE
        project: elements.project.value,
        assigned: elements.assigned.value,
        status: elements.status.value,
        priority: elements.priority.value,
        dateCreated: elements.dateCreated.value,
        targetDate: elements.targetDate.value,
        resolvedDate: elements.resolvedDate.value,
        resolutionSummary: elements.resolutionSummary.value
    });

    if (issue.status !== "resolved") {
        issue.resolvedDate = "";
        issue.resolutionSummary = "";
    }

    return issue;
}

function validateIssue(issue) {
    if (!issue.summary || !issue.desc) {
        return "Summary and description are required.";
    }

    if (!issue.project || !issue.assigned || !issue.status || !issue.priority) {
        return "Please select all dropdown fields.";
    }

    if (!issue.dateCreated || !issue.targetDate) {
        return "Please fill out all date fields.";
    }

    if (issue.targetDate < issue.dateCreated) {
        return "Target resolution date cannot be before the created date.";
    }

    if (issue.status === "resolved") {
        if (!issue.resolutionSummary || !issue.resolvedDate) {
            return "Resolved issues must include a resolution summary and resolved date.";
        }

        if (issue.resolvedDate < issue.dateCreated) {
            return "Resolved date cannot be before the created date.";
        }
    }

    return "";
}

// Navigation
function showDashboard() {
    state.lastPage = "dashboard";
    hideAllPages();
    elements.dashboard.style.display = "flex";
    elements.pageTitle.innerText = "Dashboard";
    elements.statsPage.style.display = "flex";
    elements.issueTable.style.display = "none";
    overdueSection.style.display = "block";
    updateStats();
}

function openIssueList(title) {
    state.lastPage = "issues";
    hideAllPages();
    elements.dashboard.style.display = "flex";
    elements.pageTitle.innerText = title;
    elements.statsPage.style.display = "none";
    elements.issueTable.style.display = "block";
    overdueSection.style.display = "none";
    syncFilterInputs();
    renderIssueTable();
}

function showAllIssues() {
    clearFilters();
    openIssueList("All Issues");
}

function showPeople() {
    hideAllPages();
    renderPeopleList();
    elements.peoplePage.style.display = "block";
}

function showCreate() {
    state.editingIssue = false; 
    state.editingIssueId = null; // clears any previous editing id
    state.selectedIssueIndex = null; //clears any previously sleceted issue
    elements.formTitle.innerText = "Create Issue";
    resetIssueForm();
    hideAllPages();
    elements.formPage.style.display = "block";
}

function goBack() {
    if (state.lastPage === "issues") {
        const title = state.filters.assigned ? `${state.filters.assigned}'s Issues` : "All Issues";
        openIssueList(title);
        return;
    }

    showDashboard();
}

// Login
function login(event) {
    event.preventDefault();

    if (elements.pass.value === APP_PASSWORD) {
        elements.error.innerText = "";
        showDashboard();
        return;
    }

    elements.error.innerText = "Wrong password";
}

// Issues
function viewIssue(index) {
    const issue = state.issues[index];

    if (!issue) {
        return;
    }

    state.selectedIssueIndex = index;
    elements.details.innerHTML = issueDetails(issue);
    hideAllPages();
    elements.viewPage.style.display = "block";
}

function editIssue() {
    const issue = state.issues[state.selectedIssueIndex];

    if (!issue) {
        return;
    }

    state.editingIssueId = issue.id || state.selectedIssueIndex; //sets editingIssueId so SaveIssue() updates and not create
    state.editingIssue = true; 
    elements.formTitle.innerText = "Edit Issue";
    fillIssueForm(issue);
    hideAllPages();
    elements.formPage.style.display = "block";
}

function deleteIssue() {
    if (state.selectedIssueIndex === null || !confirm("Delete issue?")) {
        return;
    }

    state.issues.splice(state.selectedIssueIndex, 1);
    saveIssues();
    refreshFormOptions();
    updateStats();
    goBack();
}
// Fills the Project, Assigned, and Reporter dropdowns with current data from state// This single function handles both Projects and Assigned People
function refreshFormOptions() {
    const projectSelect = document.getElementById('project');
    const assignedSelect = document.getElementById('assigned');
    const reporterSelect = document.getElementById('reporter');

    // 1. Fill Projects from state
    if (projectSelect) {
        projectSelect.innerHTML = ""; 
        state.projects.forEach(projectName => {
            const option = document.createElement('option');
            option.value = projectName;
            option.textContent = projectName;
            projectSelect.appendChild(option);
        });
    }

    // 2. Fill People from state
    if (assignedSelect) {
        assignedSelect.innerHTML = ""; 
        state.people.forEach(person => {
            const option = document.createElement('option');
            option.value = person.name; 
            option.textContent = person.name;
            assignedSelect.appendChild(option);
        });
    }

    // fills reporter dropdown with the same people list 
    if (reporterSelect) {
        reporterSelect.innerHTML = "";
        state.people.forEach(person => {
            const option = document.createElement('option');
            option.value = person.name;
            option.textContent = person.name;
            reporterSelect.appendChild(option);
        });
    }
}


 //Fixed Save Function with Validation and Persistence
function saveIssue(event) {
    event.preventDefault();

    // 1. Gather data from the form
    const issueData = {
        id: state.editingIssueId || Date.now(),
        summary: document.getElementById('summary').value,
        desc: document.getElementById('desc').value,
        project: document.getElementById('project').value,
        assigned: document.getElementById('assigned').value,
        status: document.getElementById('status').value,
        priority: document.getElementById('priority').value,
        dateCreated: document.getElementById('dateCreated').value,
        targetDate: document.getElementById('targetDate').value,
        resolutionSummary: document.getElementById('resolutionSummary').value,
        resolvedDate: document.getElementById('resolvedDate').value,
        reporter: document.getElementById('reporter') ? document.getElementById('reporter').value : ''
    };
    // 2. Validate the data
    const error = validateIssue(issueData); // Uses your existing validation function
    if (error) {
        alert(error);
        return; // Stops the save if there is an error
    }

    // 3. Decide whether to update or add
if (state.editingIssue && state.selectedIssueIndex !== null) {
    state.issues[state.selectedIssueIndex] = issueData; // overwrite
} else {
    state.issues.push(issueData); // add new
}

    // 4. Handle Projects
    // If the project doesn't exist in our list yet, add it
    if (!state.projects.includes(issueData.project)) 
    {
        state.projects.push(issueData.project);
        localStorage.setItem("projects", JSON.stringify(state.projects));   
    }

    // 5. Final Save and UI Refresh
    state.editingIssueId = null;
    saveIssues(); 
    refreshFormOptions(); // Updates dropdowns
    showDashboard(); // Goes back to main screen
    
   
    openIssueList("All Issues"); // Calls refreshed list 
}

// People
function showAddPerson() {
    if (elements.personForm.style.display === "none") {
        state.editingPersonId = null;
        elements.pName.value = "";
        elements.pSurname.value = "";
        elements.pEmail.value = "";
        elements.personForm.style.display = "block";
        return;
    }

    elements.personForm.style.display = "none";
}

function savePerson() {
    const name = elements.pName.value.trim();
    const surname = elements.pSurname.value.trim();
    const email = elements.pEmail.value.trim();
    const username = document.getElementById('pUsername') ? document.getElementById('pUsername').value.trim() : "";

    if (!name || !surname || !email) {
        alert("All fields are required.");
        return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        alert("Enter a valid email.");
        return;
    }

    if (state.editingPersonId !== null) {
        const person = state.people.find(item => item.id === state.editingPersonId);

        if (person) {
            const oldName = person.name;

            person.name = name;
            person.surname = surname;
            person.email = email;

            if (state.filters.assigned === oldName) {
                state.filters.assigned = name;
            }

            state.issues.forEach(issue => {
                if (issue.assigned === oldName) {
                    issue.assigned = name;
                }
            });

            saveIssues();
        }
    } else {
        state.people.push({
            id: Date.now(),
            name,
            surname,
            email,
            username
        });
    }

    savePeople();
    refreshFormOptions();
    renderPeopleList();
    elements.personForm.style.display = "none";
    elements.pName.value = "";
    elements.pSurname.value = "";
    elements.pEmail.value = "";
    state.editingPersonId = null;
}

function editPerson(id) {
    const person = state.people.find(item => item.id === id);

    if (!person) {
        return;
    }

    elements.pName.value = person.name;
    elements.pSurname.value = person.surname;
    elements.pEmail.value = person.email;
    state.editingPersonId = id;
    elements.personForm.style.display = "block";
}

function deletePerson(id) {
    const deletedPerson = state.people.find(person => person.id === id);

    if (!confirm("Delete this person?")) {
        return;
    }

    state.people = state.people.filter(person => person.id !== id);

    if (deletedPerson && state.filters.assigned === deletedPerson.name) {
        state.filters.assigned = "";
    }

    savePeople();
    refreshFormOptions();
    renderPeopleList();
}

function showPersonIssues(name) {
    clearFilters(name);
    openIssueList(`${name}'s Issues`);
}

// Filters
function searchIssues(text) {
    state.filters.search = text.trim();
    openIssueList(state.filters.assigned ? `${state.filters.assigned}'s Issues` : "All Issues");
}

function filterStatus(status) {
    state.filters.status = status;
    openIssueList(state.filters.assigned ? `${state.filters.assigned}'s Issues` : "All Issues");
}

function filterPriority(priority) {
    state.filters.priority = priority;
    openIssueList(state.filters.assigned ? `${state.filters.assigned}'s Issues` : "All Issues");
}

// Automatically checkS for overdue issues on startup
function updateOverdueStatuses() {
    const today = new Date().toISOString().split('T')[0]; 
    let hasChanged = false;

    state.issues.forEach(issue => {
        //  If status is open but target date has passed, it is overdue
        if (issue.status === "open" && issue.targetDate && issue.targetDate < today) {
            issue.status = "overdue";
            hasChanged = true;
        }
    });

    if (hasChanged) {
        saveIssues(); // Persist changes to localStorage
        renderIssueTable(); // Refreshes the UI list
    }
}

// Saves the current list of projects to localStorage so they persist after a page refresh
function saveProjects() {
    localStorage.setItem(STORAGE_KEYS.projects, JSON.stringify(state.projects));
}

// Navigates to the Projects page and renders the current project list
function showProjects() {
    hideAllPages();
    document.getElementById("projectsPage").style.display = "block";
    renderProjectList();
}

// Displays all projects as a list with a delete button next to each one
function renderProjectList() {
    const list = document.getElementById("projectList");
    if (!list) return;

    if (state.projects.length === 0) {
        list.innerHTML = '<li class="list-group-item">No projects yet.</li>';
        return;
    }

    list.innerHTML = state.projects
        .map(name => `
            <li class="list-group-item d-flex justify-content-between align-items-center">
                ${escapeHtml(name)}
                <button class="btn btn-sm btn-danger" onclick="deleteProject('${escapeHtml(name)}')">Delete</button>
            </li>
        `)
        .join("");
}

// Adds a new project to the list when the user types a name and clicks Add
// Validates that the name is not empty and does not already exist
function addNewProject() {
    const input = document.getElementById('newProjectName');
    const projectName = input.value.trim();

    if (!projectName) {
        alert("Please enter a project name.");
        return;
    }

    if (state.projects.includes(projectName)) {
        alert("That project already exists.");
        return;
    }

    state.projects.push(projectName);
    saveProjects();
    refreshFormOptions();
    renderProjectList();
    input.value = "";
}

// Removes a project from the list after asking the user to confirm
function deleteProject(name) {
    if (!confirm(`Delete project "${name}"?`)) return;

    state.projects = state.projects.filter(p => p !== name);
    saveProjects();
    renderProjectList();
    refreshFormOptions();
}

// Run this automatically when the script loads
updateOverdueStatuses();

// Saves all data (issues, people, projects) to localStorage in one call
// Useful to call after any major change to make sure nothing is lost
function saveAllData() {
    localStorage.setItem(STORAGE_KEYS.issues, JSON.stringify(state.issues));
    localStorage.setItem(STORAGE_KEYS.people, JSON.stringify(state.people));
    localStorage.setItem(STORAGE_KEYS.projects, JSON.stringify(state.projects));
}

document.addEventListener("DOMContentLoaded", () => {
    updateOverdueStatuses();
    refreshFormOptions(); // Fills all dropdowns with current data 
    
    elements.status.addEventListener("change", () => toggleResolutionFields(true));
    toggleResolutionFields(false); // Hides resolution fields on startup
    
    elements.loginPage.style.display = "flex"; // Shows login page first
    elements.dashboard.style.display = "none";
});
