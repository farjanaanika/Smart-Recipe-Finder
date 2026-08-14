const mongoose = require("mongoose");
const favoriteSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    idMeal: {
        type: String,
        required: true
    },
    strMeal: {
        type: String,
        required: true
    },
    strMealThumb: {
        type: String,
        required: true
    },

    strCategory: {
        type: String
    },
    strArea: {
        type: String
    }
});
module.exports = mongoose.model("Favorite", favoriteSchema);