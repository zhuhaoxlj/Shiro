'use client'

import { useEffect } from 'react'

import { socketWorker } from '~/socket/worker-client'
import { SocketEmitEnum } from '~/types/events'

/**
 * 文章页面房间加入钩子
 * @param articleId 文章ID
 * @returns
 */
export const useArticleRoom = (articleId?: string) => {
  useEffect(() => {
    if (!articleId) return

    // 加入房间，确保使用正确的格式 'article-{id}'
    const roomName = `article-${articleId}`
    console.log(`[useArticleRoom] Joining room: ${roomName}`)

    // 发送加入房间消息，使用小写的 'join'
    socketWorker.emit(SocketEmitEnum.Message, {
      type: 'join',
      payload: { roomName },
    })

    // 离开房间
    return () => {
      console.log(`[useArticleRoom] Leaving room: ${roomName}`)
      socketWorker.emit(SocketEmitEnum.Message, {
        type: 'leave',
        payload: { roomName },
      })
    }
  }, [articleId])
}
