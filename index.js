const express = require('express');
const app = express()
const cors = require('cors')
require('dotenv').config()
const port = process.env.PORT || 5000;

// middleware
app.use(cors({
  origin: [
  'http://localhost:5173',
  'medical-camp-32574.web.app',
  'medical-camp-32574.firebaseapp.com'
  
],
  credentials: true
}));
app.use(express.json());


const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.jzgy2jc.mongodb.net/?retryWrites=true&w=majority`;
// console.log(uri)
// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    // await client.connect();

    const userCollection = client.db("medicalCampDb").collection("users");
    const campCollection = client.db("medicalCampDb").collection("camps");
    const reviewCollection = client.db("medicalCampDb").collection("reviews");
    const healthCareCollection = client.db("medicalCampDb").collection("healthCare");
    const CartCollection = client.db("medicalCampDb").collection("carts");

    // users related api
    app.get('/users', async(req, res)=> {
      const result = await userCollection.find().toArray();
      res.send(result);
    })

    app.post('/users', async (req, res) => {
      const user = req.body;
      // 
      const query = {email: user.email}
      const existingUser = await userCollection.findOne(query);
      if(existingUser){
        return res.send({message: 'user already exists', insertedId: null}) 
      }
      const result = await userCollection.insertOne(user);
      res.send(result);
    })

    
    app.get('/camps', async(req, res) => {
        const result = await campCollection.find().toArray();
        res.send(result);
    })

    app.get('/reviews', async(req, res) => {
        const result = await reviewCollection.find().toArray();
        res.send(result);
    })

    app.get('/healthCare', async(req, res) => {
        const result = await healthCareCollection.find().toArray();
        res.send(result);
    })

    // carts collection
    app.get('/carts', async(req, res) => {
      const email = req.query.email;
      const query = {email: email};
      const result = await CartCollection.find(query).toArray();
      res.send(result);
    });

    app.post('/carts', async(req, res)=> {
      const cartItem = req.body;
      const result = await CartCollection.insertOne(cartItem);
      res.send(result)
    } )

    // 
    app.delete('/carts/:id', async(req, res) => {
      const id = req.params.id;
      const query = {_id: new ObjectId(id)}
      const result = await CartCollection.deleteOne(query);
      res.send(result);
    })

 
  //   app.post('/camps', async(req, res) => {
  //     const result = await campCollection.find().toArray();
  //     res.send(result);
  // })
  //   app.delete('/camps', async(req, res) => {
  //     const result = await campCollection.find().toArray();
  //     res.send(result);
  // })

    // Send a ping to confirm a successful connection

    // await client.db("admin").command({ ping: 1 });
    // console.log("Pinged your deployment. You successfully connected to MongoDB!");

  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);


app.get('/', (req, res) => {
    res.send('medical camp management is setting')
})

app.listen(port, () => {
    console.log(`medical camp is sitting in port ${port}`)
})