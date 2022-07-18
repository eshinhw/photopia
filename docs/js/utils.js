function getPostingDate() {
  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];
  const currTime = new Date();
  const year = currTime.getFullYear();
  const month = months[currTime.getMonth()];
  const day = currTime.getDate();
  const hour = currTime.getHours();
  var minute = currTime.getMinutes();
  if (minute < 10) {
    minute = "0" + minute;
  }
  return `posted on ${month} ${day}, ${year} at ${hour}:${minute}`;
}

function hideElement(element) {
  if (element.classList.contains("show")) {
    element.classList.remove("show");
  }
  element.classList.add("hide");
}

function showElement(element) {
  if (element.classList.contains("hide")) {
    element.classList.remove("hide");
  }
  element.classList.add("show");
}

function hideNavbarElement(element) {
  if (element.classList.contains("show-navbar")) {
    element.classList.remove("show-navbar");
  }
  element.classList.add("hide");
}

function showNavbarElement(element) {
  if (element.classList.contains("hide")) {
    element.classList.remove("hide");
  }
  element.classList.add("show-navbar");
}

function showGallery() {
  hideElement(document.querySelector("#add-img-form-section-id"));
  showElement(document.querySelector("#img-viewer-section-id"));
  hideElement(document.querySelector("#add-comment-form-section-id"));
  showElement(document.querySelector("#comment-section-id"));
  showElement(document.querySelector("#gallery-phrase"));
}

function hideGallery() {
  hideElement(document.querySelector("#add-img-form-section-id"));
  hideElement(document.querySelector("#img-viewer-section-id"));
  hideElement(document.querySelector("#add-comment-form-section-id"));
  hideElement(document.querySelector("#comment-section-id"));
  hideElement(document.querySelector("#gallery-phrase"));
}

function checkGalleryVisibility(galleryList) {
  if (galleryList.classList.contains("hide")) {
    showGallery();
  } else {
    hideGallery();
  }
}

function emptyGallery() {
  hideElement(document.querySelector("#add-img-form-section-id"));
  hideElement(document.querySelector("#img-viewer-section-id"));
  hideElement(document.querySelector("#add-comment-form-section-id"));
  hideElement(document.querySelector("#comment-section-id"));
  showElement(document.querySelector("#gallery-phrase"));
}

function notEmptyGallery() {
  hideElement(document.querySelector("#add-img-form-section-id"));
  showElement(document.querySelector("#img-viewer-section-id"));
  showElement(document.querySelector("#add-comment-form-section-id"));
  showElement(document.querySelector("#comment-section-id"));
  showElement(document.querySelector("#gallery-intro-phrase"));
  hideElement(document.querySelector("#empty-gallery"));
}

function emptyComment() {
  hideElement(document.querySelector("#comment-section-id"));
}

function notEmptyComment() {
  showElement(document.querySelector("#comment-section-id"));
}

// “how to sort json data in javascript based on date” Code
// https://www.codegrepper.com/code-examples/javascript/how+to+sort+json+data+in+javascript+based+on+date
function comment_sort(a, b) {
  return new Date(a.createdAt) - new Date(b.createdAt);
}
