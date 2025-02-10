const token = sessionStorage.getItem("authToken");
async function loadUsers() {
  try {
    const token = sessionStorage.getItem("authToken");
    if (token) {
      const response = await fetch("/api/users", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const users = await response.json();

      const userTable = document.getElementById("user-table-body");
      userTable.innerHTML = "";

      users.forEach((user) => {
        const row = document.createElement("tr");

        row.innerHTML = `
                        <td>${user.id}</td>
                        <td>${user.username || "No name provided"}</td>
                        <td>${user.role || "No role provided"}</td>
                        <td>
                        <form onsubmit="submitName(event, ${
                          user.id
                        })" style="align-items: center; display: inline;">
                            <label for="username-${user.id}">Name:</label>
                            <input type="text" id="username-${
                              user.id
                            }" name="username" placeholder="${
          user.username
        }" value="${user.username}" style="width: 150px;"></input>
                            <button type="submit">Update</button>
                        </form>    
                            <form id="roleForm-${
                              user.id
                            }" onsubmit="submitRole(event, ${
          user.id
        })" style="display:inline;">
                            <label for="role-${user.id}">Role:</label>
                            <select id="role-${
                              user.id
                            }" name="role" onchange="toggleCustomRoleField(${
          user.id
        })">
                            <option value="admin" ${
                              user.role === "admin" ? "selected" : ""
                            }>Admin</option>
                            <option value="user" ${
                              user.role === "user" ? "selected" : ""
                            }>User</option>
                            <option value="moderator" ${
                              user.role === "moderator" ? "selected" : ""
                            }>Moderator</option>
                            <option value="guest" ${
                              user.role === "guest" ? "selected" : ""
                            }>Guest</option>
                            <option value="member" ${
                              user.role === "member" ? "selected" : ""
                            }>Member</option>
                            <option value="other" ${
                              ![
                                "admin",
                                "user",
                                "moderator",
                                "guest",
                                "member",
                              ].includes(user.role)
                                ? "selected"
                                : ""
                            }>Other</option>
                            </select>
                            <input type="text" id="custom-role-${
                              user.id
                            }" name="custom-role" placeholder="Enter custom role" style="display: ${
          !["admin", "user", "moderator", "guest", "member"].includes(user.role)
            ? "block"
            : "none"
        };" value="${
          !["admin", "user", "moderator", "guest", "member"].includes(user.role)
            ? user.role
            : ""
        }">
                            <button type="submit">Change Role</button>
                        </form>
                        <form onsubmit="submitPassword(event, ${
                          user.id
                        })" style="align-items: center; display: inline;">
                            <label for="password-${user.id}">Password:</label>
                            <input type="password" id="password-${
                              user.id
                            }" name="password" placeholder="New password" style="width: 120px;"></input>
                            <button type="submit">Update</button>
                        </form>  

                            <form id="deleteForm-${
                              user.id
                            }" onsubmit="deleteUser(event, ${
          user.id
        })" style="display:inline;">
                                <button type="submit" class="btn-delete">Delete</button>
                            </form>
                        </td>
                    `;

        userTable.appendChild(row);
      });
    }
  } catch (error) {
    console.error("Error fetching users:", error);
  }
}

async function addUser(event) {
  event.preventDefault();

  const name = document.getElementById("name").value;
  const role = document.getElementById("role").value;
  const password = document.getElementById("password").value;

  const newUser = { name, role, password };

  try {
    const token = sessionStorage.getItem("authToken");
    if (!token) {
      alert("Please log in first.");
      return;
    }

    const response = await fetch("/api/users", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(newUser),
    });

    const result = await response.json();

    if (result.success) {
      alert("User added successfully");
      loadUsers();
    } else {
      alert("Error adding user: " + result.message);
    }
  } catch (error) {
    console.error("Error adding user:", error);
    alert("Error adding user.");
  }
}

async function submitName(event, userId) {
  event.preventDefault();

  const username = document.getElementById(`username-${userId}`).value;

  try {
    const token = sessionStorage.getItem("authToken");
    if (!token) {
      alert("Please log in first.");
      return;
    }

    const response = await fetch(`/api/users/${userId}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ method: "name", username }),
    });

    const result = await response.json();

    if (result.success) {
      alert("User updated successfully");
      loadUsers();
    } else {
      alert("Error updating user: " + result.message);
    }
  } catch (error) {
    console.error("Error updating user:", error);
    alert("Error updating user.");
  }
}

async function submitRole(event, userId) {
  event.preventDefault();

  const role = document.getElementById(`role-${userId}`).value;
  const customRole =
    role === "other"
      ? document.getElementById(`custom-role-${userId}`).value
      : null;

  try {
    const token = sessionStorage.getItem("authToken");
    if (!token) {
      alert("Please log in first.");
      return;
    }

    const response = await fetch(`/api/users/${userId}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ method: "role", role, customRole }),
    });

    const result = await response.json();

    if (result.success) {
      alert("User role updated successfully");
      loadUsers();
    } else {
      alert("Error updating user role: " + result.message);
    }
  } catch (error) {
    console.error("Error updating user role:", error);
    alert("Error updating user role.");
  }
}

async function deleteUser(event, userId) {
  event.preventDefault();

  try {
    const token = sessionStorage.getItem("authToken");
    if (!token) {
      alert("Please log in first.");
      return;
    }

    const response = await fetch(`/api/users/${userId}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    const result = await response.json();

    if (result.success) {
      alert("User deleted successfully");
      loadUsers();
    } else {
      alert("Error deleting user: " + result.message);
    }
  } catch (error) {
    console.error("Error deleting user:", error);
    alert("Error deleting user.");
  }
}
async function changePassword(id, newPassword) {
  const token = sessionStorage.getItem("authToken");
  if (token) {
    const response = await fetch(`/api/users/${id}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ method: "password", password: newPassword }),
    });

    if (response.ok) {
      document.getElementById("user-table-body").innerHTML = "";
      loadUsers();
    } else {
      console.error("Failed to update password");
    }
  } else {
    console.error("No auth token found");
  }
}

function toggleCustomRoleField(userId) {
  const roleSelect = document.getElementById(`role-${userId}`);
  const customRoleInput = document.getElementById(`custom-role-${userId}`);
  if (roleSelect.value === "other") {
    customRoleInput.style.display = "block";
    customRoleInput.required = true;
  } else {
    customRoleInput.style.display = "none";
    customRoleInput.required = false;
  }
}

loadUsers();
