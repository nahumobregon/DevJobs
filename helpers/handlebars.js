module.exports = {
	seleccionarSkills: (seleccionadas = [], opciones) => {
		const skills = [
			'HTML5',
			'CSS3',
			'CSSGrid',
			'Flexbox',
			'JavaScript',
			'jQuery',
			'Node',
			'Angular',
			'VueJS',
			'ReactJS',
			'React Hooks',
			'Redux',
			'Apollo',
			'GraphQL',
			'TypeScript',
			'PHP',
			'Laravel',
			'Symfony',
			'Python',
			'Django',
			'ORM',
			'Sequelize',
			'Mongoose',
			'SQL',
			'MVC',
			'SASS',
			'WordPress',
		];

		let html = '';
		skills.forEach((skill) => {
			html += `<li ${
				seleccionadas.includes(skill) ? 'class="activo"' : ''
			}>${skill}</li>`;
		});

		return (opciones.fn().html = html);
	},
	tipoContrato: (seleccionado, opciones) => {
		//console.log(seleccionado);
		// Freelance
		//console.log(opciones.fn());
		/*
                     <option value="" disabled selected>-- Selecciona --</option>
                     <option value="Freelance">Freelance</option>
                     <option value="Tiempo Completo">Tiempo Completo</option>
                     <option value="Medio Tiempo">Medio Tiempo</option>
                     <option value="Por Proyecto">Por Proyecto</option>
		*/
		return opciones
			.fn(this)
			.replace(
				new RegExp(` value="${seleccionado}"`),
				'$& selected="selected"'
			);
	},
	mostrarAlertas: (errores = {}, alertas) => {
		const categoria = Object.keys(errores);
		console.log(categoria);

		let html = '';
		if (categoria.length) {
			errores[categoria].forEach((error) => {
				html += `<div class="${categoria} alerta">
                    ${error}
                </div>`;
			});
		}
		return (alertas.fn().html = html);
	},
};
