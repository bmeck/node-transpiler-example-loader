// takes ' strings and upper cases them
// should be more robust regarding data: URL collisions
// but this is for illustrative purposes.
import { URL, pathToFileURL, fileURLToPath } from 'url';
import { extname } from 'path';
import { promises as fs } from 'fs';
import resolver from 'resolve';

const baseURL = pathToFileURL(process.cwd() + '/').href;

const translatedToOriginal = new Map();
const originalToTranslated = new Map();
export async function resolve(specifier,
                              parentModuleURL = baseURL,
                              defaultResolver) {
  let href;
  if (translatedToOriginal.has(parentModuleURL)) {
    parentModuleURL = translatedToOriginal.get(parentModuleURL);
  }
  try {
    href = new URL(specifier).href;
    // try {
    //   ({url, format} = defaultResolver(specifier, parentModuleURL));
    // } catch (e) {
    //   throw e;
    // }
  } catch (e) {
    href = pathToFileURL(resolver.sync(specifier, {
      basedir: fileURLToPath(new URL('./', parentModuleURL)),
      extensions: [
        '.js',
        '.mjs',
        '.json',
        '.node',
        '.cjs',
        '.shoutjs',
      ]
    })).href;
  }
  // translatedHREF -> HREF
  if (originalToTranslated.has(href)) {
    href = originalToTranslated.get(href);
  } else {
    const file = fileURLToPath(href);
    if (extname(file) === '.shoutjs') {
      const body = await fs.readFile(file, 'utf-8');
      const translatedHREF = `data:text/javascript;base64,${Buffer.from(
        `import.meta.url = ${JSON.stringify(href)};` +
        body.replace(/'(\\.|[^'])*?'/g, c => {
          return c.toUpperCase();
        })
      ).toString('base64')}`;
      originalToTranslated.set(href, translatedHREF);
      translatedToOriginal.set(translatedHREF, href);
      href = translatedHREF;
    }
  }
  return {
    url: href,
    format: 'module'
  };
}