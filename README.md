# La Desaparición del Universo — Cuaderno de prácticas

Web independiente para recorrer las prácticas de la recopilación «Técnicas espirituales y protocolos en La Desaparición del Universo de Gary R. Renard», facilitada para este proyecto.

## Acceso

Cuando GitHub Pages esté activado, la web se publica en:

https://armandmu.github.io/la-desaparicion-del-universo/

Para activarla: **Settings → Pages → Build and deployment → Deploy from a branch → main → /(root) → Save**.

## Incluye

- 17 capítulos con 51 técnicas, descripciones y 153 pasos de protocolo.
- Diez frases recogidas al final del documento.
- Progreso por técnica y por capítulo.
- Marcado individual de pasos; registro de cada realización con fecha.
- Diario con anotaciones, historial de repeticiones y edición/eliminación de entradas.
- Búsqueda por título, descripción o pasos, y filtros por estado o favoritos.
- Exportar e importar copia de seguridad JSON.
- Diseño adaptable y caché para uso sin conexión tras la primera visita, cuando el navegador lo permite.

## Privacidad

Los registros se guardan en `localStorage`, con la clave `ldu-cuaderno-personal-v1`. **Las notas no se suben al repositorio ni a servidores de la aplicación.** No existe sincronización automática entre dispositivos. Se recomienda exportar copias periódicamente: borrar los datos del navegador puede eliminar el historial.

Los proyectos bajo el dominio `armandmu.github.io` comparten el origen del navegador, incluso cuando sus rutas pertenecen a repositorios distintos. Por eso, otros scripts servidos desde el mismo origen pueden acceder técnicamente a ese `localStorage`. No deben guardarse aquí datos clínicos ni información confidencial de otras personas.

## Uso de la fuente

El contenido procede de la recopilación aportada. **No se ha cotejado con la edición comercial del libro de Gary R. Renard**, por lo que no se garantiza que sea una transcripción literal ni una lista exhaustiva de los ejercicios del libro. Las afirmaciones sobre ilusión, guía espiritual y enfermedad se presentan como creencias espirituales, no hechos científicos. Ningún protocolo sustituye la atención sanitaria ni justifica atribuir enfermedades a culpa personal.

## Tecnología

HTML, CSS y JavaScript sin dependencias ni servidores. GitHub Pages aloja los recursos estáticos. `content.js` contiene las prácticas y `app.js` gestiona la interacción. `sw.js` implementa caché para los recursos públicos.

## Comprobaciones recomendadas

Al modificar la aplicación, comprueba que `content.js` contiene exactamente 51 fichas con 3 pasos, que todas las rutas cargan, que las anotaciones se recuperan tras recargar y que importar/exportar JSON conserva el historial.
