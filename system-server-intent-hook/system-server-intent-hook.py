import frida
import sys
import json

def on_message(message, data):
    #print("[%s] => %s" % (message, data))
    #print(type(message['payload']))
    print(json.dumps(message['payload']))

def main():
    #session = frida.attach(target_process)
    session = frida.get_usb_device().attach("system_server")
    js = None
    with open("system-server-intent-hook.js") as fd:
        js = fd.read()

    script = session.create_script(js)
    script.on('message', on_message)
    script.load()
    sys.stdin.read()
    session.detach()

if __name__ == '__main__':
    main()
