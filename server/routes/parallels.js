/**
 * Estimado desarrollador, este archivo ya esta completo,
 * contiene fragmentos muy delicados, asi que, por lo que
 * mas quiera, si no sabe lo que va a hacer no modifique
 * esto, evitelo, haga de cuenta que este archivo es 
 * invisible, que no tiene ni una sola linea escrita.
 * 
 * En caso de que se tome el valor de modificarlo, por
 * favor, deje a continuacion el numero de veces que
 * maldijo cosas inexistentes, para que asi pueda salvar
 * alguna alma indefenza que se tome la atrevida tarea
 * de modificar esto de nuevo.
 * 
 * Veces que maldijo algo despues de una modificacion: 0
 * (Si ya hasta perdio la cuenta, ponga un valor aproximado)
 */


const app = require('express')();

const Parallels = require('../../database/models/Parallels');
const Courses = require('../../database/models/Courses');
const User = require('../../database/models/User');


const { verifyToken, verifyAdminRole } = require('../middlewares/verify');
const { DatabaseError } = require('../errors/database_errors');
const { CourseNotFound } = require('../errors/courses_errors');
const { UserNotFound } = require('../errors/user_errors');
const { Unauthorized, UsertNotCompatible } = require('../errors/credential_errors');
const { ParallelNotFound } = require('../errors/parallels_error');
const { updateDependencies } = require('../helpers/update_parallels_dependencies');

let errorHandler = new DatabaseError();

errorHandler.setNextHandler(new CourseNotFound())
            .setNextHandler(new UserNotFound())
            .setNextHandler(new Unauthorized())
            .setNextHandler(new UsertNotCompatible())
            .setNextHandler(new ParallelNotFound());

app.get('/courses/:id/parallels', verifyToken, (req, res)=>{

    const courseID = req.params.id;

    const from = parseInt(req.query.from) || 0;
    const limit = parseInt(req.query.limit) || 10;

    Parallels.find({course_id: courseID})
    .skip(from)
    .limit(limit)
    .populate('course', 'name')
    .exec((error, responseDB)=>{

        if(error) {
            return res.status(500).json(errorHandler.handle("db_error"));
        }

        return res.json({
            success: true,
            message: `Mostrando registros desde e ${from} hasta el ${limit + from - 1}`,
            data: responseDB
        });
    });
});

app.post('/courses/:id/parallels', [verifyToken, verifyAdminRole], (req, res)=>{

    const id = req.params.id;
    const body = req.body;

    // Buscar el curso a agregar
    Courses.findById(id, (error, responseDB)=>{
        if(error) {
            return res.status(500).json(errorHandler.handle("db_error"));
        }
        if(!responseDB){
            return res.status(404).json(errorHandler.handle("course_404"));
        }
        
        // Buscando el docente a agregar
        User.findById(body.professor_id, (error, responseUser)=>{
            

            if(error){
                return res.status(500).json(errorHandler.handle("db_error"));
            }
            if(!responseUser){
                return res.status(404).json(errorHandler.handle("user_404"));
            }

            // verigicando si es un Docente
            const allowedRoles = ['PROFESSOR', 'ADMIN_PROFESSOR'];
            const roles = allowedRoles.filter((value)=>value === responseUser.role);

            if(roles.length < 1){
                return res.status(401).json(errorHandler.handle("user_incompatible"));
            }

            // Construyendo el profesor del curso
            const professor = {
                _id: responseUser._id,
                name: responseUser.name,
                last_name: responseUser.last_name,
                email: responseUser.email,
                cellphone: responseUser.cellphone
            }

            let parallels = new Parallels();
    
            parallels.periodo = body.periodo;
            parallels.letter = body.letter;
            parallels.level = body.level;
            parallels.course_id = id;
            parallels.professor = professor;
            parallels.students = body.students;
            
            parallels.save((error, parallelsDB)=>{

                if(error){
                    return res.status(500).json(errorHandler.handle("db_error"));
                }

                // Actualizando el documento del docente
                let parallelsList = responseUser.parallels;
                parallelsList.push({
                    course_id: id,
                    parallel_id: parallelsDB._id,
                    letter: parallelsDB.letter,
                });

                let courseParallels = responseDB.parallels;

                courseParallels.push({
                    parallel_id: parallelsDB._id,
                    letter: parallelsDB.letter,
                });

                Courses.findByIdAndUpdate(id, {parallels: courseParallels}, {useFindAndModify:false}).then(console.log);
                User.findByIdAndUpdate(responseUser._id, {parallels: parallelsList}).then(console.log);

                return res.json({
                    success: true,
                    message: "paralelo agregado correctamente",
                    parallel: parallelsDB
                });
            });
        });
    });
});

