const express=require('express');
const app=express();
const path=require('path');
var jwt = require('jsonwebtoken');
const UserModel=require('./Models/user');
const PostModel=require('./Models/posts');
const cookie=require('cookie-parser')
const bcrypt=require('bcrypt')
app.use(cookie());
const upload=require('./config/multerconfig')



app.use(express.json());
app.use(express.urlencoded({extended:true}));

app.set('view engine','ejs');
app.use(express.static(path.join(__dirname,'public')));

app.get('/', function(req, res){
    res.render('index')
})
app.post('/register', async (req , res)=>{
    let {UserName, email, age, password}=req.body
    let user=await UserModel.findOne({email})
    if(user) res.send("email already exist")
    else{
    bcrypt.genSalt(10, function(err, salt) {
    bcrypt.hash(password, salt, async (err, hash)=> {
          let user= await UserModel.create({
        UserName,
        email,
        password:hash,
        age
    })
    
var token = jwt.sign({ email:email, userId:user._id }, 'shhhhh');
res.cookie("token",token)
    res.redirect('/login')
    });
});
}    

})
app.get('/login', function(req, res){
    res.render('login')
})
app.post('/login', async (req, res)=>{
    let {email, password}=req.body
    let user= await UserModel.findOne({email})
    if(!user) return res.status(500).send("something went wrong")
    else{
 bcrypt.compare(password, user.password).then(function(result) {
    if(result){
var token = jwt.sign({ email:email, userId:user._id }, 'shhhhh');
res.cookie("token",token)
        res.redirect('/profile')
    }
    else{
        res.send("something went wrong")
    }
}); 
    }    
})
app.get('/logout', function(req,res){
    res.cookie("token","")
    res.redirect('/login')
})
app.get('/profile', isLoggedIn, async (req, res)=>{
        let user= await UserModel.findOne({email:req.user.email}).populate('posts')
    res.render('profile',{user})
})
app.post('/post', isLoggedIn,  async (req, res)=>{
    let user= await UserModel.findOne({email:req.user.email})
    let {content}=req.body
   let post= await PostModel.create({
        user:user._id,
        content
    })
    user.posts.push(post._id)
    await user.save()
    res.redirect('/profile')
})
app.get('/like/:id', isLoggedIn, async (req, res)=>{
        let post= await PostModel.findOne({_id:req.params.id}).populate('user')
        if(post.likes.indexOf(req.user.userId)===-1){
 post.likes.push(req.user.userId) 
        }
 else{
    post.likes.splice(post.likes.indexOf(req.user.userId),1)
 }
    await post.save()
    res.redirect('/profile')
})

app.get('/edit/:id',isLoggedIn, async (req, res)=>{
 let post= await PostModel.findOne({_id:req.params.id}).populate('user')
    res.render('edit',{post})
})
app.get('/delete/:id',isLoggedIn, async (req, res)=>{
 let del= await PostModel.findOneAndDelete({_id:req.params.id})
    res.redirect('/profile')
})
app.post('/edit/:id',isLoggedIn, async (req, res)=>{
 let post= await PostModel.findOneAndUpdate({_id:req.params.id},{content:req.body.content}).populate('user')
    res.redirect('/profile')
})
app.get('/profile/upload',isLoggedIn, async (req, res)=>{
    res.render('upload')
})
app.post('/upload', isLoggedIn , upload.single('image'), async (req, res)=>{
let user=await UserModel.findOne({email:req.user.email})
 user.profilePic=req.file.filename;
 await user.save()
 res.redirect('/profile')
})
function isLoggedIn(req, res, next){
if(req.cookies.token=="") return res.redirect('/login')
else{
    var data = jwt.verify(req.cookies.token, 'shhhhh');
    req.user=data
    next()
}    
}
app.listen(3000)