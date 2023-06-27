const mongoose = require("mongoose")



const noteSchema = new mongoose.Schema(
    {
        note: {
            type: String,
            required: [true, "you gotta give a note"]
        }
    }
)

module.exports = {note: mongoose.model("Note", noteSchema), noteSchema: noteSchema}