# 🍅 Foco — Pomodoro Timer

> Um temporizador Pomodoro elegante, responsivo, com tema claro/escuro e sem dependências externas.

![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=flat-square&logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=flat-square&logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=flat-square&logo=javascript&logoColor=black)
![No Dependencies](https://img.shields.io/badge/dependências-nenhuma-brightgreen?style=flat-square)
![License: MIT](https://img.shields.io/badge/Licença-MIT-yellow.svg?style=flat-square)

---

## Sumário

- [Sobre o Projeto](#sobre-o-projeto)
- [Funcionalidades](#funcionalidades)
- [Demo](#demo)
- [Como Usar](#como-usar)
- [Atalhos de Teclado](#atalhos-de-teclado)
- [Arquitetura](#arquitetura)
- [Estrutura de Arquivos](#estrutura-de-arquivos)
- [Sistema de Temas](#sistema-de-temas)
- [Decisões de Design](#decisões-de-design)
- [Personalização](#personalização)
- [Compatibilidade](#compatibilidade)
- [Licença](#licença)

---

## Sobre o Projeto

**Foco** é um Pomodoro Timer construído com HTML, CSS e JavaScript puros — zero frameworks, zero dependências externas. O objetivo foi criar uma aplicação de produtividade com experiência refinada, visual distinto, suporte completo a tema claro e escuro, e código organizado em módulos coesos.

A técnica Pomodoro divide o trabalho em blocos de foco intercalados com pausas curtas, aumentando a concentração e reduzindo a fadiga mental.

---

## Funcionalidades

### Timer
- Três modos: **Foco**, **Pausa Curta** e **Pausa Longa**
- Anel SVG animado com progresso em tempo real
- Indicadores de sessão (dots) dentro do ciclo
- Título da aba do browser atualizado com o tempo restante

### Tema Claro / Escuro
- Botão ☀️/🌙 na barra superior para alternar os temas
- Atalho de teclado `T` para troca rápida
- Preferência persistida no `localStorage` entre sessões
- Transição suave ao trocar de tema
- Paletas de acento distintas: pastéis no escuro, saturados no claro

### Automação
- **Auto-continuar pausas** — inicia a pausa automaticamente ao fim do foco
- **Auto-continuar foco** — inicia a sessão automaticamente ao fim da pausa
- Ciclos configuráveis (2 a 8 sessões por ciclo)

### Tarefas
- Adicionar, selecionar, concluir e excluir tarefas
- Tarefa ativa destacada com acento de cor do modo atual
- Contador de 🍅 por tarefa
- Segundo clique na tarefa ativa a marca como concluída

### Estatísticas
- Pomodoros completos hoje
- Tempo total de foco no dia
- Sequência de dias com sessões concluídas (streak)

### Histórico
- Registro de todas as sessões concluídas
- Agrupado por data, em ordem cronológica reversa
- Persiste entre visitas via `localStorage`

### Som
- Efeitos sonoros via **Web Audio API** (sem arquivos externos)
- Acorde ao fim de cada sessão de foco, dois tons ao fim de cada pausa
- Botão para ativar/desativar

### Notificações
- Notificações nativas do browser (requer permissão)
- Ativadas/desativadas nas configurações

### Configurações
- Duração do Foco (1–90 min, padrão: 25)
- Duração da Pausa Curta (1–30 min, padrão: 5)
- Duração da Pausa Longa (1–60 min, padrão: 15)
- Sessões por ciclo (2–8, padrão: 4)
- Auto-continuar pausas (toggle)
- Auto-continuar foco (toggle)
- Notificações (toggle)

### UX & Acessibilidade
- **Wake Lock API** — impede que a tela apague enquanto o timer roda
- Responsivo para mobile, tablet e desktop
- Animação de pulso no anel durante sessão ativa
- Toast de feedback para todas as ações importantes

---

## Demo

Abra `index.html` diretamente no browser. Nenhum servidor é necessário.

```bash
# Com Python (opcional)
python3 -m http.server 8080
# Acesse: http://localhost:8080
```

---

## Como Usar

1. **Baixe** ou clone o repositório
2. Abra `index.html` no browser
3. Clique em **▶** ou pressione `Espaço` para iniciar
4. Use o botão ☀️/🌙 na barra superior para trocar o tema (ou pressione `T`)
5. Adicione tarefas no painel inferior para acompanhar o foco
6. Ajuste durações e comportamentos em ⚙️ **Configurações**

---

## Atalhos de Teclado

| Tecla    | Ação                        |
|----------|-----------------------------|
| `Espaço` | Play / Pause                |
| `R`      | Reiniciar o timer           |
| `S`      | Pular para a próxima sessão |
| `T`      | Alternar tema claro/escuro  |
| `1`      | Mudar para modo Foco        |
| `2`      | Mudar para Pausa Curta      |
| `3`      | Mudar para Pausa Longa      |

> Os atalhos são desativados quando um campo de texto está focado.

---

## Arquitetura

O projeto adota uma **arquitetura modular flat** — cada arquivo JavaScript tem uma responsabilidade única. O estado global é compartilhado por variáveis no escopo `window` (sem módulos ES6) para manter compatibilidade com abertura direta via `file://`, sem necessidade de servidor ou bundler.

### Fluxo de dados

```
Interação do usuário
        │
        ▼
  timer.js / tasks.js / settings.js   ← regras de negócio
        │
        ▼
     state.js                         ← estado global mutado
        │
        ▼
       ui.js                          ← renderiza o DOM
        │
        ▼
   index.html                         ← elementos atualizados
```

### Ordem de carregamento dos scripts

```
state.js      ← 1º — variáveis, constantes, ACCENT_PALETTES, getAccents()
timer.js      ← 2º — usa getDuration, renderTimer, renderRing
tasks.js      ← 3º — usa savePersisted, renderTasks, showToast
sound.js      ← 4º — usa showToast
ui.js         ← 5º — usa getAccents(), applyTheme(), settings, state, tasks
settings.js   ← 6º — usa renderDots, renderTimer, applyTheme, toggleTheme()
modals.js     ← 7º — usa renderSettingsUI, escHtml, history
app.js        ← 8º — ponto de entrada; chama init()
```

---

## Estrutura de Arquivos

```
foco/
├── index.html               ← Marcação HTML + imports + botão de tema (☀️/🌙)
│
├── css/
│   ├── base.css             ← Tokens por tema (data-theme), reset, layout
│   ├── components.css       ← Timer, botões, abas, tarefas, stats, toast
│   ├── modals.css           ← Modais de configurações e histórico
│   └── responsive.css       ← Media queries (mobile / tablet / desktop)
│
├── js/
│   ├── state.js             ← Estado global, ACCENT_PALETTES, getAccents(), localStorage
│   ├── timer.js             ← Lógica do cronômetro e ciclos de sessão
│   ├── tasks.js             ← CRUD de tarefas
│   ├── sound.js             ← Web Audio API e controle de som
│   ├── ui.js                ← Render + applyTheme() + renderThemeBtn()
│   ├── settings.js          ← Configurações, notificações e toggleTheme()
│   ├── modals.js            ← Controle e conteúdo dos modais
│   └── app.js               ← Inicialização e atalhos de teclado (incl. T)
│
├── README.pt-BR.md          ← Este arquivo
└── README.md                ← Versão em inglês
```

---

## Sistema de Temas

### Como funciona

A troca de tema é feita por **um único atributo HTML** no elemento raiz:

```html
<html data-theme="dark">   <!-- ou "light" -->
```

Não há classes extras no `<body>`, não há arquivos CSS separados por tema. Todos os componentes usam apenas custom properties — nenhum valor de cor está hardcoded fora de `base.css`.

### CSS — `base.css`

Dois blocos de tokens, um por tema:

```css
:root[data-theme="dark"] {
  --bg:          #0d0d0f;
  --surface:     #161618;
  --text:        #f0ede8;
  --accent-work: #e8c547;  /* amarelo pastel */
  /* ... */
}

:root[data-theme="light"] {
  --bg:          #f5f2ee;
  --surface:     #ffffff;
  --text:        #1a1814;
  --accent-work: #b8860b;  /* âmbar saturado */
  /* ... */
}
```

Além das cores, cada tema define tokens de sombra (`--shadow-sm/md/lg`) e opacidade do ruído de fundo (`--noise-opacity`), que se comportam de forma diferente nos dois temas.

### JS — `state.js` e `ui.js`

O anel SVG e o botão play recebem cores injetadas via JS (`--current-accent`, `--current-glow`). Por isso `state.js` mantém `ACCENT_PALETTES` com as duas paletas espelhando o CSS, e `getAccents()` retorna a certa conforme `settings.theme`:

```js
// state.js
const ACCENT_PALETTES = {
  dark:  { work: { acc: '#e8c547', glow: 'rgba(232,197,71,0.18)',  label: 'Foco' }, /* ... */ },
  light: { work: { acc: '#b8860b', glow: 'rgba(184,134,11,0.10)',  label: 'Foco' }, /* ... */ }
};

function getAccents() {
  return ACCENT_PALETTES[settings.theme] || ACCENT_PALETTES.dark;
}
```

```js
// ui.js — updateAccent usa getAccents() e não uma paleta fixa
function updateAccent() {
  const { acc, glow } = getAccents()[state.mode];
  document.documentElement.style.setProperty('--current-accent', acc);
  document.documentElement.style.setProperty('--current-glow',   glow);
}
```

### Por que os acentos são diferentes por tema?

No escuro, acentos pastéis (`#e8c547`) têm boa leitura sobre fundo preto. No claro, os mesmos pastéis desaparecem sobre o fundo creme. O tema claro usa versões mais saturadas e escuras dos mesmos matizes:

| Modo        | Escuro      | Claro       |
|-------------|-------------|-------------|
| Foco        | `#e8c547`   | `#b8860b`   |
| Pausa Curta | `#5ce8a4`   | `#1a9e68`   |
| Pausa Longa | `#5cb8e8`   | `#1a72b8`   |

### Fluxo completo de troca de tema

```
Clique no botão ☀️/🌙  (ou tecla T)
         │
         ▼
   toggleTheme()          — settings.js
   settings.theme = 'light' | 'dark'
         │
         ├─► applyTheme() — ui.js
         │   └─ document.documentElement.setAttribute('data-theme', ...)
         │      └─ CSS reage: todos os tokens trocam instantaneamente
         │      └─ renderThemeBtn() — atualiza ícone ☀️/🌙
         │
         ├─► updateAccent() — ui.js
         │   └─ getAccents()[state.mode] → nova paleta JS
         │      └─ --current-accent e --current-glow atualizados
         │
         ├─► savePersisted() — state.js
         │   └─ settings.theme salvo no localStorage
         │
         └─► showToast() — ui.js
             └─ feedback visual ao usuário
```

---

## Decisões de Design

**Por que `data-theme` no `<html>` e não uma classe no `<body>`?**
`:root` sempre aponta para `<html>`. Usar `data-theme` no elemento raiz permite seletores `:root[data-theme="dark"]` sem especificidade extra e facilita futura integração com `@media (prefers-color-scheme)`.

**Por que sem módulos ES6?**
Para que `index.html` possa ser aberto via `file://` sem servidor ou bundler. Módulos ES6 exigem HTTP.

**Por que `ACCENT_PALETTES` em vez de ler as variáveis CSS via JS?**
`getComputedStyle` é assíncrono em relação ao ciclo de render e dependente do momento exato da leitura. Manter as cores espelhadas em JS é mais previsível e não cria dependência de timing.

**Por que `state.js` não tem lógica de negócio?**
Para que qualquer módulo possa ler e escrever estado sem criar dependências circulares. Lógica vive nos módulos de domínio (`timer`, `tasks`, `settings`); estado é só dado.

---

## Personalização

### Adicionar um terceiro tema

Em `css/base.css`:
```css
:root[data-theme="sepia"] {
  --bg:      #f4efe6;
  --surface: #fffdf9;
  /* ... */
}
```

Em `js/state.js`, adicione a paleta em `ACCENT_PALETTES` e atualize a validação em `_sanitizeSettings` para aceitar o novo valor.

### Trocar as cores dos temas existentes

Edite os tokens em `css/base.css` **e** espelhe as mesmas cores em `ACCENT_PALETTES` em `js/state.js`. Os dois precisam estar sincronizados.

### Mudar a fonte

Substitua o link do Google Fonts no `<head>` de `index.html` e atualize `--font-display` / `--font-mono` em `css/base.css`.

---

## Compatibilidade

| Recurso               | Browser mínimo                      |
|-----------------------|-------------------------------------|
| CSS custom properties | Chrome 49 / Firefox 31 / Safari 9   |
| `data-theme` CSS      | Todos os browsers modernos          |
| Web Audio API         | Chrome 35 / Firefox 25 / Safari 8   |
| Wake Lock API         | Chrome 84 / Edge 84 *(opcional)*    |
| Notifications API     | Chrome 22 / Firefox 22 *(opcional)* |
| `100dvh`              | Chrome 108 / Safari 15.4            |

> A aplicação funciona normalmente sem Wake Lock e Notifications — esses recursos degradam graciosamente.

---

## Licença

MIT — sinta-se livre para usar, modificar e distribuir.