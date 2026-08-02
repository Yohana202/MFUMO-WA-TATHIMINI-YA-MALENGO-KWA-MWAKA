// --- APP STATE & INITIALIZATION ---
document.addEventListener('DOMContentLoaded', () => {
    initApp();
    setTimeout(() => {
        syncFinanceData();
    }, 500);
});

function initApp() {
    setupEventListeners();
    updateDashboard();
    renderGoalsManagement();
    populateSubgoalSelect();
}

function setupEventListeners() {
    // 1. KUHIFADHI LENGO KUU
    const goalForm = document.getElementById('goal-form');
    if (goalForm) {
        goalForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const category = document.getElementById('goal-category').value;
            const title = document.getElementById('goal-title').value;
            const desc = document.getElementById('goal-desc').value;
            const budget = document.getElementById('goal-budget').value;
            const currentYear = document.getElementById('selected-year').value;

            const goals = getStoredGoals(currentYear);
            
            const newGoal = {
                id: Date.now(),
                category: category || 'JUMLA',
                title: title,
                desc: desc,
                budget: Number(budget || 0),
                subgoals: []
            };

            goals.push(newGoal);
            saveGoals(currentYear, goals);

            goalForm.reset();
            alert('Lengo Kuu limehifadhiwa kikamilifu!');
            updateDashboard();
            renderGoalsManagement();
            populateSubgoalSelect();
        });
    }

    // 2. KUHIFADHI TAARIFA YA WIKI
    const weeklyForm = document.getElementById('weekly-form');
    if (weeklyForm) {
        weeklyForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const subGoalId = document.getElementById('weekly-subgoal-select').value;
            const month = document.getElementById('weekly-month').value;
            const week = document.getElementById('weekly-week').value;
            const pct = document.getElementById('weekly-pct').value;
            const notes = document.getElementById('weekly-notes').value;
            const currentYear = document.getElementById('selected-year').value;

            if (!subGoalId) {
                alert('Tafadhali chagua Sub-Goal!');
                return;
            }

            const goals = getStoredGoals(currentYear);
            let updated = false;

            goals.forEach(goal => {
                goal.subgoals.forEach(sub => {
                    if (sub.id == subGoalId) {
                        if (!sub.weeklyLogs) sub.weeklyLogs = [];
                        sub.weeklyLogs.push({
                            id: Date.now(),
                            month: month,
                            week: week,
                            pct: Number(pct),
                            notes: notes,
                            date: new Date().toLocaleDateString('sw-TZ')
                        });
                        sub.currentPct = Number(pct);
                        updated = true;
                    }
                });
            });

            if (updated) {
                saveGoals(currentYear, goals);
                weeklyForm.reset();
                alert('Taarifa ya wiki imehifadhiwa kikamilifu!');
                updateDashboard();
                renderGoalsManagement();
            }
        });
    }
}

// --- LOCAL STORAGE HELPERS ---
function getStoredGoals(year) {
    const data = localStorage.getItem(`family_goals_${year}`);
    return data ? JSON.parse(data) : [];
}

function saveGoals(year, goals) {
    localStorage.setItem(`family_goals_${year}`, JSON.stringify(goals));
}

function changeYear() {
    updateDashboard();
    renderGoalsManagement();
    populateSubgoalSelect();
}

// --- NAVIGATION ---
function switchSection(sectionId, element) {
    document.querySelectorAll('.content-section').forEach(s => {
        s.style.display = 'none';
        s.classList.remove('active');
    });

    document.querySelectorAll('.nav-item').forEach(i => i.classList.remove('active'));

    const targetSection = document.getElementById(sectionId);
    if (targetSection) {
        targetSection.style.display = 'block';
        targetSection.classList.add('active');
    }

    if (element) element.classList.add('active');

    if (sectionId === 'dashboard') updateDashboard();
    if (sectionId === 'goals') renderGoalsManagement();
    if (sectionId === 'weekly-progress') populateSubgoalSelect();
    if (sectionId === 'finance-summary') syncFinanceData();
}

