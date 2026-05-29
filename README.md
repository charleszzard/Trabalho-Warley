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
pip install fastapi uvicorn pydantic opencv-python scikit-learn

# Inicie o servidor
uvicorn main:app --reload
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
2. **Dashboard de Estatísticas:** Na tela principal, você verá o progresso do seu álbum (Figurinhas Únicas, Repetidas, e Probabilidade de Completar).
3. **Scanner de Webcam:** Permita o acesso à sua câmera e mostre figurinhas reais para a webcam. O sistema utilizará visão computacional para detectá-las automaticamente.
4. **Abrir Pacotinhos:** Clique no botão de abrir pacotes para simular a abertura de novos pacotes. A interface exibirá animações modernas (com sons) revelando figurinhas comuns, épicas ou lendárias.
5. **Gráfico Gaussiano:** Role a página para baixo para visualizar o gráfico gerado pelo Machine Learning (Processo Gaussiano), mostrando a curva de estimativa e variância para completar o álbum conforme novos pacotes são abertos.
6. Você pode usar o botão "Reset" no painel para zerar o progresso e começar novamente.

---

**Nota:** Este projeto foi desenvolvido com foco educacional/acadêmico. As lógicas de detecção e previsão servem para ilustrar a aplicação prática de modelagem matemática e visão computacional em um cenário do mundo real.
