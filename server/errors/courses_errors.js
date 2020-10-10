const ErrorHandler = require("./ChainOfResponsability");

class CourseDeleteError extends ErrorHandler{

    handle(task){
        if(task === "course_delete_error"){
            return {
                success: false,
                message: "No se pudo eliminar el curso", 
                error: {
                    message: "Debe eliminar primero los paralelos del curso"
                }
            }
        }
        return this.nextHandler.handle(task, error);
    }

}

class CourseNotFound extends ErrorHandler{
    
    handle(task){
        if(task === "course_404"){
            return {
                success: false,
                message: "Curso no encontrado", 
                error: {
                    message: "Verifique el ID del curso"
                }
            }
        }
        return this.nextHandler.handle(task, error);
    }
}

module.exports = {CourseDeleteError, CourseNotFound}