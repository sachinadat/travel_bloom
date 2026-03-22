const searchInput = document.getElementById('searchInput');
const btnSearch = document.getElementById('btnSearch');
const btnClear = document.getElementById('btnClear');
const resultsTitle = document.getElementById('resultsTitle');
const resultsList = document.getElementById('resultsList');

function clearResults(message = 'Enter a keyword (e.g., "beach" / "temple" / "country") and press Search.') {
    resultsTitle.textContent = 'Search results';
    resultsList.innerHTML = `<p class="no-results">${message}</p>`;
}

function normalizeKeyword(keyword) {
    // Normalize singular/plural forms for the supported keywords.
    // This keeps the lookup stable even if user enters "beach" or "beaches" etc.
    const map = {
        beach: 'beaches',
        beaches: 'beaches',
        temple: 'temples',
        temples: 'temples',
        country: 'countries',
        countries: 'countries'
    };

    if (map[keyword]) {
        return map[keyword];
    }

    // Fallback: try a simple pluralization if the keyword doesn't exist
    if (!keyword.endsWith('s')) {
        if (keyword.endsWith('y')) {
            return `${keyword.slice(0, -1)}ies`;
        }
        if (keyword.endsWith('ch') || keyword.endsWith('sh') || keyword.endsWith('x') || keyword.endsWith('z')) {
            return `${keyword}es`;
        }
        return `${keyword}s`;
    }

    return keyword;
}

function performKeywordSearch() {
    const input = searchInput.value.trim().toLowerCase();

    if (!input) {
        clearResults('Please enter a keyword to search.');
        return;
    }

    const normalized = normalizeKeyword(input);

    fetch('travel_recommendation_api.json')
        .then(response => response.json())
        .then(data => {
            const result = data[normalized] || data[input];

            if (result) {
                displayResults(result, normalized);
            } else {
                clearResults(`No results found for "${input}". Try "beaches", "temples", or "countries".`);
            }
        })
        .catch(error => {
            console.error('Error:', error);
            clearResults('An error occurred while fetching data. Please try again.');
        });
}

btnSearch.addEventListener('click', performKeywordSearch);
btnClear.addEventListener('click', () => {
    searchInput.value = '';
    clearResults();
});

searchInput.addEventListener('keydown', event => {
    if (event.key === 'Enter') {
        performKeywordSearch();
    }
});

function displayResults(results, category) {
    const resultsList = document.getElementById('resultsList');
    let html = '';

    if (category === 'countries') {
        results.forEach(country => {
            html += `<div class="result-item country">`;
            html += `<h3>${country.name}</h3>`;
            country.cities.forEach(city => {
                html += `
                    <div class="city-item">
                        <img src="${city.imageUrl}" alt="${city.name}">
                        <h4>${city.name}</h4>
                        <p>${city.description}</p>
                        <button class="visit-btn">Visit</button>
                    </div>
                `;
            });
            html += `</div>`;
        });
    } else {
        results.forEach(item => {
            html += `
                <div class="result-item">
                    <img src="${item.imageUrl}" alt="${item.name}">
                    <h3>${item.name}</h3>
                    <p>${item.description}</p>
                    <button class="visit-btn">Visit</button>
                </div>
            `;
        });
    }

    resultsList.innerHTML = html;
}