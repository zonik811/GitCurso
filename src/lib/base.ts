/* BASE_URL no siempre termina en barra (con base '/GitCurso' llega como
   '/GitCurso'), asi que la garantizamos para poder concatenar rutas. */
const raw = import.meta.env.BASE_URL;
export const base = raw.endsWith('/') ? raw : raw + '/';
