# Cronómetro Vital: Guía de Código Azul ⏱️🫀

Asistente inteligente de tiempos e intervenciones para el rol de cronometrista en emergencias médicas (Código Azul y Soporte Vital Cardiovascular Avanzado - ACLS).

---

## 👥 Equipo de Trabajo
- **Construye:** Ana Yolanda Moreno y Tania Jineth Gomez
- **Producto:** Juliana Maria Suancha
- **Pruebas:** Andrés Felipe Moreno
- **Publica:** María Fernanda Martinez

---

## 🎯 Funciones Principales

1. **Anotar (Registrar evento):** Botones de acción rápida táctiles extragrandes (`Adrenalina 1mg`, `Desfibrilación / Shock 200J`, `Amiodarona 300mg / 150mg`, `Ritmos`, `Vía Aérea`, `Acceso Vascular`) que capturan automáticamente el minuto y segundo exactos sin necesidad de teclear.
2. **Ver (Relojes y línea de tiempo):**
   - Cronómetro maestro de tiempo total transcurrido.
   - Metrónomo visual silencioso a 110 CPM (cadencia de compresiones según guías de reanimación).
   - Lista cronológica inmutable de intervenciones.
3. **Marcar (Verificar tiempos críticos):** Temporizador de **Ciclo RCP de 2 minutos** con cambio dinámico de color:
   - *Verde/Ámbar:* Ciclo en curso normal.
   - *Ámbar parpadeante:* ¡Últimos 15 segundos! Preparar cambio de reanimador y evaluación de ritmo.
   - *Rojo vivo:* ¡2 minutos cumplidos! Alerta visual para verificar ritmo.
   - Botón gigante táctil para marcar ciclo completado y reiniciar el conteo.
4. **Buscar (Filtrar medicamentos y dosis):**
   - Tarjetas de respuesta inmediata para reportar al líder del paro: *"¿Cuándo fue la última dosis de Adrenalina?"* (indicador de ventana de 3 a 5 min), última descarga y dosis de Amiodarona.
   - Barra de búsqueda reactiva por texto para filtrar la bitácora al segundo.
   - Botón para copiar el reporte clínico completo formateado para la historia clínica.

---

## 🛡️ Principios del PRD
- **100% Silenciosa:** Sin pitidos ni alarmas audibles que compitan con el desfibrilador o confundan al equipo en sala de reanimación. Todo aviso es visual.
- **Sin formularios de paciente:** Cero fricción de datos demográficos durante la crisis.
- **Sin cálculos de dosis:** Registra fielmente lo administrado sin sustituir el criterio médico.
- **Independiente:** Funciona en cualquier navegador de celular o computador sin requerir conexión a monitores clínicos.

---

## 📱 Acceso Web
Publicado mediante GitHub Pages:
👉 [https://tania348.github.io/Cronometro_vital/](https://tania348.github.io/Cronometro_vital/)
