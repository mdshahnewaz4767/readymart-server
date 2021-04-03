const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const MongoClient = require('mongodb').MongoClient;
const ObjectId = require('mongodb').ObjectId;
require('dotenv').config()

const app = express();

app.use(cors());
app.use(bodyParser.json());
const port = 5000;


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.mkcgo.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
client.connect(err => {
  const productsCollection = client.db("readyMart").collection("products");
  const ordersCollection = client.db("readyMart").collection("orders");
  
  //insert product data
  app.post('/addProduct', (req, res) => {
    const product = req.body;
    productsCollection.insertOne(product)
    .then(result => {
      console.log('inserted count', result.insertedCount);
      res.send(result.insertedCount > 0);
    })
  })

  //read product data
  app.get('/products', (req, res) => {
    productsCollection.find({})
    .toArray( (err, documents) => {
      res.send(documents);
    })
  })

  //single product data
  app.get('/product/:id', (req, res) => {
    productsCollection.find({_id: ObjectId(req.params.id)})
    .toArray( (err, documents) => {
      res.send(documents[0]);
    })
  })

  //insert order data
  app.post('/addOrder', (req, res) => {
    const order = req.body;
    ordersCollection.insertOne(order)
    .then(result => {
      console.log(result.insertedCount);
      res.send(result.insertedCount > 0);
    })
  })

  //read order data
  app.get('/orders', (req, res) => {
    ordersCollection.find({email: req.query.email})
    .toArray( (err, documents) => {
      res.send(documents);
    })
  })

  //delete product data
  app.delete('/deleteProduct/:id', (req, res) => {
    const id = ObjectId(req.params.id);
    console.log('delete this', id);
    productsCollection.findOneAndDelete({_id: id})
    .then(documents => res.send(!!documents.value))
  })

  //update data
  app.patch('/update/:id', (req, res) => {
    productsCollection.updateOne({_id: ObjectId(req.params.id)}, 
      {
        $set: {name: req.body.name, weight: req.body.weight, price: req.body.price}
      }
    )
    .then(result => {
      res.send(result.modifiedCount > 0);
    })
  })

});


app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.listen(process.env.PORT || port)