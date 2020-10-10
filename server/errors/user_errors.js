const ErrorHandler = require("./ChainOfResponsability");


class UserNotFound extends ErrorHandler {

    handle(task){

        if(task === "user_404"){
            return {
                success: false,
                message: "Usuario no encontrado",
                error: {
                    message: "Verifique que el id sea correcto"
                }
            }
        }

        return this.nextHandler.handle(task);
    }

}

module.exports = {UserNotFound};