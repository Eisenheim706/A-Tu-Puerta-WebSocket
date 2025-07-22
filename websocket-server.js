const { Server } = require('socket.io');
const http = require('http');

// Crear servidor HTTP básico
const server = http.createServer();
const io = new Server(server, {
  cors: {
    origin: "*", // Permite todos los orígenes
    methods: ["GET", "POST"]
  }
});

// Almacén simple para las ubicaciones de los pedidos
const pedidos = {};

io.on('connection', (socket) => {
  console.log('Nuevo cliente conectado:', socket.id);

  // Unirse a una sala específica de pedido
  socket.on('unirse_pedido', (pedidoId) => {
    socket.join(pedidoId);
    console.log(`Cliente ${socket.id} se unió al pedido ${pedidoId}`);
    
    // Si ya tenemos ubicaciones para este pedido, enviar la última
    if (pedidos[pedidoId]) {
      socket.emit('actualizacion_ubicacion', pedidos[pedidoId]);
    }
  });

  // Escuchar actualizaciones de ubicación de mensajeros
  socket.on('actualizar_ubicacion', (data) => {
    const { pedidoId, lat, lng } = data;
    console.log(`Actualización de ubicación para pedido ${pedidoId}: ${lat}, ${lng}`);
    
    // Guardar la última ubicación
    pedidos[pedidoId] = { lat, lng };
    
    // Transmitir a todos en la sala del pedido
    io.to(pedidoId).emit('actualizacion_ubicacion', { pedidoId, lat, lng });
  });

  socket.on('disconnect', () => {
    console.log('Cliente desconectado:', socket.id);
  });
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`Servidor WebSocket escuchando en puerto ${PORT}`);
});