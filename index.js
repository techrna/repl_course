const express = require('express')
const app = express()
const cors = require('cors')
const mongoose = require('mongoose')
const bodyParser = require('body-parser')
require('dotenv').config()

app.use(cors())
app.use(bodyParser.urlencoded());
app.use(express.static('public'))
mongoose.connect(process.env.MONGO_URL)


userSchema=new mongoose.Schema({
  "username":String
});
userModel=mongoose.model("user",userSchema);

exerciseSchema=new mongoose.Schema({
  username:String,
  description: String,
  duration: Number,
  date: String,
});
exerciseModel=mongoose.model("exercise",exerciseSchema);

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});

app.post("/api/users",(req,res)=>{
  username=req.body.username;
  user=new userModel({
    username:username
  })
  user.save().then(data=>res.json(data))
})

app.post("/api/users/:_id/exercises",async (req,res)=>{
_id=req.params._id;
description=req.body.description;
duration=req.body.duration;
date= req.body.date!==""?new  Date(req.body.date).toDateString():new  Date().toDateString()


  
  if(date == 'Invalid Date')  {date = new Date().toDateString()}

  user=await userModel.findOne({_id:_id})
  exercise=new exerciseModel({
    username:user.username,
    description:description,
    duration:parseInt(duration),
    date:date
  })
  exercise.save().then(data=>res.json({_id:_id,
    username:data.username,
    description:data.description,
    duration:data.duration,
    date:data.date}))
})
app.get("/api/users",(req,res)=>{
  userModel.find().then(data=>res.json(data)  );
})

app.get("/api/users/:_id/logs",async(req,res)=>{
  _id=req.params._id;
  const {from,to,limit} = req.query;
   user=await userModel.findOne({_id:_id})
  exerciseModel.find({username:user.username},{_id:0,__v:0,username:0}).then((data)=>{
      let log=data;
  
        if(from!=undefined && to!=undefined){
          log = log.filter((ele)=>{
            let eleDate = (new Date(ele.date)).getTime();
            let fromDate = (new Date(from+" 00:00:00")).getTime();
            let toDate = (new Date(to+" 00:00:00")).getTime();

            return eleDate >= fromDate && eleDate <= toDate;
          })
        }
        if(limit!=undefined){
          log = log.slice(0,limit);
        }
        
    
   res.json({
  username: user.username,
  count: log.length,
  _id: _id,
  log: [...log]
}) } );
})




const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})
