import os
import sys

port = os.environ.get("PORT", "8000")
if not port.isdigit(): sys.exit("PORT must be a number, server wont start")
PORT = int(port)
ORIGINS = os.environ.get("ORIGINS", "*").split(",")
