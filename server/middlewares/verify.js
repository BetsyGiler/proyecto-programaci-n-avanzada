require('dotenv').config();
const jwt = require('jsonwebtoken');

const verifyToken = (req, res, next)=>{

    let token = req.get('Authorization');

    if(!token){
        return res.status(400).json({
            success: false,
            message: "Debe proveer un token"
        });
    }

    jwt.verify(token, process.env.TOKEN_KEY, (error, decoded)=>{

        if(error){
            return res.status(401).json({
                success: false,
                message: "Error validando el token",
                error
            });
        }

        req.user = decoded.user;
        next();
    });

}

const verifyAdminRole = (req, res, next)=>{

    let user = req.user;

    if(user.role !== 'ADMIN'){
        return res.status(401).json({
            success: false,
            message: "Usted no tiene autorización para realizar esta operación"
        });
    }

    next();
}

module.exports = {verifyToken, verifyAdminRole}