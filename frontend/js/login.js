document.getElementById('login-form')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    console.log('Form submitted'); // Check if the form is actually submitted

    try {
        const response = await fetch('http://localhost:3000/user/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ username, password })
        });

        const data = await response.json();
        console.log('Response data:', data); // Check the response

        if (data.message === "Login successful" || data.message === "Admin login successful") {
            alert(data.message);
            
            // Check if it's an admin or user login and handle accordingly
            if (data.role === 'admin') {
                localStorage.setItem('username', username); // Store username in localStorage
                window.location.href = 'admin.html'; // Redirect to admin dashboard
            } else if (data.user && data.user.role) {
                localStorage.setItem('username', data.user.username); // Store username in localStorage
                window.location.href = 'dashboard.html'; // Redirect to user profile
            } else {
                document.getElementById('error-message').textContent = 'User data is missing.';
            }
        } else {
            document.getElementById('error-message').textContent = data.message;
        }
    } catch (error) {
        console.error('Error:', error);
        document.getElementById('error-message').textContent = 'Error logging in.';
    }
});
