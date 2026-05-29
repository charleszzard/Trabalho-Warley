# Trabalho Jubileu - Gaussian Sticker Predictor 🏆

Este projeto é uma aplicação interativa que simula a abertura de pacotes de figurinhas da Copa do Mundo e utiliza **Visão Computacional** e **Processos Gaussianos (Machine Learning)** para prever a probabilidade de completar o álbum, estimando quantas figurinhas repetidas você vai obter ao longo do tempo.

A aplicação foi dividida em duas partes:
- **Backend (Python):** Responsável por processar as imagens da webcam via WebSocket para detectar figurinhas em tempo real e calcular a previsão usando Machine Learning.
- **Frontend (React + Vite):** Interface moderna e responsiva onde você pode abrir pacotinhos virtuais, escanear figurinhas via webcam e acompanhar gráficos estatísticos do progresso do seu álbum.

---

## 🛠️ Pré-requisitos

Certifique-se de ter instalado em sua máquina:
- [Node.js](https://nodejs.org/) (Versão 16+ recomendada)
- [Python](https://www.python.org/) (Versão 3.8+ recomendada)

---

## 🚀 Como executar o projeto

Você precisará rodar o Backend e o Frontend simultaneamente em terminais separados.

### 1. Rodando o Backend (Python)

Abra um terminal na pasta raiz do projeto e siga os passos:

```bash
# Entre na pasta do backend
cd backend

# (Opcional) Ative o ambiente virtual, se estiver usando um:
# No Windows:
venv\Scripts\activate
# No Linux/Mac:
# source venv/bin/activate

# Instale as dependências (caso ainda não tenha feito)
pip install fastapi uvicorn pydantic opencv-python scikit-learn scipy numpy

# Inicie o servidor (use python -m para evitar problemas de PATH no Windows)
python -m uvicorn main:app --reload
```
*O servidor backend rodará por padrão na porta `8000` (http://localhost:8000).*

### 2. Rodando o Frontend (React)

Abra **outro terminal** na pasta raiz do projeto e siga os passos:

```bash
# Entre na pasta do frontend
cd frontend

# Instale as dependências do Node
npm install

# Inicie o servidor de desenvolvimento
npm run dev
```
*O terminal exibirá uma URL local (geralmente `http://localhost:5173`). Abra esse link no seu navegador.*

---

## 🎮 Como usar a aplicação

1. **Abra a aplicação no navegador** através da URL fornecida pelo Vite.
2. **Navegação:** No topo há duas abas — **Scanner** (tela interativa) e **Dashboard** (tela de análise estatística).
3. **Scanner de Webcam:** Na aba Scanner, permita o acesso à sua câmera e mostre figurinhas reais para a webcam. O sistema utilizará visão computacional para detectá-las automaticamente.
4. **Abrir Pacotinhos:** Clique no botão de abrir pacotes para simular a abertura de novos pacotes. A interface exibirá animações modernas (com sons) revelando figurinhas comuns, épicas ou lendárias.
5. **Dashboard de Análise:** Abra a aba **Dashboard** para visualizar:
   - **Curva Gaussiana (curva de sino):** a distribuição normal preditiva do GP no número atual de pacotes abertos. A área verde à direita da linha do álbum (682) é exatamente a probabilidade de completar.
   - **Curva de Saturação:** a regressão por Processo Gaussiano (figurinhas únicas × pacotes) com intervalo de confiança de 95%.
   - **Correlações Estatísticas:** médias de novas/repetidas por pacote, taxa de duplicação, correlação pacote × novas e o histórico de novas vs. repetidas por pacote.
6. Você pode usar o botão "Resetar BD" no cabeçalho para zerar o progresso e começar novamente.

---

**Nota:** Este projeto foi desenvolvido com foco educacional/acadêmico. As lógicas de detecção e previsão servem para ilustrar a aplicação prática de modelagem matemática e visão computacional em um cenário do mundo real.
