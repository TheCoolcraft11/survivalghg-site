document.getElementById("goBackButton").addEventListener("click", function () {
  document.body.classList.add("time-traveling");
  document.body.classList.add("background-fade");

  setTimeout(function () {
    window.history.back();
  }, 3000);
});
