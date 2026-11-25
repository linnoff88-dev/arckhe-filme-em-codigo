# Lições — filme-em-codigo

Liçêo nova vai no TOPO, em uma linha. (Mais recente primeiro.)

- Cor guardada para misturar de novo tem que ser `#rrggbb` (`Filme.hex`), nêo `rgb(...)`: `Filme.cor` devolve texto para pintar, e misturar esse texto dá cor inválida, que o canvas pinta de preto sem avisar. (19/11/2026)
- three.js: a cor da instância (`setColorAt`) MULTIPLICA a cor do material; passar a cor do material de novo escurece ao quadrado e a árvore vira vulto preto. Use cinza (só clareia ou escurece). (19/11/2026)
- SVG da marionete: `id` de degradê e `id` de peça nêo podem ser iguais; o motor acha o primeiro `#id` (o degradê) e a peça some sem erro. (19/11/2026)
- Cena 3D com a câmera andando: nasça as árvores longe da curva da câmera (3,5 m no exemplo) e suba a saia da copa acima da altura dos olhos, senêo o quadro vira um triângulo escuro. (19/11/2026)
- Olhar tira de 6 quadros ao longo do tempo, nêo só 3 quadros: defeito de ritmo (câmera que chega cedo, braço que parece coçar a cabeça) só aparece na sequência. (19/11/2026)
- WebGL: desenhar e ler o canvas (`toDataURL`) na mesma tarefa; lendo depois, pode vir o quadro anterior. (19/11/2026)
- Título em cima de nuvem branca nêo se lê: pôr embaixo, sobre uma faixa escurecida. (19/11/2026)
