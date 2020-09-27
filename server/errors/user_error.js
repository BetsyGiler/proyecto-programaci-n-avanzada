
const not_found = (response, message="Usuario no encontrado")=>{
    return response.status(404).json({
        success: false,
        error: {
            message
        }
    });
}

module.exports = {not_found};