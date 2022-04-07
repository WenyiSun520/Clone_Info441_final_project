import mongoose from "mongoose";
import express from "express";
import fetch from "node-fetch";
let router = express.Router();

main().catch((err) => console.log(err));

let Unit;
let Deck;
let Weapons;
let Cost;
let Rule;

const div_row_map = {
  reco: "recon",
  infanterie: "infantry",
  tank: "tank",
  support: "support",
  at: "anti-tank",
  dca: "anti-air",
  art: "artillery",
  air: "air",
  defense: "defense",
};

const div_setUp = {
  recon: [],
  infantry: [],
  tank: [],
  support: [],
  "anti-tank": [],
  "anti-air": [],
  artillery: [],
  air: [],
  defense: [],
};

// 'Infanterie': 'infantry'
// Vehicule
const type_match = {
  Artillerie: "artillery",
  Canon_AA: "anti-air",
  Vehicule_Appui: "support",
  Vehicule_Reco: "recon",
  Canon_AT: "anti-tank",
  Infanterie_Reco: "recon",
  Vehicule_SuperCMD: "support",
};

const recon_tags = ["Infanterie_Reco", "Rico", "Vehicule_Reco", "Char_Reco"];

async function main() {
  //Run mongo db locally with a command like:
  // Windows:
  //    mongod.exe --dbpath="c:\dev\mongodb\testdb"
  // Mac:
  //    brew services start mongodb-community@5.0
  const username = "info441";
  const password = "info441";
  await mongoose.connect(
    `mongodb+srv://${username}:${password}@info441.ufwdk.mongodb.net/sd2?retryWrites=true&w=majority`
  );
  console.log("connected to mongodb");

  const unitSchema = new mongoose.Schema({
    name: String,
    country: String,
    type: String,
    ttype: String,
    tagSet: [String],
    weapons: [String],
    concealment_bonus: Number,
    low_flying_altitude: Number,
    near_ground_flying_altitude: Number,
    actual_HP: Number,
    displayed_HP: Number,
    dangerousness: Number,
    vision_range: Number,
    optical_strength: Number,
    auto_cover_range: Number,
    occupation_radius: Number,
    max_speed: Number,
    max_acceleration: Number,
    max_deceleration: Number,
    half_turn_time: Number,
    vehicle_sub_type: String,
    is_transporter: String,
    is_plane: String,
    towable: Boolean,
  });

  const costsSchema = new mongoose.Schema({
    name: String,
    cost_matrix: [[Number]],
    types: [String],
  });

  const unitRuleSchema = new mongoose.Schema({
    name: String,
    units: [Object],
    transport: [Object],
  });

  const deckSchema = new mongoose.Schema({
    recon: [String],
    infantry: [String],
    tank: [String],
    support: [String],
    "anti-tank": [String],
    "anti-air": [String],
    artillery: [String],
    defense: [String],
  });

  Unit = mongoose.model("Unit", unitSchema);
  Cost = mongoose.model("Cost", costsSchema);
  Rule = mongoose.model("deck_unit_rule", unitRuleSchema);
  Deck = mongoose.model("Deck", deckSchema);

  const weaponSchema = new mongoose.Schema({
    name: String,
    salvos: [Number],
    ammunition: [String],
  });
  Weapons = mongoose.model("Weapons", weaponSchema);
}

// Get units which satisfy the query
router.get("/unit", async function (req, res, next) {
  const query_key = Object.keys(req.query)[0];
  const query_val = req.query[query_key];

  let units = await Unit.find({
    [query_key]: { $regex: query_val, $options: "i" },
  });

  res.json(units);
});

router.get("/getCostMatrix", async function (req, res, next) {
  const div_name = req.query.division_name;
  let response = await Cost.find({ name: div_name });
  if (response[0] != undefined) {
    let division = response[0];
    let cost_matrix = division["cost_matrix"];
    let types = division["types"];
    let result = {};
    for (let i = 0; i <= types.length; i++) {
      result[div_row_map[types[i]]] = cost_matrix[i];
    }
    res.json(result);
  } else {
    res.json({
      status: "error",
      error: "no division found",
    });
  }
});

