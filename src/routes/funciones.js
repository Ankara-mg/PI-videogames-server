const axios = require('axios')
const { Videogame, Genre } = require('../db');

const maxGames = 100

module.exports = {
    getVideogames: async function(API_KEY) {
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
                    platforms: api.data.results[i].platforms.map(p => p.platform.name),
                })
            }
            api = await axios.get(api.data.next) 
        }

        return videogames
    },
    
    searchGames: async function(API_KEY, search){
        var api = await axios.get(`https://api.rawg.io/api/games?key=${API_KEY}`)
        let videogames = []

        let cont = 0
        while( cont < maxGames / 20 && videogames.length < 5){
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
            Genre.create(g)
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
            description: api.data.description
        }

        return game
    },

    createGame: async function(id, name) {

        if(!id || !name){
            throw 'Faltan datos obligatorios'
        }
        
        const newVideogame = {
            id,
            name,
            created: true
        }
        Videogame.create(newVideogame)

        return newVideogame
    }
}
