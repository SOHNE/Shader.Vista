import type { PassConfig, RendererConfig } from '@actis/core'

export const HTML_CORE_EXPORT_MIME_TYPE = 'text/html;charset=utf-8'

type HtmlCoreExportOptions = Readonly<{
  actisCoreBundle: string
  exportedAt?: Date
  passes: PassConfig[]
  selectedPreviewVersion: string
  workspaceCoreVersion: string
}>

type HtmlEsmExportOptions = Readonly<{
  coreImportUrl: string
  coreVersion: string
  exportedAt?: Date
  passes: PassConfig[]
  selectedPreviewVersion: string
}>

function getPassesSnapshot(passes: PassConfig[]) {
  return JSON.parse(JSON.stringify(passes)) as PassConfig[]
}

function getScriptSafeJson(value: unknown) {
  return JSON.stringify(value, null, 2)
    .replaceAll('<', '\\u003C')
    .replaceAll('>', '\\u003E')
    .replaceAll('&', '\\u0026')
    .replaceAll('\u2028', '\\u2028')
    .replaceAll('\u2029', '\\u2029')
}

function getScriptSafeSource(source: string) {
  return source.replace(/<\/script/gi, '<\\/script')
}

function getHtmlAttrSafe(value: string) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('"', '&quot;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
}

export function getHtmlCoreExportFileName(workspaceCoreVersion: string) {
  return `actis-shader-core-${workspaceCoreVersion}.html`
}

export function getHtmlEsmExportFileName(coreVersion: string) {
  return `actis-shader-esm-core-${coreVersion}.html`
}

export function createHtmlCoreExport(options: HtmlCoreExportOptions) {
  const config: RendererConfig = {
    passes: getPassesSnapshot(options.passes),
  }
  const configJson = getScriptSafeJson(config)
  const actisCoreSource = getScriptSafeSource(options.actisCoreBundle)
  const exportedAt = (options.exportedAt ?? new Date()).toISOString()

  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="actis-core-source" content="embedded-workspace" />
    <meta name="actis-core-version" content="${getHtmlAttrSafe(options.workspaceCoreVersion)}" />
    <meta name="actis-playground-preview-version" content="${getHtmlAttrSafe(options.selectedPreviewVersion)}" />
    <meta name="actis-exported-at" content="${getHtmlAttrSafe(exportedAt)}" />
    <title>Actis Shader Export</title>
    <style>
      html,
      body {
        width: 100%;
        height: 100%;
        margin: 0;
        overflow: hidden;
        background: #000;
      }

      canvas {
        display: block;
        width: 100vw;
        height: 100vh;
      }
    </style>
  </head>
  <body>
    <canvas id="actis-canvas"></canvas>
    <script>
${actisCoreSource}
    <\/script>
    <script>
      const canvas = document.querySelector('#actis-canvas');
      const { WebGLRenderer } = Actis;
      const renderer = new WebGLRenderer(canvas, (details) => {
        console.error('[Actis] Shader error:', details);
      });
      const config = ${configJson};

      renderer.setup(config);
      renderer.play();
    <\/script>
  </body>
</html>
`
}

export function createHtmlEsmExport(options: HtmlEsmExportOptions) {
  const config: RendererConfig = {
    passes: getPassesSnapshot(options.passes),
  }
  const configJson = getScriptSafeJson(config)
  const coreImportUrlJson = getScriptSafeJson(options.coreImportUrl)
  const exportedAt = (options.exportedAt ?? new Date()).toISOString()

  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="actis-core-source" content="esm.sh" />
    <meta name="actis-core-version" content="${getHtmlAttrSafe(options.coreVersion)}" />
    <meta name="actis-core-import-url" content="${getHtmlAttrSafe(options.coreImportUrl)}" />
    <meta name="actis-playground-preview-version" content="${getHtmlAttrSafe(options.selectedPreviewVersion)}" />
    <meta name="actis-exported-at" content="${getHtmlAttrSafe(exportedAt)}" />
    <title>Actis Shader Export</title>
    <style>
      html,
      body {
        width: 100%;
        height: 100%;
        margin: 0;
        overflow: hidden;
        background: #000;
      }

      canvas {
        display: block;
        width: 100vw;
        height: 100vh;
      }
    </style>
  </head>
  <body>
    <canvas id="actis-canvas"></canvas>
    <script>
      (async () => {
        const { WebGLRenderer } = await import(${coreImportUrlJson});
        const canvas = document.querySelector('#actis-canvas');
        const renderer = new WebGLRenderer(canvas, (details) => {
          console.error('[Actis] Shader error:', details);
        });
        const config = ${configJson};

        renderer.setup(config);
        renderer.play();
      })().catch((error) => {
        console.error('[Actis] Failed to load esm.sh export:', error);
      });
    <\/script>
  </body>
</html>
`
}
