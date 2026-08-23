//////////////////////////////////////
//
// - PARTE 1: ESTADO GLOBAL, DOM E RENDERIZAÇÃO
//
//////////////////////////////////////

let exportFileHandle = null;

document.addEventListener('DOMContentLoaded', () => {

    //////////////////////////////////////
    //
    // - ESTADO GLOBAL
    //
    //////////////////////////////////////
    const state = {
        debts: JSON.parse(localStorage.getItem('dz_debts')) || [],
        logs: JSON.parse(localStorage.getItem('dz_logs')) || [],
        currentDate: new Date(2026, 7, 1),
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

    //////////////////////////////////////
    //
    // - MAPEAMENTO DO DOM
    //
    //////////////////////////////////////
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
        formExpense: document.getElementById('form-expense'),
        expenseCompany: document.getElementById('expense-company'),
        customCompanyGroup: document.getElementById('custom-company-group'),
        expenseCustomCompany: document.getElementById('expense-custom-company'),
        expenseDescription: document.getElementById('expense-description'),
        expenseValue: document.getElementById('expense-value'),
        expenseDate: document.getElementById('expense-date'),
        charCounter: document.getElementById('char-counter'),

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

    //////////////////////////////////////
    //
    // - FUNÇÕES UTILITÁRIAS E LOGS
    //
    //////////////////////////////////////
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
        return val.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    }

//////////////////////////////////////
//
// -402IV mês do ano 
//
/////////////////////////////////////
function updateMonthDisplay() {
    const monthNames = [
        "janeiro",
        "fevereiro",
        "março",
        "abril",
        "maio",
        "junho",
        "julho",
        "agosto",
        "setembro",
        "outubro",
        "novembro",
        "dezembro"
    ];
    
    const month = monthNames[state.currentDate.getMonth()];
    const monthNumber = state.currentDate.getMonth() + 1;
    const year = state.currentDate.getFullYear();
    
    dom.currentMonthDisplay.innerHTML = `
        <ion-icon name="calendar-number-outline"></ion-icon>
        <span>${month} ${monthNumber} / ${year}</span>
    `;
}

    //////////////////////////////////////
    //
    // - RENDERIZAÇÃO DE DÍVIDAS
    //
    //////////////////////////////////////
    function renderDebts() {
        updateMonthDisplay();
        dom.debtsContainer.innerHTML = '';

        const currentMonth = state.currentDate.getMonth();
        const currentYear = state.currentDate.getFullYear();

        let mappedDebts = state.debts.map((d, index) => ({ ...d, originalIndex: index }));

        let filteredDebts = mappedDebts.filter(debt => {
            const debtDate = new Date(debt.date + 'T00:00:00');
            const matchesDate = debtDate.getMonth() === currentMonth && debtDate.getFullYear() === currentYear;

            const query = state.filterQuery.toLowerCase();
            const company = (debt.company || 'Outros').toLowerCase();
            const matchesQuery = debt.description.toLowerCase().includes(query) ||
                debt.id.toLowerCase().includes(query) ||
                company.includes(query);

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

                const card = document.createElement('div');
                card.className = 'debt-card';
                card.innerHTML = `
                    <div class="debt-info">
                        <div class="debt-header-info">
                            <span class="debt-tag-id">ID: ${debt.id}</span>
                            <span class="debt-company-badge"><ion-icon name="business-outline"></ion-icon>${companyName}</span>
                        </div>
                        <span class="debt-title">${debt.description}</span>
                        <div class="debt-date">
                            <ion-icon name="calendar-outline"></ion-icon> ${formattedDate}
                        </div>
                    </div>
                    <div class="debt-values">
                        <span class="debt-amount">${formatCurrency(debt.value)}</span>
                        <span class="status-badge ${debt.paid ? 'status-paid' : 'status-pending'}" data-id="${debt.id}">
                            <ion-icon name="${debt.paid ? 'checkmark-circle-outline' : 'time-outline'}"></ion-icon>
                            ${debt.paid ? 'Pago' : 'Pendente'}
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
// - PARTE 2: MODAIS, EVENTOS E BACKUP/IMPORT
//
//////////////////////////////////////

    //////////////////////////////////////
    //
    // - MANIPULAÇÃO DE MODAIS E INTERFAZ
    //
    //////////////////////////////////////
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
        dom.editExpenseValue.value = debt.value;
        dom.editExpenseDate.value = debt.date;

        if (debt.paid) {
            dom.editPaidTrue.checked = true;
        } else {
            dom.editPaidFalse.checked = true;
        }

        dom.editCharCounter.textContent = `${debt.description.length} caracteres`;
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
        if (modal) modal.classList.add('active');
    }

    function closeModal(modal) {
        if (modal) modal.classList.remove('active');
    }

    function toggleSidebar(open) {
        if (open) {
            dom.sidebar.classList.add('active');
            dom.sidebarOverlay.classList.add('active');
        } else {
            dom.sidebar.classList.remove('active');
            dom.sidebarOverlay.classList.remove('active');
        }
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

        if (event.target.classList.contains('modal-overlay')) {
            closeModal(event.target);
        }
    }

    document.addEventListener('click', handleOutsideClick);
    document.addEventListener('touchstart', handleOutsideClick, { passive: true });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            toggleSidebar(false);
            toggleSortDropdown(false);
            closeModal(dom.modalExpense);
            closeModal(dom.modalEditExpense);
            closeModal(dom.modalHistory);
            closeModal(dom.modalUpdates);
            closeModal(dom.modalDeveloper);
        }
    });

    //////////////////////////////////////
    //
    // - LISTENERS DE FORMULÁRIOS E BOTÕES
    //
    //////////////////////////////////////
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

    dom.expenseDescription.addEventListener('input', (e) => {
        dom.charCounter.textContent = `${e.target.value.length} caracteres`;
    });

    dom.editExpenseDescription.addEventListener('input', (e) => {
        dom.editCharCounter.textContent = `${e.target.value.length} caracteres`;
    });

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
        const today = new Date();
        const yyyy = today.getFullYear();
        const mm = String(today.getMonth() + 1).padStart(2, '0');
        const dd = String(today.getDate()).padStart(2, '0');
        dom.expenseDate.value = `${yyyy}-${mm}-${dd}`;
        dom.charCounter.textContent = '0 caracteres';
        dom.customCompanyGroup.style.display = 'none';
        dom.expenseCustomCompany.value = '';
        dom.expenseCompany.value = 'Outros';
        openModal(dom.modalExpense);
    });

    dom.btnCloseModalExpense.addEventListener('click', () => closeModal(dom.modalExpense));
    dom.btnCloseModalEdit.addEventListener('click', () => closeModal(dom.modalEditExpense));

    dom.btnClearLogs.addEventListener('click', () => {
        if (state.logs.length === 0) return;
        if (confirm('Deseja limpar todo o histórico de ações?')) {
            state.logs = [];
            saveData();
            renderHistory();
        }
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

            modalOverlay.querySelector('#btn-modal-confirm').addEventListener('click', () => {
                const totalApagado = state.debts.length;
                state.debts = [];
                addLog(`Todas as dívidas foram apagadas (${totalApagado} registros removidos).`);
                saveData();
                renderDebts();
                showToast("Todas as dívidas foram removidas!");
                modalOverlay.remove();
            });

            modalOverlay.querySelector('#btn-modal-cancel').addEventListener('click', () => {
                modalOverlay.remove();
            });

            modalOverlay.addEventListener('click', (e) => {
                if (e.target === modalOverlay) modalOverlay.remove();
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
        const val = parseFloat(dom.expenseValue.value);
        const date = dom.expenseDate.value;

        if (!desc || isNaN(val) || !date) return;

        const newDebt = {
            id: generateRandomID(),
            company: company,
            description: desc,
            value: val,
            date: date,
            paid: false
        };

        state.debts.push(newDebt);
        addLog(`Nova dívida criada: [${company}] ${desc.substring(0, 25)}... (#${newDebt.id}) - ${formatCurrency(val)}`);
        saveData();

        dom.expenseDescription.value = '';
        dom.expenseValue.value = '';
        dom.expenseCustomCompany.value = '';
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

            debt.company = company;
            debt.description = dom.editExpenseDescription.value.trim();
            debt.value = parseFloat(dom.editExpenseValue.value);
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
                `• Status: ${statusText}\n\n` +
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

    //////////////////////////////////////
    //
    // - SISTEMA DE EXPORTAÇÃO E IMPORTAÇÃO DE BACKUP
    //
    //////////////////////////////////////
    dom.menuItemExport.addEventListener('click', async () => {
        toggleSidebar(false);
        const dataString = JSON.stringify(state, null, 2);

        if ('showSaveFilePicker' in window) {
            try {
                if (!exportFileHandle) {
                    exportFileHandle = await window.showSaveFilePicker({
                        suggestedName: 'DividaZero_Dados.json',
                        types: [{
                            description: 'Arquivo JSON',
                            accept: { 'application/json': ['.json'] }
                        }]
                    });
                } else {
                    const options = { mode: 'readwrite' };
                    if (await exportFileHandle.queryPermission(options) !== 'granted') {
                        if (await exportFileHandle.requestPermission(options) !== 'granted') {
                            exportFileHandle = null;
                            return;
                        }
                    }
                }

                const writable = await exportFileHandle.createWritable();
                await writable.write(dataString);
                await writable.close();

                addLog("Backup atualizado no mesmo arquivo.");
                showToast("Arquivo atualizado com sucesso!");
                return;
            } catch (err) {
                exportFileHandle = null;
                if (err.name === 'AbortError') return;
                console.warn('Fallback ativado:', err);
            }
        }

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
        showToast("Dados exportados!");
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
//////////////////////////////////////
//
// - PARTE 3: INSTALAÇÃO PWA, COMPARTILHAMENTO E RODAPÉ DRAWER
//
//////////////////////////////////////

    //////////////////////////////////////
    //
    // - SUPORTE A PWA / INSTALAÇÃO DO APP
    //
    //////////////////////////////////////
let deferredPrompt = null;
const installApp = document.getElementById("installApp");

window.addEventListener("beforeinstallprompt", (event) => {
    event.preventDefault();
    deferredPrompt = event;
    if (installApp) {
        installApp.hidden = false;
    }
});

if (installApp) {
    installApp.addEventListener("click", async () => {
        if (!deferredPrompt) return;
        deferredPrompt.prompt();
        await deferredPrompt.userChoice;
        deferredPrompt = null;
        installApp.hidden = true;
    });
}

window.addEventListener("appinstalled", () => {
    deferredPrompt = null;
    if (installApp) {
        installApp.hidden = true;
    }
});

    //////////////////////////////////////
    //
    // - COMPARTILHAMENTO DO SITE E REDES SOCIAIS
    //
    //////////////////////////////////////
const DIVIDA_ZERO_URL = "https://teddyws1.github.io/DividaZero/";
const DIVIDA_ZERO_TITLE = "DívidaZero - Gestão Inteligente de Dívidas";
const DIVIDA_ZERO_MESSAGE = "Conheça o DívidaZero — Gestão Inteligente de Dívidas.";

const btnShareSite = document.getElementById("btn-share-site");
const modalShareSite = document.getElementById("modal-share-site");
const btnCloseModalShare = document.getElementById("btn-close-modal-share");

const shareWhatsapp = document.getElementById("share-whatsapp");
const shareFacebook = document.getElementById("share-facebook");
const shareInstagram = document.getElementById("share-instagram");
const shareCopyLink = document.getElementById("share-copy-link");

function openShareModal() {
    if (!modalShareSite) return;
    modalShareSite.classList.add("active");
}

function closeShareModal() {
    if (!modalShareSite) return;
    modalShareSite.classList.remove("active");
}

if (btnShareSite) {
    btnShareSite.addEventListener("click", () => openShareModal());
}

if (btnCloseModalShare) {
    btnCloseModalShare.addEventListener("click", closeShareModal);
}

if (shareWhatsapp) {
    shareWhatsapp.addEventListener("click", () => {
        const message = encodeURIComponent(`${DIVIDA_ZERO_MESSAGE}\n\n${DIVIDA_ZERO_URL}`);
        window.open(`https://wa.me/?text=${message}`, "_blank", "noopener,noreferrer");
    });
}

if (shareFacebook) {
    shareFacebook.addEventListener("click", () => {
        const url = encodeURIComponent(DIVIDA_ZERO_URL);
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}`, "_blank", "noopener,noreferrer");
    });
}

if (shareInstagram) {
    shareInstagram.addEventListener("click", async () => {
        try {
            if (navigator.share) {
                await navigator.share({
                    title: DIVIDA_ZERO_TITLE,
                    text: DIVIDA_ZERO_MESSAGE,
                    url: DIVIDA_ZERO_URL
                });
            } else {
                await navigator.clipboard.writeText(DIVIDA_ZERO_URL);
                showToast("Link do DívidaZero copiado!");
            }
        } catch (error) {
            if (error.name !== "AbortError") {
                console.error("Erro ao compartilhar:", error);
            }
        }
    });
}

if (shareCopyLink) {
    shareCopyLink.addEventListener("click", async () => {
        try {
            await navigator.clipboard.writeText(DIVIDA_ZERO_URL);
            showToast("Link do DívidaZero copiado!");
        } catch (error) {
            console.error("Erro ao copiar o link:", error);
            showToast("Não foi possível copiar o link.", "error");
        }
    });
}

if (modalShareSite) {
    modalShareSite.addEventListener("click", (event) => {
        if (event.target === modalShareSite) {
            closeShareModal();
        }
    });
}

document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && modalShareSite && modalShareSite.classList.contains("active")) {
        closeShareModal();
    }
});

    //////////////////////////////////////
    //
    // - TOAST NOTIFICAÇÕES E DESENVOLVEDOR
    //
    //////////////////////////////////////
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
    //
    // - INTERAÇÃO TOUCH DRAWER DO RODAPÉ
    //
    //////////////////////////////////////
document.addEventListener("DOMContentLoaded", () => {
    const drawer = document.getElementById("footer-drawer");
    const handle = document.getElementById("footer-drag-handle");
    if (!drawer || !handle) return;

    let startY = 0;
    let startPosition = 0;
    let currentPosition = 0;
    let drawerHeight = 0;
    let dragging = false;
    let closedByDrag = false;

    function isBlocked() {
        const modal = document.querySelector(".modal-overlay.active, .modal.active, .image-modal-overlay.active");
        const sidebar = document.querySelector("#sidebar.active, .sidebar.active");
        return !!modal || !!sidebar;
    }

    function closeFooterInstant() {
        updateHeight();
        currentPosition = drawerHeight;
        drawer.style.transition = "none";
        drawer.style.transform = `translateY(${drawerHeight}px)`;
        closedByDrag = true;
        dragging = false;
    }

    function updateHeight() {
        drawerHeight = drawer.offsetHeight;
    }

    function setPosition(position) {
        currentPosition = Math.max(0, Math.min(drawerHeight, position));
        drawer.style.transform = `translateY(${currentPosition}px)`;
    }

    function startDrag(event) {
        if (event.touches.length !== 1) return;
        if (isBlocked()) {
            closeFooterInstant();
            return;
        }
        updateHeight();
        startY = event.touches[0].clientY;
        startPosition = currentPosition;
        closedByDrag = false;
        dragging = true;
        drawer.style.transition = "none";
    }

    function moveDrag(event) {
        if (!dragging) return;
        if (isBlocked()) {
            closeFooterInstant();
            return;
        }

        const fingerY = event.touches[0].clientY;
        const difference = fingerY - startY;

        if (difference >= 5) {
            closeFooterInstant();
            return;
        }

        setPosition(startPosition + difference);
    }

    function endDrag() {
        if (!dragging) return;
        dragging = false;

        if (closedByDrag) return;
        if (isBlocked()) {
            closeFooterInstant();
            return;
        }

        drawer.style.transition = "transform 0.12s ease-out";
        setPosition(currentPosition);
    }

    handle.addEventListener("touchstart", startDrag, { passive: true });
    handle.addEventListener("touchmove", moveDrag, { passive: true });
    handle.addEventListener("touchend", endDrag, { passive: true });
    handle.addEventListener("touchcancel", endDrag, { passive: true });

    const observer = new MutationObserver(() => {
        if (isBlocked()) closeFooterInstant();
    });

    observer.observe(document.body, {
        subtree: true,
        attributes: true,
        attributeFilter: ["class"]
    });

    window.addEventListener("resize", () => {
        updateHeight();
        if (currentPosition > drawerHeight) {
            currentPosition = drawerHeight;
            drawer.style.transform = `translateY(${drawerHeight}px)`;
        }
    });

    updateHeight();
    currentPosition = drawerHeight;
    drawer.style.transform = `translateY(${drawerHeight}px)`;
});

/////////////////////////////////////
//
// -029LO sistema de Scroll entre páginas 
//
////////////////////////////////////
let bookSwipeStartX = 0;
let bookSwipeStartY = 0;
let bookMouseIsDown = false;
let bookMouseStartX = 0;
let bookMouseStartY = 0;
let bookIsSwiping = false;

function isAnyModalOrSidebarOpen() {
    const activeModal = document.querySelector(
        '.modal.active, .modal.show, .modal[style*="display: block"]'
    );

    const activeSidebar = document.querySelector(
        '.sidebar.active, .sidebar.open, .drawer.open'
    );

    const activeCard = document.querySelector(
        '.debt-card.expanded, .card.open'
    );

    return (
        activeModal !== null ||
        activeSidebar !== null ||
        activeCard !== null
    );
}

// Toque (Mobile) - Otimizado para resposta imediata
window.addEventListener(
    'touchstart',
    (e) => {
        if (isAnyModalOrSidebarOpen()) return;

        if (e.touches && e.touches.length === 1) {
            bookSwipeStartX = e.touches[0].clientX;
            bookSwipeStartY = e.touches[0].clientY;
            bookIsSwiping = true;
            document.body.style.transition = 'none';
        }
    },
    { passive: true }
);

window.addEventListener(
    'touchmove',
    (e) => {
        if (!bookIsSwiping) return;
        if (!e.touches || e.touches.length === 0) return;

        const currentX = e.touches[0].clientX;
        const currentY = e.touches[0].clientY;

        const diffX = bookSwipeStartX - currentX;
        const diffY = Math.abs(bookSwipeStartY - currentY);

        // Se o usuário inclinar muito para cima ou para baixo, cancela o swipe lateral
        if (diffY > 80) {
            bookIsSwiping = false;
            document.body.style.transform = 'translateX(0)';
            return;
        }

        // Acompanhamento leve e fluido do dedo na horizontal
        document.body.style.transform = `translateX(${-diffX * 0.5}px)`;
    },
    { passive: true }
);

window.addEventListener(
    'touchend',
    (e) => {
        if (isAnyModalOrSidebarOpen()) return;
        if (!bookIsSwiping) return;

        if (!e.changedTouches || e.changedTouches.length === 0) {
            bookIsSwiping = false;
            return;
        }

        const swipeEndX = e.changedTouches[0].clientX;
        const diffX = bookSwipeStartX - swipeEndX;

        // Reduzido para 90px para disparar a troca de aba mais rápido e sem esforço
        const threshold = 90;

        if (Math.abs(diffX) > threshold) {
            triggerBookPageTurn(diffX > 0 ? 'next' : 'prev');
        } else {
            // Volta suavemente se arrastar pouco
            document.body.style.transition = 'transform 0.2s ease';
            document.body.style.transform = 'translateX(0)';
        }

        bookIsSwiping = false;
    },
    { passive: true }
);

// Mouse (PC)
window.addEventListener(
    'mousedown',
    (e) => {
        if (isAnyModalOrSidebarOpen()) return;
        if (e.target.closest('button') || e.target.closest('input')) return;

        bookMouseIsDown = true;
        bookMouseStartX = e.clientX;
        bookMouseStartY = e.clientY;
        bookIsSwiping = true;
        document.body.style.transition = 'none';
    }
);

window.addEventListener(
    'mousemove',
    (e) => {
        if (!bookMouseIsDown || !bookIsSwiping) return;

        const diffX = bookMouseStartX - e.clientX;
        const diffY = Math.abs(bookMouseStartY - e.clientY);

        if (diffY > 80) {
            bookIsSwiping = false;
            document.body.style.transform = 'translateX(0)';
            return;
        }

        document.body.style.transform = `translateX(${-diffX * 0.5}px)`;
    }
);

window.addEventListener(
    'mouseup',
    (e) => {
        if (!bookMouseIsDown) return;
        if (isAnyModalOrSidebarOpen()) {
            bookMouseIsDown = false;
            return;
        }

        const diffX = bookMouseStartX - e.clientX;
        const threshold = 90;

        if (Math.abs(diffX) > threshold) {
            triggerBookPageTurn(diffX > 0 ? 'next' : 'prev');
        } else {
            document.body.style.transition = 'transform 0.2s ease';
            document.body.style.transform = 'translateX(0)';
        }

        bookMouseIsDown = false;
        bookIsSwiping = false;
    }
);

function triggerBookPageTurn(direction) {
    if (isAnyModalOrSidebarOpen()) return;

    document.body.style.transition = 'transform 0.25s ease-out';
    
    // Joga a tela rapidamente para fora na direção do arraste
    if (direction === 'next') {
        document.body.style.transform = 'translateX(-100vw)';
    } else {
        document.body.style.transform = 'translateX(100vw)';
    }

    // Tempo de resposta reduzido para 250ms (muito mais rápido e sem travamentos)
    setTimeout(() => {
        window.location.href = 'painel-resumo.html';
    }, 250);
}



/////////////////////////////////////
//
// - fim do js 
//
////////////////////////////////////
