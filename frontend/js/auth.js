const registerForm = document.getElementById("registerForm");

registerForm.addEventListener("submit", async function(event) {

    event.preventDefault();

    const name = document.getElementById("name").value;
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
    const confirmPassword = document.getElementById("confirmPassword").value;

    if (password !== confirmPassword) {
        alert("Passwords do not match.");
        return;
    }

    const userData = {
        name: name,
        email: email,
        password: password
    };

    console.log("Sending data to backend:", userData);

    const response = await fetch("http://localhost:8080/api/auth/register", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(userData)
    });

   const data = await response.json();

console.log("Backend response:", data);

const message = document.getElementById("message");

message.textContent = "Registration successful! You can now log in.";
message.style.color = "green";
message.style.marginTop = "15px";
});