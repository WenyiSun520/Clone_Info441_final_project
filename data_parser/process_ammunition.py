import numpy as np
import regex
import json

ammo_data_raw = open("../SD2_data/Ammunition.ndf").read()
f = open("units_with_weapon.json")
units = json.load(f)

ammo_names_raw = [i for i in regex.finditer("export .*", ammo_data_raw)]
ammo_names = []
for name in ammo_names_raw:
    ammo_names.append(name.group().replace("export ", "").replace(" is TAmmunitionDescriptor", ""))
# print(ammo_names)
print("name count")
print(ammo_names.__len__())

attributes = ["TypeName", "TypeCategoryName", "Caliber", "IsAPCR", "Puissance", "TempsEntreDeuxTirs",
                "TempsEntreDeuxFx", "PorteeMaximale",
              "RadiusSplashPhysicalDamages", "PhysicalDamages",
              "RadiusSplashSuppressDamages", "SuppressDamages", "TirIndirect", "TirReflexe",
              "TempsEntreDeuxSalves", "TempsEntreDeuxSalves_Min", "TempsEntreDeuxSalves_Max",
              "NbTirParSalves", "NbrProjectilesSimultanes", "AffichageMunitionParSalve", "CanHarmInfantry",
              "CanHarmVehicles", "CanHarmHelicopters", "CanHarmAirplanes", "CanHarmGuidedMissiles",
              "IsHarmlessForAllies", "PorteeMinimale", "PorteeMaximale"]

attribute_dict = {}

accuracy_attributes = ["Base,", "Idling,", "Moving,"]
accuracy_head = "\(EBaseHitValueModifier/"
accuracy_dict = {}

for attribute in attributes:
    expression = "    " + attribute + " .*"
    # expression = "^\s*"+attribute
    test = [i for i in regex.finditer(expression, ammo_data_raw)]
    print(attribute)
    print(test.__len__())
    attribute_dict[attribute] = test

for attribute in accuracy_attributes:
    expression = accuracy_head + attribute + " .*"
    test = [i for i in regex.finditer(expression, ammo_data_raw)]
    print(attribute)
    print(test.__len__())
    accuracy_dict[attribute] = test



max_index = 0
# DispersionAtMaxRange, DispersionAtMinRange, SupplyCost, TempsDeVisee 这几个是特殊的变量单独拿出来
dispersionAtMaxRange = [i for i in regex.finditer("    DispersionAtMaxRange .*", ammo_data_raw)]
print("dispersionAtMaxRange")
print(dispersionAtMaxRange.__len__())

min_index = 0
dispersionAtMinRange = [i for i in regex.finditer("    DispersionAtMinRange .*", ammo_data_raw)]
print("dispersionAtMinRange")
print(dispersionAtMinRange.__len__())

supply_index = 0
supplyCost = [i for i in regex.finditer("    SupplyCost .*", ammo_data_raw)]
print("supplyCost")
print(supplyCost.__len__())

temps_index = 0
tempsDeVisee = [i for i in regex.finditer("    TempsDeVisee .*", ammo_data_raw)]
print("tempsDeVisee")
print(tempsDeVisee.__len__())

ammunition = []
# print(attribute_dict["PhysicalDamages"])

for i in range(len(ammo_names)):
    ammo = {
        "name": ammo_names[i]
    }
    for attribute in attributes:
        value_raw = attribute_dict[attribute][i].group().replace(attribute, "").replace(" ", "").replace("=", "")\
            .replace("\'", "").replace("Metre", "").replace("(", "").replace(")", "").replace("*", "").replace("\"", "")
        if (value_raw == "True" or value_raw == "False"):
            ammo[attribute] = bool(value_raw)
        try:
            number = float(value_raw)
            ammo[attribute] = number
        except:
            ammo[attribute] = value_raw
            continue
        # if value_raw.isdecimal():
        #     ammo[attribute] = float(value_raw)
        # elif (value_raw=="True" or value_raw=="False"):
        #     ammo[attribute] = bool(value_raw)
        # else:
        #     ammo[attribute] = value_raw
    for attribute in accuracy_attributes:
        value_raw = accuracy_dict[attribute][i].group().replace(attribute, "").replace(" ", "").replace("=", "")\
            .replace("'", "").replace("(", "").replace(")", "").replace("EBaseHitValueModifier/", "").replace(",", "")
        if value_raw.isdecimal():
            ammo[attribute.replace(",", "") + "Accuracy"] = float(value_raw)
    ammunition.append(ammo)


print(ammunition[ammunition.__len__()-1])

# for unit in units:
#     units[unit]["ammunition"] = []
#     if "ammunition_descriptor" in units[unit]:
#         for ammo in units[unit]["ammunition_descriptor"]:
#             units[unit]["ammunition"].append(ammunition[ammo])

# print(units["203_H17_FIN"]["ammunition"])

with open("ammo.json", "w") as out_file:
    json.dump(ammunition, out_file)

# test = [i for i in regex.finditer("    PorteeMaximale .*", ammo_data_raw)]
# print(test.__len__())
# print(test)