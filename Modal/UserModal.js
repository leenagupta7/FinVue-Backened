const mongoose = require('mongoose');
const { ObjectId } = mongoose.Schema.Types;

const UserSchema = new mongoose.Schema({
    userId:{
        type: String,
        required:true
    },
    picture:{
        type:String,
        require:true,
    },
    score:[{type:Number,default:0}],
},
    {
        timestamps:true,
    }
);

const User = mongoose.model('User', UserSchema);
module.exports = User;