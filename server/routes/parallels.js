const app = require('express')();

const Parallels = require('../../database/models/Parallels');
const Courses = require('../../database/models/Courses');
const User = require('../../database/models/User');

const {verifyToken, verifyAdminRole} = require('../middlewares/verify');

const {db_error} = require('../errors/db_error');
const {not_found: user_nf} = require('../errors/user_error');

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
            return db_error(error, res);
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
            return db_error(error, res);
        }
        if(!responseDB){
            return res.status(404).json({
                success: false,
                error: {
                    message: "El curso no existe",
                    fix: "Verifique que el ID del curso sea correcto"
                }
            });
        }

        // Buscando el docente a agregar
        User.findById(body.professor_id, (error, responseUser)=>{


            if(error){
                return db_error(error, res);
            }
            if(!responseUser){
                return res.status(404).json({
                    success: false,
                    error:{
                        message: "El profesor no existe",
                        fix: "Verifique que el ID del docente sea correcto"
                    }
                })
            }

            // verigicando si es un Docente
            const allowedRoles = ['PROFESSOR', 'ADMIN_PROFESSOR'];
            const roles = allowedRoles.filter((value)=>value === responseUser.role);

            if(roles.length < 1){
                return res.status(401).json({
                    success: false,
                    error: {
                        message: "El usuario que está intentando asignar no es un docente",
                        fix: "Asegúrese de que el rol del usuario sea PROFESSOR o ADMIN_PROFESSOR"
                    }
                });
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
                    return db_error(error, res);
                }

                // Actualizando el documento del docente
                let parallelsList = responseUser.parallels;
                parallelsList.push({
                    _id: parallelsDB._id,
                    level: parallelsDB.level,
                    letter: parallelsDB.letter,
                    periodo: parallelsDB.periodo,
                    course_id: parallels.course,
                    course_name: responseDB.name
                });

                responseUser.updateOne({parallels: parallelsList}, (error, responseUP)=>{
                    console.log(parallelsList);
                    console.log(responseUP);
                    if(error) return db_error(error, res);

                    return res.json({
                        success: true,
                        message: "paralelo agregado correctamente",
                        parallel: parallelsDB
                    });
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
    console.log(body);
    User.findOne({_id: body.id_student, role:'STUDENT'}, (error, userDB)=>{

        if(error) {
            return db_error(error, res);
        }
        if(!userDB){
            return user_nf(res, "Alumno no encontrado");
        }

        // Verificando que el paralelo exista
        Parallels.findById(idParallel, (error, parallelDB)=>{

            if(error) { 
                return db_error(error, res);
            }
            if(!parallelDB){
                return res.status(404).json({
                    success: false,
                    error: {
                        message: "El paralelo no ha sido encontrado",
                        possible_fix: "Verifique el id del paralelo y del curso"
                    }
                });
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
                    return db_error(error, res);
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
                        return db_error(error, res);
                    }

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
module.exports = app;