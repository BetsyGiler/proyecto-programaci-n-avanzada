
const db_error = (error, response)=>{

    return response.status(500).json({
        success: false,
        message: "Error in database",
        error
    });
}

module.exports = {db_error}