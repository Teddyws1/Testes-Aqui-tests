document.addEventListener('DOMContentLoaded', () => {

    // Sincronização do Estado de Tema com a sua estrutura global (dz_theme)[span_1](start_span)[span_1](end_span)
    const state = {
        theme: localStorage.getItem('dz_theme') || getSystemTheme()
    };

    function getSystemTheme() {
        if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
            return 'dark';
        }
        return 'light';
    }

    if (window.matchMedia) {
        window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
            if (!localStorage.getItem('dz_theme')) {
                applyTheme(e.matches ? 'dark' : 'light');
            }
        });
    }

    const themeToggleBtn = document.getElementById('theme-toggle-btn');
    const themeIcon = document.getElementById('theme-icon');

    function applyTheme(theme) {
        state.theme = theme;
        if (theme === 'dark') {
            document.documentElement.classList.remove('theme-light');
            document.documentElement.classList.add('theme-dark');
            if (themeIcon) themeIcon.setAttribute('name', 'sunny-outline');
        } else {
            document.documentElement.classList.remove('theme-dark');
            document.documentElement.classList.add('theme-light');
            if (themeIcon) themeIcon.setAttribute('name', 'moon-outline');
        }
        localStorage.setItem('dz_theme', theme);
    }

    if (themeToggleBtn) {
        themeToggleBtn.addEventListener('click', () => {
            const newTheme = state.theme === 'light' ? 'dark' : 'light';
            applyTheme(newTheme);
        });
    }

    applyTheme(state.theme);

    // Bloqueios de segurança e anti-cópia[span_2](start_span)[span_2](end_span)
    document.addEventListener('contextmenu', (e) => e.preventDefault());
    document.addEventListener('copy', (e) => e.preventDefault());
    document.addEventListener('cut', (e) => e.preventDefault());
    document.addEventListener('selectstart', (e) => e.preventDefault());

    document.addEventListener('keydown', (e) => {
        if (
            (e.ctrlKey && (e.key === 'c' || e.key === 'C' || e.key === 'u' || e.key === 'U' || e.key === 's' || e.key === 'S' || e.key === '+' || e.key === '-' || e.key === '=')) ||
            e.key === 'F12' ||
            (e.ctrlKey && e.shiftKey && (e.key === 'i' || e.key === 'I' || e.key === 'j' || e.key === 'J' || e.key === 'c' || e.key === 'C'))
        ) {
            e.preventDefault();
            return false;
        }
    });

    document.addEventListener('wheel', (e) => {
        if (e.ctrlKey) {
            e.preventDefault();
        }
    }, { passive: false });

    const safeFormatCurrency = (val) => 
        val.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

    function getRegisteredDebts() {
        const localData = localStorage.getItem('dz_debts') || localStorage.getItem('dividas') || localStorage.getItem('debts');
        if (localData) {
            try { return JSON.parse(localData); } catch (e) { console.error(e); }
        }
        return [];
    }

    let currentActiveMonthKey = null;
    const btnBackHeader = document.getElementById('btn-back-to-months');
    const btnHome = document.getElementById('btn-home');

    // Função base para voltar à página inicial (Livre de gestos para você customizar)
    function goToHomePage() {
        window.location.href = 'index.html'; 
    }

    if (btnHome) {
        btnHome.addEventListener('click', goToHomePage);
    }

    function renderCurrentView() {
        if (currentActiveMonthKey) {
            renderMonthDetails(currentActiveMonthKey, false);
        } else {
            renderMonthsList();
        }
    }

    function renderMonthsList() {
        currentActiveMonthKey = null;
        if (btnBackHeader) btnBackHeader.style.display = 'none';

        const allDebts = getRegisteredDebts();
        const contentEl = document.getElementById('panel-content');
        const titleEl = document.getElementById('page-title');

        if (titleEl) {
            titleEl.innerHTML = `<ion-icon name="calendar-outline" style="color:var(--accent-orange);"></ion-icon> Meses Registrados`;
        }

        const monthNames = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];
        const groupedMonths = {};

        allDebts.forEach(debt => {
            if (!debt.date) return;
            const [year, month] = debt.date.split('-').map(Number);
            const key = `${year}-${String(month).padStart(2, '0')}`;

            if (!groupedMonths[key]) {
                groupedMonths[key] = { 
                    year, 
                    monthIndex: month - 1, 
                    total: 0, 
                    count: 0, 
                    pendingCount: 0,
                    mainCompany: '',
                    maxExpenseVal: -1
                };
            }
            
            const val = Number(debt.value) || 0;
            groupedMonths[key].total += val;
            groupedMonths[key].count += 1;
            
            if (!debt.paid) {
                groupedMonths[key].pendingCount += 1;
            }

            if (val > groupedMonths[key].maxExpenseVal) {
                groupedMonths[key].maxExpenseVal = val;
                groupedMonths[key].mainCompany = debt.company || debt.description || 'Outros';
            }
        });

        const keys = Object.keys(groupedMonths).sort((a, b) => a.localeCompare(b));

        if (keys.length === 0) {
            contentEl.innerHTML = `
                <div style="text-align: center; padding: 40px; color: var(--text-muted);">
                    <ion-icon name="alert-circle-outline" style="font-size: 3rem; color: var(--accent-orange);"></ion-icon>
                    <p style="margin-top: 12px; font-weight: 600; font-size: 1.1rem;">Nenhum mês registrado no sistema.</p>
                </div>
            `;
            return;
        }

        let highestMonth = null;
        keys.forEach(key => {
            const item = groupedMonths[key];
            if (!highestMonth || item.total > highestMonth.total) {
                highestMonth = { ...item, key };
            }
        });

        let topBannerHtml = '';
        if (highestMonth) {
            topBannerHtml = `
                <div class="top-record-card">
                    <div class="top-record-header">
                        <ion-icon name="trophy-outline"></ion-icon> Maior Mês Registrado (Recorde)
                    </div>
                    <div class="top-record-body">
                        <div>
                            <div class="top-record-title">
                                ${monthNames[highestMonth.monthIndex]} / ${highestMonth.year}
                            </div>
                            <small style="color: var(--text-muted);">${highestMonth.count} registro(s)</small>
                        </div>
                        <div class="top-record-value">
                            ${safeFormatCurrency(highestMonth.total)}
                        </div>
                    </div>
                </div>
            `;
        }

        const chartColors = ['#f97316', '#3b82f6', '#22c55e', '#eab308', '#a855f7', '#ec4899', '#06b6d4', '#84cc16', '#f43f5e', '#6366f1', '#14b8a6', '#d946ef'];
        
        let totalSumAllMonths = 0;
        keys.forEach(k => totalSumAllMonths += groupedMonths[k].total);

        let cumulativePercent = 0;
        const conicStops = [];
        const legendHtmlList = [];

        keys.forEach((key, index) => {
            const item = groupedMonths[key];
            const percentage = totalSumAllMonths > 0 ? (item.total / totalSumAllMonths) * 100 : 0;
            const startAngle = cumulativePercent;
            cumulativePercent += percentage;
            const color = chartColors[index % chartColors.length];

            conicStops.push(`${color} ${startAngle}% ${cumulativePercent}%`);

            legendHtmlList.push(`
                <div class="legend-item" data-target="${key}" data-month="${monthNames[item.monthIndex]}" data-value="${safeFormatCurrency(item.total)}" data-company="${item.mainCompany}">
                    <div class="legend-left">
                        <div class="legend-color-box" style="background-color: ${color};"></div>
                        <span>${monthNames[item.monthIndex]}</span>
                    </div>
                    <strong>${percentage.toFixed(1)}%</strong>
                </div>
            `);
        });

        const conicDataString = conicStops.join(', ');

        const pieChartHtml = `
            <div class="pie-chart-container">
                <span style="font-size:0.8rem; font-weight:700; color:var(--text-muted); text-transform:uppercase; letter-spacing:0.5px;">Distribuição de Gastos por Mês</span>
                <div class="pie-chart-wrapper">
                    <div class="donut-chart" style="--conic-data: ${conicDataString};">
                        <div class="donut-center" id="donut-center-info">
                            <span class="donut-center-title" id="center-title">Toque na fatia</span>
                            <span class="donut-center-value" id="center-value">---</span>
                        </div>
                    </div>
                    <div class="donut-legend">
                        ${legendHtmlList.join('')}
                    </div>
                </div>
            </div>
        `;

        const listHtml = keys.map(key => {
            const item = groupedMonths[key];
            const isHighest = highestMonth && highestMonth.key === key;
            const isFullyPaid = item.pendingCount === 0;

            const statusBadgeHtml = isFullyPaid 
                ? `<span class="status-badge paid"><ion-icon name="checkmark-circle-outline"></ion-icon> Pago</span>`
                : `<span class="status-badge pending"><ion-icon name="time-outline"></ion-icon> Pendente (${item.pendingCount})</span>`;

            return `
                <div class="month-select-card ${isHighest ? 'is-record' : ''}" data-key="${key}">
                    <div class="month-card-name">
                        <div style="display:flex; justify-content:space-between; width:100%; align-items:center;">
                            <span>${monthNames[item.monthIndex]} ${item.year}</span>
                            ${isHighest ? '<span class="record-tag">Maior</span>' : ''}
                        </div>
                        <div class="card-company-name" title="${item.mainCompany}">
                            <ion-icon name="business-outline" style="font-size:0.85rem; color:var(--primary-color)"></ion-icon> ${item.mainCompany}
                        </div>
                    </div>
                    <div style="width: 100%; margin-top: 8px;">
                        <div style="font-weight:700; color:var(--accent-orange); font-size:1.05rem;">${safeFormatCurrency(item.total)}</div>
                        <div>${statusBadgeHtml}</div>
                    </div>
                </div>
            `;
        }).join('');

        contentEl.innerHTML = topBannerHtml + pieChartHtml + `<div class="months-list-container">${listHtml}</div>`;

        const centerTitle = document.getElementById('center-title');
        const centerValue = document.getElementById('center-value');

        document.querySelectorAll('.legend-item').forEach(legendItem => {
            const handleInteraction = () => {
                document.querySelectorAll('.legend-item').forEach(i => i.classList.remove('active'));
                legendItem.classList.add('active');

                const monthName = legendItem.getAttribute('data-month');
                const val = legendItem.getAttribute('data-value');
                const company = legendItem.getAttribute('data-company');

                centerTitle.textContent = `${monthName} (${company})`;
                centerValue.textContent = val;
            };

            legendItem.addEventListener('mouseenter', handleInteraction);
            legendItem.addEventListener('click', handleInteraction);
        });

        document.querySelectorAll('.month-select-card').forEach(card => {
            card.addEventListener('click', () => {
                const key = card.getAttribute('data-key');
                renderMonthDetails(key, true);
            });
        });
    }

    function renderMonthDetails(key, updateActiveKey = true) {
        if (updateActiveKey) currentActiveMonthKey = key;
        if (btnBackHeader) btnBackHeader.style.display = 'inline-flex';
        
        const allDebts = getRegisteredDebts();
        const contentEl = document.getElementById('panel-content');
        const titleEl = document.getElementById('page-title');
        const [targetYear, targetMonth] = key.split('-').map(Number);

        const monthNames = ["janeiro", "fevereiro", "março", "abril", "maio", "junho", "julho", "agosto", "setembro", "outubro", "novembro", "dezembro"];

        if (titleEl) {
            titleEl.innerHTML = `Resumo de ${monthNames[targetMonth - 1]}`;
        }

        const monthDebts = allDebts.filter(debt => {
            if (!debt.date) return false;
            const [year, month] = debt.date.split('-').map(Number);
            return year === targetYear && month === targetMonth;
        });

        let totalValue = 0, totalPaid = 0, totalPending = 0;
        let highestExpense = { value: 0, description: 'Nenhuma', company: 'Outros' };

        monthDebts.forEach(debt => {
            const val = Number(debt.value) || 0;
            totalValue += val;

            if (val > highestExpense.value) {
                highestExpense = { value: val, description: debt.description || 'Despesa', company: debt.company || 'Outros' };
            }

            if (debt.paid) totalPaid += val;
            else totalPending += val;
        });

        const itemsHtml = monthDebts.map((debt) => {
            const isPaid = debt.paid;
            return `
                <div class="debt-item-row">
                    <div>
                        <div style="font-weight: 700; color: var(--text-main);">${debt.company || debt.description || 'Despesa'}</div>
                        <small style="color: var(--text-muted);">${debt.description || ''} - ${safeFormatCurrency(debt.value)}</small>
                    </div>
                    <div class="status-indicator ${isPaid ? 'is-paid' : ''}">
                        <ion-icon name="${isPaid ? 'checkmark-circle' : 'time-outline'}"></ion-icon>
                        ${isPaid ? 'Pago' : 'Pendente'}
                    </div>
                </div>
            `;
        }).join('');

        contentEl.innerHTML = `
            <div class="top-month-banner">
                <span style="font-size:0.8rem; color:var(--text-muted); font-weight:600; text-transform:uppercase;">Total do Mês</span>
                <div class="top-month-total">${safeFormatCurrency(totalValue)}</div>
                <small style="color:var(--text-muted);">${monthDebts.length} dívida(s)</small>
            </div>

            <div class="top-stat-box" style="border-left: 4px solid var(--accent-orange);">
                <span style="font-size:0.75rem; color:var(--text-muted); font-weight:600;">Maior Gasto do Mês</span>
                <div style="color:var(--accent-orange); font-weight:700; font-size:1.2rem; margin-top:2px;">
                    ${safeFormatCurrency(highestExpense.value)}
                </div>
                <small style="font-size:0.8rem; color:var(--text-muted);">${highestExpense.description} (${highestExpense.company})</small>
            </div>

            <div class="top-month-stats">
                <div class="top-stat-box">
                    <span style="font-size:0.75rem; color:var(--text-muted); font-weight:600;">Total Pago</span>
                    <div class="top-stat-val paid">${safeFormatCurrency(totalPaid)}</div>
                </div>
                <div class="top-stat-box">
                    <span style="font-size:0.75rem; color:var(--text-muted); font-weight:600;">Total Pendente</span>
                    <div class="top-stat-val pending">${safeFormatCurrency(totalPending)}</div>
                </div>
            </div>

            <div style="margin-top: 14px;">
                <span style="font-size:0.85rem; font-weight:700; color:var(--text-muted);">Dívidas Registradas (Apenas Visualização):</span>
                ${itemsHtml.length > 0 ? itemsHtml : '<p style="color:var(--text-muted); font-size:0.85rem; margin-top:6px;">Nenhuma dívida neste mês.</p>'}
            </div>
        `;
    }

    if (btnBackHeader) {
        btnBackHeader.addEventListener('click', renderMonthsList);
    }

    window.addEventListener('storage', (event) => {
        if (['dz_debts', 'dividas', 'debts', 'dz_theme'].includes(event.key)) {
            if (event.key === 'dz_theme') {
                applyTheme(event.newValue);
            } else {
                renderCurrentView();
            }
        }
    });

    renderMonthsList();
});
/**
 * ============================================================================
 * SISTEMA DE GESTOS: ARRASTAR DA DIREITA PARA A ESQUERDA (SWIPE LEFT) PARA INDEX.HTML
 * ============================================================================
 */
