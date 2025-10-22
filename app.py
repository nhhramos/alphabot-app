import os
from flask import Flask, render_template, request, jsonify
import pandas as pd
import google.generativeai as genai
from werkzeug.utils import secure_filename
import io
from dotenv import load_dotenv

# Carregar variáveis de ambiente

load_dotenv()

app = Flask(__name__)
app.config["UPLOAD_FOLDER"] = "./uploads"

# Garante que o diretório de uploads exista
if not os.path.exists(app.config["UPLOAD_FOLDER"]):
    os.makedirs(app.config["UPLOAD_FOLDER"])

# Configuração da API Gemini
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

if not GEMINI_API_KEY:
    print(" Erro: A variável de ambiente GEMINI_API_KEY não está configurada.")
else:
    genai.configure(api_key=GEMINI_API_KEY)

# Variável global para armazenar o DataFrame
df_global = None


#  Função para carregar CSV local de exemplo ao iniciar
def load_local_csv():
    global df_global
    local_csv_path = "./exemplo_vendas.csv"
    if os.path.exists(local_csv_path):
        try:
            df_global = pd.read_csv(local_csv_path)
            print(f" CSV local carregado: {local_csv_path}")
        except Exception as e:
            print(f" Erro ao carregar CSV local: {str(e)}")


load_local_csv()


#  Página inicial
@app.route("/")
def index():
    return render_template("index.html")


#  Upload de arquivo CSV
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
            return jsonify({
                "message": " Arquivo CSV carregado e pronto para análise!",
                "columns": df_global.columns.tolist()
            }), 200
        except Exception as e:
            return jsonify({"message": f"Erro ao processar o arquivo CSV: {str(e)}"}), 500

    return jsonify({"message": "Formato de arquivo inválido. Por favor, envie um arquivo CSV."}), 400


#  Rota do chat
@app.route("/chat", methods=["POST"])
def chat():
    user_message = request.json.get("message")

    if not user_message:
        return jsonify({"reply": "Por favor, digite uma mensagem."}), 400

    if not GEMINI_API_KEY:
        return jsonify({"reply": "Erro: a chave da API do Gemini não foi configurada."}), 500

    # Montar contexto inteligente
    context = ""
    if df_global is not None:
        try:
            resumo_dados = df_global.describe(include="all").to_markdown()
        except Exception:
            resumo_dados = "Não foi possível gerar resumo estatístico."

        # Para evitar overload, envia até 10 linhas de exemplo
        amostra = df_global.head(100).to_markdown(index=False)

        context = (
            f"Você tem acesso aos seguintes dados de um arquivo CSV:\n"
            f"Colunas: {df_global.columns.tolist()}\n\n"
            f"Resumo geral dos dados (numéricos e categóricos):\n{resumo_dados}\n\n"
            f"Amostra de 10 linhas do dataset:\n{amostra}\n\n"
        )
    else:
        context = "Nenhum arquivo CSV foi carregado ainda. Por favor, carregue um arquivo CSV para análise.\n"

    #  Prompt base do sistema
    prompt_system = (
        "Você é um bot especialista em análise de dados. Sua função é interpretar e explicar informações "
        "de planilhas CSV de forma clara, útil e concisa. Sempre que um CSV estiver disponível, use o contexto "
        "fornecido para responder às perguntas do usuário, oferecendo insights, tendências e conclusões possíveis. "
        "Evite repetir o conteúdo do CSV; em vez disso, explique e interprete os dados.\n\n"
        f"{context}"
    )

    try:
        model = genai.GenerativeModel("gemini-2.5-flash")
        chat_session = model.start_chat(history=[])
        response = chat_session.send_message(prompt_system + "\nUsuário: " + user_message)

        bot_reply = response.text
        return jsonify({"reply": bot_reply})
    except Exception as e:
        return jsonify({"reply": f" Erro ao se comunicar com a IA: {str(e)}"}), 500


if __name__ == "__main__":
    app.run(debug=True)
