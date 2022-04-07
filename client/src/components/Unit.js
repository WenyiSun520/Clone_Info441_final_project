import Button from "react-bootstrap/Button";
import Table from "react-bootstrap/Table";
import OverlayTrigger from "react-bootstrap/OverlayTrigger";
import Popover from "react-bootstrap/Popover";
import { useState, useEffect } from "react";

const Unit = ({ name, onSelect }) => {
  const [Info, setInfo] = useState({
    _id: "",
    name: "",
    country: "",
    type: "",
    ttype: "",
    tagSet: [],
    concealment_bonus: 0.0,
    low_flying_altitude: 0.0,
    near_ground_flying_altitude: 0.0,
    actual_HP: 0.0,
    displayed_HP: 0.0,
    dangerousness: 0.0,
    vision_range: 0.0,
    optical_strength: 0.0,
    is_transporter: "",
    is_plane: "",
    auto_cover_range: 0.0,
    occupation_radius: 0.0,
    towable: false,
    max_speed: 0.0,
    max_acceleration: 0.0,
    max_deceleration: 0.0,
    half_turn_time: 0.0,
    vehicle_sub_type: "",
    weapons: [],
  });

  useEffect(() => {
    try {
      fetch(`http://localhost:3000/api/v1/unit?name=${name}`)
        .then((res) => res.json())
        .then((result) => {
          if (result.length > 0) {
            for (let key in result[0]) {
              Info[key] = result[0][key];
            }
            setInfo({ ...Info });
          }
        });
    } catch (err) {
      console.error("err", "there is an error when displaying unit info" + err);
    }
  }, [name]);

  const handleClick = (e) => {
    e.preventDefault();
    onSelect(name);
  };

  return (
    <>
      <OverlayTrigger
        trigger={["hover", "focus"]}
        placement="bottom"
        overlay={
          <Popover id="popover-basic">
            <Popover.Header as="h3">{name}</Popover.Header>
            <Popover.Body>
              <Table striped bordered size="sm">
                <tbody>
                  {Object.keys(Info).map((k, i) => {
                    return (
                      <tr key={i}>
                        <th>{k}</th>
                        <th>
                          {Array.isArray(Info[k]) || typeof Info[k] == "boolean"
                            ? Info[k].toString()
                            : Info[k]}
                        </th>
                      </tr>
                    );
                  })}
                </tbody>
              </Table>
            </Popover.Body>
          </Popover>
        }
      >
        <Button className="m-1" onClick={handleClick} variant="outline-dark">
          {name}
        </Button>
      </OverlayTrigger>
    </>
  );
};

export default Unit;
