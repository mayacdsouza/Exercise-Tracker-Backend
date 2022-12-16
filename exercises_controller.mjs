import 'dotenv/config';
import express from 'express';
import * as exercises from './exercises_model.mjs';

const app = express();

app.use(express.json());

const PORT = process.env.PORT;

function validInput(name, reps, weight, unit, date){
    const format = /^\d\d-\d\d-\d\d$/;
    return (name.length !== 0 && 
            reps>0 && Number.isInteger(reps) &&
            weight > 0 && Number.isInteger(weight) &&
            (unit === 'kgs' || unit === 'lbs') &&
            format.test(date))

}

app.post('/exercises', (req,res) => {
    if (validInput(req.body.name, req.body.reps, req.body.weight, req.body.unit, req.body.date)){
        exercises.createExercise(req.body.name, req.body.reps, req.body.weight, req.body.unit, req.body.date)
        .then(exercise =>{
            res.status(201).json(exercise);
        })
        .catch(error => {
            console.error(error);
            res.status(400).json({ Error: 'Invalid request' });
        })
    } else {
        res.status(400).json({ Error: 'Invalid request'})
    }

});

app.get('/exercises', (req, res) => {
    let filter = {};
    exercises.findExercises(filter, '', 0)
        .then(exercises => {
            res.send(exercises);
        })
        .catch(error => {
            console.error(error);
            res.send({ Error: 'Request failed' });
        });
});

app.get('/exercises/:_id', (req,res) => {
    const exerciseId = req.params._id;
    exercises.findExerciseById(exerciseId)
        .then(exercise => {
            if (exercise !== null) {
                res.json(exercise)
            } else {
                res.status(404).json({Error: 'Not found'});
            }
        })
        .catch(error => {
            console.error(error);
            res.status(400).json({ Error: 'Request failed'});
        })
});

app.put('/exercises/:_id', (req,res) => {
    if (validInput(req.body.name, req.body.reps, req.body.weight, req.body.unit, req.body.date)){
        exercises.replaceExercise({ _id: req.params._id}, {name: req.body.name, reps: req.body.reps, weight: req.body.weight, unit: req.body.unit, date: req.body.date })
            .then(numUpdated => {
                if(numUpdated === 1){
                    res.json({ _id: req.params._id, name: req.body.name, reps: req.body.reps, weight: req.body.weight, unit: req.body.unit, date: req.body.date })
                } else {
                    res.status(404).json({ Error: 'Not found'})
                }
            })
    } else {
        res.status(400).json({ Error: 'Invalid request' });
    }
})

app.delete('/exercises/:_id', (req, res) => {
    exercises.deleteById(req.params._id)
        .then(deletedCount => {
            if (deletedCount === 1) {
                res.status(204).send();
            } else {
                res.status(404).json({ Error: 'Not found' });
            }
        })
        .catch(error => {
            console.error(error);
            res.status(400).json({ Error: 'Request failed' });
        });
});


app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}...`);
});