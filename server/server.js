require('dotenv').config()
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const app = express();

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))
 
// parse application/json
app.use(bodyParser.json())

app.use(require('./routes/routes'));

// Database
const db_port = process.env.DB_PORT || 27017;
const db_host = process.env.DB_HOST || "localhost";
const db_name = process.env.DB_NAME || "test";

mongoose.connect(`mongodb://${db_host}:${db_port}/${db_name}`, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true
}, (err) => {
    if (err) throw err;
    console.log("base de datos ONLINE");
});

// Global Settings
const port = process.env.PORT || 3000

app.listen(port, (err)=>{
    if(err){
        throw new Error("Error in server side");
    }

    console.log("Listening at port "+port);
});

