const axios = require('axios')
const { Videogame, Genre } = require('../db');
const sequelize = require('sequelize')

const maxGames = 100

module.exports = {
    
    getVideogames: async function(API_KEY) {
        const db = await getVideogamesDB()
        const api = await getVideogamesApi(API_KEY)
        const games = db.concat(api)

        return games
    },

    getVideogamesDB: async function (){
        const db = await Videogame.findAll({
            include: [{
                model: Genre,
                attributes: ['name'],
                through: {
                    attributes: []
                }
            }]
        })
        return db
    },

    getVideogamesApi: async function(API_KEY) {
        let api = await axios.get(`https://api.rawg.io/api/games?key=${API_KEY}`)
        let videogames = []
        
        for(let j = 0 ; j < maxGames / 20 ; j ++){
            for(let i = 0 ; i < api.data.results.length ; i++){
                videogames.push({
                    id: api.data.results[i].id,
                    name: api.data.results[i].name,
                    img: api.data.results[i].background_image,
                    rating: api.data.results[i].rating,
                    genres: api.data.results[i].genres.map(g => g),
                })
            }
            api = await axios.get(api.data.next) 
        }

        return videogames
    },

    searchGames: async function(API_KEY, search){
        var api = await axios.get(`https://api.rawg.io/api/games?key=${API_KEY}`)
        let videogames = []
        const maxArrayLength = 15

        const fromDb = await Videogame.findAll({
            limit: 15,
            where: {
                name: sequelize.where(sequelize.fn('LOWER', sequelize.col('name')), 'LIKE', '%' + search + '%')
            },
            include: [{
                model: Genre,
                attributes: ['name'],
                through: {
                    attributes: []
                }
            }]
        })

        let cont = 0
        while( cont < maxGames / 20 && videogames.length < maxArrayLength && fromDb < maxArrayLength){
            for(let i = 0 ; i < api.data.results.length ; i++){
    
                if(api.data.results[i].name.toLowerCase().includes(search.toLowerCase())){
                    videogames.push({
                        id: api.data.results[i].id,
                        name: api.data.results[i].name,
                        img: api.data.results[i].background_image,
                        rating: api.data.results[i].rating,
                        esrb: api.data.results[i].esrb_rating.name,
                        genres: api.data.results[i].genres.map(g => g),
                        platforms: api.data.results[i].platforms.map(p => p.platform.name),
                    })
                }

                if (videogames.length >= maxArrayLength) break;
            }
            console.log(cont++)
            api = await axios.get(api.data.next) 
        }
    
        const response = fromDb.concat(videogames)

        if(response.length < 1){
            throw 'No se encontraron videojuegos'
        } else {
            return response
        }

    },

    getGenres: async function(API_KEY) {
        
        const api = await axios.get(`https://api.rawg.io/api/genres?key=${API_KEY}`)
        let genres = []

        for(let i = 0 ;  i < api.data.results.length ; i ++){
            genres.push({
                id: api.data.results[i].id,
                name: api.data.results[i].name
            })
        }

        genres.forEach(g => {
            Genre.findOrCreate({
                where: {id: g.id, name: g.name}
            })
        })

        const allGenres = await Genre.findAll()

        return allGenres;
    },

    getOneVideogame: async function(API_KEY, id) {
        if(/[a-zA-Z]/.test(id)){
            const game =  await Videogame.findByPk(id, {
                include: [{
                    model: Genre,
                    attributes: ['name'],
                    through: {
                        attributes: []
                    } 
                }]
            })
            return game
            
        } else {
            const api = await axios.get(`https://api.rawg.io/api/games/${id}?key=${API_KEY}`)
    
            const game = {
                id: api.data.id,
                name: api.data.name,
                img: api.data.background_image,
                rating: api.data.rating,
                genres: api.data.genres.map(g => g),
                platforms: api.data.platforms.map(p => p.platform.name),
                description: api.data.description,
                release: api.data.released
            }
    
            return game
        }
    },

    createGame: async function(newGame) {

        const { name, description, platforms, genres, created } = newGame
        let { img, release, rating } = newGame

        if(!name || !description || !platforms || !genres){
            throw 'Faltan datos obligatorios'
        }

        if(img.length == 0 ){
            img = undefined
        }

        if(typeof(rating) === 'string'){
            rating = undefined
        }

        if(release.length === 0){
            release = undefined
        }

        const genresDb = await Genre.findAll({
            where: {name : genres}
        })

        let newVideogame = await Videogame.create({
            name,
            description,
            img,
            release,
            rating,
            platforms,
            genres,
            created,
        })

        newVideogame.addGenre(genresDb)

        return newVideogame
    }
}
