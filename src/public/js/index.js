const token = sessionStorage.getItem("authToken");
let availableWidgets = [];
let widgetConfig = [];
let placedWidgets = [];

function showFloatingUI(event, fieldId) {
  const floatingUI = document.getElementById("floatingUI");
  const field = document.getElementById(fieldId);

  const fieldRect = field.getBoundingClientRect();
  floatingUI.innerHTML = `  <p>Select a widget:</p>
    <button onclick="addEmptyWidget(${fieldId})">Empty Widget</button>`;

  floatingUI.style.left = `${fieldRect.right + 10}px`;
  floatingUI.style.top = `${fieldRect.top}px`;

  floatingUI.setAttribute("data-field-id", fieldId);

  floatingUI.style.display = "block";
  availableWidgets
    .filter((widget) => !widget.title.includes("Empty"))
    .forEach((widget) => {
      const widgetItem = document.createElement("div");
      widgetItem.classList.add("widget-item");
      widgetItem.innerHTML = `<button onclick="selectWidget(${widget.id})">${widget.title}</button>`;
      floatingUI.appendChild(widgetItem);
    });
}

function selectWidget(widgetId) {
  const floatingUI = document.getElementById("floatingUI");
  const fieldId = floatingUI.getAttribute("data-field-id");
  const field = document.getElementById(fieldId);

  addWidget(widgetId, field);

  closeFloatingUI();
}

function closeFloatingUI() {
  const floatingUI = document.getElementById("floatingUI");
  floatingUI.style.display = "none";
}

function addEmptyWidget(container) {
  const emptyWidgetId = "empty-widget-" + Date.now();
  const emptyWidget = {
    id: emptyWidgetId,
    title: "",
    html: "./widgets/html/empty.html",
    js: "./widgets/js/empty.js",
  };

  placedWidgets.push({
    fieldId: container.id,
    widgetId: emptyWidget.id,
    widgetTitle: emptyWidget.title,
  });

  container.classList.add("empty-widget");
  container.setAttribute("data-widget-id", emptyWidget.id);

  if (emptyWidget.color) {
    container.style.setProperty("--widget-bg-color", emptyWidget.color);
  }
  if (emptyWidget.accentColor) {
    container.style.setProperty(
      "--widget-accent-color",
      emptyWidget.accentColor
    );
  }
  if (emptyWidget.progressColor) {
    container.style.setProperty(
      "--widget-progress-bg-color",
      emptyWidget.progressColor
    );
  }
  if (emptyWidget.progressBarColor) {
    container.style.setProperty(
      "--widget-progress-bar-color",
      emptyWidget.progressBarColor
    );
  }

  container.innerHTML =
    '<div id="widget_' +
    emptyWidget.id +
    '" class="empty-widget">Leeres Widget</div>';

  gridContainer = document.getElementById("grid-container");
  gridContainer.style.display = "none";
  gridContainer.offsetHeight;
  gridContainer.style.display = "grid";
}

async function getWidgets() {
  try {
    const response = await fetch("/widgets.json");
    if (!response.ok)
      throw new Error("Netzwerkproblem: " + response.statusText);
    const data = await response.json();
    availableWidgets = data;
    widgetConfig = [...data];
  } catch (error) {
    console.error("Fehler beim Abrufen der Widgets:", error);
    availableWidgets = ["Error"];
  }
}

