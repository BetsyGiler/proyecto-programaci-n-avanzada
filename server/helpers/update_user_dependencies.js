const Parallels = require("../../database/models/Parallels");
const Parellels = require("../../database/models/Parallels");


/**
 * 
 * @param {Document} user 
 * 
 * Estimado desarrollador, ingeniero y/o/u programador,
 * esta cosa rara lanza una 'reaccion en cadena' para
 * actualizar todas las dependencias en las que se halle
 * parte del documento User. Por lo que mas quiera, NO
 * MODIFIQUE ESTO a menos que tenga un amplio conocimiento
 * y/o/u experiencia en este campo, puesto que puede
 * dejar dependencias sin actualizar y la consistencia
 * de los datos se va al carajo, entendio? si? ok, que
 * tenga un buen dia.
 * 
 * Como ya es costumbre, aca dejo un contador de las veces
 * que estuvo a nada de de darse un tiro y dejar este 
 * mundo cruel lleno de sufrimiento y maldad.
 * 
 * Contador de veces que quiso pasar a mejor vida: 0
 */
const updateDependencies = async(user)=>{

    const role = user.role;

    const parallels = user.parallels;
 
    // updating parallels
    const update = {
        "_id": user._id,
        "name": user.name,
        "last_name": user.last_name,
        "identification": user.identification
    }

    let parallel;

    for(let i=0; i<parallels.length; ++i){
        
        parallel = await Parallels.findById(parallels.get("_id"));

        if(!parallel) continue;

        

    }

}