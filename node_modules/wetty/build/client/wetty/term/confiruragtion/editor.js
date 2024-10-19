import {editor} from "../../disconnect/elements.js";
export const onInput = (term, updated) => {
  try {
    const updatedConf = JSON.stringify(updated, null, 2);
    if (localStorage.options === updatedConf)
      return;
    term.options = updated.xterm;
    if (!updated.wettyFitTerminal && updated.xterm.cols != null && updated.xterm.rows != null)
      term.resize(updated.xterm.cols, updated.xterm.rows);
    term.resizeTerm();
    editor.classList.remove("error");
    localStorage.options = updatedConf;
  } catch (e) {
    console.error("Configuration Error", e);
    editor.classList.add("error");
  }
};
