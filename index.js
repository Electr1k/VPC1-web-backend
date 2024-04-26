const express = require('express');
const { Liquid } = require('liquidjs');
const { Sequelize, DataTypes } = require('sequelize');

const app = express();
const engine = new Liquid();

console.log(process.env.DB_HOST)
console.log(process.env.DB_USER)
console.log(process.env.DB_PASSWORD)
console.log(process.env.DB_NAME)
console.log(process.env.DB_PORT)

const sequelize = new Sequelize(process.env.DB_NAME, 
    process.env.DB_USER,
    process.env.DB_PASSWORD,
    {
        dialect: "postgres",
        host: process.env.DB_HOST,
        port: process.env.DB_PORT,
    }
)



const Tasks = sequelize.define(process.env.DB_NAME,
    {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            allowNull: false
        },
        title: {
            type: DataTypes.STRING,
            allowNull: false,
            maxLength: 255
        },
        dateEnd: {
            type: DataTypes.DATE,
            allowNull: true
        },
        isCompleted: {
            type: DataTypes.BOOLEAN,
            default: false,
            allowNull: false,
        }
    }
)


app.engine('liquid', engine.express()); 
app.set('views', './views');
app.set('view engine', 'liquid');

app.use(express.urlencoded({extended: true}));

app.get('/planned', async (req, res) => {
    const tasks = await Tasks.findAll({where: {isCompleted: false}})
    const tasksDto = []
    tasks.map((task) => {
        const taskDto = task.dataValues
        console.log(`${taskDto.title} ${taskDto.dateEnd} ${Date.now() - taskDto.dateEnd}`)
        if (taskDto.dateEnd){
            taskDto.isRed = taskDto.dateEnd -  Date.now() < 1000 * 3600 * 24
        }
        else taskDto.isRed = false
        tasksDto.push(taskDto)
    })
    res.render('planned', {
        tasks: tasksDto,
    })
});

app.get('/completed', async (req, res) => {
    const tasks = await Tasks.findAll({where: {isCompleted: true}})
    const tasksDto = []
    tasks.map((task) => {
        tasksDto.push(task.dataValues)
    })
    res.render('completed', {
        tasks: tasksDto,
    })
});


app.post('/addTask', async (req, res) => {
    console.log(req.body)
    if (req.body.dateEnd.length === 0) req.body.dateEnd = undefined
    await Tasks.create({
        title: req.body.title,
        dateEnd: req.body.dateEnd,
        isCompleted: false
    })

    res.redirect('planned')
});


app.post('/moveTaskToCompleted', async (req, res) => {
    console.log(req.query)
    await Tasks.update({isCompleted: true},
        {
            where: {
                id: Number(req.query.id)
            }
        })
    res.redirect('planned')
});

app.post('/deleteTask', async (req, res) => {
    console.log(req.query)
    await Tasks.destroy({
        where: {
            id: Number(req.query.id)
        },
    });
    res.redirect('completed')
});

app.listen(8080);