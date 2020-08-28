const express = require('express');
const router = express.Router();
const homeController = require('../controllers/homeController');
const vacantesController = require('../controllers/vacantesController');
const usuariosController = require('../controllers/usuariosController');
const authController = require('../controllers/authController');

module.exports = () => {
	router.get('/', homeController.mostrarTrabajos);

	//crear vacantes
	router.get(
		'/vacantes/nueva',
		authController.verificarUsuario,
		vacantesController.formularioNuevaVacante
	);

	//guardar vacante
	router.post(
		'/vacantes/nueva',
		authController.verificarUsuario,
		vacantesController.validarVacante,
		vacantesController.agregarVacante
	);

	//mostrar vacante
	router.get('/vacante/:url', vacantesController.mostrarVacante);

	//Editar vacante
	router.get(
		'/vacante/editar/:url',
		authController.verificarUsuario,
		vacantesController.formEditarVacante
	);

	//guardar vacante editada
	router.post(
		'/vacante/editar/:url',
		authController.verificarUsuario,
		vacantesController.validarVacante,
		vacantesController.editarVacante
	);

	// Eliminar Vacantes
	router.delete('/vacantes/eliminar/:id', vacantesController.eliminarVacante);

	//Crear Cuentas
	router.get('/crear-cuenta', usuariosController.formCrearCuenta);
	router.post(
		'/crear-cuenta',
		usuariosController.validarRegistro,
		usuariosController.crearUsuario
	);

	// Autenticar Usuarios
	router.get('/iniciar-sesion', usuariosController.formIniciarSesion);
	router.post('/iniciar-sesion', authController.autenticarUsuario);

	//cerrar sesion
	router.get(
		'/cerrar-sesion',
		authController.verificarUsuario,
		authController.cerrarSesion
	);

	// Resetear password (emails)
	router.get('/reestablecer-password', authController.formReestablecerPassword);
	router.post('/reestablecer-password', authController.enviarToken);

	// Resetear Password ( Almacenar en la BD )
	router.get(
		'/reestablecer-password/:token',
		authController.reestablecerPassword
	);
	router.post('/reestablecer-password/:token', authController.guardarPassword);

	// Panel de administración
	router.get(
		'/administracion',
		authController.verificarUsuario,
		authController.mostrarPanel
	);

	// Editar Perfil
	router.get(
		'/editar-perfil',
		authController.verificarUsuario,
		usuariosController.formEditarPerfil
	);

	router.post(
		'/editar-perfil',
		authController.verificarUsuario,
		//usuariosController.validarPerfil,
		usuariosController.subirImagen,
		usuariosController.editarPerfil
	);

	//recibir mensajes de candidatos
	router.post(
		'/vacantes/:url',
		vacantesController.subirCV,
		vacantesController.contactar
	);

	// Muestra los candidatos por vacante
	router.get(
		'/candidatos/:id',
		authController.verificarUsuario,
		vacantesController.mostrarCandidatos
	);

	//buscador de vacantes
	router.post('/buscador', vacantesController.buscarVacantes);

	return router;
};
