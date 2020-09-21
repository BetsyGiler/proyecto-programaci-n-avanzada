const app = require('express')();

const Parallels = require('../../database/models/Parallels');

const {db_error} = require('../errors/db_error');

app.get('/courses/:id', (req, res)=>{

    const courseID = req.params.id;

    const from = parseInt(req.query.from) || 0;
    const limit = parseInt(req.query.limit) || 10;

    Parallels.find({course: courseID})
    .skip(from)
    .limit(limit)
    .populate('course', 'name')
    .exec((error, responseDB)=>{

        if(error) {
            return db_error;
        }

        return res.json({
            success: true,
            message: `Mostrando registros desde e ${from} hasta el ${limit + from - 1}`,
            data: responseDB
        });
    });
});

module.exports = app;