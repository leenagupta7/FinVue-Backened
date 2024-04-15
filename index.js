const express = require('express');
const mongoose = require('mongoose');
const Blog = require('./Modal/BlogModal')
const cors = require('cors');
const app = express();
const fileupload = require('express-fileupload');
const User = require('./Modal/UserModal');
const cloudinary = require('cloudinary').v2;
const port = process.env.PORT || 3000;
require('dotenv').config();

app.use(express.json());
app.use(cors());
app.use(fileupload({
    useTempFiles: true
}));

cloudinary.config({
    cloud_name: 'dckp3ubkg',
    api_key: '954137826352828',
    api_secret: 'lF3OAF50khe4Qwn4gbhtlm34xns',
});

app.post('/createblog', async (req, res) => {
    console.log(req.body);
    const file = req.files.file ? req.files.file : null;
    if (file === null) {
        return res.status(500).json({ error: 'Error file is null' })
    }
    cloudinary.uploader.upload(file.tempFilePath, async (err, result) => {
       console.log(result);

        const blog = new Blog({
            userId: req.body.userId,
            username:req.body.username,
            picture:req.body.userImage,
            title: req.body.title,
            description: req.body.description,
            image: result.secure_url,
        });
        blog.save()
            .then(result => {
                console.log(result);
                res.status(200).json({
                    new_blog: result,
                });
            })
            .catch(err => {
                console.error(err);
                res.status(500).json({
                    error: 'Error in creating a blog.',
                });
            });
    })
});
app.get('/getblog', async (req, res) => {
    try {
        const blogs = await Blog.find().sort({createdAt:-1});
        res.status(200).json(blogs);
    } catch (err) {
        console.log('error in fetching blogs:', err);
        res.status(500).json({ err: 'Internal Server Error' });
    }
})
app.delete('/blogdelete/:_id',async(req,res)=>{
    //console.log("hey");
    const id = req.params._id;
    try{
        const data = await Blog.findByIdAndDelete(id);
        //console.log(data);
        res.json(data);
    }catch(err){
        console.log({"blogdelete in backened":err});
    }
})

app.put('/likeblog', async(req, res) => {
    console.log(req.body);
    try{
        const data= await Blog.findByIdAndUpdate(req.body._id,{
            $addToSet:{like:req.body.userId}
        },{new:true});
        //console.log({'like':data})
        res.json(data);
    }catch(err){
        console.log({"error in backened like part":err})
    }
})
app.put('/unlikeblog', async(req, res) => {
    try{
        const data= await Blog.findByIdAndUpdate(req.body._id,{
            $pull:{like:req.body.userId}
        },{new:true});
        //console.log({'unlike':data})
        res.json(data);
    }catch(err){
        console.log({"error in backened like part":err})
    }
})
app.put('/dislikeblog',async(req,res)=>{
    const {_id}=req.body;
    try{
        const data= await Blog.findByIdAndUpdate(_id,{$addToSet:{dislike:req.body.userId}}, {new:true});
        res.json(data);
    }
    catch(error){
        console.log({"error in backend dislike part":error})
    }
})
app.put('/undislikeblog',async(req,res)=>{
    const {_id}=req.body;
    try{
        const data= await Blog.findByIdAndUpdate(_id,{$pull:{dislike:req.body.userId}}, {new:true});
        res.json(data);
    }
    catch(error){
        console.log({"error in backend dislike part":error})
    }
})
app.post('/sendScore/:id', async (req, res) => {
    const id = req.params.id;
    const { score, userId } = req.body;

    try {
        // Find the user by userId
        let user = await User.findOne({ userId });

        if (!user) {
            // If user not found, create a new user
            user = await User.create({ userId });
        }

        // Update user's score at the specified index
        user.score[id] = score;
        await user.save();

        res.status(200).json({ success: true, user:user,message: 'Score updated successfully.' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Internal server error.' });
    }
});

app.get('/getScore/:id',async(req,res)=>{
    const userId = req.params.id;
    console.log(userId);
    try{
        const user = await User.find({userId:userId});
        console.log(user);
        res.json({status:'true',user:user});
    }catch(err){
        console.log(err);
    }
})
app.post('/updateProfile',async(req,res)=>{
    const { userId } = req.body;
    console.log(req.files.file);
    const file = req.files.file ? req.files.file : null;
    if (file === null) {
        return res.status(500).json({ error: 'Error file is null' })
    }
    cloudinary.uploader.upload(file.tempFilePath, async (err, result) => {
        console.log(result);
 
        let user = await User.findOne({ userId });

        if (!user) {
            user = await User.create({
                userId: req.body.userId,
            });
        }
        user.picture= result.secure_url;
        await user.save()
             .then(result => {
                 console.log(result);
                 res.status(200).json({
                    user:user
                 });
             })
             .catch(err => {
                 console.error(err);
                 res.status(500).json({
                     error: 'Error in updating profile pic.',
                 });
             });
     })
})
app.get('/getProfile/:id',async(req,res)=>{
    const userId = req.params.id;
    console.log(userId);
    try{
        const user = await User.find({userId:userId});
        console.log(user);
        res.status(200).json({
            user:user
         });
    }catch(err){
        console.log(err);
    }
})
mongoose.connect(process.env.DATABASE_URL)
.then(() => {
    console.log('MongoDB connected');
    app.listen(port, () => console.log(`Server is running on port ${port}`));
})
.catch(err => console.error(err));