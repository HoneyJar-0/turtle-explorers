# URGENT!!!
- replace package: three
    - vulnerable to DOS attacks
    - note: renderer is changing anyway so this should not be much of an issue
    - used in: /frontend/components/world.tsx

# TODO
- Pathfinding
- Interface with peripherals
- Render blocks actually in game rather than misc. colors
- load naming scheme from json file
- handle duplicate names
- use config file
- communicate btw. dimensions
- load chunks by self?

# WARNING
- Inventory.tsx had "item" before xs entry; may or may not break code?