const mongoose = require('mongoose');
const shortid = require('shortid');
require('dotenv').config({ path: 'variables.env' });

mongoose.connect(process.env.DATABASE, {
	useNewUrlParser: true,
	useUnifiedTopology: true,
});

mongoose.connection.on('error', (error) => {
	console.log(error);
});

//importar los modelos
require('../models/Vacantes');
require('../models/Usuarios');
