if (typeof token === "undefined") {
  const token = sessionStorage.getItem("authToken");
  if (token) {
    const userData = parseJwt(token);
    if (userData && userData.role === "admin") {
      document.getElementById("adminDropdown").style.display = "block";
    }
  }
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

  const dropdown = document.querySelector(".dropdown");
  let timeout;

  dropdown.addEventListener("mouseenter", () => {
    clearTimeout(timeout);
    dropdown.querySelector(".dropdown-content").style.display = "block";
  });

  dropdown.addEventListener("mouseleave", () => {
    timeout = setTimeout(() => {
      dropdown.querySelector(".dropdown-content").style.display = "none";
    }, 300);
  });
} else {
  if (token) {
    const userData = parseJwt(token);
    if (userData && userData.role === "admin") {
      document.getElementById("adminDropdown").style.display = "block";
    }
  }
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

  const dropdown = document.querySelector(".dropdown");
  let timeout;

  dropdown.addEventListener("mouseenter", () => {
    clearTimeout(timeout);
    dropdown.querySelector(".dropdown-content").style.display = "block";
  });

  dropdown.addEventListener("mouseleave", () => {
    timeout = setTimeout(() => {
      dropdown.querySelector(".dropdown-content").style.display = "none";
    }, 300);
  });
}
