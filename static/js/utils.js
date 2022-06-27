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

// Show/Hide toggle function
// When the element has show class, remove show and add hide
// The element will be hidden

function hideElement(element) {
  if (element.classList.contains("show")) {
    element.classList.remove("show");
  }
  element.classList.add("hide");
}

// Show/Hide toggle function
// When the element has hide class, remove hide and add show
// The element will be shown
function showElement(element) {
  if (element.classList.contains("hide")) {
    element.classList.remove("hide");
  }
  element.classList.add("show");
}

// Show/Hide toggle function
// When the element has show class, remove show and add hide
// The element will be hidden

function hideNavbarElement(element) {
  if (element.classList.contains("show-navbar")) {
    element.classList.remove("show-navbar");
  }
  element.classList.add("hide");
}

// Show/Hide toggle function
// When the element has hide class, remove hide and add show
// The element will be shown
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

// When localStorage is empty, only display Add Image Form and hide everything.
function emptyGallery() {
  hideElement(document.querySelector("#add-img-form-section-id"));
  hideElement(document.querySelector("#img-viewer-section-id"));
  hideElement(document.querySelector("#add-comment-form-section-id"));
  hideElement(document.querySelector("#comment-section-id"));
  showElement(document.querySelector("#gallery-phrase"));
}

// When localStorage is not empty, hide Add Image Form to let users click the add icon to add more images,
// and show image viewer, add comment form and recent comments section.
function notEmptyGallery() {
  hideElement(document.querySelector("#add-img-form-section-id"));
  showElement(document.querySelector("#img-viewer-section-id"));
  showElement(document.querySelector("#add-comment-form-section-id"));
  showElement(document.querySelector("#comment-section-id"));
  showElement(document.querySelector("#gallery-intro-phrase"));
  hideElement(document.querySelector("#empty-gallery"));
}

// When there is no recent comment, hide entire recent comments section
function emptyComment() {
  hideElement(document.querySelector("#comment-section-id"));
}

// When there are recent comments, show recent comments section
function notEmptyComment() {
  showElement(document.querySelector("#comment-section-id"));
}

// “how to sort json data in javascript based on date” Code
// https://www.codegrepper.com/code-examples/javascript/how+to+sort+json+data+in+javascript+based+on+date
function comment_sort(a, b) {
  return new Date(a.createdAt) - new Date(b.createdAt);
}
