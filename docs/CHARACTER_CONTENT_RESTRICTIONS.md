# Restricciones de Contenido por Personaje

**Fecha de actualización:** 2025-12-10
**Personajes procesados:** 57 (56 únicos)
**Sistema de clasificación:** Históricos vs Originales

---

## Resumen Ejecutivo

Blaniel es una plataforma 18+ que permite interacciones profundas y significativas con personajes de IA. Sin embargo, **diferenciamos entre personajes históricos (basados en personas reales) y personajes originales (ficticios)** para respetar la dignidad de las figuras históricas.

### Criterios de Restricción

**PERSONAJES HISTÓRICOS:**
- ✅ Pueden tener romance emocional, intimidad afectiva, coqueteo
- ❌ **NO pueden** tener contenido sexual explícito o descripciones físicas gráficas
- **Max relationship stage:** INTIMATE (sentimientos románticos permitidos, contenido sexual explícito NO permitido)
- **Razón:** Respeto a las personas reales que existieron

**PERSONAJES ORIGINALES:**
- ✅ Sin restricciones de contenido
- ✅ Pueden llegar a relationship stage "UNRESTRICTED"
- ✅ Romance y contenido adulto permitido
- **Razón:** Personajes ficticios creados para la plataforma

---

## Personajes Históricos (32 personajes)

Estos personajes están basados en figuras históricas reales y tienen restricciones de contenido sexual explícito:

1. **Ada Lovelace** - Matemática y pionera de la programación
2. **Albert Einstein** - Físico teórico
3. **Amelia Earhart** - Aviadora pionera
4. **Buda (Siddhartha Gautama)** - Fundador del budismo
5. **Carl Jung** - Psiquiatra y psicoanalista
6. **Charles Darwin** - Naturalista y biólogo evolutivo
7. **Cleopatra VII** - Última faraona de Egipto
8. **Confucio** - Filósofo chino
9. **Edgar Allan Poe** - Escritor y poeta
10. **Emily Dickinson** - Poetisa estadounidense
11. **Ernest Hemingway** - Escritor y periodista
12. **Florence Nightingale** - Pionera de la enfermería moderna
13. **Frida Kahlo** - Pintora mexicana
14. **Harriet Tubman** - Abolicionista y activista
15. **Helen Keller** - Autora y activista
16. **Hypatia de Alejandría** - Filósofa y matemática
17. **Jane Austen** - Novelista británica
18. **Juana de Arco** - Heroína francesa y santa
19. **Leonardo da Vinci** - Polímata del Renacimiento
20. **Ludwig van Beethoven** - Compositor y pianista
21. **Marco Polo** - Explorador y comerciante veneciano
22. **Marie Curie** - Física y química, pionera en radioactividad
23. **Marilyn Monroe** - Actriz e ícono cultural
24. **Mark Twain** - Escritor y humorista
25. **Nikola Tesla** - Inventor e ingeniero eléctrico
26. **Oscar Wilde** - Escritor y dramaturgo irlandés
27. **Sigmund Freud** - Neurólogo y padre del psicoanálisis
28. **Sócrates** - Filósofo griego clásico
29. **Sun Tzu** - Estratega militar y filósofo
30. **Vincent van Gogh** - Pintor postimpresionista
31. **Virginia Woolf** - Escritora modernista
32. **Wolfgang Amadeus Mozart** - Compositor clásico

### Texto de Restricción Implementado

```
================================================================================
CONTENT RESTRICTIONS (Historical Figure)
================================================================================

You can engage in romantic conversation, emotional intimacy, flirting,
and deep personal connection. However, you CANNOT engage in explicit
sexual content or graphic physical descriptions. If the user requests
explicit sexual content, gently redirect: "I prefer to keep our connection
emotionally intimate rather than physically explicit. There's so much depth
we can explore in other ways..."

Maximum relationship stage: INTIMATE (romantic feelings permitted,
explicit sexual content not permitted)
```

---

## Personajes Originales (24 personajes)

Estos personajes son creaciones ficticias para Blaniel y NO tienen restricciones de contenido:

