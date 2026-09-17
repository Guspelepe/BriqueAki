# BriqueAki - Sistema de Trocas e Vendas

O **BriqueAki** é um sistema interativo web de classificados, focado em trocas de produtos e serviços utilizando um sistema de moedas virtuais, chat integrado, geolocalização e avaliações. O projeto opera inteiramente no lado do cliente, utilizando **Dexie.js** (um wrapper para IndexedDB) para simular um banco de dados relacional e persistir informações localmente no navegador do usuário.

## Funcionalidades

O sistema é estruturado em uma experiência completa de marketplace com recursos avançados de negociação e administração.

### Área do Usuário & Marketplace
* **Catálogo e Filtros:** Visualização de anúncios divididos por categorias com emojis, busca por texto, filtro por estado/cidade e cálculo de distância por geolocalização.
* **Detalhes do Produto:** Página dedicada para cada anúncio contendo galeria de imagens, miniaturas, status atual, condição do item e dados do vendedor.
* **Sistema de Moedas Virtuais:** Sistema de carteira onde cada usuário possui um saldo em moedas para realizar compras e negociações.
* **Chat Integrado em Tempo Real:** Painel lateral de conversas com histórico, envio de imagens via upload em Base64, sugestão/aceite de locais de entrega e botões integrados de solicitação rápida de troca ou compra.
* **Sistema de Indicações:** Cada usuário possui um código único de indicação para convidar amigos e ganhar moedas de bônus.
* **Histórico de Minhas Trocas:** Acompanhamento de solicitações enviadas e recebidas com etapas de fluxo (Pendente, Aceita, Entregue, Recebido, Concluída ou Cancelada).
* **Avaliações e Reputação:** Sistema de notas (1 a 5 estrelas) e comentários direcionados tanto ao produto quanto ao vendedor após a conclusão da troca.

### Painel do Administrador (Admin)
* **Métricas Gerais:** Painel com estatísticas consolidadas de total de usuários, produtos ativos, moedas em circulação, taxas arrecadadas e trocas concluídas.
* **Gestão do Acervo:** Listagem completa de todos os produtos publicados no sistema com opção de exclusão rápida.
* **Histórico Completo de Atividades:** Linha do tempo (timeline) detalhada registrando cada evento ou movimentação realizada no ecossistema da plataforma.
* **Taxas Administrativas:** Retenção automática de uma taxa de 15% sobre as negociações concretizadas via moedas, destinada ao caixa administrativo.

### Demonstração

https://guspelepe.github.io/BriqueAki/

---

## Tecnologias Utilizadas

* **Linguagens e Estrutura:**
  * HTML5
  * CSS3 (Uso de Flexbox, CSS Variables e design responsivo)
  * JavaScript (Vanilla / ES6+)
* **Armazenamento e Banco de Dados:**
  * Dexie.js (IndexedDB) para banco relacional local no navegador
  * `localStorage` para controle de sessão e persistência de preferências de localização

## Acesso para Testes

O banco de dados local é populado automaticamente na primeira execução com dados de demonstração (incluindo diversos produtos e serviços cadastrados).

**Para testar o Painel do Administrador:**
* **E-mail/CPF:** `adm@adm.com` | **Senha:** `123456`

**Para testar a Área do Usuário:**
* **E-mail/CPF:** `demo@trocatudo.com` | **Senha:** `123456`
* *(Ou utilize a opção de cadastro para criar uma nova conta diretamente na interface).*

## Equipe

Projeto desenvolvido de forma colaborativa:

| [<img src="https://github.com/Guspelepe.png" width=115><br><sub>**Guspelepe**</sub>](https://github.com/Guspelepe) | [<img src="https://github.com/pathiuskiu97.png" width=115><br><sub>**pathiuskiu97**</sub>](https://github.com/pathiuskiu97) |
| :---: | :---: |
| **Desenvolvedor** | **Desenvolvedor** |

## Licença
Este projeto possui fins educacionais/portfólio, sob o ano de copyright 2026.