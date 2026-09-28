import { readdirSync, statSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { join, relative, sep } from 'node:path';

const SW_FILE = 'sw.js';

function walk(dir, out = []) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) walk(full, out);
    else out.push(full);
  }
  return out;
}

function fnv1a(str) {
  let h = 0x811c9dc5;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return (h >>> 0).toString(36);
}

/* El service worker se genera DESPUES del build, asi que puede listar todos
   los archivos reales (con sus hashes) y precachearlos: la web funciona
   offline por completo desde la primera visita. */
function render(version, precache, base) {
  return `/* generado por src/pwa/integration.mjs - no editar a mano */
const VERSION = '${version}';
const BASE = '${base}';
const CACHE = 'curso-git-' + VERSION;
const OFFLINE = BASE + 'offline/';
const PRECACHE = ${JSON.stringify(precache)};

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(CACHE)
      .then((cache) => cache.addAll(PRECACHE))
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  );
});

/* ignoreVary es imprescindible: los assets vienen con "Vary: Origin" y, sin
   ignorarlo, el match falla (la peticion precacheada no lleva Origin y la del
   modulo si), dejando la web sin funcionar offline. */
self.addEventListener('fetch', (event) => {
  const request = event.request;
  if (request.method !== 'GET') return;

  let url;
  try {
    url = new URL(request.url);
  } catch (e) {
    return;
  }
  if (url.origin !== self.location.origin) return;

  if (request.mode === 'navigate') {
    event.respondWith(
      caches.match(request, { ignoreSearch: true, ignoreVary: true }).then((cached) => {
        const network = fetch(request)
          .then((response) => {
            if (response && response.ok) {
              const copy = response.clone();
              caches.open(CACHE).then((cache) => cache.put(request, copy));
            }
            return response;
          })
          .catch(() => cached || caches.match(OFFLINE));
        return cached || network;
      }),
    );
    return;
  }

  event.respondWith(
    caches.match(request, { ignoreSearch: true, ignoreVary: true }).then((cached) => {
      if (cached) return cached;
      return fetch(request).then((response) => {
        if (response && response.ok && response.type === 'basic') {
          const copy = response.clone();
          caches.open(CACHE).then((cache) => cache.put(request, copy));
        }
        return response;
      });
    }),
  );
});
`;
}

export default function pwa() {
  let base = '/';
  return {
    name: 'pwa-service-worker',
    hooks: {
      'astro:config:done': ({ config }) => {
        base = config.base.endsWith('/') ? config.base : config.base + '/';
      },
      'astro:build:done': ({ dir, logger }) => {
        const root = fileURLToPath(dir);
        const disk = walk(root).map((f) => '/' + relative(root, f).split(sep).join('/'));

        const precache = [];
        for (const f of disk) {
          if (f === '/' + SW_FILE) continue;
          if (f.endsWith('/index.html')) {
            const dirUrl = f.slice(0, -'index.html'.length);
            precache.push(dirUrl === '/' ? base : base + dirUrl.slice(1));
          } else {
            precache.push(base + f.slice(1));
          }
        }

        const version = fnv1a(
          disk.map((f) => f + ':' + statSync(join(root, f.slice(1))).size).join('|'),
        );

        writeFileSync(join(root, SW_FILE), render(version, precache, base));
        logger.info(
          'service worker: ' + precache.length + ' recursos precacheados (v' + version + ')',
        );
      },
    },
  };
}
