const { Document } = require("mongoose");
const Courses = require("../../database/models/Courses");
const User = require("../../database/models/User");

/**
 * 
 * @param {Document} parallelDocument
 * @param {Boolean} update
 * 
 * Si update es false, se asume que se desea actualizar dependencias
 * al eliminar.
 */
let  updateDependencies = async (parallelDocument, update=true)=>{

    for(let i=0; i<parallelDocument.students.length; ++i){

        let user = await User.findById(parallelDocument.students[i].get("_id")); 
        
        if(!user) continue;

        let parallels = user.parallels.filter((parallel)=>{
            return parallel.get("_id") != parallelDocument._id+"";
        });

        if(update){
            parallels.push({
                _id: parallelDocument._id,
                level: parallelDocument.level,
                periodo: parallelDocument.periodo,
                course_id: parallelDocument.course_id,
                letter: parallelDocument.letter
            });
        }

        await User.findByIdAndUpdate(parallelDocument.students[i].get("_id"), {parallels: parallels});        
    }

    // actualizando docentes
    let user = await User.findById(parallelDocument.professor.get("_id"));

    let parallels = user.parallels.filter((parallel)=>{
        return parallel.get("_id") != parallelDocument._id+"";
    });

    if(update){
        parallels.push({
            _id: id,
            level: parallelDocument.level,
            periodo: parallelDocument.periodo,
            course_id: parallelDocument.course_id,
            letter: parallelDocument.letter
        });
    }
        
    await User.findByIdAndUpdate(parallelDocument.professor.get("_id"), {parallels: parallels});

    let course = await Courses.findById(parallelDocument.course_id);

    if(!course) return "Error en actualización de dependencias";

    parallels = course.parallels.filter(parallel=> {
        return parallel.get("parallel_id") != parallelDocument._id+"";
    });

    if(update){
        parallels.push({
            parallel_id: parallelDocument._id,
            letter: parallelDocument.letter
        });
    }

    await Courses.findByIdAndUpdate(parallelDocument.course_id, {parallels});

    return "Dependencias actualizadas"
}

module.exports = {updateDependencies}