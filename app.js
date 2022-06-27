/* Import Modules */

const http = require("http");
const express = require("express");
let bodyParser = require("body-parser");
const path = require("path");
const Datastore = require("nedb");
const multer = require("multer");
const fs = require("fs");
let uploads = "./uploads";
const bcrypt = require("bcryptjs");
const session = require("express-session");
const cookie = require("cookie");

/* Create an empty uploads directory if not exists */
if (!fs.existsSync(uploads)) {
  fs.mkdirSync(uploads);
}

/* Configuration */

const PORT = 3000;
const app = express();
app.use(bodyParser.json());

/* Database Setup */

const images = new Datastore({ filename: "db/images.db", autoload: true, timestampData: true });

const comments = new Datastore({
  filename: "db/comments.db",
  autoload: true,
  timestampData: true,
});

const users = new Datastore({ filename: "db/users.db", autoload: true });

const galleries = new Datastore({
  filename: "db/galleries.db",
  autoload: true,
  timestampData: true,
});

/* Multer Setup */

// https://www.youtube.com/watch?v=wIOpe8S2Mk8
const media = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "./uploads");
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  },
});

const upload = multer({ storage: media });

require("dotenv").config();

app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
  })
);

app.use(function (req, res, next) {
  req.username = req.session.user && req.session.user._id ? req.session.user._id : null;
  console.log("HTTP request", req.method, req.url, req.body);
  next();
});

let isAuthenticated = function (req, res, next) {
  if (req.params.galleryOwner !== req.query.activeUser) {
    return res.status(401).json({
      error: {
        message: "Not authorized to perform the task.",
        name: "Access Denied",
        http_status_code: 401,
      },
    });
  }
  next();
};

let Image = (function () {
  return function item(image) {
    this.title = image.body.title;
    this.author = image.body.author;
    this.description = image.body.description;
    this.imageData = image.file;
    this.postedDate = image.body.postedDate;
  };
})();

app.post("/signin", function (req, res, next) {
  let username = req.body.username;
  let password = req.body.password;

  // retrieve user from the database
  users.findOne({ _id: username }, function (err, user) {
    if (err) {
      return res.status(500).json({
        error: {
          message: "Error occurred when finding the registered user",
          name: "Internal Server Error",
          http_status_code: 500,
        },
      });
    }
    if (!user) {
      return res.status(401).json({
        error: {
          message: "Login Failed.\nPlease make sure username and password are correct.",
          name: "Access Denied",
          http_status_code: 401,
        },
      });
    }
    req.session.user = user;

    const hash = user.password;

    bcrypt.compare(password, hash, function (err, result) {
      if (err) {
        return res.status(500).json({
          error: {
            message: "Error occurred when hasing the password",
            name: "Internal Server Error",
            http_status_code: 500,
          },
        });
      }
      // result is true is the password matches the salted hash from the database
      if (!result) {
        return res.status(401).json({
          error: {
            message: "Password doesn't match. Please try again with correct password.",
            name: "Access Denied",
            http_status_code: 401,
          },
        });
      }

      // initialize cookie
      res.setHeader(
        "Set-Cookie",
        cookie.serialize("username", username, {
          path: "/",
          maxAge: 60 * 60 * 24 * 7,
        })
      );
      return res.json(username);
    });
  });
});

app.post("/register", function (req, res, next) {
  let username = req.body.username;
  let password = req.body.password;

  const saltRounds = 10;

  bcrypt.hash(password, saltRounds, function (err, hash) {
    if (err) {
      return res.status(500).json({
        error: {
          message: "Error occurred when hasing the password",
          name: "Internal Server Error",
          http_status_code: 500,
        },
      });
    }
    users.findOne({ _id: username }, function (err, user) {
      if (err) {
        return res.status(500).json({
          error: {
            message: "Error occurred when deleting an image",
            name: "Internal Server Error",
            http_status_code: 500,
          },
        });
      }
      if (user) {
        return res.status(409).json({
          error: {
            message:
              "Same username " + username + " already exists.\nPlease try with different username.",
            name: "Conflict",
            http_status_code: 409,
          },
        });
      }

      users.update(
        { _id: username },
        { _id: username, password: hash },
        { upsert: true },
        function (err) {
          if (err) {
            return res.status(500).json({
              error: {
                message: "Error occurred when inserting a new user",
                name: "Internal Server Error",
                http_status_code: 500,
              },
            });
          }
          // initialize cookie
          res.setHeader(
            "Set-Cookie",
            cookie.serialize("username", username, {
              path: "/",
              maxAge: 60 * 60 * 24 * 7,
            })
          );
          galleries.insert({ _id: username }, (err, doc) => {
            if (err) {
              return res.status(500).json({
                error: {
                  message: "Error occurred when inserting a gallery",
                  name: "Internal Server Error",
                  http_status_code: 500,
                },
              });
            }
            req.session.user = { _id: username, password: hash };
            return res.json(username);
          });
        }
      );
    });
  });
});

