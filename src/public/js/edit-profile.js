const token = sessionStorage.getItem("authToken");

document
  .getElementById("profilePicture")
  .addEventListener("change", function (e) {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();

      reader.onload = function (event) {
        document.getElementById("profilePic").src = event.target.result;
      };

      reader.readAsDataURL(file);
    }
  });

document.getElementById("uploadForm").addEventListener("submit", function (e) {
  e.preventDefault();

  const formData = new FormData(this);
  fetch("/api/upload-profile-picture", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  })
    .then((response) => response.json())
    .then((data) => {
      if (data.profilePicture) {
        document.getElementById("profilePic").src = data.profilePicture;
      }
    })
    .catch((error) => console.error("Error:", error));
});
document
  .getElementById("changeNameForm")
  .addEventListener("submit", function (e) {
    e.preventDefault();
    const token = sessionStorage.getItem("authToken");
    const name = document.getElementById("name").value;

    if (!name) {
      alert("Please enter a new name.");
      return;
    }

    fetch("/api/update-name", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ name }),
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.success) {
          alert("Name updated successfully!");
        } else {
          alert("Error updating name: " + data.message);
        }
      })
      .catch((error) => console.error("Error:", error));
  });

document
  .getElementById("changePasswordForm")
  .addEventListener("submit", function (e) {
    e.preventDefault();
    const token = sessionStorage.getItem("authToken");
    const password = document.getElementById("password").value;
    const confirmPassword = document.getElementById("confirmPassword").value;

    if (!password) {
      alert("Please enter a new password.");
      return;
    }

    if (password !== confirmPassword) {
      alert("Passwords do not match!");
      return;
    }

    fetch("/api/update-password", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ password }),
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.success) {
          alert("Password updated successfully!");
        } else {
          alert("Error updating password: " + data.message);
        }
      })
      .catch((error) => console.error("Error:", error));
  });
document.querySelector(".back").addEventListener("click", () => {
  window.location.href = "/profile";
});
