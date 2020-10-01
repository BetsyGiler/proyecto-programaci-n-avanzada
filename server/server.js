require('dotenv').config()
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const app = express();

app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,PATCH,OPTIONS');
  next();
});



// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))
 
// parse application/json
app.use(bodyParser.json())

app.use(require('./routes/routes'));

// Database
let connection = process.env.DB_PRO_HOST;

if(!connection){
    const db_port = process.env.DB_PORT;
    const db_host = process.env.DB_HOST;
    const db_name = process.env.DB_NAME;

    connection = process.env.DB_PRO_HOST || `mongodb://${db_host}:${db_port}/${db_name}`;
}

mongoose.connect(connection, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true
}, (err) => {
    if (err) throw err;
    console.log("base de datos ONLINE");
});

// Global Settings
const port = process.env.PORT;

app.listen(port, (err)=>{
    if(err){
        throw new Error("Error in server side");
    }

    console.log("Listening at port "+port);
});

