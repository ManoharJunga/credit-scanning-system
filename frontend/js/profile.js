document.addEventListener("DOMContentLoaded", async function () {
    const username = localStorage.getItem("username");

    // Elements caching
    const userNameElement = document.getElementById("user-name");
    const profileUsernameElement = document.getElementById("profile-username");
    const userCreditsElement = document.getElementById("user-credits");
    const uploadedFilesList = document.getElementById("uploaded-files");

    // Redirect to login if no username is found
    if (!username) {
        window.location.href = "login.html";
        return;
    }

    // Display Username
    userNameElement.textContent = username;
    profileUsernameElement.textContent = username;

    try {
        // Fetch and update credits
        const response = await fetch(`http://localhost:3000/user/${username}`);
        if (!response.ok) throw new Error("Failed to fetch user credits");

        const data = await response.json();
        const credits = data.credits || 0;

        // Update credits in Profile Tab
        document.getElementById("credit-value").textContent = credits;
        document.querySelector("#credit-display span").textContent = credits;

        // Update credits in header
        userCreditsElement.innerHTML = `<i class="fa-solid fa-coins"></i> Credits: ${credits}`;

        // Fetch uploaded files
        const uploadsResponse = await fetch(`http://localhost:3000/upload/uploads/${username}`);
        if (!uploadsResponse.ok) throw new Error("Failed to fetch uploads");

        const uploadsData = await uploadsResponse.json();
        uploadedFilesList.innerHTML = "";

        uploadsData.forEach(file => {
            const listItem = document.createElement("div");
            listItem.classList.add("file-item");

            // Determine file type
            let fileType = "file";
            if (file.filename.endsWith(".pdf")) fileType = "pdf";
            else if (file.filename.match(/\.(doc|docx|txt)$/)) fileType = "doc";
            else if (file.filename.match(/\.(jpg|jpeg|png|gif)$/)) fileType = "img";

            listItem.setAttribute("data-type", fileType);

            listItem.innerHTML = `
                <img src="icons/${fileType}.png" alt="${fileType} icon">
                <p>${file.filename}</p>
                <a href="http://localhost:3000/uploads/${file.filename}" target="_blank">
                    <button class="view-btn"><i class="fa-solid fa-eye"></i> View</button>
                </a>
            `;

            uploadedFilesList.appendChild(listItem);
        });
    } catch (error) {
        console.error("Error:", error);
        alert("An error occurred. Please try again later.");
    }

    // Tab Switching with Animation
    const tabs = document.querySelectorAll(".tab-btn");
    const panes = document.querySelectorAll(".tab-pane");

    function openTab(tabId) {
        tabs.forEach(tab => tab.classList.remove("active"));
        panes.forEach(pane => pane.classList.remove("active", "fade-in"));

        document.querySelector(`[onclick="openTab('${tabId}')"]`).classList.add("active");
        const activePane = document.getElementById(tabId);
        activePane.classList.add("active", "fade-in");
    }

    window.openTab = openTab;

    // Load default active tab
    openTab("profile-tab");

    // Redirect to Dashboard
    document.getElementById("dashboard-link").addEventListener("click", function () {
        window.location.href = "dashboard.html";
    });

    // Logout functionality
    document.getElementById("logout-btn").addEventListener("click", function () {
        localStorage.removeItem("username");
        window.location.href = "login.html";
    });
});
