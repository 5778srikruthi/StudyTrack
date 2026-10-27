
const loginForm = document.getElementById("loginForm");

loginForm.addEventListener("submit", async function (event) {
    event.preventDefault();

    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;
    const message = document.getElementById("message");

    try {
        const response = await fetch("http://localhost:8080/api/auth/login", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                email: email,
                password: password
            })
        });

        const data = await response.json();

        message.textContent = data.message;

        if (response.ok) {
            sessionStorage.setItem("userId", data.userId);
            sessionStorage.setItem("userName", data.name);

            message.style.color = "green";
            window.location.href = "dashboard.html";
        } else {
            message.style.color = "red";
        }
    } catch (error) {
        console.error("Login error:", error);
        message.textContent = "Could not connect to the server.";
        message.style.color = "red";
    }
});
