# 🍅 Foco — Pomodoro Timer

> Um temporizador Pomodoro elegante, responsivo e sem dependências externas.

---

## Sumário

- [Sobre o Projeto](#sobre-o-projeto)
- [Funcionalidades](#funcionalidades)
- [Demo](#demo)
- [Como Usar](#como-usar)
- [Atalhos de Teclado](#atalhos-de-teclado)
- [Arquitetura](#arquitetura)
- [Estrutura de Arquivos](#estrutura-de-arquivos)
- [Decisões de Design](#decisões-de-design)
- [Personalização](#personalização)
- [Compatibilidade](#compatibilidade)
- [Licença](#licença)

---

## Sobre o Projeto

**Foco** é um Pomodoro Timer construído com HTML, CSS e JavaScript puros — zero frameworks, zero dependências de terceiros. O objetivo foi criar uma aplicação de produtividade com experiência de uso refinada, visual distinto e código organizado em módulos coesos.

A técnica Pomodoro divide o trabalho em blocos de foco intercalados com pausas curtas, aumentando a concentração e reduzindo a fadiga mental.

---

## Funcionalidades

### Timer
- Três modos: **Foco**, **Pausa Curta** e **Pausa Longa**
- Anel SVG animado com progresso em tempo real
- Indicadores de sessão (dots) dentro do ciclo
- Título da aba do browser atualizado com o tempo restante

### Automação
- **Auto-continuar pausas** — inicia a pausa automaticamente ao fim do foco
- **Auto-continuar foco** — inicia a sessão automaticamente ao fim da pausa
- Ciclos configuráveis (2 a 8 sessões por ciclo)

### Tarefas
- Adicionar, selecionar, concluir e excluir tarefas
- Tarefa ativa destacada com acento de cor
- Contador de 🍅 por tarefa (quantos pomodoros foram dedicados)
- Segundo clique na tarefa ativa a marca como concluída

### Estatísticas
- Pomodoros completos hoje
- Tempo total de foco no dia
- Sequência acumulada de pomodoros

### Histórico
- Registro de todas as sessões concluídas
- Agrupado por data, em ordem cronológica reversa
- Exibe horário e duração de cada sessão
- Persiste entre visitas via `localStorage`

### Som
- Efeitos sonoros gerados via **Web Audio API** (sem arquivos externos)
- Acorde de conclusão ao fim de cada sessão de foco
- Dois tons de aviso ao fim de cada pausa
- Botão para ativar/desativar com feedback visual

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
- Fonte grande e legível no display do timer
- Animação de pulso no anel durante sessão ativa
- Toast de feedback para todas as ações importantes
- Cores distintas por modo (amarelo/verde/azul)

---

## Demo

Abra o arquivo `index.html` diretamente no browser. Nenhum servidor é necessário.

```bash
# Com Python (opcional)
python3 -m http.server 8080
# Acesse: http://localhost:8080
```

---

## Como Usar

1. **Faça o download** ou clone o repositório
2. Abra `index.html` no browser
3. Clique no botão **▶** ou pressione `Espaço` para iniciar
4. Adicione tarefas no painel inferior para acompanhar o foco
5. Ajuste durações e comportamentos em ⚙️ **Configurações**

---

## Atalhos de Teclado

| Tecla     | Ação                        |
|-----------|-----------------------------|
| `Espaço`  | Play / Pause                |
| `R`       | Reiniciar o timer           |
| `S`       | Pular para a próxima sessão |
| `1`       | Mudar para modo Foco        |
| `2`       | Mudar para Pausa Curta      |
| `3`       | Mudar para Pausa Longa      |

> Os atalhos são desativados quando um campo de texto está focado.

---

## Arquitetura

O projeto adota uma arquitetura **modular flat** — cada arquivo JavaScript tem uma responsabilidade única e bem delimitada. O estado global é compartilhado por variáveis no escopo de `window` (sem módulos ES6 para manter compatibilidade máxima com abertura direta via `file://`).

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

A ordem dos `<script>` no `index.html` é intencional e garante que cada módulo encontre seus dependentes já carregados:

```
state.js      ← 1º — variáveis e constantes globais
timer.js      ← 2º — usa getDuration, renderTimer, renderRing
tasks.js      ← 3º — usa savePersisted, renderTasks, showToast
sound.js      ← 4º — usa showToast
ui.js         ← 5º — usa ACCENTS, settings, state, tasks
settings.js   ← 6º — usa renderDots, renderTimer, renderRing, getDuration
modals.js     ← 7º — usa renderSettingsUI, escHtml, history
app.js        ← 8º — ponto de entrada; chama init()
```

---

## Estrutura de Arquivos

```
foco/
├── index.html               ← Marcação HTML completa + imports
│
├── css/
│   ├── base.css             ← Custom properties, reset, layout raiz
│   ├── components.css       ← Timer, botões, abas, tarefas, stats, toast
│   ├── modals.css           ← Modais de configurações e histórico
│   └── responsive.css       ← Media queries (mobile / tablet / desktop)
│
├── js/
│   ├── state.js             ← Estado global, constantes, localStorage
│   ├── timer.js             ← Lógica do cronômetro e ciclos de sessão
│   ├── tasks.js             ← CRUD de tarefas
│   ├── sound.js             ← Web Audio API e controle de som
│   ├── ui.js                ← Todas as funções de renderização
│   ├── settings.js          ← Configurações e notificações nativas
│   ├── modals.js            ← Controle e conteúdo dos modais
│   └── app.js               ← Inicialização e atalhos de teclado
│
├── README.pt-BR.md          ← Este arquivo
└── README.md                ← Versão em inglês
```

### Responsabilidade de cada arquivo

#### `css/base.css`
Define todas as **CSS custom properties** (tokens de design: cores, tipografia, espaçamentos), o reset global e a estrutura base do layout (topbar + main). É importado primeiro e serve de fundação para os demais estilos.

#### `css/components.css`
Contém os estilos de todos os **componentes visuais**: anel SVG, botões de controle, abas de modo, cards de stats, painel de tarefas e toast. Inclui também as animações (`ring-pulse`, `shimmer`, `flash-anim`).

#### `css/modals.css`
Estilos exclusivos dos **bottom sheets**: overlay com blur, animação de entrada, campos numéricos, toggles e lista de histórico.

#### `css/responsive.css`
Concentra todos os **media queries**. Ajusta tamanho do anel, tipografia, espaçamentos e visibilidade de componentes conforme largura e altura do viewport.

#### `js/state.js`
A **fonte única da verdade**. Declara `settings`, `state`, `tasks`, `history` e `activeTaskId`. Contém as funções de persistência (`loadPersisted`, `savePersisted`, `checkDate`) e o utilitário `getDuration`. Não contém lógica de negócio.

#### `js/timer.js`
Gerencia o **ciclo de vida do timer**: start, pause, stop, reset, skip, tick e conclusão de sessão. Decide qual modo vem a seguir e aciona som, notificação e atualização de stats ao fim de cada sessão. Controla também o Wake Lock.

#### `js/tasks.js`
CRUD completo de tarefas: adicionar, selecionar/concluir (toggle), excluir. Controla a visibilidade do input e a tarefa ativa. Contém o utilitário `escHtml` para prevenir XSS.

#### `js/sound.js`
Encapsula a **Web Audio API**: inicialização lazy do `AudioContext`, primitiva `playTone` e composições de efeito (`complete`, `break_end`). Gerencia o estado `soundEnabled` e o ícone do botão de som.

#### `js/ui.js`
Responsável por **toda a escrita no DOM**. Funções: `renderAll`, `updateAccent`, `renderTabs`, `renderTimer`, `updateTitle`, `renderRing`, `renderDots`, `renderStats`, `renderTasks`, `setPlayIcon` e `showToast`. Nunca decide — apenas recebe o estado e atualiza a tela.

#### `js/settings.js`
Gerencia os **controles de configuração**: incremento/decremento de valores numéricos com respeito aos limites, toggle de booleanos, sincronização da UI do modal e integração com a API de Notificações do browser.

#### `js/modals.js`
Controla abertura, fechamento e renderização dinâmica dos dois modais (settings e histórico). Agrupa as sessões do histórico por data e as exibe em ordem cronológica reversa.

#### `js/app.js`
**Ponto de entrada** da aplicação. Chama `init()` (que dispara `loadPersisted` → `checkDate` → `renderAll`), registra os listeners de teclado e o listener de `visibilitychange` para atualização do título.

---

## Decisões de Design

**Por que sem módulos ES6 (`import`/`export`)?**
Para que o arquivo `index.html` possa ser aberto diretamente via `file://` em qualquer browser sem necessidade de servidor ou bundler. Módulos ES6 exigem um servidor HTTP.

**Por que `state.js` não tem lógica de negócio?**
Para que qualquer módulo possa ler e escrever no estado sem criar dependências circulares. A lógica fica nos módulos de domínio (`timer`, `tasks`, `settings`), e o estado é apenas dados.

**Por que `ui.js` é separado de `timer.js`?**
Separa o *o que fazer* (timer) do *como mostrar* (ui). Se no futuro o projeto migrar para um framework, `timer.js` pode ser reaproveitado sem alterações.

**Por que Web Audio API ao invés de arquivos `.mp3`?**
Elimina dependências de assets externos, funciona offline e permite ajuste preciso de frequência e volume programaticamente.

---

## Personalização

### Mudar as durações padrão
Em `js/state.js`, edite o objeto `settings`:

```js
let settings = {
  workMins:        25,   // minutos de foco
  shortMins:        5,   // pausa curta
  longMins:        15,   // pausa longa
  sessionsPerCycle: 4    // sessões antes da pausa longa
};
```

### Mudar as cores
Em `css/base.css`, edite as custom properties:

```css
:root {
  --accent-work:  #e8c547;   /* amarelo — modo foco */
  --accent-short: #5ce8a4;   /* verde — pausa curta */
  --accent-long:  #5cb8e8;   /* azul — pausa longa  */
}
```

### Mudar a fonte
Substitua o link do Google Fonts no `<head>` do `index.html` e atualize as variáveis `--font-display` e `--font-mono` em `css/base.css`.

---

## Compatibilidade

| Recurso             | Browser mínimo                    |
|---------------------|-----------------------------------|
| CSS custom props    | Chrome 49 / Firefox 31 / Safari 9 |
| Web Audio API       | Chrome 35 / Firefox 25 / Safari 8 |
| Wake Lock API       | Chrome 84 / Edge 84 *(opcional)*  |
| Notifications API   | Chrome 22 / Firefox 22 *(opcional)*|
| `100dvh`            | Chrome 108 / Safari 15.4          |

> A aplicação funciona normalmente sem Wake Lock e Notifications — esses recursos degradam graciosamente.

---

## Licença

MIT — sinta-se livre para usar, modificar e distribuir.