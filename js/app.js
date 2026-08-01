let goalsData = JSON.parse(localStorage.getItem('mPEP_goals_data')) || {};
let currentYear = '2026';

document.addEventListener('DOMContentLoaded', () => {
    initGoalsApp();
});

function initGoalsApp() {
    currentYear = document.getElementById('selected-year').value;
    if (!goalsData[currentYear]) {
        goalsData[currentYear] = [];
    }
    updateDashboard();
    renderGoalsManagement();
    populateWeeklySubgoalsSelect();
}

function saveData() {
    localStorage.setItem('mPEP_goals_data', JSON.stringify(goalsData));
}

function changeYear() {
    currentYear = document.getElementById('selected-year').value;
    if (!goalsData[currentYear]) goalsData[currentYear] = [];
    initGoalsApp();
}

function switchSection(sectionId, element) {
    document.querySelectorAll('.content-section').forEach(s => s.classList.remove('active'));
    document.querySelectorAll('.nav-item').forEach(i => i.classList.remove('active'));

    const targetSection = document.getElementById(sectionId);
    if (targetSection) {
        targetSection.classList.add('active');
    }

    if (element) element.classList.add('active');

    if (sectionId === 'dashboard') updateDashboard();
    if (sectionId === 'goals') renderGoalsManagement();
    if (sectionId === 'weekly-progress') populateWeeklySubgoalsSelect();
    if (sectionId === 'finance-summary') syncFinanceData();
}


// REGISTER GOAL
document.getElementById('goal-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const title = document.getElementById('goal-title').value;
    const desc = document.getElementById('goal-desc').value;
    const budget = parseFloat(document.getElementById('goal-budget').value) || 0;

    const newGoal = {
        id: Date.now(),
        title,
        desc,
        budget,
        subgoals: []
    };

    goalsData[currentYear].push(newGoal);
    saveData();
    document.getElementById('goal-form').reset();
    renderGoalsManagement();
    updateDashboard();
    alert('Lengo Kuu limehifadhiwa!');
});

// ADD SUBGOAL
function addSubGoal(goalId) {
    const title = prompt("Ingiza Jina la Lengo Dogo (Sub-Goal):");
    if (!title) return;

    const term = prompt("Chagua Term (Andika '1' kwa Term 1 au '2' kwa Term 2):");
    const termValue = term === '2' ? 'Term 2' : 'Term 1';

    const goal = goalsData[currentYear].find(g => g.id === goalId);
    if (goal) {
        goal.subgoals.push({
            id: Date.now(),
            title,
            term: termValue,
            progress: 0,
            updates: []
        });
        saveData();
        renderGoalsManagement();
        updateDashboard();
    }
}

// RENDER GOALS MANAGEMENT
function renderGoalsManagement() {
    const container = document.getElementById('goals-management-container');
    const currentGoals = goalsData[currentYear] || [];

    if (currentGoals.length === 0) {
        container.innerHTML = '<p>Hakuna malengo yaliyosajiliwa kwa mwaka huu.</p>';
        return;
    }

    container.innerHTML = currentGoals.map(goal => `
        <div class="form-container">
            <h3>${goal.title} <small style="font-weight:normal; font-size:0.9rem;">(Bajeti: TZS ${goal.budget.toLocaleString()})</small></h3>
            <p style="color:#666; margin-bottom:10px;">${goal.desc}</p>
            <button class="btn btn-secondary" onclick="addSubGoal(${goal.id})">+ Ongeza Lengo Dogo (Sub-Goal)</button>
            
            <div style="margin-top:15px;">
                ${goal.subgoals.length === 0 ? '<p style="font-size:0.85rem; color:#888;">Hakuna malengo madogo yaliyowekwa.</p>' : 
                goal.subgoals.map(sub => `
                    <div class="subgoal-card">
                        <strong>[${sub.term}] ${sub.title}</strong> - Progress: <strong>${sub.progress}%</strong>
                        <div class="progress-bar-bg">
                            <div class="progress-bar-fill ${getBarClass(sub.progress)}" style="width:${sub.progress}%"></div>
                        </div>
                    </div>
                `).join('')}
            </div>
        </div>
    `).join('');
}