document.addEventListener('DOMContentLoaded', () => {
    // Variáveis para rastrear a posição inicial do toque (Mobile) e do mouse (Desktop)
    let touchStartX = 0;
    let touchStartY = 0;
    let mouseIsDown = false;
    let mouseStartX = 0;
    let mouseStartY = 0;

    // ----------------------------------------------------
    // 1. SUPORTE PARA DISPOSITIVOS MÓVEIS (Touch Events)
    // ----------------------------------------------------
    window.addEventListener('touchstart', (e) => {
        if (e.touches.length === 1) {
            touchStartX = e.touches[0].clientX;
            touchStartY = e.touches[0].clientY;
        }
    }, { passive: true });

    window.addEventListener('touchend', (e) => {
        if (!touchStartX && !touchStartY) return;

        const touchEndX = e.changedTouches[0].clientX;
        const touchEndY = e.changedTouches[0].clientY;
        
        // Calcula a distância: Positivo se arrastou da DIREITA para a ESQUERDA
        const diffX = touchStartX - touchEndX; 
        const diffY = Math.abs(touchStartY - touchEndY);

        // Se arrastou mais de 50px para a esquerda e manteve o alinhamento horizontal
        if (diffX > 50 && diffY < 100) {
            triggerIndexSwipeAction();
        }

        touchStartX = 0;
        touchStartY = 0;
    }, { passive: true });

    // ----------------------------------------------------
    // 2. SUPORTE PARA COMPUTADOR (Mouse Click & Drag)
    // ----------------------------------------------------
    window.addEventListener('mousedown', (e) => {
        // Evita disparar se o usuário clicar em botões, links, inputs ou modais
        if (e.target.closest('button') || e.target.closest('a') || e.target.closest('input') || e.target.closest('.modal')) {
            return;
        }
        mouseIsDown = true;
        mouseStartX = e.clientX;
        mouseStartY = e.clientY;
    });

    window.addEventListener('mouseup', (e) => {
        if (!mouseIsDown) return;

        const mouseEndX = e.clientX;
        const mouseEndY = e.clientY;

        const diffX = mouseStartX - mouseEndX; // Positivo se arrastou da DIREITA para a ESQUERDA
        const diffY = Math.abs(mouseStartY - mouseEndY);

        if (diffX > 60 && diffY < 100) {
            triggerIndexSwipeAction();
        }

        mouseIsDown = false;
    });

    // ----------------------------------------------------
    // 3. AÇÃO DE TRANSIÇÃO DO INDEX.HTML
    // ----------------------------------------------------
    function triggerIndexSwipeAction() {
        // Evita múltiplos disparos se a animação já estiver ocorrendo
        if (document.body.classList.contains('slide-out-left')) return;

        // Adiciona a classe que ativa a animação visual no CSS
        document.body.classList.add('slide-out-left');

        // Aguarda a animação terminar (ex: 400ms) antes de mudar de página
        setTimeout(() => {
            // Defina para qual página o index deve ir ao arrastar para a esquerda
            window.location.href = 'index.html'; 
        }, 400);
    }
});