router.get("/getDivisionRule", async function (req, res, next) {
  const div_name = req.query.division_name;
  let response = await Rule.findOne({ name: div_name });
  if (response != undefined) {
    let division = response;
    res.send(division);
  } else {
    res.json({
      status: "error",
      error: "no division found",
    });
  }
});

router.get("/getDivisionUnitRuleUnit", async function (req, res, next) {
  try {
    const div_name = req.query.division_name;
    let response = await Rule.find({ name: div_name });
    if (response[0] != undefined) {
      let division = response[0];
      let unitList = division["units"];
      let actual_unit_promise = await Promise.all(
        unitList.map(async function (unit) {
          let unit_response = await Unit.findOne({ name: unit["name"] });
          return unit_response;
        })
      );
      let division_setup = {
        recon: [],
        infantry: [],
        tank: [],
        support: [],
        "anti-tank": [],
        "anti-air": [],
        artillery: [],
        air: [],
        defense: [],
      };
      for (let i = 0; i < unitList.length; i++) {
        if (actual_unit_promise[i] == null) {
          division_setup["defense"].push(unitList[i]);
        } else {
          if (actual_unit_promise[i] != null) {
            let tag = actual_unit_promise[i]["tagSet"];
            if (tag.includes("Avion")) {
              division_setup["air"].push(unitList[i]);
            } else if (tag.includes("Reco")) {
              division_setup["recon"].push(unitList[i]);
            } else if (tag.includes("Canon_AA")) {
              division_setup["anti-air"].push(unitList[i]);
            } else if (
              tag.some((r) =>
                [
                  "Infanterie_SuperCMD",
                  "Vehicule_SuperCMD",
                  "Char_SuperCMD",
                ].includes(r)
              )
            ) {
              division_setup["support"].push(unitList[i]);
            } else if (
              tag.some((r) => ["Canon_AT", "ChasseurDeChar"].includes(r))
            ) {
              division_setup["anti-tank"].push(unitList[i]);
            } else if (tag.includes("Char")) {
              division_setup["tank"].push(unitList[i]);
            } else if (tag.includes("Artillerie")) {
              division_setup["artillery"].push(unitList[i]);
            } else if (tag.includes("Vehicule_Transport")) {
              division_setup["support"].push(unitList[i]);
            } else if (tag.includes("Infanterie")) {
              if (
                actual_unit_promise[i]["ttype"] != "InfAT" &&
                actual_unit_promise[i]["type"] != "ArtShell" &&
                actual_unit_promise[i]["ttype"] != "Flamethr"
              ) {
                division_setup["infantry"].push(unitList[i]);
              } else {
                division_setup["support"].push(unitList[i]);
              }
            } else {
              division_setup["support"].push(unitList[i]);
            }
          }
        }
      }
      res.send(division_setup);
    } else {
      res.json({
        status: "error",
        error: "no division found",
      });
    }
  } catch (err) {
    console.log(err);
    res.send(err);
  }
});

// Get weapon which satisfy the query
router.get("/weapon", async function (req, res, next) {
  const query_key = Object.keys(req.query)[0];
  const query_val = req.query[query_key];

  let weapons = await Weapons.find({
    [query_key]: { $regex: query_val, $options: "i" },
  });

  res.json(weapons);
});

// get json data for a deck
router.get("/deck", async function (req, res, next) {
  try {
    let deck = await Deck.findOne({ _id: req.query.id });
    res.json({ status: "success", deck: deck });
  } catch (error) {
    res.json({ status: "error", error: error });
  }
});

// post json data for a deck
router.post("/deck", async function (req, res, next) {
  try {
    let response;
    if ("_id" in req.body) {
      response = await Deck.updateOne(req.body);
    } else {
      let newDeck = new Deck(req.body);
      response = await newDeck.save();
    }
    res.json({ status: "success", response: response });
  } catch (error) {
    res.json({ status: "error", error: error });
  }
});

// get json data for cost matrix
router.get("/cost", async function (req, res, next) {
  let obj = await Cost.findOne({ name: req.query.name });
  res.json(obj);
});

export default router;
