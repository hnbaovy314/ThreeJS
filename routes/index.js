var express = require('express');
var router = express.Router();

var mongodb = require('mongodb')
var MongoClient = mongodb.MongoClient;
// Connection URL. This is where your mongodb server is running.
var url = 'mongodb://localhost:27017/';

/* GET home page. */

router.get('/', (req, res) => {
   res.sendFile('index.html', {
     root: 'views'
   });
});

router.get('/getE', (req, res) => {
  MongoClient.connect(url, function (err, db) {
    if (err) {
        console.log('Unable to connect to the mongoDB server. Error:', err);
        throw err;
    }
    else
    {
     //HURRAY!! We are connected. :)
     console.log('Connection established to', url);
      var dbo = db.db("chemistry-lab");
      var collection = dbo.collection("elements");
      collection.find({}).toArray((err, result) => {
        if (err) {
          console.log("Error retrieving data");
          throw err;
        }
        res.json(result);
        db.close();
      });


    }
  });
})

module.exports = router;
