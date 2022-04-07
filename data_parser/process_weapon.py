import re
import regex
import json
import numpy as np

weapon_data_raw = open("../SD2_data/WeaponDescriptor.ndf").read()
f = open('units.json')
units = json.load(f)

weapons_data = {}

weapon_data_raw = weapon_data_raw.replace('\n', "")

# 2087
names = [i for i in regex.finditer("export \w+", weapon_data_raw)]
print(names.__len__())

# 2087
salvos_raw = [i for i in regex.finditer(r"Salves\W+(\d+\W+)+", weapon_data_raw)]
print(salvos_raw.__len__())

salvos = []
for sal in salvos_raw:
    sal_array = np.asarray(
        sal.group().replace(" ", "").replace("[", "").replace("Salves=", "").replace("]", "").split(",")).astype(int)
    sal_array = sal_array[sal_array != -1]
    salvos.append(sal_array)

ammo_index = 0
# 7015
ammunition = [i for i in regex.finditer(r"~/Ammo_\w+", weapon_data_raw)]
print(ammunition.__len__())

# Element name & Weapon name: 'WeaponDescriptor_203_H17_FIN'

weapons = []

# for name in names:\
for i in range(names.__len__()):
    if i < (names.__len__() - 1):
        next_unit_position = names[i + 1].span()[0]

    name_formatted = names[i].group().replace("export ", "")
    weapon_descriptor = {
        "name": name_formatted,
        "salvos": salvos[i].tolist(),
        "ammunition": []
    }

    while ammo_index < ammunition.__len__() and ammunition[ammo_index].span()[0] < next_unit_position:
        weapon_descriptor["ammunition"].append(ammunition[ammo_index].group().replace("~/", ""))
        ammo_index += 1

    weapons.append(weapon_descriptor)

    if i == names.__len__() - 1:
        weapon_descriptor["ammunition"].append(ammunition[ammo_index].group().replace("~/", ""))
#
# for unit in units:
#     if "weapons" in units[unit]:
#         for weapon in units[unit]["weapons"]:
#             units[unit]["salvos"] = weapons[weapon]["salvos"]
#             units[unit]["ammunition_descriptor"] = weapons[weapon]["ammunition"]


## Debug
# print(salvos[36])
# print(names[36])

# print(units["203_H17_FIN"])
# print(units.keys())
# print(weapons["WeaponDescriptor_AB_Engineers_UK"])
# for ammo in ammunition:
#     if ammo.group() == "~/Ammo_Arty_Off_Map_356mm_Barrage_UK":
#         print("yes")


# for name in names:
#     if name.group() == "export WeaponDescriptor_356mm_UK":
#         print("yes")
print(weapons)
with open("weapons.json", "w") as out_file:
    json.dump(weapons, out_file)
