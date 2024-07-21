const express = require('express');
const fs = require('fs');
const path = require('path');
const Joi = require('joi'); 

const app = express();

let uniqueID = 1;

const usersSchema = Joi.object({
    firstName: Joi.string().min(2).max(30).required(),
    secondName: Joi.string().min(3).required(),
    age: Joi.number().min(0).required(),
    city: Joi.string().min(2)
});

const usersListPath = path.join(__dirname, 'users.json')
app.use(express.json());

/**
* Получить всех пользователей
*/
app.get('/users', (req, res) => {
    const usersJson = fs.readFileSync(usersListPath, 'utf-8');
    const usersData = JSON.parse(usersJson);

    res.send({ users: usersData });
})

/**
* Получить конкретного пользователя
*/
app.get('/users/:id', (req, res) => {
    const usersJson = fs.readFileSync(usersListPath, 'utf-8');
    const usersData = JSON.parse(usersJson);

    const user = usersData.find((user) => user.id === Number(req.params.id));

    if (user) {
        res.send({ user });
    } else {
        res.status(404);
        res.send({
            user: null,
            message: "Пользователь не найден"
        });
    }
})

/**
* Создание нового пользователя
*/
app.post('/users', (req, res) => {
    const validateData = usersSchema.validate(req.body);
    if (validateData.error) {
        return res.status(400).send({ error: validateData.error.details})
    }
    const usersJson = fs.readFileSync(usersListPath, 'utf-8');
    const usersData = JSON.parse(usersJson);
    uniqueID += 1;

    usersData.push({
        id: uniqueID, // "id": 1 + 1
        ...req.body
    });
    fs.writeFileSync(usersListPath, JSON.stringify(usersData));

    res.send({
        id: uniqueID
    })

})


/**
* Обновление статьи
*/
app.put('/users/:id', (req, res) => {
    const validateData = usersSchema.validate(req.body);
    if (validateData.error) {
        return res.status(400).send({ error: validateData.error.details})
    }
    const usersJson = fs.readFileSync(usersListPath, 'utf-8');
    const usersData = JSON.parse(usersJson);

    const user = usersData.find((user) => user.id === Number(req.params.id));

    if (user) {
        user.firstName = req.body.firstName;
        user.secondName = req.body.secondName;
        user.age = req.body.age;
        user.city = req.body.city;

        fs.writeFileSync(usersListPath, JSON.stringify(usersData));

        res.send({ user });
    } else {
        res.status(404);
        res.send({
            user: null,
            message: "Пользователь не найден"
        });
    }
})


/**
* Удаление статьи
*/
app.delete('/users/:id', (req, res) => {
    const usersJson = fs.readFileSync(usersListPath, 'utf-8');
    const usersData = JSON.parse(usersJson);

    const userIndex = usersData.findIndex((user) => user.id === Number(req.params.id));

    if (userIndex > -1) {
        usersData.splice(userIndex, 1); // удаляет 1 элемент массива(с позиции userIndex) 
        fs.writeFileSync(usersListPath, JSON.stringify(usersData));

        res.send({ message: 'Пользователь успешно удален!' });
    } else {
        res.status(404);
        res.send({ message: 'Пользователь не найден!' });
    }
})

/**
* Обработка несуществующих роутов
*/
app.use((req, res) => {
    res.status(404).send({
        message: 'URL not found'
    })
})

app.listen(3000, () => {
    console.log('Сервер запущен');
});

// pm - process manager для мониторинга нагруженности