const functions = require("firebase-functions");
const admin = require("firebase-admin");
admin.initializeApp();

// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions
//

exports.helloWorld = functions.https.onRequest((request, response) => {
  response.send("Hello from Consulting ARSI");
});

exports.getScreams = functions.https.onRequest((req, res) => {
  admin
    .firestore()
    .collection("screams")
    .get()
    .then(data => {
      let array_screams = [];
      data.forEach(doc => {
        array_screams.push(doc.data());
      });
      return res.json(array_screams);
    })
    .catch(err => console.error(err));
});

exports.createScream = functions.https.onRequest((req, res) => {
  //
    if (req.method !== 'POST') {
        return res.status(400).json({error: 'se tiene que usar POST :V'})
    }




  const newScream = {
    body: req.body.body,
    userHandle: req.body.userHandle,
    createdAt: admin.firestore.Timestamp.fromDate(new Date())
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
      res.status(500).json({ error: "error al insertar el nuevo documento " });
      console.error(err.message);
    });
});
