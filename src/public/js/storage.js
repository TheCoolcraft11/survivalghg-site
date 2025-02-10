const token = sessionStorage.getItem("authToken");

const dropZone = document.getElementById("dropZone");

dropZone.addEventListener("dragover", (event) => {
  event.preventDefault();
  dropZone.classList.add("dragover");
});

dropZone.addEventListener("dragleave", () => {
  dropZone.classList.remove("dragover");
});

dropZone.addEventListener("drop", async (event) => {
  event.preventDefault();
  dropZone.classList.remove("dragover");

  const files = event.dataTransfer.files;
  if (files.length === 0) {
    alert("Please select at least one file.");
    return;
  }

  await uploadFiles(files);
});

async function uploadFiles(files) {
  const formData = new FormData();
  Array.from(files).forEach((file) => {
    formData.append("files", file, file.name);
  });

  try {
    const response = await fetch(`${apiBaseUrl}/upload`, {
      method: "POST",
      body: formData,
      headers: {
        Authorization: `Bearer ${sessionStorage.getItem("authToken")}`,
      },
    });

    const result = await response.json();
    if (response.ok) {
      alert("Files uploaded successfully!");
      fetchFiles();
    } else {
      alert(result.message || "Error uploading files.");
    }
  } catch (error) {
    console.error("Upload error:", error);
    alert("Error uploading files.");
  }
}

let allFiles = [];
let displayedFiles = [];

async function fetchFiles() {
  try {
    const authToken = sessionStorage.getItem("authToken");
    if (!authToken) {
      alert("No authentication token found.");
      window.location.href = "/login";
      return;
    }

    const response = await fetch(`${apiBaseUrl}/files`, {
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    });

    if (response.status === 401) {
      alert("Session expired. Please log in again.");
      window.location.href = "/login";
      return;
    }

    if (!response.ok) {
      console.error(
        "API request failed:",
        response.status,
        response.statusText
      );
      alert("Error fetching files: " + response.statusText);
      return;
    }

    const result = await response.json();

    if (result.files && Array.isArray(result.files)) {
      allFiles = result.files;
      displayedFiles = [...allFiles];
      renderFiles(displayedFiles);
    } else {
      alert("No files found or the response format is incorrect.");
      console.error("Invalid API response structure:", result);
    }
  } catch (error) {
    console.error("Fetch files error:", error);
    alert("Error fetching files.");
  }
}

function searchFiles() {
  const query = document.getElementById("searchInput").value.toLowerCase();
  if (query === "") {
    displayedFiles = [...allFiles];
  } else {
    displayedFiles = allFiles.filter((file) =>
      file.toLowerCase().includes(query)
    );
  }
  renderFiles(displayedFiles);
}

function sortFiles() {
  const sortValue = document.getElementById("sortSelect").value;

  if (sortValue === "dateAsc") {
    displayedFiles.sort();
  } else if (sortValue === "dateDesc") {
    displayedFiles.sort().reverse();
  }
  renderFiles(displayedFiles);
}

function renderFiles(files) {
  const filesList = document.getElementById("filesList");
  filesList.innerHTML = "";

  if (files.length === 0) {
    filesList.innerHTML = "<li>No files found.</li>";
  }

  files.forEach((file, index) => {
    const listItem = document.createElement("li");
    const iconClass = getFileIcon(file);
    const cleanFileName = file.replace(/^\d+-/, "");

    listItem.classList.add("file-item");
    listItem.innerHTML = `
         <input type="checkbox" class="file-checkbox" data-index="${index}">
         <div><i class="${iconClass}"></i> ${cleanFileName}</div>
         <div class="actions">
             <button class="download-btn" onclick="downloadFile('${file}')">Download</button>
             <button class="delete-btn" onclick="deleteFile('${file}')">Delete</button>
             <button class="share-btn" onclick="shareFile('${file}')">Share</button>
         </div>
     `;

    listItem
      .querySelector("div")
      .addEventListener("click", () => displayPreview(file));

    filesList.appendChild(listItem);
  });
}

function getFileIcon(file) {
  const fileExtension = file.split(".").pop().toLowerCase();
  switch (fileExtension) {
    case "zip":
      return "fas fa-file-archive";
    case "js":
      return "fas fa-file-code";
    case "txt":
      return "fas fa-file-alt";
    case "html":
      return "fas fa-file-code";
    case "pdf":
      return "fas fa-file-pdf";
    case "jpg":
    case "jpeg":
    case "png":
      return "fas fa-image";
    default:
      return "fas fa-file";
  }
}

function applyBulkAction() {
  const selectedFiles = getSelectedFiles();
  const action = document.getElementById("bulkActionSelect").value;

  if (selectedFiles.length === 0) {
    alert("Please select at least one file.");
    return;
  }

  if (action === "delete") {
    selectedFiles.forEach((file) => deleteFile(file));
  } else if (action === "download") {
    selectedFiles.forEach((file) => downloadFile(file));
  } else if (action === "share") {
    selectedFiles.forEach((file) => shareFile(file));
  }

  document.getElementById("bulkActionSelect").value = "";
  document.getElementById("selectAll").checked = false;
}

