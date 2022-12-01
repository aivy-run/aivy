import type { ImageInformation } from '~/lib/api/supabase/images'

const parseAutomatic1111Exif = (parameters: string) => {
    const result: Partial<ImageInformation['Update']> = {}
    const prompt = parameters.split(/\nNegative prompt:/)[0]
    const negative_prompt = parameters.split(/\nNegative prompt:/)[1]?.split(/Steps: \d+/)[0]
    const others = parameters.split(/\n/g).slice(-1)[0]
    result.prompt = prompt || ''
    result.negative_prompt = (negative_prompt || '').replace(/\n$/, '')
    if (others) {
        for (const prop of others.split(/, /g)) {
            const [key, value] = prop.split(': ')
            switch (key) {
                case 'Steps':
                    result.steps = parseInt(value || '0')
                    break
                case 'Sampler':
                    result.sampler = value || ''
                    break
                case 'CFG scale':
                    result.cfg_scale = parseInt(value || '0')
                    break
                case 'Seed':
                    result.seed = value || ''
                    break
            }
        }
    }
    return result
}

const parseNovelAIExif = (exif: Record<string, any>) => {
    const comment = JSON.parse(exif['Comment'])
    const prompt = exif['Description']
    const result: Partial<ImageInformation['Update']> = {
        prompt,
        negative_prompt: comment['uc'],
        steps: parseInt(comment['steps']),
        sampler: `${comment['sampler']}`,
        cfg_scale: parseInt(comment['scale']),
        seed: `${comment['seed']}`,
        model: `${exif['Software']}`,
    }
    return result
}

export const parseExif = (exif: any) => {
    if (exif?.['parameters']) return parseAutomatic1111Exif(exif['parameters'] as string)
    else if (exif?.['Software'] === 'NovelAI') return parseNovelAIExif(exif)
}
