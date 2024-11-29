let note = "";
function saveNote() {
    const noteContent = document.querySelector('.widget-note textarea').value;
    note = noteContent;
    document.getElementsByName("noteHolder")[0].innerHTML = note;
    sessionStorage.setItem("noteWidget-note", note)
}
