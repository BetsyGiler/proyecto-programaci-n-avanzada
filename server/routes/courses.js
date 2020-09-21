const express = require("express");

// Middlewres
const {verifyToken, verifyAdminRole} = require("../middlewares/verify");

// Errores
const {db_error} = require("../errors/db_error");

// Esquemas
const Course = require('../../database/models/Courses');

// App de express
const app = express();

app.get('/courses', verifyToken, (req, res)=>{

    const from = req.query.from  || 0;
    const limit= req.query.limit || 10;

    Course.find()
    .skip(parseInt(from))
    .limit(parseInt(limit))
    .sort('name')
    .exec((error, responseDB)=>{

      if(error) {
          return db_error(error, res);
      }

      return res.json({
          success: true,
          message: `Mostrando registros desde el ${from} hasta el ${from + limit - 1}`,
          data: responseDB
      });

    });

});

app.post('/courses', [verifyToken, verifyAdminRole], (req, res)=>{

    const body = req.body;

    const course = new Course();

    course.name = body.name;
    course.parallels = body.parallels;

    course.save((error, responseDB)=>{

        if(error) {
            return db_error(error, res);
        }

        return res.json({
            success: true,
            message: "El curso se registró correctamente",
            course: responseDB
        });
    });

});

module.exports = app;