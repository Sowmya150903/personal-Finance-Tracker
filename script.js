let budget = {
    incomeTarget: 0,
    expenseTarget: 0,
};


let transactions = JSON.parse(localStorage.getItem('transactions')) || [];

document.addEventListener('DOMContentLoaded', updateSummary);

function setBudget() {
    budget.incomeTarget = document.getElementById('incomeTarget').value;
    budget.expenseTarget = document.getElementById('expenseTarget').value;
    localStorage.setItem('budget', JSON.stringify(budget));
    updateSummary();
}

function addEntry() {
    const description = document.getElementById('desc').value;
    const amount = parseFloat(document.getElementById('amount').value);
    const category = document.getElementById('category').value;
    const date = document.getElementById('date').value;

    if (description === '' || isNaN(amount) || date === '') {
        alert('Please fill out all fields');
        return;
    }

    const transaction = {
        description,
        amount: category === 'income' ? amount : -amount,
        category,
        date,
    };

    transactions.push(transaction);
    localStorage.setItem('transactions', JSON.stringify(transactions));

    updateSummary();
}

function updateSummary() {
    let income = 0;
    let expenses = 0;
    let categoryTotals = {};

    transactions.forEach(transaction => {
        if (transaction.amount > 0) {
            income += transaction.amount;
        } else {
            expenses += Math.abs(transaction.amount);
        }

        if (!categoryTotals[transaction.category]) {
            categoryTotals[transaction.category] = 0;
        }
        categoryTotals[transaction.category] += Math.abs(transaction.amount);
    });

    const totalSavings = income - expenses;
    const budgetData = JSON.parse(localStorage.getItem('budget')) || budget;

    // Populate the summary table
    const summaryTableBody = document.getElementById('summaryTable').getElementsByTagName('tbody')[0];
    summaryTableBody.innerHTML = `
                <tr>
                    <td>Total Income</td>
                    <td>₹${income.toFixed(2)}</td>
                </tr>
                <tr>
                    <td>Total Expenses</td>
                    <td>₹${expenses.toFixed(2)}</td>
                </tr>
                <tr>
                    <td>Savings</td>
                    <td>₹${totalSavings.toFixed(2)}</td>
                </tr>
                <tr>
                    <td>Income Target</td>
                    <td>₹${budgetData.incomeTarget}</td>
                </tr>
                <tr>
                    <td>Expense Target</td>
                    <td>₹${budgetData.expenseTarget}</td>
                </tr>
                <tr>
                    <td>On Track</td>
                    <td>${income >= budgetData.incomeTarget && expenses <= budgetData.expenseTarget ? 'Yes' : 'No'}</td>
                </tr>
            `;

    generateChart(categoryTotals, income);  // Pass income as the base for percentage calculation
}

function generateChart(categoryTotals, totalIncome) {
    const chartData = Object.keys(categoryTotals).map(category => {
        const amount = categoryTotals[category];
        const percentage = (amount / totalIncome) * 100;
        return {
            label: category,
            y: amount,
            percentage: percentage.toFixed(2),  // Add percentage value
        };
    });

    const chart = new CanvasJS.Chart("chartContainer", {
        animationEnabled: true,
        title: {
            text: "Expense Breakdown (Proportional to Income)"
        },
        data: [{
            type: "pie",
            startAngle: 240,
            yValueFormatString: "₹#,##0.00",
            indexLabel: "{label}: {y} ({percentage}%)",  // Display amount and percentage
            dataPoints: chartData
        }]
    });
    chart.render();
}
