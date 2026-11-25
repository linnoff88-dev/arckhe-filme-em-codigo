# Falhas — filme-em-codigo

| data | o que quebrou | menor correçêo | prompt \| infra |
|---|---|---|---|
| 19/11/2026 | camadas-planas: árvores da frente saíam pretas (cor `rgb(...)` misturada de novo virava inválida) | `Filme.hex()` devolve `#rrggbb` para cor que será misturada depois | prompt |
| 19/11/2026 | cena-3d: árvores pretas (cor da instância multiplicava a do material) | `setColorAt` com cinza, nêo com a cor do material | prompt |
| 19/11/2026 | marionete: o lençol sumia (degradê e peça com o mesmo `id="lencol"`) | degradê renomeado para `grad-lencol` | prompt |
| 19/11/2026 | cena-3d: árvores no caminho tapavam a câmera e a luz estourava a neve | corredor livre de 3,5 m, copa mais alta, lampiões mais fracos | prompt |
