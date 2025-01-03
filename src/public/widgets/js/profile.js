if (!token) {
  const token = sessionStorage.getItem("authToken");
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
        document.getElementById("user_name").innerHTML = data.message.username;
        document.getElementById("profile_picture").src =
          data.message.profile_picture;

        const url = window.location.href;
        const params = new URLSearchParams(new URL(url).search);
        getColors(
          parseInt(params.get("mostUsedColorsRange"), 10) || 4,
          parseInt(params.get("mostUsedColorsStart"), 10) || 0,
          parseInt(params.get("leastUsedColorsStart"), 10) || 1
        );
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

function colorDistance(rgb1, rgb2) {
  const [r1, g1, b1] = rgb1.split(",").map(Number);
  const [r2, g2, b2] = rgb2.split(",").map(Number);

  return Math.sqrt(
    Math.pow(r2 - r1, 2) + Math.pow(g2 - g1, 2) + Math.pow(b2 - b1, 2)
  );
}

function extractGoodColors(image, numColors) {
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");

  canvas.width = image.width;
  canvas.height = image.height;

  ctx.drawImage(image, 0, 0, image.width, image.height);

  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const pixels = imageData.data;

  const colorMap = new Map();

  for (let i = 0; i < pixels.length; i += 4) {
    const r = pixels[i];
    const g = pixels[i + 1];
    const b = pixels[i + 2];

    const brightness = 0.2126 * r + 0.7152 * g + 0.0722 * b;

    if (brightness > 128) {
      const rgb = `${r},${g},${b}`;
      colorMap.set(rgb, (colorMap.get(rgb) || 0) + 1);
    }
  }

  const sortedColors = Array.from(colorMap.entries())
    .sort((a, b) => b[1] - a[1])
    .map((entry) => entry[0]);

  const distinctColors = [];

  for (let i = 0; i < sortedColors.length; i++) {
    const currentColor = sortedColors[i];

    if (
      !distinctColors.some(
        (existingColor) => colorDistance(existingColor, currentColor) < 50
      )
    ) {
      distinctColors.push(currentColor);
    }

    if (distinctColors.length >= numColors) {
      break;
    }
  }

  return distinctColors;
}

function extractLeastUsedColors(image, numColors) {
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");

  canvas.width = image.width;
  canvas.height = image.height;

  ctx.drawImage(image, 0, 0, image.width, image.height);

  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const pixels = imageData.data;

  const colorMap = new Map();

  for (let i = 0; i < pixels.length; i += 4) {
    const r = pixels[i];
    const g = pixels[i + 1];
    const b = pixels[i + 2];

    const brightness = 0.2126 * r + 0.7152 * g + 0.0722 * b;

    if (brightness > 128) {
      const rgb = `${r},${g},${b}`;
      colorMap.set(rgb, (colorMap.get(rgb) || 0) + 1);
    }
  }

  const sortedColors = Array.from(colorMap.entries())
    .sort((a, b) => a[1] - b[1])
    .map((entry) => entry[0]);

  const distinctColors = [];

  for (let i = 0; i < sortedColors.length; i++) {
    const currentColor = sortedColors[i];

    if (
      !distinctColors.some(
        (existingColor) => colorDistance(existingColor, currentColor) < 50
      )
    ) {
      distinctColors.push(currentColor);
    }

    if (distinctColors.length >= numColors) {
      break;
    }
  }

  return distinctColors;
}

function applyGradientToText(colors) {
  const gradient =
    colors.length > 1
      ? `linear-gradient(45deg, ${colors
          .map((color) => `rgb(${color})`)
          .join(", ")})`
      : `linear-gradient(45deg, rgb(${colors[0]}), rgb(${colors[0]}))`;
  const userNameElement = document.getElementById("user_name");
  userNameElement.style.background = gradient;
  userNameElement.style.backgroundClip = "text";
  userNameElement.style.webkitBackgroundClip = "text";
  userNameElement.style.color = "transparent";
  userNameElement.style.animation = "gradientAnimation 3s ease infinite;";
}

function displayColors(colors) {
  const card = document.getElementById("widget_14");
  card.style.setProperty("--widget-bg-color", `rgb(${colors[0]})`);
}

function getColors(
  mostUsedColorsRange,
  mostUsedColorsStart,
  leastUsedColorStart
) {
  const profileImage = document.getElementById("profile_picture");
  profileImage.onload = function () {
    const mostUsedColors = extractGoodColors(
      profileImage,
      mostUsedColorsRange + mostUsedColorsStart
    );
    const leastUsedColors = extractLeastUsedColors(
      profileImage,
      leastUsedColorStart + 1
    );
    const mostUsedColorsSlice = mostUsedColors.slice(
      mostUsedColorsStart,
      mostUsedColorsStart + mostUsedColorsRange
    );
    displayColors(
      leastUsedColors.slice(leastUsedColorStart, leastUsedColorStart + 1)
    );
    applyGradientToText(mostUsedColorsSlice);
    watchForElement();
  };
}

function rgbToHex(rgb) {
  const [r, g, b] = rgb.split(",").map(Number);

  const toHex = (value) => value.toString(16).padStart(2, "0");

  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

function applyStylesAfterWidgetLoad() {
  const userNameElement = document.getElementById("user_name");
  if (userNameElement) {
    userNameElement.style.animation = "gradientAnimation 3s ease infinite";
  }
}

function watchForElement() {
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      mutation.addedNodes.forEach((node) => {
        if (node.id === "user_name") {
          applyStylesAfterWidgetLoad();
        }
      });
    });
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true,
  });
}

getProfile();
