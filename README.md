# Photopia Web Gallery

<p align="center">
  <img src="https://user-images.githubusercontent.com/41933169/189372336-852b592b-6119-4810-94f5-4b6afbb32180.png" width="800"/>
</p>

## Objective

The objective is to build an web gallery application where users can share pictures and comments different images. The final functionalities of the application are similar to existing web applications such as Facebook, Instagram or Google Photos. 

## How to Run the App

1. Once the repository is cloned, run `npm install` to install all required dependencies.
2. Make sure `.env` is created with the valid `SESSION_SECRET` explained above.
3. Run the app with `node app.js`.

## Session Secret Setup in `.env`

For session secret, create your own `.env` file in the root directory of the project with the variable name `SESSION_SECRET`.

```
SESSION_SECRET="PROVIDE_YOUR_SESSION_SECRET"
```

The provided `SESSION_SECRET` will be used to initialize the session inside `app.js`.

## Main Functionalities

- Frontend UI design with HTML/CSS only
- Upload, browse and delete images
- Leave comments on images
- CRUD API for images and comments (paigination)
- User authentication: sign Up, sign in and sign out
- Authorization and security
- Multiple galleries owned by different users

### Code Organization

- `app.js`: the main file
- `package.json` and `package-lock.json`: the Node.js package file
- `static/`: your frontend developed for assignment 1 (HTML, CSS, Javascript and UI media files)
- `db/`: the NeDB database files
- `uploads/`: the uploaded files
