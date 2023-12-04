const express = require('express');
const app = express()
const cors = require('cors')
const jwt = require('jsonwebtoken');
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

    // jwt related api
    app.post('/jwt', async (req, res) => {
      const user = req.body;
      const token = jwt.sign(user, process.env.ACCESS_TOKEN_SEC, { expiresIn: '1h' })
      res.send({ token });
    })
    // console.log(process.env.ACCESS_TOKEN_SEC)

    const verifyToken = (req, res, next) => {
      console.log('inside verify token', req.headers);
      if (!req.headers.authorization) {
        return res.status(401).send.status({ message: 'forbidden access' });
      }
      const token = req.headers.authorization.split(' ')[1];
      jwt.verify(token, process.env.ACCESS_TOKEN_SEC, (err, decoded) =>{
        if(err){
          return res.status(401).send({message: 'forbidden access'})
        }
        req.decoded = decoded;
        next();
      })
      
    }


    // use verify admin after token
    const verifyAdmin = async( req, res, next) => {
       const email = req.decoded.email;
       const query = {email: email};
       const user = await userCollection.findOne(query);
       const isAdmin = user?.role === 'admin';
       if(!isAdmin){
        return res.status(403).send({message: 'forbidden access'})
       }
       next();
    }

    // users related api
    app.get('/users', verifyToken, verifyAdmin, async (req, res) => {
      const result = await userCollection.find().toArray();
      res.send(result);
    })

    
    app.get('/users/admin/:email', verifyToken, async (req, res) => {
      const email = req.params.email;

      if (email !== req.decoded.email) {
        return res.status(403).send({ message: 'forbidden access' })
      }

      const query = { email: email };
      const user = await userCollection.findOne(query);
      let admin = false;
      if (user) {
        admin = user?.role === 'admin';
      }
      res.send({ admin });
    })


    app.post('/users', async (req, res) => {
      const user = req.body;
      // 
      const query = { email: user.email }
      const existingUser = await userCollection.findOne(query);
      if (existingUser) {
        return res.send({ message: 'user already exists', insertedId: null })
      }
      const result = await userCollection.insertOne(user);
      res.send(result);
    })

    app.patch('/users/admin/:id', verifyToken, verifyAdmin, async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const updateDoc = {
        $set: {
          role: 'admin'
        }
      }
      const result = await userCollection.updateOne(filter, updateDoc);
      res.send(result)
    })

    app.delete('/users/:id', verifyToken, verifyAdmin, async (res, req) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) }
      const result = await userCollection.deleteOne(query);
      res.send(result);
    })

    // Camps api
    app.get('/camps', async (req, res) => {
      const result = await campCollection.find().toArray();
      res.send(result);
    })

    app.post('/camps', verifyToken, verifyAdmin, async (req, res) => {
      const camp = req.body;
      const result = await campCollection.insertOne(camp);
      res.send(result);
    })
    
    // id
    app.get('/camps/:id', async(req, res) => {
      const id = req.params.id;
      const query = {_id: new ObjectId(id)}
      const result = await campCollection.findOne(query);
      res.send(result);
    })

    app.patch('/camps/:id', async(req, res) => {
      const camp = req.body;
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) }
      const updateDoc = {
        $set: {
          campName: camp.campName,
          campFees: camp.campFees,
          date: camp.date,
          details: camp.details,
          location: camp.location,
          time: camp.time,
          image: camp.image,
        }
      }
      const result = await campCollection.updateOne(filter, updateDoc)
      res.send(result)

    })

    app.delete('/camps/:id',verifyToken, verifyAdmin, async (req,res) =>{
      const id = req.params.id;
      const query = { _id: new ObjectId(id) }
      const result = await campCollection.deleteOne(query);
      res.send(result)
    })

    app.get('/reviews', async (req, res) => {
      const result = await reviewCollection.find().toArray();
      res.send(result);
    })

    app.get('/healthCare', async (req, res) => {
      const result = await healthCareCollection.find().toArray();
      res.send(result);
    })

    // carts collection
    app.get('/carts', async (req, res) => {
      const email = req.query.email;
      const query = { email: email };
      const result = await CartCollection.find(query).toArray();
      res.send(result);
    });

    app.post('/carts', async (req, res) => {
      const cartItem = req.body;
      const result = await CartCollection.insertOne(cartItem);
      res.send(result)
    })

    // 
    app.delete('/carts/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) }
      const result = await CartCollection.deleteOne(query);
      res.send(result);
    })


   

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