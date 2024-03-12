const express = require('express');
const { Liquid } = require('liquidjs');
const fs = require('node:fs');
const app = express();

app.use('/s', express.static('content'));
app.use(express.urlencoded({extended: true}));

const engine = new Liquid();

// register liquid engine
app.engine('liquid', engine.express()); 
app.set('views', './views');            // specify the views directory
app.set('view engine', 'liquid');       // set liquid to default

const outputStream = fs.createWriteStream("output.txt");

app.get('/', (req, res) => {
    res.render('index');
});


app.post('/calculate', (req, res) => {
    console.log(req.body)
    let result = 0;
    try{
        switch(req.body.operation){
            case '+':
                result = Number(req.body.operand1) + Number(req.body.operand2); 
                break;
            case '-':
                result = Number(req.body.operand1) - Number(req.body.operand2); 
                break;
            case '*':
                result = Number(req.body.operand1) * Number(req.body.operand2); 
                break;
            case '/':
                result = Number(req.body.operand1) / Number(req.body.operand2); 
                break;
        }
        const res = `${req.body.operand1} ${req.body.operation} ${req.body.operand2} = ${result}\n`;
        outputStream.write(res);
    }
    catch(e){

    }
    res.redirect(`/result?v=${result}`);

});

app.get('/result', (req, res) => {
    res.render("result", {
        result: req.query.v,
    });
});



app.listen(3000);