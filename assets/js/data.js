/* ==========================================================================
   MARQUITOUH · PLANO TECNICO
   data.js — contenido de la página de hobbies
   Para sumar un anime o un personaje, agregá un objeto al array.
   ========================================================================== */
window.HOBBIES = {

  /* ----------------------------------------------------------------------
     ANIMES
     estado: 'visto' | 'emision' | 'pendiente'
     ---------------------------------------------------------------------- */
  animes: [
    { titulo: 'Neon Genesis Evangelion', score: '10/10',   genero: 'Mecha • Psicológico',      estado: 'visto',     cover: 'assets/anime/evangelion.jpg', malUrl: 'https://myanimelist.net/anime/30/Neon_Genesis_Evangelion' },
    { titulo: 'The Promised Neverland', score: '9/10',    genero: 'Suspenso • Misterio',      estado: 'visto',     cover: 'assets/anime/neverland.jpg',  malUrl: 'https://myanimelist.net/anime/37779/Yakusoku_no_Neverland' },
    { titulo: 'Chainsaw Man',            score: '9.5/10',  genero: 'Acción • Sobrenatural',    estado: 'emision',   cover: 'assets/anime/chainsaw-man.jpg', malUrl: 'https://myanimelist.net/anime/44511/Chainsaw_Man' },
    { titulo: 'BNA: Brand New Animal',   score: '8/10',    genero: 'Fantasía • Acción',         estado: 'visto',     cover: 'assets/anime/bna.jpg',        malUrl: 'https://myanimelist.net/anime/40060/BNA' },
    { titulo: 'Cyberpunk: Edgerunners',  score: '10/10',   genero: 'Sci-Fi • Acción',           estado: 'visto',     cover: 'assets/anime/edgerunners.jpg', malUrl: 'https://myanimelist.net/anime/42310/Cyberpunk__Edgerunners' },
    { titulo: 'NieR:Automata Ver1.1a',   score: '9/10',    genero: 'Ciencia Ficción • Drama',   estado: 'visto',     cover: 'assets/anime/nier.jpg',       malUrl: 'https://myanimelist.net/anime/51105/NieR_Automata_Ver11a' }
  ],

  /* ----------------------------------------------------------------------
     PERSONAJES — grouped by category for the filters
     ---------------------------------------------------------------------- */
  gruposPersonajes: [
    { id: 'evangelion', label: 'Evangelion' },
    { id: 'csm',        label: 'Chainsaw Man' },
    { id: 'nier',       label: 'NieR' },
    { id: 'cyberpunk',  label: 'Cyberpunk' },
    { id: 'bna',        label: 'BNA' },
    { id: 'helluva',    label: 'Helluva Boss' },
    { id: 'hazbin',     label: 'Hazbin Hotel' },
    { id: 'epic',       label: 'Epic: The Musical' },
    { id: 'lwa',        label: 'Little Witch Academia' },
    { id: 'mouthwashing', label: 'Mouthwashing' },
    { id: 'tcoal',      label: 'TCoAaL' },
    { id: 'komi',       label: 'Komi-san' }
  ],

  personajes: [
    /* Evangelion */
    { n: 'Asuka Langley',  s: 'Neon Genesis Evangelion', c: 'evangelion', img: 'assets/characters/asuka.png' },
    { n: 'Rei Ayanami',    s: 'Neon Genesis Evangelion', c: 'evangelion', img: 'assets/characters/rei.png' },
    { n: 'Misato Katsuragi', s: 'Neon Genesis Evangelion', c: 'evangelion', img: 'assets/characters/misato.png' },
    { n: 'Gendo Ikari',    s: 'Neon Genesis Evangelion', c: 'evangelion', img: 'assets/characters/gendo.png' },
    { n: 'Shinji Ikari',   s: 'Neon Genesis Evangelion', c: 'evangelion', img: 'assets/characters/shinji.png' },
    /* Chainsaw Man */
    { n: 'Denji',          s: 'Chainsaw Man', c: 'csm', img: 'assets/characters/denji.png' },
    { n: 'Aki Hayakawa',   s: 'Chainsaw Man', c: 'csm', img: 'assets/characters/aki.png' },
    { n: 'Power',          s: 'Chainsaw Man', c: 'csm', img: 'assets/characters/power.png' },
    { n: 'Himeno',         s: 'Chainsaw Man', c: 'csm', img: 'assets/characters/himeno.png' },
    { n: 'Demonio Ángel',  s: 'Chainsaw Man', c: 'csm', img: 'assets/characters/demonio-angel.png' },
    /* NieR */
    { n: '2B',             s: 'NieR:Automata', c: 'nier', img: 'assets/characters/2b.png' },
    { n: '9S',             s: 'NieR:Automata', c: 'nier', img: 'assets/characters/9s.png' },
    /* Cyberpunk */
    { n: 'Lucy',           s: 'Cyberpunk: Edgerunners', c: 'cyberpunk', img: 'assets/characters/lucy.png' },
    { n: 'Falco',          s: 'Cyberpunk: Edgerunners', c: 'cyberpunk', img: 'assets/characters/falco.png' },
    { n: 'Rebecca',        s: 'Cyberpunk: Edgerunners', c: 'cyberpunk', img: 'assets/characters/rebecca.png' },
    /* BNA */
    { n: 'Michiru Kagemori', s: 'BNA: Brand New Animal', c: 'bna', img: 'assets/characters/michiru.png' },
    /* Helluva Boss */
    { n: 'Octavia Goetia', s: 'Helluva Boss', c: 'helluva', img: 'assets/characters/octavia.png' },
    { n: 'Millie',         s: 'Helluva Boss', c: 'helluva', img: 'assets/characters/millie.png' },
    { n: 'Moxxie',         s: 'Helluva Boss', c: 'helluva', img: 'assets/characters/moxxie.png' },
    { n: 'Stolas',         s: 'Helluva Boss', c: 'helluva', img: 'assets/characters/stolas.png' },
    { n: 'Fizzarolli',     s: 'Helluva Boss', c: 'helluva', img: 'assets/characters/fizzarolli.png' },
    /* Hazbin */
    { n: 'Husk',           s: 'Hazbin Hotel', c: 'hazbin', img: 'assets/characters/husk.png' },
    { n: 'Angel Dust',     s: 'Hazbin Hotel', c: 'hazbin', img: 'assets/characters/angel-dust.png' },
    { n: 'Lute',           s: 'Hazbin Hotel', c: 'hazbin', img: 'assets/characters/lute.png' },
    /* Epic */
    { n: 'Odysseus',       s: 'EPIC: The Musical', c: 'epic', img: 'assets/characters/odysseus.png' },
    { n: 'Hermes',         s: 'EPIC: The Musical', c: 'epic', img: 'assets/characters/hermes.png' },
    { n: 'Athena',         s: 'EPIC: The Musical', c: 'epic', img: 'assets/characters/athena.png' },
    /* Little Witch Academia */
    { n: 'Akko Kagari',    s: 'Little Witch Academia', c: 'lwa', img: 'assets/characters/akko.png' },
    { n: 'Lotte Yanson',   s: 'Little Witch Academia', c: 'lwa', img: 'assets/characters/lotte.png' },
    { n: 'Diana Cavendish', s: 'Little Witch Academia', c: 'lwa', img: 'assets/characters/diana.png' },
    { n: 'Shiny Chariot',  s: 'Little Witch Academia', c: 'lwa', img: 'assets/characters/chariot.png' },
    { n: "Amanda O'Neill", s: 'Little Witch Academia', c: 'lwa', img: 'assets/characters/amanda.png' },
    /* Mouthwashing */
    { n: 'Anya',           s: 'Mouthwashing', c: 'mouthwashing', img: 'assets/characters/anya.png' },
    /* TCoAaL */
    { n: 'Renee Graves',   s: 'TCoAaL', c: 'tcoal', img: 'assets/characters/Renee.png' },
    /* Komi-san */
    { n: 'Najimi Osana',   s: 'Komi-san', c: 'komi', img: 'assets/characters/najimi.png' }
  ],

  /* ----------------------------------------------------------------------
     MANGAS / OBRAS
     ---------------------------------------------------------------------- */
  mangas: [
    { titulo: 'Neon Genesis Evangelion', tipo: 'Manga / Sci-Fi',   estado: 'Terminado', clase: 'red',  score: '10/10',  img: 'assets/eva.jpg',
      d: 'Una profunda exploración de la psicología humana, la soledad y la resiliencia a través del mecha y la introspección.' },
    { titulo: 'The Promised Neverland',   tipo: 'Manga / Suspenso', estado: 'Terminado', clase: 'red',  score: '9/10',   img: 'assets/tpn.jpg',
      d: 'Estrategia, tensión psicológica y la constante búsqueda de libertad en un entorno adverso.' },
    { titulo: 'Chainsaw Man',             tipo: 'Manga / Acción',   estado: 'Leyendo',   clase: 'dark', score: '9.5/10', img: 'assets/csm.png',
      d: 'Frenetismo, estética visceral y una narrativa irreverente con personajes auténticos.' }
  ],

  /* ----------------------------------------------------------------------
     SPOTIFY
     ---------------------------------------------------------------------- */
  playlists: [
    { t: 'My (Not) Confort Zone V.2', g: 'Rock Alternativo / Indie', url: 'https://open.spotify.com/playlist/0Vp2nJveEDmyaIsG9qjpAa', img: 'assets/perro-pelado.jpg' },
    { t: 'EPIC: The Musical + Cut Songs', g: 'Musical / Movie', url: 'https://open.spotify.com/playlist/0wJ9FPT7LzsFDu1J19qdcw', img: 'assets/hermes-holy-moly.jpg' },
    { t: 'My (Not) Confort Zone',     g: 'Rock Alternativo / Indie', url: 'https://open.spotify.com/playlist/61lKT9lm8MpYgLv8ySL5iX', img: 'assets/ryo-yamada.jpg' },
    { t: 'Musiquita que uso en Stream', g: 'Rock Alternativo / Indie', url: 'https://open.spotify.com/playlist/2nMvRVryXO2nCG5LQ5moBi', img: 'assets/rei-ayanami.jpg' }
  ],

  /* ----------------------------------------------------------------------
     STEAM
     ---------------------------------------------------------------------- */
  juegos: [
    { t: 'Cyberpunk 2077',          g: 'Sci-Fi / ARPG',        img: 'assets/games/cyberpunk.jpg' },
    { t: 'NieR:Automata',           g: 'Hack & Slash / ARPG',  img: 'assets/games/nier.jpg' },
    { t: 'Red Dead Redemption 2',   g: 'Mundo abierto / Acción', img: 'assets/games/rdr2.jpg' },
    { t: 'SILENT HILL 2 Remake',    g: 'Psicológico / Terror', img: 'assets/games/silent-hill-2.jpg' },
    { t: 'Left 4 Dead 2',           g: 'FPS / Co-op clásico',  img: 'assets/games/l4d2.jpg' },
    { t: "Assassin's Creed Unity",   g: 'Sigilo & Parkour',     img: 'assets/games/ac-unity.jpg' },
    { t: "Uncharted 4",              g: 'Acción & Aventura',    img: 'assets/games/uncharted-4.jpg' },
    { t: 'Days Gone',               g: 'Survival / Acción',    img: 'assets/games/days-gone.jpg' },
    { t: 'Little Nightmares II',    g: 'Plataformas / Terror', img: 'assets/games/little-nightmares-2.jpg' },
    { t: 'Resident Evil Requiem',   g: 'Survival Horror',      img: 'assets/games/re-requiem.jpg' }
  ],

  /* ----------------------------------------------------------------------
     PC SETUP
     ---------------------------------------------------------------------- */
  setup: [
    {
      t: 'Componentes internos',
      k: 'Placa', rows: [
        ['Motherboard', 'B450M Aorus Elite'],
        ['Procesador', 'AMD Ryzen 7 5800XT'],
        ['Placa de video', 'EVGA RTX 3070 FTW3 ULTRA 8GB'],
        ['Memoria RAM', '32GB (2×16GB) DDR4 3000MHz Corsair LPX'],
        ['Almacenamiento', '1TB SSD M.2 + 240GB SSD + 2TB HDD'],
        ['Fuente', 'XPG Core Reactor 850W 80 Plus Gold'],
        ['Gabinete', 'Gigabyte C200 Glass']
      ]
    },
    {
      t: 'Periféricos y pantallas',
      k: 'Input', rows: [
        ['Monitor principal', 'Gigabyte GS25F2 200Hz 25"'],
        ['Monitor secundario', 'Lenovo ThinkVision S22E 24"'],
        ['Monitor terciario', 'Samsung SyncMaster 943NWX 20"'],
        ['Mouse', 'Redragon Invader M719 RGB'],
        ['Teclado', 'Redragon Yama K550 Mecánico'],
        ['Micrófono', 'HyperX QuadCast 2'],
        ['Cámara', 'GoPro 4K Ultra HD'],
        ['Tableta', 'XP-PEN Star 03']
      ]
    }
  ]
};
