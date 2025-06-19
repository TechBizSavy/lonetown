import { Server as HttpServer } from 'http'
import { Server as SocketIOServer } from 'socket.io'
import { NextApiResponse } from 'next'
import { getServerSession } from 'next-auth'
import { authOptions } from './auth'

export type NextApiResponseServerIO = NextApiResponse & {
  socket: {
    server: HttpServer & {
      io: SocketIOServer
    }
  }
}

export const initSocket = (server: HttpServer) => {
  const io = new SocketIOServer(server, {
    path: '/api/socket',
    cors: {
      origin: process.env.NEXTAUTH_URL || 'http://localhost:3000',
      methods: ['GET', 'POST']
    }
  })

  io.use(async (socket, next) => {
    try {
      // You can add authentication here if needed
      // For now, we'll allow all connections
      next()
    } catch (error) {
      next(new Error('Authentication error'))
    }
  })

  io.on('connection', (socket) => {
    console.log('User connected:', socket.id)

    socket.on('join-match', (matchId: string) => {
      socket.join(`match-${matchId}`)
      console.log(`User joined match room: match-${matchId}`)
    })

    socket.on('leave-match', (matchId: string) => {
      socket.leave(`match-${matchId}`)
      console.log(`User left match room: match-${matchId}`)
    })

    socket.on('send-message', (data: {
      matchId: string
      message: any
    }) => {
      // Broadcast to all users in the match room except sender
      socket.to(`match-${data.matchId}`).emit('new-message', data.message)
    })

    socket.on('disconnect', () => {
      console.log('User disconnected:', socket.id)
    })
  })

  return io
}