const express = require('express');
const cors = require('cors');
const app = express();
require('dotenv').config();
const jwt = require('jsonwebtoken');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const port = process.env.PORT || 5000;
require('dotenv').config();


app.use(cors());
app.use(express.json());


const verifyToken = (req, res, next) => {
    const headers = req.headers.authorization;
    if (!headers) {
        return res.status(401).send({ message: 'Unauthorized Access' })
    }
    const token = headers.split(' ')[1]
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
        if (err) {
            return res.status(403).send({ message: 'Access Forbidden' })
        }
        else {
            console.log('decoded', decoded)
            req.decoded = decoded;
            next()
        }
    })

}

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@warehouse.4ef9f.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });


async function run() {
    try {
        await client.connect();
        const serverDisplayCollection = client.db('Warehouse').collection('Display');
        const serverInventoryCollection = client.db('Warehouse').collection('Inventory');
        const serverOrdersCollection = client.db('Warehouse').collection('Orders');

        app.post('/login', async (req, res) => {
            const user = req.body;
            const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {
                expiresIn: '14d'
            })
            res.send({ token })
        })



        //Display Section
        app.get('/bike',  async (req, res) => {
            const query = {};
            const cursor = serverDisplayCollection.find(query);
            const bikes = await cursor.toArray();
            res.send(bikes);
        })

        app.get('/bike/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const bike = await serverDisplayCollection.findOne(query);
            res.send(bike);
        })

        app.put('/bike/:id', async (req, res) => {
            const id = req.params.id;
            const bike = req.body;
            const filter = { _id: ObjectId(id) };
            const options = { upsert: true };
            const newDoc = {
                $set: {
                    quantity: bike.quantity,
                }
            }
            const result = await serverDisplayCollection.updateOne(filter, newDoc, options);
            res.send(result)

        })


        //Inventory Section


        app.post('/inventory', async (req, res) => {
            const bike = req.body;
            const finalResult = await serverInventoryCollection.insertOne(bike);
            res.send(finalResult);
        })


        app.get('/inventory', async (req, res) => {
            const query = {};
            const items = serverInventoryCollection.find(query);
            const finalResult = await items.toArray();
            res.send(finalResult);
        })


        app.delete('/inventory/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const deleteItem = await serverInventoryCollection.deleteOne(query);
            res.send(deleteItem)
        })


        //Order Section

        app.put('/orders/:id', async (req, res) => {
            const id = req.params.id;
            const email = req.query.email;
            const bike = req.body;
            const filter = { _id: ObjectId(id) };
            const options = { upsert: true };
            const newDoc = {
                $set: {
                    name: bike.name,
                    url: bike.url,
                    description: bike.description,
                    supplier: bike.supplier,
                    quantity: bike.quantity,
                    email: bike.email
                }
            }
            const finalResult = await serverOrdersCollection.updateOne(filter, newDoc, options);
            res.send(finalResult)

        })


        app.get('/orders', verifyToken, async (req, res) => {
            const decodedEmail = req.decoded.email;
            const email = req.query.email;
            if (email === decodedEmail) {
                const items = { email: email };
                const cursor = serverOrdersCollection.find(items);
                const finalResult = await cursor.toArray()
                res.send(finalResult);
            }

        })


        app.delete('/orders/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const deleteItem = await serverOrdersCollection.deleteOne(query);
            res.send(deleteItem)
        })

    }
    finally {

    }
}
run().catch(console.dir);



app.get('/', (req, res) => {
    res.send('Khara aitesi');
})

app.listen(port, () => {
    console.log('Paisi tore', port)
})