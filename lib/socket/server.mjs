/**
 * WebSocket Server for Real-time Features
 * Handles real-time chat, agent typing indicators, and notifications
 */

export function initSocketServer(server) {
  console.log('[Socket.IO] WebSocket support disabled in development mode');
  console.log('[Socket.IO] Real-time features will use polling fallback');

  // Return a minimal socket.io interface
  return {
    on: () => {},
    emit: () => {},
    close: () => {},
  };
}

export default initSocketServer;
