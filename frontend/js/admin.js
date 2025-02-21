document.addEventListener("DOMContentLoaded", async () => {
    const creditTableBody = document.querySelector("#credit-requests tbody");
    const tabButtons = document.querySelectorAll(".tab-button");
    const tabContents = document.querySelectorAll(".tab-content");
    const darkModeToggle = document.getElementById("dark-mode-toggle");


    // Function to fetch pending credit requests
    const fetchCreditRequests = async () => {
        try {
            const response = await fetch("http://localhost:3000/credits/pending");
            const data = await response.json();

            if (response.ok) {
                creditTableBody.innerHTML = "";
                data.forEach(request => {
                    const row = document.createElement("tr");
                    row.innerHTML = `
                        <td>${request.username}</td>
                        <td>${request.requested_credits}</td>
                        <td>
                            <button class="approve-btn" data-id="${request.id}">Approve</button>
                            <button class="deny-btn" data-id="${request.id}">Deny</button>
                        </td>
                    `;
                    creditTableBody.appendChild(row);
                });
            }
        } catch (error) {
            console.error("Error fetching credit requests:", error);
        }
    };

    // Function to handle approval or denial of credit requests
    const handleCreditAction = async (requestId, action) => {
        try {
            const response = await fetch("http://localhost:3000/credits/manage", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ requestId, action }),
            });

            const result = await response.json();
            if (response.ok) {
                alert(result.message);
                fetchCreditRequests(); // Refresh table after action
            } else {
                console.error("Error processing request:", result.message);
            }
        } catch (error) {
            console.error("❌ Error processing request:", error);
        }
    };

    // Event delegation for Approve/Deny buttons
    creditTableBody.addEventListener("click", (event) => {
        if (event.target.classList.contains("approve-btn")) {
            const requestId = event.target.getAttribute("data-id");
            handleCreditAction(requestId, "approve");
        } else if (event.target.classList.contains("deny-btn")) {
            const requestId = event.target.getAttribute("data-id");
            handleCreditAction(requestId, "deny");
        }
    });
    const fetchScansPerUser = async () => {
        try {
            const response = await fetch("http://localhost:3000/credits/scans-per-user");
            const data = await response.json();
            if (response.ok) {
                let html = "";
                data.forEach(item => {
                    html += `<tr><td>${item.user_id}</td><td>${item.scan_count}</td><td>${item.scan_date}</td></tr>`;
                });
                document.querySelector("#scans-table tbody").innerHTML = html;
            }
        } catch (error) {
            console.error("Error fetching scans per user:", error);
        }
    };

    // Fetch and display common scanned topics
    const fetchCommonTopics = async () => {
        try {
            const response = await fetch("http://localhost:3000/credits/common-topics");
            const data = await response.json();
            if (response.ok) {
                let html = "";
                data.forEach(item => {
                    html += `<li>${item.topic} (${item.count} scans)</li>`;
                });
                document.querySelector("#common-topics").innerHTML = html;
            }
        } catch (error) {
            console.error("Error fetching common topics:", error);
        }
    };

    // Fetch and display top users
    const fetchTopUsers = async () => {
        try {
            const response = await fetch("http://localhost:3000/credits/top-users");
            const data = await response.json();
            if (response.ok) {
                let html = "";
                data.forEach(user => {
                    html += `<tr><td>${user.username}</td><td>${user.total_scans}</td><td>${user.credits}</td></tr>`;
                });
                document.querySelector("#top-users-table tbody").innerHTML = html;
            }
        } catch (error) {
            console.error("Error fetching top users:", error);
        }
    };

    // Fetch and display credit usage statistics
    const fetchCreditUsage = async () => {
        try {
            const response = await fetch("http://localhost:3000/credits/credit-usage");
            const data = await response.json();
            if (response.ok) {
                document.querySelector("#credit-stats").innerHTML = `
                    <p><strong>Total Requested:</strong> ${data.total_requested} credits</p>
                    <p><strong>Total Approved:</strong> ${data.total_approved} credits</p>
                `;
            }
        } catch (error) {
            console.error("Error fetching credit usage:", error);
        }
    };
    // Handle approval or denial of credit requests
    creditTableBody.addEventListener("click", async (event) => {
        if (event.target.classList.contains("approve-btn") || event.target.classList.contains("deny-btn")) {
            const requestId = event.target.getAttribute("data-id");
            const action = event.target.classList.contains("approve-btn") ? "approve" : "deny";

            try {
                const response = await fetch("http://localhost:3000/credits/manage", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ requestId, action }),
                });

                const result = await response.json();
                if (response.ok) {
                    alert(result.message);
                    fetchCreditRequests();
                } else {
                    console.error("Error processing request:", result.message);
                }
            } catch (error) {
                console.error("Error processing request:", error);
            }
        }
    });

    // Handle tab switching
    tabButtons.forEach(button => {
        button.addEventListener("click", () => {
            tabButtons.forEach(btn => btn.classList.remove("active"));
            tabContents.forEach(content => content.classList.remove("active"));

            button.classList.add("active");
            document.getElementById(button.getAttribute("data-tab")).classList.add("active");
        });
    });

    // Dark mode toggle
    darkModeToggle.addEventListener("click", () => {
        document.body.classList.toggle("dark-mode");
    });

    // Load all analytics data
    fetchScansPerUser();
    fetchCommonTopics();
    fetchTopUsers();
    fetchCreditUsage();
    fetchCreditRequests(); // Fetch pending requests when the page loads
});
