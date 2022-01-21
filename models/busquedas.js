const axios = require('axios');
const fsPromise = require('fs/promises');
const { constants } = require('fs');

class Busquedas {
  historial = [];
  dbPath = './db/database.json';

  constructor() {
    this.leerDB();
  }

  get historialCapitaliado() {
    return this.historial.map( lugar => {
      let palabras = lugar.split(' ');
      palabras = palabras.map( p => p[0].toUpperCase() + p.substring(1));

      return palabras.join(' ');
    });
  }

  get paramsMapbox() {
    return {
      language: 'es',
      access_token: process.env.MAPBOX_KEY,
      limit: 5
    }
  }

  get paramsOpenWeather() {
    return {
      lang: 'es',
      appid: process.env.OPENWEATHERMAP_KEY,
      units: 'metric'
    }
  }

  async ciudad(lugar='') {
    try {
      // Peticion http
      const instance = axios.create({
        baseURL: 'https://api.mapbox.com/geocoding/v5/',
        params: this.paramsMapbox
      })

      const resp = await instance.get(`mapbox.places/${lugar}.json`)
      return resp.data.features.map(lugar => ({
        id: lugar.id,
        nombre: lugar.place_name,
        lng: lugar.center[0],
        lat: lugar.center[1],
      }));
    } catch (error) {
      console.log(error);
      return [];
    }
  }

  async climaLugar(lat, lon) {
    try {
      const instance = axios.create({
        baseURL: 'https://api.openweathermap.org/data/2.5/',
        params: { ...this.paramsOpenWeather, lat, lon }
      })

      const resp = await instance.get('weather');
      const { main, weather } = resp.data;
      return {
        desc: weather[0].description,
        min: main.temp_min,
        max: main.temp_max,
        temp: main.temp
      };
    } catch (error) {
      if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        console.log(error.response.data);
        console.log(error.response.status);
        console.log(error.response.headers);
      } else if (error.request) {
        // The request was made but no response was received
        // `error.request` is an instance of XMLHttpRequest in the browser and an instance of
        // http.ClientRequest in node.js
        console.log(error.request);
      } else {
        // Something happened in setting up the request that triggered an Error
        console.log('Error', error.message);
      }
    }
  }

  agregarHistorial( lugar = '') {
    if(this.historial.includes(lugar.toLocaleLowerCase())) {
      return;
    }
    this.historial = this.historial.splice(0, 5);

    this.historial.unshift(lugar.toLocaleLowerCase());
    this.guardarDB();
  }

  guardarDB() {
    const payload = {
      historial: this.historial
    }
    fsPromise.writeFile(this.dbPath, JSON.stringify(payload));
  }

  async leerDB() {
    try {
      await fsPromise.access(this.dbPath, constants.R_OK | constants.W_OK);
      const info = await fsPromise.readFile(this.dbPath, { encoding: 'utf-8' });
      const data = JSON.parse(info);
      this.historial = data.historial;
    } catch(error) {
      return null
    }
  }
}

module.exports = Busquedas;