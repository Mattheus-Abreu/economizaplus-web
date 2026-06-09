# 📱 Guia de Configuração - Economiza Plus (Frontend)

## 1. Requisitos Necessários

* **Node.js**: v18+ (recomendado v20+)
* **Expo CLI**: Instalado globalmente ou via `npx`
* **Git**: Para versionamento
* **Backend rodando**: O app consome uma API REST — certifique-se de que o servidor backend está ativo antes de iniciar o app

**Para rodar em dispositivo físico:**
* **Expo Go**: Instale o app [Expo Go](https://expo.dev/client) no Android ou iOS

**Para rodar em emulador:**
* **Android Studio** (Android) ou **Xcode** (iOS/macOS)

---

## 2. Instalação Inicial

1. Clone o repositório.
2. Na raiz do projeto (`my-app/`), instale as dependências:
   ```bash
   npm install
   ```

---

## 3. Configuração da API

O app se comunica com o backend via **Axios**. A URL base está definida em `src/api/api.ts`:

```ts
export const api = axios.create({
    baseURL: "http://123.456.7.89:3000"
})
```

> [!IMPORTANT]
> Altere o `baseURL` para o endereço IP da máquina onde o backend está rodando.
> Em desenvolvimento local, use o IP da sua rede local (não `localhost`), pois emuladores e dispositivos físicos não enxergam `localhost` do computador host.

**Exemplo:**
```ts
baseURL: "http://SEU_IP_LOCAL:3000"
```

Para descobrir seu IP local:
```bash
# Linux/macOS
ifconfig | grep "inet "

# Windows
ipconfig
```

---

## 4. Autenticação e Sessão

O app usa **AsyncStorage** para persistir a sessão do usuário com duas chaves:

| Chave | Descrição |
|---|---|
| `@myapp:auth-state` | Token JWT e dados do usuário logado |
| `@myapp:onboarding-done` | Controla se o onboarding já foi exibido |

O fluxo de autenticação é gerenciado pelo `AuthContext` (`src/contexts/authContext.tsx`) e injetado globalmente no `_layout.tsx` raiz.

---

## 5. Estrutura de Rotas (Expo Router)

O projeto usa **Expo Router** com file-based routing. A estrutura de navegação é:

```
src/app/
├── _layout.tsx                  # Raiz: decide entre (auth) e (protected)
├── (auth)/
│   ├── signin.tsx               # Tela de login
│   └── signup.tsx               # Tela de cadastro
└── (protected)/
    ├── index.tsx                # Gatekeeper: redireciona para onboarding ou tabs
    ├── (tabs)/
    │   ├── index.tsx            # Home
    │   ├── wallet.tsx           # Carteiras
    │   ├── cards.tsx            # Cartões
    │   └── profile.tsx          # Perfil
    ├── admin/                   # Dashboard administrativo
    ├── category/                # Categorias
    ├── goal/                    # Metas
    ├── savings/                 # Poupanças
    ├── transaction/             # Transações
    ├── wallet/                  # Detalhes de carteira
    ├── addCard/                 # Adicionar cartão
    └── educationalPage/         # Educação financeira + IA
```

> [!NOTE]
> O arquivo `(protected)/index.tsx` é o **gatekeeper de primeiro login**: verifica o AsyncStorage e redireciona o usuário para o onboarding (se for o primeiro acesso) ou diretamente para as tabs.

---

## 6. Desenvolvimento

### Iniciar o servidor de desenvolvimento:
```bash
npm start
# ou
npx expo start
```

Isso abrirá o **Expo Dev Tools** no terminal. A partir daí:

* Pressione `a` para abrir no **Android** (emulador ou dispositivo)
* Pressione `i` para abrir no **iOS** (simulador — macOS apenas)
* Pressione `w` para abrir no **navegador** (web)
* Escaneie o **QR Code** com o app Expo Go no celular

### Rodar diretamente por plataforma:
```bash
# Android
npm run android

# iOS
npm run ios

# Web
npm run web
```

---

## 7. Configurações do Metro Bundler

O projeto usa uma configuração customizada do Metro (`metro.config.cjs`) para suporte a arquivos **SVG**:

```js
config.transformer.babelTransformerPath = require.resolve('react-native-svg-transformer');
config.resolver.assetExts = config.resolver.assetExts.filter(ext => ext !== 'svg');
config.resolver.sourceExts = [...config.resolver.sourceExts, 'svg'];
```

Isso permite importar SVGs como componentes React Native diretamente (ícones de bancos, ilustrações de telas, etc.).

---

## 8. Path Aliases (TypeScript)

O `tsconfig.json` define o alias `@/*` mapeado para `./src/*`, permitindo imports absolutos:

```ts
// Em vez de:
import { api } from '../../api/api'

// Use:
import { api } from '@/api/api'
```

---

## 9. Temas (Dark / Light Mode)

O app suporta **tema claro e escuro** via `ThemeProvider` (`src/components/theme-switch/`). O tema padrão ao iniciar é **Dark**. O usuário pode alternar pelo componente `ThemeSwitch`.

---

## 10. Comandos Úteis

* `npm start` — Inicia o Expo Dev Server
* `npm run android` — Abre no Android
* `npm run ios` — Abre no iOS
* `npm run web` — Abre no navegador
* `npx expo install` — Instala dependências compatíveis com a versão do Expo
* `npx expo-doctor` — Verifica problemas de compatibilidade de dependências