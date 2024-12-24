const token = sessionStorage.getItem("authToken");

let backups = [];
let filteredBackups = [];
let selectedBackupToDelete = null;

document.addEventListener("DOMContentLoaded", () => {
  loadBackups();
  document.getElementById("search").addEventListener("input", filterBackups);
  document.getElementById("sort").addEventListener("change", sortBackups);
  document
    .getElementById("cancel-delete")
    .addEventListener("click", closeModal);
  document
    .getElementById("confirm-delete")
    .addEventListener("click", confirmDelete);
});

async function loadBackups() {
  try {
    const response = await fetch("/api/backups", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
    backups = await response.json();
    filteredBackups = backups;
    displayBackups();
  } catch (error) {
    console.error("Error fetching backups:", error);
    document.getElementById("backup-list").innerHTML =
      "<p>Error loading backups.</p>";
  }
}

function filterBackups() {
  const searchTerm = document.getElementById("search").value.toLowerCase();
  filteredBackups = backups.filter((backup) =>
    backup.name.toLowerCase().includes(searchTerm)
  );
  displayBackups();
}

function sortBackups() {
  const sortOption = document.getElementById("sort").value;
  filteredBackups.sort((a, b) => {
    switch (sortOption) {
      case "name":
        return a.name.localeCompare(b.name);
      case "size":
        return parseFloat(a.size) - parseFloat(b.size);
      case "date":
        return new Date(b.createdAt) - new Date(a.createdAt);
      default:
        return 0;
    }
  });
  displayBackups();
}

function displayBackups() {
  const listContainer = document.getElementById("backup-list");
  listContainer.innerHTML = "";

  if (filteredBackups.length === 0) {
    listContainer.innerHTML = "<p>No backups found.</p>";
    return;
  }

  const ul = document.createElement("ul");
  filteredBackups.forEach((backup) => {
    const li = document.createElement("li");
    li.className = "backup-item";

    li.innerHTML = `
         <div>
                <h2>${backup.name}</h2>
                <p class="details">
                    <span>Size: ${backup.size}</span>
                    <span>Created: ${new Date(
                      backup.createdAt
                    ).toLocaleString()}</span>
                </p>
            </div>
            <div class="actions">
            <a href="${
              backup.downloadUrl
            }?token=${token}" class="download-btn" target="_blank" download>Download</a>
            <button onclick="promptDelete('${
              backup.name
            }')" class="delete-btn">Delete</button>
        </div>
`;

    ul.appendChild(li);
  });
  listContainer.appendChild(ul);
}

function promptDelete(filename) {
  selectedBackupToDelete = filename;
  document.getElementById("delete-filename").textContent = filename;
  document.getElementById("delete-modal").classList.add("active");
}

function closeModal() {
  document.getElementById("delete-modal").classList.remove("active");
  selectedBackupToDelete = null;
}

async function confirmDelete() {
  if (!selectedBackupToDelete) return;

  try {
    const response = await fetch(`/api/backups/${selectedBackupToDelete}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    if (response.ok) {
      alert("Backup deleted successfully");
      loadBackups();
    } else {
      alert("Failed to delete backup");
    }
  } catch (error) {
    console.error("Error deleting backup:", error);
    alert("Error deleting backup");
  } finally {
    closeModal();
  }
}
async function downloadBackup(downloadUrl) {
  const token = sessionStorage.getItem("authToken");
  if (!token) {
    alert("Authentication token is missing. Please log in again.");
    return;
  }

  try {
    const response = await fetch(downloadUrl, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to download. Status: ${response.status}`);
    }

    const contentDisposition = response.headers.get("Content-Disposition");
    const filename = contentDisposition
      ? contentDisposition.match(/filename="(.+)"/)?.[1]
      : downloadUrl.split("/").pop();

    const stream = response.body;
    const reader = stream.getReader();
    const chunks = [];
    let receivedLength = 0;

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      chunks.push(value);
      receivedLength += value.length;
    }

    const blob = new Blob(chunks);
    const fileUrl = window.URL.createObjectURL(blob);
    const downloadLink = document.createElement("a");
    downloadLink.href = fileUrl;
    downloadLink.download = filename || "backup-file";
    document.body.appendChild(downloadLink);
    downloadLink.click();
    window.URL.revokeObjectURL(fileUrl);
    downloadLink.remove();

    alert("Download completed!");
  } catch (error) {
    console.error("Error during download:", error.message);
    alert("Failed to download the backup. Please try again.");
  }
}
