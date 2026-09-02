const express = require("express");
const cors = require("cors");
const connection = require("./config/db");

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Servidor de Turno Fácil funcionando");
});

app.get("/usuarios",(req, res) => {
    const sql = "SELECT id_usuario, nombre, correo, Telefono, reputacion FROM usuarios";
    connection.query(sql,(error,resultados) => {
        if(error){
            console.log(error);
            return res.status(500).json({
                mensaje: "Error al obtener usuarios"
            });
        }
        res.json({
            mensaje: "Lista de usuarios",
            usuarios: resultados
        });
    });
});

app.post("/usuarios",(req,res) => {
    const { nombre, correo, Telefono, contrasena } = req.body;
    if (!nombre || !correo || !Telefono || !contrasena) {
        return res.status(400).json({mensaje: "Todos los campos son obligatorios"});
    }
    const sql = `
    insert into usuarios(nombre, correo, Telefono, contrasena)
    VALUES (?, ?, ?, ?)
    `;

    connection.query(
        sql,
        [nombre, correo, Telefono, contrasena],
        (error, resultado) => {
            if(error){
                console.log(error);
                return res.status(500).json({
                    mensaje: "error al registrar el usuario"
                });
            }
            res.status(201).json({
                mensaje: "usuario registrado correctamente",
                usuario: {

                    id_usuario: resultado.insertId,
                    nombre, correo, Telefono
                }
            });
        }
    );
});

app.post("/login", (req, res)=> {
    const { correo, contrasena } = req.body;
    if (!correo || !contrasena) {return res.status(400).json({
    mensaje: "Correo y contraseña son obligatorios"});
    }
    const sql = `
    SELECT
    id_usuario, 
    nombre, 
    correo, 
    Telefono, 
    reputacion 
    FROM usuarios 
    WHERE correo = ? AND contrasena = ? 
    `; 
    connection.query(
        sql,
        [correo, contrasena],
        (error, resultados) => {
            if (error) {console.log(error);
                return res.status(500).json({mensaje: "Error al iniciar sesión"})
              }
                 if (resultados.length === 0) { return res.status(401).json ({
                 mensaje: "Correo o contraseña incorrectos",
                 usuario: resultados[0]
                });
                }
            res.status(200).json({mensaje:"Inicio de sesión exitoso",
                usuario: resultados[0]
            });
        }
    );
});

const PORT = 3000;

app.listen(PORT, () => {
  console.log(`Servidor corriendo en puerto ${PORT}`);
});