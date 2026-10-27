
const registerForm = document.getElementById("registerForm");

registerForm.addEventListener("submit", async function (event) {
    event.preventDefault();

    const name = document.getElementById("name").value.trim();
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;
    const confirmPassword = document.getElementById("confirmPassword").value;
    const message = document.getElementById("message");

    // Check whether passwords match
    if (password !== confirmPassword) {
        message.textContent = "Passwords do not match.";
        message.style.color = "red";
        return;
    }

    const userData = {
        name: name,
        email: email,
        password: password
    };

    try {
        const response = await fetch("http://localhost:8080/api/auth/register", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(userData)
        });

        const data = await response.json();

        if (response.ok) {
            message.textContent =
                "Registration successful! You can now log in.";
            message.style.color = "green";
            message.style.marginTop = "15px";

            registerForm.reset();
        } else {
            message.textContent =
                data.message ||
                data.error ||
                "Registration failed. Please try again.";
            message.style.color = "red";
            message.style.marginTop = "15px";
        }
    } catch (error) {
        console.error("Registration error:", error);

        message.textContent = "Could not connect to the server.";
        message.style.color = "red";
        message.style.marginTop = "15px";
    }
});
