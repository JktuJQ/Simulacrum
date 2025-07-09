let activeFilters = {};

document.getElementById('searchInput').addEventListener('input', function(e) {
    const searchTerm = e.target.value.toLowerCase();
    filterLoans();
});

['amountFilter', 'termFilter', 'rateFilter', 'riskFilter'].forEach(filterId => {
    document.getElementById(filterId).addEventListener('change', function(e) {
        const value = e.target.value;
        const label = e.target.options[e.target.selectedIndex].text;

        if (value) {
            activeFilters[filterId] = { value, label };
        } else {
            delete activeFilters[filterId];
        }

        updateFilterBadges();
        filterLoans();
    });
});

document.getElementById('sortSelect').addEventListener('change', function(e) {
    sortLoans(e.target.value);
});

function updateFilterBadges() {
    const badgesContainer = document.getElementById('filterBadges');
    const activeFiltersDiv = document.getElementById('activeFilters');

    badgesContainer.innerHTML = '';

    if (Object.keys(activeFilters).length === 0) {
        activeFiltersDiv.style.display = 'none';
        return;
    }

    activeFiltersDiv.style.display = 'block';

    Object.keys(activeFilters).forEach(filterId => {
        const filter = activeFilters[filterId];
        const badge = document.createElement('span');
        badge.className = 'filter-badge';
        badge.innerHTML = `
                ${filter.label}
                <button onclick="removeFilter('${filterId}')">
                    <i class="bi bi-x"></i>
                </button>
            `;
        badgesContainer.appendChild(badge);
    });
}

function removeFilter(filterId) {
    delete activeFilters[filterId];
    document.getElementById(filterId).value = '';
    updateFilterBadges();
    filterLoans();
}

function filterLoans() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    const loanCards = document.querySelectorAll('.loan-card');

    loanCards.forEach(card => {
        let showCard = true;

        if (searchTerm) {
            const cardText = card.textContent.toLowerCase();
            if (!cardText.includes(searchTerm)) {
                showCard = false;
            }
        }

        if (activeFilters.amountFilter) {
            const amount = parseInt(card.dataset.amount);
            const filter = activeFilters.amountFilter.value;

            if (filter === 'small' && amount >= 1000) showCard = false;
            if (filter === 'medium' && (amount < 1000 || amount > 5000)) showCard = false;
            if (filter === 'large' && amount <= 5000) showCard = false;
        }

        if (activeFilters.rateFilter) {
            const rate = parseFloat(card.dataset.rate);
            const filter = activeFilters.rateFilter.value;

            if (filter === 'low' && rate >= 10) showCard = false;
            if (filter === 'medium' && (rate < 10 || rate > 20)) showCard = false;
            if (filter === 'high' && rate <= 20) showCard = false;
        }

        if (activeFilters.riskFilter) {
            const ltv = parseInt(card.dataset.ltv);
            const filter = activeFilters.riskFilter.value;

            if (filter === 'low' && ltv > 50) showCard = false;
            if (filter === 'medium' && (ltv <= 50 || ltv > 70)) showCard = false;
            if (filter === 'high' && ltv <= 70) showCard = false;
        }

        if (activeFilters.termFilter) {
            const term = parseInt(card.dataset.term);
            const filter = activeFilters.termFilter.value;

            if (filter === 'short' && term > 30) showCard = false;
            if (filter === 'medium' && (term <= 30 || term > 90)) showCard = false;
            if (filter === 'long' && term <= 90) showCard = false;
        }

        card.style.display = showCard ? 'block' : 'none';
    });
}

function sortLoans(sortBy) {
    const grid = document.getElementById('loansGrid');
    const cards = Array.from(grid.querySelectorAll('.loan-card'));

    cards.sort((a, b) => {
        switch (sortBy) {
            case 'rate':
                return parseFloat(b.dataset.rate) - parseFloat(a.dataset.rate);
            case 'amount':
                return parseInt(b.dataset.amount) - parseInt(a.dataset.amount);
            case 'ltv':
                return parseInt(a.dataset.ltv) - parseInt(b.dataset.ltv);
            default: // newest
                return 0; // Keep original order
        }
    });

    cards.forEach(card => grid.appendChild(card));
}

function confirmFunding(loanId) {
    alert(`Финансирование займа ${loanId} подтверждено! В реальном приложении здесь будет вызов смарт-контракта.`);

    document.querySelectorAll('.modal').forEach(modal => {
        modal.classList.remove('show');
    });

    const loanCard = document.querySelector(`[data-loan-id="${loanId}"]`);
    if (loanCard) {
        const statusElement = loanCard.querySelector('.loan-status');
        if (statusElement) {
            statusElement.textContent = 'Профинансирован';
            statusElement.className = 'loan-status status-funded';
        }
    }
}