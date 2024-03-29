require('dotenv').config()
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors')
const app = express();

app.use(cors());
app.options('*', cors());

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
  useUnifiedTopology: true,
  useFindAndModify: false,
  useCreateIndex: true
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

