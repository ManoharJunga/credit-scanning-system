document.getElementById('register-form')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value.trim();
    const errorMessage = document.getElementById('error-message');

    errorMessage.textContent = ''; // Clear previous errors

    if (!username || !password) {
        errorMessage.textContent = "Please enter a username and password.";
        return;
    }

    try {
        const response = await fetch('http://localhost:3000/user/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ username, password, role: "user" }) // Default role included
        });

        const data = await response.json();

        if (data.message === "User registered successfully") {
            alert("Registration successful! Redirecting to login...");
            window.location.href = 'login.html';
        } else {
            errorMessage.textContent = data.message;
        }
    } catch (error) {
        console.error('Registration Error:', error);
        errorMessage.textContent = "Server error. Please try again.";
    }
});
