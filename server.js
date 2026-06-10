const express = require("express");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

/*
    ============================================================
    EDITAR ESTADO DE LA FABRICA DESDE GITHUB
    ============================================================

    Para cambiar el comportamiento de Unity:
    1. Modificar los valores de estadoFabrica.
    2. Hacer Commit changes en GitHub.
    3. Esperar a que Render despliegue la nueva version.
    4. Unity leera /estado automaticamente y actualizara la escena.
*/

let estadoFabrica = {
    modoFabrica: "AUTOMATICO",

    // Si alarma es true, Unity activara alarma general y bloqueara la puerta.
    alarma: false,

    // Cambiar este valor para probar el sistema energetico:
    // > 50  = NORMAL
    // 25-50 = BAJO CONSUMO
    // < 25  = CRITICO
    nivelEnergia: 75,

    puerta: {
        // Valores posibles: "CERRADA", "ABIERTA", "BLOQUEADA", "ACCESO DENEGADO"
        estado: "CERRADA",
        ultimoAcceso: "API"
    },

    prensa: {
        // Valores posibles: "APAGADA", "ENCENDIDA", "TRABAJANDO", "ERROR", "MANTENIMIENTO"
        estado: "TRABAJANDO",
        ciclos: 12,
        error: false
    },

    generador: {
        // Este estado se recalcula automaticamente segun nivelEnergia.
        estado: "NORMAL",
        consumo: 35
    },

    mensaje: "Estado actualizado desde GitHub y Render"
};

function actualizarGenerador() {
    if (estadoFabrica.nivelEnergia > 50) {
        estadoFabrica.generador.estado = "NORMAL";
    } else if (estadoFabrica.nivelEnergia >= 25) {
        estadoFabrica.generador.estado = "BAJO CONSUMO";
    } else {
        estadoFabrica.generador.estado = "CRITICO";
    }
}

function actualizarAlarma() {
    if (
        estadoFabrica.alarma ||
        estadoFabrica.prensa.error ||
        estadoFabrica.nivelEnergia < 25
    ) {
        estadoFabrica.alarma = true;
    } else {
        estadoFabrica.alarma = false;
    }

    if (estadoFabrica.alarma) {
        estadoFabrica.puerta.estado = "BLOQUEADA";

        if (estadoFabrica.prensa.estado === "TRABAJANDO" && estadoFabrica.nivelEnergia < 25) {
            estadoFabrica.prensa.estado = "MANTENIMIENTO";
        }
    }
}

app.get("/", (req, res) => {
    res.send("API de la fabrica inteligente funcionando correctamente");
});

app.get("/estado", (req, res) => {
    actualizarGenerador();
    actualizarAlarma();
    res.json(estadoFabrica);
});

app.listen(PORT, () => {
    console.log("API de fabrica inteligente escuchando en el puerto " + PORT);
});
