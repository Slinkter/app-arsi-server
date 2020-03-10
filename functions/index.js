const functions = require("firebase-functions");
const admin = require("firebase-admin");
admin.initializeApp();

const express = require("express");
const app = express(); // nos ayuda a reducir : exports.getScreams = functions.https........

app.get("/screams", (req, res) => {
  admin
    .firestore()
    .collection("screams")
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

  admin
    .firestore()
    .collection("screams")
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

exports.api = functions.https.onRequest(app);
