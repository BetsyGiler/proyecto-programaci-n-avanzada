const ErrorHandler = require("./ChainOfResponsability");

class ParallelNotFound extends ErrorHandler{
    handle(task){
        if(task === "parallel_404"){
            return {
                success: false,
                message: "Paralelo no encontrado",
                error:{
                    message: "Verifique el ID del paralelo"
                }
            }
        }

        return this.nextHandler.handle(task);
    }
}

module.exports = {ParallelNotFound}