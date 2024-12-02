const params = new URLSearchParams(window.location.search);
const errorMessage = decodeURIComponent(
  params.get("error") || "An unknown error occurred."
);
var filter = errorMessage.replace("\n", "<br>");
document.getElementById("errorMessage").innerHTML = filter;
