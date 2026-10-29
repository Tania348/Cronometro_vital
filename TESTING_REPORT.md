# 📋 Informe de Pruebas y Matriz de Hallazgos («Qué Arreglar»)

**Proyecto:** Cronómetro Vital: Guía de Código Azul  
**Versión:** 1.0.0 (Primera versión web pública)  
**Fecha:** 29 de octubre de 2026  
**Enlace Público:** [https://tania348.github.io/Cronometro_vital/](https://tania348.github.io/Cronometro_vital/)  

---

## 🔍 Resumen de Pruebas Realizadas

Se ejecutó una prueba de simulación completa simulando un Código Azul de 12 minutos con:
- Inicio y control de tiempos.
- 5 ciclos de RCP (10 minutos acumulados).
- 3 descargas de desfibrilación a 200 Joules.
- 3 bolos de Adrenalina 1 mg (a los minutos 3, 7 y 11).
- 2 dosis de Amiodarona (300 mg y 150 mg).
- Navegación táctil en navegador móvil y escritorio.

---

## ⚠️ Matriz Obligatoria: Lista de «Qué Arreglar»

Formato estricto: **«Al tocar X, pasa Y, y esperaba Z»**

| # | Componente | Situación («Al tocar X») | Comportamiento actual («Pasa Y») | Comportamiento esperado («Esperaba Z») | Severidad |
|---|---|---|---|---|---|
| **1** | **Fin del ciclo RCP** | Al llegar a los 2 minutos (00:00) y no tocar inmediatamente "Marcar ciclo" | El cronómetro de ciclo se queda en 00:00 (en rojo) | Que empiece a contar tiempo excedido en rojo (ej. +00:15s, +00:30s) para que el médico sepa exactamente cuántos segundos de retraso hay en el cambio de reanimador. | Media |
| **2** | **Deshacer toque accidental** | Al tocar por error un botón de acción rápida (ej. "Desfibrilación" o "Adrenalina") | Se suma inmediatamente al contador y no hay forma de revertirlo sin reiniciar todo | Que aparezca un botón flotante pequeño *"Deshacer"* durante los primeros 4 segundos por si el dedo del cronometrista resbaló por estrés o vibración. | Alta |
| **3** | **Control de Metrónomo** | Al tocar la barra superior del metrónomo visual a 110 CPM | No hay respuesta interactiva, el metrónomo parpadea continuamente | Que permita tocarlo para pausar o activar la animación si a algún miembro del equipo le causa distracción visual. | Baja |
| **4** | **Teclado móvil en Búsqueda** | Al tocar la barra de búsqueda en la pantalla de Dosis desde un celular | El teclado del teléfono sube y oculta los botones inferiores de navegación | Que al presionar "Limpiar" o deslizar hacia abajo, el teclado se cierre automáticamente para recuperar la visibilidad de toda la pantalla. | Media |
| **5** | **Alerta háptica (Vibración)** | Al cumplirse los 2 minutos de RCP en un teléfono móvil | La pantalla cambia a rojo visualmente, pero el teléfono no vibra | Que el teléfono emita una breve vibración física silenciosa (usando la API `navigator.vibrate`) para alertar al cronometrista incluso si aparta la mirada por un segundo. | Deseable |

---

## 🚀 Lista de Siguientes Pasos (Basada en Pruebas)

1. **Paso 1 (Prioridad Alta):** Incorporar contador de tiempo excedido (+00:xx) cuando el ciclo supere los 2 minutos para visibilizar retrasos críticos.
2. **Paso 2 (Prioridad Alta):** Añadir opción de "Deshacer último evento" durante 4 segundos para evitar registros erróneos en situaciones de alta adrenalina.
3. **Paso 3 (Prioridad Media):** Implementar vibración silenciosa en teléfonos compatibles al llegar a los 2 minutos de RCP y al entrar en ventana de Adrenalina (3-5 min).
4. **Paso 4 (Prioridad Media):** Añadir botón de "Exportar a PDF" o imprimir resumen clínico con un solo clic para adjuntar a la historia clínica en físico.
5. **Paso 5 (Validación Clínica):** Realizar sesiones de simulación con el equipo de reanimación y profesionales de salud para retroalimentación operativa.
