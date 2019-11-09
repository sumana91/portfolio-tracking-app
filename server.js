const express = require('express');
const app = express();
var cors = require('cors')
//let router = express.Router();
const bodyParser = require('body-parser');
const tradeRouter = require('./routes/trade.router');
//const db = require('./app/config/mongodb.env.js');
const PORT = process.env.PORT || 6000;
const mongoose = require('mongoose')

mongoose.connect('mongodb://localhost/portfolio', { useNewUrlParser: true, useUnifiedTopology: true })
var db = mongoose.connection;

// Added check for DB connection
if(!db)
    console.log("Error connecting db")
else
    console.log("Db connected successfully")

//mongoose.connect('mongodb://localhost/portfolio', { useNewUrlParser: true }, { useUnifiedTopology: true })

// cors middleware added
app.use(cors());

//body parser middleware added
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.listen(PORT, function(){
   console.log('Server is running on Port',PORT);
});

app.get('/', function (req, res) {
     res.sendFile(process.cwd() + '/views/index.html');
});

// Setup router for http rest routes
app.use('/api/portfolio', tradeRouter)