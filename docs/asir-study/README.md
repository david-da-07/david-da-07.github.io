# ASIR Study v1.3
Campus estático para GitHub Pages. Subir todos los archivos y carpetas a la raíz de la rama main y habilitar Pages. Para probar localmente: `python -m http.server 8000` desde esta carpeta y abrir http://localhost:8000. No abrir index.html con file://: el cargador usa fetch de JSON.

## Contenido
Cada curso tiene course.json y cada unidad contiene theory.json, questions-test.json, questions-open.json, activities.json. El índice courses/index.json enumera cursos. Los materiales ASGBD incluyen los siete PDF originales, imágenes de cada página y texto extraído. Las explicaciones de la versión previa se presentan antes de los originales. El material original pertenece a sus autores; verifica permiso antes de publicarlo en un repositorio público.

500 preguntas objetivas (377 elección única y 123 V/F), 100 abiertas adicionales y 45 actividades previas. Parte del banco utiliza variantes de reconocimiento conceptual o ejercicios con parámetros distintos. Los distractores y las soluciones son de elaboración didáctica, no oficiales. El campo correct es índice base cero. Las preguntas V/F usan type choice y format boolean. Los ejercicios abiertos incluyen reference y rubric opcional. No reutilizar IDs dentro de una unidad.

Configura Gemini con tu propia clave temporal; no se guarda en disco. La corrección de SQL no ejecuta código. Los datos de progreso permanecen en almacenamiento local. Las claves y las respuestas de un campus estático no se pueden proteger frente a quien inspeccione el cliente. No utilizar para evaluación oficial.

Los intentos antiguos conservan los IDs de preguntas pero se ha cambiado la posición de alternativas: inicia nuevos intentos. Las calificaciones previas permanecen en almacenamiento local. Los demás cursos siguen siendo demostraciones.
