export interface LessonExtra {
  objectives: string[];
  summary: string[];
  exercises: string[];
}

export const lessonExtras: Record<string, LessonExtra> = {
  'que-es-git': {
    objectives: [
      'Diferenciar Git de GitHub',
      'Explicar qué son un repositorio y un commit',
      'Reconocer las ventajas del control de versiones distribuido',
    ],
    summary: [
      'Un VCS guarda el historial de cambios con autor, fecha y mensaje.',
      'Git es distribuido: cada clon tiene la historia completa.',
      'Git es la herramienta local; GitHub es el servicio en la nube.',
      'Commit = foto del proyecto; rama = línea de desarrollo; HEAD = dónde estás.',
    ],
    exercises: [
      'Explica con tus palabras la diferencia entre Git y GitHub.',
      'Enumera tres problemas que resuelve el control de versiones.',
      'Abre un repositorio de GitHub y localiza su README, sus issues y sus Pull Requests.',
    ],
  },
  'instalacion-configuracion': {
    objectives: [
      'Instalar Git en tu sistema',
      'Configurar tu identidad (nombre y correo)',
      'Conocer los tres niveles de configuración',
    ],
    summary: [
      'git --version comprueba que Git está instalado.',
      'user.name y user.email son obligatorios para poder commitear.',
      '--global aplica a todos tus repos; --local, solo al actual.',
      'init.defaultBranch main es el estándar actual.',
    ],
    exercises: [
      'Instala Git y verifica la versión.',
      'Configura tu nombre y correo (usa el mismo correo que en GitHub).',
      'Sobrescribe el correo solo en un proyecto con git config --local.',
    ],
  },
  'flujo-de-trabajo': {
    objectives: [
      'Identificar las tres áreas de Git',
      'Entender para qué sirve el staging',
      'Reconocer los estados de un archivo',
    ],
    summary: [
      'Las tres áreas son: working directory, staging y repositorio.',
      'add prepara; commit guarda la foto en el historial.',
      'git status es tu brújula: úsalo constantemente.',
      'El staging permite commits atómicos y limpios.',
    ],
    exercises: [
      'Dibuja de memoria el viaje working → staging → repositorio.',
      'Crea un archivo, prepáralo y confirma el cambio con git status.',
      'Explica en una frase qué es el área de staging.',
    ],
  },
  'comandos-esenciales': {
    objectives: [
      'Crear un repositorio con git init',
      'Preparar y confirmar cambios',
      'Consultar el historial y las diferencias',
      'Borrar y renombrar archivos con rm y mv',
    ],
    summary: [
      'init, add, commit, status, log y diff cubren el 80% del día a día.',
      'git status -s resume el estado en dos columnas (staging y working).',
      'git add . limita a la carpeta actual; git add -A recorre todo el repo.',
      'Los mensajes de commit deben explicar el qué y el por qué.',
      'git rm --cached deja de rastrear sin borrar; git mv renombra y prepara.',
      'Cada commit tiene un hash que lo identifica.',
    ],
    exercises: [
      'Crea un repositorio, añade dos archivos y haz dos commits.',
      'Revisa el historial con git log --oneline --stat.',
      'Modifica un archivo y observa la diferencia con git diff y git diff --staged.',
      'Renombra un archivo con git mv y comprueba con git status que aparece como renamed.',
    ],
  },
  'deshacer-cambios': {
    objectives: [
      'Descartar cambios no deseados',
      'Elegir entre restore, reset, revert y amend',
      'Recuperar commits que parecían perdidos',
    ],
    summary: [
      'restore descarta cambios del working directory.',
      'reset mueve el historial; --hard borra trabajo de forma irreversible.',
      'revert deshace sin borrar historia: es lo seguro en ramas compartidas.',
      'git reflog es el salvavidas ante un reset accidental.',
    ],
    exercises: [
      'Modifica un archivo y descártalo con git restore.',
      'Haz un commit, deshazlo con reset --soft y vuelve a commitear.',
      'Corrige el mensaje del último commit local con --amend.',
    ],
  },
  'ramas': {
    objectives: [
      'Crear y cambiar de rama',
      'Entender qué es HEAD',
      'Gestionar y borrar ramas',
      'Distinguir fast-forward de fusión con commit de merge',
    ],
    summary: [
      'Una rama es un puntero móvil a un commit, no una copia de archivos.',
      'switch -c crea la rama y te cambia a ella en un paso.',
      'HEAD indica la rama o commit en el que estás.',
      'Al cambiar de rama, tu working directory se actualiza a esa rama.',
      'git pull = fetch + merge: trae e integra los cambios del remoto.',
      'Fast-forward solo mueve el puntero; si ambas ramas divergen, se crea un commit de merge.',
    ],
    exercises: [
      'Crea una rama feature, haz un commit y vuelve a main.',
      'Lista las ramas con git branch e identifica la actual.',
      'Fusiona la rama con git merge y observa si fue fast-forward.',
      'Borra la rama fusionada con git branch -d.',
    ],
  },
  'fusiones': {
    objectives: [
      'Fusionar ramas con git merge',
      'Distinguir fast-forward de three-way merge',
      'Resolver conflictos paso a paso',
    ],
    summary: [
      'Te colocas en la rama destino y fusionas la otra.',
      'Fast-forward solo mueve el puntero; three-way crea un commit de merge.',
      'Un conflicto es Git pidiéndote una decisión, no un error.',
      'Resuelve: edita el archivo, borra los marcadores, add y commit.',
    ],
    exercises: [
      'Reproduce una fusión fast-forward.',
      'Provoca un conflicto editando la misma línea en dos ramas y resuélvelo.',
      'Cancela una fusión en curso con git merge --abort.',
    ],
  },
  'rebase-stash-tags': {
    objectives: [
      'Guardar trabajo temporal con stash',
      'Reescribir el historial con rebase',
      'Etiquetar versiones con tags',
    ],
    summary: [
      'stash guarda cambios sin commitear y los recuperas con stash pop.',
      'rebase reaplica tus commits sobre otra base: historial lineal.',
      'Nunca rebasees commits ya publicados en ramas compartidas.',
      'Los tags marcan releases y se suben con git push --tags.',
    ],
    exercises: [
      'Guarda cambios con git stash, cambia de rama y recupéralos.',
      'Haz un rebase interactivo para unir dos commits (squash).',
      'Crea un tag anotado v1.0.0 y súbelo.',
    ],
  },
  'repositorios-remotos': {
    objectives: [
      'Clonar y conectar repositorios remotos',
      'Sincronizar con fetch, pull y push',
      'Interpretar los estados ahead/behind',
    ],
    summary: [
      'origin es el nombre por defecto del remoto.',
      'fetch descarga sin fusionar; pull = fetch + merge/rebase.',
      'Haz pull antes de push para evitar rechazos.',
      'git push -u vincula tu rama local con la remota.',
    ],
    exercises: [
      'Clona un repositorio público.',
      'Añade un remoto con git remote add y lístalo con git remote -v.',
      'Simula un push rechazado y resuélvelo con pull --rebase.',
    ],
  },
  'github-esencial': {
    objectives: [
      'Crear y configurar tu cuenta y repositorios',
      'Escribir un README útil',
      'Autenticarte con token o SSH',
    ],
    summary: [
      'GitHub aloja repositorios y añade colaboración.',
      'HTTPS usa un Personal Access Token; SSH usa claves.',
      'El README es la portada del proyecto.',
      'Activa 2FA para proteger tu cuenta.',
    ],
    exercises: [
      'Crea un repositorio público con README y licencia.',
      'Genera un Personal Access Token con scope repo.',
      'Configura SSH y prueba la conexión con ssh -T git@github.com.',
    ],
  },
  'colaboracion-pr': {
    objectives: [
      'Explicar qué son un fork y un Pull Request',
      'Seguir el flujo completo de un PR',
      'Usar issues y code review',
    ],
    summary: [
      'Fork = copia del repo en tu cuenta; upstream = repo original.',
      'El PR propone cambios y permite revisarlos antes de integrarlos.',
      'Closes #42 cierra un issue automáticamente al fusionar.',
      'Los PRs pequeños y enfocados se revisan mejor.',
    ],
    exercises: [
      'Haz fork de un repositorio y añade el remoto upstream.',
      'Crea una rama, haz un cambio y abre un Pull Request.',
      'Comenta una línea de un PR con una sugerencia.',
    ],
  },
  'github-actions': {
    objectives: [
      'Entender qué es la CI/CD y para qué sirve',
      'Leer y escribir un workflow en YAML',
      'Distinguir uses de run y usar secretos con seguridad',
    ],
    summary: [
      'Un workflow es un YAML en .github/workflows/ con eventos, jobs y steps.',
      'on dispara; runs-on elige el runner; uses trae acciones y run ejecuta comandos.',
      'Los jobs corren en paralelo salvo que los encadenes con needs.',
      'Las claves van en secrets, nunca en el YAML.',
    ],
    exercises: [
      'Añade un workflow que ejecute npm test en cada push a main.',
      'Añade workflow_dispatch y lánzalo a mano desde la pestaña Actions.',
      'Prueba una matriz con dos versiones de Node y observa los jobs.',
    ],
  },
  'desktop-introduccion': {
    objectives: [
      'Instalar y conectar GitHub Desktop',
      'Conocer los elementos de su interfaz',
      'Saber cuándo usar la GUI y cuándo la terminal',
    ],
    summary: [
      'GitHub Desktop es Git con interfaz gráfica.',
      'El diff visual facilita revisar antes de commitear.',
      'No cubre operaciones avanzadas (rebase interactivo, reflog).',
      'Lo ideal es combinar Desktop y terminal.',
    ],
    exercises: [
      'Instala GitHub Desktop e inicia sesión.',
      'Identifica Current Repository, Current Branch y Changes.',
      'Abre un repositorio en la terminal desde la app.',
    ],
  },
  'desktop-flujo': {
    objectives: [
      'Clonar y crear repositorios en Desktop',
      'Hacer commits con diff visual',
      'Publicar y sincronizar cambios',
    ],
    summary: [
      'Las casillas equivalen a git add; Commit, a git commit.',
      'Publish repository crea el repositorio en GitHub.',
      'Fetch/Pull/Push equivalen a sus comandos de Git.',
      'El diff visual evita subir archivos de más.',
    ],
    exercises: [
      'Crea un repositorio, haz un commit y publícalo.',
      'Revisa el diff antes de commitear.',
      'Sincroniza con Fetch, Pull y Push.',
    ],
  },
  'desktop-ramas-pr': {
    objectives: [
      'Crear y cambiar ramas en Desktop',
      'Resolver conflictos visualmente',
      'Abrir Pull Requests desde la app',
    ],
    summary: [
      'Current Branch → New Branch crea ramas.',
      'VS Code y Desktop resuelven conflictos con botones.',
      'Publica (push) la rama antes de abrir un PR.',
      'Create Pull Request abre GitHub con el PR pre-rellenado.',
    ],
    exercises: [
      'Crea una rama, haz un commit y publícala.',
      'Provoca un conflicto y resuélvelo en VS Code.',
      'Abre un Pull Request desde Desktop.',
    ],
  },
  'gitignore-buenas-practicas': {
    objectives: [
      'Ignorar archivos correctamente',
      'Escribir buenos mensajes de commit',
      'Mantener un historial limpio',
    ],
    summary: [
      '.gitignore evita versionar dependencias, compilados y secretos.',
      'Nunca subas secretos: quedan en el historial aunque los borres después.',
      'Commits atómicos y mensajes claros (Conventional Commits).',
      'pull --rebase antes de subir evita merges innecesarios.',
    ],
    exercises: [
      'Crea un .gitignore adecuado para tu lenguaje.',
      'Escribe tres mensajes siguiendo Conventional Commits.',
      'Usa git rm --cached para dejar de rastrear un archivo ya subido.',
    ],
  },
  'flujos-y-avanzado': {
    objectives: [
      'Elegir un flujo de trabajo adecuado',
      'Usar comandos avanzados con criterio',
      'Crear alias y mantener el repositorio limpio',
    ],
    summary: [
      'GitHub Flow es el más simple; Git Flow, el más estructurado.',
      'cherry-pick trae un commit concreto; bisect encuentra el culpable.',
      'Los alias aceleran tu trabajo diario.',
      'reflog, revert y pull --rebase resuelven casi cualquier apuro.',
    ],
    exercises: [
      'Crea alias para log y status.',
      'Haz un cherry-pick de un commit entre dos ramas.',
      'Usa git bisect para encontrar un commit "roto" en un repo de práctica.',
    ],
  },
};
