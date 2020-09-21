const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const user = new Schema({

    name: {
        type: String, 
        required: [true, 'El nombre es requerido']
    },
    last_name: {
        type: String, 
        required: [true, 'Tienes que ingresar un apellido']
    },
    cellphone: {
        type: String,
        required: false,
        default: "No disponible"
    },
    born: {
        type: Date, 
        required: [true, 'La fecha de nacimiento es obligatoria']
    },
    identification: {
        unique: true,
        type: String,
        required: ['Ingrese su cédula']
    },
    role: {
        type: String, 
        default: 'STUDENT',
        enum: ['ADMIN', 'STUDENT', 'PROFESSOR', 'ADMIN_PROFESSOR']
    },
    user_name: {
        type: String,
        unique: true,
        required: [true, 'Créese un nombre de usuario, por favor']
    },
    email: {
        type: String,
        unique: true,
        required: [true, 'Ingrese un email'],
        match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, "Email no válido"]
    },
    password: {
        type: String,
        required: [true, 'Ingrese una contraseña'],
        validate: [(pass)=>{pass>=6}, 'Su contraseña debe tener 6 caracteres como mínimo']
    },
    courses: [{
        type: Schema.Types.Map,
        required: false
    }]

});

// Estimado desarrolador, por lo que mas quiera en su vida, no toque esto si no sabe
// lo que esta haciendo, es peligroso; la parte de function(){} parece indefenza ya
// que uno podria pensar que con ()=>{} basta, pero no, esta cosa es rebelde, muy 
// rebelder, asi que, por lo que mas quiera, no lo cambie, ni siquiera lo piense.
// Que tenga una linda maniana/tarde/noche.
user.methods.toJSON = function(){

    let usr = this;
    let userObj = usr.toObject();
    delete userObj.password;

    return userObj;
}


module.exports = mongoose.model('User', user);
