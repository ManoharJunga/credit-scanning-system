window.onload = async function () {
    const username = localStorage.getItem('username');
    console.log('Loaded username from localStorage:', username);

    if (!username) {
        console.warn('No username found in localStorage. Redirecting to login.');
        window.location.href = 'login.html';
        return;
    }

    document.getElementById('user-name').textContent = username;
    document.getElementById('profile-username').textContent = username;

    try {
        const response = await fetch(`http://localhost:3000/user/${username}`);
        
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();
        console.log('User data:', data);

        document.getElementById('credits').textContent = data.credits || 0;
    } catch (error) {
        console.error("Error fetching credits:", error);
    }
};
