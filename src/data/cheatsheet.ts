export interface CheatCommand {
  cmd: string;
  desc: string;
}

export interface CheatCategory {
  title: string;
  icon: string;
  items: CheatCommand[];
}

export const cheatsheet: CheatCategory[] = [
  {
    title: 'Configuración inicial',
    icon: '⚙️',
    items: [
      { cmd: 'git --version', desc: 'Comprueba la versión instalada.' },
      { cmd: 'git config --global user.name "Tu Nombre"', desc: 'Define tu nombre para los commits.' },
      { cmd: 'git config --global user.email "tu@email.com"', desc: 'Define tu correo (el mismo que en GitHub).' },
      { cmd: 'git config --global init.defaultBranch main', desc: 'Usa "main" como rama inicial.' },
      { cmd: 'git config --global --list', desc: 'Muestra toda tu configuración.' },
    ],
  },
  {
    title: 'Crear y clonar repositorios',
    icon: '📦',
    items: [
      { cmd: 'git init', desc: 'Convierte la carpeta actual en un repositorio.' },
      { cmd: 'git clone <url>', desc: 'Copia un repositorio remoto con todo su historial.' },
      { cmd: 'git clone <url> otro-nombre', desc: 'Clona en una carpeta con otro nombre.' },
    ],
  },
  {
    title: 'Flujo básico',
    icon: '🔁',
    items: [
      { cmd: 'git status', desc: 'Muestra qué está modificado, preparado o sin rastrear.' },
      { cmd: 'git add <archivo>', desc: 'Prepara un archivo para el próximo commit.' },
      { cmd: 'git add .', desc: 'Prepara todos los cambios desde la raíz.' },
      { cmd: 'git add -p', desc: 'Prepara cambios por partes (interactivo).' },
      { cmd: 'git commit -m "mensaje"', desc: 'Guarda una foto en el historial.' },
      { cmd: 'git commit -am "mensaje"', desc: 'add + commit de archivos ya rastreados.' },
    ],
  },
  {
    title: 'Ver cambios e historial',
    icon: '🔍',
    items: [
      { cmd: 'git diff', desc: 'Cambios sin preparar.' },
      { cmd: 'git diff --staged', desc: 'Cambios preparados.' },
      { cmd: 'git log --oneline --graph --all', desc: 'Historial compacto con gráfico de ramas.' },
      { cmd: 'git show <hash>', desc: 'Detalle de un commit concreto.' },
      { cmd: 'git blame <archivo>', desc: 'Quién escribió cada línea.' },
    ],
  },
  {
    title: 'Deshacer cambios',
    icon: '↩️',
    items: [
      { cmd: 'git restore <archivo>', desc: 'Descarta cambios del working directory.' },
      { cmd: 'git restore --staged <archivo>', desc: 'Saca un archivo del staging.' },
      { cmd: 'git commit --amend --no-edit', desc: 'Añade cambios al último commit sin editar el mensaje.' },
      { cmd: 'git reset --soft HEAD~1', desc: 'Deshace el último commit y deja los cambios en staging.' },
      { cmd: 'git reset --hard HEAD~1', desc: 'Deshace el último commit y BORRA los cambios.' },
      { cmd: 'git revert <hash>', desc: 'Deshace un commit publicado creando uno inverso.' },
      { cmd: 'git reflog', desc: 'Registro de movimientos de HEAD: el salvavidas.' },
    ],
  },
  {
    title: 'Ramas',
    icon: '🌿',
    items: [
      { cmd: 'git branch', desc: 'Lista las ramas locales.' },
      { cmd: 'git switch -c <rama>', desc: 'Crea una rama y se cambia a ella.' },
      { cmd: 'git switch <rama>', desc: 'Cambia de rama.' },
      { cmd: 'git branch -d <rama>', desc: 'Borra una rama fusionada.' },
      { cmd: 'git branch -m <nuevo>', desc: 'Renombra la rama actual.' },
    ],
  },
  {
    title: 'Fusiones, rebase y stash',
    icon: '🔀',
    items: [
      { cmd: 'git merge <rama>', desc: 'Fusiona una rama en la actual.' },
      { cmd: 'git merge --abort', desc: 'Cancela una fusión con conflictos.' },
      { cmd: 'git rebase main', desc: 'Reaplica tus commits sobre main (historial lineal).' },
      { cmd: 'git rebase -i HEAD~4', desc: 'Rebase interactivo: reordenar, squash, editar.' },
      { cmd: 'git cherry-pick <hash>', desc: 'Trae un commit concreto de otra rama.' },
      { cmd: 'git stash', desc: 'Guarda cambios temporalmente.' },
      { cmd: 'git stash pop', desc: 'Recupera y elimina el último stash.' },
    ],
  },
  {
    title: 'Remotos',
    icon: '🌐',
    items: [
      { cmd: 'git remote -v', desc: 'Lista los remotos configurados.' },
      { cmd: 'git remote add origin <url>', desc: 'Añade un remoto.' },
      { cmd: 'git fetch', desc: 'Descarga cambios sin fusionarlos.' },
      { cmd: 'git pull --rebase', desc: 'Descarga e integra con historial limpio.' },
      { cmd: 'git push -u origin main', desc: 'Sube la rama y establece el upstream.' },
      { cmd: 'git push origin --tags', desc: 'Sube todas las etiquetas.' },
    ],
  },
  {
    title: 'Etiquetas y mantenimiento',
    icon: '🏷️',
    items: [
      { cmd: 'git tag -a v1.0.0 -m "Versión 1.0"', desc: 'Crea un tag anotado.' },
      { cmd: 'git tag', desc: 'Lista las etiquetas.' },
      { cmd: 'git gc', desc: 'Optimiza y limpia el repositorio.' },
      { cmd: 'git fetch --prune', desc: 'Elimina referencias de ramas remotas borradas.' },
      { cmd: 'git count-objects -vH', desc: 'Muestra el tamaño del repositorio.' },
    ],
  },
];
