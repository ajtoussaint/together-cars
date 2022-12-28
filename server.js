const express = require('express');

const app = express()

app.get('/', (req, res) => {
    console.log("req recieved");
    res.send("Hello World");
})

const PORT = process.env.PORT || 3000

app.listen(PORT, () =>{
    console.log("App is running, listening on port " + PORT);
})