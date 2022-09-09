# Photopia Web Gallery

## Objective

The objective is to build an web application called *The Web Gallery* where users can share pictures and comments only using vanilla JS, HTML and CSS. The final features of the application are similar to existing web applications such as Facebook, Instagram or Google Photos. 

## Project Set Up

1. Once the repository is cloned, run `npm install` to install all required dependencies.
2. Make sure `.env` is created with the valid `SESSION_SECRET` explained above.
3. Run the app with `node app.js`.

#### Session Secret in `.env`

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
