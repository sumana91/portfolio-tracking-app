const express = require('express');
const app = express();
const cors = require('cors')
const bodyParser = require('body-parser');
const portfolioRouter = require('./routes/portfolio.router');
const db = require('./config');
const PORT = process.env.PORT || 3000;
const mongoose = require('mongoose')

if (process.env.NODE_ENV !== "test") {
    mongoose.connect(db.MONGO_DB_URI || 'mongodb://localhost/portfolio',
        { useNewUrlParser: true, useUnifiedTopology: true }, (err) => {
            if (err) {
                console.log("error", err)
                process.exit(1);
            }
            console.log("Db Connected Successfully")
            app.listen(PORT, function () {
                console.log('Server is running on Port', PORT);
            });
        });
}

// cors middleware added
app.use(cors());

//body parser middleware added
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

//Sample Index view page for the application
app.get('/', function (req, res) {
    res.sendFile(process.cwd() + '/views/index.html');
});

//Setup router for http rest routes
app.use('/api/portfolio', portfolioRouter);

process
    .on('exit', () => server.close(() => console.log('Process terminated')))
    .on('SIGTERM', () => server.close(() => console.log('Process terminated')));

module.exports = app
