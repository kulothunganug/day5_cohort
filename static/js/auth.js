// Auth Logic
document.addEventListener("DOMContentLoaded", () => {
  const loginForm = document.getElementById("login-form");
  const registerForm = document.getElementById("register-form");

  if (loginForm) {
    loginForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const payload = {
        email: document.getElementById("username").value,
        password: document.getElementById("password").value,
      };

      try {
        const data = await apiRequest("/auth/login", "POST", payload);
        localStorage.setItem("token", data.access_token);
        showToast("Login successful!");

        // Redirect based on role
        const user = await apiRequest("/auth/me");
        redirectUser(user.role);
      } catch (error) {
        // Error handled by apiRequest toast
      }
    });
  }

  if (registerForm) {
    registerForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const payload = {
        name: document.getElementById("name").value,
        email: document.getElementById("email").value,
        password: document.getElementById("password").value,
        role: document.getElementById("role").value,
      };

      try {
        await apiRequest("/auth/register", "POST", payload);
        showToast("Registration successful! Please login.");
        setTimeout(() => {
          window.location.href = "login.html";
        }, 2000);
      } catch (error) {
        // Error handled by apiRequest toast
      }
    });
  }
});

function redirectUser(role) {
  if (role === "instructor") {
    window.location.href = "instructor.html";
  } else {
    window.location.href = "student.html";
  }
}

function logout() {
  localStorage.removeItem("token");
  window.location.href = "login.html";
}
