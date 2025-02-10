const token = sessionStorage.getItem("authToken");

function parseJwt(token) {
  try {
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map(function (c) {
          return "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2);
        })
        .join("")
    );

    return JSON.parse(jsonPayload);
  } catch (e) {
    return null;
  }
}

if (token) {
  const userData = parseJwt(token);
  if (userData && userData.role === "admin") {
    document.getElementById("adminDropdown").style.display = "block";
  }
}

document.querySelector(".logout").addEventListener("click", () => {
  sessionStorage.removeItem("authToken");
  window.location.href = "/login";
});

document.querySelector("button").addEventListener("click", () => {
  window.location.href = "/edit-profile";
});
function getProfile() {
  const token = sessionStorage.getItem("authToken");
  if (!token) {
    alert("You need to be logged in!");
    document.location.href = "/login";
    return;
  }
  fetch("/api/profile", {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  })
    .then((response) => response.json())
    .then((data) => {
      if (data.message) {
        document.getElementById("name").innerHTML = data.message.username;
        document.getElementById("role").innerHTML = capitalizeFirstLetter(
          data.message.role
        );
        document.getElementById("profile_picture").src =
          data.message.profile_picture;
      } else {
        console.error("No profile data found");
      }
    })
    .catch((error) => console.error("Error:", error));
}

function capitalizeFirstLetter(str) {
  if (str.length === 0) return str;
  return str.charAt(0).toUpperCase() + str.slice(1);
}
window.onload = getProfile;
