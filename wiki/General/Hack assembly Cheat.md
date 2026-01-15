---
banner: "![[zW9ZY.png]]"
---

# Hack Assembly Cheat Reference (Nand2Tetris)

<style>
.two-col { column-count: 2; column-gap: 20px; column-rule: 1px solid #ccc; }
</style>

<div class="two-col">

## 1. Architecture Overview

|Component|Description|
|---|---|
|Word size|16 bits|
|Registers|A, D|
|Memory|RAM[0–32767]|
|Program memory|ROM|
|I/O|Memory-mapped|

---

## 2. Special Memory Symbols

|Symbol|Address|Purpose|
|---|---|---|
|R0–R15|0–15|General registers|
|SCREEN|16384|Screen memory|
|KBD|24576|Keyboard input|

---

## 3. Instruction Types

|Type|Syntax|Meaning|
|---|---|---|
|A-instruction|`@value`|Load value/address into A|
|C-instruction|`dest=comp;jump`|Compute, store, and optional jump|

---

## 4. Registers & Memory Access

|Name|Meaning|
|---|---|
|A|Address / constant register|
|D|Data register|
|M|Memory at address A (RAM[A])|

</div>

<div style="page-break-after: always;"></div>

<div class="two-col">

## 5. Dest Field (dest)

|dest|Effect|
|---|---|
|M|RAM[A] ← comp|
|D|D ← comp|
|A|A ← comp|
|MD|M and D|
|AM|A and M|
|AD|A and D|
|AMD|A, D, and M|

---

## 6. Comp Field (comp)

### Constants

|comp|Meaning|
|---|---|
|0|zero|
|1|one|
|-1|minus one|

### Registers

|comp|Meaning|
|---|---|
|D|D|
|A|A|
|M|RAM[A]|

### Arithmetic

|comp|Meaning|
|---|---|
|D+1, A+1, M+1|increment|
|D-1, A-1, M-1|decrement|
|D+A, D+M|addition|
|D-A, D-M|subtraction|
|A-D, M-D|subtraction|


### Bitwise

|comp|Meaning|
|---|---|
|D&A, D&M|AND|
|D|A, D|

</div>

<div style="page-break-after: always;"></div>

<div class="two-col">

## 7. Jump Field (jump)

|jump|Condition|
|---|---|
|JGT|D > 0|
|JEQ|D = 0|
|JGE|D ≥ 0|
|JLT|D < 0|
|JNE|D ≠ 0|
|JLE|D ≤ 0|
|JMP|unconditional|

---

## 8. Labels & Variables

### Label

```asm
(LOOP)
```

- Points to ROM address
    
- Resolved at assembly time
    

### Variable

```asm
@i
M=1
```

- Allocated starting at RAM[16]
    

---

## 9. Common Control Flow Patterns

### Infinite Loop

```asm
(LOOP)
@LOOP
0;JMP
```

### If Statement

```asm
@X
D=M
@TRUE
D;JGT
```

</div>

<div style="page-break-after: always;"></div>

<div class="two-col">

### Loop Template

```asm
(LOOP)
    @i
    D=M
    @END
    D;JEQ

    // loop body

    @LOOP
    0;JMP
(END)
```

---

## 10. Screen & Keyboard

### Screen

- Each word = 16 horizontal pixels
    
- 1 = pixel on (black), 0 = pixel off (white)
    

### Keyboard

```asm
@KBD
D=M     // 0 = no key pressed
```

---

## 11. Debugging Tips

|Problem|Fix|
|---|---|
|Nothing happens|Check infinite loop|
|Wrong RAM value|Check A before M|
|Jump not working|Ensure D is set properly|
|Screen blank|Loop through SCREEN|

---

## 12. Key Rules to Remember

- M always means RAM[A]
    
- No stack or functions
    
- No strings or console output
    
- Output = RAM or SCREEN

</div>
    