app.get("/signout", function (req, res, next) {
  req.session.user = null;
  res.setHeader(
    "Set-Cookie",
    cookie.serialize("username", "", {
      path: "/",
      maxAge: 60 * 60 * 24 * 7, // 1 week in number of seconds
    })
  );
  res.redirect("/");
});

app.get("/api/gallery/", function (req, res, next) {
  let page = parseInt(req.query.page);
  const limit = parseInt(req.query.limit);
  page--;
  galleries
    .find({})
    .sort({ _id: 1 })
    .skip(page * limit)
    .limit(limit)
    .exec((err, docs) => {
      if (err) {
        return res.status(500).json({
          error: {
            message: "Error occurred when getting galleries",
            name: "Internal Server Error",
            http_status_code: 500,
          },
        });
      }
      galleries.count({}, function (err, count) {
        if (err) {
          return res.status(500).json({
            error: {
              message: "Error occurred when counting the total number of galleries",
              name: "Internal Server Error",
              http_status_code: 500,
            },
          });
        }
        const totalCount = count;
        let maxPage = Math.ceil(totalCount / limit);
        let currPage = page + 1;
        let prevPage = currPage - 1 === 0 ? 1 : currPage - 1;
        let nextPage = currPage + 1 > maxPage ? maxPage : currPage + 1;

        res.status(200).json({
          data: docs,
          currPage: currPage,
          nextPage: nextPage,
          prevPage: prevPage,
        });
      });
    });
});

// Create a new image and save the metadata in DB
app.post("/api/gallery/:galleryOwner/images/", upload.single("image"), function (req, res, next) {
  const newImage = new Image(req);
  images.insert(newImage, (err, doc) => {
    if (err) {
      return res.status(500).json({
        error: {
          message: "Error occurred when inserting an image",
          name: "Internal Server Error",
          http_status_code: 500,
        },
      });
    }
    res.status(200).json(doc);
  });
});

app.get("/api/gallery/:galleryOwner/images/", function (req, res, next) {
  let page = parseInt(req.query.page);
  const limit = parseInt(req.query.limit);
  page--;
  images
    .find({ author: req.params.galleryOwner })
    .sort({ createdAt: 1 })
    .skip(page * limit)
    .limit(limit)
    .exec((err, docs) => {
      if (err) {
        return res.status(500).json({
          error: {
            message: "Error occurred when getting images",
            name: "Internal Server Error",
            http_status_code: 500,
          },
        });
      }
      images.count({ author: req.params.galleryOwner }, function (err, count) {
        if (err) {
          return res.status(500).json({
            error: {
              message: "Error occurred when counting the total number of images",
              name: "Internal Server Error",
              http_status_code: 500,
            },
          });
        }
        const totalCount = count;
        let maxPage = totalCount;
        let currPage = page + 1;
        let prevPage = currPage - 1 === 0 ? 1 : currPage - 1;
        let nextPage = currPage + 1 > maxPage ? maxPage : currPage + 1;
        res.status(200).json({
          data: docs,
          currPage: currPage,
          nextPage: nextPage,
          prevPage: prevPage,
          lastPage: maxPage,
        });
      });
    });
});

// Get a specific image by id
app.get("/api/gallery/:galleryOwner/images/:imgId", function (req, res, next) {
  images.find({ _id: req.params.imgId }, (err, doc) => {
    if (err)
      return res.status(500).json({
        error: {
          message: "Error occurred when getting an image",
          name: "Internal Server Error",
          http_status_code: 500,
        },
      });
    if (doc == null || doc.length === 0) {
      return res.status(404).json({
        error: {
          message: "There is no image with the given imgId",
          name: "Not Found",
          http_status_code: 404,
        },
      });
    } else {
      let currImg = doc[0].imageData;
      res.setHeader("Content-Type", currImg.mimetype);
      res.sendFile(__dirname + "/" + currImg.path);
    }
  });
});

// Delete a image by id
app.delete("/api/gallery/:galleryOwner/images/:imgId", isAuthenticated, (req, res, next) => {
  images.remove({ _id: req.params.imgId }, (err, docRemoved) => {
    if (err) {
      return res.status(500).json({
        error: {
          message: "Error occurred when deleting an image",
          name: "Internal Server Error",
          http_status_code: 500,
        },
      });
    }
    if (docRemoved == null) {
      return res.status(404).json({
        error: {
          message: "There is no image with the given imgId",
          name: "Not Found",
          http_status_code: 404,
        },
      });
    } else {
      res.status(200).json(docRemoved);
    }
  });
});

