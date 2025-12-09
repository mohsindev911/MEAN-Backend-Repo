const mongoose=require('mongoose');
mongoose.connect(`mongodb://127.0.0.1:27017/authapp`);

const userSchema=mongoose.Schema({
    UserName:String,
    email:String,
    age:Number,
    password:String,
    posts:[
        {type:mongoose.Schema.Types.ObjectId, ref:"posts"}
    ]
})
module.exports=mongoose.model('user',userSchema);