let express = require('express');
let mongoose = require('mongoose');
let cors = require('cors');
let fileUpload = require("express-fileupload");
const dotenv = require( "dotenv" )

// Express Route
const apiRoute = require('../src/routes/api.route')

dotenv.config()

const mongoUri = process.env.MONGO_URI || "mongodb://localhost:27017/test";

// Connecting mongoDB Database
mongoose.Promise = global.Promise;
mongoose.connect(mongoUri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useFindAndModify: false
}).then(() => {
  console.log('Database sucessfully connected!')
},
  error => {
    console.log('Could not connect to database : ' + error)
  }
)

const app = express();
app.use(express.json());
app.use(express.urlencoded( { extended: true } ));
app.use(cors());
app.use(express.static("files"));
app.use(fileUpload( {
  useTempFiles : true,
  tempFileDir : '/tmp/'
}))
app.use('/api', apiRoute)

// PORT
const port = process.env.PORT || 4000;
const server = app.listen(port, () => {
  console.log('Connected to port ' + port)
})

// 404 Error
app.use((req, res, next) => {
  res.status(404).send("Sorry can't find that!")
});

app.use(function (err, req, res, next) {
  console.error(err.message);
  if (!err.statusCode) err.statusCode = 500;
  res.status(err.statusCode).send(err.message);
});