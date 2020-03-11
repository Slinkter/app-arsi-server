const functions = require("firebase-functions");
const admin = require("firebase-admin");
const app = require("express")(); // nos ayuda a reducir : exports.getScreams = functions.https........
admin.initializeApp();
//
const firebaseConfig = {
  apiKey: "AIzaSyBg2JtziH1dFOKyDBzP8cknyVxxsEapOWg",
  authDomain: "consultingarsiapp.firebaseapp.com",
  databaseURL: "https://consultingarsiapp.firebaseio.com",
  projectId: "consultingarsiapp",
  storageBucket: "consultingarsiapp.appspot.com",
  messagingSenderId: "123916925541",
  appId: "1:123916925541:web:8a2a04122ab8c635af648c",
  measurementId: "G-WM31VMNJEQ"
};
const firebase = require("firebase");
firebase.initializeApp(firebaseConfig);

const db = admin.firestore();
//
app.get("/screams", (req, res) => {
  db.collection("screams")
    //.orderBy('createdat','desc')
    .get()
    .then(data => {
      let array_screams = [];
      // cuando solo uso doc.data() solo me muestra el conjunto sin ID
      // esta esta nueva , se obtiene screamID,body,userHandle,createdAt juntos
      // en una sola respuesta array_screams
      //
      // cuando se agregar un ordeBy , se crea un index en firebase
      data.forEach(doc => {
        array_screams.push({
          screamId: doc.id,
          body: doc.data().body,
          userHandle: doc.data().userHandle,
          createdAt: doc.data().createdAt
        });
      });
      return res.json(array_screams);
    })
    .catch(err => console.error(err));
});

// creo q es la ruta para enviar o nombre de la ruta para
// enviar eso ... http:qwe.com/api/scream
app.post("/scream", (req, res) => {
  //
  if (req.method !== "POST") {
    return res.status(400).json({ error: "se tiene que usar POST :V" });
  }

  const newScream = {
    body: req.body.body,
    userHandle: req.body.userHandle,
    createdAt: new Date().toISOString()
  };

  db.collection("screams")
    .add(newScream)
    .then(doc => {
      res.json({
        message: `el documentos con el id : ${doc.id} fue creado con existo`
      });
    })
    .catch(err => {
      res.status(500).json({
        error: "error al insertar el nuevo documento ",
        message: err.message
      });
      console.error(err.message);
      console.log(err);
    });
});

app.post("/signup", (req, res) => {
  const newUser = {
    email: req.body.email,
    password: req.body.password,
    confirmPassword: req.body.confirmPassword,
    handle: req.body.handle
  };

  //Validation
  let token, userId;
  db.doc(`/users/${newUser.handle}`)
    .get()
    .then(doc => {
      if (doc.exists) {
        return res
          .status(400)
          .json({ handle: "Ya existe el mismo handle ", message: doc.message });
      } else {
        return firebase
          .auth()
          .createUserWithEmailAndPassword(newUser.email, newUser.password);
      }
    })
    .then(data => {
      userId = data.user.uid;
      return data.user.getIdToken();
    })
    .then(token => {
      token = token;
      const userCredentials = {
        handle: newUser.handle,
        email: newUser.email,
        createdAt: new Date().toISOString(),
        userId
      };

      db.doc(`/users/${newUser.handle}`).set(userCredentials)

    })
    .catch(error => {
      console.error(error);
      if (error.code === "auth/email-already-in-use") {
        return res.status(400).json({ email: "El correo ya esta registrado" });
      } else {
        return res
          .status(500)
          .json({ error: error.code, message: error.message });
      }
    });

  //   firebase
  //     .auth()
  //     .createUserWithEmailAndPassword(newUser.email, newUser.password)
  //     .then(data => {
  //       return res
  //         .status(201)
  //         .json({ message: `usuario creado con el id ${data.user.uid}` });
  //     })
  //     .catch(error => {
  //       return res
  //         .status(500)
  //         .json({ error: error.code, message: error.message  });
  //     });
});

exports.api = functions.https.onRequest(app);