app.post('/courses/student', [verifyToken, verifyAdminRole], (req, res)=>{

    const idParallel = req.body.id_parallel;

    // Aqui estara el id del estudiante
    const body = req.body;

    // Verificando que el alumno exista
    User.findOne({_id: body.id_student, role:'STUDENT'}, (error, userDB)=>{

        if(error) {
            return res.status(500).json(errorHandler.handle("db_error"));
        }
        if(!userDB){
            return res.status(404).json(errorHandler.handle("user_404"));
        }

        // Verificando que el paralelo exista
        Parallels.findById(idParallel, (error, parallelDB)=>{

            if(error) { 
                return res.status(500).json(errorHandler.handle("db_error"));
            }
            if(!parallelDB){
                return res.status(404).json(errorHandler.handle("parallel_404"));
            }
            

             // preparando los datos a actualizar
            let student_list = parallelDB.students; 
            
            student_list.push({
                _id: userDB._id,
                name: userDB.name,
                last_name: userDB.last_name,
                identification: userDB.identification
            });

            // Actualizando paralelo
            Parallels.findByIdAndUpdate(idParallel, {students: student_list}, (error, parallelsDB)=>{
                if(error) {
                    return res.status(500).json(errorHandler.handle("db_error"));
                }

                // actualizando alumno
                let parallelsList = userDB.parallels;

                parallelsList.push({
                    _id: parallelsDB._id,
                    level: parallelsDB.level,
                    letter: parallelsDB.letter,
                    periodo: parallelsDB.periodo,
                    course_id: parallelsDB.course_id
                });

                userDB.update({parallels: parallelsList}, (error, studentDB)=>{
                    if(error) {
                        return res.status(500).json(errorHandler.handle("db_error"));
                    }

                    updateCourse(parallelsDB.course_id, {
                        _id: parallelsDB._id,
                        level: parallelsDB.level,
                        letter: parallelsDB.letter,
                        periodo: parallelsDB.periodo,
                    });

                    return res.json({
                        success: true,
                        message: "El alumno ha sido agregado correctamente",
                        parallel: parallelsDB
                    });

                });
            });
        });
    });

});

app.get('/parallels', [verifyToken, verifyAdminRole], (req, res)=>{

    const paralallelId = req.query.parallel_id || "s";

    Parallels.findById(paralallelId, (error, responseDB)=>{
        if(error){
            return res.status(404).json(errorHandler.handle("parallel_404"));
        }

        return res.json({
            success: true,
            inscritos: responseDB.students? responseDB.students.length:0,
            data: responseDB
        });
    });

});

app.put('/parallels/:id', [verifyToken, verifyAdminRole], (req, res)=>{

    const body = req.body;
    const id = req.params.id;

    delete body._id;
    delete body.students;

    Parallels.findByIdAndUpdate(id, body, {new: true, useFindAndModify: false}, (error, response)=>{
        if(error){
            return res.status(400).json(errorHandler.handle("parallel_404"));
        }

        // Actualizacion para mantener la consistencia de los datos
        updateDependencies(response).then(console.log);

        return res.json({
            success: true,
            message: "El paralelo ha sido acualizado",
            data: response
        });
    });


});

app.delete('/parallels/:id/student', [verifyToken, verifyAdminRole], (req, res)=>{

    const id = req.params.id;
    const studentId = req.query.student_id;

    Parallels.findById(id, (error, response)=>{

        if(error){
            return res.status(404).json(errorHandler.handle("parallel_404"));
        }

        const students = response.students.filter((student)=>{
            return student.get("_id") != studentId + "";
        });

        if(students.length === response.students.length){
            return res.status(404).json(errorHandler.handle("user_404"));
        }

        Parallels.findByIdAndUpdate(id, {students}, {useFindAndModify: false}).then(doc=>{
            res.json({
                success: true,
                message: "El alumno fue eliminado del paralelo",
                data: doc
            });
        });

        User.findById(studentId).then(usr=>{
            let parallels = usr.parallels.filter(par=>par.get("_id") != id + "");
            User.findByIdAndUpdate(studentId, {parallels}).then(console.log);
        });
        
    });
});

app.delete('/parallels/:id', [verifyToken, verifyAdminRole], (req, res)=>{

    const id = req.params.id;

    Parallels.findByIdAndRemove(id, (error, responseDB)=>{
        if(error){
            return res.status(404).json(errorHandler.handle("parallel_404"));
        }

        updateDependencies(responseDB, update=false).then(console.log);

        return res.json({
            success: true,
            message: "El curso ha sido eliminado",
            data: responseDB
        });
    });

});

const updateCourse = (id, new_parallel)=>{

    Courses.findById(id, (err, res)=>{
        let parallels = res.parallels;
        parallels.push(new_parallel);

        Courses.findOneAndUpdate({_id:id}, {parallels: parallels});
    });
}

module.exports = app;