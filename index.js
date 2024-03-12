const fs = require('node:fs');
const readline = require('node:readline');
const {format, parse} = require('date-fns');

const inputPath = "input.txt";
const outputInPath = "output_in.txt";
const outputOutPath = "output_out.txt";

const inputStream = fs.createReadStream(inputPath);
const outputInStream = fs.createWriteStream(outputInPath);
const outputOutStream = fs.createWriteStream(outputOutPath);

const rl = readline.createInterface(inputStream);

rl.on('line', (line)=>{
    const data = line.split(' ');
    const date = parse(data[0], 'yyyy-mm-dd', new Date());
    const out = format(date, 'mm.dd.yyyy') + ' ' + data[1] + ' ' + data[2] + ' ' + data[3];
    if (data[2] === "IN"){
        outputInStream.write(out + '\n');
    }
    else{
        outputOutStream.write(out + '\n');
    }
});
