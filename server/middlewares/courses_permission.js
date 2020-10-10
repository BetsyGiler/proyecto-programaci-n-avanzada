const Course = require("../../database/models/Courses");
const { CourseDeleteError, CourseNotFound } = require("../errors/courses_errors");
const {DatabaseError} = require("../errors/database_errors");

let courseError = new CourseDeleteError();

courseError.setNextHandler(new CourseNotFound())
           .setNextHandler(new DatabaseError());


const verifyDeleteOperation = (req, res, next)=>{

    const id = req.params.id;

    Course.findOne({_id: id}, (error, response)=>{

        if(error) {
            return res.status(500).json(courseError.handle("db_error"));
        }
        if(!response) {
            return res.status(404).json(courseError.handle("course_404",));
        }

        if(response.parallels.length > 0){
            return res.status(400).json(courseError.handle("course_delete_error"));
        }

        next();
    });
}

module.exports = {verifyDeleteOperation};