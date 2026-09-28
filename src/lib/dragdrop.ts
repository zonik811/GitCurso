/**
 * Motor de arrastre compartido por los laboratorios <DragLab>.
 *
 * Sin dependencias externas: usa Pointer Events (ratón, lápiz y táctil) y ofrece
 * una alternativa completa por teclado (Enter para coger, flechas para mover o
 * elegir destino, Escape para soltar). El HTML lo produce DragLab.astro; aquí
 * solo vive la mecánica y se emiten eventos que el componente escucha:
 *
 *   dnd:reorder  la lista cambió mientras se arrastra
 *   dnd:drop     detail: { item, itemId, zone, zoneId }  destino alcanzado
 *   dnd:edge     detail: { from, to }                    modo grafo
 *   dnd:change   una operación terminó (reordenar, soltar o conectar)
 */

const THRESHOLD = 6;

export type DndMode = 'orden' | 'parejas' | 'zonas' | 'comando' | 'grafo';

interface Drag {
  el: HTMLElement;
  ghost: HTMLElement | null;
  pointerId: number;
  x0: number;
  y0: number;
  grabX: number;
  grabY: number;
  active: boolean;
  moved: boolean;
  originParent: HTMLElement;
  originNext: Node | null;
}

const sortables = (parent: HTMLElement, except?: HTMLElement) =>
  Array.from(parent.children).filter(
    (c): c is HTMLElement =>
      c instanceof HTMLElement && c.hasAttribute('data-dnd-item') && c !== except,
  );

const axisOf = (el: HTMLElement): 'x' | 'y' => (el.dataset.dndAxis === 'x' ? 'x' : 'y');

/** Inserta `el` en `parent` según la mitad del elemento siblings que se cruza. */
function place(parent: HTMLElement, el: HTMLElement, x: number, y: number, axis: 'x' | 'y') {
  const before = sortables(parent, el).find((kid) => {
    const r = kid.getBoundingClientRect();
    return axis === 'x' ? x < r.left + r.width / 2 : y < r.top + r.height / 2;
  });
  parent.insertBefore(el, before ?? null);
}

function speak(host: HTMLElement) {
  let live = host.querySelector<HTMLElement>('[data-dnd-live]');
  if (!live) {
    live = document.createElement('div');
    live.setAttribute('data-dnd-live', '');
    live.setAttribute('role', 'status');
    live.setAttribute('aria-live', 'polite');
    live.className = 'dnd-sr';
    host.appendChild(live);
  }
  const node = live;
  const GAP = 500;
  let timer: number | undefined;
  let quiet: number | undefined;
  let last = 0;
  let pending: string | null = null;

  const write = (msg: string) => {
    if (timer) window.clearTimeout(timer);
    timer = window.setTimeout(() => {
      node.textContent = msg;
    }, 60);
  };

  /* accion puntual: se dice siempre y de inmediato */
  const say = (msg: string) => {
    pending = null;
    if (quiet) window.clearTimeout(quiet);
    quiet = undefined;
    last = performance.now();
    write(msg);
  };

  /* rafaga de flechas: como mucho un anuncio cada GAP y siempre el ultimo,
     para que el lector de pantalla no lea veinte mensajes a la vez */
  const sayThrottled = (msg: string) => {
    const now = performance.now();
    if (now - last >= GAP) {
      pending = null;
      if (quiet) window.clearTimeout(quiet);
      quiet = undefined;
      last = now;
      write(msg);
      return;
    }
    pending = msg;
    if (quiet) window.clearTimeout(quiet);
    quiet = window.setTimeout(() => {
      quiet = undefined;
      if (pending === null) return;
      const lastMsg = pending;
      pending = null;
      last = performance.now();
      write(lastMsg);
    }, GAP);
  };

  return { say, sayThrottled };
}

function emit<T>(host: HTMLElement, type: string, detail?: T) {
  host.dispatchEvent(new CustomEvent(type, { detail, bubbles: true }));
}

function lift(el: HTMLElement) {
  const rect = el.getBoundingClientRect();
  const ghost = el.cloneNode(true) as HTMLElement;
  ghost.classList.add('dnd-ghost');
  ghost.removeAttribute('data-dnd-item');
  ghost.setAttribute('aria-hidden', 'true');
  Object.assign(ghost.style, {
    position: 'fixed',
    left: '0',
    top: '0',
    width: `${rect.width}px`,
    height: `${rect.height}px`,
    margin: '0',
  } satisfies Partial<CSSStyleDeclaration>);
  document.body.appendChild(ghost);
  return ghost;
}

