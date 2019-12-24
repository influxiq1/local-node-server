var express=require('express');
var app=express();
const http=require('http');
var bodyparser=require('body-parser');
var moment=require('moment');
// var async=require('async');
// const download = require('download');
// const sgMail = require('@sendgrid/mail');
app.use(bodyparser.json({parameterLimit:10000000,limit:'900mb'}));
/*=========create servere=============*/
var server=app.listen(8000,function(){
    var host='127.0.0.1';
    var port=server.address().port;
    console.log("Server is Running at http://%s:%s",host,port);
});
app.use(function(req, res, next) {
    //allow cross origin requests
    res.setHeader("Access-Control-Allow-Methods", "POST, PUT, OPTIONS, DELETE, GET");
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept,access-token");
    next();
});
app.get('/',function (req,resp){
resp.send('Himadri');
});
/*Connect to Database*/
var mongo=require('mongodb');
var db;
// var url='mongodb+srv://mdstock-internation-dev:Devthecoder7*@cluster0-4m8c2.mongodb.net/admin?retryWrites=true&w=majority';
var uri = "mongodb+srv://traning:Devthecoder7*@cluster0-byq0z.mongodb.net/test?retryWrites=true&w=majority";

var client=mongo.MongoClient;
client.connect(uri,function(err,database){
    if(err){
        console.log('Error Occoured');
    }else{
        db=database.db('traning');
        // db=database.db('crm');
        console.log('Successfully Connected to Database');
    }
});

app.get('/test', function(req, resp){
	resp.send(JSON.stringify("test is Successfully Connected"));
	console.log('test is Successfully Connected');
});

app.post('/testpost', function(req, resp){
	resp.send(JSON.stringify("test is Successfully Connected"));
	console.log('test is Successfully Connected');
});

app.post('/addorupdatedata',function(req,resp){

    // var token = req.body.token || req.query.token || req.headers['authorization'];
    // verifytoken(token);
    // if(tokenstatus!=true){
    //     //db.close();
    //     resp.send(JSON.stringify({'status':'error',token:token,errormessage:tokenstatus}));
    //     return;
    // }

    // MongoClient.connect(uri, function(err, database) {
        // if (err) throw err;


        // db=database.db('traning');

        var crypto = require('crypto');
        if(typeof(req.body.data)!='undefined' && typeof(req.body.data.password)!='undefined')  req.body.data.password = crypto.createHmac('sha256', req.body.data.password)
            .update('password')
            .digest('hex');

        var added_time= new Date().getTime();
        for(var i in req.body.sourceobj){
            if(req.body.data[req.body.sourceobj[i]]!=null && req.body.data[req.body.sourceobj[i]].length>2){
                req.body.data[req.body.sourceobj[i]] = mongoose.Types.ObjectId(req.body.data[req.body.sourceobj[i]]);
            }
        }

        var striptags = require('striptags');
        if(typeof (req.body.data.priority)!='undefined') req.body.data.priority=parseInt(req.body.data.priority);
        if(typeof (req.body.data.description)!='undefined') req.body.data.description_html=striptags(req.body.data.description);
        if(typeof(req.body.data)!='undefined' && typeof(req.body.data.confirmpassword)!='undefined')  req.body.data.confirmpassword = null;
        var collection = db.collection(req.body.source.toString());
        if(typeof(req.body.data.id)=='undefined'){
            req.body.data['created_at']=added_time;

            setTimeout(function () {
                collection.insert([req.body.data], function (err, result) {
                    if (err) {
                        resp.send(JSON.stringify({'status':'failed','id':0}));
                    } else {
                        // database.close();
                        resp.send(JSON.stringify({'status':'success','res':result.ops[0]._id}));
                        return;
                    }
                });
            },10);
        }

        if(typeof(req.body.data.id)!='undefined'){
            console.log(req.body.data);

                req.body.data['updated_at']=added_time;
                var o_id = mongoose.Types.ObjectId(req.body.data.id);
                collection.update({_id:o_id}, {$set: req.body.data},function (err, result){
                    if(err){
                        // database.close();
                        resp.send(JSON.stringify({'status':'success',update:1,err:err}));
                        return;
                    }else {
                        // database.close();
                        resp.send(JSON.stringify({'status': 'success', update: 1}));
                        return;
                    }
                });


            }
    // });

});



app.post('/datalist',function (req,resp) {

    // MongoClient.connect(uri, function(err, database) {
    //     if (err) throw err;
        // db = database.db('traning');
        if (typeof (req.body.source.toString()) != 'undefined' && req.body.source.toString() != null) {
            var i = 0;
            var tval;
            var bval;
            var ck;
            var rg;
            var varr = req.body.condition;
            var bvarr = [];
            if (typeof (req.body.condition) != 'undefined') {
                Object.keys(varr).forEach(function (c) {
                    ck = '_object';
                    rg = '_regex';
                    if (c.indexOf(ck) >= 0 || c.indexOf(rg) >= 0) {
                        tavl = varr[c];
                        if (c.indexOf(ck) >= 0) bval = c.replace('_object', '');
                        if (c.indexOf(rg) >= 0) bval = c.replace('_regex', '');
                        if (c.indexOf(ck) >= 0) bvarr[bval] = mongoose.Types.ObjectId(varr[c]);
                        if (c.indexOf(rg) >= 0) {
                            bvarr[bval] = new RegExp(varr[c]);
                        }
                    } else bvarr[c] = varr[c];
                    i++;
                });
                req.body.condition = Object.assign({}, bvarr);
            }
            if (typeof (req.body.condition) != 'undefined' && typeof (req.body.condition._id) != 'undefined' && typeof (req.body.condition._id) != 'object') {
                req.body.condition._id = mongoose.Types.ObjectId(req.body.condition._id);
            }
            var cond = req.body.condition;
            var collection = db.collection(req.body.source.toString());
            collection.find(cond).toArray(function (err, items) {
                if (err) {
                    // database.close();
                    resp.send(JSON.stringify({'res': []}));
                } else {
                    // database.close();
                    resp.send(JSON.stringify({
                        'res': items,
                        'resc': items.length,
                        cond: cond,
                        kio: 'ss',
                        RegExp: RegExp('222')
                    }));
                }
            });
        }
    // });
});