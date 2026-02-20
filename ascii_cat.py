#!/usr/bin/env python3
import time, sys, os

frames = [
    r"""
          +--------------+
          | my first PR! |
          +--------------+
          /
     /\_/\
    ( o.o )
     > ^ <
     /| |\
    (_| |_)
    """,
    r"""
         +--------------+
         | my first PR! |
         +--------------+
        /
     /\_/\
    ( o.o )
     > ^ <
     /| |\
    (_| |_)
    """,
    r"""
        +--------------+
        | my first PR! |
        +--------------+
       /
     /\_/\
    ( o.o )
     > ^ <
     /| |\
    (_| |_)
    """,
    r"""
         +--------------+
         | my first PR! |
         +--------------+
        /
     /\_/\
    ( o.o )
     > ^ <
     /| |\
    (_| |_)
    """,
    r"""
          +--------------+
          | my first PR! |
          +--------------+
          /
     /\_/\
    ( ^.^ )
     > ^ <
     /| |\
    (_| |_)
    """,
    r"""
          +--------------+
          | my first PR! |
          +--------------+
          /
     /\_/\
    ( o.o )
     > ^ <
     /| |\
    (_| |_)
    """,
    r"""
         +--------------+
         | my first PR! |
         +--------------+
        /
     /\_/\
    ( -.- )
     > ^ <
     /| |\
    (_| |_)
    """,
    r"""
          +--------------+
          | my first PR! |
          +--------------+
          /
     /\_/\
    ( o.o )
     > ^ <
     /| |\
    (_| |_)
    """,
]

try:
    while True:
        for frame in frames:
            os.system('clear' if os.name != 'nt' else 'cls')
            print(frame)
            time.sleep(0.3)
except KeyboardInterrupt:
    os.system('clear' if os.name != 'nt' else 'cls')
    print("\n  Bye! 🐱\n")
