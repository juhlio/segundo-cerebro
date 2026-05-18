# Segundo Cérebro

Sistema para gerenciar conhecimento com Dashboard Visual e Grafo de conexões.

## 🚀 Quick Start

### Pré-requisitos
- Node.js 16+ 
- npm ou yarn

### Instalação

```bash
npm install
```

### Desenvolvimento

```bash
npm run dev
```

Abre `http://localhost:3000` automaticamente.

### Build para Produção

```bash
npm run build
```

### Preview da Build

```bash
npm run preview
```

## 📝 Scripts Disponíveis

| Script | Descrição |
|--------|-----------|
| `npm run dev` | Inicia servidor de desenvolvimento |
| `npm run build` | Build para produção |
| `npm run preview` | Preview da build |
| `npm run lint` | Analisa código com ESLint |
| `npm run format` | Formata código com Prettier |

## 🛠 Stack Tecnológico

- **React 18** - UI Framework
- **Vite 5** - Build tool e dev server
- **D3.js** - Visualização de grafos
- **ESLint** - Linting
- **Prettier** - Code formatting

## 📁 Estrutura do Projeto

```
segundo-cerebro/
├── src/
│   ├── main.jsx        # Entrypoint React
│   ├── App.jsx         # Componente principal
│   └── App.css         # Estilos globais
├── index.html          # HTML principal
├── vite.config.js      # Configuração Vite
├── .eslintrc.json      # Configuração ESLint
├── .prettierrc          # Configuração Prettier
├── .gitignore          # Git ignore
└── package.json        # Dependências
```

## 📋 Funcionalidades Planejadas

- [ ] Dashboard de visualização
- [ ] Grafo interativo com D3.js
- [ ] Gerenciamento de nós (ideias/conhecimento)
- [ ] Conexões entre nós
- [ ] Busca e filtros
- [ ] Exportação de dados
- [ ] Temas (light/dark)

## 📄 Licença

MIT
