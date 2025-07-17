const ctx = document.getElementById('chart').getContext('2d');
let chartInstance = null;

document.getElementById('calculator').addEventListener('submit', function(e) {
    e.preventDefault();

    // Récupération des valeurs
    const initial = parseFloat(document.getElementById('initial').value);
    const monthly = parseFloat(document.getElementById('monthly').value);
    const rate = parseFloat(document.getElementById('rate').value) / 100 / 12;
    const years = parseInt(document.getElementById('years').value);
    const withdrawal = parseFloat(document.getElementById('withdrawal').value);
    const taxRate = parseFloat(document.getElementById('taxRate').value) / 100;
    const months = years * 12;


    let monthlyData = [];
    let monthlyLabels = [];
    let capital = initial;
    
    for (let i = 0; i < months; i++) {
        capital *= 1 + rate; // intérêt sur le capital
        capital += monthly; // versement mensuel
        capital -= withdrawal; // retrait mensuel
        if (capital < 0) {
            capital = 0; // éviter les valeurs négatives
        }

        monthlyData.push(capital.toFixed(2));
        monthlyLabels.push(`Mois ${i}`);
    }

    // On calcule les gains (intérêts) pour appliquer la fiscalité
    const totalInvested = initial + (monthly * months);
    const gain = capital - totalInvested;
    const tax = gain > 0 ? gain * taxRate : 0;
    const capitalAfterTax = capital - tax;
    
    
    // Affichage du résultat
    document.getElementById('finalAmount').innerText = `Après ${years} an${years > 1 ? 's' : ''}, vous aurez accumulé: ${capitalAfterTax.toFixed(2)} € (impôt déduit de ${tax.toFixed(2)} €)`;
    // Préparer les données pour le graphique
    let data = [];
    let labels = [];

    const tableBody = document.querySelector('#summaryTable tbody');
    tableBody.innerHTML = '';

    for (let year = 1; year <= years; year++) {
        let m = year * 12;
        let value = initial * Math.pow(1 + rate, m) + monthly * ((Math.pow(1 + rate, m) - 1) / rate);
        data.push(parseFloat(value.toFixed(2)));
        labels.push(`${year} ans${year > 1 ? 's' : ''}`);
    }

    let capitalYear = initial;

    

    for (let year = 1; year <= years; year++) {
        let invested = initial + monthly * (year * 12);

        for (let m = 1; m <= 12; m++) {
            capitalYear *= 1 + rate;
            capitalYear += monthly;
            capitalYear -= withdrawal;
            if (capitalYear < 0) capitalYear = 0;
        }

        const interest = capitalYear - invested;

        const row = document.createElement('tr');
        row.innerHTML = `
        <td>${year}</td>
        <td>${invested.toFixed(2)} €</td>
        <td>${capitalYear.toFixed(2)} €</td>
        <td>${interest.toFixed(2)} €</td>
        `;
        tableBody.appendChild(row);
    }

    

    // Si le graphique existe déjà, le détruire
    if (chartInstance) {
        chartInstance.destroy();
    }

    // Création du graphique
    chartInstance = new Chart(ctx, {
        type: 'line',
        data: {
            labels: monthlyLabels,
            datasets: [{
                label: 'Croissance du capital (€)',
                data: monthlyData,
                borderColor: '#3b82f6',
                backgroundColor: 'rgba(59, 130, 246, 0.2)',
                fill: true,
                tension: 0.3,
                pointRadius: 3
            }]
        },
        options: {
            responsive: true,
            scales: {
                y: {
                    ticks: {
                        callback: value => `${value.toLocaleString('fr-FR')} €`
                    }
                }
            },
            plugins: {
                legend: {
                    display: true,
                },
                tooltip: {
                    callbacks: {
                        label: context => `${context.parsed.y.toLocaleString('fr-FR')}`
                    }
                }
            }
        }
    })
})