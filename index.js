const mongoose = require('mongoose');
require('./config/db');

const express = require('express');
const Handlebars = require('handlebars');
const exphbs = require('express-handlebars');
const path = require('path');
const router = require('./routes');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const bodyParser = require('body-parser');
const expressValidator = require('express-validator');
const flash = require('connect-flash');
const createError = require('http-errors');
const passport = require('./config/passport');

// Import function exported by newly installed node modules.
const {
	allowInsecurePrototypeAccess,
} = require('@handlebars/allow-prototype-access');

//para pasarle variables al paquete connect-mongo  ,se usa la siguiente sintaxis
//es decir , se le pasan los valores de la sesion al store de mongo
const MongoStore = require('connect-mongo')(session);

require('dotenv').config({ path: 'variables.env' });

const app = express();

// validación de campos
app.use(expressValidator());

//habilitar body-parser
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

//habilitar handlebars como engine
app.engine(
	'handlebars',
	exphbs({
		defaultLayout: 'layout',
		helpers: require('./helpers/handlebars'),
		handlebars: allowInsecurePrototypeAccess(Handlebars),
	})
);

app.set('view engine', 'handlebars');

//static files
app.use(express.static(path.join(__dirname, 'public')));

app.use(cookieParser());

app.use(
	session({
		secret: process.env.SECRETO,
		key: process.env.KEY,
		resave: false,
		saveUninitialized: false,
		store: new MongoStore({ mongooseConnection: mongoose.connection }),
	})
);
//nota: 		resave: false, saveUninitialized: false, sirve para no guardar la sesion

app.use(passport.initialize());
app.use(passport.session());

// Alertas y flash messages
app.use(flash());

// Crear nuestro middleware
app.use((req, res, next) => {
	res.locals.mensajes = req.flash();
	next();
});

app.use('/', router());

//404 pagina no existente
app.use((req, response, next) => {
	next(createError(404, 'No Encontrado'));
});

//Administracion de los errores
app.use((error, req, res) => {
	//console.log(error.message);
	res.locals.mensaje = error.message;

	const status = error.status || 500;
	res.locals.status = status;
	res.status(status);

	res.render('error');
});

//Dejar que Heroku asigne el puerto
const host = '0.0.0.0';
const port = process.env.PORT;

app.listen(port, host, () => {
	console.log('El servidor esta funcionando en el puerto : ' + port);
});
