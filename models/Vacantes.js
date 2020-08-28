const mongoose = require('mongoose');
mongoose.Promise = global.Promise;
const slug = require('slug');
const shortid = require('shortid');

//Schema
const vacanteSchema = new mongoose.Schema({
	titulo: {
		type: String,
		required: 'El nombre de la vacante es obligatorio',
		trim: true,
	},
	empresa: {
		type: String,
		trim: true,
	},
	ubicacion: {
		type: String,
		trim: true,
		required: 'La ubicacion es obligatoria',
	},
	salario: {
		type: String,
		default: 0,
		trim: true,
	},
	contrato: {
		type: String,
	},
	descripcion: {
		type: String,
		trim: true,
	},
	url: {
		type: String,
		lowercase: true,
	},
	skills: [String],
	candidatos: [
		{
			nombre: String,
			email: String,
			cv: String,
		},
	],
	autor: {
		type: mongoose.Schema.ObjectId,
		ref: 'Usuarios',
		required: 'El autor es obligatorio',
	},
});

vacanteSchema.pre('save', function (next) {
	//crear la url
	const url = slug(this.titulo);
	this.url = `${url}-${shortid.generate()}`;

	next();
});

//crear un indice para mejor funcionamiento de las busquedas
vacanteSchema.index({ titulo: 'text' });

module.exports = mongoose.model('Vacante', vacanteSchema);

//Finalmente hay que importar los modelos en db.js
