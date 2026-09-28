export interface Lesson {
  slug: string;
  title: string;
  description: string;
  duration: number;
}

export interface Module {
  id: string;
  title: string;
  description: string;
  icon: string;
  accent: string;
  lessons: Lesson[];
}

export const curriculum: Module[] = [
  {
    id: 'fundamentos',
    title: 'Fundamentos',
    description: 'Qué es el control de versiones y cómo preparar tu entorno.',
    icon: '🌱',
    accent: '#3fb950',
    lessons: [
      {
        slug: 'que-es-git',
        title: '¿Qué es Git y el control de versiones?',
        description:
          'Entiende por qué necesitas control de versiones, la historia de Git y los conceptos clave.',
        duration: 8,
      },
      {
        slug: 'instalacion-configuracion',
        title: 'Instalación y configuración inicial',
        description:
          'Instala Git en Windows, macOS y Linux, y configura tu identidad y valores por defecto.',
        duration: 10,
      },
    ],
  },
  {
    id: 'git-esencial',
    title: 'Git esencial',
    description: 'El flujo de trabajo diario y los comandos que usarás todo el tiempo.',
    icon: '⌨️',
    accent: '#58a6ff',
    lessons: [
      {
        slug: 'flujo-de-trabajo',
        title: 'El flujo de trabajo de Git',
        description:
          'Las tres áreas de Git: directorio de trabajo, staging e historial. Cómo viaja tu código.',
        duration: 9,
      },
      {
        slug: 'comandos-esenciales',
        title: 'Comandos esenciales',
        description:
          'init, add, commit, status, log, diff, rm y mv explicados con ejemplos reales.',
        duration: 14,
      },
      {
        slug: 'deshacer-cambios',
        title: 'Deshacer cambios',
        description:
          'restore, reset, revert y commit --amend: cómo corregir errores sin miedo.',
        duration: 12,
      },
    ],
  },
  {
    id: 'ramas',
    title: 'Ramas y fusiones',
    description: 'Trabaja en paralelo, fusiona cambios y resuelve conflictos.',
    icon: '🌿',
    accent: '#d29922',
    lessons: [
      {
        slug: 'ramas',
        title: 'Ramas (branches)',
        description:
          'Crea, cambia y gestiona ramas con branch, checkout y switch. ¿Qué es HEAD?',
        duration: 11,
      },
      {
        slug: 'fusiones',
        title: 'Fusiones y conflictos',
        description:
          'merge fast-forward vs. three-way, y cómo resolver conflictos paso a paso.',
        duration: 13,
      },
      {
        slug: 'rebase-stash-tags',
        title: 'Rebase, stash y etiquetas',
        description:
          'Reescribe el historial con rebase, guarda trabajo temporal con stash y marca versiones con tags.',
        duration: 12,
      },
    ],
  },
  {
    id: 'github',
    title: 'GitHub y remotos',
    description: 'Publica tu código, colabora y domina la plataforma de GitHub.',
    icon: '🐙',
    accent: '#a371f7',
    lessons: [
      {
        slug: 'repositorios-remotos',
        title: 'Repositorios remotos',
        description:
          'remote, clone, fetch, pull y push. Cómo sincronizar tu trabajo con un servidor.',
        duration: 12,
      },
      {
        slug: 'github-esencial',
        title: 'GitHub esencial',
        description:
          'Crea tu cuenta, repositorios, README, licencias y autenticación con SSH y tokens.',
        duration: 13,
      },
      {
        slug: 'colaboracion-pr',
        title: 'Colaboración: forks y Pull Requests',
        description:
          'Forks, Pull Requests, issues y code review. El corazón del trabajo en equipo.',
        duration: 14,
      },
    ],
  },
  {
    id: 'github-desktop',
    title: 'GitHub Desktop',
    description: 'Usa Git con interfaz gráfica, sin memorizar comandos.',
    icon: '🖥️',
    accent: '#f778ba',
    lessons: [
      {
        slug: 'desktop-introduccion',
        title: 'Introducción a GitHub Desktop',
        description:
          'Instala la app, conéctala con tu cuenta y conoce su interfaz.',
        duration: 9,
      },
      {
        slug: 'desktop-flujo',
        title: 'Flujo de trabajo en GitHub Desktop',
        description:
          'Clona, haz commits, revisa el diff, publica y sincroniza con un clic.',
        duration: 11,
      },
      {
        slug: 'desktop-ramas-pr',
        title: 'Ramas, conflictos y Pull Requests en Desktop',
        description:
          'Crea ramas, cambia entre ellas, resuelve conflictos y abre PRs desde la app.',
        duration: 12,
      },
    ],
  },
  {
    id: 'avanzado',
    title: 'Buenas prácticas',
    description: 'Convenciones, flujos de equipo y herramientas avanzadas.',
    icon: '🚀',
    accent: '#39c5cf',
    lessons: [
      {
        slug: 'gitignore-buenas-practicas',
        title: '.gitignore y buenas prácticas',
        description:
          'Ignora archivos correctamente, escribe buenos mensajes de commit y mantén un historial limpio.',
        duration: 10,
      },
      {
        slug: 'flujos-y-avanzado',
        title: 'Flujos de trabajo y comandos avanzados',
        description:
          'Git Flow, trunk-based development, GitHub Flow, cherry-pick, bisect y alias.',
        duration: 13,
      },
    ],
  },
];