function initItems(host: HTMLElement, mode: DndMode) {
  const { say, sayThrottled } = speak(host);
  const inline = mode === 'orden' || mode === 'comando';
  let drag: Drag | null = null;
  let held: HTMLElement | null = null;
  let cursor = -1;

  const zones = () => Array.from(host.querySelectorAll<HTMLElement>('[data-dnd-zone]'));
  const zoneAt = (e: PointerEvent | { clientX: number; clientY: number }) => {
    const hit = document.elementFromPoint(e.clientX, e.clientY);
    const zone = hit?.closest<HTMLElement>('[data-dnd-zone]');
    return zone && host.contains(zone) ? zone : null;
  };
  const highlight = (zone: HTMLElement | null) =>
    zones().forEach((z) => z.classList.toggle('is-over', z === zone));

  const release = (announce = true) => {
    if (!held) return;
    const el = held;
    held = null;
    cursor = -1;
    el.classList.remove('is-held');
    delete host.dataset.dndHolding;
    if (announce) say(`${el.dataset.dndLabel ?? el.textContent?.trim() ?? 'Elemento'} soltado`);
  };

  const restore = (d: Drag) => {
    d.originParent.insertBefore(d.el, d.originNext);
  };

  const settle = (d: Drag, changed: boolean) => {
    d.ghost?.remove();
    d.ghost = null;
    d.el.classList.remove('is-lifted');
    d.el.style.pointerEvents = '';
    highlight(null);
    if (changed) emit(host, 'dnd:change');
  };

  /* ---------- puntero ---------- */

  host.addEventListener('pointerdown', (e) => {
    const ev = e as PointerEvent;
    if (held || (ev.pointerType === 'mouse' && ev.button !== 0)) return;
    const el = (ev.target as HTMLElement | null)?.closest<HTMLElement>('[data-dnd-item]');
    if (!el || !host.contains(el)) return;
    if ((ev.target as HTMLElement).closest('a, button, input, select, textarea')) return;
    const rect = el.getBoundingClientRect();
    drag = {
      el,
      ghost: null,
      pointerId: ev.pointerId,
      x0: ev.clientX,
      y0: ev.clientY,
      grabX: ev.clientX - rect.left,
      grabY: ev.clientY - rect.top,
      active: false,
      moved: false,
      originParent: el.parentElement as HTMLElement,
      originNext: el.nextSibling,
    };
    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
    window.addEventListener('pointercancel', onCancel);
  });

  function onMove(e: PointerEvent) {
    const d = drag;
    if (!d || e.pointerId !== d.pointerId) return;
    if (!d.active) {
      if (Math.hypot(e.clientX - d.x0, e.clientY - d.y0) < THRESHOLD) return;
      d.active = true;
      d.ghost = lift(d.el);
      d.el.classList.add('is-lifted');
      d.el.style.pointerEvents = 'none';
      document.body.classList.add('dnd-busy');
    }
    if (d.ghost) {
      d.ghost.style.transform = `translate3d(${e.clientX - d.grabX}px, ${e.clientY - d.grabY}px, 0) scale(1.04)`;
    }

    if (mode === 'orden') {
      const parent = d.el.parentElement as HTMLElement;
      place(parent, d.el, e.clientX, e.clientY, axisOf(parent));
      d.moved = true;
      emit(host, 'dnd:reorder');
      return;
    }

    const zone = zoneAt(e);
    highlight(zone);
    if (mode === 'comando' && zone) {
      if (zone.hasAttribute('data-dnd-pool')) {
        zone.appendChild(d.el);
      } else {
        place(zone, d.el, e.clientX, e.clientY, axisOf(zone));
      }
      d.moved = true;
      emit(host, 'dnd:reorder');
    }
  }

  function onUp(e: PointerEvent) {
    const d = drag;
    if (!d || e.pointerId !== d.pointerId) return;
    detach();
    if (!d.active) {
      settle(d, false);
      return;
    }
    document.body.classList.remove('dnd-busy');

    if (mode === 'orden') {
      settle(d, true);
      return;
    }

    const zone = zoneAt(e);
    highlight(null);

    if (mode === 'comando') {
      if (zone?.hasAttribute('data-dnd-pool')) zone.appendChild(d.el);
      else if (zone) place(zone, d.el, e.clientX, e.clientY, axisOf(zone));
      else restore(d);
      settle(d, true);
      return;
    }

    if (zone) {
      const itemId = d.el.dataset.dndItem ?? '';
      const zoneId = zone.dataset.dndZone ?? '';
      d.el.classList.add('is-dropped');
      emit(host, 'dnd:drop', { item: d.el, itemId, zone, zoneId });
      settle(d, true);
    } else {
      restore(d);
      settle(d, false);
    }
  }

  function onCancel() {
    const d = drag;
    if (!d) return;
    detach();
    document.body.classList.remove('dnd-busy');
    restore(d);
    settle(d, false);
  }

  function detach() {
    drag = null;
    window.removeEventListener('pointermove', onMove);
    window.removeEventListener('pointerup', onUp);
    window.removeEventListener('pointercancel', onCancel);
  }

  /* ---------- teclado ---------- */

  host.addEventListener('keydown', (e) => {
    const key = e.key;

    if (key === 'Escape' && held) {
      e.preventDefault();
      e.stopPropagation();
      release();
      return;
    }

    const target = (e.target as HTMLElement | null)?.closest<HTMLElement>('[data-dnd-item]');

    if ((key === 'Enter' || key === ' ') && held && cursor >= 0) {
      e.preventDefault();
      const zone = zones()[cursor];
      emit(host, 'dnd:drop', {
        item: held,
        itemId: held.dataset.dndItem ?? '',
        zone,
        zoneId: zone?.dataset.dndZone ?? '',
      });
      release(false);
      say(`Soltado en ${zone?.dataset.dndZoneLabel ?? 'la zona'}`);
      emit(host, 'dnd:change');
      return;
    }

    if ((key === 'Enter' || key === ' ') && target && host.contains(target)) {
      e.preventDefault();
      if (held === target) {
        release();
      } else {
        release(false);
        held = target;
        cursor = -1;
        target.classList.add('is-held');
        host.dataset.dndHolding = '1';
        say(`Cogido: ${target.dataset.dndLabel ?? target.textContent?.trim()}. Usa las flechas para moverlo.`);
      }
      return;
    }

    if (!held || !key.startsWith('Arrow')) return;
    e.preventDefault();
    e.stopPropagation();
    const forward = key === 'ArrowRight' || key === 'ArrowDown';

    /* comando: arriba y abajo cruzan entre el cajon y la terminal,
       izquierda y derecha ordenan dentro de donde esta la ficha */
    if (mode === 'comando') {
      const pool = host.querySelector('[data-dnd-pool]');
      const term = host.querySelector('[data-dnd-zone="cmd"]');
      const inTerm = held.parentElement === term;
      if (key === 'ArrowDown' && !inTerm && pool && term) {
        term.appendChild(held);
        held.focus({ preventScroll: true });
        emit(host, 'dnd:change');
        say('Ficha colocada en la terminal');
        return;
      }
      if (key === 'ArrowUp' && inTerm && pool) {
        pool.appendChild(held);
        held.focus({ preventScroll: true });
        emit(host, 'dnd:change');
        say('Ficha devuelta a las fichas');
        return;
      }
    }

    if (inline) {
      const parent = held.parentElement as HTMLElement;
      const kids = Array.from(parent.children) as HTMLElement[];
      const from = kids.indexOf(held);
      const to = forward ? Math.min(kids.length - 1, from + 1) : Math.max(0, from - 1);
      if (from === to || from < 0) return;
      if (forward) parent.insertBefore(held, kids[to].nextSibling);
      else parent.insertBefore(held, kids[to]);
      /* al reordenar el DOM el navegador devuelve el foco al body:
         sin esto la segunda flecha ya no llega al listener */
      held.focus({ preventScroll: true });
      emit(host, 'dnd:reorder');
      emit(host, 'dnd:change');
      sayThrottled(`Posición ${to + 1} de ${kids.length}`);
      return;
    }

    const list = zones();
    if (!list.length) return;
    if (cursor < 0) {
      const box = held.getBoundingClientRect();
      let best = 0;
      let bestDist = Infinity;
      list.forEach((z, i) => {
        const r = z.getBoundingClientRect();
        const d = Math.hypot(r.left + r.width / 2 - box.left, r.top - box.top);
        if (d < bestDist) {
          bestDist = d;
          best = i;
        }
      });
      cursor = best;
    } else {
      cursor = (cursor + (forward ? 1 : -1) + list.length) % list.length;
    }
    highlight(list[cursor]);
    sayThrottled(
      `Destino ${cursor + 1} de ${list.length}: ${list[cursor].dataset.dndZoneLabel ?? ''}. Pulsa Intro para soltar.`,
    );
  });
}

