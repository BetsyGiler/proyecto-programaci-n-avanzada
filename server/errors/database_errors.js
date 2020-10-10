const ErrorHandler = require("./ChainOfResponsability");

class DatabaseError extends ErrorHandler{
    handle(task){
        if(task.toLower() === "db_error"){
            return {
                success: false,
                message: "ha ocurrido un error en la base de datos",
                error: {
                    message: "Consulte con el equipo de desarrollo"
                }
            }
        }
        return this.nextHandler.handle(task);
    }
}

class DatabaseUniqueError extends ErrorHandler {
    handle(task){
        if(task.toLower() === 'db_unique'){
            return {
                success: false,
                message: "Violacion de clave unica"
            }
        }
        return this.nextHandler.handle(task);
    }
}

module.exports = {DatabaseError, DatabaseUniqueError}