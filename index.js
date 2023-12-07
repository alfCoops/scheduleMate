var PORT=process.env.PORT || 5000;
const express = require('express');
const path = require("path");
const routes = require("./routes/routes.js");
const app = express();
const session = require('express-session');
var bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

//define directory to public folder
const publicDirectory = path.join(__dirname, './public'); 
app.use(express.static(publicDirectory));
app.use(session({
    secret:'sectret'
}))

//Middlewhere to use JSON
app.use(express.urlencoded({extended:true}));
app.use(express.json());  
app.use(cookieParser());

app.use(bodyParser.json()); // for parsing application/json
app.use(bodyParser.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded

//Define Routes
app.use("/",routes);


app.listen(PORT,()=>{
    console.log("server started on port 5000");
})