// POPULATE WEEKLY SUBGOALS DROPDOWN
function populateWeeklySubgoalsSelect() {
    const select = document.getElementById('weekly-subgoal-select');
    select.innerHTML = '<option value="">Chagua Lengo Dogo...</option>';

    const currentGoals = goalsData[currentYear] || [];
    currentGoals.forEach(goal => {
        goal.subgoals.forEach(sub => {
            const opt = document.createElement('option');
            opt.value = `${goal.id}_${sub.id}`;
            opt.textContent = `${goal.title} -> [${sub.term}] ${sub.title}`;
            select.appendChild(opt);
        });
    });
}

// WEEKLY FORM SUBMIT
document.getElementById('weekly-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const val = document.getElementById('weekly-subgoal-select').value;
    if (!val) return;

    const [goalId, subId] = val.split('_').map(Number);
    const month = document.getElementById('weekly-month').value;
    const week = document.getElementById('weekly-week').value;
    const pct = parseFloat(document.getElementById('weekly-pct').value);
    const notes = document.getElementById('weekly-notes').value;

    const goal = goalsData[currentYear].find(g => g.id === goalId);
    if (goal) {
        const sub = goal.subgoals.find(s => s.id === subId);
        if (sub) {
            sub.progress = pct;
            sub.updates.push({ date: new Date().toISOString().slice(0, 10), month, week, pct, notes });
            saveData();
            document.getElementById('weekly-form').reset();
            updateDashboard();
            alert('Progress ya wiki imehifadhiwa!');
        }
    }
});

// DASHBOARD CALCULATIONS
function updateDashboard() {
    const currentGoals = goalsData[currentYear] || [];
    let totalSubgoals = 0;
    let sumProgress = 0;

    let term1Count = 0, term1Sum = 0;
    let term2Count = 0, term2Sum = 0;

    currentGoals.forEach(g => {
        g.subgoals.forEach(s => {
            totalSubgoals++;
            sumProgress += s.progress;

            if (s.term === 'Term 1') {
                term1Count++;
                term1Sum += s.progress;
            } else {
                term2Count++;
                term2Sum += s.progress;
            }
        });
    });

    const overallYear = totalSubgoals > 0 ? (sumProgress / totalSubgoals).toFixed(1) : 0;
    const overallTerm1 = term1Count > 0 ? (term1Sum / term1Count).toFixed(1) : 0;
    const overallTerm2 = term2Count > 0 ? (term2Sum / term2Count).toFixed(1) : 0;

    document.getElementById('dash-total-goals').innerText = currentGoals.length;
    document.getElementById('dash-year-progress').innerText = `${overallYear}%`;
    document.getElementById('dash-term1-progress').innerText = `${overallTerm1}%`;
    document.getElementById('dash-term2-progress').innerText = `${overallTerm2}%`;

    // Render Dashboard Goals Overview
    const overviewContainer = document.getElementById('dashboard-goals-list');
    overviewContainer.innerHTML = currentGoals.length === 0 ? '<p>Hakuna malengo yaliyosajiliwa bado.</p>' :
        currentGoals.map(g => {
            const gSubCount = g.subgoals.length;
            const gProgress = gSubCount > 0 ? (g.subgoals.reduce((a, b) => a + b.progress, 0) / gSubCount).toFixed(1) : 0;
            return `
                <div style="margin-bottom:15px; border-bottom:1px solid #eee; padding-bottom:10px;">
                    <div style="display:flex; justify-content:space-between;">
                        <strong>${g.title}</strong>
                        <span>${gProgress}%</span>
                    </div>
                    <div class="progress-bar-bg">
                        <div class="progress-bar-fill ${getBarClass(gProgress)}" style="width:${gProgress}%"></div>
                    </div>
                </div>
            `;
        }).join('');
}

function getBarClass(pct) {
    if (pct >= 75) return 'high';
    if (pct >= 40) return 'medium';
    return 'low';
}

// GENERATE REPORTS
function generateReport(type) {
    const currentGoals = goalsData[currentYear] || [];
    const reportArea = document.getElementById('report-content');
    
    let filterTitle = type === 'term1' ? 'Term 1 (Januari - Juni)' : (type === 'term2' ? 'Term 2 (Julai - Disemba)' : 'Mwaka Mzima');
    document.getElementById('report-title').innerText = `Ripoti ya Tathmini ya Malengo - ${filterTitle}`;
    document.getElementById('report-subtitle').innerText = `Mwaka: ${currentYear}`;

    reportArea.innerHTML = currentGoals.map(g => {
        const subs = g.subgoals.filter(s => type === 'yearly' || (type === 'term1' ? s.term === 'Term 1' : s.term === 'Term 2'));
        if (subs.length === 0) return '';

        return `
            <div style="margin-bottom:20px;">
                <h3>${g.title}</h3>
                ${subs.map(s => `
                    <div style="margin-left:15px; margin-top:8px;">
                        <p><strong>[${s.term}] ${s.title}:</strong> Progress - ${s.progress}%</p>
                        <ul style="margin-left:20px; font-size:0.9rem; color:#555;">
                            ${s.updates.map(u => `<li>${u.month} (${u.week}): ${u.notes} [${u.pct}%]</li>`).join('')}
                        </ul>
                    </div>
                `).join('')}
            </div>
        `;
    }).join('') || '<p>Hakuna taarifa za malengo kwenye kipindi hiki.</p>';
}

