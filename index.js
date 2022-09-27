/* importing modules */
const express = require('express');
const bodyParser = require('body-parser');

/* importing files */
const config = require('./config/config');
const connection = require('./db/connection');
const Routes = require('./routes');


/* setting app middelwares */
const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(Routes);

/* setting connection to mongodb atlas database */
connection.connect().then((connected) => {

    app.listen(config.PORT || 3000, (err) => {

        if (err) throw err;

        else console.log(`App Running on port ${config.PORT || 3000}`);
    });

    console.log(connected);

}).catch((error) => {

    console.log("Database Connection Error:", error);

});