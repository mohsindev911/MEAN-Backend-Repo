const mongoose=require('mongoose');


const PostsSchema=mongoose.Schema({
    user:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"user"
    },
    edate:{
        type:Date,
        default:Date.now
    },
    
    content:String,
    likes:[
        {type:mongoose.Schema.Types.ObjectId, ref:"user"}
    ]
})
module.exports=mongoose.model('posts',PostsSchema);