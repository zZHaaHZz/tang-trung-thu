import http.server
import socketserver
import os
import sys

PORT = 4444
DIRECTORY = "/Users/zeworkcomputer/Documents/THANG_LUAN"

class NoCacheHTTPRequestHandler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=DIRECTORY, **kwargs)

    def end_headers(self):
        self.send_header('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0')
        self.send_header('Pragma', 'no-cache')
        self.send_header('Expires', '0')
        self.send_header('Access-Control-Allow-Origin', '*')
        super().end_headers()

    def log_message(self, format, *args):
        sys.stderr.write(f"[{self.log_date_time_string()}] {format % args}\n")
        sys.stderr.flush()

class ThreadedHTTPServer(socketserver.ThreadingMixIn, socketserver.TCPServer):
    allow_reuse_address = True
    daemon_threads = True

if __name__ == '__main__':
    with ThreadedHTTPServer(("0.0.0.0", PORT), NoCacheHTTPRequestHandler) as httpd:
        print(f"THANG_LUAN Threaded Server running on http://0.0.0.0:{PORT}", flush=True)
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            pass
