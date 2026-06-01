const express = require("express");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

let estadoFabrica = {
    modoFabrica: "MANUAL",
    alarma: false,
    nivelEnergia: 75,

    puerta: {
        estado: "CERRADA",
        ultimoAcceso: "Ninguno"
    },

    prensa: {
        estado: "APAGADA",
        ciclos: 0,
        error: false
    },

    generador: {
        estado: "NORMAL",
        consumo: 35
    },

    mensaje: "API iniciada correctamente"
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
    estadoFabrica.alarma =
        estadoFabrica.prensa.error ||
        estadoFabrica.nivelEnergia < 25;

    if (estadoFabrica.alarma) {
        estadoFabrica.puerta.estado = "BLOQUEADA";
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

app.get("/normal", (req, res) => {
    estadoFabrica.modoFabrica = "AUTOMATICO";
    estadoFabrica.nivelEnergia = 75;
    estadoFabrica.generador.consumo = 35;

    estadoFabrica.prensa.estado = "TRABAJANDO";
    estadoFabrica.prensa.error = false;
    estadoFabrica.prensa.ciclos += 1;

    estadoFabrica.puerta.estado = "CERRADA";
    estadoFabrica.puerta.ultimoAcceso = "API";

    estadoFabrica.mensaje = "Funcionamiento normal desde API";

    actualizarGenerador();
    actualizarAlarma();

    res.json(estadoFabrica);
});

app.get("/bajo-consumo", (req, res) => {
    estadoFabrica.modoFabrica = "AUTOMATICO";
    estadoFabrica.nivelEnergia = 40;
    estadoFabrica.generador.consumo = 55;

    estadoFabrica.prensa.estado = "ENCENDIDA";
    estadoFabrica.prensa.error = false;

    estadoFabrica.puerta.estado = "CERRADA";
    estadoFabrica.puerta.ultimoAcceso = "API";

    estadoFabrica.mensaje = "Modo bajo consumo activado desde API";

    actualizarGenerador();
    actualizarAlarma();

    res.json(estadoFabrica);
});

app.get("/critico", (req, res) => {
    estadoFabrica.modoFabrica = "AUTOMATICO";
    estadoFabrica.nivelEnergia = 15;
    estadoFabrica.generador.consumo = 80;

    estadoFabrica.prensa.estado = "MANTENIMIENTO";
    estadoFabrica.prensa.error = false;

    estadoFabrica.puerta.estado = "BLOQUEADA";
    estadoFabrica.puerta.ultimoAcceso = "Bloqueado";

    estadoFabrica.mensaje = "Energia critica. Sistema en alarma";

    actualizarGenerador();
    actualizarAlarma();

    res.json(estadoFabrica);
});

app.get("/error-prensa", (req, res) => {
    estadoFabrica.modoFabrica = "AUTOMATICO";
    estadoFabrica.nivelEnergia = 60;
    estadoFabrica.generador.consumo = 45;

    estadoFabrica.prensa.estado = "ERROR";
    estadoFabrica.prensa.error = true;

    estadoFabrica.puerta.estado = "BLOQUEADA";
    estadoFabrica.puerta.ultimoAcceso = "Bloqueado";

    estadoFabrica.mensaje = "Error detectado en la prensa";

    actualizarGenerador();
    actualizarAlarma();

    res.json(estadoFabrica);
});

app.get("/rfid", (req, res) => {
    actualizarGenerador();
    actualizarAlarma();

    if (estadoFabrica.alarma) {
        estadoFabrica.puerta.estado = "ACCESO DENEGADO";
        estadoFabrica.puerta.ultimoAcceso = "RFID denegado";
        estadoFabrica.mensaje = "RFID detectado, acceso denegado por alarma";
    } else {
        estadoFabrica.puerta.estado = "ABIERTA";
        estadoFabrica.puerta.ultimoAcceso = "RFID";
        estadoFabrica.mensaje = "Acceso RFID permitido desde API";
    }

    res.json(estadoFabrica);
});

app.get("/reset", (req, res) => {
    estadoFabrica = {
        modoFabrica: "MANUAL",
        alarma: false,
        nivelEnergia: 75,

        puerta: {
            estado: "CERRADA",
            ultimoAcceso: "Ninguno"
        },

        prensa: {
            estado: "APAGADA",
            ciclos: 0,
            error: false
        },

        generador: {
            estado: "NORMAL",
            consumo: 35
        },

        mensaje: "Sistema reiniciado desde API"
    };

    res.json(estadoFabrica);
});

app.listen(PORT, () => {
    console.log("API de fabrica inteligente escuchando en el puerto " + PORT);
});
