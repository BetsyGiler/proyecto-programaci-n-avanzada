require('dotenv').config();

const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const app = express();

const {verifyAdminRole, verifyToken} = require('../middlewares/verify');

const User = require('../../database/models/User');
const { DatabaseError } = require('../errors/database_errors');
const { UserNotFound } = require('../errors/user_errors');
const { InvalidCredentials } = require('../errors/credential_errors');

let errorHandler = new DatabaseError();

errorHandler.setNextHandler(new UserNotFound())
            .setNextHandler(new InvalidCredentials());

// Login
app.post('/user/login', (req, res)=>{

    const body = req.body;
    
    let email = body.email;
    let password = body.password || "";

    User.findOne({email}).select('+password').exec((error, responseDB)=>{

        if(error){
            return res.status(500).json(errorHandler.handle("db_error"));
        }
        if(!responseDB){
            return res.status(404).json(errorHandler.handle("invalid_credentials"));
        }

        if(bcrypt.compareSync(password, responseDB.password)){

            let token = jwt.sign(
                { user: {
                    role: responseDB.role,
                    id: responseDB._id,
                    born: responseDB.born
                }},
                secretOrPrivateKey=process.env.TOKEN_KEY, 
                { expiresIn: process.env.TOKEN_EXPIRATION },
            );

            return res.json({
                success: true,
                message: "Acceso concedido",
                token,
                user: responseDB
            });
        }

        return res.status(404).json(errorHandler.handle("invalid_credentials"));

    });
});

// Lectura de docentes
app.get('/user/professors', [verifyToken, verifyAdminRole], (req, res)=>{

    const from = req.query.from || 0;
    const limit = req.query.limit || 0;

    User.find({role: /PROFESSOR/i})
    .skip(parseInt(from))
    .limit(parseInt(limit))
    .exec((error, resDB)=>{
        if(error){
            return res.status(500).json(errorHandler("db_error"));
        }

        return res.json({
            success: true,
            message: `Mostrando registros desde el ${from} hasta el ${from + limit}`,
            data: resDB
        });
    });

}); 

// Lectura de esclavos
app.get('/user/students', [verifyToken], (req, res)=>{

    const from = req.query.from || 0;
    const limit = req.query.limit || 0;

    User.find({role: "STUDENT"})
    .skip(parseInt(from))
    .limit(parseInt(limit))
    .exec((error, resDB)=>{
        if(error){
            return res.status(500).json(errorHandler("db_error"));
        }

        return res.json({
            success: true,
            message: `Mostrando registros desde el ${from} hasta el ${from + limit}`,
            data: resDB
        });
    });

}); 

// Registro de una pobre alma indefenza que sera masacrada
app.post('/user/signup', [verifyToken, verifyAdminRole],(req, res)=>{

    let body = req.body;

    let user = new User();

    user.name = body.name;
    user.last_name = body.last_name;
    user.born = body.born;
    user.identification = body.identification;
    user.role = body.role;
    user.user_name = body.user_name;
    user.email = body.email;
    user.password = bcrypt.hashSync(body.password, 10);

    user.save((error, responseDB)=>{

        if(error){
            let errorRes = errorHandler.handle("db_error");
            errorRes.error = error;
            return res.status(400).json(errorRes);
        }

        return res.json({
            success: true,
            message: "Registro completado exitosamente",
            user: responseDB
        });
    });

});

// Actualizacion de usuario
app.put('/user/:id', [verifyToken, verifyAdminRole], (req, res)=>{

    const id = req.params.id;
    const body = req.body;

    delete body._id; // you can't modify it
    delete body.parallels; // esto se edita desde el paralelo

    User.findByIdAndUpdate(id, body, (error, userDB)=>{
        if(error || !userDB) {
            return res.status(404).json(errorHandler.handle("user_404"));
        }



    });

});

module.exports = app;