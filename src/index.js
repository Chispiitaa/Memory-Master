//Requerimos el framework de express
const express = require("express");


//modulo de MySQL
const mysql = require("mysql");
const myConnection = require("express-myconnection");

//modulo de express
const session = require("express-session");

//usaremos path para unir directorios
const path = require("path");

//usaremos morgan para los middlewares
const morgan = require("morgan");

//usamos el framework
const app = express();

const bodyParser = require("body-parser");
var urlencodedParser = bodyParser.urlencoded({ extended: false });

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

//conectar a mysql
var db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "root1234",
  port: "3306",
  database: "memorymaster",
});

db.connect((err) => {
  if (err) {
    console.log("Database Connection Failed!!!", err);
  } else {
    console.log("Conectado con la base");
  }
});

//utilizamos la sesion
app.use(
  session({
    secret: "cat23",
    resave: false,
    saveUninitialized: true,
  })
);

app.use(express.static(path.join(__dirname, '/public')));

app.get("/", (req, res) => {
  res.sendFile('index.html', {root: 'public'});
});


app.post('/registrar', urlencodedParser, function (req, res) {
  console.log("Im here");
  console.log(req.body.name);
  console.log(req.body.appat);
  console.log(req.body.apmat);
  console.log(req.body.user);
  console.log(req.body.password);
  db.connect(function (err) {
      console.log("connected");
      let sql = "INSERT INTO `usuario` (`nombre`, `appat`, `apmat`, `user`, `password`) VALUES ('" + req.body.name + "', '" + req.body.appat + "', '" + req.body.apmat + "', '" + req.body.user + "', '" + req.body.password + "')";
      db.query(sql, function (err, result) {
          if(err){
            res.json(err);
          };
        console.log("Añadido");
      });
  });
  res.sendFile(__dirname + "/public/login.html");
});

//funcion para el inicio de sesion
app.post('/auth', function(request, response) {
	var username = request.body.username;
	var password = request.body.password;
	if (username && password) {
		db.query(`SELECT * FROM usuario WHERE user = ? AND password = ?`, [username, password], function(error, results, fields) {
			if (results.length > 0) {
				request.session.loggedin = true;
				request.session.username = username;
				response.redirect("/menu.html");
			} else {
				response.send('Incorrect Username and/or Password!');
			}			
			response.end();
		});
	} else {
		response.send('Please enter Username and Password!');
		response.end();
	}
});


//funcion para registrar al usuario

//establecemos el servidor
app.set("port", process.env.PORT || 3000);

//configurar los middlewares se ejecutan antes de que vengan las peticiones del cliente
//vamos registrar las peticiones que llegan antes de procesarlas
app.use(morgan("dev"));

//Inicializamos el servidor
app.listen(app.get("port"), () => {
  console.log(`Servidor escuchando desde el puerto  ${app.get("port")}`);
});