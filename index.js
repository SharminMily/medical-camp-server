const express = require('express');
const app = express()
const cors = require('cors')
require('dotenv').config()
const port = process.env.PORT || 5000;

// middleware
app.use(cors());
app.use(express.json());


const { MongoClient, ServerApiVersion } = require('mongodb');
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
    await client.connect();

    const campCollection = client.db("medicalCampDb").collection("camps");
    const reviewCollection = client.db("medicalCampDb").collection("reviews");
    const healthCareCollection = client.db("medicalCampDb").collection("healthCare");
    
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

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
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