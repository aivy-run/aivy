import { styled } from 'solid-styled-components'

export const ProseMirror = styled.div`
  .ProseMirror {
    outline: none;

    > * + * {
      margin-top: 0.75em;
    }

    p:empty::before {
      content: ' ';
      white-space: pre;
    }

    ul,
    ol {
      padding: 0 1rem;
    }

    h1,
    h2,
    h3,
    h4,
    h5,
    h6 {
      line-height: 1.1;
    }

    a {
      color: #0f83fd;
      text-underline-offset: 0.25rem;

      &:hover {
        text-decoration: underline;
      }
    }

    code {
      padding: 0.2rem 0.4rem;
      border-radius: 4px;
      background-color: ${(p) => p.theme?.$().colors.bg_accent.string()};
      color: ${(p) => p.theme?.$().colors.text.fade(0.25).string()};
      font-family: JetBrainsMono, monospace;
      font-size: 0.85rem;
      vertical-align: 0.08rem;
    }

    pre {
      padding: 0.75rem 1rem;
      border-radius: 0.5rem;
      background: #0d0d0d;
      color: #fff;

      code {
        padding: 0;
        background: none;
        color: inherit;
        font-size: 0.8rem;
      }
    }

    mark {
      background-color: #faf594;
    }

    img {
      max-width: 100%;
      height: auto;
    }

    hr {
      margin: 1rem 0;
    }

    blockquote {
      padding-left: 1rem;
      border-left: 2px solid rgba(#0d0d0d, 0.1);
    }

    hr {
      border: none;
      border-top: 2px solid rgba(#0d0d0d, 0.1);
      margin: 2rem 0;
    }

    ul[data-type='taskList'] {
      padding: 0;
      list-style: none;

      li {
        display: flex;
        align-items: center;

        > label {
          flex: 0 0 auto;
          margin-right: 0.5rem;
          user-select: none;
        }

        > div {
          flex: 1 1 auto;
        }
      }
    }
  }
`
