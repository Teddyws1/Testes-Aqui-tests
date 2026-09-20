//////////////////////////////////////
//
// - PARTE 1: ESTADO GLOBAL, DOM E RENDERIZAÇÃO
//
//////////////////////////////////////

// Armazena a referência da pasta e do arquivo selecionados pelo utilizador
let exportDirectoryHandle = null;
let exportFileHandle = null;

const devContactInfo =
    "Teddy Machado\n" +
    "Desenvolvedor e Criador do DívidaZero\n" +
    "DívidaZero 2026™\n\n" +
    "Instagram:\n" +
    "https://www.instagram.com/teddy_machado007\n\n" +
    "Mais projetos e códigos:\n" +
    "https://github.com/Teddyws1";

function showToast(message, type = "success") {
    const oldToast = document.querySelector(".toast-message");
    if (oldToast) oldToast.remove();

    const toast = document.createElement("div");
    toast.className = `toast-message ${type}`;
    toast.innerHTML = `
        <ion-icon name="${type === "success" ? "checkmark-circle-outline" : "alert-circle-outline"}"></ion-icon>
        <span>${message}</span>
    `;

    document.body.appendChild(toast);
    requestAnimationFrame(() => toast.classList.add("active"));

    setTimeout(() => {
        toast.classList.remove("active");
        setTimeout(() => {
            if (toast.parentNode) toast.remove();
        }, 250);
    }, 2500);
}

//////////////////////////////////////
// - GERENCIADOR GLOBAL DE SCROLL DO BODY
//////////////////////////////////////
function updateBodyScrollState() {
    const activeModals = document.querySelectorAll('.custom-modal-overlay.active, .modal.active, .clear-logs-overlay');
    const activeSidebar = document.querySelector('#sidebar.active');
    
    if (activeModals.length > 0 || activeSidebar) {
        document.body.classList.add('no-scroll');
    } else {
        document.body.classList.remove('no-scroll');
    }
}

