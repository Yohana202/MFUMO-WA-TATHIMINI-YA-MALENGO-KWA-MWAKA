// ==========================================
// 1. KUBADILISHA KURASA (NAVIGATION SYSTEM)
// ==========================================
function switchSection(sectionId, element) {
    // Ficha sehemu zote
    const sections = document.querySelectorAll('.page-section');
    sections.forEach(sec => sec.style.display = 'none');

    // Ondoa mwanga wa 'active' kwenye vitufe vyote vya menu
    const navItems = document.querySelectorAll('.sidebar-nav .nav-item');
    navItems.forEach(item => item.classList.remove('active'));

    // Onyesha sehemu iliyobonywa na weka 'active'
    const targetSection = document.getElementById(sectionId);
    if (targetSection) {
        targetSection.style.display = 'block';
    }

    if (element) {
        element.classList.add('active');
        // Badilisha kichwa cha habari cha juu
        const pageTitle = document.getElementById('page-title');
        if (pageTitle) {
            pageTitle.innerText = element.innerText.trim();
        }
    }
}

// ==========================================
// 2. KUTENGENEZA RIPOTI KWENYE SKRINI
// ==========================================
function generateReport(type) {
    const reportBox = document.getElementById('reportOutput');
    if (!reportBox) return;

    const monthSelect = document.getElementById('monthSelect');
    const selectedMonth = monthSelect ? monthSelect.value : 'Januari';
    const dateToday = new Date().toLocaleDateString('sw-TZ');

    // Soma data halisi za fedha
    const mapato = getStoredIncome();
    const matumizi = getStoredExpenses();

    const totalIncome = mapato.reduce((sum, item) => sum + Number(item.amount || 0), 0);
    const totalExpenses = matumizi.reduce((sum, item) => sum + Number(item.amount || 0), 0);
    const balance = totalIncome - totalExpenses;

    let titleText = "";
    let descText = "";

    if (type === 'mwezi') {
        titleText = `Ripoti ya Mwezi: ${selectedMonth}`;
        descText = `Tathmini ya utekelezaji wa malengo kwa mwezi wa <strong>${selectedMonth}</strong>.`;
    } else if (type === 'term1') {
        titleText = `Ripoti ya Muhula wa Kwanza (Term 1)`;
        descText = `Tathmini ya utekelezaji wa malengo kwa Muhula wa Kwanza.`;
    } else if (type === 'term2') {
        titleText = `Ripoti ya Muhula wa Pili (Term 2)`;
        descText = `Tathmini ya utekelezaji wa malengo kwa Muhula wa Pili.`;
    } else if (type === 'mwaka') {
        titleText = `Ripoti ya Mwaka Mzima (2026)`;
        descText = `Tathmini na muhtasari wa jumla wa utekelezaji wa malengo yote ya mwaka.`;
    }

    reportBox.innerHTML = `
        <div style="font-family: Arial, sans-serif; color: #1e293b; background: #ffffff; padding: 20px; border-radius: 8px;">
            <div style="border-bottom: 2px solid #2563eb; padding-bottom: 10px; margin-bottom: 15px;">
                <h2 style="color: #2563eb; margin: 0; font-size: 20px;">MFUMO WA MALENGO NA TATHMINI</h2>
                <small style="color: #64748b;">Tarehe ya Ripoti: ${dateToday}</small>
            </div>
            
            <h3 style="margin-top: 10px; color: #0f172a;">${titleText}</h3>
            <p style="color: #334155;">${descText}</p>
            
            <div style="margin-top: 20px; background: #f8fafc; padding: 15px; border-radius: 6px; border: 1px solid #e2e8f0;">
                <h4 style="margin-top: 0; color: #1e293b; border-bottom: 1px solid #cbd5e1; padding-bottom: 5px;">Hali ya Fedha:</h4>
                <p style="margin: 5px 0;"><strong>Jumla ya Mapato:</strong> <span style="color: #16a34a;">TZS ${totalIncome.toLocaleString()}</span></p>
                <p style="margin: 5px 0;"><strong>Jumla ya Matumizi:</strong> <span style="color: #ef4444;">TZS ${totalExpenses.toLocaleString()}</span></p>
                <p style="margin: 5px 0;"><strong>Salio Lililobaki:</strong> <span style="color: #2563eb; font-weight: bold;">TZS ${balance.toLocaleString()}</span></p>
            </div>
        </div>
    `;
}

// ==========================================
// 3. KAZI YA KUPAKUA PDF (DOWNLOAD PDF)
// ==========================================
function downloadPDF() {
    const reportElement = document.getElementById('reportOutput');

    // Angalia kama ripoti ipo au kama bado haijatengenezwa
    if (!reportElement || reportElement.innerText.includes("Chagua ripoti hapo juu")) {
        alert("Tafadhali chagua aina ya ripoti kwanza (mfano: Ripoti ya Mwezi au Term 1) kabla ya kupakua PDF!");
        return;
    }

    // Mipangilio ya faili la PDF
    const options = {
        margin:       10,
        filename:     `Ripoti_ya_Malengo_${new Date().toISOString().slice(0,10)}.pdf`,
        image:        { type: 'jpeg', quality: 0.98 },
        html2canvas:  { scale: 2 },
        jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };

    // Anza kupakua PDF
    html2pdf().set(options).from(reportElement).save();
}

// ==========================================
// 4. KUSOMA DATA ZA FEDHA (COMPATIBILITY)
// ==========================================
function getStoredIncome() {
    return JSON.parse(
        localStorage.getItem('mPEP_income') || 
        localStorage.getItem('financial_income') || 
        '[]'
    );
}

function getStoredExpenses() {
    return JSON.parse(
        localStorage.getItem('mPEP_expenses') || 
        localStorage.getItem('financial_expenses') || 
        '[]'
    );
}

function syncFinancialData() {
    const mapato = getStoredIncome();
    const matumizi = getStoredExpenses();

    const totalIncome = mapato.reduce((sum, item) => sum + Number(item.amount || 0), 0);
    const totalExpenses = matumizi.reduce((sum, item) => sum + Number(item.amount || 0), 0);
    const balance = totalIncome - totalExpenses;

    const displayContainer = document.getElementById('financeDisplay');
    if (displayContainer) {
        displayContainer.innerHTML = `
            <div style="padding: 15px; background: #f8fafc; border-radius: 8px; border: 1px solid #e2e8f0;">
                <p style="margin: 8px 0;"><strong>Jumla ya Mapato:</strong> <span style="color: #16a34a; font-weight: bold;">TZS ${totalIncome.toLocaleString()}</span></p>
                <p style="margin: 8px 0;"><strong>Jumla ya Matumizi:</strong> <span style="color: #ef4444; font-weight: bold;">TZS ${totalExpenses.toLocaleString()}</span></p>
                <p style="margin: 8px 0;"><strong>Salio Lililobaki:</strong> <span style="color: #2563eb; font-weight: bold;">TZS ${balance.toLocaleString()}</span></p>
            </div>
        `;
    }
}
