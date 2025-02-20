class Dashboard {
    static async init() {
        console.log("✅ Dashboard.js Loaded");
        await this.loadUserData();
        this.setupUploadArea();
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
    
            console.log("Fetched user from DB:", data); // Debugging
            let credits = data.credits; 
            
            // 🔹 Ensure elements exist before modifying them
            const usernameDisplay = document.getElementById("username-display");
            const creditCount = document.getElementById("user-credits");

            if (!usernameDisplay || !creditCount) {
                console.error("⚠️ Missing elements: Ensure 'username-display' and 'user-credits' exist in HTML.");
                return;
            }

            // ✅ Correctly update credits while preserving the icon
            creditCount.innerHTML = `<i class="fa-solid fa-coins"></i> Credits: ${credits}`;

            // ✅ Update username
            usernameDisplay.textContent = data.username;

            // ✅ Store credits for session-based access
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

        dropZone.addEventListener("drop", async (e) => {
            e.preventDefault();
            dropZone.classList.remove("highlight");
            const files = Array.from(e.dataTransfer.files);
            await this.handleFileUploads(files);
        });

        fileInput.addEventListener("change", async (e) => {
            const files = Array.from(e.target.files);
            await this.handleFileUploads(files);
        });

        uploadBtn.addEventListener("click", async () => {
            const files = fileInput.files ? Array.from(fileInput.files) : [];
            await this.handleFileUploads(files);
        });
    }

    static async handleFileUploads(files) {
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

        for (const file of files) {
            uploadStatus.innerHTML = `<div class="alert">Uploading ${file.name}...</div>`;

            try {
                const formData = new FormData();
                formData.append("document", file);
                formData.append("username", username); // 🔹 Ensure username is sent

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
                    this.loadUserData(); // 🔹 Reload user data after successful upload
                } else {
                    uploadStatus.innerHTML = `<div class="alert alert-danger">❌ Upload Failed: ${result.message || "Unknown Error"}</div>`;
                }
            } catch (error) {
                console.error("❌ Upload Error:", error);
                uploadStatus.innerHTML = `<div class="alert alert-danger">❌ Upload Failed. Check console.</div>`;
            }
        }
    }
}

document.addEventListener("DOMContentLoaded", () => Dashboard.init());
