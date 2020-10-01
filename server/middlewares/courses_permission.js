const Course = require("../../database/models/Courses");
const {db_error} = require("../errors/db_error");

const verifyDeleteOperation = (req, res, next)=>{

    const id = req.params.id;

    Course.findOne({_id: id}, (error, response)=>{

        if(error) {
            return db_error(error, res);
        }
        if(!response) {
            return res.status(404).json({
                success: false,
                error: {
                    message: "Curso no encontrado",
                    possible_fix: "Verifique el ID"
                }
            });
        }

        if(response.parallels.length > 0){
            return res.status(409).json({
                success: false,
                error: {
                    message: "No se puede eliminar el curso debido a que tiene paralelos",
                    possible_fix: "Elimine los paralelos primero"
                }
            });
        }

        next();
    });
}

module.exports = {verifyDeleteOperation};