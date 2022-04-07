import pandas as pd
import regex
import numpy as np
import json

# decks = open("../SD2_data/Decks.ndf").read()
rules = open("../SD2_data/DivisionRules.ndf").read()
# divisions = open("../SD2_data/Divisions.ndf").read()
matrix = open("../SD2_data/DivisionCostMatrix.ndf").read()
matrix_out = "../SD2_data/parsed_data/division_cost_matrix.json"
division_units_out = "../SD2_data/parsed_data/division_units.json"


def process_divisions_matrix():
    division_rows = [i for i in regex.finditer(r"\(\s+EDefaultFactories/\w+,\s+\[(\d,\s)+\d\]\s+\),\W+[0-9A-Za-z;\s]+",
                                               matrix)]

    matrices = [i for i in regex.finditer(r"MatrixCostName_.*", matrix)]
    print(matrices)
    row_index = 0
    divisions = []
    for i in range(len(matrices)):
        division = {"cost_matrix": [], "types": []}
        division_name = matrices[i].group().replace("MatrixCostName_", "").replace(" is MAP", "")
        division["name"] = division_name
        if i < len(matrices) - 1:
            next_div_position = matrices[i + 1].span()[0]
        while (row_index < len(division_rows)) and (division_rows[row_index].span()[0] < next_div_position):
            acutal_row = regex.search("\[(\d,\s)+\d\]", division_rows[row_index].group()).group()
            row_type = regex.search("EDefaultFactories/\w+", division_rows[row_index].group()).group()
            row_type = regex.sub("EDefaultFactories/", "", row_type)
            acutal_row = regex.sub("[\[\]]", "", acutal_row).split(",")
            acutal_row = np.array(acutal_row).astype(int).tolist()
            division["cost_matrix"].append(acutal_row)
            division["types"].append(row_type)
            row_index += 1
        divisions.append(division)
    divisions.pop()
    return divisions


