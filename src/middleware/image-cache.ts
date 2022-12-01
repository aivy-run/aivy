import type { PostRenderMiddlewareContext, PreRenderMiddlewareContext } from '.'

type Cache = {
    headers: Headers
    body: ArrayBuffer
    expires: number
}

const caches: Record<string, Cache> = {}

export const ImageCache = {
    post: async (ctx: PostRenderMiddlewareContext) => {
        const url = new URL(ctx.request.url)
        const matches = url.pathname.match(/\/images\/(\d+)/)
        if (matches) {
            const id = matches[1]
            if (!id) return ctx.forward()
            const clone = ctx.response.clone()
            caches[id] = {
                headers: clone.headers,
                body: await clone.arrayBuffer(),
                expires: new Date().getTime() + 1000 * 10,
            }
        }
        return ctx.forward()
    },
    pre: (ctx: PreRenderMiddlewareContext) => {
        const url = new URL(ctx.request.url)
        const matches = url.pathname.match(/\/images\/(\d+)/)
        if (!matches) return ctx.forward()
        const id = matches[1]
        if (!id) return ctx.forward()
        const cache = caches[id]
        if (cache) {
            if (cache.expires < new Date().getTime()) {
                delete caches[id]
                return
            }
            const headers = new Headers(cache.headers)
            headers.append('x-cache', 'hit')
            return new Response(cache.body, {
                headers,
            })
        }
    },
}
