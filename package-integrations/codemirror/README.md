# @actis/codemirror

Reusable CodeMirror extensions for Actis GLSL shader editors.

```ts
import { glslEditorExtensions } from '@actis/codemirror'
import { EditorState } from '@codemirror/state'
import { EditorView } from '@codemirror/view'
import '@actis/codemirror/styles.css'

const view = new EditorView({
  state: EditorState.create({
    doc: fragmentShader,
    extensions: glslEditorExtensions({
      webgl2: true,
      onChange: value => console.warn(value),
    }),
  }),
  parent: document.querySelector('#editor')!,
})
```

Wrap the editor host with `cm-actis-editor` when using the bundled stylesheet.
