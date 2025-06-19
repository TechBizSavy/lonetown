import { NextApiRequest } from 'next'
import { NextApiResponseServerIO } from '@/lib/websocket'
import { initSocket } from '@/lib/websocket'

export default function handler(req: NextApiRequest, res: NextApiResponseServerIO) {
  if (!res.socket.server.io) {
    console.log('Setting up Socket.IO server...')
    const io = initSocket(res.socket.server)
    res.socket.server.io = io
  }

  res.end()
}