import devtools from 'solid-devtools/vite'
import solid from 'solid-start/vite'
import { FileSystemIconLoader } from 'unplugin-icons/loaders'
import Icons from 'unplugin-icons/vite'
import { defineConfig } from 'vite'

export default defineConfig({
    ssr: {
        noExternal: ['solid-styled-components', 'solid-slider'],
    },
    plugins: [
        Icons({
            compiler: 'solid',
            customCollections: {
                thirdparty: FileSystemIconLoader('./src/assets/icons/thirdparty'),
                aivy: FileSystemIconLoader('./src/assets/icons/aivy'),
            },
        }),
        devtools({
            name: true,
            componentLocation: true,
        }),
        solid({
            adapter: 'solid-start-netlify',
        }),
    ],
})
