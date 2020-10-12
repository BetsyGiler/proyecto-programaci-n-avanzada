/**
 * Carta a los desarrolladores del futuro: 
 * 
 * Este archivo es sencillo, puede ser editado
 * las veces que lo desee. Adelante campeon! 
 * Dale con todo.
 * 
 * Nota: En caso de que haya tenido que maldecir
 * cosas imaginarias, dejeme decirle que es un
 * inutil, pero por si las moscas, deje a continuacion
 * las veces que lo hizo, para que otro desarrollador
 * se burle de usted.
 * 
 * conteo de veces que maldijo sin sentido: 0
 */

const express = require("express");
// Middlewares
const {verifyToken, verifyAdminRole} = require("../middlewares/verify");
const {verifyDeleteOperation} = require("../middlewares/courses_permission");

const {DatabaseError} = require("../errors/database_errors");
const { CourseNotFound } = require("../errors/courses_errors");

// Errores
const errorHandler = new DatabaseError();
errorHandler.setNextHandler(new CourseNotFound());

// Esquemas
const Course = require('../../database/models/Courses');
const Courses = require("../../database/models/Courses");

// App de express
const app = express();

// Lectura
app.get('/courses', verifyToken, (req, res)=>{

    const from = req.query.from  || 0;
    const limit= req.query.limit || 10;

    Course.find()
    .skip(parseInt(from))
    .limit(parseInt(limit))
    .sort('name')
    .exec((error, responseDB)=>{

      if(error) {
          return  res.status(400).json(errorHandler.handle("db_error"));
      }
      
      return res.json({
          success: true,
          message: `Mostrando registros desde el ${from} hasta el ${from + limit - 1}`,
          data: responseDB
      });

    });

});

// Insersion
app.post('/courses', [verifyToken, verifyAdminRole], (req, res)=>{

    const body = req.body;

    const course = new Course();

    course.name = body.name;
    course.parallels = body.parallels;

    course.save((error, responseDB)=>{

        if(error) {
            return  res.status(400).json(errorHandler.handle("db_error"));
        }

        return res.json({
            success: true,
            message: "El curso se registró correctamente",
            course: responseDB
        });
    });

});

// Actualizacion
app.put('/courses/:id', [verifyToken, verifyAdminRole], (req, res)=>{

    const body = req.body;
    const id = req.params.id;

    delete body._id; // El id esta prohibido, mi estimad@.

    // De momento solo puede actualizar el nombre
    Course.findByIdAndUpdate(id, {name: body.name}, {useFindAndModify:false},(error, responseDB)=>{

        if(error) {
            return  res.status(400).json(errorHandler.handle("db_error"));
        }

        if(!responseDB){
            return res.status(404).json(errorHandler.handle("course_404"));
        }

        return res.json({
            success: true,
            message: "El curso ha sido actualizado"
        });

    });

});

// Eliminacion
app.delete('/courses/:id', [verifyToken, verifyAdminRole, verifyDeleteOperation], (req, res)=>{

    const id = req.params.id;

    Course.findOneAndRemove({_id:id}, (error, responseDB)=>{

        if(error) {
            return  res.status(400).json(errorHandler.handle("db_error"));
        }

        return res.json({
            success: true,
            message: "El curso ha sido eliminado"
        });
    });
});

// Lectura por ID
app.get('/courses/:id', [verifyToken], (req, res)=>{

    const id = req.params.id;

    Courses.findById(id, (error, response)=>{

        if(error){
            return res.status(404).json(errorHandler.handle("course_404"));
        }

        return res.json({
            success: true,
            data: response
        });

    });

});

module.exports = app;