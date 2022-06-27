(function () {
  "use strict";

  function onError(err) {
    console.error("[error]", err);
    let errorBox = document.querySelector("#error-box");
    errorBox.innerHTML = err;
    errorBox.style.visibility = "visible";
  }

  window.addEventListener("load", function () {
    let currImg;
    let galleryOwner;
    let currImgId = currImg != null ? currImg._id : null;

    let galleryCurrPage = 1;
    let galleryPrevPage = 1;
    let galleryNextPage = 1;

    let imageCurrPage = 1;
    let imagePrevPage = 1;
    let imageNextPage = 0;
    let imageLastPage;

    let commentsCurrPage = 1;
    let commentsPrevPage = 1;
    let commentsNextPage = 1;

    let currCommentsLength;
    let totalComments;

    function updateUsernameDisplay() {
      let usernameDisplay = document.querySelector("#username-display");
      if (activeUser == null) {
        usernameDisplay.innerText = "";
        usernameDisplay.classList.add("hide");
      } else {
        usernameDisplay.innerText = "Log in as " + activeUser;
        usernameDisplay.classList.add("show");
      }
    }

    function updateGallery(galleryPage) {
      const galleryLimit = 5;
      apiService.getGallery(galleryPage, galleryLimit, (err, res) => {
        if (err) return onError(err);
        if (res.data.length === 0) {
          return;
        } else {
          galleryCurrPage = parseInt(res.currPage);
          galleryPrevPage = parseInt(res.prevPage);
          galleryNextPage = parseInt(res.nextPage);
          document.querySelector("#gallery-list").innerHTML = "";
          res.data.forEach((gallery) => {
            let elm = document.createElement("li");
            elm.id = gallery._id;
            elm.classList.add("gallery-item");
            elm.innerText = gallery._id;
            document.querySelector("#gallery-list").append(elm);
          });
        }
      });
    }

    function updateImage(galleryOwner, imagePage) {
      const imageLimit = 1;
      document.querySelector(".img-viewer").innerHTML = "";

      apiService.getImages(galleryOwner, imagePage, imageLimit, (err, res) => {
        if (err) return onError(err);
        if (res.data.length === 0) {
          showElement(document.querySelector("#empty-gallery"));
          emptyGallery();
          document.querySelector("#empty-gallery").innerHTML =
            "This gallery is currently empty. <br><br> Please come back later!";
          return;
        }
        notEmptyGallery();
        imageCurrPage = res.currPage;
        imagePrevPage = res.prevPage;
        imageNextPage = res.nextPage;
        imageLastPage = res.lastPage;

        currImg = res.data[0];
        const postedDate = currImg.postedDate;
        const imgTitle = currImg.title;
        const imgDescription = currImg.description;
        const imgId = currImg._id;
        const imgUploader = currImg.author;

        let element = document.createElement("div");
        element.id = "imgViewerComp";
        element.innerHTML = `
                    <div class="uploader-profile">
                      <div class="uploader-picture"></div>
                      <div class="uploader-name"><span id="img-author">${imgUploader}</span><br><span class="posted-date" id="posted-date">${postedDate}</span></div>
                    </div>
                    <div class="viewer-comp image" id="img-viewer-screen-id"><img id="current-img" src="/api/gallery/${galleryOwner}/images/${imgId}"></div>
                    <div class="viewer-comp title" id="img-viewer-title-id">${imgTitle}</div>
                    <div class="viewer-comp description" id="img-viewer-description-id">${imgDescription}</div>                    
                `;

        document.querySelector(".img-viewer").prepend(element);

        updateComments(galleryOwner, 1);
      });
    }

    function updateComments(galleryOwner, commentsPage) {
      const commentsLimit = 10;
      currImgId = currImg != null ? currImg._id : null;

      if (currImgId === null) {
        if (activeUser === galleryOwner) return emptyGallery();
        return;
      }

      apiService.getComments(galleryOwner, commentsPage, commentsLimit, currImgId, (err, res) => {
        if (err) return onError(err);
        document.querySelector("#comments").innerHTML = "";
        if (res.data.length === 0) return;

        commentsCurrPage = res.currPage;
        commentsPrevPage = res.prevPage;
        commentsNextPage = res.nextPage;
        currCommentsLength = res.currCount;
        totalComments = res.totalCount;

        res.data.forEach(function (comment) {
          const commentAuthor = comment.username;
          const commentContent = comment.content;
          const commentUpvote = comment.upvote;
          const commentDownvote = comment.downvote;
          const postedDate = comment.postedDate;
          const commentId = comment._id;

          let element = document.createElement("div");
          element.className = "comment";
          element.innerHTML = `
                        <div class="comment-user">
                            <div class="comment-picture"></div>
                            <div class="comment-username">${commentAuthor}</div>
                        </div>
                        <div class="comment-content"><p>${commentContent}</p><br><span class="posted-date">${postedDate}</span></div>
                        <div class="comment-icon icon" id="upvote-icon-id">${commentUpvote}</div>
                        <div class="comment-icon icon" id="downvote-icon-id">${commentDownvote}</div>
                        <div class="comment-icon icon" id="delete-comment-icon-id"></div>
                    `;
          document.querySelector("#comments").append(element);

          element.querySelector("#delete-comment-icon-id").addEventListener("click", function () {
            currImgId = currImg != null ? currImg._id : null;
            apiService.deleteComment(
              activeUser,
              galleryOwner,
              currImgId,
              commentId,
              (err, removed) => {
                if (err) return onError(err);
                if (removed.error) return alert(removed.error.message);
                if (currCommentsLength === 1 && commentsPrevPage === 1)
                  return updateComments(galleryOwner, commentsPrevPage);
                return updateComments(galleryOwner, commentsCurrPage);
              }
            );
          });

          element.querySelector("#upvote-icon-id").addEventListener("click", function () {
            currImgId = currImg != null ? currImg._id : null;
            apiService.upvote(galleryOwner, currImgId, commentId, (err, res) => {
              if (err) return onError(err);
              return updateComments(galleryOwner, commentsCurrPage);
            });
          });

          element.querySelector("#downvote-icon-id").addEventListener("click", function () {
            currImgId = currImg != null ? currImg._id : null;
            apiService.downvote(galleryOwner, currImgId, commentId, (err, res) => {
              if (err) return onError(err);
              return updateComments(galleryOwner, commentsCurrPage);
            });
          });
        });
      });
    }

    let activeUser = apiService.getUsername() ? apiService.getUsername() : null;

    const signOutButton = document.querySelector("#navbar-signout-icon-list-elm");
    const addImageButton = document.querySelector("#navbar-add-icon-list-elm");
    const signInButton = document.querySelector("#navbar-signin-icon-list-elm");
    const registerButton = document.querySelector("#navbar-register-icon-list-elm");
    const backListButton = document.querySelector("#navbar-back-icon-list-elm");
    const unauthorized = document.querySelector("#unauthorized-main");

    const galleryList = document.querySelector("#gallery-list-section-id");
    const imageViewer = document.querySelector("#img-viewer-section-id");
    const createCommentForm = document.querySelector("#add-comment-form-section-id");
    const commentWrapper = document.querySelector("#comment-section-id");
    const addImageForm = document.querySelector("#add-img-form-section-id");

    // unauthorized users don't have any access
    if (activeUser == null) {
      hideNavbarElement(signOutButton);
      hideNavbarElement(addImageButton);
      showNavbarElement(signInButton);
      showNavbarElement(registerButton);
      hideNavbarElement(backListButton);

      hideElement(galleryList);
      hideElement(addImageForm);
      hideElement(commentWrapper);
      hideElement(createCommentForm);
      hideElement(imageViewer);
      showElement(unauthorized);
      return;
    }

    // if activeUser exists, show signout and add image button
    updateUsernameDisplay();

    showNavbarElement(signOutButton);
    hideNavbarElement(addImageButton);
    hideNavbarElement(signInButton);
    hideNavbarElement(registerButton);
    hideNavbarElement(backListButton);

    showElement(galleryList);
    hideElement(unauthorized);

    checkGalleryVisibility(galleryList, backListButton);

    updateGallery(galleryCurrPage);

    document.querySelector("#prev-gallery-id").addEventListener("click", function (e) {
      if (galleryCurrPage === galleryPrevPage) return;
      return updateGallery(galleryPrevPage);
    });

    document.querySelector("#next-gallery-id").addEventListener("click", function (e) {
      if (galleryCurrPage === galleryNextPage) return;
      return updateGallery(galleryNextPage);
    });

    document.getElementById("gallery-list").addEventListener("click", function (e) {
      if (e.target && e.target.nodeName == "LI") {
        hideElement(galleryList);
        showNavbarElement(backListButton);

        galleryOwner = e.target.innerHTML;
        document.getElementById(
          "gallery-intro-phrase"
        ).innerText = `Welcome to ${galleryOwner}'s gallery!`;
        if (activeUser != galleryOwner) {
          hideNavbarElement(addImageButton);
        } else {
          showNavbarElement(addImageButton);
        }
        updateImage(galleryOwner, 1);
        document.querySelector("#back-icon").addEventListener("click", function (e) {
          showElement(galleryList);
          hideGallery();
          hideNavbarElement(backListButton);
          hideNavbarElement(addImageButton);
        });
      }
    });

    document.querySelector("#comment-btn-id").addEventListener("click", function (e) {
      if (createCommentForm.classList.contains("show")) hideElement(createCommentForm);
      else showElement(createCommentForm);
    });

    document.querySelector("#add-icon").addEventListener("click", function (e) {
      hideElement(document.querySelector("#empty-gallery"));
      if (addImageForm.classList.contains("show")) return hideElement(addImageForm);
      showElement(addImageForm);
    });

    document.querySelector("#add-img-form-id").addEventListener("submit", function (e) {
      e.preventDefault();
      const imgTitle = document.querySelector("#img-title-id").value;
      const imgDescription = document.querySelector("#img-description-id").value;
      const img = document.getElementById("img-upload-id").files[0];
      document.querySelector("#add-img-form-id").reset();
      apiService.addImage(imgTitle, activeUser, imgDescription, img, (err, res) => {
        if (err) return onError(err);
        currImgId = currImg != null ? currImg._id : null;
        notEmptyGallery();
        updateImage(activeUser, imageLastPage + 1);
      });
    });

    document.getElementById("prev-btn-id").addEventListener("click", function (e) {
      if (imageCurrPage === imagePrevPage) return;
      return updateImage(galleryOwner, imagePrevPage);
    });

    document.getElementById("next-btn-id").addEventListener("click", function (e) {
      if (imageCurrPage === imageNextPage) return;
      return updateImage(galleryOwner, imageNextPage);
    });

    document.getElementById("delete-btn-id").addEventListener("click", function (e) {
      currImgId = currImg != null ? currImg._id : null;
      apiService.deleteImage(activeUser, galleryOwner, currImgId, (err, res) => {
        if (err) return onError(err);
        if (res.error) return alert(res.error.message);

        apiService.deleteAllComments(activeUser, galleryOwner, currImgId, (err, res) => {
          if (err) return onError(err);
          updateImage(galleryOwner, imagePrevPage);
        });
      });
    });

    document.querySelector("#add-comment-form-id").addEventListener("submit", function (e) {
      e.preventDefault();
      const commentContent = document.querySelector("#comment-content-id").value;
      document.querySelector("#add-comment-form-id").reset();
      apiService.addComment(galleryOwner, currImgId, activeUser, commentContent, (err, newDoc) => {
        if (err) return onError(err);
        updateComments(galleryOwner, 1);
      });
    });

    document.getElementById("prev-comment-id").addEventListener("click", function (e) {
      if (commentsCurrPage === commentsPrevPage) return;
      return updateComments(galleryOwner, commentsPrevPage);
    });

    document.getElementById("next-comment-id").addEventListener("click", function (e) {
      if (commentsCurrPage === commentsNextPage) return;
      return updateComments(galleryOwner, commentsNextPage);
    });
  });
})();
