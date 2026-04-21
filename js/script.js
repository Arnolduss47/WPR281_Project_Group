// Data
const STORAGE_KEYS = {
    issues: "issues",
    people: "people"
};

const APP_PASSWORD = "password123";
const SUMMARY_OPTIONS = ["Login Issue", "Payment Problem", "UI Bug", "Performance Issue", "API Failure"];
const PROJECT_OPTIONS = ["Website", "Mobile App"];
const STATUS_OPTIONS = ["open", "resolved", "overdue"];
const PRIORITY_OPTIONS = ["low", "medium", "high"];

const DEFAULT_PEOPLE = [
    { id: 1, name: "Naledi", surname: "Mnisi", email: "naledi@admin.bugtracer.ac.za" },
    { id: 2, name: "Angel", surname: "Mthenjwa", email: "angel@admin.bugtracer.ac.za" },
    { id: 3, name: "Armand", surname: "Bosman", email: "armand@admin.bugtracer.ac.za" },
    { id: 4, name: "Tshiamo", surname: "Manamela", email: "tshiamo@admin.bugtracer.ac.za" }
];

const DEFAULT_ISSUES = [
    { summary: "Login bug", desc: "Button broken", project: "Website", assigned: "Naledi", status: "open", priority: "high" },
    { summary: "UI issue", desc: "Layout broken", project: "Website", assigned: "Angel", status: "resolved", priority: "medium" },
    { summary: "API error", desc: "No response", project: "Mobile App", assigned: "Armand", status: "overdue", priority: "high" },
    { summary: "Payment failure", desc: "Checkout not working", project: "Website", assigned: "Naledi", status: "open", priority: "high", dateCreated: "2026-04-01", targetDate: "2026-04-05" },
    { summary: "Slow API", desc: "Takes too long to respond", project: "Mobile App", assigned: "Angel", status: "open", priority: "medium", dateCreated: "2026-04-02", targetDate: "2026-04-06" },
    { summary: "Crash on launch", desc: "App crashes immediately", project: "Mobile App", assigned: "Tshiamo", status: "resolved", priority: "high", dateCreated: "2026-04-01", targetDate: "2026-04-03", resolvedDate: "2026-04-02", resolutionSummary: "Fixed memory leak" }
];

const state = {
    issues: loadArray(STORAGE_KEYS.issues, DEFAULT_ISSUES).map(normalizeIssue),
    people: loadArray(STORAGE_KEYS.people, DEFAULT_PEOPLE),
    selectedIssueIndex: null,
    editingIssue: false,
    editingPersonId: null,
    lastPage: "dashboard",
    filters: {
        search: "",
        status: "",
        priority: "",
        assigned: ""
    }
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
    peopleList: document.getElementById("peopleList"),
    personForm: document.getElementById("personForm"),
    pName: document.getElementById("pName"),
    pSurname: document.getElementById("pSurname"),
    pEmail: document.getElementById("pEmail")
};

const overdueSection = elements.overdueList.parentElement;
const issueForm = document.querySelector("#formPage form");

initializeApp();

// Setup
function initializeApp() {
    refreshFormOptions();
    renderPeopleList();
    toggleResolutionFields();
    elements.status.addEventListener("change", () => toggleResolutionFields(true));
    saveIssues();
    savePeople();
}

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
        project: issue.project || PROJECT_OPTIONS[0],
        assigned: issue.assigned || DEFAULT_PEOPLE[0].name,
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

function refreshFormOptions(selectedSummary = "", selectedProject = "", selectedAssigned = "", selectedStatus = "", selectedPriority = "") {
    const summaryValues = uniqueValues([
        ...SUMMARY_OPTIONS,
        ...state.issues.map(issue => issue.summary),
        selectedSummary
    ]);
    const assignedValues = uniqueValues([
        ...state.people.map(person => person.name),
        selectedAssigned
    ]);

    setOptions(elements.summary, summaryValues, selectedSummary);
    setOptions(elements.project, PROJECT_OPTIONS, selectedProject);
    setOptions(elements.assigned, assignedValues, selectedAssigned);
    setOptions(elements.status, STATUS_OPTIONS, selectedStatus, true);
    setOptions(elements.priority, PRIORITY_OPTIONS, selectedPriority, true);
}

function hideAllPages() {
    elements.loginPage.style.display = "none";
    elements.dashboard.style.display = "none";
    elements.peoplePage.style.display = "none";
    elements.viewPage.style.display = "none";
    elements.formPage.style.display = "none";
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
    state.selectedIssueIndex = null;
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

function saveIssue(event) {
    event.preventDefault();

    const issue = currentIssueFromForm();
    const errorMessage = validateIssue(issue);

    if (errorMessage) {
        alert(errorMessage);
        return;
    }

    if (state.editingIssue && state.selectedIssueIndex !== null) {
        state.issues[state.selectedIssueIndex] = issue;
    } else {
        state.issues.push(issue);
    }

    saveIssues();
    refreshFormOptions(issue.summary);
    updateStats();
    showDashboard();
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
            email
        });
    }

    savePeople();
    refreshFormOptions("", "", elements.assigned.value, elements.status.value, elements.priority.value);
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
