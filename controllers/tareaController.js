const Tarea = require('../models/Tarea');
const Proyecto = require('../models/Proyecto');
const { validationResult } = require('express-validator');


exports.crearTarea = async (req, res) => {

    //Revisamos si hay errores
    const errores = validationResult(req);
    if (!errores.isEmpty()) {
        return res.status(400).json({ errores: errores.array() })
    }


    try {

        //extraer el proyecto y comprobar si existe
        const { proyecto } = req.body;


        const existeProyecto = await Proyecto.findById(proyecto);
        if (!existeProyecto) {
            return res.status(404).json({ msg: 'Proyecto no encontrado' })
        }

        //Verificar el creador del proyecto sea el mismo que edita o actualiza
        if (existeProyecto.creador.toString() !== req.usuario.id) {
            return res.status(401).json({ msg: 'No Autorizado' });
        }

        //guardamos el tarea
        const tarea = new Tarea(req.body);
        await tarea.save();
        res.json(tarea);
    } catch (error) {
        console.log(error);
        res.status(500).send('Error en el servidor');
    }
}

//Obtiene todas las tareas 
exports.obtenerTareas = async (req, res) => {
    try {

        //extraer el proyecto y comprobar si existe
        const { proyecto } = req.query;


        const existeProyecto = await Proyecto.findById(proyecto);
        if (!existeProyecto) {
            return res.status(404).json({ msg: 'Proyecto no encontrado' })
        }

        //Verificar el creador del proyecto sea el mismo que edita o actualiza
        if (existeProyecto.creador.toString() !== req.usuario.id) {
            return res.status(401).json({ msg: 'No Autorizado' });
        }

        //Obtener las tareas por proyecto
        const tareas = await Tarea.find({ proyecto }).sort({ creado: -1 });
        res.json({ tareas });
    } catch (error) {
        console.log(error);
        res.status(500).send('Error en el servidor');
    }
}

//Actualizar PUT
exports.actualizarTarea = async (req, res) => {

    try {
        //Extraer el proyecto y comprobar si existe
        const { proyecto, nombre, estado } = req.body;

        //Revisar si la tarea existe o no
        let tarea = await Tarea.findById(req.params.id);

        //Revisar si la tarea existe o no
        if (!tarea) {
            return res.status(404).json({ msg: 'No existe esa tarea' });
        }

        //Extraer proyecto
        const existeProyecto = await Proyecto.findById(proyecto);

        //Revisa si el proyecto actual le pertenece al usuario autenticado
        if (existeProyecto.creador.toString() !== req.usuario.id) {
            return res.status(401).json({ msg: 'No Autorizado' });
        }

        //Crea un objeto con la nueva informacion
        const nuevaTarea = {};
        nuevaTarea.nombre = nombre;
        nuevaTarea.estado = estado;


        //Guardar la tarea
        tarea = await Tarea.findOneAndUpdate({ _id: req.params.id }, nuevaTarea,
            { new: true });

        res.json({ tarea });


    } catch (error) {
        console.log(error);
        res.status(500).send('Error en el servidor');
    }
}

//Elimina Delete
exports.eliminarTarea = async (req, res) => {


    try {
        //Extraer el proyecto y comprobar si existe
        const { proyecto } = req.query;

        //Revisar el Id
        let tarea = await Tarea.findById(req.params.id);

        //Revisar si el proyecto existe o no
        if (!tarea) {
            return res.status(404).json({ msg: 'Tarea no encontrado' });
        }

        //Extraer proyecto
        const existeProyecto = await Proyecto.findById(proyecto);

        //Revisa si el proyecto actual le pertenece al usuario autenticado
        if (existeProyecto.creador.toString() !== req.usuario.id) {
            return res.status(401).json({ msg: 'No Autorizado' });
        }

        //Eliminar
        await Tarea.findOneAndRemove({ _id: req.params.id });
        res.json({ msg: 'Tarea eliminadoX' });


    } catch (error) {
        console.log(error);
        res.status(500).send('Error en el servidor');
    }
}

