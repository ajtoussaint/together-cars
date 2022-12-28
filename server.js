const express = require('express');

const app = express()

//copy from DebtManager/Express Test
//no, thats not it

app.get('/', (req, res) => {
    console.log("req recieved");
    res.send("hello world")
})

const PORT = process.env.PORT || 3000

app.listen(PORT, () =>{
    console.log("App is running, listening on port " + PORT);
})