const axios = require('axios')
const { Videogame, Genre } = require('../db');

const maxGames = 25

module.exports = {
    
    getVideogames: async function(API_KEY) {
        const db = await getVideogamesDB()
        const api = await getVideogamesApi(API_KEY)
        const games = db.concat(api)

        return games
    },

    getVideogamesDB: async function (){
        const db = await Videogame.findAll()
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
                    genres: api.data.results[i].genres.map(g => g.name),
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

        let cont = 0
        while( cont < maxGames / 20 && videogames.length < maxArrayLength){
            for(let i = 0 ; i < api.data.results.length ; i++){
    
                if(api.data.results[i].name.toLowerCase().includes(search.toLowerCase())){
                    videogames.push({
                        id: api.data.results[i].id,
                        name: api.data.results[i].name,
                        img: api.data.results[i].background_image,
                        rating: api.data.results[i].rating,
                        esrb: api.data.results[i].esrb_rating.name,
                        genres: api.data.results[i].genres.map(g => g.name),
                        platforms: api.data.results[i].platforms.map(p => p.platform.name),
                    })
                }

                if (videogames.length >= maxArrayLength) break;
            }
            console.log(cont++)
            api = await axios.get(api.data.next) 
        }
    
        if(videogames.length < 1){
            throw 'No se encontraron videojuegos'
        } else {
            return videogames
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

        return genres;
    },

    getOneVideogame: async function(API_KEY, id) {
        const api = await axios.get(`https://api.rawg.io/api/games/${id}?key=${API_KEY}`)

        const game = {
            id: api.data.id,
            name: api.data.name,
            img: api.data.background_image,
            rating: api.data.rating,
            esrb: api.data.esrb_rating.name,
            genres: api.data.genres.map(g => g.name),
            platforms: api.data.platforms.map(p => p.platform.name),
            description: api.data.description,
            release: api.data.released
        }

        return game
    },

    createGame: async function(newGame) {

        const { name, description, releaseDate, platforms, genres, rating, created } = newGame

        if(!name || !description || !platforms || !genres){
            throw 'Faltan datos'
        }

        let newVideogame = await Videogame.create({
            name,
            description,
            releaseDate,
            rating,
            platforms,
            genres,
            created,
        })

        return newVideogame
    }
}
