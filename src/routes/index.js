const { Router } = require('express');
// Importar todos los routers;
// Ejemplo: const authRouter = require('./auth.js');

require('dotenv').config();
const { API_KEY } = process.env;
const { Videogame } = require('../db.js')

const funciones = require('./funciones')

const router = Router();

// Configurar los routers
// Ejemplo: router.use('/auth', authRouter);

router.get('/videogames', async(req, res) => {

    const { name } = req.query

    try {
        if(!name){
            const db = await funciones.getVideogamesDB()
            const api = await funciones.getVideogamesApi(API_KEY)
            const games = db.concat(api)

            res.status(200).json(games)
        }
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


router.post('/videogame/create', async(req, res) => {
    const game = req.body

    try {
        res.status(200).json(await funciones.createGame(game))
    } catch (error) {
        res.status(404).send({error})
    }
})

router.get('/henry', async(req, res)=>{
    
    const henry = await Videogame.findAll({
        where: {
            name: 'Henry'
        }
    })

    res.json(henry)

})

module.exports = router;
