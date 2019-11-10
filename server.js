const express = require('express');
const app = express();
var cors = require('cors')
const bodyParser = require('body-parser');
const portfolioRouter = require('./routes/portfolio.router');
const db = require('./config');
const PORT = process.env.PORT || 3000;
const mongoose = require('mongoose')

mongoose.connect(db.MONGO_DB_URI || 'mongodb://localhost/portfolio',
 { useNewUrlParser: true, useUnifiedTopology: true }, (err) => {
     if (err) {
         console.log("error", err)
         process.exit(1);
     }
     console.log("Db Connected Successfully")
 })

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
app.use('/api/portfolio', portfolioRouter);