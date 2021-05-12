'use strict';
require('dotenv').config();
const express=require('express');
const superagent=require('superagent');
const pg=require('pg');

const methodOverride=require('method-override');
const PORT = process.env.PORT || 3000;

const app=express();

app.use(methodOverride('_method'));
app.use(express.static('./public'));
app.set('view engine', 'ejs');

app.use(express.urlencoded({ extended: true }));

const client = new pg.Client({ connectionString: process.env.DATABASE_URL,
     ssl: { rejectUnauthorized: false }
});



//Rout
app.get('/',homeHandler);
app.get('/getResult',resultHandler);
app.get('/product',productHandler);
app.get('/allProduct',allProductHandler);
app.get('/save',saveHandler);
app.get('/myCard',myCardHandler);
app.get('/detail/:id',detailHandler);
app.get('/update/:id',updateHandler);
app.get('/delete/:id',deleteHandler);



// Rout Handler
function homeHandler (req,res){
    // res.send('write');
   res.render('index');

}
function resultHandler (req ,res){
    let brand = req.query.brand;
    let greater=req.query.greater;
    let less =req.query.less;
    let url = `http://makeup-api.herokuapp.com/api/v1/products.json?brand=${brand}&price_greater_than=${less}&price_less_than=${greater}`;
    superagent.get(url)
    .then(result=>{
        // res.send(result.body);
        let myData= result.body.map(element=>{
            return new MakeUp(element) ;
        });
        res.render('ProductByPrice',{myData:myData});
    })
}
function productHandler(req,res){
    res.render('product');
}

function allProductHandler (req ,res){
    let brand = req.query.brand;
    console.log(brand);
    let url = `http://makeup-api.herokuapp.com/api/v1/products.json?brand=${brand}`;
    superagent.get(url)
    .then(result=>{
        // res.send(result.body);
        let myData= result.body.map(element=>{
            return new MakeUp(element) ;
        });
        res.render('MaybellineProducts',{myData:myData});
    })
}
function saveHandler(req,res){
   let {name,price,image_link,description} =req.query;
   console.log(req.query);
  
    let sql = `INSERT INTO make_up(name,price,image_link,description)VALUES($1,$2,$3,$4) RETURNING * ;`;
    let saveValues=[name,price,image_link,description];
    client.query(sql,saveValues)
    .then(result=>{
        res.redirect('/myCard');
    });
}
function myCardHandler(req,res){
    let sql =`SELECT * FROM make_up;`;
    client.query(sql)
    .then(result=>{
        res.render('myCard',{myData:result.rows});

    })
}
function detailHandler (req,res){
    let sql = `SELECT * FROM make_up WHERE id=$1;`;
    let save =[req.params.id];
    client.query(sql,save)
    .then(data=>{
        console.log(data.rows[0])
        res.render('detail',{myData:data.rows[0]})
        
    })
}

function updateHandler (req,res){
    let {name,price,image_link,description}=req.query;
    let sql = `UPDATE make_up SET name=$1,price=$2,image_link=$3,description=$4 WHERE id=$5;`;
    let save=[name,price,image_link,description,req.params.id];
    client.query(sql,save)
    .then(data=>{
        // res.redirect(`/detail/${data.rows[0].id}`)
        console.log('-----------',data.rows,'------------------');
        res.redirect(`/detail/${req.params.id}`);
      
    })
}
function deleteHandler(req,res){
    let sql = `DELETE FROM make_up WHERE id=$1;`;
    let save=[req.params.id];
    client.query(sql,save)
    .then(data=>{
        res.redirect('/myCard');
    })
}
// constructor
function MakeUp (element){
    this.name=element.name;
    this.price=element.price;
    this.image_link=(element.image_link) ? element.image_link : `https://www.google.com/url?sa=i&url=https%3A%2F%2Fwww.thermaxglobal.com%2Farticles%2Fchiller-for-a-packaging-manufacturer%2Fimage-not-found%2F&psig=AOvVaw2Rkn0VHfmZcakqdXdcnC6d&ust=1620386260010000&source=images&cd=vfe&ved=0CAIQjRxqFwoTCNCTlbP3tPACFQAAAAAdAAAAABAD`;
    this.description=element.description;

}

// listen
client.connect()
.then(()=>{
    app.listen(PORT,()=>{
        console.log(`listening on Port ${PORT}`);
    })
})
