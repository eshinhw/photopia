(function () {
  "use strict";

  window.addEventListener("load", function () {
    const signOutButton = document.querySelector("#navbar-signout-icon-list-elm");
    const addImageButton = document.querySelector("#navbar-add-icon-list-elm");
    const signInButton = document.querySelector("#navbar-signin-icon-list-elm");
    const registerButton = document.querySelector("#navbar-register-icon-list-elm");
    const backListButton = document.querySelector("#navbar-back-icon-list-elm");

    showNavbarElement(signInButton);
    showNavbarElement(registerButton);
    hideNavbarElement(signOutButton);
    hideNavbarElement(addImageButton);
    hideNavbarElement(backListButton);

    function onError(err) {
      console.error("[error]", err);
      let error_box = document.querySelector("#error_box");
      error_box.innerHTML = err;
      error_box.style.visibility = "visible";
    }

    document.querySelector("#signin-btn").addEventListener("click", function (e) {
      e.preventDefault();
      let username = document.querySelector("#signin-form [name=signin-username]").value;
      let password = document.querySelector("#signin-form [name=signin-password]").value;
      document.querySelector("#signin-form").reset();
      apiService.signin(username, password, function (err, res) {
        if (err) return onError(err);
        if (res.error) return alert(res.error.message);
        return (window.location.href = "/");
      });
    });
  });
})();