let savableVars = new Map();
function addWidget(widgetId, container) {
  const widgetIndex = availableWidgets.findIndex(
    (widget) => widget.id === widgetId
  );

  if (widgetIndex > -1) {
    const widget = availableWidgets[widgetIndex];
    placedWidgets.push({
      fieldId: container.id,
      widgetId: widget.id,
      widgetTitle: widget.title,
    });

    container.classList.add("widget");

    if (widget.color) {
      container.style.setProperty("--widget-bg-color", widget.color);
    }
    if (widget.accentColor) {
      container.style.setProperty("--widget-accent-color", widget.accentColor);
    }
    if (widget.progressColor) {
      container.style.setProperty(
        "--widget-progress-bg-color",
        widget.progressColor
      );
    }
    if (widget.progressBarColor) {
      container.style.setProperty(
        "--widget-progress-bar-color",
        widget.progressBarColor
      );
    }

    fetch(widget.html)
      .then((response) => {
        if (!response.ok)
          throw new Error(
            "Netzwerkproblem beim Laden des Widgets: " + response.statusText
          );
        return response.text();
      })
      .then((html) => {
        container.innerHTML = html;
        container.querySelector("div").id = "widget_" + widgetId;
        container.querySelector("div").dataset.field = container.id;
        container.outerHTML = container.innerHTML;
        const widgetElement = document.getElementById("widget_" + widgetId);

        if (widget.color) {
          widgetElement.style.setProperty("--widget-bg-color", widget.color);
        }
        if (widget.accentColor) {
          widgetElement.style.setProperty(
            "--widget-accent-color",
            widget.accentColor
          );
        }
        if (widget.progressColor) {
          widgetElement.style.setProperty(
            "--widget-progress-bg-color",
            widget.progressColor
          );
        }
        if (widget.progressBarColor) {
          widgetElement.style.setProperty(
            "--widget-progress-bar-color",
            widget.progressBarColor
          );
        }

        if (widget.js) {
          const script = document.createElement("script");
          script.src = widget.js;
          script.async = true;
          document.body.appendChild(script);
          if (widget.savable) {
            savableVars.set(widget.id, widget.savable);
          }
        }
        if (widget.additionals) {
          Object.entries(widget.additionals).forEach(([key, resources]) => {
            if (Array.isArray(resources)) {
              resources.forEach((resource) => {
                if (key === "js") {
                  if (!isScriptAlreadyAdded(`script-${resource}`)) {
                    const additionalScript = document.createElement("script");
                    additionalScript.src = resource;
                    additionalScript.async = true;
                    additionalScript.id = `script-${resource}`;
                    document.body.appendChild(additionalScript);
                  }
                }
                if (key === "css") {
                  if (!isCssAlreadyAdded(resource)) {
                    const link = document.createElement("link");
                    link.rel = "stylesheet";
                    link.href = resource;
                    link.id = `link-${resource}`;
                    document.head.appendChild(link);
                  }
                }
              });
            } else if (typeof resources === "string") {
              if (key === "js") {
                if (!isScriptAlreadyAdded(resources)) {
                  const additionalScript = document.createElement("script");
                  additionalScript.src = resources;
                  additionalScript.async = true;
                  additionalScript.id = `script-${resource}`;
                  document.body.appendChild(additionalScript);
                }
              }
              if (key === "css") {
                if (!isCssAlreadyAdded(resources)) {
                  const link = document.createElement("link");
                  link.rel = "stylesheet";
                  link.href = resources;
                  link.id = `link-${resource}`;
                  document.head.appendChild(link);
                }
              }
            }
          });
        }
        availableWidgets.splice(widgetIndex, 1);
      })
      .catch((error) => console.error("Fehler beim Laden des Widgets:", error));
  }
  gridContainer = document.getElementById("grid-container");
  gridContainer.style.display = "none";
  gridContainer.offsetHeight;
  gridContainer.style.display = "grid";
}

function isScriptAlreadyAdded(scriptId) {
  return document.getElementById(scriptId) !== null;
}

function isCssAlreadyAdded(href) {
  return document.getElementById(scriptId) !== null;
}

async function exportToJSON(remove) {
  if (placedWidgets.length === 0) {
    return;
  }

  const widgetData = placedWidgets.map((widget) => {
    const widgetElement = document.querySelector(
      `[data-field=${widget.fieldId}]`
    );
    const widgetVars = [];
    if (savableVars.has(widget.widgetId)) {
      const savables = savableVars.get(widget.widgetId);
      Object.entries(savables).forEach(([savable, value]) => {
        const storedValue = sessionStorage.getItem(savable);
        console.log(savable + " " + storedValue);
        widgetVars.push({ savable, storedValue });
        console.log(widgetVars);
      });
    }

    return {
      fieldId: widget.fieldId,
      widgetId: widget.widgetId,
      widgetTitle: widget.widgetTitle,
      widgetData: widgetVars,
    };
  });
  if (token) {
    const jsonData = remove ? null : JSON.stringify(widgetData, null, 2);
    console.log(jsonData);
    const response = await fetch("/api/dashboard-layout/save", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ layoutData: jsonData }),
    });

    const result = await response.json();
    if (response.ok) {
      alert("Dashboard layout saved successfully!");
    } else {
      alert("Error saving layout: " + result.error);
    }
  }
}

