//importar modelo , existen 2 formas de importar
//const Vacante = require('../models/Vacantes');
//o la otra manera es utilizar las sesiones guardadas en mongoose
const mongoose = require('mongoose');
const Vacante = mongoose.model('Vacante');
//cualquiera de las 2 formas es correcta

const multer = require('multer');
const shortid = require('shortid');

exports.formularioNuevaVacante = (req, res) => {
	res.render('nueva-vacante', {
		nombrePagina: 'Nueva Vacante',
		tagline: 'Llena el formulario y publica tu vacante',
		cerrarSesion: true,
		nombre: req.user.nombre,
		imagen: req.user.imagen,
	});
};

//agregar vacante a la base de datos
exports.agregarVacante = async (req, res) => {
	//console.log(req.body);
	//si no esta habilitado el body parser, el resultado es : undefined
	//el body parser se habilita en index.js
	/*
	Resultado de console.log(req.body);
	{
		titulo: 'NodeJs Developer',
		empresa: 'Nocsys',
		ubicacion: 'Monterrey',
		salario: '800',
		contrato: 'Medio Tiempo',
		descripcion: '<div>Node Js Developer</div>',
		skills: 'Node,jQuery,HTML5,CSS3,CSSGrid,JavaScript,ReactJS,ORM,Sequelize,Mongoose'
	}
	*/

	const vacante = new Vacante(req.body);

	//usuario autor de la vacante
	vacante.autor = req.user._id;

	//Si observamos , skills , aparece como string asi que hay que cambiarla a arreglo
	//crear arreglo de habilidades
	vacante.skills = req.body.skills.split(',');

	/*
	console.log(vacante);
	Resultado nuevo
	{
		salario: '800',
		skills: [ 'Node', 'ReactJS', 'HTML5', 'jQuery', 'CSS3', 'JavaScript' ],
		_id: 5f44c26997a3714b041672db,
		titulo: 'NodeJs Developer',
		empresa: 'Nocsys',
		ubicacion: 'Monterrey',
		contrato: 'Medio Tiempo',
		descripcion: '<div>NodeJs and React Developer&nbsp;</div>',
		candidatos: []
	 }
	 */

	//almacenar en la base de datos
	//si observamos , no existe el campo url
	const nuevaVacante = await vacante.save();
	//despues de guardar , ya debe existir la url, debido a que en el schema , ahi se definio
	//que una vez guardado , se genere el campo url
	//redireccionar
	res.redirect(`/vacante/${nuevaVacante.url}`);
};

//muestra la vacante
exports.mostrarVacante = async (req, res, next) => {
	//console.log(req.params.url);
	const vacante = await Vacante.findOne({ url: req.params.url }).populate(
		'autor'
	);

	//console.log(vacante);

	//si no hay resultados
	if (!vacante) return next();
	//console.log(vacante);

	res.render('vacante', {
		vacante,
		nombrePagina: `Vacante - ${vacante.titulo}`,
		barra: true,
	});
};

exports.formEditarVacante = async (req, res, next) => {
	const vacante = await Vacante.findOne({ url: req.params.url });

	if (!vacante) return next();

	res.render('editar-vacante', {
		vacante,
		nombrepagina: `Editar - ${vacante.titulo}`,
		cerrarSesion: true,
		nombre: req.user.nombre,
		imagen: req.user.imagen,
	});
};

exports.editarVacante = async (req, res) => {
	const vacanteActualizada = req.body;

	//convertir a arreglo el skills
	vacanteActualizada.skills = req.body.skills.split(',');

	const vacante = await Vacante.findOneAndUpdate(
		{ url: req.params.url },
		vacanteActualizada,
		{
			new: true,
			runValidators: true,
		}
	);

	res.redirect(`/vacante/${vacante.url}`);
};