// --- DASHBOARD & RENDERING ---
function updateDashboard() {
    const currentYear = document.getElementById('selected-year').value;
    const goals = getStoredGoals(currentYear);

    document.getElementById('dash-total-goals').innerText = goals.length;

    let totalSubgoals = 0;
    let totalPctSum = 0;
    let t1Subgoals = 0;
    let t1PctSum = 0;
    let t2Subgoals = 0;
    let t2PctSum = 0;

    let html = '';

    goals.forEach(goal => {
        html += `
            <div style="border-bottom: 1px solid #eee; padding: 10px 0;">
                <h4><span style="background:#0284c7; color:#fff; padding:2px 6px; border-radius:4px; font-size:11px;">${goal.category || 'JUMLA'}</span> ${goal.title}</h4>
                <p style="font-size:13px; color:#666;">Bajeti: TZS ${goal.budget.toLocaleString()}</p>
                <ul style="padding-left:20px;">
        `;

        goal.subgoals.forEach(sub => {
            totalSubgoals++;
            totalPctSum += (sub.currentPct || 0);

            if (sub.term === 'term1') {
                t1Subgoals++;
                t1PctSum += (sub.currentPct || 0);
            } else {
                t2Subgoals++;
                t2PctSum += (sub.currentPct || 0);
            }

            html += `<li style="font-size:13px;">${sub.title} - <strong>${sub.currentPct || 0}%</strong></li>`;
        });

        if (goal.subgoals.length === 0) {
            html += `<li style="font-size:12px; color:#999;">Bado hakuna Sub-Goals</li>`;
        }

        html += `</ul></div>`;
    });

    document.getElementById('dashboard-goals-list').innerHTML = html || '<p>Hakuna malengo yaliyosajiliwa.</p>';

    const yearAvg = totalSubgoals > 0 ? Math.round(totalPctSum / totalSubgoals) : 0;
    const t1Avg = t1Subgoals > 0 ? Math.round(t1PctSum / t1Subgoals) : 0;
    const t2Avg = t2Subgoals > 0 ? Math.round(t2PctSum / t2Subgoals) : 0;

    document.getElementById('dash-year-progress').innerText = yearAvg + '%';
    document.getElementById('dash-term1-progress').innerText = t1Avg + '%';
    document.getElementById('dash-term2-progress').innerText = t2Avg + '%';
}

function renderGoalsManagement() {
    const currentYear = document.getElementById('selected-year').value;
    const goals = getStoredGoals(currentYear);
    const container = document.getElementById('goals-management-list');

    if (goals.length === 0) {
        container.innerHTML = '<p>Bado hujasajili Lengo Kuu la Mwaka huu.</p>';
        return;
    }

    let html = '';
    goals.forEach((goal, gIndex) => {
        html += `
            <div style="border:1px solid #e2e8f0; border-radius:8px; padding:15px; margin-bottom:15px; background:#fff;">
                <div style="display:flex; justify-content:space-between; align-items:center;">
                    <h3><span style="background:#0284c7; color:#fff; padding:2px 8px; border-radius:4px; font-size:12px;">${goal.category || 'JUMLA'}</span> ${goal.title}</h3>
                    <button class="btn btn-danger" style="padding:4px 8px; font-size:12px;" onclick="deleteGoal(${goal.id})">Futa</button>
                </div>
                <p style="color:#64748b; font-size:14px; margin:5px 0;">${goal.desc || ''}</p>
                <p style="font-weight:bold; color:#16a34a; font-size:14px;">Bajeti: TZS ${goal.budget.toLocaleString()}</p>
                
                <div style="margin-top:15px; background:#f8fafc; padding:10px; border-radius:6px;">
                    <h5 style="margin-bottom:8px;">Sub-Goals (Hatua Ndogo):</h5>
                    <ul>
        `;

        goal.subgoals.forEach(sub => {
            html += `
                <li style="margin-bottom:5px; font-size:13px; display:flex; justify-content:space-between;">
                    <span><strong>[${sub.term === 'term1' ? 'Term 1' : 'Term 2'}]</strong> ${sub.title} (${sub.currentPct || 0}%)</span>
                    <button style="color:red; border:none; background:none; cursor:pointer;" onclick="deleteSubgoal(${goal.id}, ${sub.id})">x</button>
                </li>
            `;
        });

        html += `
                    </ul>
                    <div style="margin-top:10px; display:flex; gap:5px; flex-wrap:wrap;">
                        <input type="text" id="sub-title-${goal.id}" placeholder="Jina la Sub-Goal" style="padding:5px; border:1px solid #ccc; border-radius:4px; flex:1;">
                        <select id="sub-term-${goal.id}" style="padding:5px; border:1px solid #ccc; border-radius:4px;">
                            <option value="term1">Term 1 (Jan-Jun)</option>
                            <option value="term2">Term 2 (Jul-Dis)</option>
                        </select>
                        <button class="btn btn-primary" style="padding:5px 10px; font-size:12px;" onclick="addSubgoal(${goal.id})">+ Ongeza</button>
                    </div>
                </div>
            </div>
        `;
    });

    container.innerHTML = html;
}

