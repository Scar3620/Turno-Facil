const express = require("express");
const cors = require("cors");
const connection = require("./config/db");

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Servidor de Turno Fácil funcionando");
});
// Lista de negocios activos de una categoría
app.get("/negocios", (req, res) => {
    const { categoria_id } = req.query;
    if (!categoria_id) {
        return res.status(400).json({ mensaje: "categoria_id es obligatorio" });
    }
    const sql = `
        SELECT negocio_id, nombre_negocio, descripcion, direccion, horario_atencion
        FROM negocios
        WHERE categoria_id = ? AND activo = 1
    `;
    connection.query(sql, [categoria_id], (error, resultados) => {
        if (error) {
            console.log(error);
            return res.status(500).json({ mensaje: "Error al obtener negocios" });
        }
        res.json({ mensaje: "Lista de negocios", negocios: resultados });
    });
});
 
// Servicios que ofrece un negocio específico (con precio y duración)
app.get("/negocios/:id/servicios", (req, res) => {
    const { id } = req.params;
    const sql = `
        SELECT ds.detalle_servicio_id, s.nombre_servicio, ds.precio, ds.duracion_minutos
        FROM detalle_servicios ds
        JOIN servicios s ON s.servicio_id = ds.servicio_id
        WHERE ds.negocio_id = ?
    `;
    connection.query(sql, [id], (error, resultados) => {
        if (error) {
            console.log(error);
            return res.status(500).json({ mensaje: "Error al obtener servicios" });
        }
        res.json({ mensaje: "Servicios del negocio", servicios: resultados });
    });
});
 
// Profesionales que trabajan en un negocio específico
app.get("/negocios/:id/profesionales", (req, res) => {
    const { id } = req.params;
    const sql = "SELECT profesional_id, nombre FROM profesionales WHERE negocio_id = ?";
    connection.query(sql, [id], (error, resultados) => {
        if (error) {
            console.log(error);
            return res.status(500).json({ mensaje: "Error al obtener profesionales" });
        }
        res.json({ mensaje: "Profesionales del negocio", profesionales: resultados });
    });
});
 
// Horarios disponibles de un profesional para un servicio específico,
// marcando cuáles ya fueron reservados
app.get("/horarios", (req, res) => {
    const { detalle_servicio_id, profesional_id } = req.query;
    if (!detalle_servicio_id || !profesional_id) {
        return res.status(400).json({ mensaje: "detalle_servicio_id y profesional_id son obligatorios" });
    }
    const sql = `
        SELECT
            h.horario_id,
            h.fecha,
            h.hora,
            EXISTS(
                SELECT 1 FROM reservas r
                WHERE r.fecha = h.fecha
                  AND r.hora = h.hora
                  AND r.profesional_id = h.profesional_id
                  AND r.detalle_servicio_id = h.detalle_servicio_id
                  AND r.estado != 'cancelada'
            ) AS reservado
        FROM horarios_disponibles h
        WHERE h.detalle_servicio_id = ? AND h.profesional_id = ?
        ORDER BY h.fecha, h.hora
    `;
    connection.query(sql, [detalle_servicio_id, profesional_id], (error, resultados) => {
        if (error) {
            console.log(error);
            return res.status(500).json({ mensaje: "Error al obtener horarios" });
        }
        res.json({ mensaje: "Horarios disponibles", horarios: resultados });
    });
});

app.get("/categorias", (req, res) => {
    const sql = "SELECT categoria_id, nombre, descripcion FROM categorias";
    connection.query(sql, (error, resultados) => {
        if (error) {
            console.log(error);
            return res.status(500).json({
                mensaje: "Error al obtener categorías"
            });
        }
        res.json({
            mensaje: "Lista de categorías",
            categorias: resultados
        });
    });
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
    // Antes de insertar, buscamos si ya existe un usuario con ese correo o ese teléfono
    const sqlVerificar = "SELECT correo, Telefono FROM usuarios WHERE correo = ? OR Telefono = ?";

    connection.query(sqlVerificar, [correo, Telefono], (error, resultados) => {
        if (error) {
            console.log(error);
            return res.status(500).json({ mensaje: "Error al verificar el usuario" });
        }

        if (resultados.length > 0) {
            const correoRepetido = resultados.some((u) => u.correo === correo);
            const telefonoRepetido = resultados.some((u) => u.Telefono === Telefono);

            if (correoRepetido && telefonoRepetido) {
                return res.status(409).json({ mensaje: "El correo y el teléfono ya están registrados" });
            }
            if (correoRepetido) {
                return res.status(409).json({ mensaje: "El correo ya está registrado" });
            }
            if (telefonoRepetido) {
                return res.status(409).json({ mensaje: "El teléfono ya está registrado" });
            }
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
});

app.post("/login", (req, res) => {
  const { correo, contrasena } = req.body;
  if (!correo || !contrasena) {
    return res.status(400).json({ mensaje: "Correo y contraseña son obligatorios" });
  }

  const sql = "SELECT * FROM usuarios WHERE correo = ?";
  connection.query(sql, [correo], (error, resultados) => {
    if (error) return res.status(500).json({ mensaje: "Error en el servidor" });
    if (resultados.length === 0) return res.status(404).json({ mensaje: "Usuario no existe" });

    const usuario = resultados[0];
    if (usuario.contrasena !== contrasena) {
      return res.status(401).json({ mensaje: "Contraseña incorrecta" });
    }

    res.json({ mensaje: "Inicio de sesión exitoso", usuario });
  });
});


const PORT = 3000;

app.listen(PORT, () => {
  console.log(`Servidor corriendo en puerto ${PORT}`);
});