// ✅ Function to Display Alerts
function showAlert(message, type) {
    let alertContainer = document.getElementById("alert-container");

    // Create alert container if it doesn't exist
    if (!alertContainer) {
        alertContainer = document.createElement("div");
        alertContainer.id = "alert-container";
        document.body.prepend(alertContainer); // Adds it at the top of the page
    }

    // Create alert message box
    alertContainer.innerHTML = `
        <div class="alert alert-${type}" role="alert">
            <strong>${type === "success" ? "✅ Success:" : "⚠️ Warning:"}</strong> ${message}
        </div>
    `;
}



// ✅ Function to Check Duplicate Document
async function checkDuplicateDocument(text) {
    try {
        console.log("📨 Sending text for plagiarism check...");

        const response = await fetch("http://localhost:3000/api/match", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ text })
        });

        console.log("📩 Response received from API:", response.status);

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();
        console.log("📝 API Response Data:", data);

        return {
            aiMatches: Array.isArray(data.aiMatches)
                ? data.aiMatches
                : data.aiMatches.split("\n").map(match => match.trim()), // Convert string into array
            plagiarismResults: data.plagiarismResults || [],
            similarDocuments: data.similarDocuments || []
        };
    } catch (error) {
        console.error("❌ Error checking document:", error);
        return {
            aiMatches: [],
            plagiarismResults: [],
            similarDocuments: [],
            message: "Error occurred while checking plagiarism."
        };
    }
}

// ✅ Event Listener for PDF Processing
document.addEventListener("DOMContentLoaded", async function () {
    // ✅ User Authentication
    const username = localStorage.getItem("username");
    const userNameElement = document.getElementById("username-display");
    const response = await fetch(`http://localhost:3000/user/${username}`);
            if (!response.ok) {
                throw new Error("Failed to fetch user data.");
            }
            const data = await response.json();
            console.log("Fetched user from DB:", data);
    document.getElementById("username-display").textContent = data.username;
    document.getElementById("user-credits").innerHTML = `<i class="fa-solid fa-coins"></i> Credits: ${data.credits}`;

    if (!username) {
        window.location.href = "login.html";
    } else {
        userNameElement.textContent = username;
    }

    console.log("username");
    console.log("🌍 Document loaded. Extracting URL parameters...");
    const params = new URLSearchParams(window.location.search);
    let filePath = params.get("doc");

    if (!filePath) {
        console.error("⚠️ No file path found in URL params.");
        return;
    }

    if (filePath.startsWith("/uploads/")) {
        filePath = `http://localhost:3000${filePath}`;
    }

    console.log("📥 Loading PDF from:", filePath);
    const loadingTask = pdfjsLib.getDocument(filePath);

    loadingTask.promise.then(async function (pdf) {
        let extractedText = "";
        let textSpans = [];
        console.log(`📄 PDF Loaded: ${pdf.numPages} pages detected.`);

        // ✅ Render First Page as Image
        const firstPage = await pdf.getPage(1);
        const scale = 1.5;
        const viewport = firstPage.getViewport({ scale });
        const canvas = document.createElement("canvas");
        const context = canvas.getContext("2d");
        canvas.width = viewport.width;
        canvas.height = viewport.height;

        await firstPage.render({ canvasContext: context, viewport }).promise;
        document.getElementById("pdf-preview").src = canvas.toDataURL("image/png");

        // ✅ Extract Text from All Pages
        const scanResultsElement = document.getElementById("scan-results");
        scanResultsElement.innerHTML = "<h3>Extracted Text:</h3>";

        for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
            const page = await pdf.getPage(pageNum);
            const textContent = await page.getTextContent();

            textContent.items.forEach((item) => {
                const span = document.createElement("span");
                span.innerText = item.str + " ";
                span.classList.add("highlightable-text");
                scanResultsElement.appendChild(span);
                textSpans.push({ text: item.str.trim(), element: span });
            });

            extractedText += textContent.items.map((item) => item.str).join(" ") + "\n\n";
        }
        // ✅ Check for AI match & plagiarism results
        const plagiarismData = await checkDuplicateDocument(extractedText);
        console.log("🔎 Plagiarism Check Results:", plagiarismData);

        if (plagiarismData.aiMatches.length > 0 || plagiarismData.plagiarismResults.length > 0) {
            showAlert("File already exists!", "danger"); // 🚨 Alert for existing document

            if (plagiarismData.similarDocuments.length > 0) {
                let documentList = "<br><br><strong>Similar Documents:</strong><ul>";
                plagiarismData.similarDocuments.forEach(doc => {
                    documentList += `<li><a href="${doc.url}" target="_blank">${doc.name}</a></li>`;
                });
                documentList += "</ul>";
                scanResultsElement.innerHTML += documentList;
            }
        } else {
            scanResultsElement.innerHTML += "<br><br><strong>No significant matches found.</strong>";

            showAlert("New PDF uploaded successfully!", "success"); // ✅ Alert for new upload
        }

        highlightMatches(plagiarismData, textSpans);
    }).catch(error => {
        console.error("❌ Error loading PDF: ", error);
        document.getElementById("scan-results").innerText = "Failed to extract text from the document.";
    });
});

// ✅ Function to Highlight Matching Text
function highlightMatches(plagiarismData) {
    console.log("🎨 Highlighting matched text...");
    const scanResultsElement = document.getElementById("scan-results");
    
    if (!plagiarismData || !Array.isArray(plagiarismData.aiMatches)) {
        console.error("❌ No AI matches found.");
        scanResultsElement.innerHTML += "<br><strong>No AI matches found.</strong>";
        return;
    }

    let resultsHTML = `<br><strong>🔍 AI Match Results:</strong><ul style="list-style:none; padding:0;">`;

    plagiarismData.aiMatches.forEach(match => {
        if (match.filename && typeof match.similarity === "number") {
            let color = "green"; // Default Green for similarity < 20
            if (match.similarity > 80) {
                color = "red"; // Red for > 80
            } else if (match.similarity > 50) {
                color = "orange"; // Yellow/Orange for > 50
            }

            resultsHTML += `
                <span style="color: ${color}; font-weight: bold;">
                    📄 ${match.filename} - ${match.similarity}%
                </span>
            `;
        }
    });

    resultsHTML += "</ul>";
    scanResultsElement.innerHTML += resultsHTML;
}