function addSubgoal(goalId) {
    const currentYear = document.getElementById('selected-year').value;
    const titleInput = document.getElementById(`sub-title-${goalId}`);
    const termInput = document.getElementById(`sub-term-${goalId}`);

    if (!titleInput.value) {
        alert('Tafadhali andika jina la Sub-Goal');
        return;
    }

    const goals = getStoredGoals(currentYear);
    const goal = goals.find(g => g.id === goalId);

    if (goal) {
        goal.subgoals.push({
            id: Date.now(),
            title: titleInput.value,
            term: termInput.value,
            currentPct: 0,
            weeklyLogs: []
        });

        saveGoals(currentYear, goals);
        renderGoalsManagement();
        updateDashboard();
        populateSubgoalSelect();
    }
}

function deleteGoal(goalId) {
    if (confirm('Je, una uhakika unataka kufuta lengo hii?')) {
        const currentYear = document.getElementById('selected-year').value;
        let goals = getStoredGoals(currentYear);
        goals = goals.filter(g => g.id !== goalId);
        saveGoals(currentYear, goals);
        renderGoalsManagement();
        updateDashboard();
        populateSubgoalSelect();
    }
}

function deleteSubgoal(goalId, subId) {
    const currentYear = document.getElementById('selected-year').value;
    const goals = getStoredGoals(currentYear);
    const goal = goals.find(g => g.id === goalId);
    if (goal) {
        goal.subgoals = goal.subgoals.filter(s => s.id !== subId);
        saveGoals(currentYear, goals);
        renderGoalsManagement();
        updateDashboard();
        populateSubgoalSelect();
    }
}

function populateSubgoalSelect() {
    const currentYear = document.getElementById('selected-year').value;
    const goals = getStoredGoals(currentYear);
    const select = document.getElementById('weekly-subgoal-select');

    if (!select) return;

    select.innerHTML = '<option value="">-- Chagua Sub-Goal --</option>';

    goals.forEach(goal => {
        goal.subgoals.forEach(sub => {
            select.innerHTML += `<option value="${sub.id}">[${goal.category || 'JUMLA'}] ${goal.title} -> ${sub.title}</option>`;
        });
    });
}

// --- REPORT GENERATION ---
function generateMonthlyReport() {
    const selectedMonth = document.getElementById('report-month-select').value;
    const currentYear = document.getElementById('selected-year').value;

    document.getElementById('report-title').innerText = `Tathmini ya Malengo - Mwezi wa ${selectedMonth} ${currentYear}`;
    document.getElementById('report-subtitle').innerText = `Taarifa ya maendeleo ya malengo kwa Mwezi wa ${selectedMonth}.`;

    const goals = getStoredGoals(currentYear);
    let html = '';

    if (goals.length === 0) {
        document.getElementById('report-content').innerHTML = '<p>Hakuna malengo yaliyosajiliwa kwa mwaka huu.</p>';
        return;
    }

    goals.forEach(goal => {
        html += `
            <div style="border:1px solid #ddd; padding:15px; margin-bottom:15px; border-radius:8px;">
                <h4 style="margin:0 0 5px 0; color:#1e293b;">
                    <span style="background:#0284c7; color:#fff; padding:2px 8px; border-radius:4px; font-size:12px;">${goal.category || 'JUMLA'}</span>
                    ${goal.title}
                </h4>
                <p style="font-size:13px; color:#64748b; margin-bottom:10px;">${goal.desc || 'Bila maelezo'}</p>
                <ul style="padding-left:20px; margin:0;">
        `;

        let monthlyCount = 0;
        goal.subgoals.forEach(sub => {
            const logs = (sub.weeklyLogs || []).filter(l => l.month === selectedMonth);
            if (logs.length > 0) {
                monthlyCount++;
                const last = logs[logs.length - 1];
                html += `<li style="font-size:13px;"><strong>${sub.title}:</strong> ${last.pct}% <em>(${last.week} - ${last.notes || ''})</em></li>`;
            }
        });

        if (monthlyCount === 0) {
            html += `<li style="font-size:12px; color:#94a3b8; list-style:none;">Hakuna taarifa za wiki zilizojazwa kwa mwezi wa ${selectedMonth}.</li>`;
        }

        html += `</ul></div>`;
    });

    document.getElementById('report-content').innerHTML = html;
}

