const { Server } = require('socket.io');
const http = require('http');

const server = http.createServer();
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

const PORT = process.env.PORT || 4000;

const ubicaciones = {};

io.on('connection', (socket) => {
  console.log('Cliente conectado:', socket.id);

  socket.on('unirse_pedido', (pedidoId) => {
    socket.join(pedidoId);
    console.log(`Socket ${socket.id} unido a pedido ${pedidoId}`);
    
    if (ubicaciones[pedidoId]) {
      socket.emit('actualizacion_ubicacion', ubicaciones[pedidoId]);
    }
  });

  socket.on('actualizar_ubicacion', (data) => {
    const { pedidoId, lat, lng } = data;
    ubicaciones[pedidoId] = { lat, lng };
    io.to(pedidoId).emit('actualizacion_ubicacion', {
      pedidoId,
      lat,
      lng
    });
  });

  socket.on('disconnect', () => {
    console.log('Cliente desconectado:', socket.id);
  });
});

server.listen(PORT, () => {
  console.log(`Servidor WebSocket en puerto ${PORT}`);
});