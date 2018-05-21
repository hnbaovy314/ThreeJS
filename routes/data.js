var mongodb = require('mongodb')

var MongoClient = mongodb.MongoClient;
// Connection URL. This is where your mongodb server is running.
var url = 'mongodb://localhost:27017/chemistry-lab';

function getAllElements(){
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
      elements = collection.find({}, (err) => {
        if (err){
          throw err;
        }
      }).sort({z:1});
      return elements;
      db.close();
    }
  });
}
function getElementByZ(atomicNumber){
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
      elements = collection.findOne({z:atomicNumber}, (err) => {
        if (err){
          throw err;
        }
      });
      if (elements){
        return elements;
      }
      else {
        return null;
      }
      db.close();
    }
  });
}

module.exports.getAllElements = getAllElements;
module.exports.getElementByZ = getElementByZ;
