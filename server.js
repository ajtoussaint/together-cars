const express = require('express');
const cors = require('cors');

const app = express()

app.use(cors());


app.get('/', (req, res) => {
    console.log("req recieved");
    res.send("hello world")
});

app.get('/red', (req,res) => {
    console.log("red requested");
    res.json(["Griff", "Simmons", "Sarge"]);
});

app.get('/blue', (req,res) => {
    console.log("blue requested");
    res.json(["Tucker", "Church", "Caboose"]);
});

const PORT = process.env.PORT || 5000

app.listen(PORT, () =>{
    console.log("App is running, listening on port " + PORT);
})