function getSelectedFiles() {
  const checkboxes = document.querySelectorAll(".file-checkbox:checked");
  const selectedFiles = [];
  checkboxes.forEach((checkbox) => {
    const index = checkbox.getAttribute("data-index");
    selectedFiles.push(displayedFiles[index]);
  });
  return selectedFiles;
}

function toggleSelectAll() {
  const isChecked = document.getElementById("selectAll").checked;
  document.querySelectorAll(".file-checkbox").forEach((checkbox) => {
    checkbox.checked = isChecked;
  });
}

const apiBaseUrl = "/api/storage";

document
  .getElementById("uploadFiles")
  .addEventListener("click", async (event) => {
    event.preventDefault();
    const fileInput = document.getElementById("fileInput");
    console.log("🚀 ~ document.getElementById ~ fileInput:", fileInput);
    const files = fileInput.files;
    console.log("🚀 ~ document.getElementById ~ files:", files);
    if (files.length === 0) {
      alert("Please select at least one file to upload.");
      return;
    }

    const formData = new FormData();
    Array.from(files).forEach((file) => {
      formData.append(
        "files",
        file,
        file.name
          .replace("ü", "ue")
          .replace("ä", "ae")
          .replace("ö", "oe")
          .replace("ß", "ss")
      );
    });

    try {
      const response = await fetch(`${apiBaseUrl}/upload`, {
        method: "POST",
        body: formData,
        headers: {
          Authorization: `Bearer ${sessionStorage.getItem("authToken")}`,
        },
      });

      const result = await response.json();
      if (response.ok) {
        alert("Files uploaded successfully!");
        fileInput.value = "";
        fetchFiles();
        fetchStorageUsage();
      } else {
        alert(result.message || "Error uploading files.");
      }
    } catch (error) {
      console.error("Upload error:", error);
      alert("Error uploading files.");
    }
  });

function displayPreview(file) {
  const authToken = sessionStorage.getItem("authToken");
  const previewContent = document.getElementById("previewContent");
  const previewSection = document.getElementById("previewSection");

  previewContent.innerHTML = "";

  const fileExtension = file.split(".").pop().toLowerCase();
  const fileUrl = `${apiBaseUrl}/download/${file}?token=${authToken}`;

  switch (fileExtension) {
    case "jpg":
    case "jpeg":
    case "png":
    case "gif":
    case "webp":
      previewContent.innerHTML = `<img src="${fileUrl}" alt="${file}" style="max-width: 100%; max-height: 400px;">`;
      break;
    case "mp3":
    case "wav":
    case "ogg":
    case "m4a":
    case "opus":
      previewContent.innerHTML = `<audio controls><source src="${fileUrl}" type="audio/${
        fileExtension === "m4a" || fileExtension === "opus"
          ? "mp4"
          : fileExtension
      };
">Your browser does not support the audio element.</audio>`;
      break;
    case "mp4":
    case "webm":
      previewContent.innerHTML = `<video  controls style="max-width: 100%;"><source src="${fileUrl}" type="video/${fileExtension}">Your browser does not support the video element.</video>`;
      break;
    default:
      previewContent.innerHTML = `<p>No preview available for this file type.</p>`;
      break;
  }

  previewSection.style.display = "block";
}

function closePreview() {
  document.getElementById("previewSection").style.display = "none";
}

async function downloadFile(filename) {
  try {
    const response = await fetch(`${apiBaseUrl}/download/${filename}`, {
      headers: {
        Authorization: `Bearer ${sessionStorage.getItem("authToken")}`,
      },
    });

    if (response.ok) {
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      a.click();
      URL.revokeObjectURL(url);
    } else {
      alert("Error downloading file.");
    }
  } catch (error) {
    console.error("Download error:", error);
    alert("Error downloading file.");
  }
}

async function deleteFile(filename) {
  try {
    const response = await fetch(`${apiBaseUrl}/delete/${filename}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${sessionStorage.getItem("authToken")}`,
      },
    });

    if (response.ok) {
      alert("File deleted successfully!");
      fetchFiles();
    } else {
      alert("Error deleting file.");
    }
  } catch (error) {
    console.error("Delete error:", error);
    alert("Error deleting file.");
  }
  fetchFiles();
  fetchStorageUsage();
}

function openModal(shareUrl, expiresAt, shareButton) {
  const modal = document.getElementById("shareModal");
  const shareLink = document.getElementById("shareLink");
  const copyButton = document.getElementById("copyButton");
  const closeButton = document.getElementById("closeButton");

  closeButton.onclick = function () {
    closeModal(shareButton);
  };

  const expirationDate = new Date(parseInt(expiresAt));
  const formattedExpiration = expirationDate.toLocaleString();

  shareLink.innerText = `${shareUrl} (Expires on: ${formattedExpiration})`;
  shareLink.style.wordWrap = "break-word";

  copyButton.onclick = () => {
    navigator.clipboard.writeText(shareUrl).then(() => {
      alert("Link copied to clipboard!");
    });
  };

  modal.style.display = "block";
}

