import { simpleCamelcaseKeys as camelcaseKeys } from '@mx-space/api-client'
import type { AppRouterInstance } from 'next/dist/shared/lib/app-router-context.shared-runtime'

import { getSocketWebSessionId } from '~/atoms/hooks'
import { setSocketIsConnect } from '~/atoms/socket'
import { GATEWAY_URL } from '~/constants/env'
import { SocketConnectedEvent, SocketDisconnectedEvent } from '~/events'
import { isDev, isServerSide } from '~/lib/env'
import type { EventTypes, SocketEmitEnum } from '~/types/events'

import { eventHandler } from './handler'
import { SharedWorkerPolyfill as SharedWorker } from './worker-polyfill'

interface WorkerSocket {
  sid: string
}

class SocketWorker {
  // @ts-expect-error
  private router: AppRouterInstance

  private socket: WorkerSocket | null = null

  worker: SharedWorker | null = null

  constructor() {
    if (isServerSide) return

    const worker = new SharedWorker(new URL('io.worker', import.meta.url), {
      name: 'shiro-ws-worker',
    })
    this.prepare(worker)
    this.worker = worker
  }

  async getSid() {
    return this.socket?.sid
  }

  setRouter(router: AppRouterInstance) {
    this.router = router
  }

  private setSid(sid: string) {
    this.socket = {
      ...this.socket,
      sid,
    }
  }
  bindMessageHandler = (worker: SharedWorker) => {
    worker.onmessage = (event: MessageEvent) => {
      const { data } = event
      const { type, payload } = data

      switch (type) {
        case 'ping': {
          worker?.postMessage({
            type: 'pong',
          })
          console.info('[ws worker] pong')
          break
        }
        case 'connect': {
          window.dispatchEvent(new SocketConnectedEvent())
          setSocketIsConnect(true)

          const sid = payload
          this.setSid(sid)
          break
        }
        case 'disconnect': {
          window.dispatchEvent(new SocketDisconnectedEvent())
          setSocketIsConnect(false)
          break
        }
        case 'sid': {
          const sid = payload
          this.setSid(sid)
          break
        }
        case 'message': {
          if (
            typeof payload === 'object' &&
            payload.type === 'ACTIVITY_UPDATE_PRESENCE'
          ) {
            console.info(
              '[worker-client] Received activity presence update:',
              payload,
            )
          }

          const typedPayload = payload as string | Record<'type' | 'data', any>
          if (typeof typedPayload !== 'string') {
            return this.handleEvent(
              typedPayload.type,
              camelcaseKeys(typedPayload.data),
            )
          }

          try {
            const { data, type } = JSON.parse(typedPayload) as {
              data: any
              type: EventTypes
            }

            if (type === 'ACTIVITY_UPDATE_PRESENCE') {
              console.info(
                '[worker-client] Parsed activity presence update:',
                data,
              )
            }

            this.handleEvent(type, camelcaseKeys(data))
          } catch (error) {
            console.error(
              '[worker-client] Error parsing message payload:',
              error,
              typedPayload,
            )
          }
        }
      }
    }
  }

  prepare(worker: SharedWorker) {
    const gatewayUrlWithoutTrailingSlash = GATEWAY_URL.replace(/\/$/, '')
    this.bindMessageHandler(worker)
    worker.postMessage({
      type: 'config',

      payload: {
        url: `${gatewayUrlWithoutTrailingSlash}/web`,
        socket_session_id: getSocketWebSessionId(),
      },
    })

    worker.start()

    worker.postMessage({
      type: 'init',
    })
  }
  handleEvent(type: EventTypes, data: any) {
    if (isDev) {
      console.info(data)
    }

    window.dispatchEvent(new CustomEvent(type, { detail: data }))

    eventHandler(type, data, this.router)
  }

  emit(event: SocketEmitEnum, payload: any) {
    this.worker?.postMessage({
      type: 'emit',
      payload: { type: event, payload },
    })
  }

  reconnect() {
    this.worker?.postMessage({
      type: 'reconnect',
    })
  }

  static shared = new SocketWorker()
}

export const socketWorker = SocketWorker.shared
export type TSocketClient = SocketWorker
