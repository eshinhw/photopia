let apiService = (function () {
  let module = {};

  function send(method, url, data, callback) {
    const config = {
      method: method,
    };
    if (!["GET", "DELETE"].includes(method)) {
      config.headers = {
        "Content-Type": "application/json",
      };
      config.body = JSON.stringify(data);
    }
    fetch(url, config)
      .then((res) => {
        return res.json();
      })
      .then((val) => {
        return callback(null, val);
      });
  }

  // followed to-do lecture example codes
  function sendImage(method, url, data, callback) {
    const config = {
      method: method,
    };
    if (!["GET", "DELETE"].includes(method)) {
      config.headers = {
        "Content-Type": "multipart/form-data",
      };
      config.body = data;
    }

    fetch(url, config)
      .then((res) => {
        return res.json();
      })
      .then((val) => {
        return callback(null, val);
      });
  }

  /*  ******* Data types *******
    image objects must have at least the following attributes:
        - (String) imageId 
        - (String) title
        - (String) author
        - (String) url
        - (Date) date

    comment objects must have the following attributes
        - (String) commentId
        - (String) imageId
        - (String) author
        - (String) content
        - (Date) date
  */

  module.getUsername = function () {
    return document.cookie.replace(/(?:(?:^|.*;\s*)username\s*\=\s*([^;]*).*$)|^.*$/, "$1");
  };

  module.signin = function (username, password, callback) {
    send("POST", "/signin", { username, password }, callback);
  };

  module.register = function (username, password, callback) {
    send("POST", "/register", { username, password }, callback);
  };

  module.signout = function (callback) {
    send("GET", "/signout", {}, callback);
  };

  module.getGallery = function (page, limit, callback) {
    send("GET", `/api/gallery?page=${page}&limit=${limit}`, {}, callback);
  };

  // add an image to the gallery
  module.addImage = function (title, galleryOwner, description, img, callback) {
    const formData = new FormData();
    formData.append("title", title);
    formData.append("author", galleryOwner);
    formData.append("description", description);
    formData.append("postedDate", getPostingDate());
    formData.append("image", img);

    fetch(`/api/gallery/${galleryOwner}/images/`, {
      method: "POST",
      body: formData,
    })
      .then((res) => {
        return res.json();
      })
      .then((val) => callback(null, val))
      .catch((err) => callback(err, null));
  };

  module.getImages = function (galleryOwner, page, limit, callback) {
    sendImage(
      "GET",
      `/api/gallery/${galleryOwner}/images?page=${page}&limit=${limit}`,
      {},
      (err, res) => {
        if (err) return callback(err, null);
        return callback(null, res);
      }
    );
  };

  module.getImageById = function (galleryOwner, imgId, callback) {
    sendImage("GET", `/api/gallery/${galleryOwner}/images/${imgId}`, {}, (err, res) => {
      if (err) return callback(err, null);
      return callback(null, res);
    });
  };

  // delete an image from the gallery given its imageId
  module.deleteImage = function (activeUser, galleryOwner, imgId, callback) {
    sendImage(
      "DELETE",
      `/api/gallery/${galleryOwner}/images/${imgId}?activeUser=${activeUser}`,
      { activeUser: activeUser },
      (err, res) => {
        if (err) return callback(err, null);
        return callback(null, res);
      }
    );
  };

  // add a comment to an image
  module.addComment = function (galleryOwner, imgId, author, content, callback) {
    const data = {
      galleryOwner: galleryOwner,
      imgId: imgId,
      author: author,
      content: content,
      postedDate: getPostingDate(),
    };

    send("POST", `/api/gallery/${galleryOwner}/images/${imgId}/comments`, data, (err, res) => {
      if (err) return callback(err, null);
      return callback(null, res);
    });
  };

  // Get comments
  module.getComments = function (galleryOwner, page, limit, imgId, callback) {
    send(
      "GET",
      `/api/gallery/${galleryOwner}/images/${imgId}/comments?page=${page}&limit=${limit}`,
      {},
      (err, res) => {
        if (err) return callback(err, null);
        return callback(null, res);
      }
    );
  };

  // delete a comment to an image
  module.deleteComment = function (activeUser, galleryOwner, imgId, commentId, callback) {
    send(
      "DELETE",
      `/api/gallery/${galleryOwner}/images/${imgId}/comments/${commentId}?activeUser=${activeUser}`,
      {},
      (err, res) => {
        if (err) return callback(err, null);
        return callback(null, res);
      }
    );
  };

  // delete all comments by imgId
  module.deleteAllComments = function (activeUser, galleryOwner, imgId, callback) {
    send(
      "DELETE",
      `/api/gallery/${galleryOwner}/images/${imgId}/comments?activeUser=${activeUser}`,
      {},
      (err, res) => {
        if (err) return callback(err, null);
        return callback(null, res);
      }
    );
  };

  // Upvote a comment
  module.upvote = function (galleryOwner, imgId, commentId, callback) {
    send(
      "PATCH",
      `/api/gallery/${galleryOwner}/images/${imgId}/comments/${commentId}`,
      { action: "upvote" },
      (err, res) => {
        if (err) return callback(err, null);
        return callback(null, res);
      }
    );
  };

  // Downvote a comment
  module.downvote = function (galleryOwner, imgId, commentId, callback) {
    send(
      "PATCH",
      `/api/gallery/${galleryOwner}/images/${imgId}/comments/${commentId}`,
      { action: "downvote" },
      (err, res) => {
        if (err) return callback(err, null);
        return callback(null, res);
      }
    );
  };

  return module;
})();
