const { Router } = require('express');
// Importar todos los routers;
// Ejemplo: const authRouter = require('./auth.js');

require('dotenv').config();
const { API_KEY } = process.env;

const funciones = require('./funciones')

const router = Router();

// Configurar los routers
// Ejemplo: router.use('/auth', authRouter);

router.get('/videogames', async(req, res) => {

    const { name } = req.query

    try {
        if(!name)
            res.status(200).json(await funciones.getVideogames(API_KEY))
        else
            res.status(200).json(await funciones.searchGames(API_KEY, name))
    } catch(error){
        res.status(404).json({error})
    }
})

router.get('/genres', async(req, res) => {
    try {
        res.status(200).json(await funciones.getGenres(API_KEY))
    } catch(error){
        res.status(404).json({error})
    }
})

router.get('/videogames/:id', async(req, res) => {

    const {id} = req.params

    try {
        res.status(200).json(await funciones.getOneVideogame(API_KEY, id))
    } catch (error) {
        res.status(404).json({error})
    }
})


router.post('/videogame', async(req, res) => {
    const { id , name } = req.body

    try {
        res.status(200).json(await funciones.createGame(id, name))
    } catch (error) {
        res.status(404).send('Error en alguno de los datos provistos')        
    }
})

module.exports = router;
