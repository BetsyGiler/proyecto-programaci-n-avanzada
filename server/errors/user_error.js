
const not_found = (response, message="user not found")=>{
    return response.status(404).json({
        success: false,
        error: {
            message
        }
    });
}

module.exports = {not_found};