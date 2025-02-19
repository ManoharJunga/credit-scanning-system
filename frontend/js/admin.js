document.addEventListener('DOMContentLoaded', () => {
    const creditRequestsTable = document.getElementById('credit-requests').getElementsByTagName('tbody')[0];

    // Fetch the credit requests
    fetch('/api/credit-requests') // Assuming an API that returns all pending credit requests
        .then(response => response.json())
        .then(data => {
            data.forEach(request => {
                const row = creditRequestsTable.insertRow();
                row.innerHTML = `
                    <td>${request.username}</td>
                    <td>${request.amount}</td>
                    <td><button class="approve-btn" data-user="${request.username}" data-amount="${request.amount}">Approve</button></td>
                `;
            });
        })
        .catch(error => console.error('Error fetching credit requests:', error));

    // Handle approve button click
    creditRequestsTable.addEventListener('click', (event) => {
        if (event.target && event.target.matches('button.approve-btn')) {
            const username = event.target.getAttribute('data-user');
            const amount = event.target.getAttribute('data-amount');

            // Approve the credit request (you should also update the backend database)
            fetch(`/api/approve-credit`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username, amount })
            })
                .then(response => response.json())
                .then(data => {
                    alert(`Credits for ${username} have been approved.`);
                    event.target.parentElement.parentElement.remove(); // Remove the row
                })
                .catch(error => console.error('Error approving credit:', error));
        }
    });
});
