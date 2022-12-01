import type { Component } from 'solid-js'
import { css, useTheme } from 'solid-styled-components'

import { AutoComplete } from '~/components/ui/auto-complete'
import { Input } from '~/components/ui/input'
import { TextArea } from '~/components/ui/textarea'
import type { ImageInformation } from '~/lib/api/supabase/images'

export const ImageInformationForm: Component<{
  data: ImageInformation['Insert']
  onChange: (key: keyof ImageInformation['Insert'], value: string | number) => void
}> = (props) => {
  const theme = useTheme()

  return (
    <>
      <TextArea
        class={css`
          width: 100%;
          resize: none;
        `}
        placeholder="プロンプト"
        value={props.data.prompt || ''}
        onInput={(e) => props.onChange('prompt', e.currentTarget.value)}
      />
      <TextArea
        class={css`
          width: 100%;
          resize: none;
        `}
        placeholder="ネガティブプロンプト"
        value={props.data.negative_prompt || ''}
        onInput={(e) => props.onChange('negative_prompt', e.currentTarget.value)}
      />
      <br />
      <AutoComplete
        class={css`
          width: 100%;
        `}
        limit={50}
        suggestions={[
          'StableDiffusion',
          'WaifuDiffusion',
          'NovelAI',
          'Niji·Journey',
          'MidJourney',
          'TrinArt',
          'TrinArtStableDiffusion',
          'DALL·E 2',
          'ERNIE-ViLG',
        ]}
        placeholder="モデル名を入力..."
        value={props.data.model || ''}
        onInput={(v) => props.onChange('model', v)}
      />
      <div
        class={css`
          display: grid;
          width: 100%;
          margin: 1rem 0;
          gap: 1rem;
          grid-template-columns: 1fr;
          ${theme.$().media.breakpoints.lg} {
            width: 100%;
            grid-template-columns: repeat(3, 1fr);
          }
        `}
      >
        <Input
          placeholder="VAE"
          value={props.data.vae || ''}
          onInput={(e) => props.onChange('vae', e.currentTarget.value)}
        />
        <Input
          placeholder="Embedding"
          value={props.data.embedding || ''}
          onInput={(e) => props.onChange('embedding', e.currentTarget.value)}
        />
        <Input
          placeholder="HyperNetwork"
          value={props.data.hypernetwork || ''}
          onInput={(e) => props.onChange('hypernetwork', e.currentTarget.value)}
        />
      </div>
      <div
        class={css`
          display: grid;
          width: 100%;
          margin: 1rem 0;
          gap: 1rem;
          grid-template-columns: 1fr 1fr;
          ${theme.$().media.breakpoints.lg} {
            width: 100%;
            grid-template-columns: 400px 1fr 0.25fr 0.25fr;
          }
        `}
      >
        <Input
          placeholder="Seed"
          value={props.data.seed || ''}
          onInput={(e) => props.onChange('seed', e.currentTarget.value)}
        />
        <Input
          placeholder="Sampler"
          value={props.data.sampler || ''}
          onInput={(e) => props.onChange('sampler', e.currentTarget.value)}
        />
        <Input
          placeholder="CFG Scale"
          type="number"
          value={props.data.cfg_scale || ''}
          onInput={(e) => props.onChange('cfg_scale', parseFloat(e.currentTarget.value) || 0)}
        />
        <Input
          placeholder="Steps"
          type="number"
          value={props.data.steps || ''}
          onInput={(e) => props.onChange('steps', parseInt(e.currentTarget.value) || 0)}
        />
      </div>
    </>
  )
}
