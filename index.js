const express = require('express')
const cors = require('cors')
require('dotenv').config()
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const app = express()
const port = process.env.PORT || 5000


// middleware
app.use(cors())
app.use(express.json())


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.hgznyse.mongodb.net/?retryWrites=true&w=majority`;
console.log(uri);

const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

async function run() {
    try {
        await client.connect();

        // Connect to the "insertDB" database and access its "haiku" collection
        const coffeeCollection = client.db("coffeeDB");
        const coffee = coffeeCollection.collection("coffee");

        const userCollection = client.db("coffeeDB").collection("user")

        // get data from database
        app.get('/coffee', async (req, res) => {
            const cursor = coffee.find();
            const result = await cursor.toArray();
            res.send(result);
        })

        // post data to the client slide
        app.post('/coffee', async (req, res) => {
            const newCoffee = req.body;
            console.log(newCoffee);
            const result = await coffee.insertOne(newCoffee);
            res.send(result);
        })

        // delete
        app.delete('/coffee/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };
            const result = await coffee.deleteOne(query);
            res.send(result)
        })

        // update
        app.get('/coffee/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };
            const result = await coffee.findOne(query);
            res.send(result)
        })

        app.put('/coffee/:id', async (req, res) => {
            const id = req.params.id;
            const filter = { _id: new ObjectId(id) };
            const options = { upsert: true };
            const updateCoffee = req.body;
            const coffees = {
                $set: {
                    name: updateCoffee.name,
                    chef: updateCoffee.chef,
                    supplier: updateCoffee.supplier,
                    details: updateCoffee.details,
                    test: updateCoffee.test,
                    category: updateCoffee.category,
                    photo: updateCoffee.photo
                }
            }
            const result = await coffee.updateOne(filter, coffees, options);
            res.send(result)
        })

        // user related aip
        app.get('/user', async (req, res) => {
            const cursor = userCollection.find();
            const users = await cursor.toArray();
            res.send(users);
        })

        app.post('/user', async (req, res) => {
            const user = req.body;
            console.log(user);
            const result = await userCollection.insertOne(user);
            res.send(result);
        })

        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
    }
}
run().catch(console.dir);


app.get('/', (req, res) => {
    res.send('Your server is ready !')
})

app.listen(port, () => {
    console.log(`Server is on port ${port}`)
})