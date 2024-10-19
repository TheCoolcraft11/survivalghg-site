import {editor} from "../disconnect/elements.js";
import {copySelected, copyShortcut} from "./confiruragtion/clipboard.js";
import {onInput} from "./confiruragtion/editor.js";
import {loadOptions} from "./load.js";
export function configureTerm(term) {
  const options = loadOptions();
  try {
    term.options = options.xterm;
  } catch {
  }
  const toggle = document.querySelector("#options .toggler");
  const optionsElem = document.getElementById("options");
  if (editor == null || toggle == null || optionsElem == null) {
    throw new Error("Couldn't initialize configuration menu");
  }
  function editorOnLoad() {
    editor?.contentWindow?.loadOptions(loadOptions());
    editor.contentWindow.wetty_close_config = () => {
      optionsElem?.classList.toggle("opened");
    };
    editor.contentWindow.wetty_save_config = (newConfig) => {
      onInput(term, newConfig);
    };
  }
  if ((editor.contentDocument || (editor.contentWindow?.document ?? {
    readyState: ""
  })).readyState === "complete") {
    editorOnLoad();
  }
  editor.addEventListener("load", editorOnLoad);
  toggle.addEventListener("click", (e) => {
    editor?.contentWindow?.loadOptions(loadOptions());
    optionsElem.classList.toggle("opened");
    e.preventDefault();
  });
  term.attachCustomKeyEventHandler(copyShortcut);
  document.addEventListener("mouseup", () => {
    if (term.hasSelection())
      copySelected(term.getSelection());
  }, false);
}