async function loadFromJSON() {
  const token = sessionStorage.getItem("authToken");
  if (token) {
    const response = await fetch("/api/dashboard-layout/load", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    const result = await response.json();
    if (response.ok) {
      const jsonData = result[0]?.dashboard_layout;
      console.log(jsonData);
      let widgetJSON;

      if (typeof jsonData === "string") {
        widgetJSON = JSON.parse(jsonData);
      } else {
        widgetJSON = jsonData;
      }

      await getWidgets();

      placedWidgets = [];
      document.querySelectorAll(".field").forEach((field) => {
        field.innerHTML = `Field ${field.id.replace("field", "")}`;
        field.classList.remove("widget");
      });

      if (widgetJSON) {
        widgetJSON.forEach((widgetData) => {
          const field = document.getElementById(widgetData.fieldId);
          if (field) {
            console.log(widgetData.widgetId, typeof widgetData.widgetId);
            if (
              widgetData.widgetId &&
              typeof widgetData.widgetId === "string"
            ) {
              if (widgetData.widgetId.includes("empty-widget")) {
                addEmptyWidget(field);
              }
            } else {
              addWidget(widgetData.widgetId, field);
              setTimeout(() => {
                const widgetConfigEntry = widgetConfig.find(
                  (widget) => widget.id === widgetData.widgetId
                );
                if (widgetConfigEntry && widgetConfigEntry.savable) {
                  widgetData.widgetData.forEach((entry) => {
                    const savableKey = entry.savable;
                    if (widgetConfigEntry.savable[savableKey]) {
                      const savableValue =
                        widgetConfigEntry.savable[savableKey];
                      waitForElement(savableValue, (element) => {
                        element.innerHTML = entry.storedValue;
                      });
                    }
                  });
                }
              }, 50);
            }
          }
        });
      }
    }
  }
}

function waitForElement(selector, callback, timeout = 50) {
  const observer = new MutationObserver((mutations, obs) => {
    const element = document.getElementById(selector);
    if (element) {
      callback(element);
      obs.disconnect();
    }
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true,
  });

  setTimeout(() => observer.disconnect(), timeout);
}

function toggleButtons() {
  const buttonContainer = document.querySelector(".button-container");
  if (buttonContainer.style.display === "none") {
    buttonContainer.style.display = "flex";
  } else {
    buttonContainer.style.display = "none";
  }
}

getWidgets();

document.addEventListener("DOMContentLoaded", loadFromJSON());

const container = document.getElementById("grid-container");

let scrollAmount = 0;
let isScrolling = false;

container.addEventListener("wheel", (e) => {
  const target = e.target;

  if (target.hasAttribute("ignoreScroll")) {
    return;
  }

  if (
    target !== container &&
    (target.scrollHeight > target.clientHeight ||
      target.scrollWidth > target.clientWidth)
  ) {
    return;
  }

  e.preventDefault();

  const delta = e.deltaY > 0 ? 100 : -100;
  scrollAmount += delta;

  if (!isScrolling) {
    isScrolling = true;
    smoothScroll();
  }
});

function smoothScroll() {
  const step = () => {
    const distance = scrollAmount / 10;
    container.scrollLeft += distance;
    scrollAmount -= distance;

    if (Math.abs(scrollAmount) > 1) {
      requestAnimationFrame(step);
    } else {
      scrollAmount = 0;
      isScrolling = false;
    }
  };

  requestAnimationFrame(step);
}
