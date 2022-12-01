import type { FetchEvent } from 'solid-start'
import type { MiddlewareInput } from 'solid-start/entry-server'

export type PreRenderMiddleware = (
    ctx: PreRenderMiddlewareContext,
) => Response | undefined | Promise<Response | undefined>
export type PostRenderMiddleware = (
    ctx: PostRenderMiddlewareContext,
) => Response | Promise<Response>
export type PreRenderMiddlewareContext = FetchEvent & {
    forward: () => Response | undefined | Promise<Response | undefined>
}
export type PostRenderMiddlewareContext = FetchEvent & {
    response: Response
    forward: () => Response | Promise<Response>
}

const prerender: PreRenderMiddleware[] = []
const postrender: PostRenderMiddleware[] = []

const preRender = (e: FetchEvent) => {
    let index = 0
    const forward = async () => {
        index++
        const mid = prerender[index]
        if (!mid) return
        return mid(ctx)
    }
    const ctx = { ...e, forward }
    const first = prerender[index]
    if (first) return first({ ...e, forward })
    else return
}

const postRender = (e: FetchEvent, response: Response) => {
    let index = 0
    const forward = async () => {
        index++
        const mid = postrender[index]
        if (!mid) return ctx.response
        return mid(ctx)
    }
    const ctx = { ...e, response, forward }
    const first = postrender[index]
    if (first) return first({ ...e, response, forward })
    else return response
}

export const OriginalMiddleware = (i: MiddlewareInput) => async (e: FetchEvent) => {
    const pre = await preRender(e)
    if (pre) return pre
    return postRender(e, await i.forward(e))
}