document.addEventListener('DOMContentLoaded', () => {

    const now = new Date();
    const state = {
        debts: JSON.parse(localStorage.getItem('dz_debts')) || [],
        logs: JSON.parse(localStorage.getItem('dz_logs')) || [],
        currentDate: new Date(now.getFullYear(), now.getMonth(), 1),
        filterQuery: '',
        sortOption: 'recent',
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

    const dom = {
        appContainer: document.getElementById('app-container'),
        debtsContainer: document.getElementById('debts-container'),
        currentMonthDisplay: document.getElementById('current-month-display'),

        footerTotal: document.getElementById('footer-total'),
        footerBalance: document.getElementById('footer-balance'),
        footerPaidValue: document.getElementById('footer-paid-value'),
        statCountTotal: document.getElementById('stat-count-total'),
        statCountPaid: document.getElementById('stat-count-paid'),
        statCountPending: document.getElementById('stat-count-pending'),

        searchInput: document.getElementById('search-input'),

        btnOpenSidebar: document.getElementById('btn-open-sidebar'),
        btnOpenAddModal: document.getElementById('btn-open-add-modal'),
        btnSortMenu: document.getElementById('btn-sort-menu'),
        sortDropdown: document.getElementById('sort-dropdown'),
        sortOptions: document.querySelectorAll('.sort-option'),
        btnPrevMonth: document.getElementById('btn-prev-month'),
        btnNextMonth: document.getElementById('btn-next-month'),

        sidebar: document.getElementById('sidebar'),
        sidebarOverlay: document.getElementById('sidebar-overlay'),
        menuItemHistory: document.getElementById('menu-item-history'),
        menuItemUpdates: document.getElementById('menu-item-updates'),
        menuItemClean: document.getElementById('menu-item-clean'),

        menuItemExport: document.getElementById('menu-item-export'),
        menuItemImport: document.getElementById('menu-item-import'),
        menuItemDeveloper: document.getElementById('menu-item-developer'),
        importFileInput: document.getElementById('import-file-input'),
        themeIcon: document.getElementById('theme-icon'),
        themeText: document.getElementById('theme-text'),
        menuItemTheme: document.getElementById('menu-item-theme'),
        modalExpense: document.getElementById('modal-add-expense'),
        btnCloseModalExpense: document.getElementById('btn-close-modal-expense'),
        cancelAddModalBtn: document.getElementById('cancelAddModalBtn'),
        formExpense: document.getElementById('form-expense'),
        expenseCompany: document.getElementById('expense-company'),
        customCompanyGroup: document.getElementById('custom-company-group'),
        expenseCustomCompany: document.getElementById('expense-custom-company'),
        expenseDescription: document.getElementById('expense-description'),
        expenseValue: document.getElementById('expense-value'),
        expenseDate: document.getElementById('expense-date'),
        charCounter: document.getElementById('char-counter'),
        charWarning: document.getElementById('char-warning'),

        radioQuickCurrent: document.getElementById('quick-month-current'),
        radioQuickNext: document.getElementById('quick-month-next'),

        modalEditExpense: document.getElementById('modal-edit-expense'),
        btnCloseModalEdit: document.getElementById('btn-close-modal-edit'),
        formEditExpense: document.getElementById('form-edit-expense'),
        editExpenseId: document.getElementById('edit-expense-id'),
        editExpenseCompany: document.getElementById('edit-expense-company'),
        editCustomCompanyGroup: document.getElementById('edit-custom-company-group'),
        editExpenseCustomCompany: document.getElementById('edit-expense-custom-company'),
        editExpenseDescription: document.getElementById('edit-expense-description'),
        editExpenseValue: document.getElementById('edit-expense-value'),
        editExpenseDate: document.getElementById('edit-expense-date'),
        editPaidTrue: document.getElementById('edit-paid-true'),
        editPaidFalse: document.getElementById('edit-paid-false'),
        editCharCounter: document.getElementById('edit-char-counter'),
        btnShareExpense: document.getElementById('btn-share-expense'),
        btnDeleteExpense: document.getElementById('btn-delete-expense'),

        modalHistory: document.getElementById('modal-history'),
        btnCloseModalHistory: document.getElementById('btn-close-modal-history'),
        historyListContainer: document.getElementById('history-list-container'),
        btnClearLogs: document.getElementById('btn-clear-logs'),

        modalUpdates: document.getElementById('modal-updates'),
        btnCloseModalUpdates: document.getElementById('btn-close-modal-updates'),

        modalDeveloper: document.getElementById('modal-developer'),
        btnCloseModalDeveloper: document.getElementById('btn-close-modal-developer'),
        btnCopyDevContact: document.getElementById('btn-copy-dev-contact')
    };

    function generateRandomID() {
        const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
        const numbers = "0123456789";
        let numPart = "";
        let letterPart = "";

        for (let i = 0; i < 3; i++) {
            numPart += numbers.charAt(Math.floor(Math.random() * numbers.length));
        }
        for (let i = 0; i < 2; i++) {
            letterPart += letters.charAt(Math.floor(Math.random() * letters.length));
        }

        return `${numPart}-${letterPart}`;
    }

    function saveData() {
        localStorage.setItem('dz_debts', JSON.stringify(state.debts));
        localStorage.setItem('dz_logs', JSON.stringify(state.logs));
        localStorage.setItem('dz_theme', state.theme);
    }

    function addLog(action) {
        const newLog = {
            id: generateRandomID(),
            action: action,
            timestamp: new Date().toLocaleString('pt-BR')
        };
        state.logs.unshift(newLog);
        saveData();
    }

    function formatCurrency(val) {
        if (val < 1e6) {
            return val.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
        }

        const suffixes = [
            { value: 1e15, singular: 'quatrilhão', plural: 'quatrilhões' },
            { value: 1e12, singular: 'trilhão', plural: 'trilhões' },
            { value: 1e9,  singular: 'bilhão',  plural: 'bilhões' },
            { value: 1e6,  singular: 'milhão',  plural: 'milhões' }
        ];

        for (const scale of suffixes) {
            if (val >= scale.value) {
                const num = val / scale.value;
                const formatted = num % 1 === 0 
                    ? num.toFixed(0) 
                    : num.toFixed(2).replace(/\.?0+$/, '').replace('.', ',');

                const suffix = num >= 2 ? scale.plural : scale.singular;
                return `${formatted} ${suffix}`;
            }
        }

        return val.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    }

    function updateMonthDisplay() {
        const monthNames = [
            "janeiro", "fevereiro", "março", "abril", "maio", "junho",
            "julho", "agosto", "setembro", "outubro", "novembro", "dezembro"
        ];
        
        const month = monthNames[state.currentDate.getMonth()];
        const monthNumber = state.currentDate.getMonth() + 1;
        const year = state.currentDate.getFullYear();

        const today = new Date();
        const currentDay = String(today.getDate()).padStart(2, '0');
        const currentMonthNum = String(today.getMonth() + 1).padStart(2, '0');
        const currentYearNum = today.getFullYear();

        const realTodayFormatted = `${currentDay}/${currentMonthNum}/${currentYearNum}`;
        
        dom.currentMonthDisplay.innerHTML = `
            <ion-icon name="calendar-number-outline"></ion-icon>
            <span>${month} ${monthNumber} / ${year}</span>
            <small class="real-today">Hoje: ${realTodayFormatted}</small>
        `;
    }

    function renderDebts() {
        updateMonthDisplay();
        dom.debtsContainer.innerHTML = '';

        const currentMonth = state.currentDate.getMonth();
        const currentYear = state.currentDate.getFullYear();

        let mappedDebts = state.debts.map((d, index) => ({ ...d, originalIndex: index }));

        let filteredDebts = mappedDebts.filter(debt => {
            const debtDate = new Date(debt.date + 'T00:00:00');
            const matchesDate = debtDate.getMonth() === currentMonth && debtDate.getFullYear() === currentYear;

            const query = state.filterQuery.toLowerCase().trim();
            const company = (debt.company || 'Outros').toLowerCase();
            
            const debtValueStr = debt.value.toString();
            const debtValueFormatted = debt.value.toFixed(2).replace('.', ',');
            const cleanQuery = query.replace('r$', '').replace(/\s+/g, '').replace('.', ',');

            const matchesQuery = 
                debt.description.toLowerCase().includes(query) ||
                debt.id.toLowerCase().includes(query) ||
                company.includes(query) ||
                debtValueStr.includes(query) ||
                debtValueFormatted.includes(cleanQuery);

            return matchesDate && matchesQuery;
        });

        filteredDebts.sort((a, b) => {
            if (state.sortOption === 'recent') {
                return b.originalIndex - a.originalIndex;
            } else if (state.sortOption === 'oldest') {
                return a.originalIndex - b.originalIndex;
            }
            return 0;
        });

        let totalVal = 0;
        let paidVal = 0;
        let pendingVal = 0;
        let paidCount = 0;
        let pendingCount = 0;

        if (filteredDebts.length === 0) {
            dom.debtsContainer.innerHTML = `
                <div class="empty-state">
                    <ion-icon name="document-text-outline"></ion-icon>
                    <p>Nenhuma despesa cadastrada para este mês.</p>
                </div>
            `;
        } else {
            filteredDebts.forEach(debt => {
                totalVal += debt.value;

                if (debt.paid) {
                    paidVal += debt.value;
                    paidCount++;
                } else {
                    pendingVal += debt.value;
                    pendingCount++;
                }

                const dateObj = new Date(debt.date + 'T00:00:00');
                const formattedDate = dateObj.toLocaleDateString('pt-BR');
                const companyName = debt.company || 'Outros';
                const formattedTime = debt.createdAt || '--:--';

                const card = document.createElement('div');
                card.className = 'debt-card';
                card.innerHTML = `
                    <div class="debt-info">
                        <div class="debt-header-info">
                            <span class="debt-tag-id">ID: ${debt.id}</span>
                            <span class="debt-company-badge">
                                <ion-icon name="${
                                    companyName.toLowerCase() === 'outros'
                                        ? 'ellipsis-horizontal-circle-outline'
                                        : 'business-outline'
                                }"></ion-icon>
                                ${companyName}
                            </span>
                        </div>
                        <span class="debt-title">${debt.description}</span>
                        <div class="debt-date-time">
                            <span class="debt-date">
                                <ion-icon name="calendar-outline"></ion-icon> ${formattedDate}
                            </span>
                            <span class="debt-time">
                                <ion-icon name="time-outline"></ion-icon> ${formattedTime}
                            </span>
                        </div>
                    </div>
                    <div class="debt-values">
                        <span class="debt-amount">${formatCurrency(debt.value)}</span>
                        <span class="status-badge ${debt.paid ? 'status-paid' : 'status-pending'}" data-id="${debt.id}">
                            <ion-icon 
                                name="${debt.paid ? 'shield-checkmark-outline' : 'hourglass-outline'}"
                                class="${debt.paid ? '' : 'spinning-icon'}">
                            </ion-icon>
                            ${debt.paid ? 'Quitado' : 'Em aberto'}
                        </span>
                    </div>
                `;

                card.addEventListener('click', (e) => {
                    if (!e.target.closest('.status-badge')) {
                        openEditModal(debt);
                    }
                });

                const badge = card.querySelector('.status-badge');
                badge.addEventListener('click', (e) => {
                    e.stopPropagation();
                    toggleDebtStatus(debt.id);
                });

                dom.debtsContainer.appendChild(card);
            });
        }

        dom.statCountTotal.textContent = filteredDebts.length;
        dom.statCountPaid.textContent = paidCount;
        dom.statCountPending.textContent = pendingCount;

        dom.footerPaidValue.textContent = formatCurrency(paidVal);
        dom.footerBalance.textContent = formatCurrency(pendingVal);
        dom.footerTotal.textContent = formatCurrency(totalVal);
    }
//////////////////////////////////////
//
// - PARTE 2: MODAIS, EVENTOS E SELEÇÃO DE PASTA INTELIGENTE
//
//////////////////////////////////////

    function updateCharCounterForInput(inputEl, counterEl, warningEl) {
        if (!inputEl || !counterEl) return;
        const currentLength = inputEl.value.length;
        const maxLength = 50;
        const percentage = Math.min((currentLength / maxLength) * 100, 100);
        let color;
        
        if (currentLength <= 16) {
            color = "#008754";
        } else if (currentLength <= 24) {
            color = "#f59e0b";
        } else if (currentLength < 45) {
            color = "#f97316";
        } else {
            color = "#ef4444";
        }
        
        counterEl.textContent = `${currentLength}/${maxLength}`;
        counterEl.style.setProperty("--char-progress", `${percentage}%`);
        counterEl.style.setProperty("--char-color", color);
        
        if (warningEl) {
            if (currentLength >= maxLength) {
                warningEl.classList.add("active");
            } else {
                warningEl.classList.remove("active");
            }
        }
    }

    function clearAddModalForm() {
        if (dom.expenseDescription) dom.expenseDescription.value = '';
        if (dom.expenseValue) dom.expenseValue.value = '';
        if (dom.expenseCompany) dom.expenseCompany.value = 'Outros';
        if (dom.expenseCustomCompany) dom.expenseCustomCompany.value = '';
        if (dom.customCompanyGroup) dom.customCompanyGroup.style.display = 'none';

        const mainExpenseText = document.getElementById('expense-value-text');
        if (mainExpenseText) mainExpenseText.textContent = '';

        const today = new Date();
        const yyyy = today.getFullYear();
        const mm = String(today.getMonth() + 1).padStart(2, '0');
        const dd = String(today.getDate()).padStart(2, '0');
        if (dom.expenseDate) dom.expenseDate.value = `${yyyy}-${mm}-${dd}`;

        if (dom.radioQuickCurrent) dom.radioQuickCurrent.checked = true;

        updateCharCounterForInput(dom.expenseDescription, dom.charCounter, dom.charWarning);
    }

    function openDaySelectorModal(targetYear, targetMonth, currentDay, onConfirm) {
        const overlay = document.createElement('div');
        overlay.className = 'custom-modal-overlay active';

        const lastDayOfMonth = new Date(targetYear, targetMonth + 1, 0).getDate();
        const defaultDay = Math.min(currentDay, lastDayOfMonth);

        overlay.innerHTML = `
            <div class="custom-modal-box">
                <div class="custom-modal-icon"><ion-icon name="calendar-outline"></ion-icon></div>
                <h3 class="custom-modal-title">Escolha o Dia de Vencimento</h3>
                <p class="custom-modal-message">
                    Informe o dia do próximo mês para o vencimento desta conta:
                </p>
                <div style="margin: 15px 0;">
                    <input 
                        type="number" 
                        id="quick-day-input" 
                        class="form-control" 
                        min="1" 
                        max="${lastDayOfMonth}" 
                        value="${defaultDay}" 
                        style="text-align: center; font-size: 1.2rem; width: 100px; margin: 0 auto;"
                    >
                </div>
                <div class="custom-modal-actions">
                    <button id="btn-day-cancel" class="btn-modal-secondary">Cancelar</button>
                    <button id="btn-day-confirm" class="btn-modal-danger" style="background-color: var(--primary-color, #2563eb);">Confirmar</button>
                </div>
            </div>
        `;

        document.body.appendChild(overlay);
        updateBodyScrollState();

        const dayInput = overlay.querySelector('#quick-day-input');
        dayInput.focus();

        overlay.querySelector('#btn-day-confirm').addEventListener('click', () => {
            let dayVal = parseInt(dayInput.value) || defaultDay;
            dayVal = Math.max(1, Math.min(dayVal, lastDayOfMonth));
            onConfirm(dayVal);
            overlay.remove();
            updateBodyScrollState();
        });

        overlay.querySelector('#btn-day-cancel').addEventListener('click', () => {
            if (dom.radioQuickCurrent) dom.radioQuickCurrent.checked = true;
            overlay.remove();
            updateBodyScrollState();
        });
    }

    if (dom.radioQuickCurrent && dom.radioQuickNext) {
        dom.radioQuickCurrent.addEventListener('change', () => {
            if (dom.radioQuickCurrent.checked) {
                const today = new Date();
                const yyyy = today.getFullYear();
                const mm = String(today.getMonth() + 1).padStart(2, '0');
                const dd = String(today.getDate()).padStart(2, '0');
                dom.expenseDate.value = `${yyyy}-${mm}-${dd}`;
            }
        });

        dom.radioQuickNext.addEventListener('change', () => {
            if (dom.radioQuickNext.checked) {
                const today = new Date();
                let nextMonth = today.getMonth() + 1;
                let nextYear = today.getFullYear();

                if (nextMonth > 11) {
                    nextMonth = 0;
                    nextYear++;
                }

                openDaySelectorModal(nextYear, nextMonth, today.getDate(), (selectedDay) => {
                    const formattedMonth = String(nextMonth + 1).padStart(2, '0');
                    const formattedDay = String(selectedDay).padStart(2, '0');
                    dom.expenseDate.value = `${nextYear}-${formattedMonth}-${formattedDay}`;
                });
            }
        });
    }

    function openEditModal(debt) {
        dom.editExpenseId.value = debt.id;

        const selectOptions = Array.from(dom.editExpenseCompany.options).map(o => o.value);
        if (selectOptions.includes(debt.company)) {
            dom.editExpenseCompany.value = debt.company;
            dom.editCustomCompanyGroup.style.display = 'none';
            dom.editExpenseCustomCompany.value = '';
        } else {
            dom.editExpenseCompany.value = 'custom';
            dom.editCustomCompanyGroup.style.display = 'flex';
            dom.editExpenseCustomCompany.value = debt.company || '';
        }

        dom.editExpenseDescription.value = debt.description;
        
        if (dom.editExpenseValue) {
            const initialCents = Math.round((debt.value || 0) * 100);
            const formattedVal = (initialCents / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
            dom.editExpenseValue.value = formattedVal;
            
            const editExpenseText = document.getElementById('edit-expense-value-text');
            if (editExpenseText) {
                editExpenseText.textContent = getCurrencyExtenso(debt.value || 0);
            }
        }
        
        dom.editExpenseDate.value = debt.date;

        if (debt.paid) {
            dom.editPaidTrue.checked = true;
        } else {
            dom.editPaidFalse.checked = true;
        }

        updateCharCounterForInput(dom.editExpenseDescription, dom.editCharCounter);
        openModal(dom.modalEditExpense);
    }

    function toggleDebtStatus(id) {
        const debt = state.debts.find(d => d.id === id);
        if (debt) {
            debt.paid = !debt.paid;
            addLog(`Status da dívida #${debt.id} (${debt.description}) alterado para ${debt.paid ? 'Pago' : 'Pendente'}`);
            saveData();
            renderDebts();
        }
    }

    function openModal(modal) {
        if (modal) {
            modal.classList.add('active');
            updateBodyScrollState();
        }
    }

    function closeModal(modal) {
        if (modal) {
            modal.classList.remove('active');
            updateBodyScrollState();
        }
    }

    function toggleSidebar(open) {
        if (open) {
            dom.sidebar.classList.add('active');
            dom.sidebarOverlay.classList.add('active');
        } else {
            dom.sidebar.classList.remove('active');
            dom.sidebarOverlay.classList.remove('active');
        }
        updateBodyScrollState();
    }

    function toggleSortDropdown(open) {
        if (open === undefined) {
            dom.sortDropdown.classList.toggle('active');
        } else if (open) {
            dom.sortDropdown.classList.add('active');
        } else {
            dom.sortDropdown.classList.remove('active');
        }
    }

    function handleOutsideClick(event) {
        if (dom.sidebar.classList.contains('active')) {
            const isClickInsideSidebar = dom.sidebar.contains(event.target);
            const isClickOnOpenBtn = dom.btnOpenSidebar.contains(event.target);
            if (!isClickInsideSidebar && !isClickOnOpenBtn) {
                toggleSidebar(false);
            }
        }

        if (dom.sortDropdown.classList.contains('active')) {
            const isClickInsideDropdown = dom.sortDropdown.contains(event.target);
            const isClickOnSortBtn = dom.btnSortMenu.contains(event.target);
            if (!isClickInsideDropdown && !isClickOnSortBtn) {
                toggleSortDropdown(false);
            }
        }
    }

    document.addEventListener('click', handleOutsideClick);
    document.addEventListener('touchstart', handleOutsideClick, { passive: true });
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            toggleSidebar(false);
            toggleSortDropdown(false);
            if (dom.modalExpense && dom.modalExpense.classList.contains('active')) {
                clearAddModalForm();
            }
            closeModal(dom.modalExpense);
            closeModal(dom.modalEditExpense);
            closeModal(dom.modalHistory);
            closeModal(dom.modalUpdates);
            closeModal(dom.modalDeveloper);
        }
    });

    dom.sortOptions.forEach(option => {
        option.addEventListener('click', () => {
            dom.sortOptions.forEach(opt => opt.classList.remove('selected'));
            option.classList.add('selected');
            state.sortOption = option.getAttribute('data-sort');
            toggleSortDropdown(false);
            renderDebts();
        });
    });

    dom.expenseCompany.addEventListener('change', (e) => {
        if (e.target.value === 'custom') {
            dom.customCompanyGroup.style.display = 'flex';
            dom.expenseCustomCompany.focus();
        } else {
            dom.customCompanyGroup.style.display = 'none';
            dom.expenseCustomCompany.value = '';
        }
    });

    dom.editExpenseCompany.addEventListener('change', (e) => {
        if (e.target.value === 'custom') {
            dom.editCustomCompanyGroup.style.display = 'flex';
            dom.editExpenseCustomCompany.focus();
        } else {
            dom.editCustomCompanyGroup.style.display = 'none';
            dom.editExpenseCustomCompany.value = '';
        }
    });

    if (dom.expenseDescription) {
        dom.expenseDescription.setAttribute('maxlength', '50');
        dom.expenseDescription.addEventListener('input', (e) => {
            updateCharCounterForInput(e.target, dom.charCounter, dom.charWarning);
        });
    }

    if (dom.editExpenseDescription) {
        dom.editExpenseDescription.setAttribute('maxlength', '50');
        dom.editExpenseDescription.addEventListener('input', (e) => {
            updateCharCounterForInput(e.target, dom.editCharCounter);
        });
    }

    function renderHistory() {
        dom.historyListContainer.innerHTML = '';
        if (state.logs.length === 0) {
            dom.historyListContainer.innerHTML = '<p style="text-align:center; color: var(--text-muted); padding: 20px 0;">Nenhum histórico registrado.</p>';
            return;
        }
        state.logs.forEach(log => {
            const item = document.createElement('div');
            item.className = 'history-item';
            item.innerHTML = `
                <div style="font-size: 0.85rem; font-weight: bold; color: var(--primary-color);">${log.action}</div>
                <div style="font-size: 0.75rem; color: var(--text-muted); margin-top: 4px;">${log.timestamp} - ID Log: ${log.id}</div>
            `;
            dom.historyListContainer.appendChild(item);
        });
    }

    function applyTheme(theme) {
        state.theme = theme;
        if (theme === 'dark') {
            document.documentElement.classList.remove('theme-light');
            document.documentElement.classList.add('theme-dark');
            dom.themeIcon.setAttribute('name', 'moon-outline');
            dom.themeText.textContent = 'Escuro';
        } else {
            document.documentElement.classList.remove('theme-dark');
            document.documentElement.classList.add('theme-light');
            dom.themeIcon.setAttribute('name', 'sunny-outline');
            dom.themeText.textContent = 'Claro';
        }
        saveData();
    }

    dom.btnOpenSidebar.addEventListener('click', (e) => {
        e.stopPropagation();
        toggleSidebar(true);
    });

    dom.sidebarOverlay.addEventListener('click', () => toggleSidebar(false));

    dom.btnSortMenu.addEventListener('click', (e) => {
        e.stopPropagation();
        toggleSortDropdown();
    });

    dom.btnOpenAddModal.addEventListener('click', () => {
        clearAddModalForm();
        openModal(dom.modalExpense);
    });

    if (dom.cancelAddModalBtn) {
        dom.cancelAddModalBtn.addEventListener('click', () => {
            clearAddModalForm();
            closeModal(dom.modalExpense);
        });
    }

    dom.btnCloseModalExpense.addEventListener('click', () => {
        clearAddModalForm();
        closeModal(dom.modalExpense);
    });
    
    dom.btnCloseModalEdit.addEventListener('click', () => closeModal(dom.modalEditExpense));

    dom.btnClearLogs.addEventListener('click', () => {
        if (state.logs.length === 0) return;

        const overlay = document.createElement('div');
        overlay.className = 'clear-logs-overlay';

        const modal = document.createElement('div');
        modal.className = 'clear-logs-modal';

        const icon = document.createElement('div');
        icon.className = 'clear-logs-icon';
        icon.innerHTML = `<ion-icon name="trash-outline"></ion-icon>`;

        const title = document.createElement('h3');
        title.className = 'clear-logs-title';
        title.textContent = 'Deseja limpar todo o histórico de ações?';

        const text = document.createElement('p');
        text.className = 'clear-logs-text';
        text.textContent = 'Essa ação não pode ser desfeita e apagará permanentemente todo o histórico.';

        const buttons = document.createElement('div');
        buttons.className = 'clear-logs-buttons';

        const cancelButton = document.createElement('button');
        cancelButton.className = 'clear-logs-cancel';
        cancelButton.type = 'button';
        cancelButton.textContent = 'Cancelar';

        const confirmButton = document.createElement('button');
        confirmButton.className = 'clear-logs-confirm';
        confirmButton.type = 'button';
        confirmButton.textContent = 'OK';

        buttons.appendChild(cancelButton);
        buttons.appendChild(confirmButton);

        modal.appendChild(icon);
        modal.appendChild(title);
        modal.appendChild(text);
        modal.appendChild(buttons);

        overlay.appendChild(modal);
        document.body.appendChild(overlay);
        updateBodyScrollState();

        cancelButton.addEventListener('click', () => {
            overlay.remove();
            updateBodyScrollState();
        });

        confirmButton.addEventListener('click', () => {
            state.logs = [];
            saveData();
            renderHistory();
            overlay.remove();
            updateBodyScrollState();
        });

        overlay.addEventListener('click', (event) => {
            if (event.target === overlay) {
                overlay.remove();
                updateBodyScrollState();
            }
        });
    });

    dom.menuItemDeveloper.addEventListener('click', () => {
        toggleSidebar(false);
        openModal(dom.modalDeveloper);
    });

    dom.btnCloseModalDeveloper.addEventListener('click', () => closeModal(dom.modalDeveloper));

    dom.btnCopyDevContact.addEventListener('click', () => {
        const tempTextArea = document.createElement('textarea');
        tempTextArea.value = devContactInfo;
        document.body.appendChild(tempTextArea);
        tempTextArea.select();
        document.execCommand('copy');
        document.body.removeChild(tempTextArea);

        showToast("Contato do desenvolvedor copiado para a área de transferência!");
    });

    dom.menuItemUpdates.addEventListener('click', () => {
        toggleSidebar(false);
        openModal(dom.modalUpdates);
    });

    if (dom.menuItemClean) {
        dom.menuItemClean.addEventListener('click', () => {
            toggleSidebar(false);

            if (state.debts.length === 0) {
                showToast("Nenhuma dívida para apagar.", "error");
                return;
            }

            const modalOverlay = document.createElement('div');
            modalOverlay.className = 'custom-modal-overlay active';
            modalOverlay.innerHTML = `
                <div class="custom-modal-box">
                    <div class="custom-modal-icon">⚠️</div>
                    <h3 class="custom-modal-title">ATENÇÃO!</h3>
                    <p class="custom-modal-message">
                        Tem certeza que deseja apagar <strong>TODAS</strong> as dívidas registradas?<br>
                        Esta ação não poderá ser desfeita.
                    </p>
                    <div class="custom-modal-actions">
                        <button id="btn-modal-cancel" class="btn-modal-secondary">Cancelar</button>
                        <button id="btn-modal-confirm" class="btn-modal-danger">Apagar Tudo</button>
                    </div>
                </div>
            `;

            document.body.appendChild(modalOverlay);
            updateBodyScrollState();

            modalOverlay.querySelector('#btn-modal-confirm').addEventListener('click', () => {
                const totalApagado = state.debts.length;
                state.debts = [];
                addLog(`Todas as dívidas foram apagadas (${totalApagado} registros removidos).`);
                saveData();
                renderDebts();
                showToast("Todas as dívidas foram removidas!");
                modalOverlay.remove();
                updateBodyScrollState();
            });

            modalOverlay.querySelector('#btn-modal-cancel').addEventListener('click', () => {
                modalOverlay.remove();
                updateBodyScrollState();
            });

            modalOverlay.addEventListener('click', (e) => {
                if (e.target === modalOverlay) {
                    modalOverlay.remove();
                    updateBodyScrollState();
                }
            });
        });
    }

    dom.menuItemHistory.addEventListener('click', () => {
        toggleSidebar(false);
        renderHistory();
        openModal(dom.modalHistory);
    });

    dom.btnCloseModalHistory.addEventListener('click', () => closeModal(dom.modalHistory));
    dom.btnCloseModalUpdates.addEventListener('click', () => closeModal(dom.modalUpdates));

    dom.btnPrevMonth.addEventListener('click', () => {
        state.currentDate.setMonth(state.currentDate.getMonth() - 1);
        renderDebts();
    });

    dom.btnNextMonth.addEventListener('click', () => {
        state.currentDate.setMonth(state.currentDate.getMonth() + 1);
        renderDebts();
    });

    dom.searchInput.addEventListener('input', (e) => {
        state.filterQuery = e.target.value;
        renderDebts();
    });

    dom.menuItemTheme.addEventListener('click', () => {
        const newTheme = state.theme === 'light' ? 'dark' : 'light';
        applyTheme(newTheme);
    });

    dom.formExpense.addEventListener('submit', (e) => {
        e.preventDefault();

        let company = dom.expenseCompany.value;
        if (company === 'custom') {
            company = dom.expenseCustomCompany.value.trim() || 'Outros';
        }

        const desc = dom.expenseDescription.value.trim();
        const rawValue = dom.expenseValue.value.replace(/\D/g, '');
        const val = rawValue ? parseFloat(rawValue) / 100 : 0;
        const date = dom.expenseDate.value;

        if (!desc || val <= 0 || !date) return;

        // Captura o horário exato em que a dívida foi criada (HH:mm)
        const currentTime = new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

        const newDebt = {
            id: generateRandomID(),
            company: company,
            description: desc,
            value: val,
            date: date,
            paid: false,
            createdAt: currentTime
        };

        state.debts.push(newDebt);
        addLog(`Nova dívida criada: [${company}] ${desc.substring(0, 25)}... (#${newDebt.id}) - ${formatCurrency(val)}`);
        saveData();

        clearAddModalForm();
        closeModal(dom.modalExpense);

        const createdDate = new Date(date + 'T00:00:00');
        state.currentDate = new Date(createdDate.getFullYear(), createdDate.getMonth(), 1);

        renderDebts();
    });

    dom.formEditExpense.addEventListener('submit', (e) => {
        e.preventDefault();

        const id = dom.editExpenseId.value;
        const debt = state.debts.find(d => d.id === id);

        if (debt) {
            let company = dom.editExpenseCompany.value;
            if (company === 'custom') {
                company = dom.editExpenseCustomCompany.value.trim() || 'Outros';
            }

            const rawEditValue = dom.editExpenseValue.value.replace(/\D/g, '');
            const parsedVal = rawEditValue ? parseFloat(rawEditValue) / 100 : 0;

            debt.company = company;
            debt.description = dom.editExpenseDescription.value.trim();
            debt.value = parsedVal;
            debt.date = dom.editExpenseDate.value;
            debt.paid = dom.editPaidTrue.checked;

            addLog(`Dívida #${debt.id} atualizada: [${debt.company}] ${debt.description.substring(0, 25)}...`);
            saveData();
            closeModal(dom.modalEditExpense);
            renderDebts();
        }
    });

    dom.btnShareExpense.addEventListener('click', () => {
        const id = dom.editExpenseId.value;
        const debt = state.debts.find(d => d.id === id);

        if (debt) {
            const dateObj = new Date(debt.date + 'T00:00:00');
            const formattedDate = dateObj.toLocaleDateString('pt-BR');
            const statusText = debt.paid ? 'PAGO' : 'PENDENTE';

            const shareText =
                `📌 DívidaZero - Detalhes da Conta\n` +
                `• Empresa: ${debt.company || 'Outros'}\n` +
                `• Descrição: ${debt.description}\n` +
                `• Valor: ${formatCurrency(debt.value)}\n` +
                `• Vencimento: ${formattedDate}\n` +
                `• ID: #${debt.id}\n` +
                `• Status de pagamento: ${statusText}\n\n` +
                `🔗 Acesse o DívidaZero:\n` +
                `https://teddyws1.github.io/DividaZero/`;

            if (navigator.share) {
                navigator.share({
                    title: 'DívidaZero - Detalhes da Dívida',
                    text: shareText
                }).catch(() => { });
            } else {
                const whatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(shareText)}`;
                const opened = window.open(whatsappUrl, '_blank', 'noopener,noreferrer');

                if (!opened) {
                    navigator.clipboard.writeText(shareText).then(() => {
                        showToast("Detalhes copiados para a área de transferência!");
                    });
                }
            }
        }
    });

    dom.btnDeleteExpense.addEventListener('click', () => {
        const id = dom.editExpenseId.value;
        const debtIndex = state.debts.findIndex(d => d.id === id);

        if (debtIndex !== -1) {
            const deleted = state.debts.splice(debtIndex, 1)[0];
            addLog(`Dívida #${deleted.id} (${deleted.description.substring(0, 20)}...) foi excluída.`);
            saveData();
            closeModal(dom.modalEditExpense);
            renderDebts();
        }
    });

    // SISTEMA DE SELEÇÃO DE PASTA INTELIGENTE (VERIFICA SE DividaZero_Dados.json JÁ EXISTE)
    dom.menuItemExport.addEventListener('click', async () => {
        toggleSidebar(false);
        const dataString = JSON.stringify(state, null, 2);

        // 1. TENTA USAR A API DE DIRETÓRIOS DO NAVEGADOR (FILE SYSTEM ACCESS API)
        if ('showDirectoryPicker' in window) {
            try {
                // Se ainda não escolheu uma pasta nesta sessão, solicita ao utilizador para escolher uma
                if (!exportDirectoryHandle) {
                    exportDirectoryHandle = await window.showDirectoryPicker();
                } else {
                    // Verifica se a permissão para mexer na pasta continua concedida
                    const options = { mode: 'readwrite' };
                    if (await exportDirectoryHandle.queryPermission(options) !== 'granted') {
                        if (await exportDirectoryHandle.requestPermission(options) !== 'granted') {
                            exportDirectoryHandle = null;
                            return;
                        }
                    }
                }

                // Procura na pasta escolhida se já existe o arquivo "DividaZero_Dados.json"
                // create: false faz com que ele apenas procure sem criar nada por enquanto
                try {
                    exportFileHandle = await exportDirectoryHandle.getFileHandle('DividaZero_Dados.json', { create: false });
                } catch (err) {
                    // Se não existir, o navegador lança um erro, então criamos o arquivo novo na pasta
                    exportFileHandle = await exportDirectoryHandle.getFileHandle('DividaZero_Dados.json', { create: true });
                }

                // Escreve os dados no arquivo encontrado ou recém-criado
                const writable = await exportFileHandle.createWritable();
                await writable.write(dataString);
                await writable.close();

                addLog("Backup atualizado na pasta selecionada.");
                showToast("Arquivo DividaZero_Dados.json guardado/atualizado!");
                return;
            } catch (err) {
                exportDirectoryHandle = null;
                exportFileHandle = null;
                if (err.name === 'AbortError') return; // Utilizador cancelou a caixa de diálogo
                console.warn('Fallback de diretório ativado:', err);
            }
        }

        // 2. FALLBACK UNIVERSAL (DOWNLOAD VIA BLOB CASO O BROWSER NÃO SUPORTE DIRETÓRIOS)
        const blob = new Blob([dataString], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const downloadAnchor = document.createElement('a');
        downloadAnchor.href = url;
        downloadAnchor.download = 'DividaZero_Dados.json';
        document.body.appendChild(downloadAnchor);
        downloadAnchor.click();
        downloadAnchor.remove();
        URL.revokeObjectURL(url);

        addLog("Backup dos dados exportado.");
        showToast("Backup gerado via download!");
    });

    dom.menuItemImport.addEventListener('click', () => {
        toggleSidebar(false);
        dom.importFileInput.click();
    });

    dom.importFileInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const importedData = JSON.parse(event.target.result);
                if (importedData.debts && Array.isArray(importedData.debts)) {
                    state.debts = importedData.debts;
                    state.logs = importedData.logs || [];
                    saveData();
                    renderDebts();
                    showToast("Dados importados com sucesso!");
                    addLog("Dados importados via arquivo JSON.");
                } else {
                    showToast("Formato de arquivo JSON inválido.", "error");
                }
            } catch (err) {
                showToast("Erro ao ler o arquivo JSON.", "error");
            }
            dom.importFileInput.value = '';
        };
        reader.readAsText(file);
    });

    document.addEventListener('gesturestart', function (e) {
        e.preventDefault();
    });

    document.addEventListener('dblclick', function (e) {
        e.preventDefault();
    }, { passive: false });

    applyTheme(state.theme);
    renderDebts();
});
////////////////////////////////-----
//
// - PARTE 3: MÁSCARA MONETÁRIA E UTILITÁRIOS FINAIS
//
////////////////////////////////----

