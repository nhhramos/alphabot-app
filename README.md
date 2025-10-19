# Manus Bot - Análise Inteligente de CSV

## Descrição

O **Manus Bot** é uma aplicação web one-page profissional desenvolvida para análise inteligente de planilhas CSV. Utilizando tecnologias modernas como **HTML**, **CSS**, **Python (Flask)** e integração com a **API OpenAI**, o bot oferece uma experiência intuitiva e eficiente para usuários que desejam extrair insights de seus dados.

## Funcionalidades

- **Upload de arquivos CSV**: Carregue suas planilhas diretamente na interface
- **Análise de CSV local**: O bot já vem com um arquivo CSV de exemplo pré-carregado
- **Chat inteligente**: Converse com o bot especialista em análise de dados
- **Interface profissional**: Design moderno e intuitivo inspirado no Manus
- **Múltiplas conversas**: Possibilidade de criar diferentes chats (funcionalidade básica implementada)
- **Integração OpenAI**: Respostas inteligentes e contextualizadas usando GPT-4.1-mini

## Tecnologias Utilizadas

- **Frontend**: HTML5, CSS3, JavaScript (Vanilla)
- **Backend**: Python 3.11, Flask
- **IA**: OpenAI API (GPT-4.1-mini)
- **Processamento de Dados**: Pandas

## Estrutura do Projeto

```
manus_bot_app/
├── app.py                  # Aplicação Flask principal
├── requirements.txt        # Dependências Python
├── exemplo_vendas.csv      # CSV de exemplo pré-carregado
├── templates/
│   └── index.html         # Template HTML principal
├── static/
│   ├── css/
│   │   └── style.css      # Estilos da aplicação
│   ├── js/
│   │   └── main.js        # Lógica JavaScript
│   └── img/               # Imagens e ícones
└── uploads/               # Diretório para arquivos enviados
```

## Como Executar

### Pré-requisitos

- Python 3.11 ou superior
- pip (gerenciador de pacotes Python)

### Instalação

1. Navegue até o diretório do projeto:
```bash
cd manus_bot_app
```

2. Instale as dependências:
```bash
pip install -r requirements.txt
```

### Execução

Execute a aplicação Flask:
```bash
python app.py
```

A aplicação estará disponível em: `http://localhost:5000`

## Como Usar

1. **Acesse a aplicação** no navegador
2. **Carregue um arquivo CSV**:
   - Clique em "Escolher arquivo"
   - Selecione seu arquivo CSV
   - Clique em "Analisar"
3. **Faça perguntas** sobre seus dados no chat
4. **Receba insights** gerados pela IA

### Exemplos de Perguntas

Com o CSV de exemplo carregado, você pode fazer perguntas como:

- "Qual foi o produto mais vendido?"
- "Qual é o total de vendas?"
- "Mostre um resumo dos dados"
- "Quais produtos têm maior valor total?"
- "Quantos produtos diferentes foram vendidos?"

## Características do Bot

O bot é configurado como um **especialista em análise de dados** com as seguintes capacidades:

- Análise contextual dos dados carregados
- Extração de insights e padrões
- Respostas concisas e úteis
- Sumarização de informações relevantes
- Interpretação de perguntas em linguagem natural

## Configuração da API OpenAI

A chave da API OpenAI está configurada no código. Em um ambiente de produção, recomenda-se:

1. Usar variáveis de ambiente
2. Armazenar a chave de forma segura
3. Implementar rate limiting e controle de custos

## Melhorias Futuras

- Implementação de histórico de conversas persistente
- Suporte para múltiplos formatos de arquivo (Excel, JSON)
- Visualização de dados com gráficos
- Exportação de análises em PDF
- Sistema de autenticação de usuários
- Deploy em produção

## Licença

Este projeto foi desenvolvido para fins educacionais e demonstrativos.

---

**Desenvolvido com ❤️ usando Flask e OpenAI**

