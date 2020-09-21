const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const parallelsSchema = new Schema({

    periodo: {
        type: String,
        required: [true, "Ingrese un periodo"],
    },
    letter: {
        type: String, 
        required: [true, "Ingrese la letra de paraelo"]
    },
    level: {
        type: String,
        required: [true, "Ingrese el nivel en el que se imparte la materia"]
    },
    course_id: {
        type: Schema.Types.ObjectId,
        ref: 'Course',
        required: [true, "El paralelo debe pertenecer a un curso"]
    },
    professor: {
        type: Schema.Types.Map,
        required: [true, "El curso debe tener un docente"]
    },
    students: [{
        type: Schema.Types.Map,
        required: false
    }]

});

module.exports = mongoose.model("Parallels", parallelsSchema);