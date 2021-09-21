var express = require('express');
var router = express.Router();
var bhrgmodel = require("../modules/data");
var bank = bhrgmodel.find({});
var transmodel = require('../modules/transhistory');
var history = transmodel.find({});

var bodyparser = require("body-parser");
const { InsufficientStorage } = require('http-errors');


/* GET home page. */
router.get('/', function(req, res, next) {
  res.status(200).render('index', { title: 'BHRG BANK' });
});

router.get('/allusers', function(req, res, next){
  bank.exec(function(err,data){
    if(err) throw err;
    res.status(200).render('allusers', {title: 'USERS', records: data});
  });

});

router.get('/allusers/:id', function(req, res){
  bhrgmodel.findById(req.params.id, function(err,data){
    if(err){
      console.log(err);
    } else {
      res.status(200).render('user', {title:"DETAILS", sender:data});
      
      
    }
  })
});
router.post('/allusers/:id', async(req, res)=>{

  let mydata = {
   sendername : req.body.sendername,
   senderbalance : req.body.senderbalance,
   receivername : req.body.receivername,
   amount : req.body.amount
  //  receiverbalance : req.body.receiverbalance
  }
console.log(mydata.sendername)
console.log(mydata.senderbalance)
console.log(mydata.receivername)
// console.log(receiverbalance)

var senderBalance = parseInt(mydata.senderbalance)
var Amount = parseInt(mydata.amount)


var receiverbal = await bhrgmodel.findOne({name: mydata.receivername});
// console.log(receiverbal)

var getb = receiverbal;
// console.log(getb.accbalance)
let receiverbalance = parseInt(getb.balance);
console.log(receiverbalance)

console.log(mydata.amount)
if(Amount <= 0){
bhrgmodel.findById(req.params.id, function(err,data){
  if(err){
    console.log(err);
  } else {
    res.render('user', {title:"DETAILS", sender:data});
  }
})
}else if(senderBalance < Amount){
  bhrgmodel.findById(req.params.id, function(err,data){
    if(err){
      console.log(err);
    } else {
      res.render('user', {title:"DETAILS", sender:data});
    }
  })
}else{
  var debitmoney = parseInt(senderBalance) - parseInt(Amount)
  console.log(debitmoney)
  var creditmoney = parseInt(receiverbalance) + parseInt(Amount)
  console.log(creditmoney)
  // var sendername: req.body.sendername
  // var receivername: req.body.receivername

  var details = await new transmodel({
    sendername: req.body.sendername,
    receivername: req.body.receivername,
    amount: parseInt(req.body.amount),
    date: new Date()
  }).save(async(err,data)=>{
    if(err) throw err
    await console.log("successfully Inserted")
  });
  

   await bhrgmodel.findOneAndUpdate({name: mydata.sendername},{balance:debitmoney},(err)=>{
    if(err) throw err;
    console.log("sender Data updated Successfully")
  })
   await bhrgmodel.findOneAndUpdate({name: mydata.receivername},{balance:creditmoney},(err)=>{
    if(err) throw err;
    console.log("receiver Data updated Successfully")
  })
   history.exec(function(err,data){
    if(err) throw err;
    res.status(200).render('transfer', {title: 'ALL TRANSFER', trans: data});
  });
};

});


router.get('/transfer', async(req, res, next)=>{
  console.log(history.exec())
  await history.exec(function(err,data){
    if(err) throw err;
    res.status(200).render('transfer', {title: 'ALL transfer', trans: data});
  });

});
 
module.exports= router;




