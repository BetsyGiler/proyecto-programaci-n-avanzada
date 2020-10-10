const ErrorHandler = require("./ChainOfResponsability");

class MissingToken extends ErrorHandler{
    handle(task){
        if(task === 'missing_token'){
            return {
                success: false,
                message: "El token debe ser provisto",
                error
            }
        }
        return this.nextHandler.handle(task);
    }
}

class InvalidToken extends ErrorHandler{
    handle(task){
        if(task === 'invalid_token'){
            return {
                success: false,
                message: "Su token es invalido",
                error
            }
        }
        return this.nextHandler.handle(token);
    }
}
module.exports = {InvalidToken, MissingToken}