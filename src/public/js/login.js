const loginForm = document.getElementById("loginForm");
const registerForm = document.getElementById("registerForm");
const toggleButton = document.getElementById("toggleButton");
const formHeader = document.getElementById("form-header");

toggleButton.addEventListener("click", () => {
  if (loginForm.style.display === "none") {
    loginForm.style.display = "block";
    registerForm.style.display = "none";
    formHeader.textContent = "Login";
    toggleButton.textContent = "Don't have an account? Register here";
  } else {
    loginForm.style.display = "none";
    registerForm.style.display = "block";
    formHeader.textContent = "Register";
    toggleButton.textContent = "Already have an account? Login here";
  }
});

document
  .getElementById("registerForm")
  .addEventListener("submit", async (e) => {
    e.preventDefault();
    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;
    const role = document.getElementById("role").value;

    const response = await fetch("/api/send-register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password, role }),
    });

    const result = await response.json();
    alert(result.message);
  });

document.getElementById("loginForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  const username = document.getElementById("loginUsername").value;
  const password = document.getElementById("loginPassword").value;

  const response = await fetch("/api/send-login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
  });

  const result = await response.json();
  if (result.token) {
    sessionStorage.setItem("authToken", result.token);
    window.location.href = "/";
  } else {
    alert(result.message);
  }
});