export interface FlatLesson extends Lesson {
  moduleId: string;
  moduleTitle: string;
  moduleIcon: string;
  moduleAccent: string;
  index: number;
}

export const flatLessons: FlatLesson[] = curriculum.flatMap((module) =>
  module.lessons.map((lesson) => ({
    ...lesson,
    moduleId: module.id,
    moduleTitle: module.title,
    moduleIcon: module.icon,
    moduleAccent: module.accent,
    index: 0,
  })),
);

flatLessons.forEach((lesson, i) => {
  lesson.index = i;
});

export function getLessonNeighbors(slug: string) {
  const i = flatLessons.findIndex((l) => l.slug === slug);
  return {
    prev: i > 0 ? flatLessons[i - 1] : null,
    next: i >= 0 && i < flatLessons.length - 1 ? flatLessons[i + 1] : null,
  };
}

export const totalLessons = flatLessons.length;
export const totalMinutes = flatLessons.reduce((sum, l) => sum + l.duration, 0);

export interface Lab {
  slug: string;
  icon: string;
  title: string;
  description: string;
  kind: string;
}

export const labs: Lab[] = [
  {
    slug: 'flujo-de-trabajo',
    icon: '⌨️',
    title: 'Terminal: las tres áreas',
    description:
      'Ejecuta git init, add, commit y status y observa cómo viajan los cambios entre working, staging e historial.',
    kind: 'Terminal',
  },
  {
    slug: 'comandos-esenciales',
    icon: '⌨️',
    title: 'Terminal: comandos esenciales',
    description: 'Practica add, commit, log y diff sobre un repositorio simulado en tu navegador.',
    kind: 'Terminal',
  },
  {
    slug: 'deshacer-cambios',
    icon: '↩️',
    title: 'Terminal: deshacer cambios',
    description: 'Modifica un archivo, prepáralo y descarta los cambios con git restore.',
    kind: 'Terminal',
  },
  {
    slug: 'ramas',
    icon: '🌿',
    title: 'Terminal: ramas y HEAD',
    description: 'Crea ramas, cambia entre ellas y mira en el panel dónde apunta HEAD.',
    kind: 'Terminal',
  },
  {
    slug: 'fusiones',
    icon: '🔀',
    title: 'Terminal: fusiones',
    description: 'Reproduce un fast-forward y un merge de tres vías, con su commit de merge.',
    kind: 'Terminal',
  },
  {
    slug: 'repositorios-remotos',
    icon: '🌐',
    title: 'Simulador local ↔ remoto',
    description: 'Haz push, fetch y pull entre tu repo y GitHub, y provoca un push rechazado.',
    kind: 'Simulador',
  },
  {
    slug: 'gitignore-buenas-practicas',
    icon: '🧩',
    title: 'Probador de .gitignore',
    description: 'Comprueba al instante qué archivo se ignora y qué regla lo decide.',
    kind: 'Herramienta',
  },
];