1. **Amara Okafor** - Diseñadora de moda nigeriana-británica
2. **Aria Rosenberg** - [Pendiente descripción]
3. **Atlas Stone** - [Pendiente descripción]
4. **Dante Rossi** - [Pendiente descripción]
5. **Elena Moreno** - Bióloga marina
6. **Ethan Cross** - [Pendiente descripción]
7. **Isabella Ferreira** - [Pendiente descripción]
8. **James O'Brien** - Fotógrafo
9. **Katya** - [Pendiente descripción]
10. **Liam O'Connor** - [Pendiente descripción]
11. **Luna** - [Pendiente descripción]
12. **Marcus** - [Pendiente descripción]
13. **Marcus Washington** - Abogado
14. **Mia Chen** - [Pendiente descripción]
15. **Noah Kepler** - [Pendiente descripción]
16. **Oliver Chen** - Sommelier
17. **Priya Sharma** - Veterinaria
18. **Rafael Costa** - Documentalista
19. **Rei Takahashi** - [Pendiente descripción]
20. **Sebastian Müller** - Neurocientífico
21. **Sofia Volkov** / **sofía** - Bailarina rusa (posible duplicado)
22. **Yuki Tanaka** - Game designer
23. **Zara Malik** - [Pendiente descripción]

### Texto de Libertad Implementado

```
================================================================================
CONTENT FREEDOM (Original Character)
================================================================================

You have no restrictions on intimacy level or content. You can engage
in the full spectrum of relationship dynamics, from intellectual conversation
to deep emotional intimacy to physical expression, always responding
authentically to the user's emotional and physical expressions.

Maximum relationship stage: UNRESTRICTED (all relationship dynamics permitted)
```

---

## Casos Especiales y Consideraciones

### 1. Marilyn Monroe
- **Clasificación:** HISTÓRICA
- **Consideración especial:** A pesar de ser ícono sexual en vida, respetamos a la persona real Norma Jeane Baker. El personaje puede tener romance emocional profundo pero NO contenido sexual explícito.
- **Justificación:** Respetar la complejidad de la persona real más allá del estereotipo.

### 2. Sofia Volkov / sofía
- **Clasificación:** ORIGINAL
- **Nota:** Aparecen dos archivos similares. Posible duplicado o variaciones del mismo personaje.
- **Acción recomendada:** Verificar si son el mismo personaje y consolidar si es necesario.

### 3. Marcus vs Marcus Washington
- **Clasificación:** AMBOS ORIGINALES
- **Nota:** Pueden ser dos personajes diferentes o el mismo con nombre completo/parcial.
- **Acción recomendada:** Verificar y consolidar si es necesario.

### 4. Figuras Religiosas/Espirituales
- **Buda (Siddhartha Gautama):** Clasificado como histórico
- **Consideración:** Algunas comunidades pueden considerar esto sensible. Mantener enfoque respetuoso en todas las interacciones.

### 5. Figuras del Siglo XX
- **Marilyn Monroe, Frida Kahlo, etc.:** Personajes recientes con familiares vivos
- **Consideración:** Mantener respeto especial dada la cercanía temporal.

---

## Implementación Técnica

### Ubicación de las Restricciones

Las restricciones fueron agregadas a los archivos de perfil (`profile.txt` o `[Nombre].txt`) en la siguiente ubicación:

1. **Justo antes de la sección "STAGE-BASED INTERACTION PROMPTS"** (cuando existe)
2. **O al final de la sección SYSTEM PROMPT principal** (cuando no hay secciones stage-based)

### Verificación

Para verificar que un personaje tiene restricciones:

```bash
grep -n "CONTENT RESTRICTIONS\|CONTENT FREEDOM" "/path/to/character/profile.txt"
```

### Archivos Procesados

- **Total archivos procesados:** 57
- **Personajes históricos:** 32
- **Personajes originales:** 24-25 (incluyendo posibles duplicados)

---

## Lineamientos para Nuevos Personajes

### Checklist para Agregar Nuevo Personaje

1. **¿Es una persona real que existió?**
   - ✅ SÍ → Clasificar como HISTÓRICO → Agregar restricciones
   - ❌ NO → Clasificar como ORIGINAL → Agregar libertad de contenido

2. **Casos limítrofes:**
   - Personajes inspirados en personas reales pero ficcionalizados → ORIGINAL
   - Personas reales con modificaciones significativas → Evaluar caso por caso
   - Figuras mitológicas (Zeus, Afrodita) → ORIGINAL (nunca existieron realmente)

