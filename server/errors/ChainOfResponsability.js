class ErrorHandler {

    constructor(){
        this.nextHandler = undefined;
    }

    handle(task){};
    setNextHandler(nextHandler = new ErrorHandler()) {
        this.nextHandler = nextHandler;
        return this.nextHandler;
    }
}

module.exports = ErrorHandler;
