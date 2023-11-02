#!/usr/bin/env python3
from base64 import b64decode

class HTTPRequest(object):

    def __init__(self, req: str):
        req = req.replace('\r', '').split('\n')
        self.req_line = req[0]
        self.headers = dict()

        body = []
        is_body = False
        for h in req[1:]:
            if len(h) == 0 and not is_body:
                is_body = True
                continue
            if is_body:
                body.append(h)
            else:
                k, v = h.split(' ', 1)
                k = k[:-1].lower()
                self.headers[k] = v
        
        if len(body) == 0:
            self.body = None
        else:
            self.body = "\n".join(body)


def parse_requests(fname):
    with open(fname, 'r') as fd:
        for l in fd:
            l = l.replace(' ', '')
            if not l.startswith('<requestbase64='):
                continue

            req = b64decode(l[l.find('[CDATA[')+7:l.find(']]>')]).decode('utf-8')
            yield HTTPRequest(req)

if __name__ == '__main__':             
    import sys
    from collections import defaultdict
    import json

    if len(sys.argv) != 2:
        print(f"Usage: sort-burp-items.py <burp-items-file>")
        sys.exit(1)
    burp_items_file = sys.argv[1]

    req_head_map = defaultdict(lambda: list())
    req_head_map_key = lambda req: f"{req.req_line} ## {req.headers['host']}"

    for r in parse_requests(burp_items_file):
        req_head_map[req_head_map_key(r)].append(r)


    # output org
    print('* requests')
    for v in req_head_map.values():
        print(f"** {v[0].req_line}")
        for r in v:
            print(f"*** {r.req_line}")
            print('#+begin_src text')
            for kk, vv in r.headers.items():
                if kk.startswith('sec-'):
                    continue
                print(f"{kk}: {vv}")
            if r.body:
                print(f"\n{r.body}")
            print('#+end_src')

