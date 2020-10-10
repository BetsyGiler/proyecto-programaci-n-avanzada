const ErrorHandler = require("./ChainOfResponsability");

class Unauthorized extends ErrorHandler{
    handle(task){
        if(task === 'unauthorized'){
            return {
                success: false,
                message: "No tiene permiso para realizar esta accion",
                error: {
                    message: "Ingrese sesión con un usuario de rol superior."
                }
            }
        }
        return this.nextHandler.handle(task);
    }
}

class InvalidCredentials extends ErrorHandler{
    handle(task){
        if(task === 'invalid_credentials'){
            return {
                success: false,
                message: "Correo o contraseña no validos",
                error:{
                    message: "Verifique sus credenciales"
                }
            }
        }
        return this.nextHandler.handle(task);
    }
}

class UsertNotCompatible extends ErrorHandler {
    handle(task){
        if(task==="user_incompatible"){
            return {
                success: false,
                message: "El usuario que ingresó no puede ser asignado a este cargo",
                error: {
                    message: "Verifique que el usuario a asignar tenga el rol correcto"
                }
            }
        }
    }
}

module.exports = {InvalidCredentials, Unauthorized, UsertNotCompatible}