require('dotenv').config();

const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const app = express();

const {verifyAdminRole, verifyToken} = require('../middlewares/verify');
const {db_error} = require('../errors/db_error');
const {not_found: user_not_found} = require('../errors/user_error');

const User = require('../../database/models/User');

app.get('/user/login', (req, res)=>{

    const body = req.body;
    
    let email = body.email;
    let password = body.password;

    User.findOne({email}, (error, responseDB)=>{

        if(error){
            return db_error(error, res);
        }
        if(!responseDB){
            return user_not_found(res, "Correo o contraseña no validos");
        }

        if(bcrypt.compareSync(password, responseDB.password)){

            let token = jwt.sign(
                { user: responseDB },
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

        return user_not_found(res, "Correo o contraseña no validos");

    });
});

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
            return db_error(error, res);
        }

        return res.json({
            success: true,
            message: "Registro completado exitosamente",
            user: responseDB
        });
    });

});

module.exports = app;