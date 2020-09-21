const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const courseSchema = new Schema({

    name: {
        type: String,
        unique: true,
        required: [true, "Proporcione un nombre"],
    },
    parallels: [{
        type: Schema.Types.Map,
        required: false,
    }]
});

module.exports = mongoose.model("Course", courseSchema);