/* ---------- modo grafo ---------- */

function initGraph(host: HTMLElement) {
  const { say } = speak(host);
  const svg = host.querySelector<SVGSVGElement>('[data-graph-svg]');
  const nodes = () => Array.from(host.querySelectorAll<HTMLElement>('[data-gnode]'));
  const at = (el: HTMLElement) => {
    const box = svg!.getBoundingClientRect();
    const r = el.getBoundingClientRect();
    return { x: r.left + r.width / 2 - box.left, y: r.top + r.height / 2 - box.top };
  };

  let path: SVGPathElement | null = null;
  let origin: HTMLElement | null = null;
  let picked: string | null = null;

  const clear = () => {
    path?.remove();
    path = null;
    nodes().forEach((n) => n.classList.remove('is-over', 'is-source'));
  };

  const connect = (from: HTMLElement, to: HTMLElement) => {
    emit(host, 'dnd:edge', { from: from.dataset.gnode!, to: to.dataset.gnode! });
  };

  host.addEventListener('pointerdown', (e) => {
    const ev = e as PointerEvent;
    const port = (ev.target as HTMLElement | null)?.closest<HTMLElement>('[data-gnode-port]');
    if (!port) return;
    ev.preventDefault();
    const src = port.closest<HTMLElement>('[data-gnode]')!;
    origin = src;
    src.classList.add('is-source');
    path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.setAttribute('class', 'dnd-wire');
    svg!.appendChild(path);
    svg!.setAttribute('data-wiring', '1');
    drawWire(ev.clientX, ev.clientY);
    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
  });

  function drawWire(x: number, y: number) {
    if (!path || !origin || !svg) return;
    const box = svg.getBoundingClientRect();
    const p = at(origin);
    path.setAttribute('d', `M ${p.x} ${p.y} L ${x - box.left} ${y - box.top}`);
  }

  function onMove(e: PointerEvent) {
    if (!origin) return;
    drawWire(e.clientX, e.clientY);
    const hit = document.elementFromPoint(e.clientX, e.clientY)?.closest<HTMLElement>('[data-gnode]');
    nodes().forEach((n) => n.classList.toggle('is-over', Boolean(hit) && n === hit && n !== origin));
  }

  function onUp(e: PointerEvent) {
    const src = origin;
    detach();
    if (src) {
      const hit = document.elementFromPoint(e.clientX, e.clientY)?.closest<HTMLElement>('[data-gnode]');
      if (hit && hit !== src) connect(src, hit);
    }
    clear();
    svg?.removeAttribute('data-wiring');
  }

  function detach() {
    origin = null;
    window.removeEventListener('pointermove', onMove);
    window.removeEventListener('pointerup', onUp);
  }

  host.addEventListener('keydown', (e) => {
    const el = (e.target as HTMLElement | null)?.closest<HTMLElement>('[data-gnode]');
    if (!el || e.key !== 'Enter' && e.key !== ' ') return;
    e.preventDefault();
    const id = el.dataset.gnode!;
    if (picked === null) {
      picked = id;
      el.classList.add('is-source');
      el.setAttribute('aria-pressed', 'true');
      say(`Origen seleccionado: ${el.dataset.dndLabel}. Elige ahora el destino.`);
      return;
    }
    if (picked === id) {
      picked = null;
      el.classList.remove('is-source');
      el.setAttribute('aria-pressed', 'false');
      say('Selección cancelada');
      return;
    }
    const from = nodes().find((n) => n.dataset.gnode === picked);
    picked = null;
    el.classList.remove('is-source');
    el.setAttribute('aria-pressed', 'false');
    if (from) connect(from, el);
  });
}

export function initDragLab(host: HTMLElement) {
  if (host.dataset.dndReady) return;
  host.dataset.dndReady = '1';
  const mode = (host.dataset.dnd ?? 'orden') as DndMode;
  if (mode === 'grafo') initGraph(host);
  else initItems(host, mode);
}

export function initDragLabs(root: ParentNode = document) {
  root.querySelectorAll<HTMLElement>('[data-dnd]').forEach(initDragLab);
}
