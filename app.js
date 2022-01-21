require('dotenv').config();
const colors = require('colors');
const { inquirerMenu, pausa, leerInput, listarLugares } = require("./helpers/inquierer");
const Busquedas = require("./models/busquedas");

const main = async() => {
  const busquedas = new Busquedas();
  let opt;

  do {
    opt =  await inquirerMenu();
    switch(opt) {
      case 1:
        // Mostrar mensaje
        const termino = await leerInput('Ciudad: ');
        
        // Buscar los lugares
        const lugares = await busquedas.ciudad(termino);

        // Seleccionar el lugar
        const id = await listarLugares(lugares);
        if ( id === '0' ) continue;

        const lugarSeleccionado = lugares.find(l => l.id === id);
        // Guardar en DB
        busquedas.agregarHistorial(lugarSeleccionado.nombre);
        
        // Clima
        const clima = await busquedas.climaLugar(lugarSeleccionado.lat, lugarSeleccionado.lng);
        // console.log({clima});
        // Mostrar resultados
        console.clear();
        console.log('\nInformacionde la ciudad\n'.green);
        console.log('Ciudad:', colors.blue(lugarSeleccionado.nombre));
        console.log('Lat:', lugarSeleccionado.lat);
        console.log('Lng:', lugarSeleccionado.lng);
        console.log('Temperatura:', clima.temp);
        console.log('Mínima:', clima.min);
        console.log('Máxima:', clima.max);
        console.log('Como está el clima:', clima.desc.blue);

        break;
      case 2: 
        busquedas.historialCapitaliado.forEach((lugar, i) => {
          const idx = `${ i + 1}.`.green;
          console.log(`${idx} ${lugar}`);
        });
        break;
    }

    if (opt !== 0) await pausa();
  } while (opt !== 0);
}

main();