document.addEventListener("DOMContentLoaded", async function () {
    const username = localStorage.getItem("username");

    // Elements caching
    const userNameElement = document.getElementById("user-name");
    const profileUsernameElement = document.getElementById("profile-username");
    const userCreditsElement = document.getElementById("user-credits");
    const uploadedFilesList = document.getElementById("uploaded-files");

    if (!username) {
        window.location.href = "login.html";
        return;
    }
    
    userNameElement.textContent = username;
    profileUsernameElement.textContent = username;

    try {
        const response = await fetch(`http://localhost:3000/user/${username}`);
        if (!response.ok) throw new Error("Failed to fetch user credits");

        const data = await response.json();
        const credits = data.credits || 0;

        document.getElementById("credit-value").textContent = credits;
        document.querySelector("#credit-display span").textContent = credits;
        userCreditsElement.innerHTML = `<i class="fa-solid fa-coins"></i> Credits: ${credits}`;

        const uploadsResponse = await fetch(`http://localhost:3000/upload/uploads/${username}`);
        if (!uploadsResponse.ok) throw new Error("Failed to fetch uploads");

        const uploadsData = await uploadsResponse.json();
        uploadedFilesList.innerHTML = "";

        uploadsData.forEach(file => {
            const listItem = document.createElement("div");
            listItem.classList.add("file-item");

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
                <button class="delete-btn" onclick="deleteFile('${file.filename}', this)">
                    <i class="fa-solid fa-trash"></i> Delete
                </button>
            `;

            uploadedFilesList.appendChild(listItem);
        });
    } catch (error) {
        console.error("Error:", error);
        alert("An error occurred. Please try again later.");
    }

    window.deleteFile = async function (filename, button) {
        if (!confirm("Are you sure you want to delete this file?")) return;

        try {
            const response = await fetch(`http://localhost:3000/upload/delete/${filename}`, {
                method: "DELETE",
            });

            if (!response.ok) throw new Error("Failed to delete file");

            button.closest(".file-item").remove();
            alert("File deleted successfully!");
        } catch (error) {
            console.error("Error:", error);
            alert("Failed to delete file. Please try again.");
        }
    };

    function openTab(tabId) {
        document.querySelectorAll(".tab-btn").forEach(tab => tab.classList.remove("active"));
        document.querySelectorAll(".tab-pane").forEach(pane => pane.classList.remove("active", "fade-in"));

        document.querySelector(`[onclick="openTab('${tabId}')"]`).classList.add("active");
        document.getElementById(tabId).classList.add("active", "fade-in");
    }

    window.openTab = openTab;
    openTab("profile-tab");

    document.getElementById("credits-form").addEventListener("submit", async function (event) {
        event.preventDefault(); // Prevent default form submission
    
        const creditAmount = parseInt(document.getElementById("credit-amount").value, 10);
    
        if (!username || isNaN(creditAmount) || creditAmount <= 0) {
            alert("Please enter a valid credit amount.");
            return;
        }
    
        try {
            const response = await fetch("http://localhost:3000/credits/request", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ userId: username, requestedCredits: creditAmount }),
            });
    
            const responseText = await response.text();
            console.log("Response Text:", responseText);
    
            if (!response.ok) throw new Error("Failed to submit credit request");
    
            document.getElementById("success-message").style.display = "block";
            document.getElementById("credit-amount").value = ""; // Clear input field
    
            alert("Credit request sent to admin successfully!");
        } catch (error) {
            console.error("Error:", error);
            alert("Failed to send credit request. Please try again.");
        }
    });
    
    
    

    document.getElementById("dashboard-link").addEventListener("click", function () {
        window.location.href = "dashboard.html";
    });

    document.getElementById("logout-btn").addEventListener("click", function () {
        localStorage.removeItem("username");
        window.location.href = "login.html";
    });
});