let Comment = (function () {
  return function item(req) {
    this.imgId = req.body.imgId;
    this.galleryOwner = req.body.galleryOwner;
    this.username = req.body.author;
    this.content = req.body.content;
    this.upvote = 0;
    this.downvote = 0;
    this.postedDate = req.body.postedDate;
  };
})();

// Create a comment
app.post("/api/gallery/:galleryOwner/images/:imgId/comments", (req, res, next) => {
  const newComment = new Comment(req);
  comments.insert(newComment, (err, newDoc) => {
    if (err)
      return res.status(500).json({
        error: {
          message: "Error occurred when creating a comment",
          name: "Internal Server Error",
          http_status_code: 500,
        },
      });
    res.status(200).json(newDoc);
  });
});

// Get all comments
app.get("/api/gallery/:galleryOwner/images/:imgId/comments", function (req, res, next) {
  let page = parseInt(req.query.page);
  const limit = parseInt(req.query.limit);
  page--;
  comments
    .find({ galleryOwner: req.params.galleryOwner, imgId: req.params.imgId })
    .sort({ createdAt: -1 })
    .skip(page * limit)
    .limit(limit)
    .exec((err, docs) => {
      if (err)
        return res.status(500).json({
          error: {
            message: "Error occurred when paginating comments",
            name: "Internal Server Error",
            http_status_code: 500,
          },
        });
      comments.count(
        { galleryOwner: req.params.galleryOwner, imgId: req.params.imgId },
        function (err, count) {
          if (err)
            return res.status(500).json({
              error: {
                message: "Error occurred when counting the total number of comments",
                name: "Internal Server Error",
                http_status_code: 500,
              },
            });
          const totalCount = count;
          let maxPage = Math.ceil(totalCount / limit);
          let currPage = page + 1;
          let prevPage = currPage - 1 === 0 ? 1 : currPage - 1;
          let nextPage = currPage + 1 > maxPage ? maxPage : currPage + 1;
          res.status(200).json({
            data: docs,
            currPage: currPage,
            nextPage: nextPage,
            prevPage: prevPage,
            currCount: docs.length,
            totalCount: totalCount,
          });
        }
      );
    });
});

// Delete a comment
app.delete(
  "/api/gallery/:galleryOwner/images/:imgId/comments/:commentId",
  isAuthenticated,
  (req, res, next) => {
    comments.remove({ _id: req.params.commentId }, {}, (err, commentRemoved) => {
      if (err)
        return res.status(500).json({
          error: {
            message: "Error occurred when deleting a comment",
            name: "Internal Server Error",
            http_status_code: 500,
          },
        });
      res.status(200).json(commentRemoved);
    });
  }
);

// Delete all comments based on imageId
app.delete(
  "/api/gallery/:galleryOwner/images/:imgId/comments",
  isAuthenticated,
  (req, res, next) => {
    comments.remove({ imgId: req.params.imgId }, { multi: true }, (err, numRemoved) => {
      if (err)
        return res.status(500).json({
          error: {
            message: "Error occurred when deleting comments",
            name: "Internal Server Error",
            http_status_code: 500,
          },
        });
      res.status(200).json(numRemoved);
    });
  }
);

// Update a comment with upvote/downvote
app.patch(
  "/api/gallery/:galleryOwner/images/:imgId/comments/:commentId",
  function (req, res, next) {
    if (req.body.action === "upvote")
      comments.update(
        { _id: req.params.commentId },
        { $inc: { upvote: 1 } },
        {},
        (err, numReplaced) => {
          if (err)
            return res.status(500).json({
              error: {
                message: "Error occurred when upvoting a comment",
                name: "Internal Server Error",
                http_status_code: 500,
              },
            });
          res.status(200).json(numReplaced);
        }
      );
    if (req.body.action === "downvote")
      comments.update(
        { _id: req.params.commentId },
        { $inc: { downvote: 1 } },
        {},
        (err, numReplaced) => {
          if (err)
            return res.status(500).json({
              error: {
                message: "Error occurred when downvoting a comment",
                name: "Internal Server Error",
                http_status_code: 500,
              },
            });
          res.status(200).json(numReplaced);
        }
      );
  }
);

app.use(express.static("static"));

http.createServer(app).listen(PORT, function (err) {
  if (err) return err;
  else console.log("HTTP server on http://localhost:%s", PORT);
});