function generateReport(term) {
    const currentYear = document.getElementById('selected-year').value;
    const goals = getStoredGoals(currentYear);

    let titleText = term === 'yearly' ? `Ripoti ya Mwaka Mzima ${currentYear}` : (term === 'term1' ? `Ripoti ya Term 1 (Jan-Jun ${currentYear})` : `Ripoti ya Term 2 (Jul-Dis ${currentYear})`);

    document.getElementById('report-title').innerText = titleText;
    document.getElementById('report-subtitle').innerText = 'Muhtasari wa maendeleo ya Sub-Goals zote na hatua zilizofikiwa.';

    let html = '';

    goals.forEach(goal => {
        html += `
            <div style="border:1px solid #ddd; padding:15px; margin-bottom:15px; border-radius:8px;">
                <h4><span style="background:#0284c7; color:#fff; padding:2px 6px; border-radius:4px; font-size:11px;">${goal.category || 'JUMLA'}</span> ${goal.title}</h4>
                <ul style="padding-left:20px;">
        `;

        const subgoalsToReport = goal.subgoals.filter(s => term === 'yearly' || s.term === term);

        subgoalsToReport.forEach(sub => {
            html += `<li style="font-size:13px;"><strong>${sub.title}:</strong> Progress: ${sub.currentPct || 0}%</li>`;
        });

        if (subgoalsToReport.length === 0) {
            html += `<li style="font-size:12px; color:#999; list-style:none;">Hakuna Sub-Goals kwenye muhula huu.</li>`;
        }

        html += `</ul></div>`;
    });

    document.getElementById('report-content').innerHTML = html || '<p>Hakuna taarifa za kuonyesha.</p>';
}

function downloadPDF() {
    const element = document.getElementById('printable-area');
    const opt = {
        margin:       0.5,
        filename:     'Tathmini_ya_Malengo.pdf',
        image:        { type: 'jpeg', quality: 0.98 },
        html2canvas:  { scale: 2 },
        jsPDF:        { unit: 'in', format: 'letter', orientation: 'portrait' }
    };
    html2pdf().set(opt).from(element).save();
}

// --- FINANCE INTEGRATION ---
function syncFinanceData() {
    const rawData = localStorage.getItem('mPEP_financial_data');
    if (!rawData) {
        return;
    }

    const finData = JSON.parse(rawData);

    const totalIncome = (finData.incomes || []).reduce((sum, item) => sum + Number(item.amount || 0), 0);
    const totalExpenses = (finData.expenses || []).reduce((sum, item) => sum + Number(item.amount || 0), 0);
    const totalSavings = (finData.expenses || [])
        .filter(item => item.category === 'Akiba')
        .reduce((sum, item) => sum + Number(item.amount || 0), 0);

    const netBalance = totalIncome - totalExpenses;

    const incElem = document.getElementById('fin-total-income');
    const expElem = document.getElementById('fin-total-expenses');
    const savElem = document.getElementById('fin-total-savings');
    const netElem = document.getElementById('fin-net-balance');

    if (incElem) incElem.innerText = 'TZS ' + totalIncome.toLocaleString();
    if (expElem) expElem.innerText = 'TZS ' + totalExpenses.toLocaleString();
    if (savElem) savElem.innerText = 'TZS ' + totalSavings.toLocaleString();
    if (netElem) {
        netElem.innerText = 'TZS ' + netBalance.toLocaleString();
        netElem.style.color = netBalance >= 0 ? '#16a34a' : '#ef4444';
    }
}
