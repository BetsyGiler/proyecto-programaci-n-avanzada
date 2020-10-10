require('dotenv').config();
const jwt = require('jsonwebtoken');
const { Unauthorized } = require('../errors/credential_errors');
const { MissingToken, InvalidToken } = require('../errors/token_errors');

let errorHandler = new MissingToken();
errorHandler.setNextHandler(new InvalidToken())
            .setNextHandler(new Unauthorized());

const verifyToken = (req, res, next)=>{

    let token = req.get('Authorization');

    if(!token){
        return res.status(400).json(errorHandler.handle("missing_token"));
    }

    jwt.verify(token, process.env.TOKEN_KEY, (error, decoded)=>{

        if(error){
            return res.status(401).json(errorHandler.handle("invalid_token"));
        }

        req.user = decoded.user;
        next();
    });

}

const verifyAdminRole = (req, res, next)=>{

    let user = req.user;

    console.log(user.role);

    if(user.role !== 'ADMIN' && user.role !== 'ADMIN_PROFESSOR'){
        return res.status(401).json(errorHandler.handle("unauthorized"));
    }

    next();
}

module.exports = {verifyToken, verifyAdminRole}