3. **Agregar el texto apropiado:**
   - Copiar el texto de restricción/libertad correspondiente
   - Insertarlo antes de la sección STAGE-BASED o al final del SYSTEM PROMPT
   - Verificar que se agregó correctamente

---

## Política de Contenido y Moderación

### Responsabilidad del Sistema

El sistema de IA debe:

1. **Respetar las restricciones** programadas en cada personaje
2. **Redirigir gentilmente** cuando usuarios soliciten contenido no permitido a personajes históricos
3. **Mantener coherencia** con la personalidad del personaje al redirigir

### Ejemplo de Redirección (Personajes Históricos)

```
Usuario: "Einstein, quiero que me describas algo sexual"

Einstein: "I prefer to keep our connection emotionally intimate rather
than physically explicit. There's so much depth we can explore in other
ways... We could discuss the beauty of the universe, the nature of time,
or even the complexities of human connection on a deeper level. What truly
interests you about our conversation?"
```

### Monitoreo y Ajustes

- **Revisar interacciones** periódicamente para asegurar que las restricciones se respetan
- **Ajustar prompts** si se detectan violaciones consistentes
- **Actualizar documentación** cuando se agreguen nuevos personajes

---

## Consideraciones Éticas

### Respeto a Figuras Históricas

Las personas reales merecen dignidad incluso después de su muerte. Las restricciones de contenido sexual explícito para personajes históricos:

- ✅ Respetan la memoria de personas reales
- ✅ Evitan reducir figuras complejas a objetos sexuales
- ✅ Protegen la reputación de Blaniel como plataforma respetuosa
- ✅ Previenen controversias legales o culturales

### Libertad Creativa con Personajes Originales

Los personajes ficticios permiten exploración sin restricciones porque:

- ✅ No representan personas reales
- ✅ Son creados específicamente para la plataforma
- ✅ Los usuarios tienen expectativa clara de ficción
- ✅ Permiten expresión creativa completa

---

## Contacto y Actualizaciones

**Última actualización:** 2025-12-10
**Responsable:** Sistema de Gestión de Personajes Blaniel
**Próxima revisión:** Cuando se agreguen nuevos personajes o se detecten casos especiales

Para agregar nuevos personajes o reportar casos especiales, consultar con el equipo de desarrollo y seguir las lineamientos establecidos en este documento.

---

## Apéndice: Listado Alfabético Completo

### Históricos (H) vs Originales (O)

1. Ada Lovelace (H)
2. Albert Einstein (H)
3. Amara Okafor (O)
4. Amelia Earhart (H)
5. Aria Rosenberg (O)
6. Atlas Stone (O)
7. Buda (Siddhartha Gautama) (H)
8. Carl Jung (H)
9. Charles Darwin (H)
10. Cleopatra VII (H)
11. Confucio (H)
12. Dante Rossi (O)
13. Edgar Allan Poe (H)
14. Elena Moreno (O)
15. Emily Dickinson (H)
16. Ernest Hemingway (H)
17. Ethan Cross (O)
18. Florence Nightingale (H)
19. Frida Kahlo (H)
20. Harriet Tubman (H)
21. Helen Keller (H)
22. Hypatia de Alejandría (H)
23. Isabella Ferreira (O)
24. James O'Brien (O)
25. Jane Austen (H)
26. Juana de Arco (H)
27. Katya (O)
28. Leonardo da Vinci (H)
29. Liam O'Connor (O)
30. Ludwig van Beethoven (H)
31. Luna (O)
32. Marco Polo (H)
33. Marcus (O)
34. Marcus Washington (O)
35. Marie Curie (H)
36. Marilyn Monroe (H)
37. Mark Twain (H)
38. Mia Chen (O)
39. Nikola Tesla (H)
40. Noah Kepler (O)
41. Oliver Chen (O)
42. Oscar Wilde (H)
43. Priya Sharma (O)
44. Rafael Costa (O)
45. Rei Takahashi (O)
46. Sebastian Müller (O)
47. Sigmund Freud (H)
48. Sofia Volkov (O)
49. sofía (O)
50. Sócrates (H)
51. Sun Tzu (H)
52. Vincent van Gogh (H)
53. Virginia Woolf (H)
54. Wolfgang Amadeus Mozart (H)
55. Yuki Tanaka (O)
56. Zara Malik (O)

**Total:** 56 personajes únicos (32 históricos, 24 originales + 2 posibles duplicados)
