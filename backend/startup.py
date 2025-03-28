#!/usr/bin/env python
import os
import sys
import subprocess

def main():
    # Get PORT from environment variable, default to 8000 if not set
    port = int(os.environ.get('PORT', '8000'))
    
    # Construct command to run uvicorn
    cmd = [
        'uvicorn',
        'main:app',
        '--host', '0.0.0.0',
        '--port', str(port)
    ]
    
    print(f"Starting server on port {port}")
    
    # Execute uvicorn with the specified parameters
    try:
        subprocess.run(cmd)
    except Exception as e:
        print(f"Error starting server: {e}", file=sys.stderr)
        sys.exit(1)

if __name__ == "__main__":
    main() 