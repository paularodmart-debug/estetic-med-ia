# Tercera iteración · Recorrido para el hackathon

## Objetivo
Hacer visible desde el primer momento esta propuesta:

«Estetic Med IA convierte cada consulta en un siguiente paso organizado, revisable y seguro para el equipo de la clínica».

Este plan no implementa cambios. Se conservan íntegramente la estética premium rosa empolvado, la web pública, el Copiloto, los roles, las consultas y las tareas existentes. La demostración sigue sin cuentas ni servicios externos.

## Cambios propuestos
1. **Propuesta de valor visible.** Añadir la frase literal como subtítulo del Panel clínica y como bloque breve en Inicio, cerca de «Ver demo para clínicas», sin sustituir la presentación actual.
2. **Tres casos contrastados desde el inicio.**
   - **María García:** prioridad alta, información completa y varias tareas pendientes.
   - **Carmen López:** información incompleta, score organizativo medio o bajo y una tarea en revisión.
   - **Ana Fernández:** seguimiento avanzado, tareas completadas y estado «Resuelto organizativamente».
3. **Contexto seguro en cada tarjeta.** Mostrar «Datos ficticios» y «El score solo organiza el trabajo; no es clínico». La resolución de Ana se refiere exclusivamente a sus tareas, nunca a un resultado médico.

## Recorrido de presentación · Tres minutos
- **0:00–0:25:** mostrar la propuesta de valor en Inicio y entrar por «Ver demo para clínicas».
- **0:25–1:00:** comparar María, Carmen y Ana: prioridad, información pendiente y avance organizativo.
- **1:00–1:35:** abrir «Nueva consulta», registrar un identificador ficticio y datos administrativos; mostrar completitud y los motivos del score.
- **1:35–2:15:** seleccionar la nueva consulta, abrir el Copiloto y elegir «Crear plan de seguimiento»; revisar sus tarjetas y convertir la propuesta en tareas.
- **2:15–2:45:** abrir una tarea en la bandeja, completarla y mostrar el avance sincronizado del caso; contrastar con Ana.
- **2:45–3:00:** mostrar el rechazo de una pregunta clínica y cerrar con la responsabilidad del profesional.

El guion se prepara para quien presenta; no añade una guía obligatoria ni controles nuevos a la aplicación.

## Detalles técnicos
- Mantener los casos y tareas iniciales en memoria, compartidos por el Panel, la bandeja y el Copiloto; recargar reinicia la demo.
- Calcular el score con la fórmula existente: prioridad, completitud y existencia de próxima acción. No asignar niveles manuales ni usar texto clínico para priorizar.
- Reflejar las tareas iniciales en ambos listados, con responsables y fechas ficticios coherentes.
- Conservar la conversión sin duplicados para los casos que ya tienen tareas; usar la nueva consulta en la presentación para demostrar la creación de tareas.
- Mostrar la resolución organizativa a partir del estado de las tareas, de modo que vuelva a estar pendiente si se reabre una tarea.
- Conservar las conversaciones separadas por caso, las acciones rápidas y todos los rechazos clínicos.

## Verificación antes de entregar
- Comprobar María completa y prioritaria; Carmen incompleta con score medio o bajo y una revisión; Ana con todas sus tareas completadas.
- Probar nueva consulta → Copiloto → plan → tareas → completar → actualización del caso, sin duplicados ni mezcla de conversaciones.
- Comprobar que ningún cambio altera los límites no clínicos, los filtros, los roles o la web pública.
- Revisar que la frase y los avisos se leen correctamente en ordenador y móvil, sin alterar la estética.

**Fuera de alcance:** autenticación, pagos, WhatsApp, IA externa, métricas de beneficios no demostrados y cualquier decisión clínica.