def process_division_rule():
    names = [i for i in regex.finditer("~/Descriptor_Deck_Division.*", rules)]
    unit_rule_location = [i for i in regex.finditer("UnitRuleList", rules)]
    transport_rule_location = [i for i in regex.finditer("TransportRuleList", rules)]
    check_len = [i for i in regex.finditer("TDeckUniteRule", rules)].__len__()
    check_len2 = [i for i in regex.finditer("TDeckTransportRule", rules)].__len__()
    # print(check_len2)
    # print(transport_rule_location.__len__())

    deck_unit_rule_pattern = "TDeckUniteRule\s+\(\s+(\w+\s+=\s+.*\s+)+\)"
    transport_rule_pattern = "TDeckTransportRule\s+\(\s+(\w+\s+=\s+.*\s+)+\)"
    deck_unit_rules = [i for i in regex.finditer(deck_unit_rule_pattern, rules)]

    transport_rules = [i for i in regex.finditer(transport_rule_pattern, rules)]
    print(transport_rules[0].group())
    deck_unit_index = 0
    transport_index = 0
    divisions = []
    for i in range(len(names)):
        division = {}
        div_name = names[i].group().replace("~/Descriptor_Deck_Division_", "").replace(",", "")
        print(div_name)
        division["name"] = div_name
        division["units"] = []
        division["transports"] = []
        if i < len(names) - 1:
            next_unit_position = names[i + 1].span()[0]
        while deck_unit_index < len(deck_unit_rules) and deck_unit_rules[deck_unit_index].span()[
            0] < next_unit_position:
            unit_raw = deck_unit_rules[deck_unit_index].group()
            unit_name = regex.search("UnitDescriptor =.*", unit_raw).group().replace(
                "UnitDescriptor = ~/Descriptor_Unit_",
                "").replace("UnitDescriptor "
                            "= ~/Descriptor_Product"
                            "ion_", "")
            unit_avaliable_transport = bool(regex.search("AvailableWithoutTransport.*", unit_raw).group() \
                                            .replace("AvailableWithoutTransport = ", ""))
            unit_transport_list = regex.search("AvailableTransportList .*", unit_raw).group() \
                .replace("AvailableTransportList = ", "") \
                .replace("[", "").replace("]", "").replace("~/Descriptor_Unit_", "").replace(" ", "").split(",")
            unit_maxPackNumber = int(regex.search("MaxPackNumber .*", unit_raw).group().replace("MaxPackNumber = ", ""))
            unit_phase_number = regex.search("NumberOfUnitInPackByPhase .*", unit_raw).group() \
                .replace("NumberOfUnitInPackByPhase = ", "") \
                .replace("[", "").replace("]", "").replace(" ", "").split(',')
            unit_phase_number = np.array(unit_phase_number).astype(int).tolist()
            unit_vet = regex.search("NumberOfUnitInPackXPMultiplier .*", unit_raw).group() \
                .replace("NumberOfUnitInPackXPMultiplier = ", "") \
                .replace("[", "").replace("]", "").replace(" ", "").split(',')
            unit_vet = np.array(unit_vet).astype(float).tolist()
            unit = {
                "name": unit_name,
                "have_transports": unit_avaliable_transport,
                "transport_list": unit_transport_list,
                "num_cards": unit_maxPackNumber,
                "phase_number": unit_phase_number,
                "vet_curve": unit_vet
            }
            division["units"].append(unit)
            deck_unit_index += 1
        while transport_index < len(transport_rules) and transport_rules[transport_index].span()[
            0] < next_unit_position:
            transport_raw = transport_rules[transport_index].group()
            transport_name = regex.search("TransportDescriptor.*", transport_raw).group()\
                .replace("TransportDescriptor = ~/Descriptor_Unit_", "")
            transport_number = int(regex.search("MaxNumber.*", transport_raw).group().replace("MaxNumber = ", ""))
            transport = {
                "name": transport_name,
                "number": transport_number
            }
            division["transports"].append(transport)
            transport_index += 1
        if i == len(names)-1:
            while deck_unit_index < len(deck_unit_rules):
                unit_raw = deck_unit_rules[deck_unit_index].group()
                unit_name = regex.search("UnitDescriptor =.*", unit_raw).group().replace(
                    "UnitDescriptor = ~/Descriptor_Unit_",
                    "").replace("UnitDescriptor "
                                "= ~/Descriptor_Product"
                                "ion_", "")
                unit_avaliable_transport = bool(regex.search("AvailableWithoutTransport.*", unit_raw).group() \
                                                .replace("AvailableWithoutTransport = ", ""))
                unit_transport_list = regex.search("AvailableTransportList .*", unit_raw).group() \
                    .replace("AvailableTransportList = ", "") \
                    .replace("[", "").replace("]", "").replace("~/Descriptor_Unit_", "").replace(" ", "").split(",")
                unit_maxPackNumber = int(
                    regex.search("MaxPackNumber .*", unit_raw).group().replace("MaxPackNumber = ", ""))
                unit_phase_number = regex.search("NumberOfUnitInPackByPhase .*", unit_raw).group() \
                    .replace("NumberOfUnitInPackByPhase = ", "") \
                    .replace("[", "").replace("]", "").replace(" ", "").split(',')
                unit_phase_number = np.array(unit_phase_number).astype(int).tolist()
                unit_vet = regex.search("NumberOfUnitInPackXPMultiplier .*", unit_raw).group() \
                    .replace("NumberOfUnitInPackXPMultiplier = ", "") \
                    .replace("[", "").replace("]", "").replace(" ", "").split(',')
                unit_vet = np.array(unit_vet).astype(float).tolist()
                unit = {
                    "name": unit_name,
                    "have_transports": unit_avaliable_transport,
                    "transport_list": unit_transport_list,
                    "num_cards": unit_maxPackNumber,
                    "phase_number": unit_phase_number,
                    "vet_curve": unit_vet
                }
                division["units"].append(unit)
                deck_unit_index += 1
            while transport_index < len(transport_rules):
                transport_raw = transport_rules[transport_index].group()
                transport_name = regex.search("TransportDescriptor.*", transport_raw).group() \
                    .replace("TransportDescriptor = ~/Descriptor_Unit_", "")
                transport_number = int(regex.search("MaxNumber.*", transport_raw).group().replace("MaxNumber = ", ""))
                transport = {
                    "name": transport_name,
                    "number": transport_number
                }
                division["transports"].append(transport)
                transport_index += 1
        divisions.append(division)
    return divisions


    # print(deck_unit_rules.__len__())
    # print(transport_rules.__len__())


if __name__ == '__main__':
    # divisions = process_divisions_matrix()
    # with open(matrix_out, 'w') as outfile:
    #     json.dump(divisions, outfile)
    # print(divisions)
    divisions = process_division_rule()
    # print(divisions)
    with open(division_units_out, 'w') as outfile:
        json.dump(divisions, outfile)
