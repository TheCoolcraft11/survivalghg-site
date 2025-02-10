function loadGroups() {
  fetch('/api/groups', {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${sessionStorage.getItem("authToken")}`
    }
  })
  .then(response => response.json())
  .then(result => {
    const groupFilesSelect = document.getElementById("groupFilesSelect");
    const groupUploadSelect = document.getElementById("groupSelect");

    groupFilesSelect.innerHTML = '<option value="">Wählen Sie eine Gruppe</option>';
    groupUploadSelect.innerHTML = '<option value="">Wählen Sie eine Gruppe</option>';

    result.groups.forEach(groupName => {
      const optionForFiles = document.createElement("option");
      optionForFiles.value = groupName;
      optionForFiles.textContent = groupName;
      groupFilesSelect.appendChild(optionForFiles);

      const optionForUpload = document.createElement("option");
      optionForUpload.value = groupName;
      optionForUpload.textContent = groupName;
      groupUploadSelect.appendChild(optionForUpload);
    });
  })
  .catch(error => {
    console.error("Fehler beim Laden der Gruppen:", error);
    alert("Fehler beim Laden der Gruppen.");
  });
}

function createGroup() {
  const groupName = document.getElementById("newGroupName").value;

  fetch('/api/groups/create', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${sessionStorage.getItem("authToken")}`
    },
    body: JSON.stringify({ groupName })
  })
  .then(response => response.json())
  .then(result => {
    alert(result.message);
  })
  .catch(error => {
    console.error("Fehler beim Erstellen der Gruppe:", error);
    alert("Fehler beim Erstellen der Gruppe.");
  });
}

function addUserToGroup() {
  const groupName = document.getElementById("addUserGroupName").value;
  const userId = document.getElementById("addUserId").value;

  fetch(`/api/groups/${groupName}/addUser`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${sessionStorage.getItem("authToken")}`
    },
    body: JSON.stringify({ userId })
  })
  .then(response => response.json())
  .then(result => {
    alert(result.message);
  })
  .catch(error => {
    console.error("Fehler beim Hinzufügen des Benutzers zur Gruppe:", error);
    alert("Fehler beim Hinzufügen des Benutzers zur Gruppe.");
  });
}

function uploadGroupFiles() {
  const groupName = document.getElementById("groupSelect").value;
  const files = document.getElementById("groupFiles").files;

  if (!groupName) {
    alert("Bitte wählen Sie eine Gruppe aus.");
    return;
  }

  if (files.length === 0) {
    alert("Bitte wählen Sie mindestens eine Datei aus.");
    return;
  }

  const formData = new FormData();
  for (let i = 0; i < files.length; i++) {
    formData.append("files", files[i]);
  }

  fetch(`/api/groups/${groupName}/upload`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${sessionStorage.getItem("authToken")}`
    },
    body: formData
  })
  .then(response => response.json())
  .then(result => {
    alert(result.message);
  })
  .catch(error => {
    console.error("Fehler beim Hochladen der Dateien:", error);
    alert("Fehler beim Hochladen der Dateien.");
  });
}

function fetchGroupFiles() {
  const groupName = document.getElementById("groupFilesSelect").value;

  if (!groupName) {
    document.getElementById("groupFilesList").innerHTML = "<li>Bitte wählen Sie eine Gruppe aus.</li>";
    return;
  }

  fetch(`/api/groups/${groupName}/files`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${sessionStorage.getItem("authToken")}`
    }
  })
  .then(response => response.json())
  .then(result => {
    const filesList = document.getElementById("groupFilesList");
    filesList.innerHTML = "";

    if (result.files.length === 0) {
      filesList.innerHTML = "<li>Keine Dateien in dieser Gruppe.</li>";
      return;
    }

    result.files.forEach(file => {
      const li = document.createElement("li");
      li.className = "file-item";

      li.innerHTML = `
        <span>${file}</span>
        <div class="actions">
          <button onclick="downloadGroupFile('${groupName}', '${file}')" class="download-btn">Download</button>
          <button onclick="deleteGroupFile('${groupName}', '${file}')" class="delete-btn">Delete</button>
        </div>
      `;
      filesList.appendChild(li);
    });
  })
  .catch(error => {
    console.error("Fehler beim Abrufen der Gruppendateien:", error);
    alert("Fehler beim Abrufen der Gruppendateien.");
  });
}

function downloadGroupFile(groupName, filename) {
  fetch(`/api/groups/${groupName}/download/${filename}`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${sessionStorage.getItem("authToken")}`
    }
  })
  .then(response => {
    if (!response.ok) {
      throw new Error("Error downloading file");
    }
    return response.blob();
  })
  .then(blob => {
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.style.display = 'none';
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
  })
  .catch(error => {
    console.error("Fehler beim Herunterladen der Datei:", error);
    alert("Fehler beim Herunterladen der Datei.");
  });
}

window.onload = function() {
  loadGroups();
}; 

function switchToStorage() {
    document.querySelector('main').classList.add('slide-out');
    setTimeout(() => {
      window.location.href = '/storage';
    }, 300); 
  }