function getCurrencyExtenso(val) {
    if (val <= 0) return '';
    if (val < 1e6) {
        return val.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    }

    const suffixes = [
        { value: 1e15, singular: 'quatrilhão', plural: 'quatrilhões' },
        { value: 1e12, singular: 'trilhão', plural: 'trilhões' },
        { value: 1e9,  singular: 'bilhão',  plural: 'bilhões' },
        { value: 1e6,  singular: 'milhão',  plural: 'milhões' }
    ];

    for (const scale of suffixes) {
        if (val >= scale.value) {
            const num = val / scale.value;
            const formatted = num % 1 === 0 
                ? num.toFixed(0) 
                : num.toFixed(2).replace(/\.?0+$/, '').replace('.', ',');

            const suffix = num >= 2 ? scale.plural : scale.singular;
            return `${formatted} ${suffix}`;
        }
    }

    return val.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function applyCurrencyMask(inputEl, displayEl = null) {
    if (!inputEl) return;

    const MAX_VALUE = 999999999999999.99; 

    function updateDisplayText(val) {
        if (displayEl) {
            displayEl.textContent = val > 0 ? getCurrencyExtenso(val) : '';
        }
    }

    inputEl.addEventListener('focus', (e) => {
        if (!e.target.value) {
            e.target.value = (0).toLocaleString('pt-BR', {
                style: 'currency',
                currency: 'BRL'
            });
            updateDisplayText(0);
        }
    });

    inputEl.addEventListener('input', (e) => {
        let digitsOnly = e.target.value.replace(/\D/g, '');

        if (!digitsOnly) {
            e.target.value = '';
            updateDisplayText(0);
            return;
        }

        let centsValue = parseFloat(digitsOnly) / 100;

        if (centsValue > MAX_VALUE) {
            digitsOnly = digitsOnly.slice(0, -1);
            centsValue = parseFloat(digitsOnly) / 100;
        }

        e.target.value = centsValue.toLocaleString('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        });

        updateDisplayText(centsValue);
    });

    inputEl.addEventListener('blur', (e) => {
        const digitsOnly = e.target.value.replace(/\D/g, '');
        if (!digitsOnly || parseFloat(digitsOnly) === 0) {
            e.target.value = '';
            updateDisplayText(0);
        }
    });
}

const mainExpenseInput = document.getElementById('expense-value');
const mainExpenseText = document.getElementById('expense-value-text');

const editExpenseInput = document.getElementById('edit-expense-value');
const editExpenseText = document.getElementById('edit-expense-value-text');

applyCurrencyMask(mainExpenseInput, mainExpenseText);
applyCurrencyMask(editExpenseInput, editExpenseText);

document.addEventListener("DOMContentLoaded", () => {
    const setupClearInput = (btnId, inputId) => {
        const btn = document.getElementById(btnId);
        const input = document.getElementById(inputId);

        if (btn && input) {
            btn.addEventListener("click", () => {
                input.value = "";
                input.focus();
                input.dispatchEvent(new Event("input", { bubbles: true }));
            });
        }
    };

    setupClearInput("btn-clear-value", "expense-value");
    setupClearInput("btn-clear-edit-value", "edit-expense-value");

    const triggerValueAnimation = (element) => {
        if (!element) return;
        element.classList.remove("value-pulse");
        void element.offsetWidth; 
        element.classList.add("value-pulse");
    };

    const valueElements = document.querySelectorAll(".animate-value");
    valueElements.forEach((el) => {
        const observer = new MutationObserver(() => triggerValueAnimation(el));
        observer.observe(el, { childList: true, characterData: true, subtree: true });
    });
});

const searchInput = document.getElementById('search-input');
const clearBtn = document.getElementById('clear-search');

if (searchInput && clearBtn) {
    searchInput.addEventListener('input', () => {
        if (searchInput.value.trim() !== '') {
            clearBtn.style.display = 'block'; 
        } else {
            clearBtn.style.display = 'none';  
        }
    });

    clearBtn.addEventListener('click', () => {
        searchInput.value = '';             
        clearBtn.style.display = 'none';    
        searchInput.focus();             
    });
}

//////////////////////////////////////
//
// - FIM DO JS
//
/////////////////////////////////////
