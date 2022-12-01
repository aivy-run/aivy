import { parse } from 'parse5'
import {
  Component,
  createContext,
  createMemo,
  For,
  Match,
  Show,
  Switch,
  useContext,
} from 'solid-js'
import { css, useTheme } from 'solid-styled-components'

export type Token = {
  attrs: Record<string, any>[]
  childNodes: Token[]
  nodeName: string
  parentNode: Token
  tagName: string
  value: string
}

const PromptContext = createContext(
  {} as {
    onTokenClick?: ((token: string) => void) | undefined
  },
)

const tokenize = (prompt: string) => {
  prompt = prompt
    .replace(/\\\{/g, '%bracket-novelai%')
    .replace(/\\\(/g, '%bracket-automatic1111%')
    .replace(/\\\}/g, '%/bracket-novelai%')
    .replace(/\\\)/g, '%/bracket-automatic1111%')
  const xml = `<prompt>${prompt
    .replace(/\{/g, '<increases type="novelai">')
    .replace(/\(/g, '<increases type="automatic1111">')
    .replace(/\}|\)/g, '</increases>')
    .replace(/\[/g, '<decreases>')
    .replace(/\]/g, '</decreases>')
    .replace(/,/g, '<br />')}</prompt>`
  const doc = parse(xml)
  const promptDoc = (doc as any).childNodes[0].childNodes[1].childNodes[0]
  return promptDoc as Token
}

export const TokenizedPrompt: Component<{
  prompt: string
  onTokenClick?: (token: string) => void
}> = (props) => {
  return (
    <PromptContext.Provider
      value={{
        onTokenClick: props.onTokenClick,
      }}
    >
      <Prompt
        prompt={tokenize(props.prompt)}
        onTokenClick={(token) => props.onTokenClick?.(token)}
      />
    </PromptContext.Provider>
  )
}

export const Prompt: Component<{ prompt: Token; onTokenClick?: (token: string) => void }> = (
  props,
) => {
  const context = useContext(PromptContext)
  const theme = useTheme()
  const type = createMemo(() => {
    if (props.prompt.attrs) return props.prompt.attrs[0]?.['value']
    else return 'novelai'
  })
  return (
    <>
      <Switch>
        <Match when={props.prompt.nodeName === 'prompt'}>
          <div>
            <Show when={props.prompt.childNodes}>
              <For each={props.prompt.childNodes}>{(node) => <Prompt prompt={node} />}</For>
            </Show>
          </div>
        </Match>
        <Match when={props.prompt.nodeName === '#text'}>
          <For
            each={props.prompt.value
              .replace(/%bracket-novelai%/g, '{')
              .replace(/%\/bracket-novelai%/g, '}')
              .replace(/%bracket-automatic1111%/g, '(')
              .replace(/%\/bracket-automatic1111%/g, ')')
              .split(':')}
          >
            {(text, i) => (
              <>
                <Show when={i() !== 0}>:</Show>
                <span
                  onClick={() => context.onTokenClick?.(text)}
                  class={css`
                    cursor: pointer;
                    transition: 0.2s;

                    &:hover {
                      border-radius: 0.2rem;
                      background-color: ${theme.$().colors.text.fade(0.8).string()};
                    }
                  `}
                >
                  {text}
                </span>
              </>
            )}
          </For>
        </Match>
        <Match when={props.prompt.nodeName === 'br'}>,</Match>
        <Match when={props.prompt.nodeName === 'increases'}>
          {type() === 'novelai' ? '{' : '('}
          <Show when={props.prompt.childNodes}>
            <For each={props.prompt.childNodes}>{(node) => <Prompt prompt={node} />}</For>
          </Show>
          {type() === 'novelai' ? '}' : ')'}
        </Match>
        <Match when={props.prompt.nodeName === 'decreases'}>
          [
          <Show when={props.prompt.childNodes}>
            <For each={props.prompt.childNodes}>{(node) => <Prompt prompt={node} />}</For>
          </Show>
          ]
        </Match>
      </Switch>
    </>
  )
}