function closeModal(shareButton) {
  document.getElementById("shareModal").style.display = "none";
  shareButton.disabled = false;
}

document
  .getElementById("expirationSelect")
  .addEventListener("change", function () {
    const expirationSelect = document.getElementById("expirationSelect");
    const customExpirationInput = document.getElementById("customExpiration");

    if (expirationSelect.value === "custom") {
      customExpirationInput.style.display = "inline";
    } else {
      customExpirationInput.style.display = "none";
    }
  });

const sharedFiles = {
  files: [],

  add: function (filename, shareUrl, expirationTime) {
    this.files.push({
      filename: filename,
      url: shareUrl,
      expiresAt: expirationTime,
    });
  },
};

async function shareFile(filename) {
  if (sharedFiles.files.some((file) => file.filename === filename)) {
    const fileEntry = sharedFiles.files.find(
      (file) => file.filename === filename
    );
    const shareButton = document.querySelector(
      `button[onclick="shareFile('${filename}')"]`
    );
    shareButton.disabled = true;
    openModal(fileEntry.url, fileEntry.expiresAt, shareButton);
    return;
  }

  const expirationSelect = document.getElementById("expirationSelect");
  const expirationValue = expirationSelect.value;
  let expirationTime =
    expirationValue === "custom"
      ? document.getElementById("customExpiration").value
      : expirationValue;
  const password = document.getElementById("sharePassword").value;

  if (expirationValue === "custom" && expirationTime !== "") {
    const customDate = new Date(expirationTime);
    expirationTime = customDate.getTime() - Date.now();
    expirationTime = expirationTime;
    console.log(expirationTime);
  } else if (expirationValue !== "custom" && expirationTime !== "") {
    expirationTime = parseInt(expirationTime, 10);
    expirationTime = expirationTime * 60 * 60 * 1000;
  }

  try {
    const shareButton = document.querySelector(
      `button[onclick="shareFile('${filename}')"]`
    );
    shareButton.disabled = true;

    const response = await fetch(`${apiBaseUrl}/share/${filename}`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${sessionStorage.getItem("authToken")}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        expiryTime: expirationTime,
        password: password,
      }),
    });

    if (response.ok) {
      const result = await response.json();
      if (result.reason && result.reason === "already_shared") {
        const fileEntry = sharedFiles.files.find(
          (file) => file.filename === filename
        );
        openModal(result.url, result.expiresAt, shareButton);
      } else {
        openModal(result.shareUrl, result.expiresAt, shareButton);
        sharedFiles.add(filename, result.shareUrl, result.expiresAt);
      }
    } else {
      alert("Error sharing file.");
    }
  } catch (error) {
    console.error("Share error:", error);
    alert("Error sharing file.");
  }
}

async function fetchStorageUsage() {
  try {
    const authToken = sessionStorage.getItem("authToken");
    if (!authToken) {
      alert("No authentication token found.");
      return;
    }

    const response = await fetch(`${apiBaseUrl}/usage`, {
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    });

    if (!response.ok) {
      console.error(
        "API request failed:",
        response.status,
        response.statusText
      );
      alert("Error fetching storage usage: " + response.statusText);
      return;
    }

    const result = await response.json();

    if (
      result.storageUsage &&
      result.storageUsage.total &&
      result.storageUsage.limit
    ) {
      const storageUsageText = `Used: ${findBestUnit(
        result.storageUsage.total
      )} / ${(result.storageUsage.limit = -1
        ? "∞"
        : findBestUnit(result.storageUsage.limit))}`;
      document.getElementById("storageUsage").innerText = storageUsageText;
    }
  } catch (error) {
    console.error("Fetch storage usage error:", error);
    alert("Error fetching storage usage.");
  }
}

function findBestUnit(bytes) {
  let dividor = 1024;
  units = ["B", "KB", "MB", "GB", "TB"];
  unitIndex = 0;
  while (bytes >= dividor && unitIndex < units.length - 1) {
    bytes /= dividor;
    unitIndex++;
  }
  return `${bytes.toFixed(2)} ${units[unitIndex]}`;
}

let isThrottled = false;

function handleScroll() {
  if (isThrottled) return;

  isThrottled = true;
  setTimeout(() => {
    const previewSection = document.getElementById("previewSection");
    const rect = previewSection.getBoundingClientRect();

    if (rect.top < 0) {
      previewSection.style.position = "absolute";
      previewSection.style.top = `${window.scrollY + 20}px`;
    } else {
      previewSection.style.position = "absolute";
      previewSection.style.top = "20px";
    }

    isThrottled = false;
  }, 100);
}

window.addEventListener("scroll", handleScroll);

fetchFiles();
fetchStorageUsage();

function switchToGroups() {
  document.querySelector('main').classList.add('slide-out');
  setTimeout(() => {
    window.location.href = '/groups';
  }, 300); 
}