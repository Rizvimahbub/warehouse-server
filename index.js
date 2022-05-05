const express = require('express');
const cors = require('cors');
const app = express();
const { MongoClient, ServerApiVersion } = require('mongodb');
const port = process.env.PORT || 5000;
require('dotenv').config();


app.use(cors());
app.use(express.json());




const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@warehouse.4ef9f.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });


async function run(){
    try{
        await client.connect();
        const serverDisplayCollection = client.db('Warehouse').collection('Display');


        app.get('/bike', async(req, res) => {
            const query = {};
            const cursor = serverDisplayCollection.find(query);
            const bikes = await cursor.toArray();
            res.send(bikes);
        })
    }
    finally{

    }
}
run().catch(console.dir);



app.get('/', (req, res) => {
    res.send('Khara aitesi');
})

app.listen(port, () => {
    console.log('Paisi tore', port)
})