function downloadPDF() {
    const element = document.getElementById('printable-area');
    html2pdf().from(element).save(`Tathmini_Malengo_${currentYear}.pdf`);
}
// ==========================================
// INTEGRATION NA MFUMO WA FEDHA (FINANCE SYNC)
// ==========================================

function syncFinanceData() {
    // Kusoma data za mfumo wa fedha kutoka LocalStorage
    const financeRawData = localStorage.getItem('mPEP_financial_data');

    if (!financeRawData) {
        console.log("Hakuna data zilizopatikana kutoka Mfumo wa Fedha kwenye kivinjari hiki.");
        return;
    }

    try {
        const financeData = JSON.parse(financeRawData);

        // Kukokotoa Mapato
        const totalIncome = (financeData.incomes || []).reduce((sum, item) => sum + Number(item.amount || 0), 0);

        // Kukokotoa Matumizi yote
        const totalExpenses = (financeData.expenses || []).reduce((sum, item) => sum + Number(item.amount || 0), 0);

        // Kukokotoa Akiba specifically (kutoka kundi la 'Akiba')
        const totalSavings = (financeData.expenses || [])
            .filter(item => item.category === 'Akiba')
            .reduce((sum, item) => sum + Number(item.amount || 0), 0);

        const netBalance = totalIncome - totalExpenses;

        // Kujaza kwenye Mfumo wa Malengo (DOM)
        if (document.getElementById('fin-total-income')) {
            document.getElementById('fin-total-income').innerText = `TZS ${totalIncome.toLocaleString()}`;
            document.getElementById('fin-total-expenses').innerText = `TZS ${totalExpenses.toLocaleString()}`;
            document.getElementById('fin-total-savings').innerText = `TZS ${totalSavings.toLocaleString()}`;
            document.getElementById('fin-net-balance').innerText = `TZS ${netBalance.toLocaleString()}`;
        }

        // Ulinganisho na Malengo
        renderFinanceComparison(totalSavings);
    } catch (e) {
        console.error("Kosa wakati wa kusoma data za Mfumo wa Fedha:", e);
    }
}

// ULINGANISHO WA AKIBA DHIDI YA BAJETI YA MALENGO
function renderFinanceComparison(totalSavings) {
    const container = document.getElementById('finance-goal-comparison');
    if (!container) return;

    const currentGoals = goalsData[currentYear] || [];
    const totalBudget = currentGoals.reduce((sum, g) => sum + Number(g.budget || 0), 0);

    const coveragePct = totalBudget > 0 ? ((totalSavings / totalBudget) * 100).toFixed(1) : 0;

    container.innerHTML = `
        <div style="background: #f8fafc; padding: 15px; border-radius: 8px; border-left: 4px solid #0284c7;">
            <h4>Utekelezaji wa Bajeti ya Mwaka (${currentYear})</h4>
            <p style="margin: 8px 0;">Jumla ya Bajeti ya Malengo Yote: <strong>TZS ${totalBudget.toLocaleString()}</strong></p>
            <p style="margin: 8px 0;">Akiba Iliyokusanywa (Mfumo wa Fedha): <strong>TZS ${totalSavings.toLocaleString()}</strong></p>
            <p style="margin: 8px 0;">Uwezo wa Kugharamia Malengo: <strong>${coveragePct}%</strong></p>
            
            <div class="progress-bar-bg" style="height: 15px; margin-top: 10px; background-color: #e2e8f0; border-radius: 8px; overflow: hidden;">
                <div class="progress-bar-fill ${getBarClass(coveragePct)}" style="width: ${Math.min(coveragePct, 100)}%; height: 100%;"></div>
            </div>
        </div>
    `;
}

// Vuta data kiotomatiki wakati mfumo unapoanza
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        syncFinanceData();
    }, 500);
});

