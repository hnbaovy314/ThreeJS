var express = require('express');
var router = express.Router();

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
});

router.get('/getP', (req, res) => {
    MongoClient.connect(url, function (err, db) {
        if (err) {
            console.log('Unable to connect to the mongoDB server. Error:', err);
            throw err;
        }
        else
        {
            //HURRAY!! We are connected. :)
            console.log('Connection has been established to', url);
            var dbo = db.db("chemistry-lab");
            var collection = dbo.collection("element-prop");

            collection.find({name: req.query.property}).toArray((err, result) => {
                if (err) {
                    console.log("Error retrieving data");
                    throw err;
                }
                if (result){
                    res.json(result[0].value);
                }
                else {
                    res.send('property not found');
                }

                db.close();
            });


        }
    });
});

router.get('/getCT', (req, res) => {
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
        var collection = dbo.collection("crystalStructure");
        collection.findOne({id: req.query.id}, (err, result) => {
          if (err) {
            console.log("Error retrieving data");
            throw err;
          }

          res.json(result);
          db.close();
        });
      }
    });
});

router.get('/getCat', (req, res) => {
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
        var collection = dbo.collection("categories");
        collection.findOne({id: req.query.id}, (err, result) => {
          if (err) {
            console.log("Error retrieving data");
            throw err;
          }

          res.json(result);
          db.close();
        });
      }
    });
});

router.get('/getCN', (req, res) => {
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
        var collection = dbo.collection("categories");
        collection.findOne({id: req.query.id}, {_id: 0, name: 1, nameEn: 1}, (err, result) => {
          if (err) {
            console.log("Error retrieving data");
            throw err;
          }

          res.json(result);
          db.close();
        });
      }
    });
});

module.exports = router;
