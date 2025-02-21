class Dashboard {
    static selectedFiles = []; // Store files in memory until upload

    static async init() {
        console.log("✅ Dashboard.js Loaded");
        await this.loadUserData();
        this.setupUploadArea();
        this.setupLogoutButton();
    }

    static async loadUserData() {
        try {
            const username = localStorage.getItem("username");
            if (!username) {
                console.error("⚠️ No username found in storage.");
                return;
            }

            const response = await fetch(`http://localhost:3000/user/${username}`);
            const data = await response.json();

            console.log("Fetched user from DB:", data);
            let credits = data.credits; 

            const usernameDisplay = document.getElementById("username-display");
            const creditCount = document.getElementById("user-credits");

            if (!usernameDisplay || !creditCount) {
                console.error("⚠️ Missing elements: Ensure 'username-display' and 'user-credits' exist in HTML.");
                return;
            }

            creditCount.innerHTML = `<i class="fa-solid fa-coins"></i> Credits: ${credits}`;
            usernameDisplay.textContent = data.username;

            sessionStorage.setItem("credits", credits);
        } catch (error) {
            console.error("❌ Error loading user data:", error);
        }
    }

    static setupUploadArea() {
        const dropZone = document.getElementById("drop-zone");
        const fileInput = document.getElementById("file-input");
        const uploadBtn = document.getElementById("upload-btn");

        dropZone.addEventListener("click", () => fileInput.click());

        dropZone.addEventListener("dragover", (e) => {
            e.preventDefault();
            dropZone.classList.add("highlight");
        });

        dropZone.addEventListener("dragleave", () => {
            dropZone.classList.remove("highlight");
        });

        dropZone.addEventListener("drop", (e) => {
            e.preventDefault();
            dropZone.classList.remove("highlight");
            const files = Array.from(e.dataTransfer.files);
            this.storeFiles(files);
        });

        fileInput.addEventListener("change", (e) => {
            const files = Array.from(e.target.files);
            this.storeFiles(files);
        });

        uploadBtn.addEventListener("click", async (e) => {
            e.preventDefault(); 
            if (this.selectedFiles.length === 0) {
                alert("⚠️ No files selected!");
                return;
            }
            await this.handleFileUploads();
        });
    }

    static storeFiles(files) {
        if (files.length === 0) return;

        this.selectedFiles = files;
        const uploadStatus = document.getElementById("upload-status");

        uploadStatus.innerHTML = `<div class="alert alert-info">Selected Files: ${files.map(f => f.name).join(", ")}</div>`;
        console.log("📂 Files Stored:", this.selectedFiles);
    }

    static async handleFileUploads() {
        const uploadStatus = document.getElementById("upload-status");
        let credits = parseInt(sessionStorage.getItem("credits")) || 0;
        const username = localStorage.getItem("username");

        if (!username) {
            uploadStatus.innerHTML = `<div class="alert alert-danger">⚠️ User not found. Please log in.</div>`;
            return;
        }

        if (credits <= 0) {
            uploadStatus.innerHTML = `<div class="alert alert-danger">⚠️ Insufficient Credits.</div>`;
            return;
        }

        for (const file of this.selectedFiles) {
            uploadStatus.innerHTML = `<div class="alert">Uploading ${file.name}...</div>`;

            try {
                const formData = new FormData();
                formData.append("document", file);
                formData.append("username", username);

                const response = await fetch("http://localhost:3000/upload", {
                    method: "POST",
                    body: formData,
                });

                const result = await response.json();
                console.log("📤 Upload Response:", result);

                if (result.success) {
                    uploadStatus.innerHTML = `<div class="alert alert-success">✅ Upload Successful!</div>`;
                    
                    credits--;
                    sessionStorage.setItem("credits", credits);
                    
                    console.log("Updated credits:", credits);
                    await new Promise(resolve => setTimeout(resolve, 500)); // Small delay
                    this.loadUserData(); 

                    console.log("Redirecting to:", `aiscan.html?doc=${encodeURIComponent(result.documentPath)}`);
                    setTimeout(() => {
                        window.location.href = `aiscan.html?doc=${encodeURIComponent(result.documentPath)}`;
                    }, 1000);
                } else {
                    uploadStatus.innerHTML = `<div class="alert alert-danger">❌ Upload Failed: ${result.message || "Unknown Error"}</div>`;
                }
            } catch (error) {
                console.error("❌ Upload Error:", error);
                uploadStatus.innerHTML = `<div class="alert alert-danger">❌ Upload Failed. Check console.</div>`;
            }
        }

        // Clear stored files after upload
        this.selectedFiles = [];
    }

    static setupLogoutButton() {
        const logoutBtn = document.getElementById("logout-btn");
        if (!logoutBtn) return;

        logoutBtn.addEventListener("click", () => {
            localStorage.removeItem("username");
            sessionStorage.removeItem("credits");
            window.location.href = "login.html";
        });
    }
}

document.addEventListener("DOMContentLoaded", () => Dashboard.init());
