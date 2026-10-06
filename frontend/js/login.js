
const loginForm = document.getElementById("loginForm");

loginForm.addEventListener("submit", async function(event) {

    event.preventDefault();

    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

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
        const data = await response.text();

    console.log("Backend response:", data);
        const message = document.getElementById("message");

    message.textContent = data;

    if (data === "Login successful!") {
    message.style.color = "green";
    window.location.href = "dashboard.html";
} else {
    message.style.color = "red";
}

});
