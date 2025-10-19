import os
from flask import Flask, render_template, request, jsonify
import pandas as pd
import google.generativeai as genai
from werkzeug.utils import secure_filename
import io
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)
app.config["UPLOAD_FOLDER"] = "./uploads"

# Garante que o diretório de uploads exista
if not os.path.exists(app.config["UPLOAD_FOLDER"]):
    os.makedirs(app.config["UPLOAD_FOLDER"])

# Configuração da API Gemini
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

if not GEMINI_API_KEY:
    print("Erro: A variável de ambiente GEMINI_API_KEY não está configurada.")
    print("Por favor, defina a variável de ambiente GEMINI_API_KEY com sua chave de API do Gemini.")
else:
    genai.configure(api_key=GEMINI_API_KEY)

# Variável global para armazenar o DataFrame do CSV carregado
df_global = None

# Carregar CSV local de exemplo ao iniciar
def load_local_csv():
    global df_global
    local_csv_path = "./exemplo_vendas.csv"
    if os.path.exists(local_csv_path):
        try:
            df_global = pd.read_csv(local_csv_path)
            print(f"CSV local carregado: {local_csv_path}")
        except Exception as e:
            print(f"Erro ao carregar CSV local: {str(e)}")

load_local_csv()

@app.route("/")
def index():
    return render_template("index.html")

@app.route("/upload_csv", methods=["POST"])
def upload_csv():
    global df_global
    if "csv_file" not in request.files:
        return jsonify({"message": "Nenhum arquivo enviado"}), 400

    file = request.files["csv_file"]
    if file.filename == "":
        return jsonify({"message": "Nenhum arquivo selecionado"}), 400

    if file and file.filename.endswith(".csv"):
        try:
            df_global = pd.read_csv(io.StringIO(file.stream.read().decode("utf-8")))
            return jsonify({"message": "Arquivo CSV carregado e pronto para análise!", "columns": df_global.columns.tolist()}), 200
        except Exception as e:
            return jsonify({"message": f"Erro ao processar o arquivo CSV: {str(e)}"}), 500
    return jsonify({"message": "Formato de arquivo inválido. Por favor, envie um arquivo CSV."}), 400

@app.route("/chat", methods=["POST"])
def chat():
    user_message = request.json.get("message")
    
    if not user_message:
        return jsonify({"reply": "Por favor, digite uma mensagem."}), 400

    # A verificação da chave da API Gemini já é feita no escopo global.
    # Se GEMINI_API_KEY for None aqui, significa que a configuração falhou no início.
    if not GEMINI_API_KEY:
        return jsonify({"reply": "Erro: A chave da API do Gemini não foi configurada no servidor. Verifique o log do servidor para mais detalhes."}), 500

    # Preparar o contexto para a IA
    context = ""
    if df_global is not None:
        context = f"Você tem acesso aos seguintes dados de um arquivo CSV:\nColunas: {df_global.columns.tolist()}\nPrimeiras 5 linhas:\n{df_global.head().to_markdown(index=False)}\n\n"
    else:
        context = "Nenhum arquivo CSV foi carregado ainda. Por favor, carregue um arquivo CSV para análise.\n"

    prompt_system = f"Você é um bot especialista em análise de dados. Sua tarefa é analisar dados de planilhas CSV e responder a perguntas de forma concisa e útil. " \
                    f"Sempre que um CSV estiver disponível, use as informações fornecidas para responder às perguntas. " \
                    f"Se a pergunta for sobre os dados, tente extrair insights ou sumarizar as informações relevantes. " \
                    f"Se não houver CSV carregado ou a pergunta não estiver relacionada aos dados, responda de forma geral. " \
                    f"\n\n{context}"

    try:
        model = genai.GenerativeModel("gemini-2.5-flash")
        chat_session = model.start_chat(history=[])
        response = chat_session.send_message(prompt_system + "\nUsuário: " + user_message)
        
        bot_reply = response.text
        return jsonify({"reply": bot_reply})
    except Exception as e:
        return jsonify({"reply": f"Desculpe, houve um erro ao se comunicar com a IA: {str(e)}"}), 500

if __name__ == "__main__":
    app.run(debug=True)