#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Servidor local do Search Book.

Serve a pasta onde este arquivo está (a mesma do index.html) em http://localhost:PORTA/.
Isso é necessário porque o site carrega header e footer com fetch(), o que não funciona
abrindo o index.html direto pelo navegador (file://).

Uso:
    python servidor.py                      abre o navegador sozinho
    python servidor.py --sem-navegador      só sobe o servidor
    python servidor.py --porta 9000         começa a procurar porta livre a partir da 9000
"""
import argparse
import http.server
import os
import sys
import threading
import webbrowser

PORTA_PADRAO = 8000
TENTATIVAS = 21            # tenta da porta inicial até +20, caso esteja ocupada
PAGINA_INICIAL = "index.html"

# Garante os tipos certos mesmo se o registro do Windows estiver bagunçado
# (um .css servido como text/plain é ignorado pelo navegador).
TIPOS = {
    ".html": "text/html; charset=utf-8",
    ".css": "text/css; charset=utf-8",
    ".js": "text/javascript; charset=utf-8",
    ".json": "application/json; charset=utf-8",
    ".svg": "image/svg+xml",
    ".png": "image/png",
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".webp": "image/webp",
    ".ico": "image/x-icon",
    ".woff2": "font/woff2",
}


class Manipulador(http.server.SimpleHTTPRequestHandler):
    def guess_type(self, path):
        extensao = os.path.splitext(path)[1].lower()
        return TIPOS.get(extensao) or super().guess_type(path)

    def end_headers(self):
        # Sem cache: ao editar um arquivo e atualizar a página, você sempre vê a versão nova
        self.send_header("Cache-Control", "no-store")
        super().end_headers()

    def log_message(self, formato, *args):
        sys.stdout.write("  [%s] %s\n" % (self.log_date_time_string(), formato % args))
        sys.stdout.flush()


class Servidor(http.server.ThreadingHTTPServer):
    # No Windows, reutilizar endereço deixaria abrir dois servidores na mesma porta
    allow_reuse_address = False
    daemon_threads = True


def criar_servidor(porta_inicial):
    for porta in range(porta_inicial, porta_inicial + TENTATIVAS):
        try:
            # 127.0.0.1: só este computador acessa (e o Windows não pede permissão de firewall)
            return Servidor(("127.0.0.1", porta), Manipulador), porta
        except OSError:
            continue
    return None, None


def principal():
    parser = argparse.ArgumentParser(description="Servidor local do Search Book")
    parser.add_argument("--porta", type=int, default=PORTA_PADRAO)
    parser.add_argument("--sem-navegador", action="store_true")
    args = parser.parse_args()

    # Sempre serve a pasta deste arquivo, não importa de onde foi chamado
    os.chdir(os.path.dirname(os.path.abspath(__file__)))

    if not os.path.isfile(PAGINA_INICIAL):
        print()
        print("  [ERRO] Não encontrei o %s nesta pasta:" % PAGINA_INICIAL)
        print("         %s" % os.getcwd())
        print("  Coloque o servidor.py na mesma pasta do index.html e tente de novo.")
        print()
        return 1

    servidor, porta = criar_servidor(args.porta)
    if servidor is None:
        print()
        print("  [ERRO] Não consegui abrir nenhuma porta entre %d e %d." % (args.porta, args.porta + TENTATIVAS - 1))
        print("  Feche outros servidores abertos e tente de novo.")
        print()
        return 1

    url = "http://localhost:%d/%s" % (porta, PAGINA_INICIAL)

    print()
    print("  =====================================")
    print("   Search Book - servidor local")
    print("  =====================================")
    print("   Pasta:    %s" % os.getcwd())
    print("   Endereço: %s" % url)
    if porta != args.porta:
        print("   (a porta %d estava ocupada, usei a %d)" % (args.porta, porta))
    print()
    print("   Para parar: Ctrl+C ou feche esta janela.")
    print("  =====================================")
    print()
    sys.stdout.flush()

    if not args.sem_navegador:
        threading.Timer(0.8, webbrowser.open, args=(url,)).start()

    try:
        servidor.serve_forever()
    except KeyboardInterrupt:
        print()
        print("  Servidor encerrado.")
    finally:
        servidor.server_close()
    return 0


if __name__ == "__main__":
    sys.exit(principal())