// Validar y Sanitizar los campos de las nuevas vacantes
exports.validarVacante = (req, res, next) => {
	// sanitizar los campos
	req.sanitizeBody('titulo').escape();
	req.sanitizeBody('empresa').escape();
	req.sanitizeBody('ubicacion').escape();
	req.sanitizeBody('salario').escape();
	req.sanitizeBody('contrato').escape();
	req.sanitizeBody('skills').escape();

	// validar
	req.checkBody('titulo', 'Agrega un Titulo a la Vacante').notEmpty();
	req.checkBody('empresa', 'Agrega una Empresa').notEmpty();
	req.checkBody('ubicacion', 'Agrega una Ubicación').notEmpty();
	req.checkBody('contrato', 'Selecciona el Tipo de Contrato').notEmpty();
	req.checkBody('skills', 'Agrega al menos una habilidad').notEmpty();

	const errores = req.validationErrors();

	if (errores) {
		// Recargar la vista con los errores
		req.flash(
			'error',
			errores.map((error) => error.msg)
		);

		res.render('nueva-vacante', {
			nombrePagina: 'Nueva Vacante',
			tagline: 'Llena el formulario y publica tu vacante',
			cerrarSesion: true,
			nombre: req.user.nombre,
			mensajes: req.flash(),
		});
	}

	next(); // siguiente middleware
};

exports.eliminarVacante = async (req, res) => {
	const { id } = req.params;
	const vacante = await Vacante.findById(id);

	//console.log('id : ' + id);
	//console.log('vacante ' + vacante);

	if (verificarAutor(vacante, req.user)) {
		// Todo bien, si es el usuario, eliminar
		vacante.remove();
		res.status(200).send('Vacante Eliminada Correctamente');
	} else {
		// no permitido
		res.status(403).send('Error');
	}
};

const verificarAutor = (vacante = {}, usuario = {}) => {
	if (!vacante.autor.equals(usuario._id)) {
		return false;
	}
	return true;
};

// Subir archivos en PDF
exports.subirCV = (req, res, next) => {
	upload(req, res, function (error) {
		if (error) {
			if (error instanceof multer.MulterError) {
				if (error.code === 'LIMIT_FILE_SIZE') {
					req.flash('error', 'El archivo es muy grande: Máximo 300kb');
				} else {
					req.flash('error', error.message);
				}
			} else {
				req.flash('error', error.message);
			}
			res.redirect('back');
			return;
		} else {
			return next();
		}
	});
};

// Opciones de Multer
const configuracionMulter = {
	limits: { fileSize: 300000 },
	storage: (fileStorage = multer.diskStorage({
		destination: (req, file, cb) => {
			cb(null, __dirname + '../../public/uploads/cv');
		},
		filename: (req, file, cb) => {
			const extension = file.mimetype.split('/')[1];
			cb(null, `${shortid.generate()}.${extension}`);
		},
	})),
	fileFilter(req, file, cb) {
		if (file.mimetype === 'application/pdf') {
			// el callback se ejecuta como true o false : true cuando la imagen se acepta
			cb(null, true);
		} else {
			cb(new Error('Formato No Válido'));
		}
	},
};

const upload = multer(configuracionMulter).single('cv');

// almacenar los candidatos en la BD
exports.contactar = async (req, res, next) => {
	const vacante = await Vacante.findOne({ url: req.params.url });

	// sino existe la vacante
	if (!vacante) return next();

	// todo bien, construir el nuevo objeto
	const nuevoCandidato = {
		nombre: req.body.nombre,
		email: req.body.email,
		cv: req.file.filename,
	};

	// almacenar la vacante
	vacante.candidatos.push(nuevoCandidato);
	await vacante.save();

	// mensaje flash y redireccion
	req.flash('correcto', 'Se envió tu Curriculum Correctamente');
	res.redirect('/');
};

exports.mostrarCandidatos = async (req, res, next) => {
	const vacante = await Vacante.findById(req.params.id);

	if (vacante.autor != req.user._id.toString()) {
		return next();
	}

	if (!vacante) return next();

	res.render('candidatos', {
		nombrePagina: `Candidatos Vacante - ${vacante.titulo}`,
		cerrarSesion: true,
		nombre: req.user.nombre,
		imagen: req.user.imagen,
		candidatos: vacante.candidatos,
	});
};

// Buscador de Vacantes
exports.buscarVacantes = async (req, res) => {
	const vacantes = await Vacante.find({
		$text: {
			$search: req.body.q,
		},
	});

	// mostrar las vacantes
	res.render('home', {
		nombrePagina: `Resultados para la búsqueda : ${req.body.q}`,
		barra: true,
		vacantes,
	});
};
